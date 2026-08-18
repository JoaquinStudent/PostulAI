"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings, Plus, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionBar } from "@/components/session-bar";
import { OpportunityRow } from "@/components/opportunity-row";
import { SourceQueueItem } from "@/components/source-queue-item";
import { useSession } from "@/stores/session";
import { useBatch } from "@/stores/batch";
import { estimateBatchCost, formatCost } from "@/lib/ai/cost";
import { extractPdfText } from "@/lib/extract/pdf";
import type { Opportunity, SortBy } from "@/lib/types";

type View = "input" | "queue" | "results";

export default function LotePage() {
  const router = useRouter();
  const { context, connection } = useSession();
  const {
    sources,
    opportunities,
    sortBy,
    processing,
    addUrls,
    addPasted,
    addPdf,
    pasteManual,
    removeSource,
    setSortBy,
    processAll,
    discard,
  } = useBatch();

  const [view, setView] = useState<View>("input");
  const [urlText, setUrlText] = useState("");
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!context) {
    if (typeof window !== "undefined") router.replace("/contexto");
    return null;
  }
  if (connection.status !== "connected") {
    if (typeof window !== "undefined") router.replace("/conectar");
    return null;
  }

  const urls = urlText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => {
      try {
        new URL(l);
        return true;
      } catch {
        return false;
      }
    });

  const totalSources = sources.length + urls.length;
  const cost = estimateBatchCost(totalSources);

  const handleAnalyze = async () => {
    if (urls.length > 0) addUrls(urls);
    setUrlText("");
    setView("queue");
    await processAll();
    setView("results");
  };

  const handleAddMore = () => {
    setView("input");
  };

  const handlePdfDrop = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      setPdfLoading(true);
      for (const file of Array.from(files)) {
        if (file.type === "application/pdf") {
          const result = await extractPdfText(file);
          if (result.ok) {
            addPdf(file.name, result.text, result.wordCount);
          }
        }
      }
      setPdfLoading(false);
    },
    [addPdf],
  );

  const handlePasteSubmit = () => {
    if (pastedText.trim().length >= 50) {
      addPasted(pastedText.trim());
      setPastedText("");
      setShowPasteModal(false);
    }
  };

  const readySources = sources.filter((s) => s.status === "ready").length;
  const failedSources = sources.filter((s) => s.status === "failed").length;
  const processingSources = sources.filter(
    (s) => s.status === "extracting" || s.status === "analyzing",
  ).length;

  const sortedOpportunities = sortOpportunities(opportunities, sortBy);

  // --- INPUT VIEW ---
  if (view === "input") {
    return (
      <Shell connection={connection}>
        <main className="flex-1 px-6 py-12">
          <div className="mx-auto max-w-[1100px]">
            <h1 className="font-display text-2xl font-bold">
              ¿A qué estás mirando postular?
            </h1>
            <p className="mt-2 text-ink-muted">
              Pega los enlaces de todas las convocatorias que estés considerando. Uno por línea.
            </p>

            <textarea
              value={urlText}
              onChange={(e) => setUrlText(e.target.value)}
              placeholder={"https://www.corfo.cl/sites/cpp/convocatorias/semilla_inicia\nhttps://www.conacyt.gob.mx/convocatorias/becas_extranjero_2024"}
              className="mt-6 w-full h-56 p-4 text-sm border border-rule rounded bg-surface resize-y font-body leading-relaxed"
            />

            <div className="mt-2 flex justify-end">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                {urls.length + sources.filter((s) => s.kind !== "url" || s.status !== "pending").length} ENLACES
              </span>
            </div>

            {/* PDF + Paste cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handlePdfDrop(e.dataTransfer.files);
                }}
                className="flex flex-col items-center justify-center p-6 border border-rule rounded bg-surface hover:border-ink-muted transition-colors cursor-pointer"
              >
                <FileText className="size-6 text-ink-muted" />
                <p className="mt-2 font-medium text-sm">
                  {pdfLoading ? "Leyendo PDF..." : "Arrastra bases en PDF"}
                </p>
                <p className="text-xs text-ink-muted mt-1">
                  Se leen en tu navegador
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePdfDrop(e.target.files)}
                />
              </button>

              <div className="flex flex-col items-center justify-center p-6 border border-rule rounded bg-surface">
                <p className="text-sm text-ink-muted">
                  ¿La convocatoria no tiene link?
                </p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => setShowPasteModal(true)}
                >
                  PEGAR TEXTO A MANO
                </Button>
              </div>
            </div>

            {/* Already added sources */}
            {sources.length > 0 && (
              <div className="mt-6 border border-rule rounded p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted mb-2">
                  FUENTES AGREGADAS ({sources.length})
                </p>
                {sources.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between py-1 text-sm"
                  >
                    <span className="truncate">{s.origin}</span>
                    <button
                      onClick={() => removeSource(s.id)}
                      className="text-xs text-ink-muted hover:text-alert ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Footer bar */}
            <div className="mt-8 pt-6 border-t border-rule flex items-center justify-between">
              <button className="text-sm text-stamp underline">
                ¿Qué revisa Calco en cada una?
              </button>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                  COSTO ESTIMADO DEL ANÁLISIS {formatCost(cost)}
                </span>
                <Button
                  disabled={totalSources === 0}
                  onClick={handleAnalyze}
                  className="gap-2"
                >
                  ANALIZAR {totalSources > 0 ? `LAS ${totalSources}` : ""}{" "}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Paste modal */}
        {showPasteModal && (
          <PasteModal
            value={pastedText}
            onChange={setPastedText}
            onSubmit={handlePasteSubmit}
            onClose={() => setShowPasteModal(false)}
          />
        )}
      </Shell>
    );
  }

  // --- QUEUE VIEW ---
  if (view === "queue") {
    return (
      <Shell connection={connection}>
        <main className="flex-1 px-6 py-12">
          <div className="mx-auto max-w-[1100px]">
            <div className="flex items-start justify-between">
              <h1 className="font-display text-2xl font-bold">
                Revisando {sources.length} convocatorias
              </h1>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                {readySources} LISTAS · {processingSources} EN PROCESO
                {failedSources > 0 && ` · ${failedSources} FALLÓ`}
              </p>
            </div>

            {/* Progress bar */}
            <div className="mt-6 flex h-2 rounded overflow-hidden bg-rule/20">
              {sources.map((s) => (
                <div
                  key={s.id}
                  className={`flex-1 transition-colors duration-500 ${
                    s.status === "ready"
                      ? "bg-confirm"
                      : s.status === "failed"
                        ? "bg-alert"
                        : s.status === "extracting" || s.status === "analyzing"
                          ? "bg-stamp"
                          : "bg-rule"
                  }`}
                />
              ))}
            </div>

            {/* Queue list */}
            <div className="mt-8">
              {sources.map((s) => (
                <SourceQueueItem
                  key={s.id}
                  source={s}
                  onPasteManual={pasteManual}
                  onRemove={removeSource}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="mt-8 flex justify-center">
              {readySources > 0 && (
                <div className="text-center">
                  <p className="text-sm text-ink-muted mb-3">
                    Puedes entrar mientras terminan las demás
                  </p>
                  <Button onClick={() => setView("results")}>
                    Ver resultados
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </Shell>
    );
  }

  // --- RESULTS VIEW ---
  return (
    <Shell connection={connection}>
      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-[1100px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="font-display text-2xl font-bold">
              {opportunities.length} convocatorias analizadas
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              {(["fit", "deadline", "effort"] as SortBy[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                    sortBy === key
                      ? "border-stamp bg-stamp/5 text-stamp font-medium"
                      : "border-rule text-ink-muted hover:border-ink-muted"
                  }`}
                >
                  {key === "fit"
                    ? "Encaje"
                    : key === "deadline"
                      ? "Fecha límite"
                      : "Esfuerzo"}
                </button>
              ))}
              <Button variant="outline" onClick={handleAddMore} className="gap-1">
                <Plus className="size-4" />
                AGREGAR MÁS ENLACES
              </Button>
            </div>
          </div>

          {/* Opportunity cards */}
          <div className="mt-8 space-y-4">
            {sortedOpportunities.map((opp) => (
              <OpportunityRow key={opp.id} opp={opp} />
            ))}
          </div>

          {opportunities.length === 0 && !processing && (
            <div className="mt-12 text-center text-ink-muted">
              <p>No hay convocatorias analizadas todavía.</p>
            </div>
          )}
        </div>
      </main>
    </Shell>
  );
}

function Shell({
  connection,
  children,
}: {
  connection: import("@/lib/types").AiConnection;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-full">
      <header className="flex items-center justify-between px-6 md:px-10 h-14 bg-surface border-b border-rule">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight"
        >
          CALCO
        </Link>
        <div className="flex items-center gap-4">
          {connection.credit && (
            <span className="font-mono text-xs text-ink-muted">
              Créditos: {connection.credit.remaining.toFixed(2)}
            </span>
          )}
          <Link href="/ajustes" className="text-ink-muted hover:text-ink">
            <Settings className="size-5" />
          </Link>
        </div>
      </header>
      <SessionBar />
      {children}
    </div>
  );
}

function PasteModal({
  value,
  onChange,
  onSubmit,
  onClose,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40">
      <div className="bg-surface rounded border border-rule p-6 w-full max-w-lg mx-4">
        <h2 className="font-display text-lg font-semibold">
          Pegar texto de convocatoria
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Copia y pega el contenido de las bases de la convocatoria.
        </p>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Pega aquí el texto de la convocatoria..."
          className="mt-4 w-full h-48 p-3 text-sm border border-rule rounded bg-paper resize-y font-body"
          autoFocus
        />
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={value.trim().length < 50}
            onClick={onSubmit}
          >
            Agregar
          </Button>
        </div>
      </div>
    </div>
  );
}

function sortOpportunities(
  opps: Opportunity[],
  by: SortBy,
): Opportunity[] {
  const sorted = [...opps];
  switch (by) {
    case "fit":
      sorted.sort((a, b) => b.fit.score - a.fit.score);
      break;
    case "deadline":
      sorted.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
      break;
    case "effort":
      sorted.sort(
        (a, b) => (a.effort.approxWords ?? 9999) - (b.effort.approxWords ?? 9999),
      );
      break;
  }
  return sorted;
}
