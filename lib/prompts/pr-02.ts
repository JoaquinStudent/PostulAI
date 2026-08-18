import type { ContextSummary } from "@/lib/types";

export const PR_02_VERSION = 1;

export function buildPR02Prompt(contextRaw: string): string {
  return `Eres un analizador de contexto profesional. Tu tarea es leer el documento de contexto de un usuario y devolver un resumen estructurado en JSON estricto.

<contexto_usuario>
${contextRaw}
</contexto_usuario>

Devuelve ÚNICAMENTE un JSON válido (sin markdown, sin preámbulo) con esta estructura exacta:

{
  "profile": "Una frase describiendo el perfil general del usuario",
  "sections": [
    {
      "key": "profile",
      "label": "Perfil",
      "itemCount": 1,
      "preview": "Resumen breve de la sección"
    },
    {
      "key": "projects",
      "label": "Proyectos",
      "itemCount": <número de proyectos encontrados>,
      "preview": "Nombres o descripciones breves de los proyectos principales"
    },
    {
      "key": "achievements",
      "label": "Logros",
      "itemCount": <número de logros con datos medibles>,
      "preview": "Resumen de los logros principales"
    },
    {
      "key": "skills",
      "label": "Habilidades",
      "itemCount": <número de habilidades listadas>,
      "preview": "Lista breve de habilidades principales"
    }
  ],
  "warnings": []
}

Reglas para warnings (agrégalos al array si aplican):
- Si no hay logros con cifras verificables: {"code": "no_metrics", "message": "Sin datos medibles", "suggestion": "Incluye métricas como % o tiempos para mejorar tus respuestas."}
- Si el documento tiene menos de 500 palabras: {"code": "too_short", "message": "Contexto muy breve", "suggestion": "Un contexto más detallado produce mejores respuestas. Intenta agregar más información sobre tus proyectos."}
- Si no hay sección de proyectos o está vacía: {"code": "no_projects", "message": "Sin proyectos", "suggestion": "Describe al menos 2-3 proyectos con tu rol y resultados."}
- Si no hay fechas en el documento: {"code": "no_dates", "message": "Sin fechas", "suggestion": "Agrega fechas y duraciones a tus proyectos y logros."}

No juzgues la calidad del perfil ni emitas opiniones. Solo señala qué falta como materia prima.`;
}

export function parseContextSummary(json: string): ContextSummary {
  const parsed = JSON.parse(json);
  if (!parsed.profile || !Array.isArray(parsed.sections)) {
    throw new Error("Respuesta del modelo no tiene la estructura esperada");
  }
  return parsed as ContextSummary;
}
