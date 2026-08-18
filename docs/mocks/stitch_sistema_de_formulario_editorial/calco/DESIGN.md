---
name: Calco
colors:
  surface: '#f8f9ff'
  surface-dim: '#d4dae6'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4ff'
  surface-container: '#e8eefa'
  surface-container-high: '#e2e9f4'
  surface-container-highest: '#dce3ee'
  on-surface: '#151c24'
  on-surface-variant: '#444652'
  inverse-surface: '#2a313a'
  inverse-on-surface: '#eaf1fd'
  outline: '#747683'
  outline-variant: '#c4c6d4'
  surface-tint: '#3b59b1'
  primary: '#002b80'
  on-primary: '#ffffff'
  primary-container: '#22439b'
  on-primary-container: '#a2b6ff'
  inverse-primary: '#b5c4ff'
  secondary: '#6f5d00'
  on-secondary: '#ffffff'
  secondary-container: '#ffde50'
  on-secondary-container: '#746100'
  tertiary: '#6d0012'
  on-tertiary: '#ffffff'
  tertiary-container: '#97051e'
  on-tertiary-container: '#ff9f9d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b5c4ff'
  on-primary-fixed: '#00164d'
  on-primary-fixed-variant: '#1e4098'
  secondary-fixed: '#ffe166'
  secondary-fixed-dim: '#e4c538'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#544600'
  tertiary-fixed: '#ffdad8'
  tertiary-fixed-dim: '#ffb3b0'
  on-tertiary-fixed: '#410007'
  on-tertiary-fixed-variant: '#92001b'
  background: '#f8f9ff'
  on-background: '#151c24'
  surface-variant: '#dce3ee'
typography:
  display-lg:
    fontFamily: Archivo Narrow
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Archivo Narrow
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Archivo Narrow
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  technical-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1'
    letterSpacing: 0.08em
  technical-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
  headline-md-mobile:
    fontFamily: Archivo Narrow
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1100px
  gutter: 16px
---

## Brand & Style
The design system is built upon the utilitarian aesthetic of carbon copy forms and official bureaucratic documentation. It evokes a sense of administrative precision, physical paper textures, and the reliability of a stamped document. The target audience includes professionals who value clarity, document-centric workflows, and a systematic approach to data entry.

The style is a blend of **Modern Minimalism** and **Functional Industrialism**. It avoids digital-first trends like blurs or deep shadows, opting instead for a flat, high-contrast, and grid-bound layout that feels like a physical sheet of paper on a clipboard. The emotional response is one of authority, order, and meticulous record-keeping.

## Colors
The palette is rooted in the materials of officialdom. The background uses a "blue-white" tint characteristic of the secondary sheet in a carbon copy set. 

- **Primary Action (Seal Ink Blue):** Used for primary buttons, active states, and official stamps.
- **Highlighter (Marker Yellow):** Used sparingly for temporal warnings, session bars, and emphasizing specific data points.
- **Main Ink:** A deep, near-black blue-gray for maximum legibility of primary text.
- **Secondary Ink:** A muted gray for labels and metadata, mimicking faded print.
- **Alert (Seal Red):** Reserved for errors, critical warnings, and "rejection" stamps.

## Typography
The typography system distinguishes between information hierarchy and data origin. 

- **Titles:** Use **Archivo Narrow** with tight tracking to mimic the dense, bold headers of pre-printed forms.
- **Content:** **Public Sans** provides a modern, neutral reading experience for body text and interactive UI elements.
- **Meta/Data:** **JetBrains Mono** is used for "filled-in" data, reference numbers, and small technical labels. Small labels must always be in ALL CAPS with increased tracking to ensure legibility at small sizes, simulating typewriter or dot-matrix markings.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy, centered on the screen to resemble a document on a desk.

- **Grid:** Built on an 8px base unit. 
- **Container:** The primary content area is restricted to a maximum width of 1100px.
- **Margins:** Desktop margins are set to 40px, scaling down to 16px on mobile.
- **Adaptation:** On mobile, complex side-by-side form fields reflow into a single vertical column. Spacing between sections is reduced by one increment (e.g., `lg` becomes `md`).

## Elevation & Depth
This design system avoids simulated Z-axis depth through shadows. Instead, it uses **Structural Layering** and **Line Weight**.

- **Surfaces:** The background is the base sheet (`#F2F4F7`). The primary workspace is a white card (`#FFFFFF`) with a 1px border.
- **Floating Elements:** Modals or tooltips use a 1px hairline border (`#C9D2DB`) and a single-pixel black hairline offset to simulate a slight lift, rather than a soft shadow.
- **Dividers:** Use 1px solid horizontal and vertical lines to separate content sections, echoing the ruled lines of a ledger.

## Shapes
The shape language is rigid and geometric. 

- **Standard Corners:** All containers, buttons, and input fields use a strict 4px (0.25rem) radius.
- **Status Badges:** These are the only elements permitted to be "pill-shaped" (fully rounded) to distinguish them from actionable buttons and static data containers.
- **Rule Lines:** Bottom borders on inputs are 2px thick to simulate a writing line.

## Components
- **Session Bar:** Positioned at the top of the viewport. Height: 28px. Background: `#F5D547` at 25% opacity. Text: "SESIÓN TEMPORAL · NADA SE GUARDA AL CERRAR" in Technical Label style. Actions within this bar use underlined text without a button background.
- **Buttons:** 
    - **Primary:** Background `#22439B`, text `#FFFFFF`, 4px radius. 
    - **Secondary:** Background transparent, 1px border `#22439B`, text `#22439B`.
- **Inputs:** A hybrid "ruled" style. 1px border on top and sides, with a 2px bottom border in `#C9D2DB`. On focus, the bottom border changes to `#22439B`.
- **Chips/Badges:** Pill-shaped. Confirmation uses `#1E7A5F` background (10% opacity) with solid green text. Alert uses `#C6303A` background (10% opacity) with solid red text.
- **Cards:** White background, 1px solid border `#C9D2DB`, no shadow.
- **Voice:** Use direct Spanish commands. 
    - *Incorrect:* "Se ha enviado el formulario."
    - *Correct:* "Formulario enviado correctamente."
    - *Action:* "Descargar copia" instead of "Click aquí para descargar".