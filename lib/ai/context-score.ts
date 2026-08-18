import { SECTOR_SKILLS } from "@/lib/prompts/sector-skills";
import type { OpportunityCategory } from "@/lib/types";

export interface ContextScore {
  total: number;
  completeness: number;
  metrics: number;
  evidence: number;
  timeline: number;
  sectorCoverage: number;
  tips: string[];
}

// ponytail: 16 sections from PR-01 schema
const EXPECTED_SECTIONS = [
  "perfil", "redes", "educación", "certificaciones",
  "experiencia", "proyectos", "stack", "premios",
  "liderazgo", "motivaciones", "idiomas", "fracasos",
  "voluntariado", "emprendimiento", "presentaciones", "restricciones",
];

const METRIC_PATTERNS = /\b(\d+[%xX]|\d+\s*(?:usuarios|clientes|personas|proyectos|equipos|meses|años|horas|veces|users|clients|people|projects|teams|months|years|hours|times)|\$\d[\d,.]*|USD\s*\d[\d,.]*)\b/gi;

const URL_PATTERN = /https?:\/\/[^\s)]+/g;

const DATE_PATTERN = /\b20\d{2}\b/g;
const DURATION_PATTERN = /\b\d+\s*(?:meses|mes|años|año|semanas|semana|months?|years?|weeks?)\b/gi;

export function scoreContext(text: string): ContextScore {
  const lower = text.toLowerCase();
  const lines = text.split("\n");
  const tips: string[] = [];

  // 1. Completeness (25%) — sections present from PR-01 schema
  const headers = lines
    .filter((l) => /^##\s/.test(l))
    .map((l) => l.replace(/^##\s+/, "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""));

  let sectionHits = 0;
  for (const expected of EXPECTED_SECTIONS) {
    const norm = expected.normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (headers.some((h) => h.includes(norm)) || lower.includes(`## ${expected}`)) {
      sectionHits++;
    }
  }
  const completeness = Math.round((sectionHits / EXPECTED_SECTIONS.length) * 100);
  if (completeness < 50) {
    const missing = EXPECTED_SECTIONS.filter((s) => {
      const norm = s.normalize("NFD").replace(/[̀-ͯ]/g, "");
      return !headers.some((h) => h.includes(norm)) && !lower.includes(`## ${s}`);
    });
    tips.push(`Faltan secciones: ${missing.slice(0, 4).join(", ")}${missing.length > 4 ? ` (+${missing.length - 4})` : ""}`);
  }

  // 2. Metrics (25%) — quantified results
  const metricMatches = text.match(METRIC_PATTERNS) || [];
  const metricCount = metricMatches.length;
  const metrics = Math.min(Math.round((metricCount / 8) * 100), 100);
  if (metrics < 50) {
    tips.push("Agrega más datos medibles: porcentajes, usuarios, tiempos, montos");
  }

  // 3. Verifiable evidence (20%) — URLs, repos, links
  const urls = text.match(URL_PATTERN) || [];
  const hasGithub = urls.some((u) => u.includes("github.com"));
  const hasLinkedin = urls.some((u) => u.includes("linkedin.com"));
  const urlScore = Math.min(urls.length * 15, 60);
  const platformBonus = (hasGithub ? 20 : 0) + (hasLinkedin ? 20 : 0);
  const evidence = Math.min(urlScore + platformBonus, 100);
  if (evidence < 50) {
    const suggestions = [];
    if (!hasLinkedin) suggestions.push("LinkedIn");
    if (!hasGithub) suggestions.push("GitHub");
    if (urls.length < 2) suggestions.push("portafolio o demos");
    tips.push(`Agrega enlaces verificables: ${suggestions.join(", ")}`);
  }

  // 4. Timeline depth (15%) — dates and durations
  const dates = text.match(DATE_PATTERN) || [];
  const durations = text.match(DURATION_PATTERN) || [];
  const uniqueYears = new Set(dates).size;
  const timelineRaw = (uniqueYears * 20) + (durations.length * 15);
  const timeline = Math.min(timelineRaw, 100);
  if (timeline < 50) {
    tips.push("Incluye fechas y duraciones en proyectos y experiencia");
  }

  // 5. Sector coverage (15%) — keyword match across sectors
  const categories = Object.keys(SECTOR_SKILLS) as OpportunityCategory[];
  const sectorScores = categories.map((cat) => {
    const patterns = SECTOR_SKILLS[cat].keywordPatterns;
    const hits = patterns.filter((kw) => lower.includes(kw.toLowerCase()));
    return hits.length / patterns.length;
  });
  sectorScores.sort((a, b) => b - a);
  const top3avg = (sectorScores[0] + sectorScores[1] + sectorScores[2]) / 3;
  const sectorCoverage = Math.min(Math.round(top3avg * 100 * 1.5), 100);
  if (sectorCoverage < 40) {
    tips.push("Tu contexto cubre pocos sectores; agrega palabras clave de tu área");
  }

  // Weighted total
  const total = Math.round(
    completeness * 0.25 +
    metrics * 0.25 +
    evidence * 0.20 +
    timeline * 0.15 +
    sectorCoverage * 0.15,
  );

  return { total, completeness, metrics, evidence, timeline, sectorCoverage, tips };
}
