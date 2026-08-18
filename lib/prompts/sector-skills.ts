import type { OpportunityCategory } from "@/lib/types";

export interface SectorSkill {
  evaluatorPerspective: string;
  scoringCriteria: string;
  promptStrategy: string;
  redFlags: string[];
  contextPriorities: string[];
  keywordPatterns: string[];
  improvementTemplate: string;
}

export const SECTOR_SKILLS: Record<OpportunityCategory, SectorSkill> = {
  empleo: {
    evaluatorPerspective: `El proceso real de selección laboral en LATAM combina filtrado automatizado (ATS) con revisión humana rápida. Así funciona:

FASE 1 — FILTRADO ATS (automático, 0 segundos humanos):
Los ATS (Workday, Greenhouse, Lever, BambooHR, Breezy HR, o plataformas locales como Bumeran/Computrabajo/OCC) parsean el texto y asignan un "match score" entre 0-100%. El algoritmo:
- Extrae keywords del job description y las busca en la aplicación
- Pondera por ubicación en el texto (título > primer párrafo > resto)
- Detecta coincidencia semántica parcial (ej: "gestión de proyectos" ≈ "project management")
- Indeed muestra al reclutador un porcentaje de similitud; LinkedIn usa un algoritmo de "match" que prioriza skills declaradas + endorsements + títulos de cargo exactos
- Umbral típico: <60% no llega a ojos humanos. 60-75% llega si hay pocas aplicaciones. >75% siempre se revisa
- Los ATS en LATAM suelen ser menos sofisticados que los de USA — Computrabajo y Bumeran usan keyword matching literal más que semántico

FASE 2 — ESCANEO HUMANO (6 segundos promedio):
El reclutador escanea en patrón F:
1. Nombre + cargo actual (0.5s)
2. Empresa actual/más reciente + tiempo (1s)
3. Título del puesto anterior (1s)
4. Primer bullet de logros del puesto actual (1.5s)
5. Skills/educación — solo si los 4 anteriores pasan (2s)

Lo que decide en esos 6 segundos: ¿este candidato ha hecho algo SIMILAR a lo que necesito? No buscan al mejor del mundo — buscan al que menos riesgo de contratación represente.

FASE 3 — LECTURA PROFUNDA (solo 10-15% llega aquí):
Aquí leen la carta de presentación, buscan coherencia narrativa, validan fechas, y evalúan "culture fit" a través del tono y los ejemplos elegidos.

PARTICULARIDADES LATAM:
- Chile: Valoran títulos universitarios y postgrados más que experiencia informal. Cultura corporativa formal.
- México: Red de contactos pesa mucho. Las recomendaciones personales saltan el ATS. Lenguaje formal pero cercano.
- Colombia: Ecosistema tech creciente, valoran certificaciones internacionales. English proficiency es diferenciador fuerte.
- Argentina: Cultura startup fuerte en tech. Valoran creatividad y capacidad de resolver con recursos limitados. Toleran CVs más informales en tech.`,

    scoringCriteria: `1. COINCIDENCIA DE CARGO (30%): ¿El título actual/reciente coincide con el puesto? Matching exacto > similar > transferible
2. AÑOS DE EXPERIENCIA (20%): Dentro del rango pedido. Más no siempre es mejor — "overqualified" existe
3. HABILIDADES TÉCNICAS (20%): Keywords exactas del job description presentes en la aplicación
4. LOGROS CUANTIFICADOS (15%): Números, porcentajes, montos. Un solo número concreto vale más que 3 párrafos descriptivos
5. ESTABILIDAD LABORAL (10%): Permanencia promedio >1.5 años. Job-hopping (<1 año por empresa) es red flag
6. EDUCACIÓN/CERTIFICACIONES (5%): Relevante solo si el puesto lo exige explícitamente`,

    promptStrategy: `DIRECTIVAS PARA RESPUESTAS DE EMPLEO:
1. Abre con tu cargo actual/más reciente y la empresa, seguido de tu logro más cuantificable en ese rol. Ejemplo: "Como [cargo] en [empresa], [logro con número]."
2. Usa EXACTAMENTE las palabras clave del job description — no sinónimos creativos. Si piden "gestión de proyectos", escribe "gestión de proyectos", no "coordinación de iniciativas".
3. Cada experiencia mencionada sigue el patrón: Contexto (1 línea) → Acción específica (1-2 líneas) → Resultado medible (dato concreto).
4. Incluye al menos 3 métricas numéricas: porcentajes de mejora, tamaños de equipo, volúmenes manejados, tiempos reducidos, ingresos impactados.
5. Si la pregunta es sobre motivación: conecta tu trayectoria con la misión de la empresa. No digas que "te apasiona" — demuestra con un proyecto específico que ya haces algo alineado.
6. Nunca menciones salario, beneficios, o lo que esperas recibir. Solo lo que aportas.
7. Adapta formalidad al país: Chile/México = formal ("estimados", usted implícito). Argentina/Colombia tech = profesional pero directo.
8. Si hay gap de experiencia en algo pedido, transforma en: "Actualmente profundizando en [X] a través de [acción concreta]" — nunca "no tengo experiencia en".`,

    redFlags: [
      "Párrafos genéricos copiados que no mencionan la empresa ni el puesto específico",
      "Errores ortográficos o gramaticales — el reclutador descarta instantáneamente",
      "Listar responsabilidades en vez de logros ('encargado de' vs 'logré X')",
      "Más de 3 páginas o bloques de texto sin estructura",
      "Mencionar salario esperado sin que lo pidan",
      "Hablar mal de empleadores anteriores",
      "Gaps temporales sin explicación (>6 meses)",
      "Skills listadas sin evidencia de uso real",
      "Foto no profesional o información personal irrelevante (estado civil, religión)",
      "Usar primera persona excesivamente informal ('yo soy re crack en esto')",
    ],

    contextPriorities: [
      "Títulos de cargo exactos con empresa y duración (mes/año a mes/año)",
      "Logros cuantificados por cada posición: números, porcentajes, montos en USD",
      "Stack tecnológico con nivel de dominio real (no 'conocimientos en')",
      "Tamaño de equipos liderados o en los que participaste",
      "Certificaciones con institución y fecha",
      "Idiomas con nivel real (B2, C1, nativo) — no 'nivel intermedio'",
      "Proyectos con impacto en revenue, eficiencia, o usuarios",
      "Disponibilidad: inmediata, con preaviso, modalidad (remoto/presencial/híbrido)",
    ],

    keywordPatterns: [
      "liderazgo de equipos",
      "gestión de proyectos",
      "resultados medibles",
      "optimización de procesos",
      "trabajo en equipo",
      "resolución de problemas",
      "orientado a resultados",
      "comunicación efectiva",
      "toma de decisiones",
      "mejora continua",
      "KPIs",
      "OKRs",
      "metodologías ágiles",
      "Scrum",
      "stakeholders",
      "cumplimiento de objetivos",
      "presupuesto",
      "escalabilidad",
      "automatización",
      "análisis de datos",
    ],

    improvementTemplate: `Para mejorar tu competitividad en postulaciones de empleo:

GAP DETECTADO: {gap}

PLAN DE ACCIÓN INMEDIATO (2-4 semanas):
1. Si es habilidad técnica: Completa el curso gratuito de {gap} en Platzi, Coursera o LinkedIn Learning. Prioriza los que dan certificado verificable.
2. Si es experiencia: Documenta un proyecto personal o freelance que demuestre la habilidad. Publícalo en GitHub/portfolio con README detallado.
3. Si es certificación: Agenda el examen. Las certificaciones de Google, AWS, o Scrum.org son las más reconocidas por ATS en LATAM.
4. Si es idioma: Obtén un certificado de nivel (TOEFL/IELTS para inglés, DELF para francés). Duolingo Certification es aceptado por muchas empresas tech.

ACCIÓN PARA TU CONTEXTO: Agrega a tu archivo una sección que diga: "Actualmente cursando/certificándome en [X] — completando [nombre del curso] en [plataforma], con fecha estimada de finalización [fecha]."

MIENTRAS TANTO EN LA POSTULACIÓN: Reformula como: "Experiencia inicial en {gap} con plan de certificación en curso. Mi experiencia en [habilidad relacionada] me permite una curva de aprendizaje acelerada, como demostré cuando [ejemplo de aprendizaje rápido de tu contexto]."`,
  },

  hackathon: {
    evaluatorPerspective: `Los jueces de hackathon evalúan en condiciones extremas: 30-100 proyectos en un día, demos de 2-5 minutos cada una, decisiones rápidas con rúbricas simples. Así funciona realmente:

FORMATO DE EVALUACIÓN:
- DevPost: Los jueces reciben acceso a los submissions 24-48h antes. Leen README, ven video (si hay), y pre-filtran. En la demo final, ya tienen favoritos.
- MLH (Major League Hacking): Rúbrica estandarizada de 4 categorías. Los jueces circulan por mesas en "expo mode" — tienen 3-5 minutos por equipo.
- Hackathons LATAM (HackMTY, Hackathon BBVA, NASA Space Apps local chapters, AngelHack): Generalmente siguen modelo expo + pitch final para top 10.

LO QUE REALMENTE DECIDE (no lo que dicen las reglas):
1. "¿Funciona?" — Una demo que crashea pierde contra una que funciona, sin importar qué tan innovadora sea la idea
2. "¿Lo entiendo en 30 segundos?" — Si el juez no entiende el problema que resuelves en medio minuto, no importa tu solución
3. "¿Es técnicamente impresionante PARA el tiempo disponible?" — No esperan producción, pero sí que hayas construido algo no-trivial
4. "¿Usaron la tecnología del sponsor?" — En hackathons patrocinados, usar el API/producto del sponsor puede valer 30-50% del puntaje total

SESGOS REALES DE JUECES:
- Demo > slides. Siempre.
- Proyectos con UI visual impresionan más que backends potentes pero invisibles
- Equipos diversos (género, disciplinas) reciben beneficio de la duda
- Proyectos con impacto social tienen ventaja emocional cuando la calidad técnica es similar
- El presentador carismático gana sobre el introvertido brillante (injusto pero real)`,

    scoringCriteria: `1. INNOVACIÓN/CREATIVIDAD (25%): ¿La idea es nueva o combina existentes de forma no obvia? ¿Resuelve un problema real que los jueces reconocen?
2. IMPACTO/UTILIDAD (25%): ¿A quién beneficia? ¿Cuántas personas? ¿Qué tan grave es el problema que resuelve?
3. IMPLEMENTACIÓN TÉCNICA (25%): ¿Funciona? ¿Es técnicamente sólido? ¿Muestra habilidad real? ¿Usa bien las APIs/tecnologías del hackathon?
4. COMPLETITUD/PULIDO (15%): ¿Se siente terminado? ¿Tiene UI cuidada? ¿El README está completo?
5. PRESENTACIÓN (10%): ¿La demo fue clara? ¿El equipo comunicó bien? ¿Respondieron preguntas de los jueces?`,

    promptStrategy: `DIRECTIVAS PARA RESPUESTAS DE HACKATHON:
1. Abre con EL PROBLEMA, no con tu solución. "X millones de personas en LATAM enfrentan [problema]. Nosotros construimos [solución] que [resultado concreto]."
2. Describe tu stack técnico con precisión: frameworks, APIs, servicios cloud. Los jueces técnicos quieren saber que no es solo un mockup en Figma.
3. Menciona qué construiste EN EL HACKATHON vs qué existía antes. La honestidad sobre esto genera más respeto que exagerar.
4. Si usas tecnología del sponsor, menciónalo explícitamente y cómo la integraste.
5. Incluye métricas de la demo si las tienes: usuarios que lo probaron, tiempo de respuesta, volumen procesado.
6. Para preguntas sobre equipo: detalla los roles específicos de cada miembro y cómo se complementan.
7. Cierra con visión: "Después del hackathon, planeamos [siguiente paso concreto]". Los jueces quieren ver que esto no muere el domingo.
8. Si la postulación pide video: describe la estructura ideal — 30s problema, 60s demo en vivo, 30s impacto y próximos pasos.`,

    redFlags: [
      "Idea sin demo funcional — 'no tuvimos tiempo de terminar' es la frase más repetida por perdedores",
      "Proyecto que claramente empezó antes del hackathon sin declararlo",
      "Slides bonitas sin producto detrás",
      "No mencionar la tecnología del sponsor cuando es hackathon patrocinado",
      "Equipo de una sola persona en hackathons que requieren equipo",
      "Describir features que no existen todavía como si funcionaran",
      "Problema inventado que nadie tiene realmente",
      "No tener README o documentación mínima en el repo",
    ],

    contextPriorities: [
      "Hackathons anteriores: nombre, resultado (ganaste/top N), qué construiste, stack usado",
      "Proyectos construidos rápidamente (24-72h) con resultado funcional",
      "APIs y servicios cloud que dominas (Firebase, AWS, OpenAI, etc.)",
      "Experiencia en presentaciones/pitches técnicos con duración y audiencia",
      "Habilidades de prototipado rápido: frameworks, herramientas de diseño",
      "Roles en equipos anteriores: frontend, backend, pitch, diseño",
      "Proyectos con impacto social o comunitario",
      "Métricas de velocidad de desarrollo: 'construí X en Y horas'",
    ],

    keywordPatterns: [
      "prototipo funcional",
      "MVP",
      "impacto social",
      "escalable",
      "innovación",
      "solución técnica",
      "API integration",
      "demo en vivo",
      "open source",
      "problema real",
      "usuarios reales",
      "producto mínimo viable",
      "iteración rápida",
      "stack completo",
      "deploy",
      "tiempo real",
      "machine learning",
      "datos abiertos",
      "comunidad",
      "sostenibilidad",
    ],

    improvementTemplate: `Para fortalecer tu perfil en hackathones:

GAP DETECTADO: {gap}

PLAN DE ACCIÓN (1-3 semanas):
1. Si es experiencia en hackathones: Inscríbete en el próximo hackathon online gratuito en DevPost.com o MLH.io. Los hackathons virtuales tienen barrera de entrada baja y te dan un proyecto para tu portfolio en 48h.
2. Si es habilidad técnica: Construye un proyecto demo con esa tecnología este fin de semana. Publícalo en GitHub con README completo. No necesita ser perfecto — necesita funcionar y estar documentado.
3. Si es presentación/pitch: Graba un video de 2 minutos presentando tu último proyecto. Practica el formato: problema (30s) → demo (60s) → impacto (30s). Súbelo a YouTube como no-listado.
4. Si es trabajo en equipo: Contribuye a un proyecto open source en GitHub. Un PR mergeado demuestra capacidad de colaboración técnica.

ACCIÓN INMEDIATA: Agrega a tu contexto: "Participé en [nombre hackathon] donde [rol específico]. Construí [qué] usando [stack] en [X horas]. Resultado: [funcional/premio/aprendizaje]."

EN LA POSTULACIÓN: Reformula el gap como: "Aunque mi experiencia directa en {gap} es inicial, en [hackathon/proyecto] demostré capacidad de aprender [tecnología similar] en [tiempo corto], entregando [resultado funcional]."`,
  },

  beca: {
    evaluatorPerspective: `Los comités de becas operan con volúmenes enormes y procesos altamente estructurados. Así evalúan realmente:

ESTRUCTURA DEL COMITÉ:
- Fulbright: Panel de 5-8 evaluadores (académicos + profesionales del sector). Cada aplicación tiene 2 lectores primarios que presentan al comité. Entrevista presencial para finalistas.
- DAAD: Evaluación en dos fases — pre-selección nacional (embajada/oficina DAAD local) y selección final en Alemania. Carta de aceptación de universidad alemana pesa mucho.
- Chevening: Proceso online → entrevista en embajada británica. Evalúan "leadership potential" + plan de retorno al país de origen.
- Fundación Carolina: Evaluación documental pura en primera fase. Puntaje ponderado de expediente académico + experiencia + motivación + plan de estudios.
- CONACYT/CONICET: Fuertemente académicas. Promedio de calificaciones, publicaciones, y aval de tutor de destino son determinantes.
- OEA: Prioriza países con menor desarrollo relativo, minorías, y equidad de género.

LO QUE REALMENTE DECIDE:
1. "¿Tiene un plan claro de QUÉ va a estudiar y POR QUÉ?" — La motivación vaga ("quiero aprender más") es la razón #1 de rechazo
2. "¿Va a volver a su país?" — Casi todas las becas LATAM requieren plan de retorno. Los que parecen querer emigrar pierden puntos
3. "¿Su perfil académico respalda la ambición?" — Un promedio de 7.5/10 aplicando a MIT necesita justificación extraordinaria
4. "¿Hay coherencia narrativa?" — CV dice una cosa, motivación dice otra, recomendaciones dicen otra = descarte
5. "¿Esta persona va a ser embajadora del programa?" — Las becas son inversiones en relaciones diplomáticas/académicas

PARTICULARIDADES LATAM:
- Los promedios académicos varían enormemente entre países (7 en Argentina ≠ 7 en México)
- Experiencia comunitaria y de liderazgo social pesa más que en aplicaciones europeas
- Demostrar impacto en tu comunidad local es diferenciador fuerte
- El dominio del idioma del país destino es filtro eliminatorio, no diferenciador`,

    scoringCriteria: `1. EXCELENCIA ACADÉMICA (25%): Promedio, publicaciones, distinciones. Peso relativo al programa — PhD pide más rigor que maestría profesional.
2. MOTIVACIÓN Y PLAN DE ESTUDIOS (25%): Carta que conecta trayectoria pasada → programa específico → plan de retorno. Debe responder: ¿por qué este programa? ¿por qué ahora? ¿por qué tú?
3. LIDERAZGO Y COMPROMISO SOCIAL (20%): Evidencia de impacto en comunidad, voluntariado, mentoría, iniciativas propias. No solo participar — liderar.
4. POTENCIAL DE IMPACTO AL RETORNO (15%): Plan concreto de cómo aplicar lo aprendido en tu país/región. Cuanto más específico, mejor.
5. PERFIL INTEGRAL (10%): Diversidad de experiencias, resiliencia, capacidad intercultural.
6. CARTAS DE RECOMENDACIÓN (5%): Peso real mayor al declarado — una carta excepcional de alguien conocido puede mover la aguja significativamente.`,

    promptStrategy: `DIRECTIVAS PARA RESPUESTAS DE BECA:
1. Abre la motivación con una anécdota personal concreta que te conecta con el campo de estudio. No "desde pequeño me interesa" — sino un momento específico que cambió tu dirección.
2. Estructura la carta de motivación en 3 actos: (a) De dónde vengo y qué problema identifiqué, (b) Qué he hecho hasta ahora para abordarlo y por qué necesito esta formación específica, (c) Qué haré al volver con esta nueva capacidad.
3. Nombra el programa ESPECÍFICO, profesores con los que quieres trabajar, cursos que te interesan. Los comités detectan cartas genéricas instantáneamente.
4. Incluye métricas de impacto social cuando existan: personas alcanzadas, comunidades beneficiadas, cambios implementados.
5. El plan de retorno debe ser CONCRETO: "Al regresar a [ciudad], implementaré [qué] en [institución/organización] para [resultado esperado]." Nada de "contribuiré al desarrollo de mi país."
6. Si hay gaps académicos (promedio bajo, cambio de carrera): aborda el elefante en la sala directamente. "Mi promedio de X refleja [contexto], pero mi trayectoria posterior demuestra [evidencia de capacidad]."
7. Conecta tu historia personal con la misión de la beca. Chevening quiere líderes que transforman; Fulbright quiere puentes culturales; DAAD quiere investigadores.
8. Si piden plan de investigación: problema claro → pregunta de investigación → metodología → resultados esperados → por qué este supervisor/lab/universidad.`,

    redFlags: [
      "Carta de motivación genérica que podría ser para cualquier beca/programa",
      "No mencionar el programa específico ni la universidad de destino",
      "Plan de retorno vago ('contribuir al desarrollo de mi país')",
      "Promedio académico bajo sin explicación o evidencia compensatoria",
      "Falta de actividades extracurriculares o de liderazgo",
      "Inconsistencias entre lo que dice el CV y la carta de motivación",
      "Errores en el idioma del país destino cuando el programa es en ese idioma",
      "No demostrar necesidad financiera cuando la beca lo requiere",
      "Copiar frases de la convocatoria textualmente como si fueran propias",
      "Cartas de recomendación genéricas (de alguien que claramente no te conoce bien)",
    ],

    contextPriorities: [
      "Promedio académico con escala del país (ej: 8.5/10 en sistema mexicano)",
      "Publicaciones, ponencias, participación en congresos con fechas",
      "Experiencia de liderazgo: qué lideraste, cuántas personas, qué resultado",
      "Voluntariado y servicio comunitario con impacto medible",
      "Idiomas con certificación oficial (TOEFL score, DELF nivel, etc.)",
      "Proyectos de investigación: tema, metodología, hallazgos principales",
      "Conexión personal con el campo de estudio — la anécdota que inició todo",
      "Razones específicas para elegir el país/universidad/programa destino",
      "Plan de retorno con institución u organización específica donde aplicarás lo aprendido",
      "Situación socioeconómica si aplica a becas con criterio de necesidad",
    ],

    keywordPatterns: [
      "liderazgo",
      "impacto social",
      "investigación",
      "plan de retorno",
      "compromiso comunitario",
      "excelencia académica",
      "interdisciplinario",
      "desarrollo sostenible",
      "innovación social",
      "transferencia de conocimiento",
      "cooperación internacional",
      "diversidad",
      "inclusión",
      "trayectoria académica",
      "publicación",
      "ponencia",
      "mentoría",
      "sociedad civil",
      "política pública",
      "emprendimiento social",
    ],

    improvementTemplate: `Para fortalecer tu perfil de beca:

GAP DETECTADO: {gap}

PLAN DE ACCIÓN (4-8 semanas):
1. Si es promedio académico bajo: No se puede cambiar, pero sí compensar. Toma 1-2 cursos online con certificado en plataformas reconocidas (edX, Coursera de universidad target) para demostrar capacidad académica actual. Incluye las calificaciones obtenidas.
2. Si es falta de liderazgo: Inicia algo AHORA — un grupo de estudio, un meetup local, un proyecto comunitario pequeño. En 4 semanas puedes tener un caso real de liderazgo documentado con participantes y resultados.
3. Si es idioma: Agenda un examen de certificación (TOEFL iBT, IELTS, DELF). Mientras tanto, agrega a tu contexto tu nivel estimado y fecha del examen programado.
4. Si es publicaciones: Publica un artículo de divulgación en Medium, un blog técnico, o presenta un poster en un evento local. No necesita ser peer-reviewed para mostrar iniciativa investigativa.
5. Si es plan de retorno débil: Contacta una organización/institución en tu ciudad donde podrías aplicar lo aprendido. Un email de interés de esa organización fortalece enormemente tu aplicación.

ACCIÓN INMEDIATA: Agrega a tu contexto: "[Actividad concreta] que demuestra [competencia faltante], realizada en [fecha], con [resultado/alcance]."

EN LA POSTULACIÓN: Reformula como: "Si bien mi experiencia formal en {gap} está en desarrollo, he iniciado [acción concreta + fecha] y planeo [siguiente paso] antes de iniciar el programa, como evidencia de mi compromiso con esta área."`,
  },

  aceleradora: {
    evaluatorPerspective: `Los revisores de aceleradoras son inversionistas, emprendedores exitosos, y operadores de startups. Evalúan con mentalidad de inversión — ¿apostaría MI dinero en este equipo?

PROCESO REAL DE SELECCIÓN:
- YC: Aplicación escrita (muy corta, respuestas de 1-2 líneas) → Entrevista de 10 minutos por video con partners. Reciben ~30,000 aplicaciones, entrevistan ~3,000, aceptan ~250 (1%).
- Techstars: Aplicación → Video de 1 min → Entrevistas múltiples con managing directors. 1-3% acceptance rate.
- 500 Global (ex-500 Startups): Aplicación → Entrevista → Demo Day pitch. Buscan tracción temprana, no solo ideas.
- Start-Up Chile (SUP): Proceso online con evaluadores externos. Puntaje ponderado. Aceptan ~100 de ~3,000 por cohorte. El programa Seed exige menos tracción que Scale.
- NXTP Labs / Platanus (Chile) / Kaszek Fellows: Varía, pero todos priorizan equipo > idea > tracción.

LO QUE REALMENTE BUSCAN (en orden de importancia real):
1. EQUIPO (40% del peso real): ¿Los founders se complementan? ¿Tienen experiencia de dominio? ¿Llevan suficiente tiempo trabajando juntos? ¿El CTO puede construir lo que el CEO promete?
2. MERCADO (25%): ¿Es un mercado de >$1B? ¿Está creciendo? ¿Hay timing — por qué AHORA?
3. TRACCIÓN (20%): Revenue > usuarios activos > signups > cartas de intención > nada. Cualquier señal de que el mercado quiere lo que construyes.
4. PRODUCTO (10%): ¿Funciona? ¿Los usuarios lo usan sin que les ruegues? MVP > prototipo > slides.
5. IDEA (5%): Paradójicamente, lo menos importante. Las ideas pivotean. Los equipos no.

FILTROS ELIMINATORIOS:
- Solo un founder técnico o solo un founder de negocio (sin complemento)
- "Solo nos falta un developer" = rechazo instantáneo
- Mercado demasiado nicho (<$100M TAM)
- Sin ninguna validación de mercado (ni siquiera entrevistas con usuarios)
- Founder que no puede articular su propuesta de valor en 1 oración`,

    scoringCriteria: `1. EQUIPO Y FOUNDERS (35%): Experiencia de dominio, complementariedad, tiempo trabajando juntos, capacidad de ejecución demostrada, dedicación full-time
2. OPORTUNIDAD DE MERCADO (25%): TAM/SAM/SOM creíble, timing, tendencias, dolor de cliente validado
3. TRACCIÓN Y VALIDACIÓN (20%): Métricas reales — MRR, usuarios activos, retention, growth rate. Cartas de intención. Pilotos pagados.
4. PRODUCTO Y TECNOLOGÍA (10%): MVP funcional, ventaja técnica defendible, roadmap claro
5. MODELO DE NEGOCIO (5%): Unit economics que hacen sentido, path to profitability, pricing validado
6. ESCALABILIDAD (5%): ¿Puede ser 100x más grande sin 100x más costos?`,

    promptStrategy: `DIRECTIVAS PARA RESPUESTAS DE ACELERADORA:
1. La primera oración es tu pitch de una línea. Formato: "[Nombre] es [qué] para [quién] que [beneficio principal]." Ejemplo: "PostulAI es un copiloto de postulaciones que redacta respuestas personalizadas para aplicantes en LATAM."
2. Lidera con tracción, no con la idea. "Tenemos $X MRR / X usuarios activos / X pilotos pagados" siempre va antes que "nuestra visión es..."
3. El equipo se presenta con credenciales de DOMINIO, no académicas. "María lideró growth en Rappi alcanzando 2M usuarios" > "María tiene MBA de [universidad]."
4. Mercado se cuantifica con datos: "El mercado de [X] en LATAM es de $Y billones y crece Z% anual (fuente)." TAM → SAM → SOM en ese orden.
5. Para preguntas de "¿por qué ahora?": Identifica el cambio reciente (regulación, tecnología, comportamiento) que hace tu solución posible/necesaria HOY.
6. Sé brutalmente honesto sobre lo que falta. Los evaluadores respetan "aún no tenemos X, y nuestro plan para resolverlo es Y" más que pretender que todo está resuelto.
7. Si aplicas a programa LATAM (SUP, NXTP): enfatiza impacto regional, creación de empleo, y solución de problemas específicos de la región.
8. Unit economics claros: CAC, LTV, payback period. Si no los tienes, di cuáles son tus assumptions y cómo planeas validarlas.`,

    redFlags: [
      "'Solo necesitamos un programador/CTO' — si no puedes atraer talento técnico, ¿por qué un inversor apostaría?",
      "Mercado demasiado pequeño o no cuantificado ('hay mucha demanda')",
      "Sin ninguna validación: ni usuarios, ni entrevistas, ni cartas de intención",
      "Founders part-time sin plan de dedicarse full-time",
      "Idea sin ventaja competitiva clara ('lo mismo pero mejor' no alcanza)",
      "'No tenemos competencia' — siempre hay competencia, aunque sea el status quo",
      "Proyecciones de hockey stick sin base en métricas actuales",
      "Aplicación que no menciona al equipo o pone toda la atención en la idea",
      "Revenue solo de grants/subsidios sin modelo comercial",
      "No saber los unit economics básicos",
    ],

    contextPriorities: [
      "Experiencia de los founders: roles previos en startups, industria de dominio, logros cuantificados",
      "Métricas de tracción: MRR, usuarios, retention, growth rate (mensual)",
      "Tiempo que llevan los co-founders trabajando juntos",
      "Inversión recibida o bootstrapped — cuánto y de quién",
      "Pilotos, clientes pagando, cartas de intención — con nombres si posible",
      "Tamaño de mercado con fuentes (reports, datos públicos)",
      "Stack técnico y ventaja tecnológica específica",
      "Modelo de negocio: pricing, CAC, LTV, canales de adquisición",
    ],

    keywordPatterns: [
      "tracción",
      "MRR",
      "crecimiento mensual",
      "usuarios activos",
      "product-market fit",
      "escalable",
      "unit economics",
      "TAM",
      "SAM",
      "ventaja competitiva",
      "equipo fundador",
      "modelo de negocio",
      "retención",
      "CAC",
      "LTV",
      "go-to-market",
      "pivote",
      "validación de mercado",
      "revenue",
      "impacto regional",
    ],

    improvementTemplate: `Para fortalecer tu aplicación a aceleradoras:

GAP DETECTADO: {gap}

PLAN DE ACCIÓN (2-6 semanas):
1. Si es tracción: Lanza un MVP mínimo (landing page + formulario de espera, o prototipo funcional) y consigue tus primeros 10-50 usuarios/signups esta semana. Documenta cada interacción. 10 usuarios reales > 1000 proyecciones.
2. Si es equipo incompleto: No busques un "CTO", busca un co-founder con skin in the game. Empieza con un contractor o un acuerdo de equity para alguien que ya esté construyendo contigo.
3. Si es mercado no cuantificado: Busca reports de mercado en Statista, Crunchbase, o datos de industria. Si no hay report específico, calcula bottom-up: precio × clientes potenciales × frecuencia.
4. Si es modelo de negocio: Define tu pricing esta semana. No necesita ser perfecto — "cobramos $X/mes y nuestros primeros 3 clientes aceptaron" es suficiente.
5. Si es validación: Haz 10 entrevistas con clientes potenciales ESTA SEMANA. Documenta: quién, qué dolor tienen, cuánto pagarían por resolverlo. Incluye citas textuales.

EN LA POSTULACIÓN: "{gap} es un área que estamos abordando activamente. Nuestro plan inmediato: [acción concreta con timeline]. Ya hemos [primer paso realizado] y los resultados iniciales muestran [dato real, por pequeño que sea]."`,
  },

  evento: {
    evaluatorPerspective: `Los comités de CFP (Call for Papers/Proposals) de conferencias evalúan con criterios muy diferentes a los académicos. El sesgo principal: ¿esta charla va a llenar la sala y dejar al público satisfecho?

PROCESO REAL DE SELECCIÓN:
- Conferencias grandes (PyCon, JSConf, KubeCon): Comité de 8-15 revisores. Cada propuesta es leída por 2-3 revisores. Votación por puntaje y discusión para borderline.
- Conferencias LATAM (Nerdearla, PyCon LATAM, RubyConf Colombia, DevFest): Comités más pequeños (5-8), muchas veces los organizadores mismos. Más peso en diversidad de temas y speakers.
- Meetups y eventos menores: Generalmente un organizador decide solo. Barrera de entrada más baja.

CÓMO EVALÚAN REALMENTE:
1. TÍTULO + ABSTRACT (80% del peso): Los revisores leen 100-300 propuestas. Si tu título no captura en 5 segundos, el abstract no se lee con atención.
2. SPEAKER PROFILE (15%): ¿Ha dado charlas antes? ¿Tiene presencia en la comunidad? ¿Puede manejar un escenario?
3. DIVERSIDAD (5%): Temas que complementen el programa, speakers de diferentes backgrounds, equilibrio de niveles.

SECRETOS DEL COMITÉ:
- Un título que promete algo concreto ("Cómo reduje el build time 80% con X") gana sobre uno abstracto ("Reflexiones sobre la performance en CI/CD")
- Propuestas con outline detallado de la charla puntúan más — demuestra que ya tienes el contenido, no solo la idea
- Los comités evitan charlas que son básicamente marketing de un producto
- Charlas con demo en vivo son preferidas sobre slides puras
- Los "principiantes que comparten su journey" son bienvenidos en LATAM más que en conferencias tier-1
- Workshop proposals necesitan demostrar que el speaker tiene material preparado y experiencia enseñando`,

    scoringCriteria: `1. RELEVANCIA Y ORIGINALIDAD (30%): ¿El tema es relevante para la audiencia? ¿Aporta algo que otras charlas no? ¿Es oportuno?
2. CLARIDAD DE LA PROPUESTA (25%): ¿El abstract comunica claramente qué va a aprender la audiencia? ¿Tiene outline?
3. EXPERIENCIA DEL SPEAKER (20%): Charlas anteriores, proyectos relacionados, presencia en comunidad. Para nuevos speakers: evidencia de conocimiento profundo del tema.
4. APLICABILIDAD (15%): ¿La audiencia puede aplicar lo aprendido el lunes siguiente? Charlas accionables > charlas teóricas
5. FORMATO Y NIVEL (10%): ¿Encaja con la duración propuesta? ¿El nivel es adecuado para la audiencia del evento?`,

    promptStrategy: `DIRECTIVAS PARA PROPUESTAS DE EVENTO:
1. El título es una promesa concreta. Formato que funciona: "Cómo [verbo de acción] [resultado específico] con [herramienta/técnica]" o "[Número] lecciones de [experiencia real] que [beneficio para la audiencia]".
2. El abstract tiene 3 partes: (a) El problema/contexto que la audiencia reconoce, (b) Lo que aprendiste/descubriste al enfrentarlo, (c) Lo que la audiencia se lleva — bullet points de takeaways concretos.
3. Incluye un outline de la charla con timing: "Intro y contexto (5min) → Problema y primeros intentos (10min) → Solución y demo (15min) → Lecciones y Q&A (10min)".
4. Menciona tu experiencia ESPECÍFICA con el tema. No "trabajo con Kubernetes" sino "migré 40 microservicios a Kubernetes en producción con 99.99% uptime".
5. Si nunca has dado una charla: destaca tu experiencia técnica profunda y menciona workshops internos, mentorías, o contenido educativo que hayas creado.
6. Para eventos LATAM: ofrece dar la charla en español y menciona tu conexión con la comunidad local.
7. Si propones workshop: detalla los requisitos previos de los asistentes, el material que proporcionas, y el proyecto que construirán durante la sesión.
8. Evita ser vendor pitch — si mencionas herramientas específicas, incluye alternativas y la lógica de por qué elegiste esa.`,

    redFlags: [
      "Título vago o demasiado amplio ('Introducción a DevOps')",
      "Abstract que es solo marketing de un producto o empresa",
      "No incluir outline ni estructura de la charla",
      "Proponer un tema sobre el que no tienes experiencia directa",
      "Charla de nivel demasiado básico para conferencias técnicas",
      "No especificar qué se lleva la audiencia (los takeaways)",
      "Abstract demasiado largo (>300 palabras) o demasiado corto (<100 palabras)",
      "Proponer 45 minutos para un tema que da para 15",
    ],

    contextPriorities: [
      "Charlas anteriores: nombre del evento, título, audiencia aproximada, link a slides/video si hay",
      "Experiencia técnica profunda en el tema propuesto con métricas",
      "Contenido educativo creado: blog posts, tutoriales, cursos internos",
      "Participación en comunidades: organizador de meetups, contribuidor open source",
      "Proyectos donde aplicaste el tema con resultados medibles",
      "Habilidades de presentación: workshops dados, mentorías, formación",
    ],

    keywordPatterns: [
      "experiencia práctica",
      "lecciones aprendidas",
      "caso real",
      "producción",
      "demo en vivo",
      "mejores prácticas",
      "errores comunes",
      "guía práctica",
      "hands-on",
      "comunidad",
      "open source",
      "escala",
      "performance",
      "arquitectura",
      "migración",
      "automatización",
      "observabilidad",
      "seguridad",
      "accesibilidad",
      "buenas prácticas",
    ],

    improvementTemplate: `Para fortalecer tu propuesta de charla/evento:

GAP DETECTADO: {gap}

PLAN DE ACCIÓN (1-4 semanas):
1. Si es falta de experiencia como speaker: Da una charla en un meetup local primero. Busca en meetup.com grupos de tu tecnología en tu ciudad. La mayoría necesitan speakers desesperadamente.
2. Si es falta de profundidad técnica: Escribe un blog post detallado sobre el tema. Si puedes escribir 2000 palabras con sustancia, puedes dar 30 minutos de charla.
3. Si es falta de caso real: Implementa el tema en un proyecto personal esta semana. "Lo probé en mi side project y encontré [resultado]" es suficiente contexto real.
4. Si es outline/estructura: Usa el framework PAS — Problema (3min), Agitación/contexto (5min), Solución con demo (15min), Takeaways (5min), Q&A (5min).

EN LA PROPUESTA: "Aunque es mi primera propuesta para [evento], he [dado workshops internos / escrito sobre el tema / implementado esto en producción] y mi enfoque se basa en experiencia directa con [caso concreto + métrica]."`,
  },

  voluntariado: {
    evaluatorPerspective: `Las organizaciones de voluntariado evalúan con un lente muy distinto al corporativo. Su pregunta central: ¿esta persona va a generar más valor del que cuesta coordinarla?

PROCESO DE SELECCIÓN POR ORGANIZACIÓN:
- AIESEC: Proceso estructurado — aplicación online → entrevista con comité local → matching con proyecto. Evalúan alineamiento con valores AIESEC (activar liderazgo, emprendimiento social).
- UN Volunteers (UNV): Perfil técnico + motivación + idiomas. Para misiones de campo, experiencia previa en contextos similares es casi obligatoria. Background check extenso.
- Techo/Un Techo Para Mi País: Más accesible. Evalúan disposición, trabajo en equipo, y resistencia física para trabajo de construcción. Compromiso mínimo de asistencia.
- Habitat for Humanity: Similar a Techo pero más internacional. Idiomas y experiencia intercultural pesan para programas internacionales.
- Cuerpo de Paz/Peace Corps: 2 años de compromiso. Evaluación exhaustiva: skills técnicas + adaptabilidad cultural + salud + motivación profunda.
- Voluntariado corporativo/local: Barrera baja, pero las organizaciones serias evalúan compromiso sostenido vs participación puntual.

LO QUE REALMENTE IMPORTA (perspectiva del coordinador de voluntarios):
1. COMPROMISO SOSTENIDO (35%): La pesadilla del coordinador es el voluntario que se entusiasma, viene 2 veces, y desaparece. Buscan señales de constancia.
2. HABILIDADES TRANSFERIBLES (25%): No necesitan que seas experto en desarrollo — necesitan que lo que sabes hacer (diseñar, programar, enseñar, organizar) sea útil para SU misión.
3. MOTIVACIÓN GENUINA (20%): Distinguen entre "quiero ayudar" (bien) y "quiero ponerlo en mi CV" (mal). La motivación narcisista se nota en las entrevistas.
4. ADAPTABILIDAD CULTURAL (15%): Para programas internacionales. ¿Has trabajado con personas de contextos diferentes al tuyo? ¿Puedes estar incómodo y seguir siendo productivo?
5. DISPONIBILIDAD REAL (5%): ¿Puedes comprometer X horas/semana de forma consistente?

SESGOS DE SELECCIÓN EN LATAM:
- Valoran mucho la conexión emocional con la causa
- Experiencia previa de voluntariado (aunque sea informal) es fuerte señal
- Hablar el idioma local fluido es a veces más importante que habilidades técnicas
- Las organizaciones prefieren voluntarios que viven cerca del proyecto (compromiso + logística)`,

    scoringCriteria: `1. MOTIVACIÓN Y ALINEAMIENTO (30%): ¿Por qué esta causa? ¿Por qué esta organización? ¿Hay conexión personal genuina?
2. HABILIDADES ÚTILES (25%): No las más impresionantes, las más ÚTILES para el proyecto. Un carpintero vale más que un MBA para Techo.
3. COMPROMISO DEMOSTRADO (20%): Voluntariado previo, proyectos comunitarios, constancia en actividades. Acciones > palabras.
4. DISPONIBILIDAD Y LOGÍSTICA (15%): Horas reales disponibles, ubicación, transporte, duración del compromiso.
5. COMPETENCIA INTERCULTURAL (10%): Para programas internacionales: idiomas, experiencias en otros contextos, adaptabilidad.`,

    promptStrategy: `DIRECTIVAS PARA RESPUESTAS DE VOLUNTARIADO:
1. Abre con tu conexión PERSONAL con la causa. No "me parece importante" sino "cuando [experiencia personal], entendí que [conexión con la misión]."
2. Tus habilidades se presentan como HERRAMIENTAS PARA LA MISIÓN, no como logros personales. "Sé programar" → "Puedo construir la herramienta de registro que necesitan sin costo para la organización."
3. Demuestra compromiso previo: voluntariado anterior, participación comunitaria, donaciones de tiempo/skills. Si no tienes, menciona compromiso sostenido en otras áreas (deportes, comunidades, proyectos largos).
4. Sé honesto sobre tu disponibilidad. Prometer 20 horas y cumplir 5 es peor que ofrecer 5 y cumplir 5.
5. Para programas internacionales: describe experiencias interculturales previas y tu capacidad de adaptación. Momentos donde estuviste fuera de tu zona de comfort.
6. Nunca hagas sonar el voluntariado como "bueno para mi CV" o "experiencia de crecimiento personal". El foco es en lo que APORTAS, no en lo que RECIBES.
7. Si la organización trabaja con poblaciones vulnerables: menciona cualquier capacitación o sensibilidad relevante (primeros auxilios, trabajo con menores, etc.).
8. Cierra con: "Me comprometo a [acción específica] durante [periodo concreto]."`,

    redFlags: [
      "Motivación centrada en el beneficio personal ('será una gran experiencia para mí')",
      "No investigar la organización ni su misión antes de aplicar",
      "Prometer más tiempo del que realistamente puedes dar",
      "Listar habilidades sin conectarlas con las necesidades del proyecto",
      "Actitud de salvador ('quiero ayudar a los menos afortunados')",
      "No mencionar voluntariado previo ni compromiso comunitario",
      "Esperar que el voluntariado sea como un intercambio cultural o vacaciones",
      "No tener disponibilidad real (solo fines de semana, solo una vez al mes)",
    ],

    contextPriorities: [
      "Voluntariado previo: organización, rol, duración, frecuencia, impacto",
      "Habilidades prácticas transferibles al proyecto (no solo profesionales)",
      "Idiomas con nivel funcional para el contexto del proyecto",
      "Experiencias interculturales: viajes, trabajo con comunidades diversas",
      "Conexión personal con la causa: anécdota o experiencia que motivó el interés",
      "Disponibilidad real: horas/semana, días, duración del compromiso",
      "Certificaciones relevantes: primeros auxilios, trabajo con menores, etc.",
      "Capacidad de trabajar en condiciones no ideales (campo, comunidades rurales)",
    ],

    keywordPatterns: [
      "compromiso",
      "servicio comunitario",
      "impacto social",
      "trabajo en equipo",
      "empatía",
      "adaptabilidad",
      "sensibilidad cultural",
      "comunicación",
      "liderazgo comunitario",
      "desarrollo humano",
      "sostenibilidad",
      "inclusión",
      "derechos humanos",
      "educación",
      "salud comunitaria",
      "medio ambiente",
      "primera infancia",
      "género",
      "migración",
      "resiliencia",
    ],

    improvementTemplate: `Para fortalecer tu perfil de voluntariado:

GAP DETECTADO: {gap}

PLAN DE ACCIÓN (1-4 semanas):
1. Si es falta de experiencia voluntaria: Busca una oportunidad de voluntariado local AHORA. Plataformas: Hacesfalta.org (España/LATAM), Voluntarios.cl (Chile), idealist.org, o contacta directamente a ONGs en tu ciudad. Incluso 2-3 sesiones te dan experiencia real para documentar.
2. Si es habilidad específica (ej: primeros auxilios): Cruz Roja ofrece cursos de fin de semana. Una certificación básica muestra seriedad y preparación.
3. Si es idioma: Para voluntariado internacional, un nivel B1 funcional es suficiente. Practica conversación en italki o busca intercambio de idiomas en tu ciudad.
4. Si es adaptabilidad/interculturalidad: Documenta experiencias que ya tienes y no reconoces como interculturales — trabajo con personas de otras regiones, proyectos con equipos remotos internacionales, viajes donde resolviste problemas.

EN LA POSTULACIÓN: "Mi experiencia directa en {gap} está en construcción — actualmente [acción que estás tomando]. Lo que sí aporto es [habilidad concreta que compensa] y un compromiso demostrado de [ejemplo de constancia en tu contexto]."`,
  },

  otro: {
    evaluatorPerspective: `Categoría genérica para convocatorias que no encajan en los sectores específicos (concursos, premios, fellowships, residencias artísticas, convocatorias gubernamentales, fondos de investigación no-académicos, etc.).

PRINCIPIO UNIVERSAL DE EVALUACIÓN:
Todo evaluador, sin importar el sector, responde mentalmente a 3 preguntas:
1. "¿Esta persona entiende lo que estamos buscando?" — Demuestra que leíste la convocatoria con atención
2. "¿Tiene evidencia de que puede hacer lo que promete?" — Historial > promesas
3. "¿Es la mejor opción entre los candidatos que tengo?" — Diferenciación importa

PROCESO TÍPICO:
- Primera ronda: filtro por elegibilidad y requisitos mínimos (automático o manual rápido)
- Segunda ronda: lectura del 30-40% que pasó el filtro, scoring con rúbrica
- Tercera ronda: deliberación del comité para los top 20-30%, decisión final

En convocatorias con menor volumen, el proceso es más humano y menos algorítmico. Cada palabra cuenta más.`,

    scoringCriteria: `1. ALINEAMIENTO CON LA CONVOCATORIA (30%): ¿El perfil del candidato se ajusta a lo que buscan? ¿Responde a los criterios declarados?
2. EVIDENCIA DE CAPACIDAD (25%): Logros previos que demuestren que puede ejecutar lo que propone
3. CLARIDAD DE PROPUESTA (20%): ¿Se entiende qué quiere hacer, cómo, y para qué?
4. IMPACTO ESPERADO (15%): ¿Qué cambia si esta persona recibe el apoyo/premio/oportunidad?
5. DIFERENCIACIÓN (10%): ¿Qué hace a esta persona distinta de los otros aplicantes?`,

    promptStrategy: `DIRECTIVAS GENERALES PARA CUALQUIER POSTULACIÓN:
1. Lee la convocatoria 3 veces. La primera para entender, la segunda para marcar keywords, la tercera para identificar lo que NO dicen pero buscan.
2. Estructura cada respuesta como: Gancho (dato/logro impactante) → Desarrollo (evidencia con método STAR) → Cierre (conexión con la convocatoria).
3. Usa las MISMAS PALABRAS que usa la convocatoria. Si dicen "innovación social", no escribas "cambio comunitario".
4. Cada afirmación fáctica lleva evidencia. "Soy bueno en X" → "En [proyecto], logré [resultado] usando [X]."
5. Sé específico. "Trabajé en varios proyectos" → "Lideré 3 proyectos de [tipo] que alcanzaron [resultado]."
6. Adapta el tono al de la convocatoria. Si es formal/institucional, escribe formal. Si es startup/innovación, escribe directo.
7. Si la convocatoria tiene criterios ponderados, ordena tu respuesta para abordar primero los de mayor peso.
8. Cierra cada respuesta con una conexión directa entre tu perfil y lo que la convocatoria busca.`,

    redFlags: [
      "Respuestas genéricas que podrían ser para cualquier convocatoria",
      "No mencionar la organización o programa por nombre",
      "Afirmaciones sin evidencia",
      "No respetar los límites de extensión",
      "Ignorar criterios de elegibilidad",
      "Errores de ortografía y gramática",
      "Tono inadecuado para el contexto",
      "No seguir las instrucciones del formulario",
    ],

    contextPriorities: [
      "Logros con métricas cuantificables en cualquier ámbito",
      "Experiencia relevante al tipo de convocatoria",
      "Habilidades con evidencia de aplicación real",
      "Motivación personal conectada al tema",
      "Disponibilidad y compromiso",
      "Diferenciadores únicos de tu perfil",
    ],

    keywordPatterns: [
      "resultados",
      "impacto",
      "evidencia",
      "experiencia",
      "liderazgo",
      "innovación",
      "compromiso",
      "propuesta",
      "objetivos",
      "metodología",
      "alcance",
      "sostenibilidad",
      "colaboración",
      "gestión",
      "análisis",
      "solución",
      "implementación",
      "evaluación",
      "mejora",
      "desarrollo",
    ],

    improvementTemplate: `Para fortalecer tu postulación:

GAP DETECTADO: {gap}

PLAN DE ACCIÓN GENERAL:
1. Identifica la habilidad o experiencia faltante y busca la forma más rápida de evidenciarla: curso online con certificado, proyecto personal, colaboración con alguien que la tiene.
2. Si el gap es de experiencia: busca una analogía en tu historial. ¿Hiciste algo SIMILAR en otro contexto? Documéntalo con métricas.
3. Si el gap es de conocimiento: dedica esta semana a aprender lo básico y documenta tu progreso. Un certificado de Coursera/edX en el tema vale más que "estoy interesado en aprender".
4. Si el gap es de red/contactos: asiste a un evento del sector esta semana. Un contacto relevante puede abrir puertas que tu CV solo no puede.

EN LA POSTULACIÓN: Aborda el gap con honestidad y plan: "Si bien {gap} es un área en desarrollo en mi perfil, mi experiencia en [habilidad transferible] me posiciona para [cómo compensa], y actualmente estoy [acción concreta] para cerrar esta brecha."`,
  },
};

