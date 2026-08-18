# Calco — Prompts de prototipado para Google Stitch

> Metodología **mock-first**: se prototipan todas las pantallas en Stitch antes de escribir código.
> El resultado visual se convierte en la fuente de verdad del `ui-spec.md` en SDD.

**Nombre placeholder:** *Calco*. Si lo cambias, reemplázalo en todos los prompts.

**Modelo mental de la app:** una sesión de trabajo, no un archivo. El usuario adjunta su
contexto, pega el lote de links de oportunidades, el sistema las analiza todas, él decide a
cuáles postula, redacta, exporta y cierra. Nada se guarda. No hay seguimiento, ni historial,
ni estados de postulación.

---

## Cómo usar este documento

1. Stitch **no recuerda** el contexto entre generaciones. Cada envío es: `BLOQUE BASE` + `PROMPT DE PANTALLA`. Siempre los dos.
2. Una pantalla por prompt. Si le pides tres, te devuelve tres mediocres.
3. Nunca describas lógica ("al hacer clic llama a la API"). Stitch dibuja. Describe **estados visuales**.
4. **Empieza por el prompt 10**, la mesa de trabajo. Es la pantalla que define si el producto sirve. Si el estilo no aterriza ahí, no generes las demás todavía.
5. Genera primero escritorio; después vuelve a correr el mismo prompt cambiando la línea de plataforma.
6. Si el resultado se desvía, no discutas en el chat de Stitch: regenera desde cero.

---

## BLOQUE BASE — sistema de diseño

> Pega este bloque **antes de cada prompt de pantalla**.

```
SISTEMA DE DISEÑO — respétalo estrictamente. No inventes colores ni fuentes fuera de esta lista.

CONCEPTO: papel autocopiativo y formulario oficial. La interfaz se ve como un formulario de
trámite pero ejecutado con precisión editorial moderna. Rectilíneo, denso en información, sin
decoración. Nada de gradientes, nada de glassmorphism, nada de ilustraciones genéricas, nada
de blobs de colores, nada de sombras difusas, nada de esquinas redondeadas grandes.

COLORES (usa exactamente estos hex):
- Fondo de página:        #F2F4F7  (hoja azul-blanca de copia)
- Superficie de tarjeta:  #FFFFFF
- Tinta principal:        #131A22
- Tinta secundaria:       #5A6672
- Líneas y bordes:        #C9D2DB
- Acción principal:       #22439B  (azul tinta de sello)
- Resaltador:             #F5D547  (amarillo marcador, uso escaso)
- Alerta / falta dato:    #C6303A  (rojo de sello)
- Confirmación:           #1E7A5F

TIPOGRAFÍA:
- Títulos: Archivo, peso 600-700, tracking -0.02em. Se usa con moderación.
- Cuerpo e interfaz: Public Sans, peso 400-500.
- Datos, contadores, límites, claves, nombres de archivo, URLs: JetBrains Mono peso 400.
  Las etiquetas pequeñas van en mayúsculas con tracking 0.08em.

FORMA Y ESPACIO:
- Radio de esquina: 4px en todo. Píldoras solo en badges de estado.
- Bordes de 1px sólidos en #C9D2DB. Sin sombras salvo una hairline en menús flotantes.
- Rejilla de 8px. Ancho máximo de contenido 1100px, centrado.
- Los inputs se ven como campos de formulario reglados: borde inferior de 2px, los demás de 1px.

BARRA DE SESIÓN: en todas las pantallas posteriores al ingreso, justo bajo la barra superior,
va una franja de 28px de alto con fondo #F5D547 al 25%, sin borde, con texto de 12px en
JetBrains Mono mayúsculas alineado a la izquierda: "SESIÓN TEMPORAL · NADA SE GUARDA AL CERRAR"
y, a la derecha, un enlace subrayado del mismo tamaño: "Exportar ahora".

VOZ DE LA INTERFAZ: español, conversacional y directo. Sentence case en botones y títulos.
Verbos activos ("Generar respuestas", no "Enviar"). Sin lorem ipsum: escribe contenido realista
de una persona postulando a hackathones, becas y fondos de innovación en Latinoamérica.
```

