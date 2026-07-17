# A4ui

**Spatial Glass** design system & component library for **SolidJS**. Named after
the 4 people in the Rivera family. 🙂

Three layers, one identity:

| Layer | What it gives | Tech |
|-------|---------------|------|
| Behavior / a11y | focus, keyboard, ARIA, portals | **Kobalte** |
| Motion | transitions, springs, count-up, calm mode | **solid-transition-group + solid-motionone** + helpers |
| Visual | glass tokens, colors, glow | **Tailwind preset + `styles.css`** |

## Install (once published)

```bash
npm install @a4ui/core
```

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

## Status

🌱 **Bases sembradas** — tokens + Tailwind preset + build scaffold. Components are
being extracted from the source app. See **`CLAUDE.md`** for the full plan and how
to continue in a new session.

## Develop

```bash
npm install
npm run build      # library build (ESM + .d.ts)
npm run dev        # watch build
npm run typecheck
```
