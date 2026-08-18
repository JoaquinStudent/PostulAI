# Technical Plan — Calco

## 1. Stack

| Capa | Elección | Por qué |
|---|---|---|
| Framework | Next.js 15, App Router, TypeScript estricto | Despliegue directo a Vercel; una sola ruta de API necesaria. |
| Estilos | Tailwind CSS v4 con `@theme` | Los tokens del `ui-spec` se transcriben literalmente; sin capa de configuración JS. |
| Componentes | shadcn/ui | Código propio, no dependencia opaca. Se reestilizan a los tokens de Calco. |
| Estado | Zustand | Estado de sesión en memoria, simple, sin boilerplate. Un store por dominio. |
| Iconos | lucide-react | Consistente con el trazo del sistema de diseño. |
| Extracción web | `@mozilla/readability` + `jsdom` en ruta de API | Texto principal limpio sin navegador headless. |
| PDF | `pdfjs-dist` en el cliente | Cumple P1: el archivo nunca sale del navegador. |
| Persistencia opcional | `idb-keyval` | Solo para el contexto, si el usuario lo activa. |
| Cifrado | WebCrypto nativo | Sin dependencias de criptografía de terceros. |
| IA | OpenRouter, llamada directa desde el navegador | Cumple P1 y evita el límite de tiempo de las funciones serverless. |

**Descartado y por qué:** Puppeteer/Playwright (peso y latencia en Vercel, D4); cualquier base de
datos (P1, D1); NextAuth o similar (no hay cuentas); librerías de analítica (P1).

## 2. Arquitectura

```
NAVEGADOR                                        SERVIDOR (Vercel)
┌──────────────────────────────────────┐        ┌────────────────────────┐
│  UI (React Server + Client Comps)    │        │  /api/extract          │
│                                      │        │  ─ recibe: { url }     │
│  Zustand stores (memoria)            │        │  ─ fetch + Readability │
│   ├── session   contexto, clave      │        │  ─ devuelve: { text }  │
│   ├── batch     fuentes, análisis    │───────▶│  ─ sin estado, sin log │
│   └── draft     preguntas, respuestas│        └────────────────────────┘
│                                      │
│  lib/ai  ─────────────────────────────────────▶ api.openrouter.ai
│   (clave del usuario, streaming)               (nunca pasa por Vercel)
│                                      │
│  lib/pdf  (pdfjs, local)             │
│  lib/vault (WebCrypto + IndexedDB)   │
└──────────────────────────────────────┘
```

Regla estructural: **`/api/extract` es la única ruta de servidor**. Si aparece la necesidad de
una segunda, es señal de que algo está violando P1 y debe revisarse antes de implementarse.

## 3. Estructura de carpetas

```
app/
  layout.tsx                 # tokens, fuentes, CSP
  page.tsx                   # bienvenida
  contexto/page.tsx          # prompt generador + adjuntar (bloqueante)
  conectar/page.tsx          # OpenRouter
  lote/page.tsx              # pegar enlaces + cola
  lote/[id]/page.tsx         # detalle de convocatoria
  lote/[id]/preguntas/page.tsx
  lote/[id]/respuestas/page.tsx   # mesa de trabajo
  ajustes/page.tsx
  api/extract/route.ts
components/
  ui/                        # shadcn reestilizado
  session-bar.tsx
  limit-ruler.tsx            # elemento firma
  evidence-card.tsx
  gap-card.tsx
  opportunity-row.tsx
  source-queue-item.tsx
lib/
  ai/client.ts               # fetch a OpenRouter, streaming, reintentos
  ai/models.ts               # presets y catálogo
  ai/cost.ts                 # estimación previa de costo
  prompts/                   # ver prompts-spec.md
  extract/pdf.ts
  extract/text.ts            # normalización y troceo
  parse/questions.ts         # separación de preguntas
  parse/limits.ts            # detección de límites
  vault.ts                   # cifrado de la clave
  storage.ts                 # IndexedDB opcional
  types.ts                   # ver data-model.md
stores/
  session.ts  batch.ts  draft.ts
```

## 4. Integración con OpenRouter

### Autenticación
Dos caminos, ambos terminan con una clave en memoria:
1. **OAuth PKCE** (recomendado). Redirección a OpenRouter, retorno con código, intercambio por
   clave asociada a Calco, revocable por el usuario desde su panel.
2. **Pegado manual**, con validación inmediata contra el endpoint de clave para confirmar que es
   válida y mostrar el crédito restante.

### Llamadas
Endpoint de chat completions estándar, desde el navegador. Headers obligatorios: la autorización
con la clave del usuario, más los headers de atribución de aplicación (referer y título), que
mejoran los límites de tasa y son requisito de buena ciudadanía en OpenRouter.

Streaming activado siempre en redacción. En triage no hace falta.

### Presets de modelo
Tres niveles, configurables por el usuario, con la lista completa disponible en modo avanzado.
Los identificadores concretos **no se codifican en duro**: se leen del catálogo de modelos de
OpenRouter al conectar, y los presets son una selección por defecto sobre ese catálogo, validada
en tiempo de ejecución. Si un modelo del preset dejó de existir, la app cae al siguiente
disponible y lo informa.