---

# CAPA 1 — Ingreso

## Prompt 01 — Bienvenida

```
Plataforma: web de escritorio, 1440px. No lleva barra de sesión.

Diseña la pantalla de bienvenida de "Calco", una herramienta que revisa varias convocatorias
de golpe y redacta las respuestas del formulario usando el contexto profesional del usuario.

Estructura:
- Barra superior delgada de 56px: a la izquierda el nombre "Calco" en Archivo 600 junto a un
  cuadrado sólido de 20px en #22439B. A la derecha un enlace de texto "Cómo funciona".
- Héroe alineado a la izquierda, no centrado. Título en Archivo 56px a dos líneas:
  "Pega todas tus convocatorias. Sal con las respuestas escritas."
  Debajo, dos líneas en Public Sans 18px color #5A6672: Calco lee las bases, te dice a cuáles
  te conviene postular según tu perfil, y redacta cada respuesta dentro del límite exacto de
  caracteres.
- Botón principal sólido #22439B, texto blanco: "Empezar". Al lado, botón fantasma con borde
  1px: "Ver ejemplo".
- A la derecha del héroe, ocupando el 45% del ancho: una maqueta estática de un campo de
  respuesta. Muestra la pregunta en negrita, un párrafo de respuesta, y debajo una regla
  horizontal graduada con marcas verticales, rellena en #22439B, con el texto
  "284 / 300 CARACTERES" en JetBrains Mono. Este elemento es la firma visual de la marca:
  hazlo nítido y protagónico.
- Bajo el héroe, tres columnas separadas por líneas verticales de 1px. Cada una con una
  etiqueta numerada en JetBrains Mono mayúsculas ("01 ADJUNTA TU CONTEXTO",
  "02 PEGA LOS ENLACES", "03 EXPORTA LAS RESPUESTAS"), un título corto en Archivo y dos
  líneas de descripción.
- Pie de página de una línea: "Todo ocurre en tu navegador. Calco no guarda nada."
```

## Prompt 02 — Cómo armar tu contexto

```
Plataforma: web de escritorio, 1440px. No lleva barra de sesión.

Diseña la pantalla donde el usuario copia un prompt para construir, en cualquier IA, su archivo
de contexto personal. Es un desvío opcional antes de adjuntar el archivo.

Estructura:
- Barra superior con "Calco" y, a la derecha, un enlace "Ya tengo mi archivo".
- Columna central de 720px. Título en Archivo 36px: "Arma tu contexto una sola vez".
  Debajo, dos líneas: es un archivo de texto con quién eres, qué has hecho y en qué eres bueno;
  se reutiliza en todas tus postulaciones.
- Un bloque de código de ancho completo: fondo #FFFFFF, borde 1px, barra superior interna con
  la etiqueta "PROMPT GENERADOR" en JetBrains Mono mayúsculas y a la derecha un botón pequeño
  "Copiar". Dentro, unas 12 líneas en JetBrains Mono 14px que se ven como instrucciones reales
  para que una IA entreviste al usuario sobre trayectoria, proyectos, logros medibles,
  habilidades técnicas y motivaciones.
- Debajo, tres tarjetas horizontales de igual ancho con borde 1px, cada una con un título en
  Archivo 16px y dos líneas: "Incluye números", "Escribe los fracasos también",
  "No lo hagas un CV". Cada una explica por qué en tono directo.
- Una nota final con icono de información: sirve cualquier IA, y el resultado se guarda como
  archivo .md.
- Al pie, botón sólido #22439B "Continuar" y a la izquierda un enlace "Volver".
```

## Prompt 03 — Adjuntar contexto (pantalla bloqueante)

