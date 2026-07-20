// Generates preview/public/llms.txt from the docs registry so LLM tools have a
// concise, machine-readable guide to @a4ui/core. Run automatically before the
// docs build (see package.json). Best-effort text extraction — no JSX eval.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = readFileSync(resolve(root, 'preview/registry.tsx'), 'utf8')

// Extract each DocEntry's id/title/group/blurb ATOMICALLY — they appear in that
// exact order per entry, so one regex keeps them aligned. (Grabbing each field
// into a separate array and zipping by index breaks: demo data like
// `{ title: 'Marina Vega', … }` adds stray `title:`/`id:` matches that desync
// the arrays and misassign blurbs.) Blurb strings may contain escaped quotes.
const grab = (re) => [...src.matchAll(re)].map((m) => m[1])
// Note the `\s*` after `blurb:` — Prettier wraps long blurbs onto their own line
// (`blurb:\n      '…'`); without it those entries would silently drop out.
const ENTRY_RE = /id: '([^']+)',\s*title: '([^']*)',\s*group: '([^']*)',\s*blurb:\s*'((?:[^'\\]|\\.)*)'/g
const entries = [...src.matchAll(ENTRY_RE)].map((m) => ({
  id: m[1],
  title: m[2],
  group: m[3],
  blurb: m[4].replace(/\\'/g, "'"),
}))

const groupOrder = (grab(/export const DOC_GROUPS = \[([^\]]*)\]/g)[0] || '')
  .split(',')
  .map((s) => s.trim().replace(/^'|'$/g, ''))
  .filter(Boolean)
const byGroup = new Map(groupOrder.map((g) => [g, []]))
for (const e of entries) {
  if (['instalacion', 'uso'].includes(e.id)) continue
  if (!byGroup.has(e.group)) byGroup.set(e.group, [])
  byGroup.get(e.group).push(e)
}

let out = `# @a4ui/core

> A4ui — "Spatial Glass" design system & component library for SolidJS
> (glassmorphism surfaces, starfield backdrop, light/dark themes). 90+ components
> built on Kobalte (behavior/a11y), a Tailwind preset (visual), and
> Motion (motion.dev, the \`motion\` package) for JS animation.

Docs: https://a4ui.pages.dev/  ·  Repo: https://github.com/A4uikit/a4ui

## Install

\`\`\`bash
npm install @a4ui/core
\`\`\`

Peer dependency: solid-js (>= 1.9).

## Setup

\`\`\`ts
// tailwind.config.ts — add the preset
import a4ui from '@a4ui/core/preset'
export default {
  presets: [a4ui],
  content: ['./src/**/*.{ts,tsx}', './node_modules/@a4ui/core/dist/**/*.js'],
}
\`\`\`

\`\`\`tsx
// entry (once)
import '@a4ui/core/styles.css'

// anywhere — every component is a named export; props are fully typed with
// JSDoc + @example in the shipped .d.ts.
import { Button, Card, Modal } from '@a4ui/core'
\`\`\`

## Entry points

Styling has two paths: **with Tailwind**, add the \`@a4ui/core/preset\` and import
\`styles.css\` (tokens + motion); **without Tailwind**, import \`@a4ui/core/full.css\`
(fully precompiled — tokens + every utility the components use).

- \`@a4ui/core\` — all the components listed below (named exports).
- \`@a4ui/core/styles.css\` — tokens + motion + starfield (needs the Tailwind preset for utilities).
- \`@a4ui/core/full.css\` — self-contained precompiled CSS for use WITHOUT Tailwind.
- \`@a4ui/core/preset\` — the Tailwind preset (semantic tokens + glass plugin).
- \`@a4ui/core/commerce\` — commerce set: ProductCard, ProductGrid, PriceTag, QuantityStepper, CartLine, CartSummary, FilterGroup.
- \`@a4ui/core/charts\` — charts: Sparkline, BarChart, DonutChart (native SVG).
- \`@a4ui/core/elements\` + \`@a4ui/core/elements.css\` — framework-agnostic Web Components (\`<a4-button>\`, \`<a4-clock>\`, …) for React/Next.js, Vue, or plain HTML.

The **Commerce** and **Charts** groups below import from \`@a4ui/core/commerce\` and
\`@a4ui/core/charts\` respectively; everything else from \`@a4ui/core\`.

## The "Spatial Glass" look (recipe)

To make a page actually look like A4ui (frosted glass over an ambient backdrop,
a cursor light, restrained motion) — not flat cards on a flat background — follow
this. Full guide: https://a4ui.pages.dev/#/guide-spatial-glass

1. **Backdrop first.** Render \`<Aurora/>\` once at the top of the layout and keep
   the page root transparent (NO \`bg-background\` on the root — Aurora paints the
   base). It tints to your theme; \`animated\` = slow drift; \`pointerGlow\` (default
   on) = a glow that follows the cursor across the backdrop.
   Glass only reads if there is color behind it — this is what provides it.
2. **Surfaces are glass.** Use \`<Card glass>\` (not opaque \`bg-card\` divs) so the
   Aurora shows through the frosted blur. \`glow\` is on by default; add \`spotlight\`
   (inner cursor glow) + \`tilt\` to KEY cards only (hero/feature/product), not all.
3. **Theme via tokens.** Override the 15 CSS vars (\`--primary\`, \`--accent\`, radius)
   under \`:root\`; everything incl. Aurora recolors. Light glass ships slightly
   transparent so the frost reads.
4. **Motion, 4–6 tasteful touches** (reduced-motion aware): \`ScrollProgress\`,
   \`Parallax\` hero, \`TextReveal\` headings, \`Magnetic\` on the primary CTA, count-up
   \`Stat\`, \`Carousel\` swipe. Keep them off the critical path.
5. **Expand, don't modal:** use \`Expandable\` (shared-element FLIP) for galleries and
   "click to see the full thing".
6. **Structure** with \`<Section>\` + full-bleed \`bg-muted/30\` bands.
7. **Ship-quality:** lazy images, ≥24px targets, labeled inputs, a robots.txt.

Common mistakes: flat background (add Aurora), opaque cards (use \`Card glass\`),
\`spotlight\`/\`tilt\` on every card (noisy), over-animating.

## Components
`

for (const [group, list] of byGroup) {
  if (!list.length) continue
  out += `\n### ${group}\n\n`
  for (const e of list) out += `- **${e.title}** — ${e.blurb}\n`
}

out += `\nSee https://a4ui.pages.dev/#/<component-id> for a live example and
copyable code for each component (e.g. #/button, #/modal, #/data-field).
`

const dest = resolve(root, 'preview/public/llms.txt')
mkdirSync(dirname(dest), { recursive: true })
writeFileSync(dest, out)
console.log(`gen-llms: wrote ${dest} (${entries.length} entries)`)
