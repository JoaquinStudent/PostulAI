import type { OpportunityBrief } from "@/lib/types";

export const PR_04_VERSION = 1;

export function buildPR04Prompt(
  brief: OpportunityBrief,
  contextRaw: string,
): string {
  return `Eres un evaluador de encaje entre un perfil profesional y una convocatoria. Tu tarea es comparar el contexto del usuario con lo que pide la convocatoria y devolver una evaluación honesta.

<contexto_usuario>
${contextRaw}
</contexto_usuario>

<convocatoria>
Buscan: ${brief.seeking}

Criterios de evaluación:
${brief.criteria.map((c) => `- ${c.name}${c.weight != null ? ` (${c.weight}%)` : ""}: ${c.description}`).join("\n")}

Requisitos de elegibilidad:
${brief.eligibility.length > 0 ? brief.eligibility.map((e) => `- ${e}`).join("\n") : "No especificados"}

Señales de alerta:
${brief.redFlags.length > 0 ? brief.redFlags.map((r) => `- ${r}`).join("\n") : "Ninguna especificada"}

Tono esperado: ${brief.tone.join(", ") || "No especificado"}
Confianza en los datos de la convocatoria: ${brief.confidence}
</convocatoria>

Devuelve ÚNICAMENTE un JSON válido (sin markdown, sin preámbulo) con esta estructura:

{
  "score": 72,
  "strengths": [
    { "claim": "Qué coincide", "evidence": "Cita LITERAL del contexto del usuario que lo demuestra" }
  ],
  "gaps": [
    { "claim": "Qué falta respecto a lo que pide la convocatoria", "evidence": null }
  ],
  "blocking": false
}

Reglas estrictas:
- Cada fortaleza DEBE incluir una cita LITERAL del contexto del usuario en "evidence". Sin cita, no se incluye como fortaleza.
- Las carencias se expresan como lo que falta respecto a lo que pide la convocatoria. No son juicios sobre la persona.
- "blocking" es true ÚNICAMENTE cuando se incumple un requisito de elegibilidad duro y explícito (nacionalidad, edad, situación académica, etapa de empresa). Nunca por preferencias.
- El puntaje debe ser conservador: reserva el rango >80 para coincidencias reales y fuertes. Un sistema que dice sí a todo no ahorra tiempo.
- Si la confianza en los datos es "low", el puntaje NO debe superar 60.
- No inventes fortalezas: si el contexto no tiene algo relevante, es una carencia.`;
}

export function parsePR04Response(json: string): import("@/lib/types").FitAssessment {
  const parsed = JSON.parse(json);
  if (typeof parsed.score !== "number" || !Array.isArray(parsed.strengths)) {
    throw new Error("Respuesta de evaluación incompleta");
  }
  parsed.score = Math.max(0, Math.min(100, Math.round(parsed.score)));
  if (!Array.isArray(parsed.gaps)) parsed.gaps = [];
  if (typeof parsed.blocking !== "boolean") parsed.blocking = false;
  return parsed;
}
