# Testing Plan — Calco

> Proyecto personal de un desarrollador: la estrategia prioriza verificaciones de alto valor sobre
> cobertura amplia. Se automatiza lo que es barato y crítico; el resto se verifica a mano con
> guiones fijos.

## 1. Qué se automatiza

Las funciones puras y críticas, donde un fallo silencioso es caro:

| Módulo | Qué se prueba | Por qué |
|---|---|---|
| `lib/parse/limits.ts` | Todos los formatos de límite de `prompts-spec` §PR-05, en ambos idiomas | Confundir caracteres con palabras arruina el producto |
| `lib/parse/questions.ts` | Separación de bloques de formularios reales, incluyendo pegados sucios | Base de todo el flujo de redacción |
| `lib/ai/verify.ts` | Conteo de caracteres y palabras; detección de excedente | Es la garantía de P4 |
| `lib/vault.ts` | Cifrado, descifrado, fallo con passphrase incorrecta | Es la garantía de seguridad de la clave |
| `lib/extract/text.ts` | Normalización y troceo | Afecta la calidad de toda extracción posterior |
| Validadores de esquema | Rechazo de salidas del modelo mal formadas | Impide que datos basura entren al store |

## 2. Qué se verifica a mano

### Recorrido de aceptación
Los siete criterios de `product-spec` §8, ejecutados de punta a punta antes de cada cierre de
versión. Es la prueba que define si el producto funciona.

### Guion de fallos
Se fuerza cada modo de fallo y se verifica que la interfaz explique qué pasó y ofrezca salida:

| Caso | Verificación |
|---|---|
| URL tras muro de sesión | Mensaje claro, sin sugerir reintentar, con pegado manual disponible |
| URL renderizada por JS que devuelve vacío | Igual que el anterior |
| URL inexistente | Mensaje distinto, con reintento disponible |
| PDF escaneado sin capa de texto | Se informa y se ofrece pegado manual |
| Clave inválida a mitad de sesión | Modal de reconexión sin perder el trabajo |
| Sin crédito | Aviso con enlace al panel del proveedor |
| Límite de tasa | Reintento visible con retroceso |
| Salida del modelo no parseable | Un reintento; luego error explícito, nunca datos parciales |

### Guion de seguridad
Los seis controles de `security-spec` §7, ejecutados contra producción en cada despliegue mayor.

### Guion de privacidad y sesión
| Caso | Verificación |
|---|---|
| Recargar con trabajo sin exportar | Aparece el diálogo con el inventario correcto |
| Cerrar y reabrir sin persistencia activada | No queda rastro de contexto ni clave |
| Cerrar y reabrir con persistencia activada | Solo el contexto sobrevive; la clave no, salvo en bóveda |
| Borrar todos mis datos | Los tres almacenamientos quedan vacíos |

### Accesibilidad
Recorrido completo solo con teclado en la mesa de trabajo y en la de comparación. Verificación de
contraste en las combinaciones límite: `ink-muted` sobre `paper`, y badges al 10%. Comprobación de
que el color nunca es el único portador de información.

### Responsive
Verificación real en 360, 390, 768, 1024, 1280 y 1920 px. En móvil, la comprobación específica de
que "Copiar" es alcanzable con el pulgar en la mesa de trabajo.

## 3. Evaluación de calidad de la IA

Es la parte más difícil de probar y la más importante. Se mantiene un conjunto fijo de **cinco
convocatorias reales** y **dos contextos de usuario distintos**, y se corre el mismo lote en cada
versión.

| Métrica | Cómo se mide | Umbral |
|---|---|---|
| Tasa de extracción exitosa | Fuentes legibles sobre el total | Por encima del 50%, o se revisa el diseño |
| Precisión del brief | Revisión manual contra las bases reales | Sin campos inventados. Cero tolerancia |
| Discriminación del encaje | Que las convocatorias donde el usuario no aplica queden por debajo de 40 | Sin falsos positivos altos |
| Verificabilidad de la evidencia | Citas que existen literalmente en el contexto | 100% de las mostradas como verificadas |
| Excedentes de límite | Respuestas que exceden tras la verificación y el reintento | Por debajo del 5% |
| Alucinación | Afirmaciones fácticas sin respaldo, revisadas a mano | **Cero.** Un solo caso bloquea la versión |

Ese último umbral no es negociable. Es P3 convertido en criterio de aceptación: una respuesta
fluida con un logro inventado es peor que no tener el producto.

## 4. Cuándo se ejecuta

| Momento | Qué se corre |
|---|---|
| Cada commit | Pruebas automatizadas y verificación de tipos |
| Cierre de tarea | Verificación contra el mock y el criterio de terminado |
| Cierre de sprint | Guiones de fallos, privacidad, accesibilidad y responsive |
| Cierre de versión | Todo lo anterior, más el recorrido de aceptación y la evaluación de IA; después se actualiza `.memory.md` |

## 5. Regla de defectos recurrentes

Un defecto que aparece dos veces deja de ser una nota y se convierte en una verificación
automatizada. Se registra en `.memory.md` y se agrega a la tabla de §1. Recordar no es una
estrategia.
