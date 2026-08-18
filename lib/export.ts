import type { Opportunity, Question, Answer } from "@/lib/types";

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
