# Data Model — Calco

> No hay base de datos ni esquema persistido. Este documento define los tipos en memoria que
> viajan por los stores de Zustand y la forma de las respuestas estructuradas del modelo.
> Sirve como contrato entre la capa de IA, los stores y la interfaz.

## 1. Sesión

```ts
type StorageMode = 'memory' | 'session' | 'vault';

interface UserContext {
  raw: string;              // contenido íntegro del .md, se envía al modelo
  fileName: string;
  sizeBytes: number;
  loadedAt: number;
  summary: ContextSummary;  // derivado, para mostrar en pantalla
}

interface ContextSummary {
  profile: string;
  sections: ContextSection[];
  warnings: ContextWarning[];   // p.ej. ausencia de logros medibles
}

interface ContextSection {
  key: 'profile' | 'projects' | 'achievements' | 'skills';
  label: string;
  itemCount: number;
  preview: string;
}

interface ContextWarning {
  code: 'no_metrics' | 'too_short' | 'no_projects' | 'no_dates';
  message: string;
  suggestion: string;
}

interface AiConnection {
  status: 'disconnected' | 'connected' | 'invalid';
  method: 'oauth' | 'manual';
  keyMasked: string;          // única forma que se muestra en UI
  storageMode: StorageMode;
  credit: { remaining: number; limit: number | null } | null;
  preset: 'economy' | 'balanced' | 'quality';
  models: { economy: string; balanced: string; quality: string };
}
```

> La clave en claro vive fuera de este tipo, en una referencia no serializable del store.
> Nunca se incluye en snapshots, exportaciones ni logs (ver `security-spec.md`).

## 2. Fuentes y lote

```ts
type SourceKind = 'url' | 'pdf' | 'pasted';

type SourceStatus =
  | 'pending' | 'extracting' | 'extracted'
  | 'analyzing' | 'ready' | 'failed';

type FailureCause =
  | 'timeout' | 'blocked' | 'not_found'
  | 'unsupported' | 'empty' | 'network' | 'no_text_layer';

interface Source {
  id: string;
  kind: SourceKind;
  origin: string;             // URL, nombre de archivo, o "Texto pegado"
  status: SourceStatus;
  text: string | null;        // texto normalizado
  wordCount: number | null;
  failure: { cause: FailureCause; message: string; canRetry: boolean } | null;
  opportunityId: string | null;
}
```

Cada `FailureCause` tiene un mensaje fijo y una acción sugerida. `blocked` y `empty` nunca
sugieren reintentar: llevan directo al pegado manual.

## 3. Convocatoria analizada

```ts
interface Opportunity {
  id: string;
  sourceIds: string[];
  title: string;
  organizer: string | null;
  type: string | null;           // hackathon, beca, fondo, aceleradora…
  modality: string | null;
  deadline: string | null;       // ISO; null si no se pudo determinar
  prize: string | null;
  language: 'es' | 'en' | 'pt' | 'other';   // idioma en que se debe responder
  brief: OpportunityBrief;
  fit: FitAssessment;
  effort: EffortEstimate;
  discarded: boolean;
  analyzedAt: number;
}

interface OpportunityBrief {
  seeking: string;                   // qué buscan, 3-4 frases
  criteria: EvaluationCriterion[];
  tone: string[];                    // etiquetas: "técnico", "orientado a impacto"…
  redFlags: string[];                // qué penaliza
  eligibility: string[];
  confidence: 'high' | 'medium' | 'low';  // qué tan completo era el texto fuente
}

interface EvaluationCriterion {
  name: string;
  weight: number | null;    // 0-100; null si las bases no lo especifican
  description: string;
}

interface FitAssessment {
  score: number;            // 0-100
  strengths: FitPoint[];
  gaps: FitPoint[];
  blocking: boolean;        // true si incumple un requisito de elegibilidad duro
}

interface FitPoint {
  claim: string;
  evidence: string | null;  // cita del contexto del usuario; null en los gaps
}

interface EffortEstimate {
  questionCount: number | null;
  approxWords: number | null;
  note: string | null;
}
```

`confidence: 'low'` debe reflejarse en la interfaz: si el texto fuente estaba incompleto, el
encaje calculado no merece la misma confianza y el usuario tiene que saberlo.

## 4. Preguntas y respuestas

```ts
type LimitUnit = 'characters' | 'words';

interface Question {
  id: string;
  index: number;
  text: string;
  limit: { value: number; unit: LimitUnit; detected: boolean } | null;
  raw: string;              // fragmento original tal como se pegó
}

type AnswerStatus = 'empty' | 'generating' | 'draft' | 'over_limit' | 'approved';

interface Answer {
  questionId: string;
  text: string;
  status: AnswerStatus;
  charCount: number;
  wordCount: number;
  withinLimit: boolean;
  evidence: Evidence[];
  gaps: Gap[];
  history: string[];        // versiones previas, para deshacer
  generatedAt: number | null;
}

interface Evidence {
  ref: number;              // número volado que aparece en el texto
  origin: 'user_context' | 'opportunity';
  section: string;          // "PROYECTOS", "CRITERIOS DE EVALUACIÓN"…
  quote: string;            // cita literal del origen
  supportsCriterion: string | null;
}

interface Gap {
  id: string;
  description: string;      // "No encuentro una métrica de usuarios para este proyecto"
  placeholder: string;      // marcador insertado en el texto
  resolved: boolean;
  userInput: string | null;
}
```

`withinLimit` se calcula **en código**, nunca se confía a la salida del modelo (ver riesgo en
`technical-plan.md`). Si es `false`, el estado pasa a `over_limit` y se bloquea la aprobación.

## 5. Stores

```ts
// stores/session.ts
{ context, connection, storageMode, hasUnexportedWork }

// stores/batch.ts
{ sources[], opportunities[], queueState, sortBy, addSources, analyze, discard }

// stores/draft.ts
{ opportunityId, questions[], answers{}, generate, refine, approve, exportAs }
```

`hasUnexportedWork` es el disparador del diálogo de salida (RF-D-06). Se marca `true` en cuanto
existe una respuesta generada y vuelve a `false` tras una exportación exitosa.

## 6. Formato de exportación

**JSON** replica los tipos anteriores omitiendo `history`, `raw` y todo lo relativo a la conexión.

**Markdown** con esta estructura por convocatoria:

```
# {título}
{organizador} · {tipo} · Cierra {fecha}

## Análisis
Encaje: {score}%
A favor: …
En contra: …

## Respuestas

### 1. {pregunta}
Límite: {valor} {unidad} · Usado: {n}

{respuesta}

---
```

Con el interruptor de análisis desactivado, se exporta solo el bloque de respuestas.

## 7. Contrato de salida del modelo

Todas las llamadas de extracción y evaluación piden JSON estricto que valida contra estos tipos
antes de entrar al store. Si la validación falla se reintenta una vez con la instrucción de
formato reforzada; si vuelve a fallar, se muestra error explícito (P6) y **nunca** se guarda una
estructura parcial o adivinada.
