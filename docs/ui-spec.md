# UI Spec — Calco

> Derivado de los mocks aprobados en Stitch. Los mocks mandan (P8). Cualquier desviación en
> implementación se documenta aquí antes de mergear.

## 1. Concepto

Papel autocopiativo y formulario oficial. La interfaz se ve como un formulario de trámite pero
ejecutado con precisión editorial moderna. Rectilínea, densa en información, sin decoración.

**Prohibido:** gradientes, glassmorphism, sombras difusas, ilustraciones genéricas, esquinas
redondeadas grandes, iconos decorativos sin función.

## 2. Tokens

Se transcriben literalmente al bloque `@theme` de Tailwind v4.

### Color

| Token | Hex | Uso |
|---|---|---|
| `paper` | `#F2F4F7` | Fondo de página |
| `surface` | `#FFFFFF` | Tarjetas, inputs, barras |
| `ink` | `#131A22` | Texto principal |
| `ink-muted` | `#5A6672` | Texto secundario, metadatos |
| `rule` | `#C9D2DB` | Bordes y separadores |
| `stamp` | `#22439B` | Acción principal, progreso, evidencia |
| `marker` | `#F5D547` | Resaltado, barra de sesión (al 25%) |
| `alert` | `#C6303A` | Excedente, gaps, fallos, destructivo |
| `confirm` | `#1E7A5F` | Aprobado, listo, éxito |

Opacidades canónicas para fondos: 8% para tarjetas de alerta, 10% para badges, 20-25% para la
barra de sesión.

### Tipografía

| Rol | Familia | Uso |
|---|---|---|
| Display | Archivo 600-700, tracking -0.02em | Títulos de pantalla y de tarjeta, números grandes |
| Cuerpo | Public Sans 400-500 | Todo el texto de interfaz y contenido |
| Utilidad | JetBrains Mono 400 | Contadores, límites, claves, URLs, fechas, costos, etiquetas en mayúsculas con tracking 0.08em |

Escala: 56 / 36 / 32 / 24 / 22 / 18 / 17 / 16 / 14 / 13 / 12 / 11 / 10.

Regla de uso: **los datos van en mono, la prosa en Public Sans, los títulos en Archivo.** Un
número que el usuario tiene que leer con precisión (312/300, $0.006, 84%) va en mono o en Archivo,
nunca en Public Sans.

### Forma y espacio

- Radio: `4px` universal. Píldoras solo en badges de estado.
- Bordes: `1px solid rule`. Los inputs llevan además borde inferior de `2px`.
- Sombras: ninguna, salvo hairline en menús flotantes.
- Rejilla de 8px. Contenido a 1100px máximo, centrado.

## 3. Componentes propios

### `LimitRuler` — elemento firma

Regla horizontal graduada con marcas verticales cada 10%. Se rellena en `stamp` según el consumo;
el tramo excedente en `alert`. A la derecha, el contador en JetBrains Mono con formato `n / max`.

Estados: normal (< 90%), lleno (90-100%, sigue en `stamp`), excedido (> 100%, tramo en `alert` y
el texto sobrante tachado con línea de corrector dentro del campo de respuesta).

Es el elemento por el que se recuerda la app. No se sustituye por una barra de progreso genérica
ni se le agregan animaciones.

### `SessionBar`

Franja de 28px (24px en móvil) bajo la barra superior. Fondo `marker` al 25%, sin borde. Texto en
JetBrains Mono 12px mayúsculas a la izquierda: `SESIÓN TEMPORAL · NADA SE GUARDA AL CERRAR`.
Enlace subrayado a la derecha: `Exportar ahora`. Presente en todas las pantallas posteriores al
ingreso. **No es descartable.**

### `EvidenceCard`

Tarjeta numerada correspondiente a un número volado del texto. Etiqueta de origen en mono
mayúsculas, dos líneas de cita literal, y el criterio al que responde. Si la cita no se pudo
verificar contra el contexto (ver `prompts-spec.md`), se muestra atenuada con una nota.

### `GapCard`

Borde `1px alert`, fondo `alert` al 8%. Encabezado `FALTA UN DATO` en mono. Descripción concreta
de qué falta, input y botón "Agregar". No es un error del sistema: es una petición al usuario y el
tono debe reflejarlo.

### `OpportunityRow`

Fila de 96px con franja vertical izquierda de 4px cuyo color va de `confirm` a `rule` según el
encaje. Cuatro zonas: identidad (40%), encaje (15%), razones a favor y en contra (25%), fecha,
esfuerzo y acción (20%). Con encaje menor a 40%, toda la tipografía pasa a `ink-muted` y el botón
a versión fantasma. **Nunca se ocultan.**

### `SourceQueueItem`

Fila de 72px con franja de estado. Muestra origen, estado y, en caso de fallo, la causa en lenguaje
llano más las acciones "Pegar texto" y "Quitar". La causa se explica; no se muestra un código.

## 4. Patrones

### Estados de carga
Streaming siempre que haya texto generándose. Barras indeterminadas de 2px para extracción. Nunca
un spinner centrado sin contexto.

### Estados vacíos
Son invitaciones a actuar, no adornos. El estado vacío de la app **es** la pantalla de pegar
enlaces: no existe una pantalla intermedia de "aún no tienes nada".

### Errores
Dicen qué pasó y qué hacer, en la voz de la interfaz. No se disculpan. No usan códigos técnicos.
Ofrecen siempre el camino manual (P6).

### Badges
Rectangulares, radio 4px, JetBrains Mono 11px mayúsculas, fondo del color semántico al 10%, texto
en el color pleno.

## 5. Responsive

| Rango | Comportamiento |
|---|---|
| ≥ 1280px | Diseño completo de tres columnas en la mesa de trabajo |
| 1024-1279px | La barra de evidencia pasa a panel plegable a la derecha |
| 768-1023px | Una columna; lista de preguntas como carrusel superior |
| < 768px | Diseño móvil propio (mocks 14 y 15), no reflow del de escritorio |

**Regla móvil crítica:** en la mesa de trabajo, el botón "Copiar" es la acción más prominente de
la barra inferior fija. El caso real es copiar del celular y pegar en el formulario; todo lo demás
es secundario a eso.

## 6. Accesibilidad

- Contraste AA mínimo en todo texto. Verificado explícitamente para `ink-muted` sobre `paper` y
  para los badges de color al 10%.
- Foco visible con contorno de 2px en `stamp`, nunca suprimido.
- Toda acción alcanzable por teclado; orden de tabulación lógico en la mesa de trabajo.
- Los cambios de estado de la cola se anuncian mediante una región viva discreta.
- El color nunca es el único portador de información: el encaje lleva número, los estados llevan
  texto, el excedente lleva tachado además de color.
- `prefers-reduced-motion` respetado: las barras indeterminadas pasan a estado estático.

## 7. Voz

Español, conversacional y directo. Sentence case en botones y títulos. Verbos activos que nombran
exactamente lo que ocurre: "Generar respuestas", nunca "Enviar". Un botón que dice "Aprobar"
produce un estado que dice "Aprobada".

Sin lorem ipsum en ninguna etapa. El contenido de ejemplo es realista y latinoamericano.
