# Product Spec — Calco

## 1. El problema

Una persona que postula activamente a hackathones, becas, fondos y programas enfrenta dos costos
distintos, y confunde el segundo con el primero:

1. **Filtrar.** Leer las bases de una convocatoria toma entre 20 y 40 minutos. Buena parte de ese
   tiempo se gasta en convocatorias a las que, al final, no aplica: pedían un requisito que no
   cumple, o el perfil buscado no es el suyo.
2. **Redactar.** Las preguntas de los formularios se repiten en el fondo ("cuéntanos sobre ti",
   "por qué deberíamos elegirte", "describe tu proyecto") pero cambian en la forma: distinto
   ángulo, distinto tono, distinto límite de caracteres. Reescribir lo mismo veinte veces es
   mecánico y agotador.

El resultado típico es que se postula tarde, con respuestas recicladas mal adaptadas, o
directamente no se postula.

## 2. La propuesta

Calco es una herramienta de sesión única. El usuario adjunta un archivo con su contexto
profesional, pega el lote de convocatorias que está considerando, y Calco:

- lee las bases de cada una,
- las compara contra su perfil y le dice **a cuáles le conviene postular**,
- redacta las respuestas del formulario ancladas en evidencia real de su contexto,
- respeta el límite de caracteres exacto de cada pregunta,
- y le entrega todo para copiar o descargar.

Al cerrar la pestaña no queda nada. No es un CRM de postulaciones; es una mesa de trabajo.

## 3. Qué **no** es

- No es un gestor de postulaciones. Sin seguimiento, sin recordatorios, sin historial.
- No es un buscador de oportunidades. El usuario trae los links; Calco no descubre convocatorias.
- No es un generador de CV.
- No envía formularios por el usuario. El copiado y pegado final es manual, deliberadamente.
- No almacena ni sincroniza nada entre dispositivos.

## 4. Usuario

**Perfil primario:** estudiante avanzado o profesional joven en Latinoamérica, con proyectos
propios, que postula a entre 3 y 15 oportunidades por temporada. Cómodo con herramientas
técnicas, dispuesto a poner su propia clave de API. Le importa la privacidad de su información
profesional.

**Contexto de uso:** sesiones de 30 a 90 minutos, mayormente en escritorio, con momentos de
copiado desde el celular.

## 5. Recorrido principal

```
[Bienvenida]
     ↓
[Adjuntar contexto.md]  ← pantalla bloqueante, sin ella la app no opera
     ↓
[Conectar OpenRouter]   ← OAuth PKCE o clave manual
     ↓
[Pegar lote de enlaces] ← N enlaces, PDFs y/o texto suelto
     ↓  (botón "Analizar", costo visible)
[Cola de análisis]      ← estados simultáneos por fuente
     ↓
[Mesa de comparación]   ← ordenada por encaje; DECISIÓN: ¿a cuáles postulo?
     ↓
[Detalle]               ← verificar lo que Calco entendió
     ↓  ("Preparar postulación")
[Pegar preguntas]       ← detección automática de límites
     ↓
[Mesa de trabajo]       ← revisar, ajustar y aprobar respuesta por respuesta
     ↓
[Exportar]              ← única salida; fin de la sesión
```

El usuario puede volver a la mesa de comparación y preparar otra convocatoria del mismo lote sin
perder el trabajo anterior, mientras no cierre la pestaña.

## 6. Requisitos funcionales

Convención de ID: `RF-<capa>-<n>`. Prioridad: **M** (must), **S** (should), **C** (could).

### Capa A — Contexto e ingreso

| ID | Requisito | Pri | Sprint |
|---|---|---|---|
| RF-A-01 | Mostrar un prompt generador copiable para que el usuario construya su `contexto.md` en cualquier IA | M | 1 |
| RF-A-02 | Aceptar la carga de un archivo `.md` o `.txt` mediante selector o arrastre | M | 1 |
| RF-A-03 | Validar el archivo: tamaño máximo 500 KB, texto plano, no vacío | M | 1 |
| RF-A-04 | Extraer y mostrar un resumen estructurado del contexto (perfil, proyectos, logros, habilidades) con conteo por sección | M | 1 |
| RF-A-05 | Señalar carencias del contexto (p. ej. ausencia de logros medibles) sin bloquear el avance | S | 1 |
| RF-A-06 | Bloquear el acceso al resto de la app mientras no haya contexto cargado | M | 1 |
| RF-A-07 | Ofrecer un interruptor, apagado por defecto, para persistir el contexto en IndexedDB | S | 1 |
| RF-A-08 | Conectar OpenRouter vía OAuth PKCE | M | 1 |
| RF-A-09 | Permitir pegar una clave manualmente, siempre enmascarada en pantalla | M | 1 |
| RF-A-10 | Validar la clave y mostrar crédito y límite restantes | M | 1 |
| RF-A-11 | Ofrecer tres modos de almacenamiento de la clave: memoria (defecto), sesión, cifrada con passphrase | M | 1 |
| RF-A-12 | Advertir al usuario que use una clave con límite de crédito acotado | M | 1 |

### Capa B — Lote y triage

