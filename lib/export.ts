import type { Opportunity, Question, Answer, ProfileCoach } from "@/lib/types";
import type { AtsBreakdown } from "@/lib/ai/ats-score";

export function formatMarkdown(
  opp: Opportunity,
  questions: Question[],
  answers: Record<string, Answer>,
  opts: { includeAnalysis: boolean } = { includeAnalysis: true },
): string {
  const lines: string[] = [];

  lines.push(`# ${opp.title}`);
  lines.push(
    [opp.organizer, opp.type, opp.deadline ? `Cierra ${opp.deadline}` : null]
      .filter(Boolean)
      .join(" · "),
  );
  lines.push("");

  if (opts.includeAnalysis) {
    lines.push("## Análisis");
    lines.push(`Encaje: ${opp.fit.score}%`);
    if (opp.fit.strengths.length > 0) {
      lines.push(
        `A favor: ${opp.fit.strengths.map((s) => s.claim).join("; ")}`,
      );
    }
    if (opp.fit.gaps.length > 0) {
      lines.push(
        `En contra: ${opp.fit.gaps.map((g) => g.claim).join("; ")}`,
      );
    }
    lines.push("");
  }

  lines.push("## Respuestas\n");
  for (const q of questions) {
    const a = answers[q.id];
    lines.push(`### ${q.index}. ${q.text}`);
    if (q.limit) {
      lines.push(
        `Límite: ${q.limit.value} ${q.limit.unit === "characters" ? "caracteres" : "palabras"} · Usado: ${q.limit.unit === "characters" ? a?.charCount ?? 0 : a?.wordCount ?? 0}`,
      );
    }
    lines.push("");
    lines.push(a?.text ?? "(sin respuesta)");
    lines.push("\n---\n");
  }

  return lines.join("\n");
}

export function formatPlainText(
  questions: Question[],
  answers: Record<string, Answer>,
): string {
  return questions
    .map((q) => {
      const a = answers[q.id];
      return `${q.index}. ${q.text}\n\n${a?.text ?? "(sin respuesta)"}`;
    })
    .join("\n\n---\n\n");
}