```
Plataforma: web de escritorio, 1440px. No lleva barra de sesión.

Diseña la pantalla donde el usuario adjunta su archivo .md de contexto personal. Sin este
archivo la app no puede hacer nada, así que la pantalla es obligatoria y no tiene navegación
hacia el resto de la aplicación. Muestra el estado ya cargado y validado.

Estructura:
- Barra superior mínima: solo "Calco" a la izquierda.
- Columna central de 680px, con aire vertical generoso. Título en Archivo 36px:
  "Adjunta tu contexto". Una línea debajo en #5A6672: "Se lee en tu navegador y se descarta al
  cerrar. No se sube a ningún servidor."
- Zona de carga de 220px de alto con borde punteado 1px en #C9D2DB, fondo #FFFFFF. En estado
  cargado muestra dentro: nombre del archivo "contexto-personal.md" en JetBrains Mono, el peso
  "14 KB", un check en #1E7A5F, y a la derecha un enlace pequeño "Reemplazar".
- Debajo, una tarjeta con el título "Lo que Calco leyó" y cuatro filas separadas por líneas de
  1px. Cada fila: etiqueta a la izquierda en JetBrains Mono mayúsculas ("PERFIL", "PROYECTOS",
  "LOGROS", "HABILIDADES"), resumen corto y realista a la derecha, y un contador tipo
  "6 registros". La fila "LOGROS" muestra en su lugar un badge rectangular con fondo #C6303A al
  10%, texto #C6303A y JetBrains Mono: "SIN DATOS MEDIBLES", con una línea de sugerencia debajo.
- Una fila con un interruptor apagado por defecto: "Recordar mi contexto en este dispositivo",
  y bajo él una línea en #5A6672: "Se guarda solo en este navegador. Puedes borrarlo cuando
  quieras desde ajustes."
- Al pie, botón sólido #22439B de ancho completo: "Continuar".
```

## Prompt 04 — Conectar el proveedor de IA

```
Plataforma: web de escritorio, 1440px. No lleva barra de sesión.

Diseña la pantalla donde el usuario conecta su cuenta de OpenRouter. El énfasis es la seguridad
de la clave.

Estructura:
- Barra superior mínima con "Calco".
- Columna central de 680px. Título en Archivo 36px: "Conecta tu proveedor de IA".
  Una línea de apoyo: "Tú pones la clave y tú pagas el consumo. Calco no cobra ni intermedia."
- Tarjeta destacada con borde de 2px en #22439B: título "Conectar con OpenRouter", dos líneas
  explicando que es el método recomendado porque no hay que pegar ninguna clave a mano y el
  acceso se revoca cuando quieras, y un botón sólido "Conectar cuenta".
- Divisor horizontal con la palabra "o" centrada sobre el fondo de página.
- Segunda tarjeta con borde 1px: título "Pegar una clave manualmente". Un input reglado con el
  valor enmascarado en JetBrains Mono "sk-or-v1-••••••••••••••••4f2a" y un icono de ojo a la
  derecha. Bajo el input, un aviso compacto con fondo #F5D547 al 20% y borde izquierdo de 3px
  en #F5D547: "Crea una clave nueva con límite de 5 dólares. Si algo sale mal pierdes 5 dólares,
  no tu cuenta."
- Sección "Dónde guardar la clave" con tres opciones de radio apiladas, cada una con título en
  negrita y una línea de descripción en #5A6672:
  "Solo durante esta sesión (recomendado)" seleccionada por defecto,
  "Hasta cerrar la pestaña",
  "Guardar cifrada con una contraseña".
- Botón al pie: "Entrar" sólido en #22439B, ancho completo.
```

---

# CAPA 2 — El lote

## Prompt 05 — Pegar las convocatorias

