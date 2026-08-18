"use client";

import Link from "next/link";
import type { Opportunity } from "@/lib/types";

function fitColor(score: number): string {
  if (score >= 70) return "text-confirm";
  if (score >= 40) return "text-stamp";
  return "text-ink-muted";
}

function fitBarColor(score: number): string {
  if (score >= 70) return "bg-confirm";
  if (score >= 40) return "bg-stamp";
  return "bg-rule";
}

function formatDeadline(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es", { day: "2-digit", month: "short" }).toUpperCase();
}

function effortLabel(approxWords: number | null): string {
  if (!approxWords) return "—";
  if (approxWords < 1500) return "BAJO";
  if (approxWords < 3000) return "MEDIO";
  return "ALTO";
}

export function OpportunityRow({ opp }: { opp: Opportunity }) {
  const topStrength = opp.fit.strengths[0];
  const topGap = opp.fit.gaps[0];

  return (
    <div
      className={`card-hover border border-rule/40 rounded-xl p-5 ${
        opp.discarded ? "opacity-40" : ""
      }`}
    >
      {/* Desktop layout */}
      <div className="hidden md:grid grid-cols-[1fr_auto_1fr_auto_auto] gap-4 items-center">
        {/* Left: title + meta */}
        <div className="min-w-0">
          <Link
            href={`/lote/${opp.id}`}
            className="font-display text-lg font-semibold hover:text-stamp truncate block"
          >
            {opp.title}
          </Link>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted mt-1">
            {[opp.organizer, opp.type, opp.prize]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        {/* Fit score */}
        <div className="text-center w-20">
          <p className={`font-display text-3xl font-bold ${fitColor(opp.fit.score)}`}>
            {opp.fit.score}%
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            ENCAJE
          </p>
        </div>

        {/* Highlights */}
        <div className="min-w-0 space-y-1">
          {topStrength && (
            <p className="text-sm flex items-start gap-1.5">
              <span className="text-confirm shrink-0 mt-0.5">●</span>
              <span className="truncate">{topStrength.claim}</span>
            </p>
          )}
          {topGap && (
            <p className="text-sm flex items-start gap-1.5">
              <span className="text-alert shrink-0 mt-0.5">●</span>
              <span className="truncate">{topGap.claim}</span>
            </p>
          )}
        </div>

        {/* Deadline + effort */}
        <div className="text-right shrink-0">
          <p className="font-mono text-xs text-ink-muted">
            {formatDeadline(opp.deadline)}
          </p>
          {opp.effort.questionCount && (
            <p className="font-mono text-xs text-ink-muted mt-0.5">
              {opp.effort.questionCount} PREGUNTAS · ~{opp.effort.approxWords?.toLocaleString()} PALABRAS
            </p>
          )}
        </div>

        {/* Action */}
        <Link
          href={`/lote/${opp.id}`}
          className={`font-mono text-xs uppercase tracking-[0.08em] px-4 py-2 rounded-lg border transition-all duration-200 active:scale-[0.97] ${
            opp.fit.score >= 40
              ? "bg-stamp text-white border-stamp hover:bg-stamp/90"
              : "border-rule/50 text-ink-muted hover:border-ink-muted/50"
          }`}
        >
          {opp.fit.score >= 40 ? "PREPARAR" : "REVISAR"}
        </Link>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/lote/${opp.id}`}
            className="font-display text-lg font-semibold hover:text-stamp"
          >
            {opp.title}
          </Link>
          <span className={`font-display text-xl font-bold shrink-0 ${fitColor(opp.fit.score)}`}>
            {opp.fit.score}%
          </span>
        </div>

        {/* Fit bar */}
        <div className="mt-2 h-1 bg-rule/30 rounded overflow-hidden">
          <div
            className={`h-full rounded ${fitBarColor(opp.fit.score)}`}
            style={{ width: `${opp.fit.score}%` }}
          />
        </div>

        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted mt-2">
          {[opp.organizer, opp.type].filter(Boolean).join(" · ")}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <p className="font-mono text-xs text-ink-muted">
            LIM {formatDeadline(opp.deadline)}
          </p>
          <p className="font-mono text-xs text-ink-muted">
            ESFUERZO {effortLabel(opp.effort.approxWords)}
          </p>
        </div>

        <div className="mt-3">
          <Link
            href={`/lote/${opp.id}`}
            className={`inline-block font-mono text-xs uppercase tracking-[0.08em] px-4 py-2 rounded-lg border transition-all duration-200 active:scale-[0.97] ${
              opp.fit.score >= 40
                ? "bg-stamp text-white border-stamp"
                : "border-rule/50 text-ink-muted"
            }`}
          >
            {opp.fit.score >= 40 ? "PREPARAR" : "REVISAR"}
          </Link>
        </div>
      </div>
    </div>
  );
}
