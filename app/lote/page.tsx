"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Settings, Plus, ArrowRight, FileText, Download,
  Briefcase, GraduationCap, Rocket, Calendar, Heart, Trophy, MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionBar } from "@/components/session-bar";
import { OpportunityRow } from "@/components/opportunity-row";
import { SourceQueueItem } from "@/components/source-queue-item";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleToggle } from "@/components/locale-toggle";
import { useT } from "@/lib/i18n";
import { useSession } from "@/stores/session";
import { useBatch } from "@/stores/batch";
import { estimateBatchCost, formatCost } from "@/lib/ai/cost";
import { extractPdfText } from "@/lib/extract/pdf";
import type { Opportunity, OpportunityCategory, SortBy } from "@/lib/types";

type View = "input" | "queue" | "results";

const CATEGORIES: {
  value: OpportunityCategory;
  label: string;
  icon: typeof Briefcase;
  desc: string;
}[] = [
  { value: "empleo", label: "Empleo", icon: Briefcase, desc: "Ofertas de trabajo, pasantías" },
  { value: "beca", label: "Beca", icon: GraduationCap, desc: "Becas de estudio, investigación" },
  { value: "hackathon", label: "Hackathon", icon: Trophy, desc: "Competencias, challenges" },
  { value: "aceleradora", label: "Aceleradora", icon: Rocket, desc: "Programas de aceleración, fondos" },
  { value: "evento", label: "Evento", icon: Calendar, desc: "Conferencias, workshops, calls" },
  { value: "voluntariado", label: "Voluntariado", icon: Heart, desc: "Servicio social, comunidad" },
  { value: "otro", label: "Otro", icon: MoreHorizontal, desc: "Cualquier otra convocatoria" },
];

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
    category,
    setCategory,
    processAll,
  } = useBatch();

  const [view, setView] = useState<View>("input");
  const [urlText, setUrlText] = useState("");
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!context) router.replace("/contexto");
    else if (connection.status !== "connected") router.replace("/conectar");
  }, [context, connection.status, router]);

  const t = useT();

  if (!context || connection.status !== "connected") return null;

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

  const sourcesForCategory = sources.filter((s) => s.category === category);
  const sourceCounts = CATEGORIES.map((c) => ({
    ...c,
    count: sources.filter((s) => s.category === c.value).length,
  }));

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
    const activeCat = CATEGORIES.find((c) => c.value === category)!;
    const ActiveIcon = activeCat.icon;

    return (
      <Shell connection={connection}>
        <main className="flex-1 px-6 py-10">
          <div className="mx-auto max-w-[1100px]">
            <h1 className="font-display text-2xl font-bold">
              {t("¿A qué estás postulando?")}
            </h1>
            <p className="mt-2 text-ink-muted">
              {t("Elige el tipo de oportunidad y agrega tus convocatorias. Cada sector usa una estrategia de análisis distinta.")}
            </p>

            {/* Category cards */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {sourceCounts.map((c) => {
                const Icon = c.icon;
                const selected = category === c.value;
                return (
                  <button
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className={`relative flex flex-col items-start p-4 rounded-xl border transition-all duration-200 active:scale-[0.97] text-left ${
                      selected
                        ? "border-stamp/40 bg-stamp/5 shadow-sm"
                        : "border-rule/40 hover:border-rule hover:bg-paper/50"
                    }`}
                  >
                    <Icon className={`size-5 ${selected ? "text-stamp" : "text-ink-muted"}`} />
                    <p className={`mt-2 text-sm font-medium ${selected ? "text-stamp" : "text-ink"}`}>
                      {t(c.label)}
                    </p>
                    <p className="text-[11px] text-ink-muted leading-snug mt-0.5">
                      {c.desc}
                    </p>
                    {c.count > 0 && (
                      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-stamp text-white text-[10px] font-bold flex items-center justify-center">
                        {c.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active category input area */}
            <div className="mt-8 border border-rule/40 rounded-xl p-6 bg-surface">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-stamp/10 flex items-center justify-center">
                  <ActiveIcon className="size-4.5 text-stamp" />
                </div>
                <div>
                  <h2 className="font-medium">{t(activeCat.label)}</h2>
                  <p className="text-xs text-ink-muted">{activeCat.desc}</p>
                </div>
              </div>

              <textarea
                value={urlText}
                onChange={(e) => setUrlText(e.target.value)}
                placeholder={"Pega los enlaces de las convocatorias, uno por línea\nhttps://ejemplo.com/convocatoria-1\nhttps://ejemplo.com/convocatoria-2"}
                className="w-full h-40 p-4 text-sm border border-rule/30 rounded-xl bg-paper resize-y font-body leading-relaxed focus:border-stamp/40 focus:ring-2 focus:ring-stamp/10 outline-none transition-all duration-200"
              />

              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-rule/40 rounded-lg hover:border-rule transition-colors"
                >
                  <FileText className="size-4 text-ink-muted" />
                  {pdfLoading ? t("Leyendo...") : t("Subir PDF")}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => handlePdfDrop(e.target.files)}
                  />
                </button>
                <button
                  onClick={() => setShowPasteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-rule/40 rounded-lg hover:border-rule transition-colors"
                >
                  {t("Pegar texto")}
                </button>
              </div>

              {/* Sources in this category */}
              {sourcesForCategory.length > 0 && (
                <div className="mt-4 pt-4 border-t border-rule/20">
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted mb-2">
                    {sourcesForCategory.length} fuente{sourcesForCategory.length !== 1 ? "s" : ""} en {activeCat.label}
                  </p>
                  {sourcesForCategory.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between py-1.5 text-sm"
                    >
                      <span className="truncate text-ink/80">
                        {s.kind === "url"
                          ? new URL(s.origin).hostname.replace(/^www\./, "")
                          : s.origin}
                      </span>
                      <button
                        onClick={() => removeSource(s.id)}
                        className="text-xs text-ink-muted hover:text-alert ml-2 shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Global summary + analyze */}
            {sources.length > 0 && (
              <div className="mt-6 p-4 bg-paper rounded-xl border border-rule/30">
                <div className="flex flex-wrap gap-2 mb-3">
                  {sourceCounts
                    .filter((c) => c.count > 0)
                    .map((c) => (
                      <span
                        key={c.value}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-stamp/8 text-stamp"
                      >
                        {c.count} {t(c.label)}
                      </span>
                    ))}
                </div>
                <p className="text-xs text-ink-muted">
                  Total: {sources.length} fuente{sources.length !== 1 ? "s" : ""} · Costo estimado: {formatCost(cost)}
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-4">
              <Button
                disabled={totalSources === 0}
                onClick={handleAnalyze}
                className="gap-2"
              >
                {t("ANALIZAR")} {totalSources > 0 ? `(${totalSources})` : ""}{" "}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </main>

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

            <div className="mt-8 flex justify-center">
              {readySources > 0 && (
                <div className="text-center">
                  <p className="text-sm text-ink-muted mb-3">
                    Puedes entrar mientras terminan las demás
                  </p>
                  <Button onClick={() => setView("results")}>
                    {t("Ver resultados")}
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
              {opportunities.length} {t("convocatorias analizadas")}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              {(["fit", "deadline", "effort"] as SortBy[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 active:scale-[0.97] ${
                    sortBy === key
                      ? "border-stamp/40 bg-stamp/8 text-stamp font-medium"
                      : "border-rule/50 text-ink-muted hover:border-ink-muted/50"
                  }`}
                >
                  {key === "fit"
                    ? t("Encaje")
                    : key === "deadline"
                      ? t("Fecha límite")
                      : t("Esfuerzo")}
                </button>
              ))}
              <Button variant="outline" onClick={handleAddMore} className="gap-1">
                <Plus className="size-4" />
                {t("AGREGAR MÁS")}
              </Button>
              {opportunities.length > 0 && (
                <Button
                  variant="outline"
                  className="gap-1"
                  onClick={() => {
                    const blob = new Blob(
                      [JSON.stringify(opportunities, null, 2)],
                      { type: "application/json" },
                    );
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "postulai-analisis.json";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="size-4" />
                  {t("DESCARGAR")}
                </Button>
              )}
            </div>
          </div>

          {/* Results grouped by category */}
          <div className="mt-8 space-y-8">
            {CATEGORIES.filter((c) =>
              sortedOpportunities.some((opp) =>
                sources.some(
                  (s) => s.opportunityId === opp.id && s.category === c.value,
                ),
              ),
            ).map((c) => {
              const Icon = c.icon;
              const catOpps = sortedOpportunities.filter((opp) =>
                sources.some(
                  (s) => s.opportunityId === opp.id && s.category === c.value,
                ),
              );
              return (
                <div key={c.value}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <Icon className="size-4.5 text-stamp" />
                    <h2 className="font-display text-lg font-bold">{t(c.label)}</h2>
                    <span className="text-xs text-ink-muted">
                      {catOpps.length} resultado{catOpps.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {catOpps.map((opp) => (
                      <OpportunityRow key={opp.id} opp={opp} />
                    ))}
                  </div>
                </div>
              );
            })}
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
  const t = useT();
  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-10 h-14 glass border-b border-rule/30">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="PostulAI" className="h-10" />
        </Link>
        <div className="flex items-center gap-4">
          {connection.credit && (
            <span className="font-mono text-xs text-ink-muted">
              {t("Créditos restantes")}: {connection.credit.remaining.toFixed(2)}
            </span>
          )}
          <LocaleToggle />
          <ThemeToggle />
          <Link href="/ajustes" className="text-ink-muted hover:text-ink transition-colors duration-200">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl border border-rule/30 p-6 w-full max-w-lg mx-4 shadow-xl">
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