```
Plataforma: web de escritorio, 1440px. Lleva barra de sesión.

Diseña la pantalla de entrada del lote de "Calco": el usuario pega varios enlaces de
convocatorias de una sola vez. Es la primera pantalla tras el ingreso y también el estado
vacío de la app.

Estructura:
- Barra superior de 56px: "Calco" a la izquierda; a la derecha un chip rectangular con borde
  1px que muestra en JetBrains Mono "OPENROUTER · $4.82" con un punto #1E7A5F, y un icono de
  engranaje. Bajo ella, la barra de sesión.
- Título en Archivo 32px: "¿A qué estás mirando postular?" Una línea debajo en #5A6672:
  "Pega los enlaces de todas las convocatorias que estés considerando. Uno por línea."
- Un área de texto grande de 320px de alto, monoespaciada, con borde 1px y borde inferior de
  2px. Dentro, cuatro URLs realistas de convocatorias ya pegadas, una por línea, y el cursor
  en la quinta. En la esquina inferior derecha del área, en JetBrains Mono 12px: "4 ENLACES".
- Bajo el área, una fila de dos zonas de igual ancho separadas por 12px:
  · Izquierda: zona de carga compacta de 90px con borde punteado, texto "Arrastra bases en PDF"
    y una línea pequeña "Se leen en tu navegador".
  · Derecha: bloque con borde 1px, texto "¿La convocatoria no tiene link?" y un botón fantasma
    "Pegar texto a mano".
- Al pie, alineado a la derecha: el texto "COSTO ESTIMADO DEL ANÁLISIS $0.006" en JetBrains Mono
  y, a su derecha, el botón sólido #22439B "Analizar las 4".
- A la izquierda del pie, un enlace discreto: "¿Qué revisa Calco en cada una?"
```

## Prompt 06 — Cola de análisis

```
Plataforma: web de escritorio, 1440px. Lleva barra de sesión.

Diseña la pantalla que muestra el progreso mientras "Calco" analiza el lote de convocatorias.
Varias están en distintos estados al mismo tiempo.

Estructura:
- Barra superior y barra de sesión.
- Título en Archivo 32px: "Revisando 6 convocatorias". A la derecha del título, en JetBrains
  Mono, "3 LISTAS · 2 EN PROCESO · 1 FALLÓ".
- Bajo el título, una barra de progreso segmentada de ancho completo: seis bloques rectangulares
  de igual ancho separados por 2px. Tres en #1E7A5F, dos en #22439B, uno en #C6303A.
- Una lista vertical de seis filas de ancho completo, cada una con borde 1px, fondo blanco,
  altura 72px, y una franja vertical de 3px a la izquierda según su estado.
  Cada fila contiene: el favicon del sitio, el nombre de la convocatoria en Archivo 16px con la
  URL truncada debajo en JetBrains Mono 12px color #5A6672, y a la derecha el estado.
  Estados a representar, con contenido realista:
  · Dos filas listas: badge #1E7A5F "LISTA" y, junto a él, el porcentaje de encaje en JetBrains
    Mono ("ENCAJE 78%").
  · Una fila lista con encaje bajo: badge #1E7A5F "LISTA" y "ENCAJE 24%" en #5A6672.
  · Una fila leyendo: badge #22439B "LEYENDO EL SITIO" con una barra indeterminada de 2px bajo
    el texto.
  · Una fila analizando: badge #22439B "COMPARANDO CON TU PERFIL".
  · Una fila fallida: badge #C6303A "NO SE PUDO LEER", y en la misma fila, una segunda línea
    con la explicación "El sitio pide inicio de sesión" y dos botones pequeños de borde 1px:
    "Pegar texto" y "Quitar".
- Al pie, alineado a la derecha, botón sólido #22439B "Ver resultados" acompañado de un texto
  pequeño en #5A6672: "Puedes entrar mientras terminan las demás".
```

## Prompt 07 — Mesa de comparación

