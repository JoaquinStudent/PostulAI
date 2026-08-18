import type { OpportunityBrief, OpportunityCategory } from "@/lib/types";
import type { ChatMessage } from "@/lib/ai/client";
import { getCompactSkill, CATEGORY_META } from "./sector-skills";

export const PR_09_VERSION = 3;

export function buildPR09Messages(
  brief: OpportunityBrief,
  contextRaw: string,
  cvText: string | null,
  category: OpportunityCategory,
): ChatMessage[] {
  const skill = getCompactSkill(category);
  const meta = CATEGORY_META[category];
  const hasCv = cvText && cvText.trim().length > 100;

  // ponytail: pitch template goes in system prompt (static, cacheable per category)
  const cvBlock = meta.needsCv
    ? hasCv
      ? `- "cvChanges": cambios específicos al CV con sección, acción (add/modify/remove), texto actual, texto sugerido, razón. Prioriza cambios que mejoren el match ATS.
- "idealCvOutline": CV ideal para ESTE puesto. Solo lo que falta.
- "portfolioProjects": array vacío (sector CV-first).`
      : `- "cvChanges": array vacío (no se proporcionó CV). Recomienda subir CV para recomendaciones más precisas.
- "idealCvOutline": qué debería tener un CV para esta convocatoria, sección por sección.
- "portfolioProjects": array vacío (sector CV-first).`
    : `- "cvChanges": array vacío (sector no requiere CV).
- "idealCvOutline": perfil/portafolio ideal para esta convocatoria.
- "portfolioProjects": proyectos concretos que puede construir AHORA para fortalecer la postulación. Cada uno con: nombre, stack/herramientas, alcance (~Nh estimadas), y por qué fortalece la aplicación.`;

  const system = `Eres un coach de carrera especializado en el sector "${category}".
Foco de este sector: ${meta.focusLabel}.

Perspectiva: ${skill.perspective}
Criterios clave: ${skill.criteria}

ELEVATOR PITCH — Estructura para este sector (${skill.pitchTemplate.maxSeconds}s max):
"${skill.pitchTemplate.structure}"

Tu trabajo: analizar el perfil contra la convocatoria y dar recomendaciones ACCIONABLES.

REGLAS CRÍTICAS:
1. Usa SOLO datos reales del <contexto_usuario> y <cv_actual>. NUNCA inventes empresas, cargos, logros, métricas o experiencias. Si falta un dato, pon un placeholder [entre corchetes].
2. Todas las recomendaciones deben ser REALISTAS y ALCANZABLES con el perfil actual del candidato. No sugieras certificaciones de nivel senior si el candidato es junior. No sugieras experiencias que requieran recursos que claramente no tiene. Cada recomendación debe ser un paso lógico SIGUIENTE desde donde está ahora.
3. Conecta cada recomendación con algo que el candidato YA tiene. Ej: si sabe Python, sugiere una certificación de Python aplicado, no un MBA.

Reglas de campos:
- "certifications": certificaciones alcanzables desde el nivel actual del candidato. Gratuitas o de bajo costo primero. Nombre exacto + plataforma + duración estimada.
- "skills": habilidades a desarrollar que estén al alcance dado su perfil actual, con recurso concreto (curso gratuito, proyecto, tutorial).
- "experiences": experiencias o proyectos que puede hacer AHORA con las herramientas y conocimientos que ya tiene. Nada que requiera prerequisitos que no cumple.
- "elevatorPitch": usa la estructura de arriba con SOLO datos reales del candidato. Si falta un dato, pon placeholder [entre corchetes]. Max ${skill.pitchTemplate.maxSeconds} segundos hablado.
- "interviewTips": 3-5 consejos específicos para ESTA convocatoria. Basados en lo que el candidato puede responder con su experiencia real, no en respuestas idealizadas.
${cvBlock}
- Prioriza impacto/esfuerzo. Lo que más mejore el encaje con menor esfuerzo va primero.
- No repitas lo que el candidato ya tiene.
- En "cvChanges", "current" debe ser texto REAL del CV del candidato, no inventado.

JSON válido sin markdown:
{
  "certifications": ["Nombre (plataforma, ~Nh) — por qué"],
  "skills": ["Habilidad — recurso concreto (~Nh)"],
  "experiences": ["Qué hacer para cerrar el gap"],
  "elevatorPitch": "Pitch personalizado con datos reales del candidato...",
  "interviewTips": ["Consejo específico para esta entrevista"],
  "cvChanges": [{"section": "X", "action": "modify", "current": "...", "suggested": "...", "reason": "..."}],
  "idealCvOutline": "Estructura ideal...",
  "portfolioProjects": ["Proyecto: nombre — stack, ~Nh — por qué fortalece"]
}`;

  const user = `<contexto_usuario>
${contextRaw}
</contexto_usuario>

${hasCv ? `<cv_actual>
${cvText}
</cv_actual>` : "(No se proporcionó CV)"}

<convocatoria>
Buscan: ${brief.seeking}
Criterios: ${brief.criteria.map((c) => `- ${c.name}${c.weight != null ? ` (${c.weight}%)` : ""}: ${c.description}`).join("\n")}
Elegibilidad: ${brief.eligibility.length > 0 ? brief.eligibility.join(", ") : "No especificada"}
Tono: ${brief.tone.join(", ") || "No especificado"}
</convocatoria>

Analiza el perfil${hasCv ? " y CV" : ""} contra esta convocatoria. Genera pitch, recomendaciones de entrevista, y mejoras concretas.`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

function stripFences(raw: string): string {
  const match = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  return match ? match[1].trim() : raw.trim();
}

export function parsePR09Response(json: string): import("@/lib/types").ProfileCoach {
  const parsed = JSON.parse(stripFences(json));
  return {
    certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    experiences: Array.isArray(parsed.experiences) ? parsed.experiences : [],
    elevatorPitch: typeof parsed.elevatorPitch === "string" ? parsed.elevatorPitch : "",
    interviewTips: Array.isArray(parsed.interviewTips) ? parsed.interviewTips : [],
    portfolioProjects: Array.isArray(parsed.portfolioProjects) ? parsed.portfolioProjects : [],
    cvChanges: Array.isArray(parsed.cvChanges)
      ? parsed.cvChanges.map((c: Record<string, unknown>) => ({
          section: String(c.section ?? ""),
          action: (c.action === "add" || c.action === "modify" || c.action === "remove") ? c.action : "add",
          current: typeof c.current === "string" ? c.current : null,
          suggested: String(c.suggested ?? ""),
          reason: String(c.reason ?? ""),
        }))
      : [],
    idealCvOutline: typeof parsed.idealCvOutline === "string" ? parsed.idealCvOutline : "",
  };
}
