# Constitution — Calco

> Principios inamovibles del proyecto. Cualquier decisión técnica o de producto que los
> contradiga se rechaza, sin importar cuánto convenga en el momento. Si una regla necesita
> cambiar, se cambia aquí primero y se registra en `.memory.md`.

---

## P1 — El navegador es el límite

Los datos del usuario no salen de su máquina. Su contexto personal, su clave de IA y las
respuestas generadas viven en memoria del navegador. El servidor de Calco no recibe, no procesa
y no registra nada de eso.

La única excepción permitida es `/api/extract`, que recibe una URL pública y devuelve texto.
Nunca recibe el contexto del usuario ni su clave.

**Prohibido:** base de datos, cuentas de usuario, autenticación propia, analítica de producto,
logs de contenido, cookies de seguimiento, scripts de terceros.

## P2 — La sesión es efímera y eso se ve

Calco es una sesión de trabajo, no un archivo. No hay historial, no hay seguimiento de
postulaciones, no hay estados de "postulada" o "ganada". Al cerrar la pestaña, todo se pierde.

Esa volatilidad es una decisión de producto, no una limitación técnica. Por lo tanto debe ser
**visible en todas las pantallas** y advertida antes de perder trabajo. Un usuario que pierde su
trabajo sin haber sido advertido es un fallo de severidad alta, igual que una caída.

**Única excepción:** el archivo de contexto del usuario puede persistirse en IndexedDB, siempre
con interruptor apagado por defecto y borrable desde ajustes.

## P3 — Precisión antes que fluidez

El sistema no inventa. Cada afirmación de una respuesta generada debe poder rastrearse hasta una
línea del contexto del usuario o de las bases de la convocatoria.

Cuando falta un dato, el sistema **declara la falta** con un marcador `[GAP]` en lugar de
rellenarla con algo plausible. Una respuesta incompleta y honesta es un éxito del producto; una
respuesta fluida con un logro inventado es su peor fallo, porque el usuario la descubre en la
entrevista.

## P4 — El límite de caracteres es una restricción dura

Las respuestas se generan para caber. Excederse no es una advertencia cosmética: es un estado de
error visible que bloquea la aprobación de esa respuesta.

## P5 — El usuario controla el gasto

Ninguna llamada al modelo ocurre sin acción explícita del usuario. Todo botón que gasta créditos
muestra el costo estimado antes de ejecutarse. El análisis del lote usa siempre el modelo
económico; el modelo de calidad se reserva para la redacción.

## P6 — Degradación honesta

Cuando algo falla (un sitio no se puede leer, el modelo devuelve basura, la clave es inválida),
la interfaz dice **qué pasó y qué hacer**, y ofrece el camino manual. Nunca falla en silencio ni
sustituye el fallo con contenido inventado.

## P7 — Móvil de primera clase

El caso real de uso incluye copiar respuestas desde el celular hacia el formulario. La mesa de
trabajo y la mesa de comparación deben ser plenamente utilizables en 390px, no versiones
degradadas.

## P8 — El mock manda

El diseño ya fue prototipado y aprobado. El código se deriva de los mocks y de `ui-spec.md`, no
al revés. Una desviación visual requiere actualizar el spec antes de mergear.

## P9 — Alcance cerrado por sprint

Cada sprint tiene un entregable demostrable. Lo que no está en el sprint activo no se
implementa, aunque sea fácil. Las ideas nuevas van a `tasks.md` bajo "Backlog no comprometido".

---

## Decisiones cerradas (no reabrir sin registrar cambio)

| # | Decisión | Razón |
|---|---|---|
| D1 | Sin base de datos | P1, P2. Un solo uso por convocatoria; el seguimiento no es el problema del usuario. |
| D2 | OpenRouter con clave del usuario (BYOK) | P1, P5. Calco no intermedia costos ni tiene backend de IA. |
| D3 | Llamadas al modelo directas desde el navegador | P1. La clave nunca toca Vercel. Evita además el límite de tiempo de las funciones serverless. |
| D4 | Scraping solo de texto limpio, sin navegador headless | Costo y latencia en Vercel no se justifican. Fallback manual obligatorio. |
| D5 | PDFs procesados en el cliente | P1. El archivo no se sube. |
| D6 | Español como idioma de la interfaz | Audiencia objetivo. El idioma de las *respuestas* lo dicta la convocatoria. |
| D7 | Despliegue en Vercel | Requisito del proyecto. |