```
Plataforma: web de escritorio, 1440px. Lleva barra de sesión.
Esta pantalla existe para una sola decisión: a cuáles de estas convocatorias vale la pena
postular hoy. No es un archivo ni un historial: no incluyas estados de postulación, seguimiento
ni datos de sesiones pasadas.

Diseña la mesa de comparación de "Calco" con seis convocatorias ya analizadas, ordenadas de
mayor a menor encaje con el perfil del usuario.

Estructura:
- Barra superior y barra de sesión.
- Encabezado: título en Archivo 32px "6 convocatorias analizadas" a la izquierda. A la derecha,
  dos controles: un selector de orden con las opciones "Encaje" (activa), "Fecha límite",
  "Esfuerzo", y un botón fantasma "Agregar más enlaces".
- El cuerpo es una tabla-tarjeta densa: filas de ancho completo de 96px de alto, con borde 1px,
  fondo blanco, separadas por 8px, y una franja vertical izquierda de 4px cuyo color va de
  #1E7A5F a #C9D2DB según el encaje.
  Cada fila se divide en cuatro zonas de izquierda a derecha:
  · Zona 1 (40%): nombre de la convocatoria en Archivo 17px; debajo, en JetBrains Mono 11px
    mayúsculas, el organizador, el tipo y el premio separados por punto medio.
  · Zona 2 (15%): el encaje como número grande en Archivo 28px con el símbolo de porcentaje más
    pequeño, y bajo él la etiqueta "ENCAJE" en JetBrains Mono 10px.
  · Zona 3 (25%): dos líneas de texto muy cortas en #5A6672, una con check #1E7A5F y otra con
    guion #C6303A, resumiendo la razón principal a favor y en contra.
  · Zona 4 (20%): la fecha límite en JetBrains Mono, debajo el esfuerzo estimado como
    "8 PREGUNTAS · ~1.400 PALABRAS", y a la derecha del todo un botón sólido #22439B "Preparar".
- Las filas con encaje menor a 40% van con toda la tipografía en #5A6672 y el botón en versión
  fantasma en vez de sólido, sin ocultarlas.
- Contenido realista y variado en español: una hackathon regional de IA con 84%, un fondo de
  innovación con 71%, una beca de maestría con 63%, una aceleradora con 52%, una convocatoria
  de arte digital con 22%.
- Al pie de la lista, un enlace de texto centrado: "Descargar el análisis del lote".
```

## Prompt 08 — Detalle de una convocatoria

```
Plataforma: web de escritorio, 1440px. Lleva barra de sesión.

Diseña la vista de detalle de una convocatoria analizada en "Calco". Es una pantalla de lectura
y verificación antes de decidir postular.

Estructura:
- Barra superior, barra de sesión, y una miga de pan "Convocatorias / Hackathon Latam de IA
  Aplicada".
- Título en Archivo 32px con el nombre, y debajo una fila de metadatos en JetBrains Mono 12px
  mayúsculas separados por punto medio: organizador, modalidad, fecha límite, premio.
- Layout de dos columnas: izquierda 65%, derecha 35%, separadas por línea vertical de 1px.
- Columna izquierda, cuatro bloques apilados separados por líneas horizontales. Cada bloque con
  título en JetBrains Mono mayúsculas 11px con tracking amplio:
  · "QUÉ BUSCAN": un párrafo de tres líneas.
  · "CRITERIOS DE EVALUACIÓN": cuatro filas con el nombre del criterio a la izquierda y su peso
    en JetBrains Mono a la derecha, y bajo cada fila una barra horizontal de 3px en #22439B
    proporcional al peso.
  · "TONO ESPERADO": tres badges rectangulares con borde 1px: "Técnico", "Orientado a impacto",
    "Concreto".
  · "SEÑALES DE ALERTA": dos viñetas sobre lo que la convocatoria penaliza.
- Columna derecha, una tarjeta fija: título "Tu encaje", el número en Archivo 48px ("84%"), la
  etiqueta "COINCIDENCIA CON TU PERFIL" en JetBrains Mono, una lista de tres puntos fuertes con
  check #1E7A5F citando elementos concretos del contexto del usuario, y dos puntos débiles con
  guion #C6303A. Bajo la lista, un bloque de esfuerzo estimado en JetBrains Mono. Al pie de la
  tarjeta, botón de ancho completo #22439B "Preparar postulación" y bajo él un enlace centrado
  "Descartar esta".
- Al pie de la columna izquierda, un enlace discreto: "Corregir lo que Calco entendió".
```

---

# CAPA 3 — Redacción

## Prompt 09 — Cargar las preguntas del formulario

