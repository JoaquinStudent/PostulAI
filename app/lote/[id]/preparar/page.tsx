"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleToggle } from "@/components/locale-toggle";
import { useT } from "@/lib/i18n";
import {
  Settings,
  ArrowLeft,
  Check,
  Clock,
  Pencil,
  Copy,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionBar } from "@/components/session-bar";
import { useShallow } from "zustand/react/shallow";
import { useSession } from "@/stores/session";
import { useBatch } from "@/stores/batch";
import { useDraft } from "@/stores/draft";
import { parseQuestions, detectLimit } from "@/lib/parse/limits";
import { buildPR05Prompt, parsePR05Response } from "@/lib/prompts/pr-05";
import { complete } from "@/lib/ai/client";
import type { Question, Answer, Evidence, Gap, LimitUnit, AnswerScore } from "@/lib/types";
import type { RefineAction } from "@/lib/prompts/pr-07";
import { scoreAnswer } from "@/lib/ai/score";

export default function PrepararPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const t = useT();
  const { connection, context } = useSession();
  const opportunities = useBatch((s) => s.opportunities);
  const phase = useDraft((s) => s.phase);
  const draftOppId = useDraft((s) => s.opportunityId);
  const init = useDraft((s) => s.init);

  useEffect(() => {
    if (!context) router.replace("/contexto");
    else if (connection.status !== "connected") router.replace("/conectar");
  }, [context, connection.status, router]);

  useEffect(() => {
    if (draftOppId !== id) {
      init(id);
    }
  }, [id, draftOppId, init]);

  // beforeunload guard (S3-21)
  const hasWork = useSession((s) => s.hasUnexportedWork);
  useEffect(() => {
    if (!hasWork) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasWork]);

  if (!context || connection.status !== "connected") return null;

  const opp = opportunities.find((o) => o.id === id);
  if (!opp) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-ink-muted">Convocatoria no encontrada.</p>
      </div>
    );
  }

  if (phase === "questions") {
    return (
      <Shell connection={connection}>
        <QuestionLoadingView opportunityId={id} oppTitle={opp.title} />
      </Shell>
    );
  }

  return (
    <Shell connection={connection}>
      <WorkspaceView opportunityId={id} opp={opp} />
    </Shell>
  );
}

// ─── QUESTION LOADING VIEW ─────────────────────────────────────────

