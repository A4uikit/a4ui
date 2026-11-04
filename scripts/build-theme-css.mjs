// Builds dist/theme.css, the Tailwind 4 entry (`@import '@a4ui/core/theme.css'`).
//
// Tailwind 4 cannot use preset.js, and the components were written against the
// Tailwind 3 meaning of their utilities. This file is generated, never edited:
//  - tokens, the `light:` variant and the glass surfaces are read from preset.js
//  - the scales that Tailwind 4 renamed or changed are read from the Tailwind 3
//    config resolved with that preset (the Tailwind this repo builds with)
//  - tokens.css and space.css are read from src/styles
// Anything in the preset this script does not understand throws, so the two can
// not drift apart silently.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import postcss from 'postcss'
import tailwind from 'tailwindcss'
import resolveConfig from 'tailwindcss/resolveConfig.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const r = (p) => resolve(root, p)

const { default: preset } = await import(r('preset.js'))

// ---- Read the preset -------------------------------------------------------

const HANDLED_THEME_KEYS = new Set(['colors', 'fontFamily', 'borderRadius'])
for (const key of Object.keys(preset.theme.extend)) {
  if (!HANDLED_THEME_KEYS.has(key)) {
    throw new Error(`build-theme-css: preset.js theme.extend.${key} is not mapped to Tailwind 4`)
  }
}
const presetKeys = Object.keys(preset).sort().join()
if (presetKeys !== 'plugins,theme' || Object.keys(preset.theme).join() !== 'extend') {
  throw new Error(`build-theme-css: preset.js has settings this script does not map: ${presetKeys}`)
}

const variants = []
const componentObjects = []
for (const { handler } of preset.plugins) {
  // Only the plugin APIs that preset.js uses exist here: a new one is a TypeError
  // at build time rather than a surface missing from theme.css. `e` is what the
  // preset checks to tell Tailwind 3 from 4.
  handler({
    e: String,
    addVariant: (name, selector) => variants.push([name, selector]),
    addComponents: (object) => componentObjects.push(object),
  })
}

const kebab = (prop) =>
  prop.startsWith('--')
    ? prop
    : prop.replace(/^Webkit/, '-webkit').replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

// Every -webkit- declaration comes first, with its standard twin after it. The
// CSS minifier in current Vite and Tailwind 4 keeps only the last of an
// unprefixed-then-prefixed pair (Chromium then loses the blur) and drops a lone
// `-webkit-mask` when its targets do not need the prefix.
function withStandardTwins(object) {
  const prefixed = Object.entries(object).filter(([key]) => key.startsWith('Webkit'))
  const others = Object.fromEntries(Object.entries(object).filter(([key]) => !key.startsWith('Webkit')))
  const twins = {}
  for (const [key, value] of prefixed) {
    const standard = key[6].toLowerCase() + key.slice(7)
    if (!(standard in others)) twins[standard] = value
  }
  // Twins before the rest: `mask` is a shorthand that would reset a `mask-composite`.
  return { ...Object.fromEntries(prefixed), ...twins, ...others }
}

function serialize(object, indent = '') {
  return Object.entries(withStandardTwins(object))
    .map(([key, value]) =>
      typeof value === 'object'
        ? `${indent}${key} {\n${serialize(value, `${indent}  `)}${indent}}\n`
        : `${indent}${kebab(key)}: ${value};\n`,
    )
    .join('')
}

const flatten = (object, prefix = '') =>
  Object.entries(object).flatMap(([key, value]) => {
    if (typeof value === 'object') return flatten(value, key === 'DEFAULT' ? prefix : `${prefix}${key}-`)
    return [[key === 'DEFAULT' ? prefix.slice(0, -1) : `${prefix}${key}`, value]]
  })

const v3 = resolveConfig(preset).theme

// ---- @theme ----------------------------------------------------------------

function alphaFree(name, value) {
  const match = value.match(/^hsl\(var\((--[\w-]+)\) \/ <alpha-value>\)$/)
  if (!match) throw new Error(`build-theme-css: unexpected color format for ${name}: ${value}`)
  return `hsl(var(${match[1]}))`
}

