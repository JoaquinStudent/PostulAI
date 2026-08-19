import { create } from "zustand";
import type {
  Question,
  Answer,
  Evidence,
  Gap,
  LimitUnit,
  OpportunityBrief,
} from "@/lib/types";
import { streamComplete, complete, AiError } from "@/lib/ai/client";
import { safeguardModel } from "@/lib/ai/models";
import { buildPR06Messages, parsePR06Response } from "@/lib/prompts/pr-06";
import { buildPR07Messages, parsePR07Response, type RefineAction } from "@/lib/prompts/pr-07";
import { buildPR08Prompt, parsePR08Response } from "@/lib/prompts/pr-08";
import { verifyCitations } from "@/lib/ai/verify";
import { verifyLength } from "@/lib/ai/verify";
import { windowContext } from "@/lib/ai/context-window";
import { SECTOR_SKILLS } from "@/lib/prompts/sector-skills";
import { useSession } from "./session";
import { useBatch } from "./batch";

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function emptyAnswer(questionId: string): Answer {
  return {
    questionId,
    text: "",
    status: "empty",
    charCount: 0,
    wordCount: 0,
    withinLimit: true,
    evidence: [],
    gaps: [],
    history: [],
    generatedAt: null,
  };
}

function recalcCounts(
  text: string,
  limit: { value: number; unit: LimitUnit } | null,
): { charCount: number; wordCount: number; withinLimit: boolean } {
  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (!limit) return { charCount, wordCount, withinLimit: true };
  const { withinLimit } = verifyLength(text, limit);
  return { charCount, wordCount, withinLimit };
}

type Phase = "questions" | "workspace";

interface DraftState {
  opportunityId: string | null;
  questions: Question[];
  answers: Record<string, Answer>;
  activeQuestionId: string | null;
  phase: Phase;

  init: (opportunityId: string) => void;
  setQuestions: (qs: Question[]) => void;
  setActiveQuestion: (id: string) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  addQuestion: (text: string) => void;
  removeQuestion: (id: string) => void;
  generateAnswer: (questionId: string) => Promise<void>;
  generateAll: () => Promise<void>;
  refineAnswer: (questionId: string, action: RefineAction) => Promise<void>;
  resolveGap: (questionId: string, gapId: string, userInput: string) => Promise<void>;
  editAnswer: (questionId: string, newText: string) => void;
  approveAnswer: (questionId: string) => void;
  unapproveAnswer: (questionId: string) => void;
  reset: () => void;
}

function getModelAndContext() {
  const session = useSession.getState();
  const raw =
    session.connection.models[session.connection.preset] ||
    session.connection.models.balanced ||
    "anthropic/claude-sonnet-4";
  const model = safeguardModel(raw);
  const contextRaw = session.context?.raw ?? "";
  return { model, contextRaw };
}

function getEconomyModel(): string {
  const session = useSession.getState();
  return safeguardModel(session.connection.models.economy || "openai/gpt-4o-mini");
}

function getOpportunity(id: string | null) {
  if (!id) return null;
  return useBatch.getState().opportunities.find((o) => o.id === id) ?? null;
}