```
Plataforma: web de escritorio, 1440px. Lleva barra de sesión.

Diseña la pantalla donde el usuario pega las preguntas del formulario y "Calco" detecta solo
los límites de caracteres o palabras.

Estructura:
- Barra superior, barra de sesión y miga de pan.
- Título en Archivo 32px: "Pega las preguntas del formulario". Línea de apoyo: "Calco detecta
  solo los límites de cada una. Corrígelos si se equivoca."
- Dos columnas de igual ancho separadas por línea vertical de 1px.
- Columna izquierda: área de texto de 480px de alto, monoespaciada, con contenido realista
  pegado de un formulario en español: cinco preguntas seguidas, algunas con anotaciones como
  "(máx. 300 caracteres)" y "(200 words max)", incluyendo el desorden típico de un copiar-pegar.
- Columna derecha, con el encabezado "5 preguntas detectadas": lista de tarjetas compactas con
  borde 1px. Cada una con el número en JetBrains Mono dentro de un cuadrado de 24px con borde,
  el texto de la pregunta truncado a dos líneas, y debajo un badge de límite en JetBrains Mono
  con fondo #22439B al 10% y texto #22439B, por ejemplo "300 CARACTERES" o "200 PALABRAS".
  Una tarjeta muestra el badge en gris "SIN LÍMITE" junto a un campo editable pequeño con
  placeholder "Definir límite". Otra muestra un icono de eliminar visible.
- Al pie, el costo estimado en JetBrains Mono y el botón sólido #22439B "Generar respuestas".
```

## Prompt 10 — Mesa de trabajo de respuestas

```
Plataforma: web de escritorio, 1440px. Lleva barra de sesión.
Esta es la pantalla más importante del producto. Dale la mayor densidad y precisión, y genera
esta antes que ninguna otra.

Diseña la mesa de trabajo donde el usuario revisa y ajusta cada respuesta generada por "Calco".

Estructura:
- Barra superior y barra de sesión. Debajo, una barra de contexto delgada con el nombre de la
  convocatoria a la izquierda y a la derecha el progreso "4 de 8 aprobadas" junto a una barra
  segmentada de ocho bloques de 20px, los aprobados en #1E7A5F y los pendientes en #C9D2DB.
- Barra lateral izquierda de 260px con la lista de las ocho preguntas: número en JetBrains Mono,
  texto truncado a dos líneas, y un punto de estado de 6px a la derecha. El ítem activo con
  fondo blanco y barra de 2px en #22439B en su borde izquierdo.
- Área central. Arriba, la pregunta completa en Archivo 22px, y bajo ella en JetBrains Mono
  mayúsculas 11px: "PREGUNTA 3 DE 8 · LÍMITE 300 CARACTERES".
- El campo de respuesta: rectángulo blanco con borde 1px y borde inferior de 2px, con un párrafo
  realista y bien escrito en español sobre un proyecto de IA. Dentro del párrafo, una frase va
  subrayada con un trazo amarillo #F5D547 de 6px por detrás del texto, y junto a ella un número
  volado pequeño en #22439B, como nota al pie.
- Justo bajo el campo, el elemento firma de la app: una regla horizontal de ancho completo con
  marcas de graduación verticales cada 10%, rellena en #22439B hasta el 95% de su longitud y el
  último tramo en #C6303A. A su derecha, en JetBrains Mono 13px: "312 / 300". El excedente de
  texto dentro del párrafo aparece tachado con una línea de corrector en #C6303A.
- Fila de acciones bajo la regla, con botones de borde 1px y texto pequeño: "Acortar", "Alargar",
  "Más concreto", "Regenerar". A la derecha, un botón sólido #1E7A5F "Aprobar" y un icono de
  copiar.
- Barra lateral derecha de 300px titulada "De dónde sale esto": tres tarjetas de evidencia
  numeradas que corresponden a las notas al pie. Cada una con la etiqueta de origen en JetBrains
  Mono ("CONTEXTO PERSONAL · PROYECTOS"), dos líneas citadas del archivo del usuario, y una
  línea que dice a qué criterio de evaluación responde.
  Al final, una tarjeta distinta con borde 1px en #C6303A y fondo #C6303A al 8%: encabezado
  "FALTA UN DATO" en JetBrains Mono, el texto "No encuentro una métrica de usuarios para este
  proyecto. Escríbela y la incorporo." y un input pequeño debajo con un botón "Agregar".
```

## Prompt 11 — Exportar