export function formatJson(
  opp: Opportunity,
  questions: Question[],
  answers: Record<string, Answer>,
): string {
  const data = {
    opportunity: {
      title: opp.title,
      organizer: opp.organizer,
      type: opp.type,
      deadline: opp.deadline,
      fit: opp.fit.score,
    },
    responses: questions.map((q) => {
      const a = answers[q.id];
      return {
        question: q.text,
        limit: q.limit,
        answer: a?.text ?? "",
        status: a?.status ?? "empty",
        evidence: a?.evidence ?? [],
        gaps: a?.gaps.filter((g) => !g.resolved) ?? [],
      };
    }),
  };
  return JSON.stringify(data, null, 2);
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export interface BundleData {
  opp: Opportunity;
  questions?: Question[];
  answers?: Record<string, Answer>;
  coach?: ProfileCoach | null;
  letter?: string | null;
  ats?: AtsBreakdown | null;
}

function formatCoachMd(coach: ProfileCoach): string {
  const lines: string[] = ["# Mejora tu perfil\n"];

  if (coach.elevatorPitch) {
    lines.push("## Elevator Pitch\n", coach.elevatorPitch, "");
  }
  if (coach.linkedinHeadline) {
    lines.push("## LinkedIn Headline\n", coach.linkedinHeadline, "");
  }
  if (coach.linkedinSummary) {
    lines.push("## LinkedIn Summary\n", coach.linkedinSummary, "");
  }
  if (coach.certifications.length) {
    lines.push("## Certificaciones\n", ...coach.certifications.map((c) => `- ${c}`), "");
  }
  if (coach.skills.length) {
    lines.push("## Habilidades\n", ...coach.skills.map((s) => `- ${s}`), "");
  }
  if (coach.experiences.length) {
    lines.push("## Experiencias\n", ...coach.experiences.map((e) => `- ${e}`), "");
  }
  if (coach.interviewTips.length) {
    lines.push("## Tips de entrevista\n", ...coach.interviewTips.map((t) => `- ${t}`), "");
  }
  if (coach.portfolioProjects.length) {
    lines.push("## Proyectos recomendados\n");
    for (const p of coach.portfolioProjects) {
      lines.push(`### ${p.name}`, `- Demuestra: ${p.demonstrates}`, `- ${p.description}`, `- Stack: ${p.stack} · ${p.hours}`, p.ods ? `- ${p.ods}` : "", "");
    }
  }
  if (coach.cvChanges.length) {
    lines.push("## Cambios en CV\n");
    for (const c of coach.cvChanges) {
      lines.push(`- [${c.action.toUpperCase()}] ${c.section}: ${c.suggested} — ${c.reason}`);
    }
    lines.push("");
  }
  if (coach.idealCvOutline) {
    lines.push("## CV ideal\n", coach.idealCvOutline, "");
  }

  return lines.join("\n");
}

export async function exportBundle(data: BundleData): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const slug = data.opp.title.replace(/[^a-zA-Z0-9áéíóúñü]+/gi, "-").slice(0, 40);

  // Analysis
  const analysis = [
    `# ${data.opp.title}\n`,
    `Organizador: ${data.opp.organizer ?? "—"}`,
    `Tipo: ${data.opp.type ?? "—"}`,
    `Deadline: ${data.opp.deadline ?? "—"}`,
    `Encaje: ${data.opp.fit.score}%\n`,
    "## Fortalezas\n",
    ...data.opp.fit.strengths.map((s) => `- ${s.claim}${s.evidence ? ` (${s.evidence})` : ""}`),
    "\n## Gaps\n",
    ...data.opp.fit.gaps.map((g) => `- ${g.claim}${g.improvement ? ` → ${g.improvement}` : ""}`),
  ].join("\n");
  zip.file("analisis.md", analysis);

  // Answers
  if (data.questions?.length && data.answers) {
    zip.file("respuestas.md", formatMarkdown(data.opp, data.questions, data.answers, { includeAnalysis: false }));
  }

  // Cover letter
  if (data.letter) {
    zip.file("carta.md", `# Carta de presentación — ${data.opp.title}\n\n${data.letter}`);
  }

  // Coach / profile improvements
  if (data.coach) {
    zip.file("mejoras-perfil.md", formatCoachMd(data.coach));

    if (data.coach.linkedinHeadline || data.coach.linkedinSummary) {
      zip.file("linkedin.md", [
        "# LinkedIn optimizado\n",
        data.coach.linkedinHeadline ? `## Headline\n${data.coach.linkedinHeadline}\n` : "",
        data.coach.linkedinSummary ? `## Summary\n${data.coach.linkedinSummary}\n` : "",
      ].join("\n"));
    }
  }

  // ATS
  if (data.ats) {
    const atsLines = [
      `# ATS Score — ${data.ats.total}%\n`,
      `- Keywords exactos: ${data.ats.exactMatch}% (40%)`,
      `- Match semántico: ${data.ats.semanticMatch}% (20%)`,
      `- Verbos de acción: ${data.ats.actionVerbs}% (15%)`,
      `- Estructura: ${data.ats.structure}% (10%)`,
      `- Datos cuantificables: ${data.ats.quantifiable}% (15%)\n`,
      data.ats.missingKeywords.length
        ? `## Keywords faltantes\n${data.ats.missingKeywords.join(", ")}\n`
        : "",
      data.ats.suggestions.length
        ? `## Sugerencias\n${data.ats.suggestions.map((s) => `- ${s}`).join("\n")}\n`
        : "",
    ];
    zip.file("ats-score.md", atsLines.join("\n"));
  }

  // Full JSON
  zip.file("analisis.json", JSON.stringify({
    opportunity: { title: data.opp.title, organizer: data.opp.organizer, type: data.opp.type, deadline: data.opp.deadline },
    fit: data.opp.fit,
    effort: data.opp.effort,
    brief: data.opp.brief,
    ats: data.ats ?? null,
  }, null, 2));

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `postulai-${slug}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
