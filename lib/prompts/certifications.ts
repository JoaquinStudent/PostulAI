// ponytail: static skill — 0 AI tokens, injected into PR-09 system prompt
// Comprehensive certification catalog from verified entities
// Compact prompt output ~500 tokens vs AI looking them up each time

interface CertEntry {
  name: string;
  detail: string;
}

interface CertGroup {
  entity: string;
  access: string;
  certs: CertEntry[];
}

const CERT_CATALOG: CertGroup[] = [
  {
    entity: "Google",
    access: "Coursera, auditar gratis, cert ~$50/mes",
    certs: [
      { name: "Data Analytics", detail: "6mo" },
      { name: "IT Support", detail: "6mo" },
      { name: "UX Design", detail: "6mo" },
      { name: "Project Management", detail: "6mo" },
      { name: "Digital Marketing & E-commerce", detail: "6mo" },
      { name: "Cybersecurity", detail: "6mo" },
      { name: "Advanced Data Analytics", detail: "6mo" },
      { name: "Business Intelligence", detail: "3mo" },
      { name: "AI Essentials", detail: "1mo" },
    ],
  },
  {
    entity: "Google",
    access: "Skillshop, 100% gratis",
    certs: [
      { name: "Google Ads", detail: "~40h" },
      { name: "Google Analytics", detail: "~20h" },
      { name: "Cloud Digital Leader", detail: "examen ~$99, ~30h" },
    ],
  },
  {
    entity: "Microsoft",
    access: "Microsoft Learn gratis, examen ~$165",
    certs: [
      { name: "AZ-900 Azure Fundamentals", detail: "~20h" },
      { name: "AI-900 AI Fundamentals", detail: "~15h" },
      { name: "DP-900 Data Fundamentals", detail: "~15h" },
      { name: "SC-900 Security Fundamentals", detail: "~15h" },
      { name: "PL-900 Power Platform", detail: "~15h" },
      { name: "Power BI Data Analyst (PL-300)", detail: "~40h" },
      { name: "AZ-204 Azure Developer Associate", detail: "~60h, intermedio" },
    ],
  },
  {
    entity: "IBM",
    access: "Coursera, auditar gratis, cert ~$50/mes",
    certs: [
      { name: "Data Science Professional", detail: "10mo" },
      { name: "Full Stack Software Developer", detail: "12mo" },
      { name: "AI Engineering Professional", detail: "8mo" },
      { name: "Data Analyst Professional", detail: "5mo" },
      { name: "Cybersecurity Analyst", detail: "8mo" },
      { name: "Data Engineering Professional", detail: "7mo" },
    ],
  },
  {
    entity: "Cisco",
    access: "Networking Academy",
    certs: [
      { name: "Intro to Cybersecurity", detail: "gratis, ~15h" },
      { name: "Intro to IoT", detail: "gratis, ~20h" },
      { name: "Networking Basics", detail: "gratis, ~70h" },
      { name: "CyberOps Associate", detail: "examen ~$330" },
      { name: "CCNA", detail: "examen ~$330, ~120h" },
    ],
  },
  {
    entity: "Harvard",
    access: "edX, auditar gratis, cert ~$149",
    certs: [
      { name: "CS50 Intro to Computer Science", detail: "12sem" },
      { name: "CS50 Web Programming", detail: "12sem" },
      { name: "CS50 AI with Python", detail: "7sem" },
      { name: "CS50 Python", detail: "9sem" },
      { name: "Data Science Professional Certificate", detail: "~$800 total, 1año" },
    ],
  },
  {
    entity: "AWS",
    access: "Skill Builder gratis, exámenes pagos",
    certs: [
      { name: "Cloud Practitioner", detail: "examen ~$100, ~20h" },
      { name: "Solutions Architect Associate", detail: "examen ~$150, ~40h" },
      { name: "ML Foundations", detail: "gratis, ~20h" },
      { name: "re/Start Program", detail: "gratis, bootcamp 12sem" },
    ],
  },
  {
    entity: "Meta",
    access: "Coursera, auditar gratis, cert ~$50/mes",
    certs: [
      { name: "Front-End Developer", detail: "7mo" },
      { name: "Back-End Developer", detail: "8mo" },
      { name: "Database Engineer", detail: "7mo" },
      { name: "Social Media Marketing", detail: "7mo" },
    ],
  },
  {
    entity: "Stanford / deeplearning.ai",
    access: "Coursera, auditar gratis, cert ~$50/mes",
    certs: [
      { name: "Machine Learning Specialization", detail: "3mo" },
      { name: "Deep Learning Specialization", detail: "4mo" },
      { name: "AI for Everyone", detail: "1mo" },
    ],
  },
  {
    entity: "freeCodeCamp",
    access: "100% gratis, certificados verificables",
    certs: [
      { name: "Responsive Web Design", detail: "~300h" },
      { name: "JavaScript Algorithms", detail: "~300h" },
      { name: "Front End Libraries", detail: "~300h" },
      { name: "Data Visualization", detail: "~300h" },
      { name: "Scientific Computing with Python", detail: "~300h" },
      { name: "Machine Learning with Python", detail: "~300h" },
    ],
  },
  {
    entity: "Oracle",
    access: "Oracle University",
    certs: [
      { name: "OCI Foundations Associate", detail: "gratis, ~10h" },
      { name: "Java SE Programmer", detail: "examen ~$245" },
    ],
  },
  {
    entity: "Salesforce",
    access: "Trailhead gratis, exámenes pagos",
    certs: [
      { name: "Administrator", detail: "examen ~$200, ~100h" },
      { name: "Platform Developer I", detail: "examen ~$200" },
      { name: "Trailhead Badges & Superbadges", detail: "gratis" },
    ],
  },
  {
    entity: "Linux Foundation",
    access: "edX / LF Training",
    certs: [
      { name: "Intro to Linux (LFS101)", detail: "gratis, ~60h" },
      { name: "Kubernetes Admin (CKA)", detail: "examen ~$395" },
      { name: "Kubernetes App Developer (CKAD)", detail: "examen ~$395" },
    ],
  },
  {
    entity: "Platzi",
    access: "en español, ~$25/mes, enfoque LATAM",
    certs: [
      { name: "Rutas de Desarrollo Web", detail: "~6mo" },
      { name: "Rutas de Data Science & ML", detail: "~6mo" },
      { name: "Rutas de Cloud Computing", detail: "~4mo" },
      { name: "Rutas de Marketing Digital", detail: "~3mo" },
    ],
  },
  {
    entity: "Alura LATAM",
    access: "en español, ~$20/mes, Oracle ONE partner",
    certs: [
      { name: "Formación Java", detail: "~4mo" },
      { name: "Formación Front End", detail: "~4mo" },
      { name: "Formación Data Science", detail: "~4mo" },
    ],
  },
  // Social, salud, sostenibilidad
  {
    entity: "ONU",
    access: "SDG:Learn, 100% gratis",
    certs: [
      { name: "ODS y Agenda 2030", detail: "~10h" },
      { name: "Cambio Climático (UN CC:Learn)", detail: "~20h" },
      { name: "Derechos Humanos (OHCHR)", detail: "~15h" },
      { name: "Género e Igualdad (UN Women)", detail: "~10h" },
    ],
  },
  {
    entity: "OMS / WHO",
    access: "OpenWHO, 100% gratis",
    certs: [
      { name: "Salud Pública en Emergencias", detail: "~8h" },
      { name: "Preparación ante Pandemias", detail: "~10h" },
      { name: "One Health", detail: "~6h" },
      { name: "Salud Mental", detail: "~5h" },
    ],
  },
  {
    entity: "World Bank",
    access: "Open Learning Campus, 100% gratis",
    certs: [
      { name: "Climate Change", detail: "~10h" },
      { name: "Data for Development", detail: "~8h" },
      { name: "Public-Private Partnerships", detail: "~12h" },
    ],
  },
  {
    entity: "Johns Hopkins",
    access: "Coursera, auditar gratis, cert ~$50/mes",
    certs: [
      { name: "Public Health Specialization", detail: "5mo" },
      { name: "Data Science Specialization", detail: "10mo" },
      { name: "Patient Safety", detail: "1mo" },
    ],
  },
  {
    entity: "Scrum.org",
    access: "prep gratis en su web",
    certs: [
      { name: "PSM I (Professional Scrum Master)", detail: "examen ~$150" },
      { name: "PSPO I (Product Owner)", detail: "examen ~$200" },
    ],
  },
  {
    entity: "TryHackMe / Hack The Box",
    access: "labs gratis, premium ~$10-14/mes",
    certs: [
      { name: "TryHackMe SOC Level 1 Path", detail: "~40h" },
      { name: "TryHackMe Jr Penetration Tester", detail: "~40h" },
      { name: "HTB Certified Penetration Testing Specialist", detail: "examen ~$210" },
    ],
  },
];

// ponytail: compact output ~550 tokens, one line per entity group
export function getCertificationsBlock(): string {
  return CERT_CATALOG
    .map(
      (g) =>
        `${g.entity} (${g.access}): ${g.certs.map((c) => `${c.name} ${c.detail}`).join(" | ")}`,
    )
    .join("\n");
}
