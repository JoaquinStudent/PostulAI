# Sprint 1 — Fundación, contexto y conexión

**Duración:** 1 semana · **Objetivo demostrable:** el usuario adjunta su `contexto.md`, conecta
OpenRouter de forma segura, ve el resumen de su propio contexto y llega a la pantalla del lote.
La app aún no analiza nada.

## Meta del sprint

Dejar montada la infraestructura de confianza del producto: el sistema de diseño derivado de los
mocks, el manejo de la clave, y la puerta de contexto. Todo lo que viene después depende de que
esta capa esté bien.

## Alcance

| ID | Tarea | RF | Criterio de terminado |
|---|---|---|---|
| S1-01 | Inicializar Next.js 15 + TS estricto + Tailwind v4 | — | `pnpm dev` levanta; TS sin errores |
| S1-02 | Transcribir tokens de `ui-spec` al bloque `@theme` | — | Los nueve colores y las tres familias disponibles como utilidades |
| S1-03 | Autoalojar Archivo, Public Sans y JetBrains Mono | RNF-06 | Cero peticiones a dominios externos de fuentes |
| S1-04 | Configurar CSP estricta y cabeceras de seguridad | RNF-06 | Un `fetch` a dominio ajeno queda bloqueado por el navegador |
| S1-05 | Instalar y reestilizar la base de shadcn/ui a los tokens | — | Botón, input, tarjeta, radio, switch, modal, badge conformes al mock |
| S1-06 | Componente `SessionBar` | RF-D-05 | Presente en todas las rutas post-ingreso; no descartable |
| S1-07 | Pantalla de bienvenida | — | Coincide con el mock 01 |
| S1-08 | Pantalla del prompt generador con copiado | RF-A-01 | Coincide con mock 02; el copiado funciona |
| S1-09 | Redactar el prompt generador `PR-01` | RF-A-01 | Produce un `.md` con los siete encabezados canónicos al probarlo en una IA real |
| S1-10 | Carga de archivo por selector y arrastre | RF-A-02 | Acepta `.md` y `.txt` |
| S1-11 | Validación del archivo | RF-A-03 | Rechaza vacíos, mayores a 500 KB y binarios, con mensaje claro |
| S1-12 | Cliente de OpenRouter con streaming y reintentos | — | Llamada de prueba responde en streaming; 429 reintenta con retroceso |
| S1-13 | Prompt `PR-02` y resumen del contexto | RF-A-04, RF-A-05 | Devuelve `ContextSummary` válido; detecta ausencia de logros medibles |
| S1-14 | Pantalla de adjuntar contexto | RF-A-04, RF-A-06 | Coincide con mock 03; bloquea el acceso al resto sin contexto |
| S1-15 | Persistencia opcional del contexto en IndexedDB | RF-A-07 | Interruptor apagado por defecto; al activarlo sobrevive a recarga |
| S1-16 | OAuth PKCE con OpenRouter | RF-A-08 | Flujo completo hasta clave en memoria |
| S1-17 | Pegado manual de clave con enmascarado | RF-A-09 | Nunca visible salvo revelado explícito |
| S1-18 | Validación de clave y lectura de crédito | RF-A-10, RF-A-12 | Muestra crédito y límite; advierte si no hay límite configurado |
| S1-19 | Tres modos de almacenamiento de clave | RF-A-11 | Memoria por defecto; sesión y bóveda funcionan |
| S1-20 | Bóveda: PBKDF2 + AES-GCM con WebCrypto | RF-A-11 | Passphrase incorrecta falla limpio; sin passphrase el blob es inútil |
| S1-21 | Pantalla de conectar proveedor | RF-A-08…12 | Coincide con mock 04 |
| S1-22 | Selector de presets de modelo desde el catálogo | — | Los identificadores se leen en tiempo de ejecución, no en duro |
| S1-23 | Pantalla de ajustes con borrado total | RF-D-07 | Coincide con mock 13; el borrado limpia los tres almacenamientos |
| S1-24 | Store `session` en Zustand | — | La clave en claro no es serializable |
| S1-25 | Despliegue inicial en Vercel | — | URL viva con CSP activa en producción |

## Fuera de alcance

Extracción web, PDFs, análisis, generación de respuestas, cualquier pantalla de las capas B, C y D
salvo la barra de sesión y los ajustes.

## Riesgos del sprint

| Riesgo | Mitigación |
|---|---|
| El flujo OAuth PKCE se complica más de lo previsto | El pegado manual es camino completo y suficiente; OAuth puede deslizarse a Sprint 2 sin bloquear nada |
| La CSP rompe funcionalidad de Next en producción | Configurarla desde el primer día y verificar en cada despliegue, no al final |

## Definición de terminado del sprint

1. Desplegado en Vercel con CSP verificada en producción.
2. Se puede recorrer bienvenida → contexto → conexión → pantalla de lote sin errores.
3. La clave nunca aparece en ninguna petición a dominio propio (verificado en la pestaña de red).
4. Todos los componentes construidos coinciden con sus mocks.
5. `.memory.md` actualizado con lo aprendido.
