# Tasks — Calco

> Backlog único. Cada tarea pertenece a un sprint y traza a un requisito de `product-spec.md`.
> Lo que no está en el sprint activo no se implementa (P9).

## Convención

`S<sprint>-<n>` · Estado: `⬜ pendiente` · `🟦 en curso` · `✅ hecho` · `⬛ descartada`

---

## Sprint 1 — Fundación, contexto y conexión

| ID | Tarea | RF | Estado |
|---|---|---|---|
| S1-01 | Inicializar Next.js 15 + TS estricto + Tailwind v4 | — | ✅ |
| S1-02 | Transcribir tokens de `ui-spec` al bloque `@theme` | — | ✅ |
| S1-03 | Autoalojar Archivo, Public Sans y JetBrains Mono | RNF-06 | ✅ |
| S1-04 | Configurar CSP estricta y cabeceras de seguridad | RNF-06 | ✅ |
| S1-05 | Instalar y reestilizar shadcn/ui a los tokens | — | ✅ |
| S1-06 | Componente `SessionBar` | RF-D-05 | ✅ |
| S1-07 | Pantalla de bienvenida | — | ✅ |
| S1-08 | Pantalla del prompt generador con copiado | RF-A-01 | ✅ |
| S1-09 | Redactar el prompt generador `PR-01` | RF-A-01 | ✅ |
| S1-10 | Carga de archivo por selector y arrastre | RF-A-02 | ✅ |
| S1-11 | Validación del archivo | RF-A-03 | ✅ |
| S1-12 | Cliente de OpenRouter con streaming y reintentos | — | ✅ |
| S1-13 | Prompt `PR-02` y resumen del contexto | RF-A-04, RF-A-05 | ✅ |
| S1-14 | Pantalla de adjuntar contexto (bloqueante) | RF-A-04, RF-A-06 | ✅ |
| S1-15 | Persistencia opcional del contexto | RF-A-07 | ✅ |
| S1-16 | OAuth PKCE con OpenRouter | RF-A-08 | ⬛ diferido |
| S1-17 | Pegado manual de clave con enmascarado | RF-A-09 | ✅ |
| S1-18 | Validación de clave y lectura de crédito | RF-A-10, RF-A-12 | ✅ |
| S1-19 | Tres modos de almacenamiento de clave | RF-A-11 | ✅ |
| S1-20 | Bóveda PBKDF2 + AES-GCM | RF-A-11 | ✅ |
| S1-21 | Pantalla de conectar proveedor | RF-A-08…12 | ✅ |
| S1-22 | Selector de presets desde el catálogo de modelos | — | ✅ |
| S1-23 | Pantalla de ajustes con borrado total | RF-D-07 | ✅ |
| S1-24 | Store `session` | — | ✅ |
| S1-25 | Despliegue inicial en Vercel | — | ⬜ |

## Sprint 2 — Lote, extracción y triage

| ID | Tarea | RF | Estado |
|---|---|---|---|
| S2-01 | Ruta `/api/extract` con Readability | RF-B-04 | ✅ |
| S2-02 | Endurecer la ruta: timeout, tamaño, tipos | RNF-06 | ✅ |
| S2-03 | Protección contra SSRF | T6 | ✅ |
| S2-04 | Causas de fallo tipificadas | RF-B-07 | ✅ |
| S2-05 | Extracción de PDF en el cliente | RF-B-02 | ✅ |
| S2-06 | Normalización y troceo de texto | — | ✅ |
| S2-07 | Pantalla de pegar enlaces | RF-B-01 | ✅ |
| S2-08 | Entrada por texto pegado a mano | RF-B-03 | ✅ |
| S2-09 | Estimación de costo previa | RF-B-05 | ✅ |
| S2-10 | Cola con concurrencia limitada | RF-B-06 | ✅ |
| S2-11 | Pantalla de cola con estados | RF-B-06 | ✅ |
| S2-12 | Recuperación por pegado manual | RF-B-07 | ✅ |
| S2-13 | Prompt `PR-03` de extracción | RF-B-08 | ✅ |
| S2-14 | Prompt `PR-04` de encaje | RF-B-09 | ✅ |
| S2-15 | Verificación de citas contra el contexto | — | ✅ |
| S2-16 | Estimación de esfuerzo | RF-B-10 | ✅ |
| S2-17 | Componente `OpportunityRow` | — | ✅ |
| S2-18 | Mesa de comparación con ordenamiento | RF-B-11, RF-B-12 | ✅ |
| S2-19 | Descartar y agregar enlaces | RF-B-13, RF-B-14 | ✅ |
| S2-20 | Pantalla de detalle | — | ✅ |
| S2-21 | Store `batch` con máquina de estados | — | ✅ |
| S2-22 | Mesa de comparación en móvil | RNF-01 | ✅ |
| S2-23 | Medición de tasa de éxito de extracción | Riesgo | ⬜ |

