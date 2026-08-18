"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionBar } from "@/components/session-bar";
import { useSession } from "@/stores/session";
import { useBatch } from "@/stores/batch";

export default function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { connection } = useSession();
  const { opportunities, discard, undiscard } = useBatch();

  const opp = opportunities.find((o) => o.id === id);

  if (!opp) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-ink-muted">Convocatoria no encontrada.</p>
      </div>
    );
  }

  const maxWeight = Math.max(
    ...opp.brief.criteria.map((c) => c.weight ?? 0),
    1,
  );

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

      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-[1100px]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            <Link href="/lote" className="hover:text-stamp underline">
              CONVOCATORIAS
            </Link>
            <span>/</span>
            <span className="text-stamp">{opp.title.toUpperCase()}</span>
          </div>

          {/* Title */}
          <h1 className="mt-4 font-display text-3xl md:text-4xl font-bold">
            {opp.title}
          </h1>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            {[
              opp.organizer,
              opp.modality,
              opp.deadline
                ? new Date(opp.deadline).toLocaleDateString("es", {
                    day: "2-digit",
                    month: "short",
                  })
                : null,
              opp.prize,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>

          <div className="mt-10 flex flex-col lg:flex-row gap-10">
            {/* Left: brief details */}
            <div className="flex-1 min-w-0">
              {/* What they're looking for */}
              <section>
                <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                  QUÉ BUSCAN
                </h2>
                <p className="mt-3 text-ink leading-relaxed">
                  {opp.brief.seeking}
                </p>
              </section>

              {/* Evaluation criteria */}
              {opp.brief.criteria.length > 0 && (
                <section className="mt-8 pt-8 border-t border-rule">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                    CRITERIOS DE EVALUACIÓN
                  </h2>
                  <div className="mt-4 space-y-3">
                    {opp.brief.criteria.map((criterion, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {criterion.name}
                          </span>
                          {criterion.weight != null && (
                            <span className="font-mono text-xs text-ink-muted">
                              {criterion.weight}%
                            </span>
                          )}
                        </div>
                        {criterion.weight != null && (
                          <div className="mt-1 h-1.5 bg-rule/20 rounded overflow-hidden">
                            <div
                              className="h-full bg-stamp rounded"
                              style={{
                                width: `${(criterion.weight / maxWeight) * 100}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Tone */}
              {opp.brief.tone.length > 0 && (
                <section className="mt-8 pt-8 border-t border-rule">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                    TONO ESPERADO
                  </h2>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {opp.brief.tone.map((t, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-sm border border-rule rounded"
                      >
                        {t.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Red flags */}
              {opp.brief.redFlags.length > 0 && (
                <section className="mt-8 pt-8 border-t border-rule">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-alert">
                    SEÑALES DE ALERTA
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {opp.brief.redFlags.map((flag, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-alert shrink-0 mt-0.5">■</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Right: fit card */}
            <div className="lg:w-80 shrink-0">
              <div className="border border-rule rounded p-6 bg-surface sticky top-6">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                  TU ENCAJE
                </h2>
                <p className="mt-2 font-display text-6xl font-bold">
                  {opp.fit.score}%
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                  COINCIDENCIA CON TU PERFIL
                </p>

                {opp.brief.confidence === "low" && (
                  <p className="mt-3 text-xs text-marker bg-marker/10 px-2 py-1 rounded">
                    Datos incompletos — encaje aproximado
                  </p>
                )}

                {/* Strengths */}
                {opp.fit.strengths.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-rule space-y-2">
                    {opp.fit.strengths.map((s, i) => (
                      <p
                        key={i}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-confirm shrink-0 mt-0.5">✓</span>
                        {s.claim}
                      </p>
                    ))}
                  </div>
                )}

                {/* Gaps */}
                {opp.fit.gaps.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {opp.fit.gaps.map((g, i) => (
                      <p
                        key={i}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-ink-muted shrink-0 mt-0.5">–</span>
                        {g.claim}
                      </p>
                    ))}
                  </div>
                )}

                {/* Effort */}
                {(opp.effort.questionCount || opp.effort.approxWords) && (
                  <div className="mt-6 pt-6 border-t border-rule">
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                      ESFUERZO ESTIMADO
                    </h3>
                    <p className="mt-1 text-sm">
                      {opp.effort.questionCount && `${opp.effort.questionCount} PREGUNTAS`}
                      {opp.effort.questionCount && opp.effort.approxWords && " · "}
                      {opp.effort.approxWords && `~${opp.effort.approxWords.toLocaleString()} PALABRAS`}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 space-y-3">
                  <Button className="w-full">PREPARAR POSTULACIÓN</Button>
                  <button
                    onClick={() =>
                      opp.discarded ? undiscard(opp.id) : discard(opp.id)
                    }
                    className="block w-full text-center text-sm text-ink-muted underline hover:text-ink"
                  >
                    {opp.discarded ? "Restaurar" : "Descartar esta"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Back nav */}
          <div className="mt-12">
            <Link
              href="/lote"
              className="inline-flex items-center gap-2 text-sm text-stamp hover:text-stamp/80"
            >
              <ArrowLeft className="size-4" />
              Volver a convocatorias
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
