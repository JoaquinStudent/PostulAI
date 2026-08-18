"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, ArrowLeft, Download, Trash2, ChevronRight, AlertTriangle, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleToggle } from "@/components/locale-toggle";
import { SessionBar } from "@/components/session-bar";
import { useT } from "@/lib/i18n";
import {
  useTracker,
  TRACKER_STAGES,
  type TrackerStage,
  type TrackedItem,
} from "@/stores/tracker";

const STAGE_LABELS: Record<TrackerStage, string> = {
  investigando: "Investigando",
  analizando: "Analizando",
  postulando: "Postulando",
  enviada: "Enviada",
  entrevista: "Entrevista",
  resultado: "Resultado",
};

const STAGE_COLORS: Record<TrackerStage, string> = {
  investigando: "bg-ink-muted/10 border-ink-muted/20",
  analizando: "bg-stamp/8 border-stamp/20",
  postulando: "bg-marker/10 border-marker/20",
  enviada: "bg-confirm/8 border-confirm/20",
  entrevista: "bg-stamp/12 border-stamp/30",
  resultado: "bg-confirm/12 border-confirm/30",
};

function fitColor(score: number): string {
  if (score >= 70) return "text-confirm";
  if (score >= 40) return "text-stamp";
  return "text-ink-muted";
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export default function TrackerPage() {
  const t = useT();
  const { items, move, remove, updateNotes } = useTracker();
  const [editingNotes, setEditingNotes] = useState<string | null>(null);

  const handleExport = (format: "json" | "csv") => {
    let content: string;
    let mime: string;
    let ext: string;

    if (format === "json") {
      content = JSON.stringify(items, null, 2);
      mime = "application/json";
      ext = "json";
    } else {
      const header = "titulo,organizador,score,etapa,deadline,notas";
      const rows = items.map(
        (i) =>
          `"${i.title}","${i.organizer ?? ""}",${i.score},"${i.stage}","${i.deadline ?? ""}","${i.notes.replace(/"/g, '""')}"`,
      );
      content = [header, ...rows].join("\n");
      mime = "text/csv";
      ext = "csv";
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `postulai-tracker.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-10 h-14 glass border-b border-rule/30">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="PostulAI" className="h-10" />
        </Link>
        <div className="flex items-center gap-4">
          <LocaleToggle />
          <ThemeToggle />
          <Link href="/ajustes" className="text-ink-muted hover:text-ink transition-colors duration-200">
            <Settings className="size-5" />
          </Link>
        </div>
      </header>
      <SessionBar />

      <main className="flex-1 px-4 md:px-6 py-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link href="/lote" className="text-ink-muted hover:text-ink transition-colors">
                <ArrowLeft className="size-5" />
              </Link>
              <h1 className="font-display text-2xl font-bold">{t("Tracker de postulaciones")}</h1>
              <span className="text-sm text-ink-muted">{items.length} {t("oportunidades")}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport("csv")} className="gap-1.5">
                <Download className="size-3.5" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("json")} className="gap-1.5">
                <Download className="size-3.5" /> JSON
              </Button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-rule/30 rounded-2xl">
              <p className="text-ink-muted">{t("Analiza oportunidades en")} <Link href="/lote" className="text-stamp underline">{t("Analizar")}</Link> {t("para empezar a trackear.")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {TRACKER_STAGES.map((stage) => {
                const stageItems = items.filter((i) => i.stage === stage);
                return (
                  <div key={stage} className="min-w-0">
                    <div className={`px-3 py-2 rounded-t-xl border-t-2 ${STAGE_COLORS[stage]} mb-2`}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider">{t(STAGE_LABELS[stage])}</h3>
                        <span className="text-[10px] text-ink-muted font-mono">{stageItems.length}</span>
                      </div>
                    </div>
                    <div className="space-y-2 min-h-[80px]">
                      {stageItems.map((item) => (
                        <TrackerCard
                          key={item.opportunityId}
                          item={item}
                          stage={stage}
                          onMove={move}
                          onRemove={remove}
                          onUpdateNotes={updateNotes}
                          editingNotes={editingNotes}
                          setEditingNotes={setEditingNotes}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function TrackerCard({
  item,
  stage,
  onMove,
  onRemove,
  onUpdateNotes,
  editingNotes,
  setEditingNotes,
}: {
  item: TrackedItem;
  stage: TrackerStage;
  onMove: (id: string, s: TrackerStage) => void;
  onRemove: (id: string) => void;
  onUpdateNotes: (id: string, n: string) => void;
  editingNotes: string | null;
  setEditingNotes: (id: string | null) => void;
}) {
  const days = daysUntil(item.deadline);
  const urgent = days !== null && days <= 3 && days >= 0;
  const stageIdx = TRACKER_STAGES.indexOf(stage);
  const nextStage = stageIdx < TRACKER_STAGES.length - 1 ? TRACKER_STAGES[stageIdx + 1] : null;

  return (
    <div className="p-3 bg-surface border border-rule/30 rounded-xl text-sm space-y-2">
      <Link href={`/lote/${item.opportunityId}`} className="font-medium hover:text-stamp line-clamp-2 block leading-snug">
        {item.title}
      </Link>

      <div className="flex items-center justify-between">
        <span className={`font-mono text-xs font-bold ${fitColor(item.score)}`}>{item.score}%</span>
        {item.deadline && (
          <span className={`text-[10px] font-mono ${urgent ? "text-alert font-bold" : "text-ink-muted"}`}>
            {urgent && <AlertTriangle className="size-2.5 inline mr-0.5" />}
            {days !== null && days >= 0 ? `${days}d` : "Pasado"}
          </span>
        )}
      </div>

      {/* Notes toggle */}
      {editingNotes === item.opportunityId ? (
        <textarea
          autoFocus
          value={item.notes}
          onChange={(e) => onUpdateNotes(item.opportunityId, e.target.value)}
          onBlur={() => setEditingNotes(null)}
          rows={2}
          className="w-full px-2 py-1.5 text-xs bg-paper border border-rule/40 rounded-lg resize-none focus:outline-none focus:border-stamp/50"
        />
      ) : item.notes ? (
        <button onClick={() => setEditingNotes(item.opportunityId)} className="text-xs text-ink-muted text-left line-clamp-2 w-full hover:text-ink">
          {item.notes}
        </button>
      ) : (
        <button onClick={() => setEditingNotes(item.opportunityId)} className="text-[10px] text-ink-muted/50 hover:text-ink-muted flex items-center gap-1">
          <StickyNote className="size-2.5" /> Nota
        </button>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-rule/20">
        <button onClick={() => onRemove(item.opportunityId)} className="text-[10px] text-ink-muted hover:text-alert">
          <Trash2 className="size-3" />
        </button>
        {nextStage && (
          <button
            onClick={() => onMove(item.opportunityId, nextStage)}
            className="flex items-center gap-0.5 text-[10px] text-stamp hover:text-stamp/80 font-medium"
          >
            {STAGE_LABELS[nextStage]} <ChevronRight className="size-3" />
          </button>
        )}
      </div>
    </div>
  );
}