export const useDraft = create<DraftState>((set, get) => ({
  opportunityId: null,
  questions: [],
  answers: {},
  activeQuestionId: null,
  phase: "questions",

  init: (opportunityId) => {
    set({
      opportunityId,
      questions: [],
      answers: {},
      activeQuestionId: null,
      phase: "questions",
    });
  },

  setQuestions: (qs) => {
    const answers: Record<string, Answer> = {};
    for (const q of qs) {
      answers[q.id] = emptyAnswer(q.id);
    }
    set({
      questions: qs,
      answers,
      activeQuestionId: qs[0]?.id ?? null,
      phase: "workspace",
    });
    useSession.getState().setHasUnexportedWork(true);
  },

  setActiveQuestion: (id) => set({ activeQuestionId: id }),

  updateQuestion: (id, updates) => {
    set((s) => ({
      questions: s.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q,
      ),
    }));
  },

  addQuestion: (text) => {
    const id = uid();
    set((s) => {
      const index = s.questions.length + 1;
      const q: Question = { id, index, text, limit: null, raw: text };
      return {
        questions: [...s.questions, q],
        answers: { ...s.answers, [id]: emptyAnswer(id) },
      };
    });
  },

  removeQuestion: (id) => {
    set((s) => {
      const { [id]: _, ...rest } = s.answers;
      const questions = s.questions
        .filter((q) => q.id !== id)
        .map((q, i) => ({ ...q, index: i + 1 }));
      return {
        questions,
        answers: rest,
        activeQuestionId:
          s.activeQuestionId === id
            ? questions[0]?.id ?? null
            : s.activeQuestionId,
      };
    });
  },

  generateAnswer: async (questionId) => {
    const state = get();
    const question = state.questions.find((q) => q.id === questionId);
    if (!question) return;

    const opp = getOpportunity(state.opportunityId);
    if (!opp) return;

    const { model, contextRaw } = getModelAndContext();
    const category = useBatch.getState().category;
    const sectorKeywords = SECTOR_SKILLS[category]?.keywordPatterns ?? [];

    // Context windowing: send only relevant sections instead of full context
    const windowedContext = windowContext(
      contextRaw,
      question.text,
      opp.brief,
      sectorKeywords,
      2500,
    );

    const approvedAnswers = Object.values(state.answers)
      .filter((a) => a.status === "approved" && a.questionId !== questionId)
      .map((a) => a.text);

    set((s) => ({
      answers: {
        ...s.answers,
        [questionId]: {
          ...s.answers[questionId],
          status: "generating",
          text: "",
          evidence: [],
          gaps: [],
        },
      },
    }));

    try {
      const messages = buildPR06Messages({
        context: windowedContext,
        brief: opp.brief,
        question: question.text,
        limit: question.limit,
        approvedAnswers,
        language: opp.language,
        category,
      });

      let accumulated = "";
      for await (const chunk of streamComplete({
        model,
        messages,
        temperature: 0.3,
        label: "PR-06 Respuesta",
      })) {
        accumulated += chunk;
        set((s) => ({
          answers: {
            ...s.answers,
            [questionId]: {
              ...s.answers[questionId],
              text: accumulated,
              ...recalcCounts(accumulated, question.limit),
            },
          },
        }));
      }

      const parsed = parsePR06Response(accumulated);

      const verified = verifyCitations(
        parsed.evidence.map((e) => ({ claim: "", evidence: e.quote })),
        contextRaw,
      );
      const evidence: Evidence[] = parsed.evidence.map((e, i) => ({
        ...e,
        origin: e.origin === "opportunity" ? "opportunity" : "user_context",
        quote: e.quote,
        supportsCriterion: e.supportsCriterion ?? null,
      }));

      const gaps: Gap[] = parsed.gaps.map((g) => ({
        ...g,
        resolved: false,
        userInput: null,
      }));

      const counts = recalcCounts(parsed.text, question.limit);
      const status: Answer["status"] = counts.withinLimit ? "draft" : "over_limit";

      set((s) => ({
        answers: {
          ...s.answers,
          [questionId]: {
            ...s.answers[questionId],
            text: parsed.text,
            status,
            ...counts,
            evidence,
            gaps,
            generatedAt: Date.now(),
          },
        },
      }));

      if (status === "over_limit" && question.limit) {
        await get().refineAnswer(questionId, "shorten");
      }
    } catch (err) {
      console.error("[postulai] generation failed:", err);
      set((s) => ({
        answers: {
          ...s.answers,
          [questionId]: {
            ...s.answers[questionId],
            status: "empty",
          },
        },
      }));
    }
  },

  generateAll: async () => {
    const { questions } = get();
    for (const q of questions) {
      await get().generateAnswer(q.id);
    }
  },

  refineAnswer: async (questionId, action) => {
    const state = get();
    const question = state.questions.find((q) => q.id === questionId);
    const answer = state.answers[questionId];
    if (!question || !answer || !answer.text) return;

    const { model, contextRaw } = getModelAndContext();
    const category = useBatch.getState().category;
    const sectorKeywords = SECTOR_SKILLS[category]?.keywordPatterns ?? [];

    // Context windowing for lengthen/concrete/regenerate
    const windowedContext = windowContext(
      contextRaw,
      question.text,
      null,
      sectorKeywords,
      2000,
    );

    set((s) => ({
      answers: {
        ...s.answers,
        [questionId]: {
          ...s.answers[questionId],
          status: "generating",
          history: [...s.answers[questionId].history, answer.text],
        },
      },
    }));

    try {
      const messages = buildPR07Messages({
        currentText: answer.text,
        evidence: answer.evidence.map((e) => ({ ref: e.ref, quote: e.quote })),
        action,
        question: question.text,
        limit: question.limit,
        context: windowedContext,
      });

      let accumulated = "";
      for await (const chunk of streamComplete({
        model,
        messages,
        temperature: 0.3,
        label: "PR-07 Refinar",
      })) {
        accumulated += chunk;
        set((s) => ({
          answers: {
            ...s.answers,
            [questionId]: {
              ...s.answers[questionId],
              text: accumulated,
              ...recalcCounts(accumulated, question.limit),
            },
          },
        }));
      }

      const parsed = parsePR07Response(accumulated);
      const counts = recalcCounts(parsed.text, question.limit);

      const verified = verifyCitations(
        parsed.evidence.map((e) => ({ claim: "", evidence: e.quote })),
        contextRaw,
      );

      const evidence: Evidence[] = parsed.evidence.map((e) => ({
        ...e,
        origin: e.origin === "opportunity" ? "opportunity" : "user_context",
        supportsCriterion: e.supportsCriterion ?? null,
      }));

      const gaps: Gap[] = parsed.gaps.map((g) => ({
        ...g,
        resolved: false,
        userInput: null,
      }));

      set((s) => ({
        answers: {
          ...s.answers,
          [questionId]: {
            ...s.answers[questionId],
            text: parsed.text,
            status: counts.withinLimit ? "draft" : "over_limit",
            ...counts,
            evidence,
            gaps,
            generatedAt: Date.now(),
          },
        },
      }));
    } catch (err) {
      console.error("[postulai] refinement failed:", err);
      const lastText = answer.text;
      const counts = recalcCounts(lastText, question.limit);
      set((s) => ({
        answers: {
          ...s.answers,
          [questionId]: {
            ...s.answers[questionId],
            text: lastText,
            status: counts.withinLimit ? "draft" : "over_limit",
            ...counts,
          },
        },
      }));
    }
  },

  resolveGap: async (questionId, gapId, userInput) => {
    const state = get();
    const question = state.questions.find((q) => q.id === questionId);
    const answer = state.answers[questionId];
    if (!question || !answer) return;

    const gap = answer.gaps.find((g) => g.id === gapId);
    if (!gap) return;

    // ponytail: gap resolution is simple — economy model saves tokens
    const economyModel = getEconomyModel();

    try {
      const response = await complete({
        model: economyModel,
        messages: [
          {
            role: "user",
            content: buildPR08Prompt({
              currentText: answer.text,
              evidence: answer.evidence.map((e) => ({ ref: e.ref, quote: e.quote })),
              gap: { description: gap.description, placeholder: gap.placeholder },
              userInput,
              limit: question.limit,
            }),
          },
        ],
        temperature: 0.1,
        label: "PR-08 Gap",
      });

      const parsed = parsePR08Response(response);
      const counts = recalcCounts(parsed.text, question.limit);

      const evidence: Evidence[] = parsed.evidence.map((e) => ({
        ...e,
        origin: e.origin === "opportunity" ? "opportunity" : "user_context",
        supportsCriterion: e.supportsCriterion ?? null,
      }));

      const updatedGaps: Gap[] = answer.gaps.map((g) =>
        g.id === gapId
          ? { ...g, resolved: true, userInput }
          : g,
      );
      const newGapIds = new Set(updatedGaps.map((g) => g.id));
      for (const g of parsed.gaps) {
        if (!newGapIds.has(g.id)) {
          updatedGaps.push({ ...g, resolved: false, userInput: null });
        }
      }

      set((s) => ({
        answers: {
          ...s.answers,
          [questionId]: {
            ...s.answers[questionId],
            text: parsed.text,
            status: counts.withinLimit ? "draft" : "over_limit",
            ...counts,
            evidence,
            gaps: updatedGaps,
            history: [...s.answers[questionId].history, answer.text],
          },
        },
      }));
    } catch (err) {
      console.error("[postulai] gap resolution failed:", err);
    }
  },

  editAnswer: (questionId, newText) => {
    const question = get().questions.find((q) => q.id === questionId);
    const counts = recalcCounts(newText, question?.limit ?? null);
    set((s) => ({
      answers: {
        ...s.answers,
        [questionId]: {
          ...s.answers[questionId],
          text: newText,
          status: newText.trim()
            ? counts.withinLimit
              ? "draft"
              : "over_limit"
            : "empty",
          ...counts,
          evidence: [],
        },
      },
    }));
  },

  approveAnswer: (questionId) => {
    const answer = get().answers[questionId];
    if (!answer || !answer.withinLimit) return;
    set((s) => ({
      answers: {
        ...s.answers,
        [questionId]: { ...s.answers[questionId], status: "approved" },
      },
    }));
  },

  unapproveAnswer: (questionId) => {
    set((s) => ({
      answers: {
        ...s.answers,
        [questionId]: { ...s.answers[questionId], status: "draft" },
      },
    }));
  },

  reset: () => {
    set({
      opportunityId: null,
      questions: [],
      answers: {},
      activeQuestionId: null,
      phase: "questions",
    });
  },
}));
