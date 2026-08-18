import type { OpportunityBrief } from "@/lib/types";

interface Section {
  header: string;
  body: string;
  score: number;
}

function parseSections(contextRaw: string): Section[] {
  const parts = contextRaw.split(/^(##\s+.+)$/m);
  const sections: Section[] = [];
  let currentHeader = "General";

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;
    if (part.startsWith("## ")) {
      currentHeader = part.replace(/^##\s+/, "");
    } else {
      sections.push({ header: currentHeader, body: part, score: 0 });
    }
  }

  return sections;
}

function scoreSection(
  section: Section,
  keywords: string[],
): number {
  const text = `${section.header} ${section.body}`.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (text.includes(kw.toLowerCase())) score++;
  }
  return score;
}

function extractKeywords(
  question: string,
  brief: OpportunityBrief | null,
  extraKeywords: string[],
): string[] {
  const words = new Set<string>();

  const stopwords = new Set([
    "de", "la", "el", "en", "que", "un", "una", "los", "las", "del",
    "por", "con", "para", "como", "su", "al", "es", "se", "lo", "más",
    "si", "no", "ya", "o", "y", "a", "the", "is", "in", "of", "and",
    "to", "for", "your", "you", "how", "what", "this", "that", "with",
  ]);

  const extract = (text: string) => {
    text
      .toLowerCase()
      .replace(/[^\w\sáéíóúñü]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopwords.has(w))
      .forEach((w) => words.add(w));
  };

  extract(question);
  if (brief) {
    extract(brief.seeking);
    brief.criteria.forEach((c) => {
      extract(c.name);
      extract(c.description);
    });
  }
  extraKeywords.forEach((kw) => words.add(kw.toLowerCase()));

  return [...words];
}

// ~4 chars per token rough estimate
const CHARS_PER_TOKEN = 4;

export function windowContext(
  contextRaw: string,
  question: string,
  brief: OpportunityBrief | null,
  sectorKeywords: string[] = [],
  budgetTokens = 2000,
): string {
  const budgetChars = budgetTokens * CHARS_PER_TOKEN;

  if (contextRaw.length <= budgetChars) return contextRaw;

  const sections = parseSections(contextRaw);
  if (sections.length === 0) return contextRaw.slice(0, budgetChars);

  const keywords = extractKeywords(question, brief, sectorKeywords);

  for (const section of sections) {
    section.score = scoreSection(section, keywords);
  }

  sections.sort((a, b) => b.score - a.score);

  let result = "";
  for (const section of sections) {
    const block = `## ${section.header}\n${section.body}\n\n`;
    if (result.length + block.length > budgetChars) {
      const remaining = budgetChars - result.length;
      if (remaining > 200) {
        result += `## ${section.header}\n${section.body.slice(0, remaining - section.header.length - 10)}\n`;
      }
      break;
    }
    result += block;
  }

  return result.trim();
}
