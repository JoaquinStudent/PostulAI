"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings, ArrowLeft, Sparkles, BookOpen, Award, Briefcase, FileText, Loader2, Mic, MessageCircle, FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionBar } from "@/components/session-bar";
import { useSession } from "@/stores/session";
import { useBatch } from "@/stores/batch";
import { complete } from "@/lib/ai/client";
import { safeguardModel } from "@/lib/ai/models";
import { buildPR09Messages, parsePR09Response } from "@/lib/prompts/pr-09";
import { getCompactSkill, CATEGORY_META } from "@/lib/prompts/sector-skills";
import type { ProfileCoach, OpportunityCategory } from "@/lib/types";

export default function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { connection, context } = useSession();
  const { opportunities, sources, discard, undiscard, updateBrief } = useBatch();
  const [editingBrief, setEditingBrief] = useState(false);
  const [coach, setCoach] = useState<ProfileCoach | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);

  const opp = opportunities.find((o) => o.id === id);

  if (!opp) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-ink-muted">Convocatoria no encontrada.</p>
      </div>
    );
  }

  const oppSource = sources.find((s) => s.opportunityId === opp.id);
  const category: OpportunityCategory = oppSource?.category ?? "otro";
  const sectorSkill = getCompactSkill(category);
  const isCvSector = CATEGORY_META[category].needsCv;

  const handleGenerateCoach = async () => {
    if (!context) return;
    setCoachLoading(true);
    setCoachError(null);
    try {
      const model = safeguardModel(connection.models.economy || "openai/gpt-4o-mini");

      const messages = buildPR09Messages(
        opp.brief,
        context.raw,
        context.cvRaw,
        category,
      );
      const response = await complete({ model, messages, temperature: 0.2 });
      setCoach(parsePR09Response(response));
    } catch (err) {
      setCoachError(err instanceof Error ? err.message : "Error al generar recomendaciones");
    } finally {
      setCoachLoading(false);
    }
  };

  const maxWeight = Math.max(
    ...opp.brief.criteria.map((c) => c.weight ?? 0),
    1,
  );

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-10 h-14 glass border-b border-rule/30">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-stamp rounded-md flex items-center justify-center">
            <span className="text-white text-[11px] font-bold">P</span>
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            PostulAI
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {connection.credit && (
            <span className="font-mono text-xs text-ink-muted">
              Créditos: {connection.credit.remaining.toFixed(2)}
            </span>
          )}
          <Link href="/ajustes" className="text-ink-muted hover:text-ink transition-colors duration-200">
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
                <div className="flex items-center justify-between">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                    QUÉ BUSCAN
                  </h2>
                  <button
                    onClick={() => setEditingBrief(!editingBrief)}
                    className="font-mono text-[11px] uppercase tracking-[0.08em] text-stamp hover:underline"
                  >
                    {editingBrief ? "GUARDAR" : "EDITAR"}
                  </button>
                </div>
                {editingBrief ? (
                  <textarea
                    defaultValue={opp.brief.seeking}
                    onBlur={(e) =>
                      updateBrief(opp.id, { seeking: e.target.value })
                    }
                    className="mt-3 w-full p-3 text-sm border border-rule rounded bg-paper resize-y leading-relaxed"
                    rows={4}
                  />
                ) : (
                  <p className="mt-3 text-ink leading-relaxed">
                    {opp.brief.seeking}
                  </p>
                )}
              </section>

              {/* Evaluation criteria */}
              {opp.brief.criteria.length > 0 && (
                <section className="mt-8 pt-8 border-t border-rule/30">
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
                <section className="mt-8 pt-8 border-t border-rule/30">
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
                <section className="mt-8 pt-8 border-t border-rule/30">
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

              {/* Elevator Pitch — static from skill, always visible */}
              <section className="mt-8 pt-8 border-t border-rule/30">
                <div className="flex items-center gap-2">
                  <Mic className="size-4 text-stamp" />
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-stamp">
                    ELEVATOR PITCH ({sectorSkill.pitchTemplate.maxSeconds}S)
                  </h2>
                </div>
                {coach?.elevatorPitch ? (
                  <div className="mt-3 p-4 bg-stamp/5 border border-stamp/15 rounded-xl">
                    <p className="text-sm leading-relaxed italic">&ldquo;{coach.elevatorPitch}&rdquo;</p>
                    <p className="mt-2 text-[11px] text-ink-muted">Personalizado con tu perfil · {sectorSkill.pitchTemplate.maxSeconds} segundos max</p>
                  </div>
                ) : (
                  <div className="mt-3 p-4 bg-surface border border-rule/30 rounded-xl">
                    <p className="text-xs text-ink-muted mb-1">Estructura para {category}:</p>
                    <p className="text-sm leading-relaxed">{sectorSkill.pitchTemplate.structure}</p>
                    <p className="mt-3 text-xs text-ink-muted mb-1">Ejemplo:</p>
                    <p className="text-sm leading-relaxed italic text-ink/70">&ldquo;{sectorSkill.pitchTemplate.example}&rdquo;</p>
                  </div>
                )}
              </section>

              {/* Interview Tips — static from skill, always visible */}
              <section className="mt-8 pt-8 border-t border-rule/30">
                <div className="flex items-center gap-2">
                  <MessageCircle className="size-4 text-stamp" />
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-stamp">
                    TIPS DE ENTREVISTA
                  </h2>
                </div>

                {/* Personalized tips from PR-09 */}
                {coach && coach.interviewTips.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-ink-muted mb-2">Para esta convocatoria:</p>
                    <ul className="space-y-2">
                      {coach.interviewTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm p-2 bg-stamp/5 rounded-lg">
                          <span className="text-stamp shrink-0 mt-0.5">★</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Static tips from sector skill */}
                <div className="mt-3 space-y-2">
                  {!coach && <p className="text-xs text-ink-muted mb-1">Guía general para {category}:</p>}
                  {coach && <p className="text-xs text-ink-muted mt-4 mb-1">Guía general:</p>}
                  {sectorSkill.interviewTips.map((tip, i) => (
                    <div key={i} className="p-3 bg-surface border border-rule/20 rounded-lg">
                      <p className="text-xs font-medium text-stamp">{tip.topic}</p>
                      <p className="text-sm text-ink-muted mt-1">{tip.advice}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Profile Coach — AI-powered, on-demand */}
              <section className="mt-8 pt-8 border-t border-rule/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-stamp" />
                    <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-stamp">
                      MEJORA TU PERFIL
                    </h2>
                  </div>
                  {!coach && !coachLoading && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateCoach}
                      className="gap-1.5"
                    >
                      <Sparkles className="size-3.5" />
                      Analizar
                    </Button>
                  )}
                </div>
                <p className="mt-2 text-sm text-ink-muted">
                  {coach
                    ? "Recomendaciones personalizadas para esta convocatoria."
                    : `Analiza tu perfil para obtener pitch personalizado, tips de entrevista, y recomendaciones de ${isCvSector ? "CV y certificaciones" : "portafolio y proyectos"}${context?.cvRaw ? " incluyendo tu CV" : ""}.`}
                </p>

                {isCvSector && !context?.cvRaw && !coach && (
                  <p className="mt-2 text-xs text-marker bg-marker/10 px-3 py-2 rounded">
                    Para {category === "empleo" ? "empleo" : "becas"}, subir tu CV en Contexto permite recomendaciones de mejora específicas.
                  </p>
                )}

                {coachLoading && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
                    <Loader2 className="size-4 animate-spin" />
                    Analizando tu perfil{context?.cvRaw ? " y CV" : ""}...
                  </div>
                )}

                {coachError && (
                  <div className="mt-4 p-3 bg-alert/8 border border-alert/20 rounded text-sm text-alert">
                    {coachError}
                  </div>
                )}

                {coach && (
                  <div className="mt-4 space-y-6">
                    {coach.certifications.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="size-4 text-stamp" />
                          <h3 className="text-sm font-medium">Certificaciones recomendadas</h3>
                        </div>
                        <ul className="space-y-2">
                          {coach.certifications.map((c, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm p-2 bg-stamp/5 rounded-lg">
                              <span className="text-stamp shrink-0 mt-0.5">→</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {coach.skills.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="size-4 text-stamp" />
                          <h3 className="text-sm font-medium">Habilidades a desarrollar</h3>
                        </div>
                        <ul className="space-y-2">
                          {coach.skills.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm p-2 bg-stamp/5 rounded-lg">
                              <span className="text-stamp shrink-0 mt-0.5">→</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {coach.experiences.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase className="size-4 text-stamp" />
                          <h3 className="text-sm font-medium">Experiencias sugeridas</h3>
                        </div>
                        <ul className="space-y-2">
                          {coach.experiences.map((e, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm p-2 bg-stamp/5 rounded-lg">
                              <span className="text-stamp shrink-0 mt-0.5">→</span>
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {isCvSector && coach.cvChanges.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="size-4 text-stamp" />
                          <h3 className="text-sm font-medium">Cambios en tu CV</h3>
                        </div>
                        <div className="space-y-3">
                          {coach.cvChanges.map((change, i) => (
                            <div key={i} className="p-3 bg-surface border border-rule/30 rounded-xl">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded ${
                                  change.action === "add"
                                    ? "bg-confirm/10 text-confirm"
                                    : change.action === "remove"
                                      ? "bg-alert/10 text-alert"
                                      : "bg-stamp/10 text-stamp"
                                }`}>
                                  {change.action === "add" ? "AGREGAR" : change.action === "remove" ? "QUITAR" : "MODIFICAR"}
                                </span>
                                <span className="text-xs text-ink-muted">{change.section}</span>
                              </div>
                              {change.current && (
                                <p className="text-xs text-ink-muted line-through mt-1">{change.current}</p>
                              )}
                              <p className="text-sm mt-1">{change.suggested}</p>
                              <p className="text-xs text-ink-muted mt-1">{change.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!isCvSector && coach.portfolioProjects.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FolderGit2 className="size-4 text-stamp" />
                          <h3 className="text-sm font-medium">Proyectos recomendados</h3>
                        </div>
                        <ul className="space-y-2">
                          {coach.portfolioProjects.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm p-2 bg-stamp/5 rounded-lg">
                              <span className="text-stamp shrink-0 mt-0.5">→</span>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {coach.idealCvOutline && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="size-4 text-stamp" />
                          <h3 className="text-sm font-medium">
                            {isCvSector
                              ? context?.cvRaw ? "CV ideal para este puesto" : "Qué debería tener tu CV"
                              : "Perfil ideal para esta convocatoria"}
                          </h3>
                        </div>
                        <div className="p-3 bg-stamp/5 border border-stamp/15 rounded-xl text-sm leading-relaxed whitespace-pre-line">
                          {coach.idealCvOutline}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* Right: fit card */}
            <div className="lg:w-80 shrink-0">
              <div className="border border-rule/40 rounded-2xl p-6 bg-surface sticky top-20 shadow-sm">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                  TU ENCAJE
                </h2>
                <p className="mt-2 font-display text-6xl font-bold">
                  {opp.fit.score}%
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                  COINCIDENCIA CON TU PERFIL
                </p>

                {opp.fit.keywordMatch != null && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-ink/5 rounded-full overflow-hidden">
                      <div className="h-full bg-stamp rounded-full" style={{ width: `${opp.fit.keywordMatch}%` }} />
                    </div>
                    <span className="font-mono text-[11px] text-ink-muted">{opp.fit.keywordMatch}% ATS</span>
                  </div>
                )}

                {opp.brief.confidence === "low" && (
                  <p className="mt-3 text-xs text-marker bg-marker/10 px-2 py-1 rounded">
                    Datos incompletos — encaje aproximado
                  </p>
                )}

                {/* Strengths */}
                {opp.fit.strengths.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-rule/30 space-y-2">
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
                  <div className="mt-4 space-y-3">
                    {opp.fit.gaps.map((g, i) => (
                      <div key={i}>
                        <p className="flex items-start gap-2 text-sm">
                          <span className="text-ink-muted shrink-0 mt-0.5">–</span>
                          {g.claim}
                        </p>
                        {g.improvement && (
                          <p className="ml-5 mt-1 text-xs text-stamp/80 bg-stamp/5 px-2 py-1 rounded">
                            {g.improvement}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Effort */}
                {(opp.effort.questionCount || opp.effort.approxWords) && (
                  <div className="mt-6 pt-6 border-t border-rule/30">
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
                  <Link href={`/lote/${id}/preparar`}>
                    <Button className="w-full">PREPARAR POSTULACIÓN</Button>
                  </Link>
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