function rgbWithAlpha(hex, alpha) {
  const match = hex.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i)
  if (!match) throw new Error(`build-theme-css: expected a #rrggbb color, got ${hex}`)
  const [red, green, blue] = match.slice(1).map((pair) => parseInt(pair, 16))
  return `rgb(${red} ${green} ${blue} / ${alpha})`
}

function themeBlock() {
  const lines = []
  const add = (name, value) => lines.push(`  --${name}: ${value};`)

  // `inline` so utilities carry `hsl(var(--primary))` itself. A plain @theme would
  // resolve --color-primary once at :root, so a palette set on a subtree would not
  // recolor it. It also keeps --shadow and --radius-xl from colliding with the
  // tokens of the same name in tokens.css.
  for (const [name, value] of flatten(v3.colors)) {
    if (['inherit', 'current', 'transparent'].includes(name)) continue
    add(`color-${name}`, value.includes('<alpha-value>') ? alphaFree(name, value) : value)
  }
  for (const [name, value] of Object.entries(v3.fontFamily)) add(`font-${name}`, value.join(', '))
  for (const [name, value] of Object.entries(v3.borderRadius)) {
    if (name === 'none' || name === 'full') continue
    add(name === 'DEFAULT' ? 'radius' : `radius-${name}`, value)
  }
  for (const [name, value] of Object.entries(v3.boxShadow)) {
    if (name === 'none') continue
    add(name === 'DEFAULT' ? 'shadow' : `shadow-${name}`, value)
  }
  for (const [name, value] of Object.entries(v3.blur)) {
    if (name === '0' || name === 'none') continue
    add(name === 'DEFAULT' ? 'blur' : `blur-${name}`, value)
  }
  for (const [name, value] of Object.entries(v3.dropShadow)) {
    if (name === 'none') continue
    add(
      name === 'DEFAULT' ? 'drop-shadow' : `drop-shadow-${name}`,
      Array.isArray(value) ? value.join(', ') : value,
    )
  }
  // Tailwind 4's line heights are unitless, so `text-sm text-[10px]` would shrink the
  // line with the font. Tailwind 3's are lengths and hold.
  for (const [name, [size, { lineHeight }]] of Object.entries(v3.fontSize)) {
    add(`text-${name}`, size)
    add(`text-${name}--line-height`, lineHeight)
  }
  for (const [name, value] of Object.entries(v3.screens)) add(`breakpoint-${name}`, value)
  add('default-ring-width', v3.ringWidth.DEFAULT)
  // `ring` alone: Tailwind 3 mixes its default color with ringOpacity at build time.
  add('default-ring-color', rgbWithAlpha(v3.ringColor.DEFAULT, v3.ringOpacity.DEFAULT))
  // `outline` alone: Tailwind 3 sets only the style, leaving the `medium` width.
  add('default-outline-width', '3px')
  return `@theme inline {\n${lines.join('\n')}\n}\n`
}

// ---- Cascade ---------------------------------------------------------------
//
// In Tailwind 3 every rule of the preset and of tokens.css shared one cascade
// with the utilities, so `.a4-field:focus` (0,2,0) beat `.border-input` (0,1,0)
// while `.card` (0,1,0) lost to `.rounded-2xl`. Tailwind 4 uses real cascade
// layers, where specificity only counts inside a layer: in `components` every
// one of those rules would lose, and left unlayered every one would win. So:
//  - a rule that ties or loses against a plain utility goes to `components`
//  - a rule that beats one goes to `utilities`, after the utilities, with one
//    less point of specificity. Being later replaces the point it gave up, so it
//    wins and loses against each utility exactly as it did in Tailwind 3.

