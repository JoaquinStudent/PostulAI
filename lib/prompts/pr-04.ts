import type { OpportunityBrief, OpportunityCategory } from "@/lib/types";
import type { ChatMessage } from "@/lib/ai/client";
import { getCompactSkill } from "./sector-skills";

export const PR_04_VERSION = 3;

export function buildPR04Messages(
  brief: OpportunityBrief,
  contextRaw: string,
  category?: OpportunityCategory,
): ChatMessage[] {
  const cat = category ?? "otro";
  const skill = getCompactSkill(cat);

  const system = `Eres un evaluador de encaje profesional tipo ATS para el sector "${cat}".

Perspectiva del evaluador:
${skill.perspective}

Criterios de ponderación: ${skill.criteria}

Señales de alerta: ${skill.redFlags.map((f) => `- ${f}`).join("\n")}

Reglas:
- Cada fortaleza DEBE incluir cita LITERAL del contexto en "evidence". Sin cita no es fortaleza.
- Las carencias expresan lo que falta respecto a la convocatoria.
- Cada carencia DEBE incluir "improvement" con recomendación accionable y específica:
  * Nombre exacto de curso/certificación (ej: "AWS Cloud Practitioner en Coursera, ~40h")
  * Experiencia sugerida (ej: "Crea un proyecto open source con React + Node.js")
  * Habilidad a desarrollar con recurso concreto (ej: "Practica data storytelling con el curso de Cole Nussbaumer en LinkedIn Learning")
  * Tiempo estimado para cerrar el gap
- "blocking" es true SOLO si se incumple elegibilidad dura y explícita (nacionalidad, edad, etc.).
- "keywordMatch" simula ATS: % de keywords del sector encontradas en el contexto.
- Score conservador: >80 solo para coincidencias fuertes. Si confianza es "low", max 60.
- No inventes fortalezas.

Devuelve ÚNICAMENTE JSON válido (sin markdown):
{
  "score": 72,
  "strengths": [{ "claim": "Qué coincide", "evidence": "Cita LITERAL del contexto" }],
  "gaps": [{ "claim": "Qué falta", "evidence": null, "improvement": "Certificación X en plataforma Y (~Nh). Alternativa: proyecto Z para demostrar la habilidad." }],
  "blocking": false,
  "keywordMatch": 65
}`;

  const user = `Keywords del sector: ${skill.keywords.join(", ")}

<contexto_usuario>
${contextRaw}
</contexto_usuario>

<convocatoria>
Buscan: ${brief.seeking}
Criterios: ${brief.criteria.map((c) => `- ${c.name}${c.weight != null ? ` (${c.weight}%)` : ""}: ${c.description}`).join("\n")}
Elegibilidad: ${brief.eligibility.length > 0 ? brief.eligibility.join(", ") : "No especificada"}
Señales de alerta: ${brief.redFlags.length > 0 ? brief.redFlags.join(", ") : "Ninguna"}
Tono: ${brief.tone.join(", ") || "No especificado"}
Confianza: ${brief.confidence}
</convocatoria>`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

// Legacy single-string API for backward compat
export function buildPR04Prompt(
  brief: OpportunityBrief,
  contextRaw: string,
  category?: OpportunityCategory,
): string {
  const msgs = buildPR04Messages(brief, contextRaw, category);
  return msgs.map((m) => m.content).join("\n\n");
}

function stripFences(raw: string): string {
  const match = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  return match ? match[1].trim() : raw.trim();
}

export function parsePR04Response(json: string): import("@/lib/types").FitAssessment {
  const parsed = JSON.parse(stripFences(json));
  if (typeof parsed.score !== "number" || !Array.isArray(parsed.strengths)) {
    throw new Error("Respuesta de evaluación incompleta");
  }
  parsed.score = Math.max(0, Math.min(100, Math.round(parsed.score)));
  if (!Array.isArray(parsed.gaps)) parsed.gaps = [];
  if (typeof parsed.blocking !== "boolean") parsed.blocking = false;
  parsed.keywordMatch = typeof parsed.keywordMatch === "number"
    ? Math.max(0, Math.min(100, Math.round(parsed.keywordMatch)))
    : null;
  parsed.strengths = parsed.strengths.map((s: Record<string, unknown>) => ({
    ...s,
    improvement: typeof s.improvement === "string" ? s.improvement : null,
  }));
  parsed.gaps = parsed.gaps.map((g: Record<string, unknown>) => ({
    ...g,
    improvement: typeof g.improvement === "string" ? g.improvement : null,
  }));
  return parsed;
}
