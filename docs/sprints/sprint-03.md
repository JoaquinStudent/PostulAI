# Sprint 3 — Redacción, salida y cierre

**Duración:** 1 semana · **Objetivo demostrable:** el producto completo. El usuario pega las
preguntas de un formulario, obtiene respuestas ancladas en evidencia y dentro del límite, resuelve
los datos faltantes, y exporta.

## Meta del sprint

Cerrar el ciclo. Este sprint contiene la pantalla más importante del producto y las garantías que
sostienen el principio P3.

## Alcance

| ID | Tarea | RF | Criterio de terminado |
|---|---|---|---|
| S3-01 | Detección de límites por expresiones regulares | RF-C-03 | Reconoce los formatos de `prompts-spec` en español e inglés; distingue caracteres de palabras |
| S3-02 | Prompt `PR-05` como respaldo del parser | RF-C-02, RF-C-03 | Resuelve los casos que la regex no cubre |
| S3-03 | Pantalla de pegar preguntas | RF-C-01, RF-C-04 | Coincide con mock 09; permite editar, agregar y eliminar |
| S3-04 | Prompt `PR-06` de generación de respuesta | RF-C-05 | Devuelve texto, evidencia y gaps conformes al contrato |
| S3-05 | Verificación programática de longitud | RF-C-06, P4 | El límite se valida en código; excederse bloquea la aprobación |
| S3-06 | Reintento automático de acortado ante excedente | RF-C-06 | Un intento automático antes de mostrar el error |
| S3-07 | Componente `LimitRuler` | RF-C-07 | Coincide con el mock; tres estados; excedente tachado en el campo |
| S3-08 | Componente `EvidenceCard` con números volados | RF-C-08 | Cada número del texto tiene su tarjeta; huérfanos descartados |
| S3-09 | Verificación de citas por subcadena | P3 | Las no verificadas se muestran atenuadas |
| S3-10 | Componente `GapCard` y prompt `PR-08` | RF-C-09 | El dato aportado se integra sin reescribir el resto |
| S3-11 | Prompt `PR-07` y acciones de refinamiento | RF-C-10 | Las cuatro acciones respetan sus reglas duras |
| S3-12 | Edición manual libre con recálculo en vivo | RF-C-11 | El contador y el estado reaccionan al teclear |
| S3-13 | Aprobación y progreso del formulario | RF-C-12 | Barra segmentada refleja el estado real |
| S3-14 | Detección del idioma de respuesta | RF-C-13 | Una convocatoria en inglés produce respuestas en inglés |
| S3-15 | **Mesa de trabajo completa** | — | Coincide con mock 10; es la pantalla de mayor densidad del producto |
| S3-16 | Streaming en generación y refinamiento | RNF-04 | El texto aparece progresivamente, sin spinner ciego |
| S3-17 | Copiado individual | RF-D-01 | Un clic, con confirmación visible |
| S3-18 | Exportación en cuatro formatos | RF-D-02, RF-D-04 | Markdown conforme al formato de `data-model` |
| S3-19 | Exportación de convocatoria o lote completo | RF-D-03 | Ambas opciones producen archivos correctos |
| S3-20 | Modal de exportación | — | Coincide con mock 11 |
| S3-21 | Diálogo de salida con trabajo sin exportar | RF-D-06, P2 | Coincide con mock 12; enumera lo que se perderá |
| S3-22 | Descarga del análisis del lote sin redactar | RF-D-08 | Disponible desde la mesa de comparación |
| S3-23 | Mesa de trabajo en móvil | RNF-01, P7 | Coincide con mock 14; "Copiar" es la acción prominente |
| S3-24 | Pase de accesibilidad completo | RNF-02 | Teclado, foco, contraste AA, región viva, movimiento reducido |
| S3-25 | Pase de rendimiento | RNF-03 | LCP bajo 2,5 s en 4G simulado |
| S3-26 | Corrección manual del resumen extraído | RF-B-15 | Editable desde el detalle |
| S3-27 | Recorrido completo de verificación | — | Los siete criterios de aceptación del `product-spec` |
| S3-28 | Despliegue final y verificación de seguridad | — | Los seis controles de `security-spec` §7 |

## Opcional si hay holgura

| ID | Tarea |
|---|---|
| S3-OP1 | WebAuthn con extensión PRF para la bóveda, con passphrase como alternativa |
| S3-OP2 | Virtualización de la mesa de comparación por encima de 30 filas |

## Riesgos del sprint

| Riesgo | Mitigación |
|---|---|
| El sprint está sobrecargado: contiene la pantalla más compleja | S3-15 arranca el primer día. Las tareas S3-22, S3-26 y ambas opcionales se sacrifican primero si hace falta |
| El modelo no respeta el límite de forma consistente | La verificación en código (S3-05) es la garantía, no el prompt. El reintento de acortado es el respaldo |
| Las respuestas suenan genéricas pese a la evidencia | Evaluar con convocatorias reales; ajustar `PR-06` y registrar cada cambio en `.memory.md` |

## Definición de terminado del proyecto

1. Los siete criterios de aceptación del `product-spec` §8 se cumplen en un recorrido real.
2. Ninguna respuesta aprobada excede su límite.
3. Toda afirmación fáctica de una respuesta tiene evidencia verificada, o está declarada como gap.
4. Los seis controles de seguridad verificados en producción.
5. Funciona entre 360px y 1920px.
6. `.memory.md` refleja el estado real del proyecto y las lecciones acumuladas.