```
Plataforma: web de escritorio, 1440px.

Diseña el panel de exportación de "Calco" como una hoja modal centrada de 660px de ancho sobre
el fondo atenuado de la mesa de trabajo. Es la única salida del trabajo, así que la pantalla
debe transmitir que después de esto no queda nada.

Estructura:
- Encabezado: título en Archivo 24px "Llévate tu trabajo" y un icono de cerrar. Debajo, una
  línea en #C6303A: "Al cerrar la pestaña se borra todo. Descarga antes de salir."
- Un bloque de resumen con tres datos en fila separados por líneas verticales de 1px, cada uno
  con el número grande en Archivo y la etiqueta en JetBrains Mono mayúsculas:
  "8 RESPUESTAS", "6 APROBADAS", "2 CON DATOS FALTANTES".
- Un aviso compacto con borde izquierdo de 3px en #C6303A: "Dos respuestas tienen datos
  pendientes. Revísalas antes de enviar."
- Sección "Qué exportar" con dos opciones de radio en fila, como tarjetas de igual ancho con
  borde 1px: "Solo esta convocatoria" (seleccionada, borde #22439B de 2px) y
  "Todo el lote · 3 convocatorias preparadas".
- Sección "Formato" con cuatro filas seleccionables de borde 1px, cada una con icono a la
  izquierda, título en negrita, una línea de descripción en #5A6672 y un radio a la derecha:
  "Copiar todo al portapapeles", "Descargar como Markdown (.md)",
  "Descargar como texto plano (.txt)", "Descargar como JSON (.json)".
- Un interruptor activado: "Incluir preguntas, límites y análisis de la convocatoria".
- Al pie, botón sólido #22439B de ancho completo "Descargar" y un enlace centrado debajo:
  "Seguir editando".
```

## Prompt 12 — Aviso al salir

```
Plataforma: web de escritorio, 1440px.

Diseña un diálogo modal pequeño de 440px de ancho, centrado sobre el fondo atenuado de la mesa
de trabajo, que aparece cuando el usuario intenta recargar o cerrar la pestaña con trabajo sin
exportar.

Estructura:
- Sin ilustración ni icono grande. Arriba a la izquierda, una etiqueta en JetBrains Mono
  mayúsculas 11px en #C6303A: "TRABAJO SIN EXPORTAR".
- Título en Archivo 22px: "Si sales ahora, se pierde todo".
- Dos líneas en #5A6672: Calco no guarda nada en ningún servidor, así que las 8 respuestas de
  esta sesión desaparecen al cerrar.
- Un bloque compacto con borde 1px listando en JetBrains Mono 12px lo que se perderá, una línea
  por ítem con un punto de viñeta: "3 convocatorias analizadas", "8 respuestas generadas",
  "6 aprobadas".
- Al pie, dos botones en una fila: a la izquierda un botón fantasma con borde 1px "Salir de
  todos modos" con texto en #C6303A, y a la derecha un botón sólido #22439B más ancho
  "Descargar y salir".
```

---

# CAPA 4 — Ajustes y móvil

## Prompt 13 — Ajustes

```
Plataforma: web de escritorio, 1440px. Lleva barra de sesión.

Diseña la pantalla de ajustes de "Calco", con foco en la clave de IA, el modelo y los datos
locales.

Estructura:
- Barra superior, barra de sesión, título en Archivo 32px "Ajustes".
- Navegación lateral izquierda de 200px con cuatro ítems de texto: "Proveedor de IA",
  "Tu contexto", "Privacidad", "Apariencia". El primero activo con barra de 2px en #22439B.
- Contenido en una columna de 720px, secciones separadas por líneas de 1px, cada una con título
  en Archivo 20px.

  Sección "Proveedor de IA":
  · Una fila con la clave enmascarada en JetBrains Mono, un badge #1E7A5F "CONECTADA" y dos
    enlaces: "Reemplazar" y "Desconectar".
  · Una fila con el crédito restante como número grande y una barra horizontal fina debajo.
  · Selector de modelo: tres tarjetas seleccionables de igual ancho con borde 1px: "Económico",
    "Equilibrado" (seleccionada, borde #22439B de 2px) y "Máxima calidad". Cada una con el
    nombre del modelo, una línea de para qué sirve y el costo aproximado por convocatoria en
    JetBrains Mono. Bajo las tarjetas, una línea en #5A6672 explicando que el análisis del lote
    usa siempre el modelo económico y solo la redacción usa el seleccionado.

  Sección "Privacidad":
  · Una fila con interruptor apagado: "Recordar mi contexto en este dispositivo", con una línea
    de descripción debajo.
  · Tres opciones de radio para dónde se guarda la clave, iguales a las del ingreso.
  · Un bloque final con borde 1px en #C6303A: título "Borrar todo", una línea explicando que
    elimina la clave, el contexto y la sesión actual de este navegador, y un botón con borde
    #C6303A y texto #C6303A "Borrar todos mis datos".
```

