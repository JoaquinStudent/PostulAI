import type { AnswerScore } from "@/lib/types";

const ACTION_VERBS = /\b(lider[éeao]|desarroll[éeao]|implement[éeao]|cre[éeao]|logr[éeao]|reduj[eio]|aument[éeao]|mejor[éeao]|diseñ[éeao]|gestion[éeao]|coordin[éeao]|resolv[íi]|automatiz[éeao]|optimiz[éeao]|construi[íi]|fundé|lanc[éeao]|integr[éeao]|led|built|developed|created|achieved|reduced|increased|designed|managed|launched)\b/gi;

const RESULT_MARKERS = /\b(\d+[%xX]|\d+\s*(?:usuarios|clientes|personas|proyectos|equipos|meses|años|horas|veces|users|clients|people)|\$\d|USD\s*\d|ahorro|crecimiento|impacto|resultado|growth|impact|result)\b/gi;

const STAR_SIGNALS = /\b(porque|debido a|el reto era|el problema|para resolver|como resultado|esto permitió|gracias a esto|el resultado|because|the challenge|as a result|this allowed|in order to)\b/gi;

export function scoreAnswer(
  text: string,
  criteriaNames: string[],
): AnswerScore {
  if (!text.trim()) return { keywords: 0, impact: 0, narrative: 0 };

  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words < 5) return { keywords: 0, impact: 0, narrative: 0 };

  // Keywords: how many criteria keywords appear in the answer
  const criteriaHits = criteriaNames.filter((c) => {
    const kws = c.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    return kws.some((kw) => lower.includes(kw));
  }).length;
  const keywords = criteriaNames.length > 0
    ? Math.min(Math.round((criteriaHits / criteriaNames.length) * 100), 100)
    : 50;

  // Impact: action verbs + measurable results
  const actionCount = (text.match(ACTION_VERBS) || []).length;
  const resultCount = (text.match(RESULT_MARKERS) || []).length;
  const impact = Math.min(
    Math.round(((actionCount * 15) + (resultCount * 25)) * (100 / Math.max(words, 50))),
    100,
  );

  // Narrative: STAR structure signals
  const starCount = (text.match(STAR_SIGNALS) || []).length;
  const hasSentenceFlow = text.includes(".") && words > 20;
  const narrative = Math.min(
    Math.round((starCount * 20) + (hasSentenceFlow ? 20 : 0)),
    100,
  );

  return { keywords, impact, narrative };
}
