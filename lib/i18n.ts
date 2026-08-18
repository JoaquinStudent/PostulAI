import { create } from "zustand";

export type Locale = "es" | "en" | "pt" | "fr";

export const LOCALE_LABELS: Record<Locale, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
  fr: "Français",
};

interface I18nState {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

export const useI18n = create<I18nState>((set) => ({
  locale: (typeof window !== "undefined"
    ? (localStorage.getItem("locale") as Locale) ?? "es"
    : "es") as Locale,
  setLocale: (l) => {
    localStorage.setItem("locale", l);
    set({ locale: l });
  },
}));

// ponytail: flat dict, Spanish keys are the source of truth
type Dict = Record<string, string>;

const en: Dict = {
  // Nav / global
  "Empezar gratis": "Start free",
  Empezar: "Start",
  "Empezar ahora": "Start now",
  "Ver cómo funciona": "See how it works",
  "Cómo funciona": "How it works",
  Funciones: "Features",
  Seguridad: "Security",
  Tema: "Theme",

  // Hero
  "IA que trabaja para ti": "AI that works for you",
  "Tu copiloto": "Your copilot",
  "para postulaciones.": "for applications.",
  "Analiza convocatorias, evalúa tu encaje, mejora tu CV o portafolio, prepara tu pitch y redacta respuestas con evidencia real.":
    "Analyze opportunities, evaluate your fit, improve your CV or portfolio, prepare your pitch and draft answers with real evidence.",
  "Sin registro · Sin servidor · Tu clave API, tu control":
    "No sign-up · No server · Your API key, your control",
  "Solo necesitas una clave de OpenRouter":
    "You only need an OpenRouter key",

  // Stats
  "Menos tiempo": "Less time",
  "Método estándar": "Standard method",
  Privacidad: "Privacy",
  "Todo en tu navegador": "All in your browser",
  "Situación + Resultado": "Situation + Result",

  // How it works
  "CÓMO FUNCIONA": "HOW IT WORKS",
  "Tres pasos. Cero fricción.": "Three steps. Zero friction.",
  "De tener 10 convocatorias abiertas a saber tu encaje, mejorar tu perfil y tener las respuestas listas.":
    "From having 10 open calls to knowing your fit, improving your profile and having answers ready.",
  "Sube tu perfil": "Upload your profile",
  "Tu contexto profesional y CV o portafolio. PostulAI lo usa como única fuente de verdad — nunca inventa datos.":
    "Your professional context and CV or portfolio. PostulAI uses it as the single source of truth — never invents data.",
  "Agrega convocatorias": "Add opportunities",
  "URLs, PDFs o texto pegado. Extrae requisitos, evalúa tu encaje y te dice qué mejorar en tu perfil.":
    "URLs, PDFs or pasted text. Extracts requirements, evaluates your fit and tells you what to improve.",
  "Prepara y postula": "Prepare and apply",
  "Pitch personalizado, tips de entrevista, mejoras de CV o portafolio, y respuestas listas para copiar.":
    "Personalized pitch, interview tips, CV or portfolio improvements, and ready-to-copy answers.",

  // Features
  FUNCIONES: "FEATURES",
  "Más que rellenar campos": "More than filling fields",
  "Análisis por sector, coaching de perfil y respuestas que venden tu experiencia real con precisión.":
    "Sector analysis, profile coaching and answers that sell your real experience with precision.",
  "Análisis de encaje": "Fit analysis",
  "Cruza tu perfil con los criterios de cada convocatoria y te dice tu porcentaje de coincidencia.":
    "Crosses your profile with each opportunity's criteria and gives your match percentage.",
  "CV o portafolio": "CV or portfolio",
  "Para empleos y becas mejora tu CV. Para hackathons y aceleradoras te recomienda proyectos concretos.":
    "For jobs and scholarships it improves your CV. For hackathons and accelerators it recommends concrete projects.",
  "Elevator pitch": "Elevator pitch",
  "Pitch personalizado con tus datos reales, adaptado al sector. Estructura lista para practicar.":
    "Personalized pitch with your real data, adapted to the sector. Ready-to-practice structure.",
  "Tips de entrevista": "Interview tips",
  "Consejos específicos para cada convocatoria basados en tus fortalezas y gaps reales.":
    "Specific tips for each opportunity based on your real strengths and gaps.",
  "Coaching de perfil": "Profile coaching",
  "Certificaciones, habilidades y experiencias alcanzables que mejoran tu encaje con cada oportunidad.":
    "Certifications, skills and achievable experiences that improve your fit with each opportunity.",
  "Respuestas calibradas": "Calibrated answers",
  "Método STAR con evidencia real, ajustadas al límite exacto de cada campo. Listas para copiar.":
    "STAR method with real evidence, adjusted to the exact limit of each field. Ready to copy.",

  // Security
  "Privacidad por diseño": "Privacy by design",
  "Tu clave API": "Your API key",
  "nunca toca un servidor": "never touches a server",
  "PostulAI es 100% cliente. Tu clave va directo de tu navegador a OpenRouter. No hay backend, no hay proxy.":
    "PostulAI is 100% client-side. Your key goes directly from your browser to OpenRouter. No backend, no proxy.",
  "Sin cuenta ni registro": "No account or sign-up",
  "No hay base de datos de usuarios. Empiezas directamente.":
    "No user database. You start directly.",
  "Cifrado local opcional": "Optional local encryption",
  "AES-256-GCM en tu navegador. La clave nunca sale en texto plano.":
    "AES-256-GCM in your browser. The key never leaves in plain text.",
  "Sesión temporal": "Temporary session",
  "Al cerrar la pestaña, contexto, clave y respuestas desaparecen.":
    "When you close the tab, context, key and answers disappear.",
  "Código abierto": "Open source",
  "Todo el código es auditable. Sin telemetría, sin tracking.":
    "All code is auditable. No telemetry, no tracking.",

  // CTA
  "Mejora tu perfil.": "Improve your profile.",
  "Postula con confianza.": "Apply with confidence.",
  "PostulAI analiza, te prepara y redacta. Tú revisas y envías.":
    "PostulAI analyzes, prepares and writes. You review and send.",

  // Footer
  "— Tu copiloto de postulaciones con IA":
    "— Your AI-powered application copilot",
  "Todo ocurre en tu navegador · Nada se guarda al cerrar":
    "Everything happens in your browser · Nothing saved on close",

  // Social proof
  Hackathons: "Hackathons",
  Becas: "Scholarships",
  Aceleradoras: "Accelerators",
  Voluntariados: "Volunteering",
  Empleos: "Jobs",
  Eventos: "Events",

  // Context page
  "Tu contexto profesional": "Your professional context",
  "Sube o pega tu contexto — tu perfil, CV, portafolio, o lo que mejor te describa.":
    "Upload or paste your context — your profile, CV, portfolio, or whatever best describes you.",
  Contexto: "Context",
  Conectar: "Connect",
  Analizar: "Analyze",
  "Arrastra tu archivo o haz clic para seleccionar":
    "Drag your file or click to select",
  "Markdown (.md), texto (.txt) o PDF — máximo 100 KB":
    "Markdown (.md), text (.txt) or PDF — max 100 KB",
  "O pega tu contexto aquí": "Or paste your context here",
  Continuar: "Continue",
  "Incluye números": "Include numbers",
  "Agrega tus enlaces": "Add your links",
  "Universidad y ciclo": "University and cycle",
  "Premios y fracasos": "Awards and failures",
  "Aún no tienes contexto?": "Don't have context yet?",
  "Genera tu contexto con IA": "Generate your context with AI",

  // Connect page
  "Conecta tu proveedor de IA": "Connect your AI provider",
  "Elige tu plan de consumo": "Choose your usage plan",
  "Tú pones la clave y tú pagas el consumo. PostulAI no cobra ni intermedia.":
    "You provide the key and pay usage. PostulAI doesn't charge or mediate.",
  "Elige qué modelos usar. Análisis = extracción y evaluación. Redacción = generar respuestas.":
    "Choose models. Analysis = extraction and evaluation. Writing = generate answers.",
  "Conectar con OpenRouter": "Connect with OpenRouter",
  "Pegar una clave manualmente": "Paste a key manually",
  "Dónde guardar la clave": "Where to save the key",
  "Solo durante esta sesión": "This session only",
  "(recomendado)": "(recommended)",
  "Hasta cerrar la pestaña": "Until tab is closed",
  "Guardar cifrada con una contraseña": "Save encrypted with a password",
  Siguiente: "Next",
  Volver: "Back",
  "Empezar a postular": "Start applying",
  "Personalizar modelos": "Customize models",
  Recomendado: "Recommended",
  "Modelo de análisis": "Analysis model",
  "Modelo de redacción": "Writing model",

  // Batch page
  "¿A qué estás postulando?": "What are you applying to?",
  "Elige el tipo de oportunidad y agrega tus convocatorias. Cada sector usa una estrategia de análisis distinta.":
    "Choose opportunity type and add your calls. Each sector uses a different analysis strategy.",
  Empleo: "Job",
  Beca: "Scholarship",
  Hackathon: "Hackathon",
  Aceleradora: "Accelerator",
  Evento: "Event",
  Voluntariado: "Volunteering",
  Otro: "Other",
  "Subir PDF": "Upload PDF",
  "Pegar texto": "Paste text",
  ANALIZAR: "ANALYZE",
  "Ver resultados": "View results",
  "AGREGAR MÁS": "ADD MORE",
  DESCARGAR: "DOWNLOAD",
  Encaje: "Fit",
  "Fecha límite": "Deadline",
  Esfuerzo: "Effort",
  "convocatorias analizadas": "opportunities analyzed",

  // Opportunity detail page
  "RESPONDER FORMULARIO": "ANSWER FORM",
  "Resumen ejecutivo": "Executive summary",
  Fortalezas: "Strengths",
  "Gaps a mejorar": "Gaps to improve",
  "Proyectos recomendados": "Recommended projects",

  // Settings
  Ajustes: "Settings",
  "Proveedor de IA": "AI Provider",
  "Tu contexto": "Your context",
  Conectada: "Connected",
  Reemplazar: "Replace",
  Desconectar: "Disconnect",
  "Créditos restantes": "Remaining credits",
  "Combinaciones recomendadas": "Recommended combinations",
  "O elige por separado": "Or choose separately",
  "Borrar todo": "Delete all",
  "Borrar todos mis datos": "Delete all my data",
  "Confirmar borrado": "Confirm deletion",
  Cancelar: "Cancel",

  // Prepare page
  "Pega las preguntas del formulario":
    "Paste the form questions",
  "Generando respuesta...": "Generating answer...",
  Aprobar: "Approve",
  "Copiar respuesta": "Copy answer",
  "Generar respuesta": "Generate answer",

  // Context page
  "Arma tu contexto una sola vez": "Build your context once",
  "Es un archivo de texto con quién eres, qué has hecho y en qué eres bueno; se reutiliza en todas tus postulaciones.":
    "A text file with who you are, what you've done and what you're good at; reused across all your applications.",
  "Prompt generador": "Generator prompt",
  Copiado: "Copied",
  Copiar: "Copy",
  '"Aumenté la eficiencia un 20%" es mejor que "mejoré procesos". Datos concretos dan credibilidad.':
    '"I increased efficiency by 20%" is better than "I improved processes." Concrete data adds credibility.',
  "LinkedIn, GitHub, portafolio, proyectos con demo. Son evidencia verificable que fortalece tu perfil.":
    "LinkedIn, GitHub, portfolio, demo projects. Verifiable evidence that strengthens your profile.",
  "Carrera, semestre actual, año de ingreso y egreso. Muchas becas y convocatorias filtran por esto.":
    "Degree, current semester, start and end year. Many scholarships and calls filter by this.",
  "Reconocimientos, becas previas, y también qué salió mal. Los evaluadores valoran ambos.":
    "Awards, previous scholarships, and also what went wrong. Evaluators value both.",
  "Sirve cualquier IA (ChatGPT, Claude, Gemini) y el resultado debe guardarse como archivo .md para adjuntarlo en el siguiente paso.":
    "Any AI works (ChatGPT, Claude, Gemini) and the result should be saved as a .md file to attach in the next step.",
  "Ya tengo mi archivo": "I already have my file",
  "Adjunta tu contexto": "Attach your context",
  "Se lee en tu navegador y se descarta al cerrar. No se sube a ningún servidor.":
    "Read in your browser and discarded on close. Not uploaded to any server.",
  "Analizando contexto...": "Analyzing context...",
  "Lo que PostulAI leyó": "What PostulAI read",
  "CV (opcional)": "CV (optional)",
  "Sube tu CV en PDF y PostulAI te dirá qué cambiar para cada convocatoria.":
    "Upload your CV as PDF and PostulAI will tell you what to change for each opportunity.",
  "PostulAI analizará tu CV contra cada convocatoria y te recomendará qué mejorar.":
    "PostulAI will analyze your CV against each opportunity and recommend improvements.",
  "palabras extraídas": "words extracted",
  Quitar: "Remove",
  "Subir CV en PDF": "Upload CV as PDF",
  "Leyendo PDF...": "Reading PDF...",
  "Recordar mi contexto en este dispositivo": "Remember my context on this device",
  "Se guarda solo en este navegador. Puedes borrarlo cuando quieras desde ajustes.":
    "Saved only in this browser. You can delete it anytime from settings.",
  "Validando...": "Validating...",
  "Elige combinaciones específicas": "Choose specific combinations",
  "Leyendo...": "Reading...",

  // Settings
  "Extracción, encaje, gaps": "Extraction, fit, gaps",
  "Generación y refinamiento": "Generation and refinement",

  // Detail page
  Análisis: "Analysis",
  "Preparación": "Preparation",
  "Mejora tu perfil": "Improve your profile",
  "Qué buscan": "What they look for",
  "Criterios de evaluación": "Evaluation criteria",
  "Tono esperado": "Expected tone",
  "Señales de alerta": "Red flags",
  "Tips para esta convocatoria": "Tips for this opportunity",
  "Tu elevator pitch": "Your elevator pitch",
  "Certificaciones recomendadas": "Recommended certifications",
  "Habilidades a desarrollar": "Skills to develop",
  "Experiencias sugeridas": "Suggested experiences",
  "Cambios en tu CV": "CV changes",
  Carta: "Cover letter",
  "Carta de presentación": "Cover letter",
  "Genera una carta personalizada para esta convocatoria basada en tu contexto y el análisis de encaje.": "Generate a personalized cover letter based on your context and fit analysis.",
  "Generar carta": "Generate letter",
  "Generando...": "Generating...",
  Regenerar: "Regenerate",
  palabras: "words",
  "Diagnóstico de contexto": "Context diagnosis",
  "0 tokens AI": "0 AI tokens",
  Completitud: "Completeness",
  Métricas: "Metrics",
  "Evidencia verificable": "Verifiable evidence",
  "Línea temporal": "Timeline",
  "Cobertura sectorial": "Sector coverage",
  "Simulador de entrevista": "Interview simulator",
  preguntas: "questions",
  "Ver consejo": "View tip",
  "Escribe tu respuesta para practicar...": "Write your answer to practice...",
  "Evaluando...": "Evaluating...",
  "Evaluar con IA": "Evaluate with AI",
  "A mejorar": "To improve",
  "Respuesta modelo": "Model answer",
  "LinkedIn optimizado": "Optimized LinkedIn",
  Titular: "Headline",
  Resumen: "Summary",
  "Tracker de postulaciones": "Application tracker",
  oportunidades: "opportunities",
  Comparar: "Compare",
  "Analiza oportunidades en": "Analyze opportunities in",
  "para empezar a trackear.": "to start tracking.",
  Investigando: "Researching",
  Analizando: "Analyzing",
  Postulando: "Applying",
  Enviada: "Sent",
  Entrevista: "Interview",
  Resultado: "Result",
};

const pt: Dict = {
  "Empezar gratis": "Começar grátis",
  Empezar: "Começar",
  "Empezar ahora": "Começar agora",
  "Ver cómo funciona": "Veja como funciona",
  "Cómo funciona": "Como funciona",
  Funciones: "Funcionalidades",
  Seguridad: "Segurança",
  Tema: "Tema",
  "IA que trabaja para ti": "IA que trabalha para você",
  "Tu copiloto": "Seu copiloto",
  "para postulaciones.": "para candidaturas.",
  "Analiza convocatorias, evalúa tu encaje, mejora tu CV o portafolio, prepara tu pitch y redacta respuestas con evidencia real.":
    "Analisa oportunidades, avalia seu encaixe, melhora seu CV ou portfólio, prepara seu pitch e redige respostas com evidência real.",
  "Sin registro · Sin servidor · Tu clave API, tu control":
    "Sem cadastro · Sem servidor · Sua chave API, seu controle",
  "Solo necesitas una clave de OpenRouter":
    "Você só precisa de uma chave OpenRouter",
  "Menos tiempo": "Menos tempo",
  "Método estándar": "Método padrão",
  Privacidad: "Privacidade",
  "Todo en tu navegador": "Tudo no seu navegador",
  "Situación + Resultado": "Situação + Resultado",
  "CÓMO FUNCIONA": "COMO FUNCIONA",
  "Tres pasos. Cero fricción.": "Três passos. Zero fricção.",
  "De tener 10 convocatorias abiertas a saber tu encaje, mejorar tu perfil y tener las respuestas listas.":
    "De ter 10 oportunidades abertas a saber seu encaixe, melhorar seu perfil e ter as respostas prontas.",
  "Sube tu perfil": "Envie seu perfil",
  "Tu contexto profesional y CV o portafolio. PostulAI lo usa como única fuente de verdad — nunca inventa datos.":
    "Seu contexto profissional e CV ou portfólio. PostulAI usa como única fonte de verdade — nunca inventa dados.",
  "Agrega convocatorias": "Adicione oportunidades",
  "URLs, PDFs o texto pegado. Extrae requisitos, evalúa tu encaje y te dice qué mejorar en tu perfil.":
    "URLs, PDFs ou texto colado. Extrai requisitos, avalia seu encaixe e diz o que melhorar no seu perfil.",
  "Prepara y postula": "Prepare e candidate-se",
  "Pitch personalizado, tips de entrevista, mejoras de CV o portafolio, y respuestas listas para copiar.":
    "Pitch personalizado, dicas de entrevista, melhorias de CV ou portfólio, e respostas prontas para copiar.",
  FUNCIONES: "FUNCIONALIDADES",
  "Más que rellenar campos": "Mais do que preencher campos",
  "Análisis por sector, coaching de perfil y respuestas que venden tu experiencia real con precisión.":
    "Análise por setor, coaching de perfil e respostas que vendem sua experiência real com precisão.",
  "Análisis de encaje": "Análise de encaixe",
  "Cruza tu perfil con los criterios de cada convocatoria y te dice tu porcentaje de coincidencia.":
    "Cruza seu perfil com os critérios de cada oportunidade e mostra sua porcentagem de compatibilidade.",
  "CV o portafolio": "CV ou portfólio",
  "Para empleos y becas mejora tu CV. Para hackathons y aceleradoras te recomienda proyectos concretos.":
    "Para empregos e bolsas melhora seu CV. Para hackathons e aceleradoras recomenda projetos concretos.",
  "Elevator pitch": "Elevator pitch",
  "Pitch personalizado con tus datos reales, adaptado al sector. Estructura lista para practicar.":
    "Pitch personalizado com seus dados reais, adaptado ao setor. Estrutura pronta para praticar.",
  "Tips de entrevista": "Dicas de entrevista",
  "Consejos específicos para cada convocatoria basados en tus fortalezas y gaps reales.":
    "Dicas específicas para cada oportunidade baseadas em suas forças e lacunas reais.",
  "Coaching de perfil": "Coaching de perfil",
  "Certificaciones, habilidades y experiencias alcanzables que mejoran tu encaje con cada oportunidad.":
    "Certificações, habilidades e experiências alcançáveis que melhoram seu encaixe com cada oportunidade.",
  "Respuestas calibradas": "Respostas calibradas",
  "Método STAR con evidencia real, ajustadas al límite exacto de cada campo. Listas para copiar.":
    "Método STAR com evidência real, ajustadas ao limite exato de cada campo. Prontas para copiar.",
  "Privacidad por diseño": "Privacidade por design",
  "Tu clave API": "Sua chave API",
  "nunca toca un servidor": "nunca toca um servidor",
  "PostulAI es 100% cliente. Tu clave va directo de tu navegador a OpenRouter. No hay backend, no hay proxy.":
    "PostulAI é 100% cliente. Sua chave vai direto do seu navegador ao OpenRouter. Sem backend, sem proxy.",
  "Sin cuenta ni registro": "Sem conta ou cadastro",
  "No hay base de datos de usuarios. Empiezas directamente.":
    "Sem banco de dados de usuários. Você começa diretamente.",
  "Cifrado local opcional": "Criptografia local opcional",
  "AES-256-GCM en tu navegador. La clave nunca sale en texto plano.":
    "AES-256-GCM no seu navegador. A chave nunca sai em texto plano.",
  "Sesión temporal": "Sessão temporária",
  "Al cerrar la pestaña, contexto, clave y respuestas desaparecen.":
    "Ao fechar a aba, contexto, chave e respostas desaparecem.",
  "Código abierto": "Código aberto",
  "Todo el código es auditable. Sin telemetría, sin tracking.":
    "Todo o código é auditável. Sem telemetria, sem rastreamento.",
  "Mejora tu perfil.": "Melhore seu perfil.",
  "Postula con confianza.": "Candidate-se com confiança.",
  "PostulAI analiza, te prepara y redacta. Tú revisas y envías.":
    "PostulAI analisa, prepara e redige. Você revisa e envia.",
  "— Tu copiloto de postulaciones con IA": "— Seu copiloto de candidaturas com IA",
  "Todo ocurre en tu navegador · Nada se guarda al cerrar":
    "Tudo acontece no seu navegador · Nada é salvo ao fechar",
  Hackathons: "Hackathons",
  Becas: "Bolsas",
  Aceleradoras: "Aceleradoras",
  Voluntariados: "Voluntariados",
  Empleos: "Empregos",
  Eventos: "Eventos",
  "Tu contexto profesional": "Seu contexto profissional",
  "Sube o pega tu contexto — tu perfil, CV, portafolio, o lo que mejor te describa.":
    "Envie ou cole seu contexto — seu perfil, CV, portfólio, ou o que melhor te descreva.",
  Contexto: "Contexto",
  Conectar: "Conectar",
  Analizar: "Analisar",
  "Arrastra tu archivo o haz clic para seleccionar":
    "Arraste seu arquivo ou clique para selecionar",
  "Markdown (.md), texto (.txt) o PDF — máximo 100 KB":
    "Markdown (.md), texto (.txt) ou PDF — máximo 100 KB",
  "O pega tu contexto aquí": "Ou cole seu contexto aqui",
  "Incluye números": "Inclua números",
  "Agrega tus enlaces": "Adicione seus links",
  "Universidad y ciclo": "Universidade e ciclo",
  "Premios y fracasos": "Prêmios e fracassos",
  "Aún no tienes contexto?": "Ainda não tem contexto?",
  "Genera tu contexto con IA": "Gere seu contexto com IA",
  "Conecta tu proveedor de IA": "Conecte seu provedor de IA",
  "Elige tu plan de consumo": "Escolha seu plano de consumo",
  "Tú pones la clave y tú pagas el consumo. PostulAI no cobra ni intermedia.":
    "Você coloca a chave e paga o consumo. PostulAI não cobra nem intermedia.",
  "Elige qué modelos usar. Análisis = extracción y evaluación. Redacción = generar respuestas.":
    "Escolha os modelos. Análise = extração e avaliação. Redação = gerar respostas.",
  "Conectar con OpenRouter": "Conectar com OpenRouter",
  "Pegar una clave manualmente": "Colar uma chave manualmente",
  "Dónde guardar la clave": "Onde salvar a chave",
  "Solo durante esta sesión": "Apenas durante esta sessão",
  "(recomendado)": "(recomendado)",
  "Hasta cerrar la pestaña": "Até fechar a aba",
  "Guardar cifrada con una contraseña": "Salvar criptografada com uma senha",
  "Empezar a postular": "Começar a se candidatar",
  "Personalizar modelos": "Personalizar modelos",
  Recomendado: "Recomendado",
  "Modelo de análisis": "Modelo de análise",
  "Modelo de redacción": "Modelo de redação",
  "¿A qué estás postulando?": "Para o que você está se candidatando?",
  "Elige el tipo de oportunidad y agrega tus convocatorias. Cada sector usa una estrategia de análisis distinta.":
    "Escolha o tipo de oportunidade e adicione suas convocatórias. Cada setor usa uma estratégia de análise diferente.",
  Empleo: "Emprego",
  Beca: "Bolsa",
  Hackathon: "Hackathon",
  Aceleradora: "Aceleradora",
  Evento: "Evento",
  Voluntariado: "Voluntariado",
  Otro: "Outro",
  "Subir PDF": "Enviar PDF",
  "Pegar texto": "Colar texto",
  ANALIZAR: "ANALISAR",
  "Ver resultados": "Ver resultados",
  "AGREGAR MÁS": "ADICIONAR MAIS",
  DESCARGAR: "BAIXAR",
  Encaje: "Encaixe",
  "Fecha límite": "Prazo",
  Esfuerzo: "Esforço",
  "convocatorias analizadas": "oportunidades analisadas",
  "RESPONDER FORMULARIO": "RESPONDER FORMULÁRIO",
  "Resumen ejecutivo": "Resumo executivo",
  Fortalezas: "Forças",
  "Gaps a mejorar": "Lacunas a melhorar",
  "Proyectos recomendados": "Projetos recomendados",
  Ajustes: "Configurações",
  "Proveedor de IA": "Provedor de IA",
  "Tu contexto": "Seu contexto",
  Conectada: "Conectada",
  Reemplazar: "Substituir",
  Desconectar: "Desconectar",
  "Créditos restantes": "Créditos restantes",
  "Combinaciones recomendadas": "Combinações recomendadas",
  "O elige por separado": "Ou escolha separadamente",
  "Borrar todo": "Apagar tudo",
  "Borrar todos mis datos": "Apagar todos meus dados",
  "Confirmar borrado": "Confirmar exclusão",
  Continuar: "Continuar",
  Siguiente: "Próximo",
  Volver: "Voltar",
  Cancelar: "Cancelar",
  "Pega las preguntas del formulario": "Cole as perguntas do formulário",
  "Generando respuesta...": "Gerando resposta...",
  Aprobar: "Aprovar",
  "Copiar respuesta": "Copiar resposta",
  "Generar respuesta": "Gerar resposta",
  "Arma tu contexto una sola vez": "Monte seu contexto uma vez só",
  "Es un archivo de texto con quién eres, qué has hecho y en qué eres bueno; se reutiliza en todas tus postulaciones.":
    "É um arquivo de texto com quem você é, o que fez e no que é bom; reutilizado em todas as suas candidaturas.",
  "Prompt generador": "Prompt gerador",
  Copiado: "Copiado",
  Copiar: "Copiar",
  '"Aumenté la eficiencia un 20%" es mejor que "mejoré procesos". Datos concretos dan credibilidad.':
    '"Aumentei a eficiência em 20%" é melhor que "melhorei processos". Dados concretos dão credibilidade.',
  "LinkedIn, GitHub, portafolio, proyectos con demo. Son evidencia verificable que fortalece tu perfil.":
    "LinkedIn, GitHub, portfólio, projetos com demo. Evidência verificável que fortalece seu perfil.",
  "Carrera, semestre actual, año de ingreso y egreso. Muchas becas y convocatorias filtran por esto.":
    "Curso, semestre atual, ano de ingresso e egresso. Muitas bolsas e convocatórias filtram por isso.",
  "Reconocimientos, becas previas, y también qué salió mal. Los evaluadores valoran ambos.":
    "Reconhecimentos, bolsas anteriores, e também o que deu errado. Avaliadores valorizam ambos.",
  "Sirve cualquier IA (ChatGPT, Claude, Gemini) y el resultado debe guardarse como archivo .md para adjuntarlo en el siguiente paso.":
    "Qualquer IA serve (ChatGPT, Claude, Gemini) e o resultado deve ser salvo como arquivo .md para anexar no próximo passo.",
  "Ya tengo mi archivo": "Já tenho meu arquivo",
  "Adjunta tu contexto": "Anexe seu contexto",
  "Se lee en tu navegador y se descarta al cerrar. No se sube a ningún servidor.":
    "Lido no seu navegador e descartado ao fechar. Não é enviado a nenhum servidor.",
  "Analizando contexto...": "Analisando contexto...",
  "Lo que PostulAI leyó": "O que PostulAI leu",
  "CV (opcional)": "CV (opcional)",
  "Sube tu CV en PDF y PostulAI te dirá qué cambiar para cada convocatoria.":
    "Envie seu CV em PDF e PostulAI dirá o que mudar para cada oportunidade.",
  "PostulAI analizará tu CV contra cada convocatoria y te recomendará qué mejorar.":
    "PostulAI analisará seu CV contra cada oportunidade e recomendará melhorias.",
  "palabras extraídas": "palavras extraídas",
  Quitar: "Remover",
  "Subir CV en PDF": "Enviar CV em PDF",
  "Leyendo PDF...": "Lendo PDF...",
  "Recordar mi contexto en este dispositivo": "Lembrar meu contexto neste dispositivo",
  "Se guarda solo en este navegador. Puedes borrarlo cuando quieras desde ajustes.":
    "Salvo apenas neste navegador. Você pode apagar quando quiser nas configurações.",
  "Validando...": "Validando...",
  "Elige combinaciones específicas": "Escolha combinações específicas",
  "Leyendo...": "Lendo...",
  "Extracción, encaje, gaps": "Extração, encaixe, lacunas",
  "Generación y refinamiento": "Geração e refinamento",
  Análisis: "Análise",
  "Preparación": "Preparação",
  "Mejora tu perfil": "Melhore seu perfil",
  "Qué buscan": "O que buscam",
  "Criterios de evaluación": "Critérios de avaliação",
  "Tono esperado": "Tom esperado",
  "Señales de alerta": "Sinais de alerta",
  "Tips para esta convocatoria": "Dicas para esta oportunidade",
  "Tu elevator pitch": "Seu elevator pitch",
  "Certificaciones recomendadas": "Certificações recomendadas",
  "Habilidades a desarrollar": "Habilidades a desenvolver",
  "Experiencias sugeridas": "Experiências sugeridas",
  "Cambios en tu CV": "Mudanças no seu CV",
  Carta: "Carta",
  "Carta de presentación": "Carta de apresentação",
  "Genera una carta personalizada para esta convocatoria basada en tu contexto y el análisis de encaje.": "Gere uma carta personalizada com base no seu contexto e análise de adequação.",
  "Generar carta": "Gerar carta",
  "Generando...": "Gerando...",
  Regenerar: "Regenerar",
  palabras: "palavras",
  "Diagnóstico de contexto": "Diagnóstico de contexto",
  "0 tokens AI": "0 tokens IA",
  Completitud: "Completude",
  Métricas: "Métricas",
  "Evidencia verificable": "Evidência verificável",
  "Línea temporal": "Linha temporal",
  "Cobertura sectorial": "Cobertura setorial",
  "Simulador de entrevista": "Simulador de entrevista",
  preguntas: "perguntas",
  "Ver consejo": "Ver dica",
  "Escribe tu respuesta para practicar...": "Escreva sua resposta para praticar...",
  "Evaluando...": "Avaliando...",
  "Evaluar con IA": "Avaliar com IA",
  "A mejorar": "A melhorar",
  "Respuesta modelo": "Resposta modelo",
  "LinkedIn optimizado": "LinkedIn otimizado",
  Titular: "Título",
  Resumen: "Resumo",
  "Tracker de postulaciones": "Rastreador de candidaturas",
  oportunidades: "oportunidades",
  Comparar: "Comparar",
  "Analiza oportunidades en": "Analise oportunidades em",
  "para empezar a trackear.": "para começar a rastrear.",
  Investigando: "Pesquisando",
  Analizando: "Analisando",
  Postulando: "Candidatando",
  Enviada: "Enviada",
  Entrevista: "Entrevista",
  Resultado: "Resultado",
};

const fr: Dict = {
  "Empezar gratis": "Commencer gratuitement",
  Empezar: "Commencer",
  "Empezar ahora": "Commencer maintenant",
  "Ver cómo funciona": "Voir comment ça marche",
  "Cómo funciona": "Comment ça marche",
  Funciones: "Fonctionnalités",
  Seguridad: "Sécurité",
  Tema: "Thème",
  "IA que trabaja para ti": "IA qui travaille pour vous",
  "Tu copiloto": "Votre copilote",
  "para postulaciones.": "pour les candidatures.",
  "Analiza convocatorias, evalúa tu encaje, mejora tu CV o portafolio, prepara tu pitch y redacta respuestas con evidencia real.":
    "Analysez les opportunités, évaluez votre adéquation, améliorez votre CV ou portfolio, préparez votre pitch et rédigez des réponses avec des preuves réelles.",
  "Sin registro · Sin servidor · Tu clave API, tu control":
    "Sans inscription · Sans serveur · Votre clé API, votre contrôle",
  "Solo necesitas una clave de OpenRouter":
    "Vous n'avez besoin que d'une clé OpenRouter",
  "Menos tiempo": "Moins de temps",
  "Método estándar": "Méthode standard",
  Privacidad: "Confidentialité",
  "Todo en tu navegador": "Tout dans votre navigateur",
  "Situación + Resultado": "Situation + Résultat",
  "CÓMO FUNCIONA": "COMMENT ÇA MARCHE",
  "Tres pasos. Cero fricción.": "Trois étapes. Zéro friction.",
  "De tener 10 convocatorias abiertas a saber tu encaje, mejorar tu perfil y tener las respuestas listas.":
    "De 10 opportunités ouvertes à connaître votre adéquation, améliorer votre profil et avoir les réponses prêtes.",
  "Sube tu perfil": "Téléchargez votre profil",
  "Tu contexto profesional y CV o portafolio. PostulAI lo usa como única fuente de verdad — nunca inventa datos.":
    "Votre contexte professionnel et CV ou portfolio. PostulAI l'utilise comme seule source de vérité — n'invente jamais de données.",
  "Agrega convocatorias": "Ajoutez des opportunités",
  "URLs, PDFs o texto pegado. Extrae requisitos, evalúa tu encaje y te dice qué mejorar en tu perfil.":
    "URLs, PDFs ou texte collé. Extrait les exigences, évalue votre adéquation et vous dit quoi améliorer.",
  "Prepara y postula": "Préparez et postulez",
  "Pitch personalizado, tips de entrevista, mejoras de CV o portafolio, y respuestas listas para copiar.":
    "Pitch personnalisé, conseils d'entretien, améliorations de CV ou portfolio, et réponses prêtes à copier.",
  FUNCIONES: "FONCTIONNALITÉS",
  "Más que rellenar campos": "Plus que remplir des champs",
  "Análisis por sector, coaching de perfil y respuestas que venden tu experiencia real con precisión.":
    "Analyse sectorielle, coaching de profil et réponses qui vendent votre expérience réelle avec précision.",
  "Análisis de encaje": "Analyse d'adéquation",
  "Cruza tu perfil con los criterios de cada convocatoria y te dice tu porcentaje de coincidencia.":
    "Croise votre profil avec les critères de chaque opportunité et donne votre pourcentage de correspondance.",
  "CV o portafolio": "CV ou portfolio",
  "Para empleos y becas mejora tu CV. Para hackathons y aceleradoras te recomienda proyectos concretos.":
    "Pour les emplois et bourses, améliore votre CV. Pour les hackathons et accélérateurs, recommande des projets concrets.",
  "Elevator pitch": "Elevator pitch",
  "Pitch personalizado con tus datos reales, adaptado al sector. Estructura lista para practicar.":
    "Pitch personnalisé avec vos données réelles, adapté au secteur. Structure prête à pratiquer.",
  "Tips de entrevista": "Conseils d'entretien",
  "Consejos específicos para cada convocatoria basados en tus fortalezas y gaps reales.":
    "Conseils spécifiques pour chaque opportunité basés sur vos forces et lacunes réelles.",
  "Coaching de perfil": "Coaching de profil",
  "Certificaciones, habilidades y experiencias alcanzables que mejoran tu encaje con cada oportunidad.":
    "Certifications, compétences et expériences accessibles qui améliorent votre adéquation avec chaque opportunité.",
  "Respuestas calibradas": "Réponses calibrées",
  "Método STAR con evidencia real, ajustadas al límite exacto de cada campo. Listas para copiar.":
    "Méthode STAR avec preuves réelles, ajustées à la limite exacte de chaque champ. Prêtes à copier.",
  "Privacidad por diseño": "Confidentialité par conception",
  "Tu clave API": "Votre clé API",
  "nunca toca un servidor": "ne touche jamais un serveur",
  "PostulAI es 100% cliente. Tu clave va directo de tu navegador a OpenRouter. No hay backend, no hay proxy.":
    "PostulAI est 100% côté client. Votre clé va directement de votre navigateur à OpenRouter. Pas de backend, pas de proxy.",
  "Sin cuenta ni registro": "Sans compte ni inscription",
  "No hay base de datos de usuarios. Empiezas directamente.":
    "Pas de base de données utilisateurs. Vous commencez directement.",
  "Cifrado local opcional": "Chiffrement local optionnel",
  "AES-256-GCM en tu navegador. La clave nunca sale en texto plano.":
    "AES-256-GCM dans votre navigateur. La clé ne sort jamais en texte clair.",
  "Sesión temporal": "Session temporaire",
  "Al cerrar la pestaña, contexto, clave y respuestas desaparecen.":
    "À la fermeture de l'onglet, contexte, clé et réponses disparaissent.",
  "Código abierto": "Code source ouvert",
  "Todo el código es auditable. Sin telemetría, sin tracking.":
    "Tout le code est auditable. Sans télémétrie, sans pistage.",
  "Mejora tu perfil.": "Améliorez votre profil.",
  "Postula con confianza.": "Postulez avec confiance.",
  "PostulAI analiza, te prepara y redacta. Tú revisas y envías.":
    "PostulAI analyse, vous prépare et rédige. Vous relisez et envoyez.",
  "— Tu copiloto de postulaciones con IA": "— Votre copilote de candidatures IA",
  "Todo ocurre en tu navegador · Nada se guarda al cerrar":
    "Tout se passe dans votre navigateur · Rien n'est sauvegardé à la fermeture",
  Hackathons: "Hackathons",
  Becas: "Bourses",
  Aceleradoras: "Accélérateurs",
  Voluntariados: "Bénévolat",
  Empleos: "Emplois",
  Eventos: "Événements",
  "Tu contexto profesional": "Votre contexte professionnel",
  "Sube o pega tu contexto — tu perfil, CV, portafolio, o lo que mejor te describa.":
    "Téléchargez ou collez votre contexte — profil, CV, portfolio, ou ce qui vous décrit le mieux.",
  Contexto: "Contexte",
  Conectar: "Connecter",
  Analizar: "Analyser",
  "Arrastra tu archivo o haz clic para seleccionar":
    "Glissez votre fichier ou cliquez pour sélectionner",
  "Markdown (.md), texto (.txt) o PDF — máximo 100 KB":
    "Markdown (.md), texte (.txt) ou PDF — max 100 Ko",
  "O pega tu contexto aquí": "Ou collez votre contexte ici",
  "Incluye números": "Incluez des chiffres",
  "Agrega tus enlaces": "Ajoutez vos liens",
  "Universidad y ciclo": "Université et cycle",
  "Premios y fracasos": "Prix et échecs",
  "Aún no tienes contexto?": "Pas encore de contexte ?",
  "Genera tu contexto con IA": "Générez votre contexte avec l'IA",
  "Conecta tu proveedor de IA": "Connectez votre fournisseur d'IA",
  "Elige tu plan de consumo": "Choisissez votre plan de consommation",
  "Tú pones la clave y tú pagas el consumo. PostulAI no cobra ni intermedia.":
    "Vous fournissez la clé et payez la consommation. PostulAI ne facture pas et n'intermédie pas.",
  "Elige qué modelos usar. Análisis = extracción y evaluación. Redacción = generar respuestas.":
    "Choisissez les modèles. Analyse = extraction et évaluation. Rédaction = générer des réponses.",
  "Conectar con OpenRouter": "Connecter avec OpenRouter",
  "Pegar una clave manualmente": "Coller une clé manuellement",
  "Dónde guardar la clave": "Où sauvegarder la clé",
  "Solo durante esta sesión": "Cette session uniquement",
  "(recomendado)": "(recommandé)",
  "Hasta cerrar la pestaña": "Jusqu'à la fermeture de l'onglet",
  "Guardar cifrada con una contraseña": "Sauvegarder chiffrée avec un mot de passe",
  "Empezar a postular": "Commencer à postuler",
  "Personalizar modelos": "Personnaliser les modèles",
  Recomendado: "Recommandé",
  "Modelo de análisis": "Modèle d'analyse",
  "Modelo de redacción": "Modèle de rédaction",
  "¿A qué estás postulando?": "À quoi postulez-vous ?",
  "Elige el tipo de oportunidad y agrega tus convocatorias. Cada sector usa una estrategia de análisis distinta.":
    "Choisissez le type d'opportunité et ajoutez vos appels. Chaque secteur utilise une stratégie d'analyse différente.",
  Empleo: "Emploi",
  Beca: "Bourse",
  Hackathon: "Hackathon",
  Aceleradora: "Accélérateur",
  Evento: "Événement",
  Voluntariado: "Bénévolat",
  Otro: "Autre",
  "Subir PDF": "Télécharger PDF",
  "Pegar texto": "Coller du texte",
  ANALIZAR: "ANALYSER",
  "Ver resultados": "Voir les résultats",
  "AGREGAR MÁS": "AJOUTER PLUS",
  DESCARGAR: "TÉLÉCHARGER",
  Encaje: "Adéquation",
  "Fecha límite": "Date limite",
  Esfuerzo: "Effort",
  "convocatorias analizadas": "opportunités analysées",
  "RESPONDER FORMULARIO": "RÉPONDRE AU FORMULAIRE",
  "Resumen ejecutivo": "Résumé exécutif",
  Fortalezas: "Forces",
  "Gaps a mejorar": "Lacunes à combler",
  "Proyectos recomendados": "Projets recommandés",
  Ajustes: "Paramètres",
  "Proveedor de IA": "Fournisseur d'IA",
  "Tu contexto": "Votre contexte",
  Conectada: "Connectée",
  Reemplazar: "Remplacer",
  Desconectar: "Déconnecter",
  "Créditos restantes": "Crédits restants",
  "Combinaciones recomendadas": "Combinaisons recommandées",
  "O elige por separado": "Ou choisissez séparément",
  "Borrar todo": "Tout supprimer",
  "Borrar todos mis datos": "Supprimer toutes mes données",
  "Confirmar borrado": "Confirmer la suppression",
  Continuar: "Continuer",
  Siguiente: "Suivant",
  Volver: "Retour",
  Cancelar: "Annuler",
  "Pega las preguntas del formulario": "Collez les questions du formulaire",
  "Generando respuesta...": "Génération de la réponse...",
  Aprobar: "Approuver",
  "Copiar respuesta": "Copier la réponse",
  "Generar respuesta": "Générer une réponse",
  "Arma tu contexto una sola vez": "Construisez votre contexte une seule fois",
  "Es un archivo de texto con quién eres, qué has hecho y en qué eres bueno; se reutiliza en todas tus postulaciones.":
    "Un fichier texte avec qui vous êtes, ce que vous avez fait et vos points forts ; réutilisé dans toutes vos candidatures.",
  "Prompt generador": "Prompt générateur",
  Copiado: "Copié",
  Copiar: "Copier",
  '"Aumenté la eficiencia un 20%" es mejor que "mejoré procesos". Datos concretos dan credibilidad.':
    '"J\'ai augmenté l\'efficacité de 20%" vaut mieux que "j\'ai amélioré les processus". Les données concrètes renforcent la crédibilité.',
  "LinkedIn, GitHub, portafolio, proyectos con demo. Son evidencia verificable que fortalece tu perfil.":
    "LinkedIn, GitHub, portfolio, projets avec démo. Preuves vérifiables qui renforcent votre profil.",
  "Carrera, semestre actual, año de ingreso y egreso. Muchas becas y convocatorias filtran por esto.":
    "Filière, semestre actuel, année d'entrée et de sortie. Beaucoup de bourses filtrent par ces critères.",
  "Reconocimientos, becas previas, y también qué salió mal. Los evaluadores valoran ambos.":
    "Distinctions, bourses précédentes, et aussi ce qui a mal tourné. Les évaluateurs apprécient les deux.",
  "Sirve cualquier IA (ChatGPT, Claude, Gemini) y el resultado debe guardarse como archivo .md para adjuntarlo en el siguiente paso.":
    "N'importe quelle IA convient (ChatGPT, Claude, Gemini) et le résultat doit être sauvé en .md pour l'étape suivante.",
  "Ya tengo mi archivo": "J'ai déjà mon fichier",
  "Adjunta tu contexto": "Joignez votre contexte",
  "Se lee en tu navegador y se descarta al cerrar. No se sube a ningún servidor.":
    "Lu dans votre navigateur et supprimé à la fermeture. Aucun envoi vers un serveur.",
  "Analizando contexto...": "Analyse du contexte...",
  "Lo que PostulAI leyó": "Ce que PostulAI a lu",
  "CV (opcional)": "CV (optionnel)",
  "Sube tu CV en PDF y PostulAI te dirá qué cambiar para cada convocatoria.":
    "Téléchargez votre CV en PDF et PostulAI vous dira quoi changer pour chaque opportunité.",
  "PostulAI analizará tu CV contra cada convocatoria y te recomendará qué mejorar.":
    "PostulAI analysera votre CV pour chaque opportunité et recommandera des améliorations.",
  "palabras extraídas": "mots extraits",
  Quitar: "Retirer",
  "Subir CV en PDF": "Télécharger CV en PDF",
  "Leyendo PDF...": "Lecture du PDF...",
  "Recordar mi contexto en este dispositivo": "Mémoriser mon contexte sur cet appareil",
  "Se guarda solo en este navegador. Puedes borrarlo cuando quieras desde ajustes.":
    "Sauvegardé uniquement dans ce navigateur. Vous pouvez le supprimer à tout moment dans les paramètres.",
  "Validando...": "Validation...",
  "Elige combinaciones específicas": "Choisissez des combinaisons spécifiques",
  "Leyendo...": "Lecture...",
  "Extracción, encaje, gaps": "Extraction, adéquation, lacunes",
  "Generación y refinamiento": "Génération et raffinement",
  Análisis: "Analyse",
  "Preparación": "Préparation",
  "Mejora tu perfil": "Améliorez votre profil",
  "Qué buscan": "Ce qu'ils cherchent",
  "Criterios de evaluación": "Critères d'évaluation",
  "Tono esperado": "Ton attendu",
  "Señales de alerta": "Signaux d'alerte",
  "Tips para esta convocatoria": "Conseils pour cette opportunité",
  "Tu elevator pitch": "Votre elevator pitch",
  "Certificaciones recomendadas": "Certifications recommandées",
  "Habilidades a desarrollar": "Compétences à développer",
  "Experiencias sugeridas": "Expériences suggérées",
  "Cambios en tu CV": "Modifications du CV",
  Carta: "Lettre",
  "Carta de presentación": "Lettre de motivation",
  "Genera una carta personalizada para esta convocatoria basada en tu contexto y el análisis de encaje.": "Générez une lettre personnalisée basée sur votre contexte et l'analyse d'adéquation.",
  "Generar carta": "Générer la lettre",
  "Generando...": "Génération...",
  Regenerar: "Régénérer",
  palabras: "mots",
  "Diagnóstico de contexto": "Diagnostic de contexte",
  "0 tokens AI": "0 tokens IA",
  Completitud: "Complétude",
  Métricas: "Métriques",
  "Evidencia verificable": "Preuves vérifiables",
  "Línea temporal": "Chronologie",
  "Cobertura sectorial": "Couverture sectorielle",
  "Simulador de entrevista": "Simulateur d'entretien",
  preguntas: "questions",
  "Ver consejo": "Voir le conseil",
  "Escribe tu respuesta para practicar...": "Écrivez votre réponse pour pratiquer...",
  "Evaluando...": "Évaluation...",
  "Evaluar con IA": "Évaluer avec l'IA",
  "A mejorar": "À améliorer",
  "Respuesta modelo": "Réponse modèle",
  "LinkedIn optimizado": "LinkedIn optimisé",
  Titular: "Titre",
  Resumen: "Résumé",
  "Tracker de postulaciones": "Suivi des candidatures",
  oportunidades: "opportunités",
  Comparar: "Comparer",
  "Analiza oportunidades en": "Analysez les opportunités dans",
  "para empezar a trackear.": "pour commencer le suivi.",
  Investigando: "Recherche",
  Analizando: "Analyse",
  Postulando: "Candidature",
  Enviada: "Envoyée",
  Entrevista: "Entretien",
  Resultado: "Résultat",
};

const dicts: Record<Locale, Dict> = { es: {}, en, pt, fr };

export function t(key: string): string {
  const locale = useI18n.getState().locale;
  if (locale === "es") return key;
  return dicts[locale]?.[key] ?? key;
}

// ponytail: hook for reactive re-render on locale change
export function useT() {
  const locale = useI18n((s) => s.locale);
  return (key: string) => {
    if (locale === "es") return key;
    return dicts[locale]?.[key] ?? key;
  };
}
