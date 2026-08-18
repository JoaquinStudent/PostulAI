import type { FitPoint, LimitUnit } from "@/lib/types";

export function verifyCitations(
  points: FitPoint[],
  contextRaw: string,
): (FitPoint & { verified: boolean })[] {
  const contextLower = contextRaw.toLowerCase();

  return points.map((point) => {
    if (!point.evidence) return { ...point, verified: false };

    // ponytail: substring match with some tolerance for whitespace normalization
    const evidenceLower = point.evidence
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    const contextNormalized = contextLower.replace(/\s+/g, " ");

    // Try exact substring first
    if (contextNormalized.includes(evidenceLower)) {
      return { ...point, verified: true };
    }

    // Try a relaxed match: at least 60% of words present in order
    const words = evidenceLower.split(" ").filter((w) => w.length > 3);
    if (words.length === 0) return { ...point, verified: false };

    let lastIdx = 0;
    let matchCount = 0;
    for (const word of words) {
      const idx = contextNormalized.indexOf(word, lastIdx);
      if (idx !== -1) {
        matchCount++;
        lastIdx = idx + word.length;
      }
    }

    const verified = matchCount / words.length >= 0.6;
    return { ...point, verified };
  });
}

export function verifyLength(
  text: string,
  limit: { value: number; unit: LimitUnit },
): { count: number; withinLimit: boolean } {
  const count =
    limit.unit === "characters"
      ? text.length
      : text.split(/\s+/).filter(Boolean).length;
  return { count, withinLimit: count <= limit.value };
}