## Prompt 14 — Móvil: mesa de trabajo

```
Plataforma: móvil, 390px de ancho.

Diseña la versión móvil de la mesa de trabajo de respuestas de "Calco". El caso real es copiar
cada respuesta desde el celular y pegarla en el formulario, así que el botón de copiar debe ser
prominente y alcanzable con el pulgar.

Estructura:
- Barra superior de 52px: flecha de volver, nombre de la convocatoria truncado al centro, icono
  de exportar a la derecha. Bajo ella, la barra de sesión en versión compacta de 24px con el
  texto acortado a "SESIÓN TEMPORAL".
- Carrusel horizontal de ocho cuadrados de 32px con el número de pregunta en JetBrains Mono.
  El activo en #22439B con texto blanco; los aprobados con borde #1E7A5F; los pendientes con
  borde #C9D2DB.
- La pregunta completa en Archivo 18px, y debajo "PREGUNTA 3 DE 8 · LÍMITE 300" en JetBrains
  Mono 10px mayúsculas.
- El campo de respuesta ocupando el alto disponible, con el párrafo realista y una frase
  resaltada con marcador amarillo #F5D547.
- Fija al fondo, una barra de acciones de dos niveles sobre fondo blanco con borde superior 1px:
  · Nivel superior: la regla graduada de límite de ancho completo, rellena en #22439B, con el
    contador "284 / 300" en JetBrains Mono a la derecha.
  · Nivel inferior: tres botones de icono de igual ancho con borde 1px ("Acortar", "Regenerar",
    "Aprobar") y, a la derecha, un botón sólido #22439B más ancho con icono y texto "Copiar".
- Deja espacio seguro inferior de 20px.
```

## Prompt 15 — Móvil: mesa de comparación

```
Plataforma: móvil, 390px de ancho.

Diseña la mesa de comparación de "Calco" en móvil: las convocatorias analizadas de esta sesión,
ordenadas por encaje.

Estructura:
- Barra superior de 52px con "Calco" a la izquierda y un icono de engranaje a la derecha. Bajo
  ella, la barra de sesión compacta de 24px.
- Título en Archivo 24px "6 convocatorias analizadas" y, debajo, una fila con un selector de
  orden compacto ("Encaje · Fecha · Esfuerzo") alineado a la izquierda.
- Cinco tarjetas apiladas de ancho completo con 10px de separación, borde 1px y franja vertical
  de 4px a la izquierda según el encaje.
  Cada tarjeta, en tres niveles:
  · Nombre en Archivo 16px a dos líneas máximo, con el encaje en Archivo 22px alineado a la
    derecha en la misma fila.
  · Una línea en JetBrains Mono 11px mayúsculas con organizador y tipo.
  · Una fila al pie con la fecha límite y el esfuerzo a la izquierda en JetBrains Mono 11px, y
    un botón sólido #22439B compacto "Preparar" a la derecha.
- Las tarjetas con encaje menor a 40% van con tipografía en #5A6672 y botón fantasma.
- Un botón flotante rectangular de radio 4px anclado abajo a la derecha, sólido en #22439B, con
  icono de más y texto "Agregar".
```

---

## Después de Stitch

1. Exporta cada pantalla a `/docs/mocks/` con el nombre del prompt que la generó.
2. Anota las desviaciones entre lo pedido y lo generado: eso alimenta el `ui-spec.md`.
3. Los tokens del BLOQUE BASE se transcriben tal cual al `@theme` de Tailwind v4, para que el
   código nazca alineado con el mock.
4. Recién ahí se generan los `.md` de SDD y arranca el Sprint 1.
