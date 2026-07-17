# A4ui

[![npm](https://img.shields.io/npm/v/@a4ui/core.svg)](https://www.npmjs.com/package/@a4ui/core)
[![license](https://img.shields.io/npm/l/@a4ui/core.svg)](./LICENSE)

**Spatial Glass** — a design system & component library for **SolidJS**
(glassmorphism + starfield backdrop + light/dark themes). Named after the 4
people in the Rivera family. 🙂

**📚 Docs & live examples:** https://a4uikit.github.io/a4ui/

Three layers, one identity:

| Layer | What it gives | Tech |
|-------|---------------|------|
| Behavior / a11y | focus, keyboard, ARIA, portals | **Kobalte** |
| Motion | transitions, count-up, calm mode | **solid-transition-group + solid-motionone** |
| Visual | glass surfaces, tokens, glow, starfield | **Tailwind preset + `styles.css`** |

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

## What's inside

~40 components across actions, forms, data, overlays, feedback, navigation and
layout — plus a virtualized list, motion helpers, and a generic `AppShell` with
the animated `SpaceBackground`. Browse them all (with live prop controls and
copyable code) in the **[docs site](https://a4uikit.github.io/a4ui/)**.

## Develop

```bash
npm install
npm run build        # library build (ESM + .d.ts)
npm run preview      # docs site (dev server)
npm run typecheck
npm test             # Playwright suite (render + behavior, desktop + mobile)
```

## License

[MIT](./LICENSE) © Luis Alfredo Rivera Acuña