export interface ElevatorPitchTemplate {
  structure: string;
  example: string;
  maxSeconds: number;
}

export interface InterviewTip {
  topic: string;
  advice: string;
}

export const SECTOR_PITCH: Record<OpportunityCategory, ElevatorPitchTemplate> = {
  empleo: {
    structure: "Soy [cargo] con [N años] en [industria]. En [empresa actual/reciente], [logro principal con número]. Busco [qué quieres] porque [conexión con la empresa].",
    example: "Soy ingeniera de software con 4 años en fintech. En Rappi, lideré la migración a microservicios que redujo latencia un 40%. Busco un rol senior en su equipo porque su enfoque en inclusión financiera conecta con mi experiencia en pagos digitales en LATAM.",
    maxSeconds: 30,
  },
  beca: {
    structure: "Estudio [carrera] en [universidad] y mi investigación se enfoca en [tema]. [Logro académico principal]. Con esta beca quiero [objetivo específico] porque [impacto esperado].",
    example: "Estudio ingeniería ambiental en la PUCP y mi investigación se enfoca en tratamiento de aguas en zonas rurales. Publiqué un paper en Water Research sobre biofiltros de bajo costo. Con esta beca quiero cursar el máster en KTH para escalar mi modelo a 50 comunidades en los Andes.",
    maxSeconds: 45,
  },
  hackathon: {
    structure: "Somos [equipo/yo] y resolvemos [problema específico] con [tecnología clave]. [Demo/prototipo que ya existe]. Nuestro diferenciador es [ventaja técnica única].",
    example: "Somos Aguatech y resolvemos el monitoreo de calidad de agua en ríos urbanos con sensores IoT de bajo costo. Ya tenemos un prototipo funcionando en el río Rímac con datos en tiempo real. Nuestro diferenciador es un algoritmo de ML que predice contaminación 6 horas antes de que ocurra.",
    maxSeconds: 60,
  },
  aceleradora: {
    structure: "En [startup] resolvemos [problema de mercado] para [segmento]. Tenemos [tracción: usuarios, revenue, pilotos]. Buscamos [qué necesitan] para [siguiente milestone].",
    example: "En AgriSmart resolvemos la pérdida post-cosecha para pequeños agricultores en Colombia. Tenemos 200 agricultores activos y $15K MRR. Buscamos la aceleración para entrar al mercado mexicano y cerrar nuestra ronda seed de $500K.",
    maxSeconds: 60,
  },
  evento: {
    structure: "Trabajo en [área] con foco en [tema del evento]. [Contribución o experiencia relevante]. Me interesa [qué busco en el evento] para [objetivo concreto].",
    example: "Trabajo en UX Research con foco en accesibilidad digital. Lideré la auditoría WCAG de una app con 2M de usuarios. Me interesa este workshop para conectar con equipos que implementan design systems inclusivos a escala.",
    maxSeconds: 30,
  },
  voluntariado: {
    structure: "Tengo experiencia en [habilidad relevante] y quiero aportar a [causa] porque [motivación personal genuina]. Puedo dedicar [tiempo disponible] y mi contribución concreta sería [qué harías].",
    example: "Tengo 3 años de experiencia en desarrollo web y quiero aportar a educación digital en comunidades rurales porque crecí en una zona sin acceso a internet. Puedo dedicar 10 horas semanales y mi contribución sería crear la plataforma de cursos offline que necesitan.",
    maxSeconds: 30,
  },
  otro: {
    structure: "Soy [quién eres] con experiencia en [área relevante]. [Logro o proyecto que conecta con la convocatoria]. Me interesa porque [motivación específica].",
    example: "Soy diseñadora industrial con experiencia en materiales sostenibles. Desarrollé un empaque biodegradable que reduce 60% el plástico en delivery. Me interesa esta convocatoria porque busco financiar pruebas de producción a escala.",
    maxSeconds: 30,
  },
};

