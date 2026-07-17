// Generates preview/public/llms.txt from the docs registry so LLM tools have a
// concise, machine-readable guide to @a4ui/core. Run automatically before the
// docs build (see package.json). Best-effort text extraction — no JSX eval.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = readFileSync(resolve(root, 'preview/registry.tsx'), 'utf8')

// Pull id/title/group/blurb per entry (they appear in that order). Blurb strings
// may contain escaped quotes.
const grab = (re) => [...src.matchAll(re)].map((m) => m[1])
const ids = grab(/\bid: '([^']*)'/g)
const titles = grab(/\btitle: '([^']*)'/g)
const groups = grab(/\bgroup: '([^']*)'/g)
const blurbs = grab(/\bblurb: '((?:[^'\\]|\\.)*)'/g).map((s) => s.replace(/\\'/g, "'"))

const groupOrder = (grab(/export const DOC_GROUPS = \[([^\]]*)\]/g)[0] || '')
  .split(',')
  .map((s) => s.trim().replace(/^'|'$/g, ''))
  .filter(Boolean)

const entries = ids.map((id, i) => ({ id, title: titles[i], group: groups[i], blurb: blurbs[i] }))
const byGroup = new Map(groupOrder.map((g) => [g, []]))
for (const e of entries) {
  if (['instalacion', 'uso'].includes(e.id)) continue
  if (!byGroup.has(e.group)) byGroup.set(e.group, [])
  byGroup.get(e.group).push(e)
}

let out = `# @a4ui/core

> A4ui — "Spatial Glass" design system & component library for SolidJS
> (glassmorphism surfaces, starfield backdrop, light/dark themes). ~40 components
> built on Kobalte (behavior/a11y), a Tailwind preset (visual), and
> solid-transition-group + solid-motionone (motion).

Docs: https://a4uikit.github.io/a4ui/  ·  Repo: https://github.com/A4uikit/a4ui

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

## Components
`

for (const [group, list] of byGroup) {
  if (!list.length) continue
  out += `\n### ${group}\n\n`
  for (const e of list) out += `- **${e.title}** — ${e.blurb}\n`
}

out += `\nSee https://a4uikit.github.io/a4ui/#/<component-id> for a live example and
copyable code for each component (e.g. #/button, #/modal, #/data-field).
`

const dest = resolve(root, 'preview/public/llms.txt')
mkdirSync(dirname(dest), { recursive: true })
writeFileSync(dest, out)
console.log(`gen-llms: wrote ${dest} (${entries.length} entries)`)
