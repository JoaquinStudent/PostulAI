# PostulAI

Copiloto de postulaciones con IA para aplicantes en America Latina. Analiza convocatorias, evalua tu encaje, mejora tu perfil y genera respuestas personalizadas — todo desde tu navegador.

## Que hace

1. **Sube tu perfil** — Tu contexto profesional + CV o portafolio como fuente de verdad
2. **Agrega convocatorias** — URLs, PDFs o texto pegado. PostulAI extrae requisitos y evalua tu coincidencia
3. **Mejora y postula** — Coaching de perfil, pitch personalizado, tips de entrevista y respuestas listas

### Dos caminos segun el sector

| Sector | Foco | Que recomienda |
|--------|------|----------------|
| Empleo, Beca | CV y trayectoria | Cambios al CV, CV ideal, certificaciones, ATS keywords |
| Hackathon, Aceleradora, Evento, Voluntariado | Portafolio y proyectos | Proyectos a construir, perfil ideal, demos, pitch |

### Funciones principales

- **Analisis de encaje** — Porcentaje de coincidencia perfil vs convocatoria
- **Coaching de perfil** — Certificaciones, habilidades y experiencias alcanzables desde tu nivel actual
- **Elevator pitch** — Personalizado con tus datos reales, adaptado al sector
- **Tips de entrevista** — Especificos por convocatoria, basados en tus fortalezas y gaps
- **Mejora de CV / Portafolio** — Cambios concretos o proyectos recomendados segun el sector
- **Respuestas calibradas** — Metodo STAR con evidencia real, ajustadas al limite de caracteres

## Arquitectura

- **Next.js 16** con App Router + TypeScript strict
- **Zustand 5** para estado (session, batch, draft)
- **Tailwind CSS v4** + shadcn/ui
- **OpenRouter BYOK** — Todas las llamadas a IA van directo del navegador a OpenRouter. Sin backend, sin proxy.

### Privacidad por diseño

- Sin registro ni base de datos de usuarios
- La API key nunca toca un servidor — va directo del navegador a OpenRouter
- Cifrado local opcional (AES-256-GCM)
- Sesión temporal — al cerrar la pestaña, todo desaparece
- Sin telemetria, sin tracking

## Estructura

```
app/
  page.tsx          — Landing page
  contexto/         — Carga de perfil + CV
  conectar/         — Conexion API key + seleccion de modelos
  ajustes/          — Configuracion
  lote/             — Convocatorias por categoria
    [id]/           — Detalle + coaching + pitch + entrevista
      preparar/     — Workspace de redaccion

lib/
  ai/               — Cliente OpenRouter, modelos curados, verificacion
  prompts/          — PR-03 a PR-09 (extraccion, fit, drafting, coaching)
    sector-skills.ts — Skills estaticos por sector (0 tokens IA)
  extract/          — Extraccion de texto (URL, PDF)
  types.ts          — Tipos compartidos

stores/
  session.ts        — Contexto, conexion, estado global
  batch.ts          — Fuentes y oportunidades
  draft.ts          — Redaccion de respuestas
```

## Desarrollo

```bash
pnpm install
pnpm dev
```

Requiere Node 18+ y una API key de [OpenRouter](https://openrouter.ai/).

## Modelos recomendados

| Nivel | Analisis | Redaccion | Costo aprox |
|-------|----------|-----------|-------------|
| Economico | GPT-4o Mini | GPT-4o Mini | ~$0.01 |
| Equilibrado | GPT-4o Mini | Claude Sonnet 4 | ~$0.08 |
| Maxima calidad | Claude Sonnet 4 | Claude Opus 4 | ~$0.25 |
