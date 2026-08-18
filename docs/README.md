# Calco — Documentación SDD

Herramienta de sesión única para analizar convocatorias (hackathones, becas, fondos, programas) y
redactar las respuestas de sus formularios, ancladas en el contexto profesional real del usuario.

Sin base de datos. Sin cuentas. Sin seguimiento. Al cerrar la pestaña no queda nada.

---

## Orden de lectura

Para entender el proyecto por primera vez, en este orden:

1. **`constitution.md`** — Los principios que no se negocian y las decisiones ya cerradas. Todo lo
   demás se deriva de aquí.
2. **`product-spec.md`** — El problema, la propuesta, el recorrido del usuario y los requisitos
   funcionales con sus IDs.
3. **`technical-plan.md`** — Stack, arquitectura, integración con OpenRouter, extracción y riesgos.
4. **`security-spec.md`** — Modelo de amenazas y manejo de la clave del usuario.
5. **`data-model.md`** — Tipos en memoria y contratos de salida del modelo.
6. **`prompts-spec.md`** — Los ocho prompts del sistema. El núcleo funcional del producto.
7. **`ui-spec.md`** — Tokens, componentes y patrones derivados de los mocks.
8. **`sprints/`** — Los tres sprints con su alcance y definición de terminado.
9. **`tasks.md`** — El backlog único con estados.
10. **`testing-plan.md`** — Qué se automatiza, qué se verifica a mano, y los umbrales de calidad.
11. **`deployment.md`** — Vercel, cabeceras y lista de verificación previa a producción.
12. **`.memory.md`** — La memoria viva. Se actualiza al cerrar cada versión, después del testeo.

---

## Cómo trabajar con esta documentación

**Antes de escribir código:** leer `constitution.md` y el sprint activo. Nada más hace falta para
empezar.

**Al implementar una tarea:** su criterio de terminado está en el archivo de sprint. Si toca la
interfaz, contrastar contra el mock correspondiente y contra `ui-spec.md`.

**Al terminar una versión:** correr el plan de pruebas y actualizar `.memory.md` siguiendo su
protocolo. Este paso no es opcional; es lo que hace que la documentación siga siendo cierta.

**Al querer cambiar una decisión cerrada:** modificar `constitution.md` primero, registrar el
cambio en `.memory.md`, y recién entonces implementar.

**Al tener una idea nueva a mitad de sprint:** va a "Backlog no comprometido" en `tasks.md`. No se
implementa (P9).

---

## Estructura

```
docs/
├── README.md
├── .memory.md
├── constitution.md
├── product-spec.md
├── technical-plan.md
├── security-spec.md
├── data-model.md
├── prompts-spec.md
├── ui-spec.md
├── tasks.md
├── testing-plan.md
├── deployment.md
├── stitch-prompts.md
├── mocks/              ← colocar aquí las pantallas exportadas de Stitch
└── sprints/
    ├── sprint-01.md
    ├── sprint-02.md
    └── sprint-03.md
```

---

## Lo que hay que tener presente

Tres cosas sostienen este producto. Si alguna se pierde, se pierde el proyecto:

**La app no inventa.** Cada afirmación sobre el usuario se rastrea hasta una línea de su contexto,
y lo que falta se declara en vez de rellenarse. Una respuesta fluida con un logro inventado es el
peor resultado posible, porque se descubre en la entrevista.

**La sesión es efímera y se ve.** Nada se guarda, y la interfaz lo dice en todas las pantallas.
Perder trabajo sin haber sido advertido es un fallo de severidad alta.

**El límite de caracteres es una restricción dura**, verificada en código y no confiada al modelo.
