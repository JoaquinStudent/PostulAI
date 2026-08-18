import { create } from "zustand";
import type {
  Source,
  SourceKind,
  Opportunity,
  SortBy,
  FailureCause,
} from "@/lib/types";
import { makeFailure } from "@/lib/extract/failures";
import { buildPR03Prompt, parsePR03Response } from "@/lib/prompts/pr-03";
import { buildPR04Prompt, parsePR04Response } from "@/lib/prompts/pr-04";
import { verifyCitations } from "@/lib/ai/verify";
import { truncateForContext } from "@/lib/extract/normalize";
import { complete } from "@/lib/ai/client";
import { useSession } from "./session";

const MAX_CONCURRENT = 3;

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

interface BatchState {
  sources: Source[];
  opportunities: Opportunity[];
  sortBy: SortBy;
  processing: boolean;

  addUrls: (urls: string[]) => void;
  addPasted: (text: string) => void;
  addPdf: (fileName: string, text: string, wordCount: number) => void;
  pasteManual: (sourceId: string, text: string) => void;
  discard: (opportunityId: string) => void;
  undiscard: (opportunityId: string) => void;
  removeSource: (sourceId: string) => void;
  setSortBy: (s: SortBy) => void;
  processAll: () => Promise<void>;
}

export const useBatch = create<BatchState>((set, get) => ({
  sources: [],
  opportunities: [],
  sortBy: "fit",
  processing: false,

  addUrls: (urls) => {
    const existing = new Set(get().sources.map((s) => s.origin));
    const newSources: Source[] = urls
      .filter((u) => !existing.has(u))
      .map((url) => ({
        id: uid(),
        kind: "url" as SourceKind,
        origin: url,
        status: "pending" as const,
        text: null,
        wordCount: null,
        failure: null,
        opportunityId: null,
      }));
    set((s) => ({ sources: [...s.sources, ...newSources] }));
  },

  addPasted: (text) => {
    const source: Source = {
      id: uid(),
      kind: "pasted",
      origin: "Texto pegado",
      status: "extracted",
      text,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      failure: null,
      opportunityId: null,
    };
    set((s) => ({ sources: [...s.sources, source] }));
  },

  addPdf: (fileName, text, wordCount) => {
    const source: Source = {
      id: uid(),
      kind: "pdf",
      origin: fileName,
      status: "extracted",
      text,
      wordCount,
      failure: null,
      opportunityId: null,
    };
    set((s) => ({ sources: [...s.sources, source] }));
  },

  pasteManual: (sourceId, text) => {
    set((s) => ({
      sources: s.sources.map((src) =>
        src.id === sourceId
          ? {
              ...src,
              status: "extracted" as const,
              text,
              wordCount: text.split(/\s+/).filter(Boolean).length,
              failure: null,
            }
          : src,
      ),
    }));
  },

  discard: (opportunityId) => {
    set((s) => ({
      opportunities: s.opportunities.map((o) =>
        o.id === opportunityId ? { ...o, discarded: true } : o,
      ),
    }));
  },

  undiscard: (opportunityId) => {
    set((s) => ({
      opportunities: s.opportunities.map((o) =>
        o.id === opportunityId ? { ...o, discarded: false } : o,
      ),
    }));
  },

  removeSource: (sourceId) => {
    set((s) => ({
      sources: s.sources.filter((src) => src.id !== sourceId),
    }));
  },

  setSortBy: (sortBy) => set({ sortBy }),

  processAll: async () => {
    set({ processing: true });

    const pending = get().sources.filter(
      (s) => s.status === "pending" || s.status === "extracted",
    );

    // Phase 1: Extract URLs (concurrent, max 3)
    const urlSources = pending.filter(
      (s) => s.status === "pending" && s.kind === "url",
    );

    await processConcurrent(urlSources, MAX_CONCURRENT, async (source) => {
      updateSource(set, source.id, { status: "extracting" });
      try {
        const res = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: source.origin }),
        });
        const data = await res.json();

        if (data.cause) {
          updateSource(set, source.id, {
            status: "failed",
            failure: makeFailure(data.cause as FailureCause),
          });
          return;
        }

        updateSource(set, source.id, {
          status: "extracted",
          text: data.text,
          wordCount: data.wordCount,
        });
      } catch {
        updateSource(set, source.id, {
          status: "failed",
          failure: makeFailure("network"),
        });
      }
    });

    // Phase 2: Analyze all extracted sources (concurrent, max 3)
    const extracted = get().sources.filter(
      (s) => s.status === "extracted" && s.text && !s.opportunityId,
    );

    const session = useSession.getState();
    const contextRaw = session.context?.raw ?? "";
    const economyModel = session.connection.models.economy ||
      "google/gemini-2.0-flash-001";

    await processConcurrent(extracted, MAX_CONCURRENT, async (source) => {
      updateSource(set, source.id, { status: "analyzing" });
      try {
        const truncated = truncateForContext(source.text!);

        // PR-03: Extract opportunity
        const pr03Response = await complete({
          model: economyModel,
          messages: [
            { role: "user", content: buildPR03Prompt(truncated) },
          ],
          temperature: 0.1,
        });

        const extractedData = parsePR03Response(pr03Response);

        // PR-04: Evaluate fit
        const pr04Response = await complete({
          model: economyModel,
          messages: [
            {
              role: "user",
              content: buildPR04Prompt(extractedData.brief, contextRaw),
            },
          ],
          temperature: 0.1,
        });

        const fit = parsePR04Response(pr04Response);

        // Verify citations
        const verifiedStrengths = verifyCitations(fit.strengths, contextRaw);
        fit.strengths = verifiedStrengths.map(({ verified, ...point }) => ({
          ...point,
          evidence: verified ? point.evidence : null,
        }));

        const opportunityId = uid();

        const opportunity: Opportunity = {
          id: opportunityId,
          sourceIds: [source.id],
          title: extractedData.title,
          organizer: extractedData.organizer,
          type: extractedData.type,
          modality: extractedData.modality,
          deadline: extractedData.deadline,
          prize: extractedData.prize,
          language: extractedData.language,
          brief: extractedData.brief,
          fit,
          effort: extractedData.effort,
          discarded: false,
          analyzedAt: Date.now(),
        };

        updateSource(set, source.id, {
          status: "ready",
          opportunityId,
        });

        set((s) => ({
          opportunities: [...s.opportunities, opportunity],
        }));
      } catch {
        updateSource(set, source.id, {
          status: "failed",
          failure: makeFailure("network"),
        });
      }
    });

    set({ processing: false });
  },
}));

function updateSource(
  set: (fn: (s: BatchState) => Partial<BatchState>) => void,
  id: string,
  updates: Partial<Source>,
) {
  set((s) => ({
    sources: s.sources.map((src) =>
      src.id === id ? { ...src, ...updates } : src,
    ),
  }));
}

async function processConcurrent<T>(
  items: T[],
  maxConcurrent: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  const queue = [...items];
  const running: Promise<void>[] = [];

  while (queue.length > 0 || running.length > 0) {
    while (running.length < maxConcurrent && queue.length > 0) {
      const item = queue.shift()!;
      const promise = fn(item).then(() => {
        running.splice(running.indexOf(promise), 1);
      });
      running.push(promise);
    }
    if (running.length > 0) {
      await Promise.race(running);
    }
  }
}
