// Builds dist/elements.css — the self-contained stylesheet for the Web Components
// bundle (@a4ui/core/elements). Non-Tailwind consumers (React/Next.js, Vue,
// vanilla) can't run our Tailwind preset, so we precompile everything the wrapped
// components need: the raw token/starfield CSS + the Tailwind base/components/
// utilities generated from the A4ui preset over the component source.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import postcss from 'postcss'
import tailwind from 'tailwindcss'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const r = (p) => resolve(root, p)

// The A4ui Tailwind preset (glass plugin + tokens). ESM default export.
const { default: a4ui } = await import(r('preset.js'))

// Raw CSS that isn't expressible as utilities: CSS variables + motion keyframes
// (tokens.css) and the starfield backdrop (space.css) — same set the main build
// ships as styles.css.
const rawCss = ['src/styles/tokens.css', 'src/styles/space.css']
  .map((f) => readFileSync(r(f), 'utf8'))
  .join('\n')

const input = '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n'

const result = await postcss([
  tailwind({
    presets: [a4ui],
    // Scan the whole library so every utility any wrapped component uses is kept.
    content: ['src/**/*.{ts,tsx}'],
  }),
]).process(input, { from: undefined })

mkdirSync(r('dist'), { recursive: true })
// Same precompiled CSS serves two audiences:
//  - dist/elements.css → the Web Components bundle.
//  - dist/full.css     → the Solid package used WITHOUT Tailwind (import it
//    instead of styles.css to get every utility the components need, no build).
const body = `${rawCss}\n${result.css}`
writeFileSync(
  r('dist/elements.css'),
  `/* @a4ui/core/elements.css — precompiled styles for the Web Components bundle. */\n${body}`,
)
writeFileSync(
  r('dist/full.css'),
  `/* @a4ui/core/full.css — fully precompiled styles (tokens + every utility the components use). Import instead of styles.css when NOT using Tailwind. */\n${body}`,
)

console.log(
  `elements.css + full.css written (${(result.css.length / 1024).toFixed(1)} kB utilities + raw tokens)`,
)