function specificity(selector) {
  // Arguments of :where count for nothing; these sources use no :is or :has.
  const bare = selector.replace(/:where\([^()]*\)/g, '')
  const nots = [...bare.matchAll(/:not\(([^()]*)\)/g)].map((m) => specificity(m[1]))
  const flat = bare
    .replace(/:not\([^()]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '[]')
    .replace(/\([^()]*\)/g, '')
  const ids = (flat.match(/#[\w-]+/g) ?? []).length
  const pseudoElements = (flat.match(/::[\w-]+/g) ?? []).length
  const classes = (flat.replace(/::[\w-]+/g, '').match(/\.[\w-]+|\[\]|:[\w-]+/g) ?? []).length
  const types = (flat.replace(/::?[\w-]+|[.#][\w-]+/g, '').match(/[a-zA-Z][\w-]*/g) ?? []).length
  return nots.reduce(
    (sum, s) => [sum[0] + s[0], sum[1] + s[1], sum[2] + s[2]],
    [ids, classes, types + pseudoElements],
  )
}

const SIMPLE = /^(#[\w-]+|\.[\w-]+|\[[^\]]*\]|::[\w-]+|:[\w-]+(\([^()]*\))?|[a-zA-Z][\w-]*)/

// Wraps the first type selector when there is one (html.calm .card), otherwise
// the first class, attribute or pseudo-class, in :where().
function lowerSpecificity(selector) {
  const tokens = []
  for (let rest = selector; rest.length > 0;) {
    const match = rest.match(SIMPLE)
    const text = match ? match[0] : rest[0]
    tokens.push({ text, simple: Boolean(match) })
    rest = rest.slice(text.length)
  }
  const isType = ({ text, simple }) => simple && /^[a-zA-Z]/.test(text)
  const isClassLike = ({ text, simple }) => simple && /^([.[]|:(?!:))/.test(text)
  const target = tokens.find(isType) ?? tokens.find(isClassLike)
  if (!target) throw new Error(`build-theme-css: cannot lower the specificity of "${selector}"`)
  target.text = `:where(${target.text})`
  return tokens.map((t) => t.text).join('')
}

function placeSelector(selector) {
  const [ids, classes, others] = specificity(selector)
  if (ids > 0) return { layer: 'utilities', selector }
  const beatsUtility = classes >= 2 || (classes === 1 && others > 0 && !selector.includes('::'))
  if (!beatsUtility) return { layer: 'components', selector }
  return { layer: 'utilities', selector: lowerSpecificity(selector) }
}

const isTokenRule = (rule) =>
  rule.nodes.every((n) => n.type === 'comment' || (n.type === 'decl' && n.prop.startsWith('--')))

function placeRule(rule, wrappers, sink) {
  const body = rule.nodes
    .filter((n) => n.type === 'decl')
    .map((n) => `  ${n.toString()};`)
    .join('\n')
  const push = (layer, selectors) => {
    const block = `${selectors.join(',\n')} {\n${body}\n}`
    sink[layer].push(wrappers.reduceRight((inner, wrapper) => `${wrapper} {\n${inner}\n}`, block))
  }
  // Variables stay unlayered, so a consumer's later `:root { --primary: ... }` overrides
  // dark and still loses to `:root[data-theme='light']`, as it does with styles.css.
  if (isTokenRule(rule)) {
    push('tokens', rule.selectors)
    return
  }
  // Element defaults never beat a utility.
  const onlyTypes = rule.selectors.every((s) => {
    const [ids, classes] = specificity(s)
    return ids === 0 && classes === 0
  })
  if (onlyTypes) {
    push('base', rule.selectors)
    return
  }
  const groups = { components: [], utilities: [] }
  for (const selector of rule.selectors) {
    const placed = placeSelector(selector)
    groups[placed.layer].push(placed.selector)
  }
  if (groups.components.length > 0) push('components', groups.components)
  if (groups.utilities.length > 0) push('utilities', groups.utilities)
}

// Splits a stylesheet into the sink's layers, keeping the source order and any
// @media / @supports wrapper of each rule.
function layerStylesheet(css, sink) {
  const walk = (container, wrappers) => {
    container.each((node) => {
      if (node.type === 'atrule' && node.name.endsWith('keyframes')) {
        sink.keyframes.push(node.toString())
      } else if (node.type === 'atrule') {
        walk(node, [...wrappers, `@${node.name} ${node.params}`])
      } else if (node.type === 'rule') {
        placeRule(node, wrappers, sink)
        for (const child of node.nodes) {
          if (child.type !== 'rule') continue
          const nested = child.clone({ selector: child.selector.replace(/&/g, node.selector) })
          placeRule(nested, wrappers, sink)
        }
      }
    })
  }
  walk(postcss.parse(css), [])
}

// ---- Tailwind 3 defaults that Tailwind 4 changed ---------------------------

const compatBase = `*,
::before,
::after,
::backdrop,
::file-selector-button {
  border-color: ${v3.borderColor.DEFAULT};
}
input::placeholder,
textarea::placeholder {
  opacity: 1;
  color: ${v3.colors.gray[400]};
}
button,
[role='button'] {
  cursor: pointer;
}
:disabled {
  cursor: default;
}
/* Tailwind 4 also strips these from form controls; Tailwind 3 did it for buttons only. */
input:where(:not([type='button'], [type='reset'], [type='submit'])),
select,
optgroup,
textarea {
  background-color: revert-layer;
  border-radius: revert-layer;
}
/* Tailwind 4 zeroes margin and padding on everything; Tailwind 3 listed the elements. */
td,
th,
option {
  padding: revert-layer;
}
dialog,
[popover] {
  margin: revert-layer;
}`

// Some utilities changed in a way no theme value reaches, so the Tailwind 3 rules
// for the classes the components use are copied as they are, late in `utilities`:
//  - `space-*` and `divide-*` moved from "every child but the first" to "every child
//    but the last", at zero specificity. Which child carries the margin decides the
//    box sizes and whether a child's own `mt-*` wins. A zero-specificity reset goes
//    first, to clear what the Tailwind 4 rule set.
//  - `outline-none` now removes the outline, where Tailwind 3 kept a transparent one
//    that forced-colors mode turns visible.
//  - `from-x/40` and friends now resolve to a color-mix(), and one such stop moves the
//    whole gradient from sRGB to Oklab interpolation. Only their color is restored:
//    Tailwind 4 still builds the gradient from these variables.
//  - `bg-gradient-to-*` now names Oklab outright, so its direction is restored too.
const CHILD_RESETS = [
  [/space-y-(?!reverse)/, 'margin-block-end: 0;'],
  [/space-x-(?!reverse)/, 'margin-inline-end: 0;'],
  [/divide-y(?!-reverse)/, 'border-bottom-width: 0;'],
  [/divide-x(?!-reverse)/, 'border-inline-end-width: 0;'],
  // Any other divide-* is a color, which Tailwind 4 also sets on the first child.
  [/divide-(?!reverse|opacity)/, `border-color: ${v3.borderColor.DEFAULT};`],
]

// The stop's color alone, from a Tailwind 3 `from-*`, `via-*` or `to-*` rule.
function gradientStopRule(rule) {
  const decl = (prop) => rule.nodes.find((n) => n.prop === prop)?.value
  const stop = rule.selector.match(/(?:^|[.:])(from|via|to)-/)?.[1]
  const color =
    stop === 'via'
      ? decl('--tw-gradient-stops')?.match(
          /var\(--tw-gradient-from\), (.+) var\(--tw-gradient-via-position\)/,
        )?.[1]
      : decl(`--tw-gradient-${stop}`)?.replace(/ var\(--tw-gradient-\w+-position\)$/, '')
  if (!color) throw new Error(`build-theme-css: no gradient color in ${rule.selector}`)
  return `${rule.selector} {\n  --tw-gradient-${stop}: ${color};\n}\n`
}

function gradientDirectionRule(rule) {
  const direction = rule.nodes
    .find((n) => n.prop === 'background-image')
    ?.value.match(/^linear-gradient\((to [a-z ]+), var\(--tw-gradient-stops\)\)$/)?.[1]
  if (!direction) throw new Error(`build-theme-css: no gradient direction in ${rule.selector}`)
  return `${rule.selector} {\n  --tw-gradient-position: ${direction};\n}\n`
}

async function tailwind3Rules() {
  const { root: css } = await postcss([
    tailwind({ presets: [preset], content: [r('src/**/*.{ts,tsx}')] }),
  ]).process('@tailwind utilities;', { from: undefined })
  const rules = []
  css.walkRules((rule) => {
    const isChildRule = /(^|[:.-])(space|divide)-/.test(rule.selector)
    const isAlphaStop = /(^|[.:])(from|via|to)-[^ ]*\\\//.test(rule.selector)
    const isDirection = /(^|[.:])bg-gradient-to-/.test(rule.selector)
    if (!isChildRule && !isAlphaStop && !isDirection && !/(^|[:.-])outline-none/.test(rule.selector)) return
    const [prefix] = rule.selector.split(' > ')
    if (isChildRule && prefix === rule.selector) {
      throw new Error(`build-theme-css: unexpected rule ${rule.selector}`)
    }
    const reset = isChildRule ? CHILD_RESETS.find(([pattern]) => pattern.test(prefix))?.[1] : undefined
    const wrappers = []
    for (let at = rule.parent; at.type === 'atrule'; at = at.parent) {
      wrappers.unshift(`@${at.name} ${at.params}`)
    }
    const resetRule = reset ? `:where(${prefix} > :not(:last-child)) {\n  ${reset}\n}\n` : ''
    const block = isAlphaStop
      ? gradientStopRule(rule)
      : isDirection
        ? gradientDirectionRule(rule)
        : `${resetRule}${rule.toString()}`
    rules.push(wrappers.reduceRight((inner, wrapper) => `${wrapper} {\n${inner}\n}`, block))
  })
  return rules
}

// ---- Assemble --------------------------------------------------------------

function sharedChunks() {
  // Shared chunks keep a content hash in their name, so read them from the build.
  const entries = ['index.js', 'commerce.js', 'charts.js'].map((f) => readFileSync(r(`dist/${f}`), 'utf8'))
  const names = entries.flatMap((code) => [...code.matchAll(/from "\.\/([\w.-]+\.js)"/g)].map((m) => m[1]))
  return [...new Set(names)].sort()
}

const sink = { keyframes: [], tokens: [], base: [], components: [], utilities: [] }
for (const file of ['src/styles/tokens.css', 'src/styles/space.css']) {
  layerStylesheet(readFileSync(r(file), 'utf8'), sink)
}
for (const object of componentObjects) layerStylesheet(serialize(object), sink)

const layer = (name, rules) => `@layer ${name} {\n${rules.join('\n')}\n}\n`

const output = [
  '/* @a4ui/core/theme.css: Tailwind 4 entry. Generated by scripts/build-theme-css.mjs; do not edit. */',
  // Relative to this file (dist/theme.css), so it holds wherever the package is
  // installed. Listed by name to leave out the prebuilt elements bundle, which
  // would pull third-party strings into the scan.
  ...['index.js', 'commerce.js', 'charts.js', ...sharedChunks()].map((f) => `@source './${f}';`),
  ...variants.map(([name, selector]) => `@custom-variant ${name} (${selector});`),
  // Tailwind 4 gates hover: behind (hover: hover); Tailwind 3 did not.
  '@custom-variant hover (&:hover);',
  '',
  themeBlock(),
  layer('base', [compatBase, ...sink.base]),
  layer('components', sink.components),
  layer('utilities', [...(await tailwind3Rules()), ...sink.utilities]),
  sink.tokens.join('\n'),
  sink.keyframes.join('\n'),
  '',
].join('\n')

mkdirSync(r('dist'), { recursive: true })
writeFileSync(r('dist/theme.css'), output)
console.log(`theme.css written (${(output.length / 1024).toFixed(1)} kB)`)
