import type { ChatMessage } from "@/lib/ai/client";
import { cleanText } from "./pr-06";

export const PR_07_VERSION = 2;

export type RefineAction = "shorten" | "lengthen" | "concrete" | "regenerate";

const ACTION_INSTRUCTIONS: Record<RefineAction, { instruction: string; rule: string }> = {
  shorten: {
    instruction: "Reduce la respuesta preservando las afirmaciones con evidencia.",
    rule: "Se eliminan primero conectores y adjetivos, NUNCA datos ni evidencia. Cada cita referenciada debe mantenerse.",
  },
  lengthen: {
    instruction: "Expande la respuesta con más detalle del contexto del usuario, no con adorno.",
    rule: "Si no hay material adicional real en el contexto, decláralo en vez de inflar con frases vacías. Cada adición debe estar respaldada por evidencia o abrir un [GAP].",
  },
  concrete: {
    instruction: "Sustituye generalidades por hechos y cifras concretas del contexto del usuario.",
    rule: "Si la cifra o dato no existe en el contexto, abre un [GAP] en vez de inventar. Cada número mencionado debe tener su evidencia.",
  },
  regenerate: {
    instruction: "Genera un nuevo enfoque desde cero para la misma pregunta.",
    rule: "Debe diferir en ESTRUCTURA (organización, ángulo, énfasis), no ser una reformulación del mismo contenido en otras palabras.",
  },
};

// ponytail: shorten/concrete don't need full context — saves ~2-5K tokens
const NEEDS_CONTEXT: Record<RefineAction, boolean> = {
  shorten: false,
  lengthen: true,
  concrete: true,
  regenerate: true,
};

const SYSTEM_PROMPT = `Eres un editor experto de postulaciones. Refina respuestas existentes.

Devuelve ÚNICAMENTE JSON válido (sin markdown):
{
  "text": "Respuesta refinada limpia, sin números volados ni guiones largos decorativos",
  "evidence": [{ "ref": 1, "origin": "user_context", "section": "SECCIÓN", "quote": "Cita literal", "supportsCriterion": null }],
  "gaps": [{ "id": "gap_1", "description": "Dato faltante", "placeholder": "[GAP: descripción]" }]
}`;

export function buildPR07Messages(opts: {
  currentText: string;
  evidence: { ref: number; quote: string }[];
  action: RefineAction;
  question: string;
  limit: { value: number; unit: "characters" | "words" } | null;
  context: string;
}): ChatMessage[] {
  const { instruction, rule } = ACTION_INSTRUCTIONS[opts.action];
  const limitLine = opts.limit
    ? `Límite: ${opts.limit.value} ${opts.limit.unit === "characters" ? "caracteres" : "palabras"}. Apunta al 90-95%.`
    : "Sin límite declarado.";

  const contextBlock = NEEDS_CONTEXT[opts.action]
    ? `<contexto_usuario>\n${opts.context}\n</contexto_usuario>\n\n`
    : "";

  const user = `${contextBlock}<pregunta>
${opts.question}
</pregunta>

<respuesta_actual>
${opts.currentText}
</respuesta_actual>

<evidencia_actual>
${opts.evidence.map((e) => `[${e.ref}] "${e.quote}"`).join("\n")}
</evidencia_actual>

${limitLine}

INSTRUCCIÓN: ${instruction}
REGLA DURA: ${rule}`;

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: user },
  ];
}

export function buildPR07Prompt(opts: {
  currentText: string;
  evidence: { ref: number; quote: string }[];
  action: RefineAction;
  question: string;
  limit: { value: number; unit: "characters" | "words" } | null;
  context: string;
}): string {
  const msgs = buildPR07Messages(opts);
  return msgs.map((m) => m.content).join("\n\n");
}

function stripFences(raw: string): string {
  const match = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  return match ? match[1].trim() : raw.trim();
}

export function parsePR07Response(json: string): {
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
    throw new Error("parse: refinamiento sin texto");
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
    placeholder: typeof g.placeholder === "string" ? g.placeholder : `[GAP]`,
  }));

  return parsed;
}
