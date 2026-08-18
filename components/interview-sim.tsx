"use client";

import { useState } from "react";
import { ChevronDown, Loader2, CheckCircle2, AlertTriangle, Lightbulb, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { complete } from "@/lib/ai/client";
import { safeguardModel } from "@/lib/ai/models";
import { windowContext } from "@/lib/ai/context-window";
import { buildPR11Messages, parsePR11Response, type InterviewFeedback } from "@/lib/prompts/pr-11";
import { getCompactSkill } from "@/lib/prompts/sector-skills";
import type { InterviewTip } from "@/lib/prompts/sector-skills";
import type { OpportunityBrief, OpportunityCategory } from "@/lib/types";

interface Props {
  tips: InterviewTip[];
  brief: OpportunityBrief;
  contextRaw: string;
  category: OpportunityCategory;
  model: string;
}

interface QuestionState {
  answer: string;
  feedback: InterviewFeedback | null;
  loading: boolean;
  error: string | null;
  showAdvice: boolean;
}

export function InterviewSim({ tips, brief, contextRaw, category, model }: Props) {
  const t = useT();
  const [states, setStates] = useState<Record<number, QuestionState>>({});

  const getState = (i: number): QuestionState =>
    states[i] ?? { answer: "", feedback: null, loading: false, error: null, showAdvice: false };

  const update = (i: number, patch: Partial<QuestionState>) =>
    setStates((prev) => ({ ...prev, [i]: { ...getState(i), ...patch } }));

  const handleEvaluate = async (i: number, topic: string) => {
    const st = getState(i);
    if (!st.answer.trim()) return;
    update(i, { loading: true, error: null });
    try {
      const skill = getCompactSkill(category);
      const windowed = windowContext(contextRaw, topic, brief, skill.keywords, 1500);
      const messages = buildPR11Messages({
        context: windowed,
        brief,
        question: topic,
        answer: st.answer,
        category,
      });
      const response = await complete({ model: safeguardModel(model), messages, temperature: 0.3 });
      update(i, { feedback: parsePR11Response(response), loading: false });
    } catch (err) {
      update(i, { error: err instanceof Error ? err.message : "Error", loading: false });
    }
  };

  return (
    <div className="space-y-3">
      {tips.map((tip, i) => {
        const st = getState(i);
        return (
          <div key={i} className="bg-surface border border-rule/40 rounded-xl overflow-hidden">
            {/* Question header */}
            <div className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-stamp/10 text-stamp text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium">{tip.topic}</p>
                </div>
                {st.feedback && (
                  <span className={`shrink-0 text-xs font-mono font-bold ${st.feedback.score >= 70 ? "text-confirm" : st.feedback.score >= 40 ? "text-marker" : "text-alert"}`}>
                    {st.feedback.score}/100
                  </span>
                )}
              </div>

              {/* Advice toggle */}
              <button
                onClick={() => update(i, { showAdvice: !st.showAdvice })}
                className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted hover:text-stamp transition-colors"
              >
                <Lightbulb className="size-3" />
                {t("Ver consejo")}
                <ChevronDown className={`size-3 transition-transform ${st.showAdvice ? "rotate-180" : ""}`} />
              </button>
              {st.showAdvice && (
                <p className="mt-2 text-xs text-ink-muted bg-stamp/5 rounded-lg px-3 py-2">
                  {tip.advice}
                </p>
              )}
            </div>

            {/* Answer area */}
            <div className="px-5 pb-4 space-y-3">
              <textarea
                value={st.answer}
                onChange={(e) => update(i, { answer: e.target.value, feedback: null })}
                placeholder={t("Escribe tu respuesta para practicar...")}
                rows={3}
                className="w-full px-3 py-2.5 bg-paper border border-rule/40 rounded-lg text-sm resize-none focus:outline-none focus:border-stamp/50 transition-colors"
              />

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!st.answer.trim() || st.loading}
                  onClick={() => handleEvaluate(i, tip.topic)}
                  className="gap-1.5"
                >
                  {st.loading ? (
                    <><Loader2 className="size-3.5 animate-spin" />{t("Evaluando...")}</>
                  ) : (
                    <><Send className="size-3.5" />{t("Evaluar con IA")} (~$0.001)</>
                  )}
                </Button>
                {st.error && <span className="text-xs text-alert">{st.error}</span>}
              </div>

              {/* Feedback */}
              {st.feedback && (
                <div className="space-y-2 pt-2 border-t border-rule/30">
                  {st.feedback.strengths.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-confirm flex items-center gap-1 mb-1">
                        <CheckCircle2 className="size-3" /> {t("Fortalezas")}
                      </span>
                      <ul className="space-y-1">
                        {st.feedback.strengths.map((s, j) => (
                          <li key={j} className="text-xs text-ink-muted pl-4">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {st.feedback.improvements.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-marker flex items-center gap-1 mb-1">
                        <AlertTriangle className="size-3" /> {t("A mejorar")}
                      </span>
                      <ul className="space-y-1">
                        {st.feedback.improvements.map((s, j) => (
                          <li key={j} className="text-xs text-ink-muted pl-4">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {st.feedback.modelAnswer && (
                    <div>
                      <span className="text-xs font-medium text-stamp mb-1 block">{t("Respuesta modelo")}</span>
                      <p className="text-xs text-ink-muted bg-stamp/5 rounded-lg px-3 py-2 italic">
                        {st.feedback.modelAnswer}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
