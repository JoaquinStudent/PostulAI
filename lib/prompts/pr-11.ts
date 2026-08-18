import type { OpportunityBrief, OpportunityCategory } from "@/lib/types";
import type { ChatMessage } from "@/lib/ai/client";
import { getCompactSkill } from "./sector-skills";

export const PR_11_VERSION = 1;

function buildSystemMessage(cat: OpportunityCategory): string {
  const skill = getCompactSkill(cat);

  return `Eres un entrevistador experto evaluando candidatos para "${cat}".

Perspectiva real del evaluador:
${skill.perspective}

Criterios de evaluación: ${skill.criteria}

Evalúa la respuesta del candidato a la pregunta de entrevista. Sé constructivo pero directo.

Devuelve ÚNICAMENTE JSON válido:
{
  "score": 0-100,
  "strengths": ["qué hizo bien (1-3 puntos)"],
  "improvements": ["qué mejorar con ejemplo concreto (1-3 puntos)"],
  "modelAnswer": "Ejemplo breve de cómo respondería un candidato fuerte (2-3 oraciones max)"
}`;
}

export function buildPR11Messages(opts: {
  context: string;
  brief: OpportunityBrief;
  question: string;
  answer: string;
  category?: OpportunityCategory;
}): ChatMessage[] {
  const cat = opts.category ?? "otro";

  const user = `<contexto_candidato>
${opts.context}
</contexto_candidato>

<convocatoria>
Buscan: ${opts.brief.seeking}
Criterios: ${opts.brief.criteria.map((c) => `${c.name}: ${c.description}`).join(" | ")}
</convocatoria>

<pregunta_entrevista>
${opts.question}
</pregunta_entrevista>

<respuesta_candidato>
${opts.answer}
</respuesta_candidato>`;

  return [
    { role: "system", content: buildSystemMessage(cat) },
    { role: "user", content: user },
  ];
}

function stripFences(raw: string): string {
  const match = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  return match ? match[1].trim() : raw.trim();
}

export interface InterviewFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
}

export function parsePR11Response(json: string): InterviewFeedback {
  const parsed = JSON.parse(stripFences(json));
  return {
    score: typeof parsed.score === "number" ? parsed.score : 50,
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    modelAnswer: typeof parsed.modelAnswer === "string" ? parsed.modelAnswer : "",
  };
}