| ID | Requisito | Pri | Sprint |
|---|---|---|---|
| RF-B-01 | Aceptar múltiples URLs pegadas, una por línea, con deduplicación y validación de formato | M | 2 |
| RF-B-02 | Aceptar PDFs por arrastre, procesados íntegramente en el cliente | M | 2 |
| RF-B-03 | Aceptar texto pegado a mano como fuente de una convocatoria | M | 2 |
| RF-B-04 | Extraer el texto principal de cada URL vía `/api/extract` | M | 2 |
| RF-B-05 | Mostrar el costo estimado del análisis antes de ejecutarlo | M | 2 |
| RF-B-06 | Procesar las fuentes en paralelo con concurrencia limitada, mostrando el estado individual de cada una | M | 2 |
| RF-B-07 | Ante un fallo de extracción, explicar la causa y ofrecer pegado manual o descarte | M | 2 |
| RF-B-08 | Generar por cada convocatoria un resumen estructurado: qué buscan, criterios con peso, tono esperado, señales de alerta, metadatos | M | 2 |
| RF-B-09 | Calcular un porcentaje de encaje entre la convocatoria y el contexto del usuario, con razones a favor y en contra | M | 2 |
| RF-B-10 | Estimar el esfuerzo de postulación (número de preguntas y volumen aproximado de escritura) | S | 2 |
| RF-B-11 | Listar las convocatorias en una mesa de comparación ordenable por encaje, fecha límite o esfuerzo | M | 2 |
| RF-B-12 | Atenuar visualmente, sin ocultar, las convocatorias con encaje bajo | S | 2 |
| RF-B-13 | Permitir descartar una convocatoria del lote | S | 2 |
| RF-B-14 | Permitir agregar más enlaces a un lote ya analizado | S | 2 |
| RF-B-15 | Permitir corregir manualmente el resumen que Calco extrajo | C | 3 |

### Capa C — Redacción

| ID | Requisito | Pri | Sprint |
|---|---|---|---|
| RF-C-01 | Aceptar el pegado del bloque completo de preguntas de un formulario | M | 3 |
| RF-C-02 | Separar automáticamente las preguntas individuales del bloque pegado | M | 3 |
| RF-C-03 | Detectar límites de caracteres y de palabras en español e inglés, en sus formatos habituales | M | 3 |
| RF-C-04 | Permitir editar, agregar y eliminar preguntas y sus límites antes de generar | M | 3 |
| RF-C-05 | Generar una respuesta por pregunta, anclada en el contexto del usuario y alineada a los criterios de la convocatoria | M | 3 |
| RF-C-06 | Garantizar que la respuesta cabe en el límite; si se excede, marcarlo como error bloqueante | M | 3 |
| RF-C-07 | Mostrar contador en vivo y regla graduada de consumo del límite | M | 3 |
| RF-C-08 | Mostrar, por respuesta, la evidencia de origen de cada afirmación | M | 3 |
| RF-C-09 | Declarar los datos faltantes como `[GAP]` y permitir al usuario aportarlos e incorporarlos | M | 3 |
| RF-C-10 | Ofrecer refinamiento por respuesta: acortar, alargar, hacer más concreto, regenerar | M | 3 |
| RF-C-11 | Permitir edición manual libre de cualquier respuesta | M | 3 |
| RF-C-12 | Permitir aprobar respuestas y mostrar el progreso del formulario | M | 3 |
| RF-C-13 | Redactar en el idioma de la convocatoria, no necesariamente el de la interfaz | S | 3 |

### Capa D — Salida y sesión

| ID | Requisito | Pri | Sprint |
|---|---|---|---|
| RF-D-01 | Copiar una respuesta individual al portapapeles | M | 3 |
| RF-D-02 | Exportar en Markdown, texto plano, JSON o portapapeles | M | 3 |
| RF-D-03 | Exportar una convocatoria o el lote completo | M | 3 |
| RF-D-04 | Incluir opcionalmente preguntas, límites y análisis en la exportación | S | 3 |
| RF-D-05 | Mostrar en toda la app una barra de sesión temporal con acceso directo a exportar | M | 1 |
| RF-D-06 | Advertir con un diálogo antes de recargar o cerrar con trabajo sin exportar | M | 3 |
| RF-D-07 | Ofrecer un borrado inmediato de todos los datos locales | M | 1 |
| RF-D-08 | Descargar el análisis del lote sin necesidad de redactar respuestas | C | 3 |

## 7. Requisitos no funcionales

| ID | Requisito | Criterio |
|---|---|---|
| RNF-01 | Responsive real | Funcional y cómodo entre 360px y 1920px. Mesa de trabajo y de comparación con diseño móvil propio, no reflow. |
| RNF-02 | Accesibilidad | Navegación completa por teclado, foco visible, contraste AA, `prefers-reduced-motion` respetado. |
| RNF-03 | Rendimiento | LCP < 2.5 s en 4G. Sin bloqueo de UI durante el análisis del lote. |
| RNF-04 | Streaming | Las respuestas generadas se muestran token a token; el usuario nunca ve un spinner sin salida. |
| RNF-05 | Resiliencia del lote | El fallo de una fuente no interrumpe el procesamiento de las demás. |
| RNF-06 | Seguridad | Ver `security-spec.md`. CSP estricta y cero scripts de terceros son obligatorios. |
| RNF-07 | Costo | Análisis completo de un lote de 10 convocatorias por debajo de USD 0.05 con el preset económico. |

## 8. Criterios de aceptación del producto

El producto se considera terminado cuando un usuario puede, en una sola sesión y sin
instrucciones externas:

1. Adjuntar su contexto y conectar su clave en menos de 3 minutos.
2. Pegar 8 enlaces y obtener las 8 analizadas y ordenadas por encaje.
3. Recuperar mediante pegado manual al menos una fuente que falló.
4. Generar las respuestas de un formulario de 8 preguntas, todas dentro de su límite.
5. Identificar al menos un `[GAP]`, aportar el dato y verlo incorporado.
6. Exportar todo en Markdown.
7. Intentar cerrar la pestaña y recibir la advertencia correspondiente.
