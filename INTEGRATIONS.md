# Framework integration

A4ui ships **SolidJS** components. There are two ways to use it, depending on your stack:

| Your stack                                               | How                                                            | Notes                                                                                              |
| -------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Vite + Solid**                                         | Native components                                              | The default. Everything works.                                                                     |
| **SolidStart** (SSR)                                     | Native components                                              | Works; DOM‑heavy components render on the client (see [SSR](#server-side-rendering-ssr)).          |
| **Astro**                                                | Native components as Solid islands                             | Via `@astrojs/solid-js`.                                                                           |
| **React / Next.js**, **Vue**, **Svelte**, **plain HTML** | [**Web Components**](#web-components-react-nextjs-vue-vanilla) | Solid components can't run inside React/Vue directly — use the framework‑agnostic custom elements. |

> **Honest heads‑up:** a Solid component (`<Button />` from `@a4ui/core`) cannot be dropped into a React or Next.js tree — they are different runtimes. For React‑based frameworks, use the **Web Components** build below, which is a self‑contained bundle that works anywhere.

---

## Vite + Solid

```bash
npm i @a4ui/core solid-js
```

`tailwind.config.js`:

```js
import a4ui from '@a4ui/core/preset'

export default {
  presets: [a4ui],
  content: ['./index.html', './src/**/*.{ts,tsx}', './node_modules/@a4ui/core/dist/**/*.js'],
}
```

Import the styles once (tokens + motion + starfield) and use the components:

```tsx
import '@a4ui/core/styles.css'
import { Button, Card, initTheme } from '@a4ui/core'

initTheme() // restore the saved palette (optional)

export default () => (
  <Card glass>
    <Button variant="primary">Save</Button>
  </Card>
)
```

---

## SolidStart

Same install and Tailwind preset as above. Import the stylesheet once in your root layout (`src/root.tsx` or `app.tsx`):

```tsx
import '@a4ui/core/styles.css'
```

Then use the components anywhere. The design tokens and layout render on the server fine; interactive/portalled components hydrate on the client.

### Server-side rendering (SSR)

- A4ui's helpers (`theme`, `effects`, motion) **do not touch the DOM at module load**, so importing the package on the server won't throw.
- Components are **client‑rendered** — anything using Kobalte, portals, `onMount`, `IntersectionObserver`, or `matchMedia` runs after hydration. That's automatic in Solid; you don't need to do anything for most components.
- For a component you want to skip on the server entirely (e.g. a heavy virtualized list or a starfield backdrop), wrap it with SolidStart's `clientOnly`:

```tsx
import { clientOnly } from '@solidjs/start'
const SpaceBackground = clientOnly(() => import('@a4ui/core').then((m) => ({ default: m.SpaceBackground })))
```

---

## Astro

Add the Solid integration and Tailwind:

```bash
npm i @a4ui/core solid-js
npx astro add solid tailwind
```

Register the preset in `tailwind.config.mjs`:

```js
import a4ui from '@a4ui/core/preset'

export default {
  presets: [a4ui],
  content: ['./src/**/*.{astro,ts,tsx,mdx}', './node_modules/@a4ui/core/dist/**/*.js'],
}
```

Import the stylesheet in your layout's frontmatter (or a global CSS entry):

```astro
---
import '@a4ui/core/styles.css'
---
```

Write a small Solid component and drop it into `.astro` as an island. Use `client:only="solid-js"` for interactive components (Kobalte behavior needs the client):

```tsx
// src/components/SaveButton.tsx
import { Button } from '@a4ui/core'
export default () => <Button variant="primary">Save</Button>
```

```astro
---
import SaveButton from '../components/SaveButton.tsx'
---
<SaveButton client:only="solid-js" />
```

Static, non‑interactive components (`Badge`, `Card`, `Stat`) can use `client:load` or render at build time.

---

## Web Components (React, Next.js, Vue, vanilla)

For any non‑Solid framework, A4ui ships a **self‑contained Web Components bundle** — Solid is compiled in, so there's no Solid toolchain to set up. A curated set of presentational components is registered as custom elements.

```bash
npm i @a4ui/core
```

```js
import '@a4ui/core/elements' // registers <a4-button>, <a4-badge>, … (side effect)
import '@a4ui/core/elements.css' // precompiled styles (no Tailwind needed)
```

Or straight from a CDN in plain HTML:

```html
<link rel="stylesheet" href="https://unpkg.com/@a4ui/core/dist/elements.css" />
<script type="module" src="https://unpkg.com/@a4ui/core/dist/elements.js"></script>

<a4-button variant="primary" label="Save"></a4-button>
<a4-clock variant="analog" size="160"></a4-clock>
```

### Available elements

`a4-button` · `a4-badge` · `a4-alert` · `a4-spinner` · `a4-avatar` · `a4-progress` · `a4-meter` · `a4-ring-progress` · `a4-stat` · `a4-kbd` · `a4-separator` · `a4-rating` · `a4-countdown` · `a4-clock`

Props map to attributes (kebab‑case, coerced by type). Text goes in a `label` attribute (or between the tags). `a4-alert` uses `heading` (not `title`, which collides with the native HTML attribute). `a4-rating` emits a `change` event with the new value in `event.detail`.

> Rich, interactive, or portalled components (Modal, Combobox, DataGrid, Drawer, …) are **not** wrapped as elements — for those, use the native Solid components in a Solid app.

### React / Next.js

Custom elements work in JSX; register them once (e.g. in a client component or `_app`):

```tsx
'use client'
import '@a4ui/core/elements'
import '@a4ui/core/elements.css'

export function Toolbar() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    const onChange = (e: Event) => console.log('rating', (e as CustomEvent).detail)
    el?.addEventListener('change', onChange)
    return () => el?.removeEventListener('change', onChange)
  }, [])

  return (
    <div>
      {/* @ts-expect-error — custom element */}
      <a4-button variant="primary" label="Save" />
      {/* @ts-expect-error — custom element */}
      <a4-rating ref={ref} value={3} />
    </div>
  )
}
```

In **Next.js**, the import must run in a Client Component (`'use client'`) because it registers browser custom elements.

### Vue

Tell Vue which tags are custom elements (`vite.config`: `vueCompilerOptions.isCustomElement = tag => tag.startsWith('a4-')`), import the bundle once, then use the tags in templates. Attributes and `@change` work as usual.

### Vanilla / any framework

Include the two files (script + CSS) and write the tags. That's it.