function QuestionLoadingView({
  opportunityId,
  oppTitle,
}: {
  opportunityId: string;
  oppTitle: string;
}) {
  const t = useT();
  const [rawText, setRawText] = useState("");
  const [detected, setDetected] = useState<
    { text: string; raw: string; limit: { value: number; unit: LimitUnit } | null }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const setQuestions = useDraft((s) => s.setQuestions);

  const handleParse = useCallback(async () => {
    if (!rawText.trim()) return;

    let questions = parseQuestions(rawText);

    // Fallback to PR-05 if regex finds < 2 questions
    if (questions.length < 2) {
      setLoading(true);
      try {
        const session = (await import("@/stores/session")).useSession.getState();
        const economyModel =
          session.connection.models.economy || "google/gemini-2.5-flash";
        const response = await complete({
          model: economyModel,
          messages: [{ role: "user", content: buildPR05Prompt(rawText) }],
          temperature: 0.1,
          label: "PR-05 Parser",
        });
        questions = parsePR05Response(response);
      } catch {
        // Keep regex result
      }
      setLoading(false);
    }

    setDetected(questions);
  }, [rawText]);

  // Auto-detect on paste
  useEffect(() => {
    if (rawText.trim().length > 20) {
      const timer = setTimeout(handleParse, 300);
      return () => clearTimeout(timer);
    }
    setDetected([]);
  }, [rawText, handleParse]);

  const handleConfirm = () => {
    const qs: Question[] = detected.map((d, i) => ({
      id: Math.random().toString(36).slice(2, 10),
      index: i + 1,
      text: d.text,
      limit: d.limit ? { ...d.limit, detected: true } : null,
      raw: d.raw,
    }));
    setQuestions(qs);
  };

  const updateDetectedLimit = (
    idx: number,
    value: number,
    unit: LimitUnit,
  ) => {
    setDetected((prev) =>
      prev.map((d, i) =>
        i === idx ? { ...d, limit: { value, unit } } : d,
      ),
    );
  };

  const removeDetected = (idx: number) => {
    setDetected((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto max-w-[1100px]">
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
          <Link href="/lote" className="hover:text-stamp underline">
            CONVOCATORIAS
          </Link>
          {" / "}
          <Link
            href={`/lote/${opportunityId}`}
            className="hover:text-stamp underline"
          >
            {oppTitle.toUpperCase()}
          </Link>
          {" / "}
          <span className="text-stamp">CARGA DE PREGUNTAS</span>
        </div>

        <h1 className="mt-6 font-display text-2xl md:text-3xl font-bold">
          {t("Pega las preguntas del formulario")}
        </h1>
        <p className="mt-2 text-ink-muted">
          PostulAI detecta solo los límites de cada una. Corrígelos si se
          equivoca.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: paste area */}
          <div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={
                "1. Describe tu proyecto en una frase. (máx. 100 caracteres)\n\n2. ¿Cuál es el principal problema que resuelve tu solución?\n(200 words max)\n\n3. Detalla la arquitectura técnica propuesta."
              }
              className="w-full h-80 p-4 text-sm font-mono border border-rule rounded bg-surface resize-y leading-relaxed"
              autoFocus
            />
          </div>

          {/* Right: detected questions */}
          <div>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-ink-muted mb-4">
                <Loader2 className="size-4 animate-spin" />
                Detectando preguntas...
              </div>
            )}

            {detected.length > 0 && (
              <>
                <h2 className="font-display text-lg font-bold">
                  {detected.length} preguntas detectadas
                </h2>
                <div className="mt-4 space-y-3">
                  {detected.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 border border-rule rounded bg-surface"
                    >
                      <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded border border-rule text-sm font-medium">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed line-clamp-2">
                          {d.text}
                        </p>
                        {d.limit ? (
                          <span className="inline-block mt-1 px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] bg-stamp/10 text-stamp rounded-full">
                            {d.limit.value}{" "}
                            {d.limit.unit === "characters"
                              ? "CARACTERES"
                              : "PALABRAS"}
                          </span>
                        ) : (
                          <div className="mt-1 flex items-center gap-2">
                            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                              SIN LÍMITE
                            </span>
                            <input
                              type="number"
                              placeholder="300"
                              className="w-16 px-2 py-0.5 text-xs border border-rule rounded"
                              onChange={(e) => {
                                const v = parseInt(e.target.value, 10);
                                if (v > 0)
                                  updateDetectedLimit(i, v, "characters");
                              }}
                            />
                            <select
                              className="text-xs border border-rule rounded px-1 py-0.5"
                              onChange={(e) => {
                                const unit = e.target.value as LimitUnit;
                                const existing = detected[i].limit;
                                if (existing)
                                  updateDetectedLimit(i, existing.value, unit);
                              }}
                            >
                              <option value="characters">chars</option>
                              <option value="words">words</option>
                            </select>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeDetected(i)}
                        className="shrink-0 text-ink-muted hover:text-alert"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Button
                    onClick={handleConfirm}
                    disabled={detected.length === 0}
                    className="w-full"
                  >
                    GENERAR RESPUESTAS ({detected.length})
                  </Button>
                </div>
              </>
            )}

            {!loading && detected.length === 0 && rawText.trim().length > 0 && (
              <p className="text-sm text-ink-muted">
                No se detectaron preguntas. Intenta pegarlas con números (1. 2.
                3.) o separadas por líneas en blanco.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── WORKSPACE VIEW ─────────────────────────────────────────────────

function WorkspaceView({
  opportunityId,
  opp,
}: {
  opportunityId: string;
  opp: import("@/lib/types").Opportunity;
}) {
  const { questions, answers, activeQuestionId } = useDraft(
    useShallow((s) => ({
      questions: s.questions,
      answers: s.answers,
      activeQuestionId: s.activeQuestionId,
    })),
  );
  const setActiveQuestion = useDraft((s) => s.setActiveQuestion);
  const generateAnswer = useDraft((s) => s.generateAnswer);
  const generateAll = useDraft((s) => s.generateAll);
  const refineAnswer = useDraft((s) => s.refineAnswer);
  const resolveGap = useDraft((s) => s.resolveGap);
  const editAnswer = useDraft((s) => s.editAnswer);
  const approveAnswer = useDraft((s) => s.approveAnswer);
  const unapproveAnswer = useDraft((s) => s.unapproveAnswer);

  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);

  const activeQuestion = questions.find((q) => q.id === activeQuestionId);
  const activeAnswer = activeQuestionId
    ? answers[activeQuestionId]
    : undefined;

  const approvedCount = Object.values(answers).filter(
    (a) => a.status === "approved",
  ).length;

  const handleGenerateAll = async () => {
    setGeneratingAll(true);
    await generateAll();
    setGeneratingAll(false);
  };

  const handleCopy = async () => {
    if (!activeAnswer?.text) return;
    await navigator.clipboard.writeText(activeAnswer.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRefine = (action: RefineAction) => {
    if (activeQuestionId) refineAnswer(activeQuestionId, action);
  };

  // Generate all on mount if all empty
  useEffect(() => {
    const allEmpty = Object.values(answers).every((a) => a.status === "empty");
    if (allEmpty && questions.length > 0) {
      handleGenerateAll();
    }
  }, []);

  return (
    <>
      {/* Top progress bar */}
      <div className="flex items-center justify-between px-6 py-2 glass border-b border-rule/30">
        <div className="flex items-center gap-3">
          <Link
            href={`/lote/${opportunityId}`}
            className="text-ink-muted hover:text-stamp transition-colors"
            title="Volver a la convocatoria"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            {opp.title}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            {approvedCount} DE {questions.length} APROBADAS
          </span>
          <div
            className="flex h-2 w-32 rounded overflow-hidden bg-rule/20"
            role="progressbar"
            aria-valuenow={approvedCount}
            aria-valuemax={questions.length}
            aria-label={`${approvedCount} de ${questions.length} aprobadas`}
          >
            {questions.map((q) => {
              const a = answers[q.id];
              return (
                <div
                  key={q.id}
                  className={`flex-1 transition-colors ${
                    a?.status === "approved"
                      ? "bg-confirm"
                      : a?.status === "generating"
                        ? "bg-stamp"
                        : a?.status === "over_limit"
                          ? "bg-alert"
                          : "bg-rule"
                  }`}
                />
              );
            })}
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowExport(true)}>
            Exportar
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* ─── LEFT SIDEBAR: question index (desktop) ─── */}
        <aside className="hidden md:flex flex-col w-60 border-r border-rule bg-surface overflow-y-auto">
          <div className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            ÍNDICE DE RESPUESTAS
          </div>
          {questions.map((q) => (
            <QuestionNavItem
              key={q.id}
              question={q}
              answer={answers[q.id]}
              active={q.id === activeQuestionId}
              onClick={() => setActiveQuestion(q.id)}
            />
          ))}
        </aside>

        {/* ─── MOBILE: question carousel ─── */}
        <div className="md:hidden flex gap-2 px-4 py-3 overflow-x-auto border-b border-rule bg-surface">
          {questions.map((q) => {
            const a = answers[q.id];
            const isActive = q.id === activeQuestionId;
            return (
              <button
                key={q.id}
                onClick={() => setActiveQuestion(q.id)}
                className={`shrink-0 w-10 h-10 rounded border text-sm font-medium transition-colors ${
                  isActive
                    ? "border-stamp bg-stamp text-white"
                    : a?.status === "approved"
                      ? "border-confirm bg-confirm/10 text-confirm"
                      : "border-rule text-ink-muted"
                }`}
              >
                {q.index}
              </button>
            );
          })}
        </div>

        {/* ─── CENTER: answer editor ─── */}
        <main className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
          {activeQuestion && activeAnswer && (
            <AnswerEditor
              question={activeQuestion}
              answer={activeAnswer}
              onEdit={(text) => editAnswer(activeQuestion.id, text)}
              onRefine={handleRefine}
              onCopy={handleCopy}
              copied={copied}
              onApprove={() =>
                activeAnswer.status === "approved"
                  ? unapproveAnswer(activeQuestion.id)
                  : approveAnswer(activeQuestion.id)
              }
              onGenerate={() => generateAnswer(activeQuestion.id)}
              questionNum={activeQuestion.index}
              totalQuestions={questions.length}
              criteriaNames={opp.brief.criteria.map((c) => c.name)}
            />
          )}
        </main>

        {/* ─── RIGHT SIDEBAR: evidence (desktop) ─── */}
        <aside className="hidden lg:flex flex-col w-72 border-l border-rule bg-surface overflow-y-auto">
          {activeAnswer && activeAnswer.evidence.length > 0 && (
            <div className="p-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted mb-3">
                DE DÓNDE SALE ESTO
              </div>
              <div className="space-y-3">
                {activeAnswer.evidence.map((e, i) => (
                  <EvidenceCard key={i} evidence={e} />
                ))}
              </div>
            </div>
          )}
          {activeAnswer &&
            activeAnswer.gaps.filter((g) => !g.resolved).length > 0 && (
              <div className="p-4 border-t border-rule">
                {activeAnswer.gaps
                  .filter((g) => !g.resolved)
                  .map((g) => (
                    <GapCard
                      key={g.id}
                      gap={g}
                      onResolve={(input) =>
                        activeQuestionId &&
                        resolveGap(activeQuestionId, g.id, input)
                      }
                    />
                  ))}
              </div>
            )}
        </aside>
      </div>

      {/* ─── MOBILE: sticky bottom toolbar ─── */}
      <div className="md:hidden sticky bottom-0 bg-surface border-t border-rule px-4 py-3">
        {activeQuestion?.limit && activeAnswer && (
          <div className="mb-2">
            <LimitRuler
              count={
                activeQuestion.limit.unit === "characters"
                  ? activeAnswer.charCount
                  : activeAnswer.wordCount
              }
              limit={activeQuestion.limit}
              compact
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRefine("shorten")}
            className="p-2 border border-rule rounded text-ink-muted hover:text-ink"
            title="Acortar"
          >
            <ChevronDown className="size-4" />
          </button>
          <button
            onClick={() => handleRefine("concrete")}
            className="p-2 border border-rule rounded text-ink-muted hover:text-ink"
            title="Más concreto"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() =>
              activeQuestionId &&
              (activeAnswer?.status === "approved"
                ? unapproveAnswer(activeQuestionId)
                : approveAnswer(activeQuestionId!))
            }
            className={`p-2 border rounded ${
              activeAnswer?.status === "approved"
                ? "border-confirm bg-confirm/10 text-confirm"
                : "border-rule text-ink-muted hover:text-ink"
            }`}
            title="Aprobar"
          >
            <Check className="size-4" />
          </button>
          <Button className="flex-1 gap-2" onClick={handleCopy}>
            <Copy className="size-4" />
            {copied ? "COPIADO" : "COPIAR"}
          </Button>
        </div>
      </div>

      {showExport && (
        <ExportModal
          opp={opp}
          onClose={() => setShowExport(false)}
        />
      )}
    </>
  );
}

// ─── ANSWER EDITOR ──────────────────────────────────────────────────

function AnswerEditor({
  question,
  answer,
  onEdit,
  onRefine,
  onCopy,
  copied,
  onApprove,
  onGenerate,
  questionNum,
  totalQuestions,
  criteriaNames,
}: {
  question: Question;
  answer: Answer;
  onEdit: (text: string) => void;
  onRefine: (action: RefineAction) => void;
  onCopy: () => void;
  copied: boolean;
  onApprove: () => void;
  onGenerate: () => void;
  questionNum: number;
  totalQuestions: number;
  criteriaNames: string[];
}) {
  const score = answer.text.trim()
    ? scoreAnswer(answer.text, criteriaNames)
    : null;
  return (
    <div className="max-w-[740px]">
      {/* Header */}
      <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
        PREGUNTA {questionNum} DE {totalQuestions}
        {question.limit &&
          ` · LÍMITE ${question.limit.value} ${question.limit.unit === "characters" ? "CARACTERES" : "PALABRAS"}`}
      </div>

      {/* Question text */}
      <h2 className="mt-3 font-display text-xl md:text-2xl font-bold leading-snug">
        {question.text}
      </h2>

      {/* Answer area */}
      <div className="mt-6" aria-live="polite">
        {answer.status === "empty" ? (
          <div className="text-center py-12">
            <Button onClick={onGenerate}>Generar respuesta</Button>
          </div>
        ) : answer.status === "generating" ? (
          <div className="w-full min-h-[200px] p-4 border border-rule rounded bg-paper flex flex-col items-center justify-center gap-4">
            <Loader2 className="size-8 text-stamp animate-spin" />
            <p className="text-sm text-ink-muted animate-pulse">Generando respuesta...</p>
          </div>
        ) : (
          <>
            <textarea
              value={answer.text}
              onChange={(e) => onEdit(e.target.value)}
              className={`w-full min-h-[200px] p-4 text-sm border rounded bg-paper resize-y leading-relaxed font-body ${
                answer.status === "over_limit"
                  ? "border-alert"
                  : answer.status === "approved"
                    ? "border-confirm"
                    : "border-rule"
              }`}
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />

            {/* Limit ruler */}
            {question.limit && (
              <LimitRuler
                count={
                  question.limit.unit === "characters"
                    ? answer.charCount
                    : answer.wordCount
                }
                limit={question.limit}
              />
            )}

            {/* Answer quality scores */}
            {score && (
              <div className="mt-3 flex gap-4">
                {(
                  [
                    ["Palabras clave", score.keywords],
                    ["Impacto", score.impact],
                    ["Narrativa", score.narrative],
                  ] as [string, number][]
                ).map(([label, value]) => (
                  <div key={label} className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                        {label}
                      </span>
                      <span className={`font-mono text-[10px] font-medium ${
                        value >= 60 ? "text-confirm" : value >= 30 ? "text-marker" : "text-alert"
                      }`}>
                        {value}
                      </span>
                    </div>
                    <div className="h-1 rounded overflow-hidden bg-rule/20">
                      <div
                        className={`h-full rounded transition-all ${
                          value >= 60 ? "bg-confirm" : value >= 30 ? "bg-marker" : "bg-alert"
                        }`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mobile evidence/gaps (below lg) */}
            <div className="lg:hidden mt-4 space-y-3">
              {answer.evidence.length > 0 && (
                <details className="border border-rule rounded">
                  <summary className="px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted cursor-pointer">
                    EVIDENCIA ({answer.evidence.length})
                  </summary>
                  <div className="p-3 space-y-2 border-t border-rule">
                    {answer.evidence.map((e, i) => (
                      <EvidenceCard key={i} evidence={e} />
                    ))}
                  </div>
                </details>
              )}
              {answer.gaps.filter((g) => !g.resolved).length > 0 && (
                <div className="space-y-2">
                  {answer.gaps
                    .filter((g) => !g.resolved)
                    .map((g) => (
                      <GapCard
                        key={g.id}
                        gap={g}
                        onResolve={(input) => {
                          const draft = useDraft.getState();
                          if (draft.activeQuestionId)
                            draft.resolveGap(draft.activeQuestionId, g.id, input);
                        }}
                      />
                    ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-6 pt-6 border-t border-rule hidden md:flex items-center gap-3 flex-wrap">
              {(
                [
                  ["shorten", "Acortar"],
                  ["lengthen", "Alargar"],
                  ["concrete", "Más concreto"],
                  ["regenerate", "Regenerar"],
                ] as [RefineAction, string][]
              ).map(([action, label]) => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  onClick={() => onRefine(action)}
                  disabled={
                    answer.status === "generating" ||
                    answer.status === "empty"
                  }
                >
                  {label}
                </Button>
              ))}

              <div className="flex-1" />

              <button
                onClick={onCopy}
                disabled={!answer.text}
                className="p-2 text-ink-muted hover:text-ink disabled:opacity-30"
                title="Copiar"
              >
                <Copy className="size-4" />
              </button>
              {copied && (
                <span className="text-xs text-confirm">Copiado</span>
              )}

              <Button
                onClick={onApprove}
                disabled={!answer.withinLimit}
                className={`gap-2 ${
                  answer.status === "approved"
                    ? "bg-confirm hover:bg-confirm/90"
                    : ""
                }`}
              >
                <Check className="size-4" />
                {answer.status === "approved" ? "APROBADA" : "APROBAR"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── LIMIT RULER ────────────────────────────────────────────────────

function LimitRuler({
  count,
  limit,
  compact,
}: {
  count: number;
  limit: { value: number; unit: LimitUnit };
  compact?: boolean;
}) {
  const pct = Math.min((count / limit.value) * 100, 110);
  const exceeded = count > limit.value;
  const nearFull = pct >= 90 && !exceeded;
  const unitLabel = limit.unit === "characters" ? "caracteres" : "palabras";

  return (
    <div className={compact ? "flex items-center gap-2" : "mt-3"}>
      {!compact && (
        <div className="flex items-center justify-between mb-1">
          {exceeded && (
            <span className="flex items-center gap-1 text-xs text-alert">
              <AlertTriangle className="size-3" />
              Exceso de {unitLabel}
            </span>
          )}
          {!exceeded && <span />}
          <span className="font-mono text-xs text-ink-muted">
            <span className={exceeded ? "text-alert font-medium" : ""}>
              {count}
            </span>{" "}
            / {limit.value}
          </span>
        </div>
      )}
      <div
        className={`flex-1 ${compact ? "h-1.5" : "h-2"} rounded overflow-hidden bg-rule/20`}
      >
        <div
          className={`h-full rounded transition-all ${
            exceeded
              ? "bg-alert"
              : nearFull
                ? "bg-marker"
                : "bg-stamp"
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
        {exceeded && (
          <div
            className="h-full bg-alert -mt-full rounded-r"
            style={{
              width: `${pct - 100}%`,
              marginTop: compact ? "-6px" : "-8px",
              marginLeft: "100%",
            }}
          />
        )}
      </div>
      {compact && (
        <span className="font-mono text-[11px] text-ink-muted shrink-0">
          <span className={exceeded ? "text-alert" : ""}>{count}</span> /{" "}
          {limit.value}
        </span>
      )}
    </div>
  );
}

// ─── EVIDENCE CARD ──────────────────────────────────────────────────

function EvidenceCard({ evidence }: { evidence: Evidence }) {
  return (
    <div className="p-3 border border-rule rounded bg-paper">
      <div className="flex items-start justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
          {evidence.origin === "user_context"
            ? "CONTEXTO PERSONAL"
            : "CONVOCATORIA"}{" "}
          · {evidence.section}
        </span>
        <span className="text-stamp font-mono text-xs font-bold">
          #{evidence.ref}
        </span>
      </div>
      <blockquote className="mt-2 pl-3 border-l-2 border-stamp/30 text-sm italic text-ink/80 leading-relaxed">
        &ldquo;{evidence.quote}&rdquo;
      </blockquote>
      {evidence.supportsCriterion && (
        <span className="inline-block mt-2 px-2 py-0.5 text-[11px] font-mono uppercase tracking-[0.08em] bg-stamp/10 text-stamp rounded">
          Criterio: {evidence.supportsCriterion}
        </span>
      )}
    </div>
  );
}

// ─── GAP CARD ───────────────────────────────────────────────────────

function GapCard({
  gap,
  onResolve,
}: {
  gap: Gap;
  onResolve: (input: string) => void;
}) {
  const [input, setInput] = useState("");

  return (
    <div className="p-3 border border-alert/30 rounded bg-alert/5">
      <div className="flex items-center gap-1.5 text-alert font-mono text-[11px] uppercase tracking-[0.08em]">
        <AlertTriangle className="size-3" />
        FALTA UN DATO
      </div>
      <p className="mt-2 text-sm">{gap.description}</p>
      {gap.improvement && (
        <p className="mt-1.5 text-xs text-stamp/80 bg-stamp/5 px-2 py-1.5 rounded border border-stamp/10">
          {gap.improvement}
        </p>
      )}
      <div className="mt-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ej: 10,000 usuarios activos"
          className="flex-1 px-2 py-1 text-sm border border-rule rounded"
        />
        <Button
          size="sm"
          disabled={!input.trim()}
          onClick={() => {
            onResolve(input.trim());
            setInput("");
          }}
        >
          Agregar
        </Button>
      </div>
      <button
        onClick={() => {
          onResolve(
            `Tengo disposición y capacidad para desarrollar esto. ${gap.description} es un área en la que estoy activamente aprendiendo y puedo adquirir rápidamente.`,
          );
        }}
        className="mt-2 w-full text-left px-2 py-1.5 text-xs text-stamp border border-stamp/30 rounded hover:bg-stamp/5 transition-colors"
      >
        💡 Puedo aprenderlo — generar respuesta proactiva
      </button>
    </div>
  );
}

// ─── QUESTION NAV ITEM ──────────────────────────────────────────────

function QuestionNavItem({
  question,
  answer,
  active,
  onClick,
}: {
  question: Question;
  answer: Answer | undefined;
  active: boolean;
  onClick: () => void;
}) {
  const status = answer?.status ?? "empty";
  return (
    <button
      onClick={onClick}
      aria-current={active ? "step" : undefined}
      className={`flex items-start gap-3 px-4 py-3 text-left transition-colors w-full ${
        active
          ? "bg-stamp/5 border-l-2 border-stamp"
          : "hover:bg-rule/10 border-l-2 border-transparent"
      }`}
    >
      <span
        className={`shrink-0 mt-0.5 font-mono text-sm font-bold ${
          active ? "text-stamp" : "text-ink-muted"
        }`}
      >
        {String(question.index).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <p className="text-sm truncate">{question.text}</p>
        <span
          className={`font-mono text-[11px] uppercase tracking-[0.08em] ${
            status === "approved"
              ? "text-confirm"
              : status === "generating"
                ? "text-stamp"
                : status === "over_limit"
                  ? "text-alert"
                  : "text-ink-muted"
          }`}
        >
          {status === "approved" && "✓ Aprobada"}
          {status === "generating" && "Generando..."}
          {status === "draft" && "En revisión"}
          {status === "over_limit" && "Excede límite"}
          {status === "empty" && "Pendiente"}
        </span>
      </div>
    </button>
  );
}

// ─── EXPORT MODAL (Phase 5 placeholder) ─────────────────────────────

function ExportModal({
  opp,
  onClose,
}: {
  opp: import("@/lib/types").Opportunity;
  onClose: () => void;
}) {
  const { questions, answers } = useDraft(
    useShallow((s) => ({ questions: s.questions, answers: s.answers })),
  );
  const [format, setFormat] = useState<"clipboard" | "markdown" | "text" | "json">("clipboard");
  const [includeAnalysis, setIncludeAnalysis] = useState(true);
  const [scope, setScope] = useState<"single" | "batch">("single");

  const approvedCount = Object.values(answers).filter(
    (a) => a.status === "approved",
  ).length;
  const gapCount = Object.values(answers).reduce(
    (acc, a) => acc + a.gaps.filter((g) => !g.resolved).length,
    0,
  );

  const handleExport = async () => {
    let content = "";

    if (format === "json") {
      const data = {
        opportunity: {
          title: opp.title,
          organizer: opp.organizer,
          fit: opp.fit.score,
        },
        questions: questions.map((q) => ({
          text: q.text,
          limit: q.limit,
          answer: answers[q.id]?.text ?? "",
          status: answers[q.id]?.status ?? "empty",
        })),
      };
      content = JSON.stringify(data, null, 2);
    } else {
      const lines: string[] = [];
      if (includeAnalysis) {
        lines.push(`# ${opp.title}`);
        lines.push(
          `${opp.organizer ?? ""} · Encaje: ${opp.fit.score}%`,
        );
        lines.push("");
      }
      lines.push("## Respuestas\n");
      for (const q of questions) {
        const a = answers[q.id];
        lines.push(`### ${q.index}. ${q.text}`);
        if (q.limit) {
          lines.push(
            `Límite: ${q.limit.value} ${q.limit.unit === "characters" ? "caracteres" : "palabras"}`,
          );
        }
        lines.push("");
        lines.push(a?.text ?? "(sin respuesta)");
        lines.push("\n---\n");
      }
      content = lines.join("\n");
    }

    if (format === "clipboard") {
      await navigator.clipboard.writeText(content);
    } else {
      const ext = format === "markdown" ? "md" : format;
      const mime =
        format === "json" ? "application/json" : "text/plain";
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${opp.title.toLowerCase().replace(/\s+/g, "-")}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    }

    useSession.getState().setHasUnexportedWork(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40">
      <div className="bg-surface rounded border border-rule p-6 w-full max-w-lg mx-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">
              Llévate tu trabajo
            </h2>
            <p className="text-sm text-alert mt-1">
              Al cerrar la pestaña se borra todo. Descarga antes de salir.
            </p>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            ✕
          </button>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 divide-x divide-rule border border-rule rounded">
          <div className="p-3 text-center">
            <p className="font-display text-2xl font-bold">
              {questions.length}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
              RESPUESTAS
            </p>
          </div>
          <div className="p-3 text-center">
            <p className="font-display text-2xl font-bold">{approvedCount}</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
              APROBADAS
            </p>
          </div>
          <div className="p-3 text-center">
            <p
              className={`font-display text-2xl font-bold ${gapCount > 0 ? "text-alert" : ""}`}
            >
              {gapCount}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
              CON DATOS FALTANTES
            </p>
          </div>
        </div>

        {gapCount > 0 && (
          <div className="mt-3 p-3 bg-alert/8 border border-alert/30 rounded flex items-center gap-2">
            <AlertTriangle className="size-4 text-alert shrink-0" />
            <p className="text-sm text-alert">
              {gapCount} respuestas tienen datos pendientes. Revísalas antes de
              enviar.
            </p>
          </div>
        )}

        {/* Format */}
        <div className="mt-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted mb-2">
            FORMATO
          </p>
          <div className="space-y-1 border border-rule rounded overflow-hidden">
            {(
              [
                ["clipboard", "Copiar todo al portapapeles", "Ideal para pegar directo en formularios"],
                ["markdown", "Descargar como Markdown (.md)", "Preserva formato y estructura técnica"],
                ["text", "Descargar como texto plano (.txt)", "Sin formato, máxima compatibilidad"],
                ["json", "Descargar como JSON (.json)", "Para integración con otras herramientas"],
              ] as const
            ).map(([value, label, desc]) => (
              <label
                key={value}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  format === value ? "bg-stamp/5" : "hover:bg-rule/10"
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value={value}
                  checked={format === value}
                  onChange={() => setFormat(value)}
                  className="accent-stamp"
                />
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-ink-muted">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Include analysis toggle */}
        <label className="mt-4 flex items-center justify-between p-3 border border-rule rounded cursor-pointer">
          <span className="text-sm">
            Incluir preguntas, límites y análisis de la convocatoria
          </span>
          <input
            type="checkbox"
            checked={includeAnalysis}
            onChange={(e) => setIncludeAnalysis(e.target.checked)}
            className="accent-stamp"
          />
        </label>

        <Button className="w-full mt-4" onClick={handleExport}>
          {format === "clipboard" ? "COPIAR" : "DESCARGAR"}
        </Button>
      </div>
    </div>
  );
}

// ─── SHELL ──────────────────────────────────────────────────────────

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
