# Sprint 2 — Lote, extracción y triage

**Duración:** 1 semana · **Objetivo demostrable:** el usuario pega ocho enlaces, ve la cola
procesándolos, recupera manualmente los que fallan, y obtiene una mesa de comparación ordenada por
encaje con el detalle de cada convocatoria.

## Meta del sprint

Entregar el valor de "filtrar", que es la mitad del problema del usuario. Al terminar este sprint
la app ya es útil aunque no redacte una sola respuesta.

## Alcance

| ID | Tarea | RF | Criterio de terminado |
|---|---|---|---|
| S2-01 | Ruta `/api/extract` con Readability | RF-B-04 | Devuelve texto limpio de una página de bases real |
| S2-02 | Endurecer la ruta: timeout, límite de tamaño, tipos permitidos | RNF-06 | Timeout a 12 s; rechaza tipos no soportados |
| S2-03 | Protección contra SSRF | T6 | Bloquea loopback, rangos privados y metadatos de nube |
| S2-04 | Causas de fallo tipificadas con mensaje y acción | RF-B-07, P6 | Las seis causas tienen mensaje propio; `blocked` y `empty` no sugieren reintentar |
| S2-05 | Extracción de PDF en el cliente con pdfjs | RF-B-02 | Extrae texto de un PDF de bases; detecta escaneados sin capa de texto |
| S2-06 | Normalización y troceo de texto | — | Colapsa espacios, elimina menús repetidos, prioriza secciones de bases |
| S2-07 | Pantalla de pegar enlaces | RF-B-01 | Coincide con mock 05; deduplica y valida formato |
| S2-08 | Entrada por texto pegado a mano | RF-B-03 | Crea una fuente equivalente a una URL extraída |
| S2-09 | Estimación de costo previa al análisis | RF-B-05, P5 | Cifra visible junto al botón antes de gastar |
| S2-10 | Cola con concurrencia limitada a 3 | RF-B-06, RNF-05 | Un fallo no detiene las demás |
| S2-11 | Pantalla de cola con estados simultáneos | RF-B-06 | Coincide con mock 06; los seis estados representados |
| S2-12 | Recuperación por pegado manual desde la cola | RF-B-07 | Una fuente fallida vuelve al flujo sin rehacer el lote |
| S2-13 | Prompt `PR-03` de extracción de convocatoria | RF-B-08 | Devuelve `OpportunityBrief` válido; campos ausentes en `null`, sin inferir |
| S2-14 | Prompt `PR-04` de evaluación de encaje | RF-B-09 | Cada fortaleza incluye cita literal verificable del contexto |
| S2-15 | Verificación de citas contra el contexto | P3 | Las citas inexistentes se marcan como no verificadas |
| S2-16 | Estimación de esfuerzo | RF-B-10 | Muestra preguntas y volumen aproximado cuando el texto lo permite |
| S2-17 | Componente `OpportunityRow` | — | Coincide con el mock; encaje bajo atenuado, nunca oculto |
| S2-18 | Mesa de comparación con ordenamiento | RF-B-11, RF-B-12 | Coincide con mock 07; ordena por encaje, fecha y esfuerzo |
| S2-19 | Descartar y agregar enlaces a un lote existente | RF-B-13, RF-B-14 | No se pierde el análisis previo |
| S2-20 | Pantalla de detalle de convocatoria | — | Coincide con mock 08; criterios con barras proporcionales |
| S2-21 | Store `batch` con máquina de estados | — | Transiciones conformes a `technical-plan.md` |
| S2-22 | Mesa de comparación en móvil | RNF-01, P7 | Coincide con mock 15 |
| S2-23 | **Medición de tasa de éxito de extracción** | Riesgo | Probar 20 convocatorias reales latinoamericanas y registrar el porcentaje en `.memory.md` |

## Fuera de alcance

Preguntas, respuestas, exportación, diálogo de salida.

## Riesgos del sprint

| Riesgo | Mitigación |
|---|---|
| La tasa de extracción exitosa es baja y el flujo por lote pierde valor | S2-23 lo mide explícitamente. Si baja del 50%, el pegado manual se rediseña como camino principal en Sprint 3 y se registra el cambio |
| El encaje calculado resulta inútil por estar siempre alto | Calibración conservadora en `PR-04`; validar contra convocatorias donde el usuario sabe que no aplica |

## Definición de terminado del sprint

1. Ocho enlaces reales procesados de punta a punta, con al menos uno recuperado manualmente.
2. La mesa de comparación ordena correctamente por los tres criterios.
3. Ninguna cita de evidencia sin verificar aparece como verificada.
4. Tasa de extracción medida y registrada en `.memory.md`.
5. Funciona en 390px.