export const SECTOR_INTERVIEW: Record<OpportunityCategory, InterviewTip[]> = {
  empleo: [
    { topic: "Háblame de ti", advice: "Usa tu elevator pitch. No recites tu CV cronológicamente. 2 minutos max: trayectoria → logro clave → por qué esta empresa." },
    { topic: "Mayor debilidad", advice: "Elige una real pero manejable. Muestra qué haces para mejorarla. Nunca: 'soy perfeccionista' — nadie lo cree." },
    { topic: "Por qué dejas tu trabajo", advice: "Nunca hables mal. Enfócate en crecimiento: 'Busco [X] que mi rol actual no ofrece, y ustedes tienen exactamente eso.'" },
    { topic: "Cuéntame un conflicto", advice: "Usa STAR (Situación-Tarea-Acción-Resultado). El conflicto debe terminar en aprendizaje, no en victoria sobre alguien." },
    { topic: "Expectativa salarial", advice: "Investiga en Glassdoor/LinkedIn el rango. Da un rango (no un número fijo). 'Basándome en mi experiencia y el mercado, busco entre X e Y.'" },
    { topic: "Preguntas para ellos", advice: "Siempre ten 2-3: sobre el equipo, los desafíos del rol, o cultura. Nunca preguntes sobre vacaciones/beneficios en la primera entrevista." },
  ],
  beca: [
    { topic: "Motivación", advice: "Conecta tu historia personal con tu campo de estudio. Los comités buscan coherencia narrativa, no genios — personas con propósito claro." },
    { topic: "Plan de retorno", advice: "Detalla cómo aplicarás lo aprendido en tu país/región. Sé específico: instituciones, proyectos, comunidades. Los donantes quieren impacto." },
    { topic: "Desafío superado", advice: "Elige algo que demuestre resiliencia y autonomía. Becas LATAM valoran mucho el contexto socioeconómico como fortaleza, no como excusa." },
    { topic: "Investigación futura", advice: "Nombra a profesores/laboratorios específicos de la universidad destino. Demuestra que investigaste el programa, no solo la marca." },
    { topic: "Liderazgo", advice: "No necesitas haber sido presidente de algo. Lidera es influir: mentoría, comunidades, proyectos voluntarios, emprendimientos estudiantiles." },
  ],
  hackathon: [
    { topic: "Demo", advice: "Muestra, no expliques. Los jueces ven 20 demos — el que funciona en vivo gana. Ten un backup (video) por si falla." },
    { topic: "Pitch técnico", advice: "1 slide de problema, 1 de solución, 1 de demo, 1 de arquitectura, 1 de siguiente paso. No más. Los jueces técnicos preguntan el resto." },
    { topic: "Viabilidad", advice: "No digas 'revolucionamos'. Di: 'Resolvemos X para Y con Z. Hoy existe [alternativa] pero falla en [punto específico].'" },
    { topic: "Equipo", advice: "Muestra roles claros y complementariedad. Un equipo de 4 backend no impresiona. Diversidad de habilidades sí." },
  ],
  aceleradora: [
    { topic: "Tracción", advice: "Números primero: usuarios, revenue, growth rate, retention. Sin tracción, muestra validación: cartas de intención, pilotos, waitlist." },
    { topic: "Mercado", advice: "TAM/SAM/SOM con fuentes. No inventes números. 'El mercado de X en LATAM es $Y según [fuente]' es mejor que '$100B de oportunidad'." },
    { topic: "Competencia", advice: "Nunca digas 'no hay competencia'. Muestra mapa competitivo y tu diferenciador. 'Ellos hacen X, nosotros hacemos Y porque Z.'" },
    { topic: "Ask", advice: "Sé específico: '$X para Y que nos lleva a Z en N meses'. Mentor en [área], conexiones con [tipo de cliente/inversor]." },
    { topic: "Unit economics", advice: "CAC, LTV, margen, payback period. Si no los tienes, di los assumptions y cómo los vas a validar. Nunca inventes métricas." },
  ],
  evento: [
    { topic: "Networking", advice: "Prepara tu intro de 15 segundos. Haz preguntas sobre el trabajo del otro — la gente recuerda a quien escucha, no a quien habla." },
    { topic: "Preguntas a speakers", advice: "Pregunta algo específico sobre su presentación, no genérico. 'Mencionaste X, ¿cómo manejaste Y?' muestra que escuchaste." },
    { topic: "Follow-up", advice: "LinkedIn dentro de 24h con mensaje personalizado. 'Hablamos sobre X en el break del panel de Y' — sin esto, el contacto se pierde." },
  ],
  voluntariado: [
    { topic: "Motivación", advice: "Sé genuino. Los coordinadores detectan volunturismo. Conecta con una experiencia real, no con 'quiero ayudar al mundo'." },
    { topic: "Compromiso", advice: "Sé honesto con tu disponibilidad. Es mejor 5h reales que 20h que no cumples. Pregunta qué necesitan, no qué quieres hacer." },
    { topic: "Habilidades", advice: "Ofrece algo concreto: puedo diseñar su web, dar clases de inglés, organizar su contabilidad. Lo específico es más útil que 'ayudo en lo que sea'." },
  ],
  otro: [
    { topic: "Adaptabilidad", advice: "Demuestra que investigaste la convocatoria. Adapta tu discurso al contexto específico. Genérico = descartado." },
    { topic: "Diferenciador", advice: "¿Qué te hace distinto de otros aplicantes? No basta ser bueno — todos lo son. Encuentra tu ángulo único." },
  ],
};

