export function normalizeText(raw: string): string {
  let text = raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/ {2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n");

  text = removeDuplicateLines(text);
  return text.trim();
}

function removeDuplicateLines(text: string): string {
  const lines = text.split("\n");
  const seen = new Map<string, number>();

  for (const line of lines) {
    const key = line.trim().toLowerCase();
    if (key.length > 10) {
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
  }

  // ponytail: lines appearing 3+ times are likely nav/footer cruft
  const duplicates = new Set(
    [...seen.entries()].filter(([, count]) => count >= 3).map(([key]) => key),
  );

  if (duplicates.size === 0) return text;

  return lines
    .filter((line) => !duplicates.has(line.trim().toLowerCase()))
    .join("\n");
}

export function truncateForContext(text: string, maxTokensApprox = 12000): string {
  // ponytail: ~4 chars per token rough estimate
  const maxChars = maxTokensApprox * 4;
  if (text.length <= maxChars) return text;

  const PRIORITY_KEYWORDS = [
    "requisito", "criterio", "elegib", "evaluaci", "fecha", "plazo",
    "premio", "financ", "postul", "convocatoria", "objetivo",
    "requirement", "criteria", "eligib", "deadline", "prize", "grant",
  ];

  const paragraphs = text.split(/\n\n+/);
  const scored = paragraphs.map((p) => {
    const lower = p.toLowerCase();
    const score = PRIORITY_KEYWORDS.reduce(
      (acc, kw) => acc + (lower.includes(kw) ? 1 : 0),
      0,
    );
    return { text: p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  let result = "";
  for (const { text: para } of scored) {
    if (result.length + para.length + 2 > maxChars) break;
    result += para + "\n\n";
  }

  return result.trim();
}