## Sprint 3 — Redacción, salida y cierre

| ID | Tarea | RF | Estado |
|---|---|---|---|
| S3-01 | Detección de límites por regex | RF-C-03 | ⬜ |
| S3-02 | Prompt `PR-05` como respaldo | RF-C-02, RF-C-03 | ⬜ |
| S3-03 | Pantalla de pegar preguntas | RF-C-01, RF-C-04 | ⬜ |
| S3-04 | Prompt `PR-06` de generación | RF-C-05 | ⬜ |
| S3-05 | Verificación programática de longitud | RF-C-06 | ⬜ |
| S3-06 | Reintento automático de acortado | RF-C-06 | ⬜ |
| S3-07 | Componente `LimitRuler` | RF-C-07 | ⬜ |
| S3-08 | Componente `EvidenceCard` | RF-C-08 | ⬜ |
| S3-09 | Verificación de citas por subcadena | — | ⬜ |
| S3-10 | Componente `GapCard` y prompt `PR-08` | RF-C-09 | ⬜ |
| S3-11 | Prompt `PR-07` y refinamiento | RF-C-10 | ⬜ |
| S3-12 | Edición manual con recálculo en vivo | RF-C-11 | ⬜ |
| S3-13 | Aprobación y progreso | RF-C-12 | ⬜ |
| S3-14 | Detección del idioma de respuesta | RF-C-13 | ⬜ |
| S3-15 | Mesa de trabajo completa | — | ⬜ |
| S3-16 | Streaming en generación y refinamiento | RNF-04 | ⬜ |
| S3-17 | Copiado individual | RF-D-01 | ⬜ |
| S3-18 | Exportación en cuatro formatos | RF-D-02, RF-D-04 | ⬜ |
| S3-19 | Exportación de convocatoria o lote | RF-D-03 | ⬜ |
| S3-20 | Modal de exportación | — | ⬜ |
| S3-21 | Diálogo de salida | RF-D-06 | ⬜ |
| S3-22 | Descarga del análisis del lote | RF-D-08 | ⬜ |
| S3-23 | Mesa de trabajo en móvil | RNF-01 | ⬜ |
| S3-24 | Pase de accesibilidad | RNF-02 | ⬜ |
| S3-25 | Pase de rendimiento | RNF-03 | ⬜ |
| S3-26 | Corrección manual del resumen extraído | RF-B-15 | ⬜ |
| S3-27 | Recorrido completo de verificación | — | ⬜ |
| S3-28 | Despliegue final y verificación de seguridad | — | ⬜ |
| S3-OP1 | WebAuthn PRF para la bóveda (opcional) | — | ⬜ |
| S3-OP2 | Virtualización de la mesa de comparación (opcional) | — | ⬜ |

---

## Backlog no comprometido

Ideas registradas para no perderlas. **No se implementan** sin entrar formalmente a un sprint.

| # | Idea | Nota |
|---|---|---|
| B1 | OCR para PDFs escaneados | Solo si supera el 20% de los PDFs reales (DT1) |
| B2 | Navegador headless para sitios con JS | Solo si la extracción cae por debajo del 50% (DT2) |
| B3 | Importar y exportar el espacio de trabajo como archivo | Contradice parcialmente P2; evaluar con cuidado |
| B4 | Biblioteca de respuestas aprobadas reutilizables | Requiere persistencia; choca con P2 |
| B5 | Extensión de navegador para capturar formularios | Proyecto aparte |
| B6 | Soporte para otros proveedores además de OpenRouter | OpenRouter ya agrega múltiples modelos; valor marginal bajo |
| B7 | Comparación de dos versiones de una respuesta lado a lado | Mejora de la mesa de trabajo |
| B8 | Detección de preguntas repetidas entre convocatorias del lote | Podría ahorrar generaciones y costo |
