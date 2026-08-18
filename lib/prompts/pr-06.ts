import type { OpportunityBrief, OpportunityCategory } from "@/lib/types";
import type { ChatMessage } from "@/lib/ai/client";
import { getCompactSkill } from "./sector-skills";

export const PR_06_VERSION = 4;

// System message is identical across calls for the same category — cacheable
function buildSystemMessage(cat: OpportunityCategory): string {
  const skill = getCompactSkill(cat);

  return `Eres un redactor experto de postulaciones para el sector "${cat}".

Perspectiva del evaluador:
${skill.perspective}

Estrategia:
${skill.strategy}

Criterios: ${skill.criteria}

Señales de alerta (evitar): ${skill.redFlags.join("; ")}

Keywords del sector: ${skill.keywords.join(", ")}

Reglas estrictas:
1. Toda afirmación fáctica proviene del contexto y se registra en evidence con cita literal. NO incluyas números volados, notas al pie ni guiones largos decorativos. Texto limpio para pegar en formulario.
2. Dato ausente → [GAP: descripción] en texto + declarar en gaps con recomendación de mejora concreta. NUNCA inventar.
3. La respuesta debe caber en el límite indicado (apunta al 90-95%).
4. Alinea a criterios de mayor peso, evita señales de alerta.
5. Tono de la convocatoria, no genérico.
6. No repitas contenido de respuestas ya aprobadas.
7. Primera persona.
8. Prohibido relleno: nada de "estoy muy emocionado" ni fórmulas vacías.
9. Estructura STAR para cada logro: Situación → Acción → Resultado medible. Términos técnicos con por qué y para qué.
10. Mentalidad de solución: si falta algo, sugiere en gaps cómo abordarlo.
11. Storytelling con pitch: abre con lo más impactante, cierra con visión/compromiso.

Devuelve ÚNICAMENTE JSON válido (sin markdown, sin preámbulo):
{
  "text": "Respuesta completa limpia. [GAP: descripción] para datos faltantes.",
  "evidence": [{ "ref": 1, "origin": "user_context", "section": "SECCIÓN", "quote": "Cita LITERAL", "supportsCriterion": "Criterio" | null }],
  "gaps": [{ "id": "gap_1", "description": "Qué falta", "placeholder": "[GAP: descripción]", "improvement": "Recomendación concreta: curso, certificación, experiencia, con plataforma y tiempo" }]
}`;
}

export function buildPR06Messages(opts: {
  context: string;
  brief: OpportunityBrief;
  question: string;
  limit: { value: number; unit: "characters" | "words" } | null;
  approvedAnswers: string[];
  language: string;
  category?: OpportunityCategory;
}): ChatMessage[] {
  const cat = opts.category ?? "otro";

  const limitLine = opts.limit
    ? `Límite: ${opts.limit.value} ${opts.limit.unit === "characters" ? "caracteres" : "palabras"}. Apunta a ${Math.round(opts.limit.value * 0.92)}.`
    : "Sin límite declarado. Sé conciso pero completo.";

  const approvedBlock =
    opts.approvedAnswers.length > 0
      ? `\nRespuestas ya aprobadas (no repetir):\n${opts.approvedAnswers.map((a, i) => `${i + 1}. ${a.slice(0, 200)}${a.length > 200 ? "..." : ""}`).join("\n")}`
      : "";

  const langLine =
    opts.language === "en"
      ? "Write the answer in English."
      : opts.language === "pt"
        ? "Escreva a resposta em português."
        : "Escribe la respuesta en español.";

  const user = `<contexto_usuario>
${opts.context}
</contexto_usuario>

<convocatoria>
Buscan: ${opts.brief.seeking}
Criterios: ${opts.brief.criteria.map((c) => `${c.name}${c.weight != null ? ` (${c.weight}%)` : ""}: ${c.description}`).join(" | ")}
Tono: ${opts.brief.tone.join(", ") || "No especificado"}
</convocatoria>
${approvedBlock}
<pregunta>
${opts.question}
</pregunta>

${limitLine}
${langLine}`;

  return [
    { role: "system", content: buildSystemMessage(cat) },
    { role: "user", content: user },
  ];
}

// Legacy single-string API
export function buildPR06Prompt(opts: {
  context: string;
  brief: OpportunityBrief;
  question: string;
  limit: { value: number; unit: "characters" | "words" } | null;
  approvedAnswers: string[];
  language: string;
  category?: OpportunityCategory;
}): string {
  const msgs = buildPR06Messages(opts);
  return msgs.map((m) => m.content).join("\n\n");
}

function stripFences(raw: string): string {
  const match = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  return match ? match[1].trim() : raw.trim();
}

export function cleanText(text: string): string {
  return text
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, "")
    .replace(/\s*—\s*/g, ", ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function parsePR06Response(json: string): {
  text: string;
  evidence: {
    ref: number;
    origin: "user_context" | "opportunity";
    section: string;
    quote: string;
    supportsCriterion: string | null;
  }[];
  gaps: {
    id: string;
    description: string;
    placeholder: string;
  }[];
} {
  const parsed = JSON.parse(stripFences(json));
  if (typeof parsed.text !== "string" || !parsed.text) {
    throw new Error("parse: respuesta sin texto");
  }
  parsed.text = cleanText(parsed.text);
  if (!Array.isArray(parsed.evidence)) parsed.evidence = [];
  if (!Array.isArray(parsed.gaps)) parsed.gaps = [];

  parsed.evidence = parsed.evidence.filter(
    (e: Record<string, unknown>) =>
      typeof e.ref === "number" && typeof e.quote === "string",
  );

  parsed.gaps = parsed.gaps.map((g: Record<string, unknown>, i: number) => ({
    id: typeof g.id === "string" ? g.id : `gap_${i + 1}`,
    description: typeof g.description === "string" ? g.description : "",
    placeholder: typeof g.placeholder === "string" ? g.placeholder : `[GAP: ${g.description}]`,
    improvement: typeof g.improvement === "string" ? g.improvement : null,
  }));

  return parsed;
}
