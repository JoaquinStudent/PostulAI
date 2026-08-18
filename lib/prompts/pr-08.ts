import { cleanText } from "./pr-06";

export const PR_08_VERSION = 1;

export function buildPR08Prompt(opts: {
  currentText: string;
  evidence: { ref: number; quote: string }[];
  gap: { description: string; placeholder: string };
  userInput: string;
  limit: { value: number; unit: "characters" | "words" } | null;
}): string {
  const limitLine = opts.limit
    ? `Límite: ${opts.limit.value} ${opts.limit.unit === "characters" ? "caracteres" : "palabras"}. No excedas el límite.`
    : "";

  return `Eres un editor de postulaciones. Tu tarea es integrar un dato que faltaba en una respuesta existente.

<respuesta_actual>
${opts.currentText}
</respuesta_actual>

<evidencia_actual>
${opts.evidence.map((e) => `[${e.ref}] "${e.quote}"`).join("\n")}
</evidencia_actual>

<dato_faltante>
Descripción: ${opts.gap.description}
Marcador en el texto: ${opts.gap.placeholder}
Dato aportado por el usuario: ${opts.userInput}
</dato_faltante>

${limitLine}

Integra el dato de forma natural en el texto, reemplazando el marcador ${opts.gap.placeholder}. NO reescribas el resto de la respuesta — cambia solo lo necesario para incorporar el dato.

El dato aportado se suma como nueva evidencia con origen "user_context".

Devuelve ÚNICAMENTE un JSON válido (sin markdown, sin preámbulo):

{
  "text": "Respuesta con el dato integrado naturalmente",
  "evidence": [
    { "ref": 1, "origin": "user_context", "section": "SECCIÓN", "quote": "Cita literal", "supportsCriterion": null }
  ],
  "gaps": []
}

El array gaps debe contener solo los gaps que NO se resolvieron (si había otros). El gap que se acaba de resolver NO debe aparecer.`;
}

function stripFences(raw: string): string {
  const match = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  return match ? match[1].trim() : raw.trim();
}

export function parsePR08Response(json: string): {
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
    throw new Error("parse: integración sin texto");
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
