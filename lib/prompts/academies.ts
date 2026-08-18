// ponytail: static skill — 0 AI tokens, injected into PR-09 system prompt
// compact format to minimize prompt size

export interface Academy {
  name: string;
  areas: string[];
  free: boolean;
  note: string;
}

export const ACADEMIES: Academy[] = [
  // Alta recognition — university-backed certificates
  { name: "Coursera", areas: ["tech", "data", "business", "cloud", "design"], free: true, note: "Certificados de Google, IBM, Meta, universidades. Auditar gratis, certificado ~$50" },
  { name: "edX", areas: ["tech", "data", "science", "business"], free: true, note: "MIT, Harvard, Berkeley. MicroMasters y Professional Certificates" },
  { name: "Google Skillshop", areas: ["marketing", "analytics", "cloud", "ads"], free: true, note: "100% gratis. Google Ads, Analytics, Cloud Digital Leader" },
  { name: "AWS Skill Builder", areas: ["cloud", "devops", "data", "ml"], free: true, note: "Cursos gratis, exámenes de certificación ~$100-300" },
  { name: "Microsoft Learn", areas: ["cloud", "devops", "data", "ai"], free: true, note: "Paths gratis. Azure certs, AI-900, DP-900, AZ-900 (~$165)" },
  { name: "LinkedIn Learning", areas: ["tech", "business", "design", "pm"], free: false, note: "Certificados LinkedIn visibles en perfil. ~$30/mes" },
  // Tech-specific
  { name: "freeCodeCamp", areas: ["web", "frontend", "backend", "data", "ml"], free: true, note: "100% gratis. Certificados verificables. 300h por certificación" },
  { name: "The Odin Project", areas: ["web", "frontend", "backend"], free: true, note: "100% gratis. Full stack con proyectos reales" },
  { name: "Scrimba", areas: ["frontend", "react", "web"], free: true, note: "Cursos interactivos. Frontend Developer Career Path" },
  { name: "Codecademy", areas: ["tech", "data", "web", "python"], free: true, note: "Paths gratis, Pro ~$20/mes. Certificados de career paths" },
  // LATAM-focused
  { name: "Platzi", areas: ["tech", "data", "design", "business", "marketing"], free: false, note: "En español. ~$25/mes. Fuerte en LATAM. Rutas de carrera completas" },
  { name: "Alura LATAM", areas: ["tech", "data", "devops", "frontend"], free: false, note: "En español/portugués. Oracle ONE partnership. ~$20/mes" },
  { name: "Coderhouse", areas: ["web", "design", "data", "marketing"], free: false, note: "En español. Clases en vivo. Certificados con portfolio. ~$100-200/curso" },
  { name: "Desafío LATAM", areas: ["data", "web", "ux"], free: false, note: "Chile/LATAM. Bootcamps intensivos con empleabilidad" },
  // Data & AI
  { name: "DataCamp", areas: ["data", "python", "r", "sql", "ml"], free: true, note: "Primeros capítulos gratis. ~$25/mes. Certificaciones de data" },
  { name: "Kaggle Learn", areas: ["ml", "data", "python", "sql"], free: true, note: "100% gratis. Micro-cursos + competencias para portfolio" },
  { name: "fast.ai", areas: ["ml", "deep-learning", "ai"], free: true, note: "100% gratis. Practical Deep Learning. Jeremy Howard" },
  // Design & UX
  { name: "Google UX Design Certificate", areas: ["ux", "design", "research"], free: false, note: "En Coursera. ~$50/mes, 6 meses. Portfolio incluido" },
  { name: "Interaction Design Foundation", areas: ["ux", "design", "research"], free: false, note: "Reconocido en industria UX. ~$16/mes" },
  // Project Management & Agile
  { name: "Google PM Certificate", areas: ["pm", "agile"], free: false, note: "En Coursera. ~$50/mes, 6 meses. Prep para CAPM" },
  { name: "Scrum.org", areas: ["agile", "scrum"], free: false, note: "PSM I ~$150. Reconocido mundialmente. Prep gratis en su web" },
  // Cybersecurity
  { name: "TryHackMe", areas: ["cybersecurity", "pentesting"], free: true, note: "Labs interactivos. Free tier generoso. Premium ~$10/mes" },
  { name: "Hack The Box", areas: ["cybersecurity", "pentesting"], free: true, note: "Labs CTF. Certificaciones HTB reconocidas en industria" },
];

// ponytail: compact string for prompt injection (~400 tokens vs full object)
export function getAcademiesPromptBlock(): string {
  return ACADEMIES
    .map((a) => `${a.name} (${a.free ? "gratis" : "pago"}): ${a.areas.join(", ")}. ${a.note}`)
    .join("\n");
}
