import type { OpportunityBrief, OpportunityCategory } from "@/lib/types";
import type { ChatMessage } from "@/lib/ai/client";
import { getCompactSkill } from "./sector-skills";

export const PR_10_VERSION = 1;

const LETTER_TYPE: Record<OpportunityCategory, { type: string; structure: string }> = {
  empleo: {
    type: "carta de presentación formal",
    structure: "3-4 párrafos: gancho con logro relevante → experiencia alineada a criterios → cierre con propuesta de valor",
  },
  beca: {
    type: "carta de motivación académica",
    structure: "3-4 párrafos: por qué esta beca → trayectoria y evidencia → impacto futuro y compromiso",
  },
  hackathon: {
    type: "pitch escrito del equipo/candidato",
    structure: "2-3 párrafos: problema que resuelves → stack y experiencia → qué construirás y por qué ganas",
  },
  aceleradora: {
    type: "pitch de aplicación",
    structure: "3 párrafos: tracción/problema → equipo y diferencial → qué harás con la aceleración",
  },
  evento: {
    type: "propuesta de participación",
    structure: "2-3 párrafos: tema y relevancia → credenciales del ponente → qué se llevan los asistentes",
  },
  voluntariado: {
    type: "carta de motivación",
    structure: "2-3 párrafos: conexión personal con la causa → habilidades que aportas → disponibilidad y compromiso",
  },
  otro: {
    type: "carta de presentación adaptable",
    structure: "3 párrafos: gancho relevante → evidencia de encaje → cierre con propuesta de valor",
  },
};

function buildSystemMessage(cat: OpportunityCategory): string {
  const skill = getCompactSkill(cat);
  const lt = LETTER_TYPE[cat];

  return `Eres un redactor experto de ${lt.type} para el sector "${cat}".

Perspectiva del evaluador:
${skill.perspective}

Estrategia:
${skill.strategy}

Keywords del sector: ${skill.keywords.join(", ")}

Estructura esperada: ${lt.structure}

Reglas:
1. Toda afirmación fáctica cita evidencia del contexto. Registrar en evidence.
2. Dato ausente → [GAP: descripción] + declarar en gaps. NUNCA inventar.
3. Primera persona. Tono de la convocatoria, no genérico.
4. Prohibido relleno: nada de "estoy muy emocionado" ni fórmulas vacías.
5. Cada logro en formato STAR comprimido: Situación → Acción → Resultado medible.
6. Abre con lo más impactante, cierra con visión/compromiso.
7. Extensión: 250-400 palabras (salvo que el usuario pida otro largo).

Devuelve ÚNICAMENTE JSON válido (sin markdown, sin preámbulo):
{
  "text": "Carta completa. [GAP: descripción] para datos faltantes.",
  "evidence": [{ "ref": 1, "origin": "user_context", "section": "SECCIÓN", "quote": "Cita LITERAL", "supportsCriterion": "Criterio" | null }],
  "gaps": [{ "id": "gap_1", "description": "Qué falta", "placeholder": "[GAP: descripción]", "improvement": "Recomendación concreta" }]
}`;
}

export function buildPR10Messages(opts: {
  context: string;
  brief: OpportunityBrief;
  title: string;
  organizer: string | null;
  language: string;
  category?: OpportunityCategory;
}): ChatMessage[] {
  const cat = opts.category ?? "otro";

  const langLine =
    opts.language === "en"
      ? "Write the letter in English."
      : opts.language === "pt"
        ? "Escreva a carta em português."
        : "Escribe la carta en español.";

  const user = `<contexto_usuario>
${opts.context}
</contexto_usuario>

<convocatoria>
Título: ${opts.title}
${opts.organizer ? `Organizador: ${opts.organizer}` : ""}
Buscan: ${opts.brief.seeking}
Criterios: ${opts.brief.criteria.map((c) => `${c.name}${c.weight != null ? ` (${c.weight}%)` : ""}: ${c.description}`).join(" | ")}
Tono: ${opts.brief.tone.join(", ") || "No especificado"}
</convocatoria>

Genera una ${LETTER_TYPE[cat].type} personalizada para esta convocatoria.
${langLine}`;

  return [
    { role: "system", content: buildSystemMessage(cat) },
    { role: "user", content: user },
  ];
}

function stripFences(raw: string): string {
  const match = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  return match ? match[1].trim() : raw.trim();
}

export function parsePR10Response(json: string): {
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
    improvement?: string | null;
  }[];
} {
  const parsed = JSON.parse(stripFences(json));
  if (typeof parsed.text !== "string" || !parsed.text) {
    throw new Error("parse: carta sin texto");
  }
  // ponytail: same cleanup as PR-06
  parsed.text = parsed.text
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, "")
    .replace(/\s*—\s*/g, ", ")
    .replace(/\s{2,}/g, " ")
    .trim();
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