// ponytail: CV-first vs portfolio-first per category
export const CATEGORY_META: Record<OpportunityCategory, { needsCv: boolean; focusLabel: string }> = {
  empleo:       { needsCv: true,  focusLabel: "CV y experiencia laboral" },
  beca:         { needsCv: true,  focusLabel: "CV y trayectoria académica" },
  hackathon:    { needsCv: false, focusLabel: "Portafolio y proyectos" },
  aceleradora:  { needsCv: false, focusLabel: "Tracción y equipo" },
  evento:       { needsCv: false, focusLabel: "Experiencia y propuesta" },
  voluntariado: { needsCv: false, focusLabel: "Compromiso y habilidades" },
  otro:         { needsCv: false, focusLabel: "Perfil general" },
};

export interface CompactSkill {
  perspective: string;
  criteria: string;
  strategy: string;
  redFlags: string[];
  keywords: string[];
  pitchTemplate: ElevatorPitchTemplate;
  interviewTips: InterviewTip[];
}

// ponytail: ~500 tokens instead of ~3000 per call
export function getCompactSkill(cat: OpportunityCategory): CompactSkill {
  const skill = SECTOR_SKILLS[cat];

  const perspectiveLines = skill.evaluatorPerspective
    .split("\n")
    .filter((l) => l.trim())
    .slice(0, 6)
    .join("\n");

  const criteriaLines = skill.scoringCriteria
    .split("\n")
    .filter((l) => l.trim() && /^\d/.test(l.trim()))
    .map((l) => l.replace(/:\s.*$/, "").trim())
    .join("; ");

  const strategyLines = skill.promptStrategy
    .split("\n")
    .filter((l) => l.trim() && /^\d/.test(l.trim()))
    .map((l) => l.trim())
    .slice(0, 5)
    .join("\n");

  return {
    perspective: perspectiveLines,
    criteria: criteriaLines,
    strategy: strategyLines,
    redFlags: skill.redFlags.slice(0, 5),
    keywords: skill.keywordPatterns,
    pitchTemplate: SECTOR_PITCH[cat],
    interviewTips: SECTOR_INTERVIEW[cat],
  };
}
