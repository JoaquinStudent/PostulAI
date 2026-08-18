// ponytail: static synonym pairs for ATS semantic matching, ~200 pairs es/en
// bidirectional — lookup checks both directions
export const SYNONYMS: [string, string][] = [
  // Management
  ["gestión de proyectos", "project management"],
  ["gestión", "management"],
  ["liderazgo", "leadership"],
  ["líder", "leader"],
  ["jefe", "manager"],
  ["director", "director"],
  ["coordinador", "coordinator"],
  ["supervisor", "supervisor"],
  ["gerente", "manager"],
  ["equipo", "team"],
  ["equipos", "teams"],

  // Tech
  ["desarrollo de software", "software development"],
  ["desarrollo web", "web development"],
  ["desarrollo móvil", "mobile development"],
  ["programación", "programming"],
  ["código", "code"],
  ["base de datos", "database"],
  ["bases de datos", "databases"],
  ["inteligencia artificial", "artificial intelligence"],
  ["aprendizaje automático", "machine learning"],
  ["ciencia de datos", "data science"],
  ["análisis de datos", "data analysis"],
  ["ingeniería de datos", "data engineering"],
  ["computación en la nube", "cloud computing"],
  ["seguridad informática", "cybersecurity"],
  ["devops", "devops"],
  ["frontend", "front-end"],
  ["backend", "back-end"],
  ["fullstack", "full-stack"],
  ["full stack", "full-stack"],
  ["api", "api"],
  ["microservicios", "microservices"],
  ["arquitectura", "architecture"],

  // Soft skills
  ["comunicación", "communication"],
  ["trabajo en equipo", "teamwork"],
  ["resolución de problemas", "problem solving"],
  ["pensamiento crítico", "critical thinking"],
  ["creatividad", "creativity"],
  ["adaptabilidad", "adaptability"],
  ["proactividad", "proactivity"],
  ["negociación", "negotiation"],
  ["presentación", "presentation"],
  ["colaboración", "collaboration"],

  // Business
  ["marketing", "marketing"],
  ["ventas", "sales"],
  ["estrategia", "strategy"],
  ["planificación", "planning"],
  ["presupuesto", "budget"],
  ["finanzas", "finance"],
  ["contabilidad", "accounting"],
  ["recursos humanos", "human resources"],
  ["reclutamiento", "recruitment"],
  ["emprendimiento", "entrepreneurship"],
  ["startup", "startup"],
  ["innovación", "innovation"],
  ["investigación", "research"],
  ["consultoría", "consulting"],
  ["logística", "logistics"],
  ["operaciones", "operations"],
  ["cadena de suministro", "supply chain"],
  ["atención al cliente", "customer service"],
  ["experiencia de usuario", "user experience"],
  ["diseño", "design"],
  ["producto", "product"],

  // Academic
  ["tesis", "thesis"],
  ["publicación", "publication"],
  ["investigación", "research"],
  ["doctorado", "phd"],
  ["maestría", "master's degree"],
  ["licenciatura", "bachelor's degree"],
  ["posgrado", "postgraduate"],
  ["beca", "scholarship"],
  ["pasantía", "internship"],
  ["prácticas", "internship"],
  ["voluntariado", "volunteering"],
  ["servicio social", "community service"],

  // Impact
  ["impacto social", "social impact"],
  ["sostenibilidad", "sustainability"],
  ["desarrollo sostenible", "sustainable development"],
  ["medio ambiente", "environment"],
  ["responsabilidad social", "social responsibility"],
  ["inclusión", "inclusion"],
  ["diversidad", "diversity"],
  ["equidad", "equity"],
  ["comunidad", "community"],
  ["ong", "ngo"],

  // ES synonyms
  ["gestionar", "administrar"],
  ["implementar", "ejecutar"],
  ["desarrollar", "crear"],
  ["optimizar", "mejorar"],
  ["analizar", "evaluar"],
  ["coordinar", "organizar"],
  ["liderar", "dirigir"],
  ["diseñar", "crear"],
  ["automatizar", "sistematizar"],
  ["monitorear", "supervisar"],
  ["capacitar", "entrenar"],
  ["mentor", "mentoría"],
  ["asesorar", "consultar"],
  ["redactar", "escribir"],
  ["negociar", "acordar"],

  // Action verbs es/en
  ["logro", "achievement"],
  ["resultado", "result"],
  ["meta", "goal"],
  ["objetivo", "objective"],
  ["indicador", "indicator"],
  ["métrica", "metric"],
  ["kpi", "kpi"],
  ["roi", "roi"],
  ["crecimiento", "growth"],
  ["reducción", "reduction"],
  ["ahorro", "savings"],
  ["eficiencia", "efficiency"],
  ["productividad", "productivity"],
  ["calidad", "quality"],
  ["escalabilidad", "scalability"],
  ["rendimiento", "performance"],

  // Tools/platforms
  ["excel", "spreadsheets"],
  ["hojas de cálculo", "spreadsheets"],
  ["presentaciones", "presentations"],
  ["gestión de proyectos", "project management"],
  ["scrum", "agile"],
  ["metodología ágil", "agile methodology"],
  ["kanban", "kanban"],

  // Roles
  ["analista", "analyst"],
  ["ingeniero", "engineer"],
  ["desarrollador", "developer"],
  ["programador", "programmer"],
  ["diseñador", "designer"],
  ["investigador", "researcher"],
  ["consultor", "consultant"],
  ["docente", "teacher"],
  ["profesor", "professor"],
  ["mentor", "mentor"],
  ["becario", "fellow"],
  ["pasante", "intern"],
  ["freelance", "freelancer"],
  ["emprendedor", "entrepreneur"],
  ["fundador", "founder"],
  ["cofundador", "co-founder"],

  // Certifications
  ["certificación", "certification"],
  ["certificado", "certificate"],
  ["acreditación", "accreditation"],
  ["diploma", "diploma"],
  ["curso", "course"],
  ["taller", "workshop"],
  ["seminario", "seminar"],
  ["conferencia", "conference"],
  ["congreso", "congress"],
  ["hackathon", "hackathon"],

  // Misc
  ["remoto", "remote"],
  ["presencial", "on-site"],
  ["híbrido", "hybrid"],
  ["tiempo completo", "full-time"],
  ["medio tiempo", "part-time"],
  ["contrato", "contract"],
  ["permanente", "permanent"],
  ["bilingüe", "bilingual"],
  ["idioma", "language"],
  ["inglés", "english"],
  ["español", "spanish"],
  ["portugués", "portuguese"],
  ["francés", "french"],
];

const synonymMap = new Map<string, Set<string>>();

for (const [a, b] of SYNONYMS) {
  const la = a.toLowerCase();
  const lb = b.toLowerCase();
  if (!synonymMap.has(la)) synonymMap.set(la, new Set());
  if (!synonymMap.has(lb)) synonymMap.set(lb, new Set());
  synonymMap.get(la)!.add(lb);
  synonymMap.get(lb)!.add(la);
}

export function getSynonyms(word: string): string[] {
  return Array.from(synonymMap.get(word.toLowerCase()) ?? []);
}

export function hasSynonymMatch(text: string, keyword: string): boolean {
  const lower = text.toLowerCase();
  const kl = keyword.toLowerCase();
  if (lower.includes(kl)) return true;
  const syns = synonymMap.get(kl);
  if (!syns) return false;
  return Array.from(syns).some((s) => lower.includes(s));
}
