# A4ui

[![npm](https://img.shields.io/npm/v/@a4ui/core.svg)](https://www.npmjs.com/package/@a4ui/core)
[![license](https://img.shields.io/npm/l/@a4ui/core.svg)](./LICENSE)
[![Lighthouse: Performance 97](https://img.shields.io/badge/Lighthouse-Perf_97-success)](https://a4uikit.github.io/a4ui/lighthouse.html)
[![Lighthouse: Accessibility 100](https://img.shields.io/badge/A11y-100-success)](https://a4uikit.github.io/a4ui/lighthouse.html)
[![Lighthouse: Best Practices 100](https://img.shields.io/badge/Best_Practices-100-success)](https://a4uikit.github.io/a4ui/lighthouse.html)
[![Lighthouse: SEO 100](https://img.shields.io/badge/SEO-100-success)](https://a4uikit.github.io/a4ui/lighthouse.html)
[![npm downloads](https://img.shields.io/npm/dm/@a4ui/core.svg)](https://www.npmjs.com/package/@a4ui/core)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@a4ui/core.svg)](https://bundlephobia.com/package/@a4ui/core)

**Spatial Glass** — a design system & component library for **SolidJS**
(glassmorphism + starfield backdrop + light/dark themes). Named after the 4
people in the Rivera family. 🙂

**📚 Docs & live examples:** https://a4uikit.github.io/a4ui/

Three layers, one identity:

| Layer           | What it gives                           | Tech                                         |
| --------------- | --------------------------------------- | -------------------------------------------- |
| Behavior / a11y | focus, keyboard, ARIA, portals          | **Kobalte**                                  |
| Motion          | transitions, count-up, calm mode        | **solid-transition-group + solid-motionone** |
| Visual          | glass surfaces, tokens, glow, starfield | **Tailwind preset + `styles.css`**           |

## Install

```bash
npm install @a4ui/core
```

Peer dependency: `solid-js` (>= 1.9).

## Use

```ts
// tailwind.config.ts
import a4ui from '@a4ui/core/preset'
export default {
  presets: [a4ui],
  content: ['./src/**/*.{ts,tsx}', './node_modules/@a4ui/core/dist/**/*.js'],
}
```

```tsx
// entry (once)
import '@a4ui/core/styles.css'

// anywhere
import { Button, Card, Modal } from '@a4ui/core'
```

## Customization

Colors, radius and fonts are driven by CSS variables (the `@a4ui/core/preset`
maps Tailwind's semantic names to them). Override any token in your own CSS —
scope it to `:root` (or `:root[data-theme='light']`) after importing the styles:

```css
@import '@a4ui/core/styles.css';

:root {
  --primary: 262 83% 58%; /* HSL channels — makes everything primary purple */
  --radius-xl: 0.75rem;
}
```

Dark is the default; add `data-theme="light"` on `<html>` (or use the exported
`toggleTheme()` / `<ThemeToggle />`) for the light palette.

### Themes

A **theme** is a full color palette (all 15 tokens, dark + light). A4ui ships
several — `space` (the default), `dino`, `doctor`, `scientist`, `soccer` — and
you can swap them at runtime; the whole UI recolors instantly and the choice is
remembered:

```tsx
import { initTheme, selectTheme, themes } from '@a4ui/core'

initTheme() // once at startup — restores the saved theme (or Space)
selectTheme('dino') // switch by name; also accepts a ThemeDefinition
```

Build your own in the **[docs](https://a4uikit.github.io/a4ui/)** — open the ⚙︎
theme-settings drawer (top bar), pick a color for any token and the whole site
recolors live, then copy the exported CSS or JSON and apply it as a
`ThemeDefinition`. This is separate from the light/dark `setTheme`/`toggleTheme`
mode switch — a theme recolors underneath either mode.

## Framework integration

A4ui is a **SolidJS** library. It works natively in **Vite + Solid**,
**SolidStart** (SSR), and **Astro** (as Solid islands). For **React / Next.js**,
**Vue**, or plain HTML, ship the self-contained **Web Components** bundle
(`@a4ui/core/elements` — Solid is compiled in, no Solid toolchain needed):

```html
<link rel="stylesheet" href="…/@a4ui/core/dist/elements.css" />
<script type="module" src="…/@a4ui/core/dist/elements.js"></script>
<a4-button variant="primary" label="Save"></a4-button>
```

Full setup for each stack — including the honest React/Next caveat and the SSR
notes — is in **[INTEGRATIONS.md](./INTEGRATIONS.md)**.

## Server rendering

A4ui is **client-first** — the components render in the browser (the glass,
starfield and theme rely on the DOM/`localStorage`). Importing the package is
SSR-safe (no crash at import), but for **SolidStart** render the components on the
client, e.g. via `clientOnly(() => import('...'))`.

## What's inside

~40 components across actions, forms, data, overlays, feedback, navigation and
layout — plus a virtualized list, motion helpers, and a generic `AppShell` with
the animated `SpaceBackground`. Browse them all (with live prop controls and
copyable code) in the **[docs site](https://a4uikit.github.io/a4ui/)**.

## Using with AI agents

Everything an AI coding agent (Claude Code, Codex, Cursor, …) needs to use A4ui
ships **in the package**, so it works from `node_modules` without visiting the docs:

- **Typed API + examples** — every export has JSDoc with an `@example` in the
  shipped `.d.ts` (`node_modules/@a4ui/core/dist/index.d.ts`), so editor
  autocomplete and agents get the props and usage inline.
- **`llms.txt`** — a machine-readable summary of every component:
  https://a4uikit.github.io/a4ui/llms.txt

Drop this into your project's `AGENTS.md` / `CLAUDE.md` to prime your agent:

> This project uses **@a4ui/core** (SolidJS design system). Import components as
> named exports from `@a4ui/core`; import `@a4ui/core/styles.css` once in the app
> entry; add `@a4ui/core/preset` to `tailwind.config`. Props are typed with
> JSDoc/`@example` in the package's `.d.ts`. Full component list:
> https://a4uikit.github.io/a4ui/llms.txt

## Develop

```bash
npm install
npm run preview      # docs site (dev server)
npm run typecheck
npm run lint         # ESLint  ·  npm run format to auto-format
npm run test:unit    # Vitest — helper unit tests
npm test             # Playwright — docs render + behavior (desktop + mobile)
npm run build        # library build (ESM + .d.ts + styles.css)
```

See **[CONTRIBUTING.md](./CONTRIBUTING.md)** and **[AGENTS.md](./AGENTS.md)**.

## License

[MIT](./LICENSE) © Luis Alfredo Rivera Acuña
