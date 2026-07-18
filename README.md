# A4ui

<!-- TODO: hero screenshot / GIF (dark+light, components, SpaceBackground, theme switch) -->

![A4ui](https://a4uikit.github.io/a4ui/og.png)

[![npm](https://img.shields.io/npm/v/@a4ui/core.svg)](https://www.npmjs.com/package/@a4ui/core)
[![license](https://img.shields.io/npm/l/@a4ui/core.svg)](./LICENSE)
[![Lighthouse: Performance 97](https://img.shields.io/badge/Lighthouse-Perf_97-success)](https://a4uikit.github.io/a4ui/lighthouse.html)
[![Lighthouse: Accessibility 100](https://img.shields.io/badge/A11y-100-success)](https://a4uikit.github.io/a4ui/lighthouse.html)
[![Lighthouse: Best Practices 100](https://img.shields.io/badge/Best_Practices-100-success)](https://a4uikit.github.io/a4ui/lighthouse.html)
[![Lighthouse: SEO 100](https://img.shields.io/badge/SEO-100-success)](https://a4uikit.github.io/a4ui/lighthouse.html)
[![npm downloads](https://img.shields.io/npm/dm/@a4ui/core.svg)](https://www.npmjs.com/package/@a4ui/core)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@a4ui/core.svg)](https://bundlephobia.com/package/@a4ui/core)

Accessible SolidJS **Spatial Glass** component library — 75+ components,
layouts, runtime themes, a motion system, and framework-agnostic Web
Components. Named after the 4 people in the Rivera family. 🙂

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

A4ui works **out of the box, with no Tailwind required** — the styles ship
precompiled in `styles.css`:

```tsx
// entry (once)
import '@a4ui/core/styles.css'

// anywhere
import { Button } from '@a4ui/core'

export default () => <Button variant="primary">Save</Button>
```

Dark is the default; add `data-theme="light"` on `<html>` (or use the
exported `toggleTheme()` / `<ThemeToggle />`) for the light palette.

### Optional: Tailwind preset

If your app already uses Tailwind, add the A4ui preset so utilities like
`bg-primary/90` and the `.card` / `.glow-edge` glass surface classes resolve
against A4ui's tokens instead of your own config:

```js
// tailwind.config.js
import a4ui from '@a4ui/core/preset'

export default {
  presets: [a4ui],
  content: ['./index.html', './src/**/*.{ts,tsx}', './node_modules/@a4ui/core/dist/**/*.js'],
}
```

This is purely additive — components render fully styled with just
`styles.css`; the preset only matters if you also want A4ui's tokens
available as Tailwind utilities in _your own_ markup.

## Customization

Colors, radius and fonts are driven by CSS variables (the `@a4ui/core/preset`
maps Tailwind's semantic names to them, if you use it). Override any token in
your own CSS — scope it to `:root` (or `:root[data-theme='light']`) after
importing the styles:

```css
@import '@a4ui/core/styles.css';

:root {
  --primary: 262 83% 58%; /* HSL channels — makes everything primary purple */
  --radius-xl: 0.75rem;
}
```

### Themes

A **theme** is a full color palette (all 15 tokens, dark + light). A4ui ships
several — `space` (the default), `dino`, `doctor`, `scientist`, `soccer`,
`snow`, `christmas` — and you can swap them at runtime; the whole UI recolors
instantly and the choice is remembered:

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

## Components

75+ components across six categories (this is a sample — see the
**[docs site](https://a4uikit.github.io/a4ui/)** or `src/index.ts` for the
full list):

| Category       | Representative components                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| Forms          | `Input`, `Select`, `Checkbox`, `DateField`, `Combobox`, `TagInput`, `Slider`, `NumberInput`           |
| Overlays       | `Modal`, `Drawer`, `Popover`, `Tooltip`, `AlertDialog`, `ContextMenu`, `HoverCard`                    |
| Data & display | `Table`, `DataGrid`, `Tree`, `Calendar`, `Timeline`, `Stat`, `Descriptions`, `CalendarHeatmap`        |
| Navigation     | `Tabs`, `Breadcrumb`, `Pagination`, `Command`, `Anchor`, `Stepper`, `BottomNavigation`                |
| Feedback       | `Alert`, `Toast`, `Progress`, `Skeleton`, `Empty`, `Result`, `NotificationCenter`                     |
| Layout         | `AppShell`, `SpaceBackground`, `ThemedScenery`, `Card`, `Splitter`, `Affix`, `NavGroup`               |
| Commerce       | `ProductCard`, `ProductGrid`, `PriceTag`, `QuantityStepper`, `CartLine`, `CartSummary`, `FilterGroup` |

Domain-specific sets ship as **subpath entries** so the base package stays lean —
e.g. commerce components import from `@a4ui/core/commerce`:

```tsx
import { ProductCard, CartSummary } from '@a4ui/core/commerce'
```

## Why A4ui

|                         | **A4ui**                                           | Kobalte                | shadcn-solid                      | Hope UI                |
| ----------------------- | -------------------------------------------------- | ---------------------- | --------------------------------- | ---------------------- |
| Styled components       | ✅ ships styled, ready to use                      | ❌ unstyled primitives | ⚠️ copy-paste into your repo      | ✅ styled              |
| Web Components bundle   | ✅ `@a4ui/core/elements`, framework-agnostic       | ❌                     | ❌                                | ❌                     |
| Built-in runtime themes | ✅ multiple palettes + live theme builder          | ❌                     | ❌ (edit CSS vars by hand)        | ⚠️ static theme config |
| Motion system           | ✅ transitions, count-up, calm/reduced-motion mode | ❌ (behavior only)     | ❌                                | ⚠️ minimal             |
| AI-agent docs           | ✅ `llms.txt` + JSDoc `@example` in `.d.ts`        | ❌                     | ❌                                | ❌                     |
| Glass visual identity   | ✅ signature Spatial Glass look                    | ❌ (no visuals)        | ⚠️ depends on your Tailwind theme | ❌                     |

Kobalte is what A4ui builds _on_ for behavior/a11y — not a competitor so much
as a foundation. shadcn-solid and Hope UI are solid choices if you want a
different look or prefer owning the component source directly.

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
> entry; add `@a4ui/core/preset` to `tailwind.config` (optional). Props are typed
> with JSDoc/`@example` in the package's `.d.ts`. Full component list:
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
</content>
</invoke>
