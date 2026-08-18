import { hasSynonymMatch } from "@/lib/data/synonyms";

const ACTION_VERBS = /\b(lider[éeao]|desarroll[éeao]|implement[éeao]|cre[éeao]|logr[éeao]|reduj[eio]|aument[éeao]|mejor[éeao]|diseñ[éeao]|gestion[éeao]|coordin[éeao]|resolv[íi]|automatiz[éeao]|optimiz[éeao]|construi[íi]|fundé|lanc[éeao]|integr[éeao]|led|built|developed|created|achieved|reduced|increased|designed|managed|launched|implemented|coordinated|analyzed|delivered|established|initiated|mentored|trained|scaled|architected|deployed|migrated)\b/gi;

const QUANTIFIABLE = /\b(\d+[%xX]|\d+\s*(?:usuarios|clientes|personas|proyectos|meses|años|horas|veces|users|clients|projects|months|years|times|hours)|\$[\d,.]+|USD\s*[\d,.]+|€[\d,.]+)\b/gi;

export interface AtsBreakdown {
  total: number;
  exactMatch: number;
  semanticMatch: number;
  actionVerbs: number;
  structure: number;
  quantifiable: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export function scoreAts(
  contextRaw: string,
  criteriaKeywords: string[],
): AtsBreakdown {
  const lower = contextRaw.toLowerCase();
  const words = contextRaw.split(/\s+/).filter(Boolean).length;

  // 1. Exact keyword match (40%)
  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of criteriaKeywords) {
    if (lower.includes(kw.toLowerCase())) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const exactMatch = criteriaKeywords.length > 0
    ? Math.round((matched.length / criteriaKeywords.length) * 100)
    : 50;

  // 2. Semantic match via synonyms (20%)
  const semanticHits: string[] = [];
  for (const kw of missing) {
    if (hasSynonymMatch(contextRaw, kw)) {
      semanticHits.push(kw);
    }
  }
  const stillMissing = missing.filter((k) => !semanticHits.includes(k));
  const semanticMatch = missing.length > 0
    ? Math.round((semanticHits.length / missing.length) * 100)
    : 100;

  // 3. Action verbs (15%)
  const verbCount = (contextRaw.match(ACTION_VERBS) || []).length;
  const verbDensity = words > 0 ? verbCount / words : 0;
  // ponytail: 3%+ density = 100, scale linearly
  const actionVerbs = Math.min(Math.round(verbDensity * 3333), 100);

  // 4. Structure (10%) — sections, bullets, headers
  const hasSections = /^#{1,3}\s|^\*{2}.+\*{2}|^##/m.test(contextRaw);
  const bulletCount = (contextRaw.match(/^[-•*]\s/gm) || []).length;
  const hasHeaders = /^#+\s/m.test(contextRaw);
  const structureScore = Math.min(
    (hasSections ? 30 : 0) + (hasHeaders ? 20 : 0) + Math.min(bulletCount * 5, 50),
    100,
  );

  // 5. Quantifiable data (15%)
  const quantCount = (contextRaw.match(QUANTIFIABLE) || []).length;
  const quantifiable = Math.min(quantCount * 12, 100);

  // Weighted total
  const total = Math.round(
    exactMatch * 0.4 +
    semanticMatch * 0.2 +
    actionVerbs * 0.15 +
    structureScore * 0.1 +
    quantifiable * 0.15,
  );

  // Suggestions
  const suggestions: string[] = [];
  if (stillMissing.length > 0) {
    suggestions.push(`Agrega estas palabras clave a tu perfil: ${stillMissing.slice(0, 8).join(", ")}`);
  }
  if (verbCount < 5) {
    suggestions.push("Usa más verbos de acción (lideré, implementé, diseñé, logré)");
  }
  if (quantCount < 3) {
    suggestions.push("Agrega datos cuantificables (%, cifras, usuarios, resultados medibles)");
  }
  if (!hasSections) {
    suggestions.push("Estructura tu contexto con secciones y viñetas para mejor parsing ATS");
  }

  return {
    total,
    exactMatch,
    semanticMatch,
    actionVerbs,
    structure: structureScore,
    quantifiable,
    matchedKeywords: [...matched, ...semanticHits],
    missingKeywords: stillMissing,
    suggestions,
  };
}

export function extractCriteriaKeywords(seeking: string, criteriaNames: string[]): string[] {
  const words = new Set<string>();

  // Extract multi-word phrases from criteria names
  for (const name of criteriaNames) {
    words.add(name);
    // Also add individual significant words (>3 chars)
    for (const w of name.split(/\s+/)) {
      if (w.length > 3) words.add(w);
    }
  }

  // Extract significant words from seeking
  for (const w of seeking.split(/\s+/)) {
    if (w.length > 4 && !/^(para|como|esta|este|cada|todo|toda|unos|unas|sobre|entre|desde|hasta|donde|quien|which|their|these|those|about|through)$/i.test(w)) {
      words.add(w);
    }
  }

  return Array.from(words);
}
