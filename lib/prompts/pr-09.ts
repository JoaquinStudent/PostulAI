import type { OpportunityBrief, OpportunityCategory } from "@/lib/types";
import type { ChatMessage } from "@/lib/ai/client";
import { getCompactSkill, CATEGORY_META } from "./sector-skills";
import { getCertificationsBlock } from "./certifications";

export const PR_09_VERSION = 4;

export function buildPR09Messages(
  brief: OpportunityBrief,
  contextRaw: string,
  cvText: string | null,
  category: OpportunityCategory,
): ChatMessage[] {
  const skill = getCompactSkill(category);
  const meta = CATEGORY_META[category];
  const hasCv = cvText && cvText.trim().length > 100;

  const projectsRule = `- "portfolioProjects": proyectos concretos que el candidato puede construir AHORA para demostrar las habilidades que pide la convocatoria. CADA proyecto DEBE tener impacto social, económico o ambiental y conectarse con al menos un ODS (Objetivo de Desarrollo Sostenible de la ONU). Cada proyecto es un objeto con: name, demonstrates (qué gap cierra), description (qué construir en 2-3 líneas), stack (tecnologías a usar basadas en lo que ya sabe), hours (estimado realista), ods (número y nombre del ODS relacionado, ej: "ODS 4 — Educación de calidad"). Mínimo 2 proyectos.`;

  const cvBlock = meta.needsCv
    ? hasCv
      ? `- "cvChanges": cambios específicos al CV con sección, acción (add/modify/remove), texto actual, texto sugerido, razón. Prioriza cambios que mejoren el match ATS.
- "idealCvOutline": CV ideal para ESTE puesto. Solo lo que falta.
${projectsRule}`
      : `- "cvChanges": array vacío (no se proporcionó CV). Recomienda subir CV para recomendaciones más precisas.
- "idealCvOutline": qué debería tener un CV para esta convocatoria, sección por sección.
${projectsRule}`
    : `- "cvChanges": array vacío (sector no requiere CV).
- "idealCvOutline": perfil/portafolio ideal para esta convocatoria.
${projectsRule}`;

  const system = `Eres un coach de carrera especializado en el sector "${category}".
Foco de este sector: ${meta.focusLabel}.

Perspectiva: ${skill.perspective}
Criterios clave: ${skill.criteria}

ELEVATOR PITCH — Estructura para este sector (${skill.pitchTemplate.maxSeconds}s max):
"${skill.pitchTemplate.structure}"

CERTIFICACIONES VERIFICADAS POR ENTIDAD (usa SOLO estas para recomendar certificaciones):
${getCertificationsBlock()}

Tu trabajo: analizar el perfil contra la convocatoria y dar recomendaciones ACCIONABLES.

REGLAS CRÍTICAS:
1. Usa SOLO datos reales del <contexto_usuario> y <cv_actual>. NUNCA inventes empresas, cargos, logros, métricas o experiencias. Si falta un dato, pon un placeholder [entre corchetes].
2. Todas las recomendaciones deben ser REALISTAS y ALCANZABLES con el perfil actual del candidato. Cada recomendación debe ser un paso lógico SIGUIENTE desde donde está ahora.
3. Conecta cada recomendación con algo que el candidato YA tiene.
4. Para certificaciones: usa SOLO certificaciones de la lista de arriba. Incluye nombre exacto, entidad (Google, Microsoft, IBM, etc.), plataforma, si es gratis o el costo, y duración estimada. Prioriza opciones gratuitas primero, luego pagadas.
5. Para proyectos: cada proyecto debe ser algo que el candidato puede construir con su stack actual, que demuestre una habilidad específica que pide la convocatoria.

Reglas de campos:
- "certifications": certificaciones de la lista verificada. Formato: "Nombre (Entidad, Plataforma, gratis|~$X, ~Nh) — qué gap cierra". Incluye al menos 1 opción gratuita.
- "skills": habilidades a desarrollar con recurso concreto de las entidades verificadas.
- "experiences": experiencias que puede hacer AHORA con lo que ya tiene.
- "elevatorPitch": SOLO datos reales del candidato. Placeholder [entre corchetes] si falta dato. Max ${skill.pitchTemplate.maxSeconds}s.
- "interviewTips": 3-5 consejos específicos para ESTA convocatoria basados en experiencia real del candidato.
${cvBlock}
- Prioriza impacto/esfuerzo. Lo que más mejore el encaje con menor esfuerzo va primero.
- No repitas lo que el candidato ya tiene.
- En "cvChanges", "current" debe ser texto REAL del CV.

JSON válido sin markdown:
{
  "certifications": ["Google Data Analytics Certificate (Coursera, ~$50/mes, ~6 meses) — cubre el gap en análisis de datos"],
  "skills": ["Habilidad — recurso concreto en plataforma verificada (~Nh)"],
  "experiences": ["Qué hacer para cerrar el gap"],
  "elevatorPitch": "Pitch con datos reales...",
  "interviewTips": ["Consejo específico"],
  "cvChanges": [{"section": "X", "action": "modify", "current": "...", "suggested": "...", "reason": "..."}],
  "idealCvOutline": "Estructura ideal...",
  "portfolioProjects": [{"name": "Nombre", "demonstrates": "Qué demuestra", "description": "Qué construir", "stack": "Tech a usar", "hours": "~20h", "ods": "ODS 4 — Educación de calidad"}]
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
    portfolioProjects: Array.isArray(parsed.portfolioProjects)
      ? parsed.portfolioProjects.map((p: Record<string, unknown>) => ({
          name: String(p.name ?? ""),
          demonstrates: String(p.demonstrates ?? ""),
          description: String(p.description ?? ""),
          stack: String(p.stack ?? ""),
          hours: String(p.hours ?? ""),
          ods: String(p.ods ?? ""),
        }))
      : [],
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