| Preset | Uso | Criterio de selección |
|---|---|---|
| Económico | Extracción estructurada y triage. Siempre se usa este para el lote. | Costo mínimo con ventana de contexto suficiente para bases largas. |
| Equilibrado | Defecto para redacción. | Buena calidad de escritura a costo moderado. |
| Máxima calidad | Redacción de respuestas críticas. | Mejor calidad disponible, sin tope de costo. |

### Control de costo
Antes de cualquier operación que gaste, se estima: `tokens_entrada × precio_entrada +
tokens_salida_estimados × precio_salida`, usando los precios del catálogo. Se muestra en
JetBrains Mono junto al botón. Tras cada llamada se descuenta del crédito mostrado en la barra
superior.

### Errores
| Situación | Comportamiento |
|---|---|
| 401 / clave inválida | Modal de reconexión, no se pierde el trabajo en curso |
| 402 / sin crédito | Aviso con el enlace al panel de OpenRouter |
| 429 | Reintento con retroceso exponencial, hasta 3 veces, con estado visible |
| 5xx del proveedor | Reintento 1 vez; luego ofrecer cambiar de modelo |
| Respuesta no parseable | Reintento 1 vez con instrucción de formato reforzada; luego error explícito |

## 5. Extracción de fuentes

### `/api/extract`
Entrada: una URL. Salida: título, texto plano normalizado, cantidad de palabras y dominio.

Reglas de la ruta:
- Timeout de 12 segundos; por encima, se responde fallo con causa `timeout`.
- Rechazo de direcciones privadas y locales para evitar SSRF.
- Límite de tamaño de descarga de 5 MB.
- Solo `text/html` y `application/pdf`; otros tipos devuelven fallo con causa `unsupported`.
- **No registra la URL ni el contenido.**

Causas de fallo tipificadas, cada una con su mensaje y su acción sugerida en la interfaz:
`timeout`, `blocked` (403 / muro de sesión), `not_found`, `unsupported`, `empty` (se descargó
pero no hay texto útil, típico de páginas renderizadas por JS), `network`.

En todos los casos el destino es el mismo: la fila queda en la cola con el botón de pegado
manual. **Google Forms y sitios tras inicio de sesión nunca funcionarán**; el mensaje debe
decirlo sin rodeos en vez de sugerir reintentar.

### PDF
`pdfjs-dist` en un web worker. Extracción de texto por página, concatenación con normalización de
saltos. Si el PDF no tiene capa de texto (escaneado), se informa que no es legible y se ofrece el
pegado manual; no se implementa OCR en el MVP.

### Normalización
Todo texto extraído pasa por: colapso de espacios, eliminación de menús y pies repetidos por
heurística de líneas duplicadas, y truncado por ventana de contexto priorizando las secciones que
contienen palabras clave de bases (requisitos, criterios, elegibilidad, fechas, premios).

## 6. Concurrencia del lote

Cola con concurrencia máxima de 3 fuentes simultáneas para no saturar límites de tasa. Cada
fuente avanza por su propia máquina de estados:

```
pendiente → extrayendo → extraído → analizando → listo
                ↓                        ↓
             fallido                  fallido
                ↓
        (pegado manual) → extraído
```

El fallo de una fuente nunca detiene la cola (RNF-05). El usuario puede entrar a la mesa de
comparación mientras las restantes terminan.

## 7. Seguridad aplicada

Detalle completo en `security-spec.md`. Puntos que condicionan la arquitectura:

- **CSP estricta** definida en `next.config`, con `connect-src` limitado a la propia app y a
  OpenRouter. Es la mitigación central: aunque se inyecte JS, la clave no puede exfiltrarse.
- **Cero scripts de terceros.** Fuentes autoalojadas, sin CDN, sin analítica.
- La clave nunca se serializa en el store persistido, ni se envía a un error boundary, ni aparece
  en logs.
- Dependencias mínimas y con lockfile fijado.

## 8. Rendimiento

- Componentes de servidor por defecto; cliente solo donde hay interacción.
- `pdfjs` y el catálogo de modelos se cargan de forma diferida.
- La mesa de comparación con más de 30 filas se virtualiza; por debajo no hace falta.
- Streaming de respuestas para percepción inmediata (RNF-04).

## 9. Riesgos técnicos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Muchos sitios de convocatorias renderizan con JS y devuelven vacío | Alto: el flujo por lote pierde valor | Pegado manual como camino de primera clase, no como excepción; mensajes claros; medir tasa de éxito real en Sprint 2 |
| El modelo inventa logros pese a las instrucciones | Alto: rompe P3 | Prompt con evidencia obligatoria, salida estructurada con campo de citas, validación de que cada afirmación tenga origen, y `[GAP]` explícito |
| Modelos que no respetan el límite de caracteres | Medio | Verificación programática tras generar, con reintento automático de acortado; el límite se valida en código, nunca se confía al modelo |
| Cambios en identificadores de modelos de OpenRouter | Medio | Catálogo leído en tiempo de ejecución, sin identificadores en duro |
| jsdom pesado en cold start de Vercel | Bajo | Ruta aislada, sin dependencias extra; medir y, si molesta, evaluar un parser más liviano |
| Usuario pierde trabajo por recarga | Alto en percepción | Diálogo de salida, barra de sesión persistente, exportación siempre a un clic |
