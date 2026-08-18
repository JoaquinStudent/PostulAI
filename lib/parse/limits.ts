import type { LimitUnit } from "@/lib/types";

interface DetectedLimit {
  value: number;
  unit: LimitUnit;
}

// ponytail: regex-first limit detection — cheaper and more reliable than a model for syntax
const PATTERNS: { re: RegExp; unit: LimitUnit }[] = [
  // Spanish: "max. 300 caracteres", "maximo 300 caracteres", "máximo de 300 caracteres"
  { re: /m[aá]x(?:imo|\.)\s*(?:de\s+)?(\d[\d.,]*)\s*caract/i, unit: "characters" },
  // Spanish: "max. 200 palabras", "maximo 200 palabras", "máximo de 200 palabras"
  { re: /m[aá]x(?:imo|\.)\s*(?:de\s+)?(\d[\d.,]*)\s*palabras?/i, unit: "words" },
  // Spanish: "no mas de 300 caracteres", "no más de 300 caracteres"
  { re: /no\s+m[aá]s\s+de\s+(\d[\d.,]*)\s*caract/i, unit: "characters" },
  // Spanish: "no mas de 200 palabras"
  { re: /no\s+m[aá]s\s+de\s+(\d[\d.,]*)\s*palabras?/i, unit: "words" },
  // Spanish: "limite: 1500 caracteres", "límite de 1500 caracteres"
  { re: /l[ií]mite[:\s]+(?:de\s+)?(\d[\d.,]*)\s*caract/i, unit: "characters" },
  // Spanish: "limite: 200 palabras"
  { re: /l[ií]mite[:\s]+(?:de\s+)?(\d[\d.,]*)\s*palabras?/i, unit: "words" },
  // Spanish: "(300 caracteres)", "(200 palabras)"
  { re: /\(\s*(\d[\d.,]*)\s*caract[^)]*\)/i, unit: "characters" },
  { re: /\(\s*(\d[\d.,]*)\s*palabras?\s*\)/i, unit: "words" },
  // English: "(300 characters max)", "300 characters maximum"
  { re: /(\d[\d.,]*)\s*characters?\s*(?:max|maximum|limit)/i, unit: "characters" },
  // English: "(200 words max)", "200 words maximum"
  { re: /(\d[\d.,]*)\s*words?\s*(?:max|maximum|limit)/i, unit: "words" },
  // English: "max 300 characters", "maximum of 300 characters"
  { re: /max(?:imum)?\s*(?:of\s+)?(\d[\d.,]*)\s*characters?/i, unit: "characters" },
  // English: "max 200 words"
  { re: /max(?:imum)?\s*(?:of\s+)?(\d[\d.,]*)\s*words?/i, unit: "words" },
  // English: "up to 500 words"
  { re: /up\s+to\s+(\d[\d.,]*)\s*words?/i, unit: "words" },
  // English: "up to 500 characters"
  { re: /up\s+to\s+(\d[\d.,]*)\s*characters?/i, unit: "characters" },
  // English: "limit: 300 characters"
  { re: /limit[:\s]+(\d[\d.,]*)\s*characters?/i, unit: "characters" },
  // English: "limit: 200 words"
  { re: /limit[:\s]+(\d[\d.,]*)\s*words?/i, unit: "words" },
  // Bare number in parentheses with unit: "(300 chars)", "(200 wds)"
  { re: /\(\s*(\d[\d.,]*)\s*chars?\s*\)/i, unit: "characters" },
  { re: /\(\s*(\d[\d.,]*)\s*wds?\s*\)/i, unit: "words" },
];

function parseNumber(raw: string): number {
  return parseInt(raw.replace(/[.,]/g, ""), 10);
}

export function detectLimit(raw: string): DetectedLimit | null {
  for (const { re, unit } of PATTERNS) {
    const match = raw.match(re);
    if (match) {
      const value = parseNumber(match[1]);
      if (value > 0 && value < 100_000) return { value, unit };
    }
  }
  return null;
}

export function parseQuestions(
  block: string,
): { text: string; raw: string; limit: DetectedLimit | null }[] {
  const trimmed = block.trim();
  if (!trimmed) return [];

  // Try numbered list: lines starting with digit(s) followed by . or ) or -
  const numberedRe = /^(\d+)\s*[.):\-]\s*/;
  const lines = trimmed.split("\n");
  const groups: { raw: string; startIdx: number }[] = [];

  let current: string[] = [];
  let isNumbered = false;

  for (const line of lines) {
    if (numberedRe.test(line)) {
      if (current.length > 0) {
        groups.push({ raw: current.join("\n"), startIdx: groups.length });
      }
      current = [line];
      isNumbered = true;
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) {
    groups.push({ raw: current.join("\n"), startIdx: groups.length });
  }

  // If numbered detection found 2+ groups, use it
  if (isNumbered && groups.length >= 2) {
    return groups.map((g) => {
      const raw = g.raw;
      const text = raw.replace(numberedRe, "").trim();
      return { text, raw, limit: detectLimit(raw) };
    });
  }

  // Fallback: split by double newlines
  const paragraphs = trimmed
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 10);

  if (paragraphs.length >= 2) {
    return paragraphs.map((p) => ({
      text: p.replace(numberedRe, "").trim(),
      raw: p,
      limit: detectLimit(p),
    }));
  }

  // Single block — return as one question
  return [{ text: trimmed, raw: trimmed, limit: detectLimit(trimmed) }];
}
