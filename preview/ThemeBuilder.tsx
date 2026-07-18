// Theme Builder — pick a color for every design token, preview it live across the
// components, and export the CSS/JSON to drop into your own project. Edits the
// active theme's CSS variables globally (so the whole site previews your palette);
// "Reset" clears the overrides. Lazy-loaded from App.
import { createMemo, For, onMount, type JSX } from 'solid-js'
import { createStore } from 'solid-js/store'

import { Alert, Badge, Button, Card, Progress, Switch } from '../src'
import { CodeBlock } from './CodeBlock'

interface TokenDef {
  name: string // CSS var name without the leading `--`
  label: string
}

// The color tokens the preset maps Tailwind's semantic names to.
const TOKENS: TokenDef[] = [
  { name: 'background', label: 'Background' },
  { name: 'foreground', label: 'Foreground' },
  { name: 'card', label: 'Card' },
  { name: 'card-foreground', label: 'Card text' },
  { name: 'muted', label: 'Muted' },
  { name: 'muted-foreground', label: 'Muted text' },
  { name: 'border', label: 'Border' },
  { name: 'input', label: 'Input' },
  { name: 'primary', label: 'Primary' },
  { name: 'primary-foreground', label: 'Primary text' },
  { name: 'accent', label: 'Accent' },
  { name: 'accent-foreground', label: 'Accent text' },
  { name: 'ring', label: 'Ring' },
  { name: 'destructive', label: 'Destructive' },
  { name: 'destructive-foreground', label: 'Destructive text' },
]

// ---- "H S% L%" (the token format) <-> #rrggbb (the <input type=color> format) ----

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
  return [f(0), f(8), f(4)].map((x) => Math.round(x * 255)) as [number, number, number]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
  }
  h = Math.round(h * 60)
  if (h < 0) h += 360
  const l = (max + min) / 2
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  return [h, Math.round(s * 100), Math.round(l * 100)]
}

const hex2 = (n: number) => n.toString(16).padStart(2, '0')

function hslStrToHex(hsl: string): string {
  const m = /(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/.exec(hsl)
  if (!m) return '#000000'
  const [r, g, b] = hslToRgb(Number(m[1]), Number(m[2]), Number(m[3]))
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`
}

function hexToHslStr(hex: string): string {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex)
  if (!m) return '0 0% 0%'
  const [h, s, l] = rgbToHsl(parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16))
  return `${h} ${s}% ${l}%`
}

export default function ThemeBuilder(): JSX.Element {
  const [values, setValues] = createStore<Record<string, string>>({})

  // Seed from the current computed theme values.
  onMount(() => {
    const cs = getComputedStyle(document.documentElement)
    const seed: Record<string, string> = {}
    for (const t of TOKENS) seed[t.name] = cs.getPropertyValue(`--${t.name}`).trim()
    setValues(seed)
  })

  const setVar = (name: string, hsl: string) => {
    setValues(name, hsl)
    document.documentElement.style.setProperty(`--${name}`, hsl)
  }

  const reset = () => {
    for (const t of TOKENS) document.documentElement.style.removeProperty(`--${t.name}`)
    const cs = getComputedStyle(document.documentElement)
    const seed: Record<string, string> = {}
    for (const t of TOKENS) seed[t.name] = cs.getPropertyValue(`--${t.name}`).trim()
    setValues(seed)
  }

  const cssExport = createMemo(
    () => `:root {\n${TOKENS.map((t) => `  --${t.name}: ${values[t.name]};`).join('\n')}\n}`,
  )
  const jsonExport = createMemo(() =>
    JSON.stringify(Object.fromEntries(TOKENS.map((t) => [t.name, values[t.name]])), null, 2),
  )

  return (
    <div class="mx-auto max-w-5xl pb-24">
      <header class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight">Theme Builder</h1>
        <p class="mt-2 text-muted-foreground">
          Pick a color for every token, preview it live below, then export the CSS or JSON. Toggle light/dark
          in the top bar to build each palette.
        </p>
      </header>

      <div class="flex flex-col gap-8 lg:flex-row">
        {/* Token pickers */}
        <div class="lg:w-64 lg:shrink-0">
          <Card glass class="p-4">
            <div class="mb-3 flex items-center justify-between">
              <span class="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Tokens
              </span>
              <button
                type="button"
                onClick={reset}
                class="text-xs text-muted-foreground hover:text-foreground"
              >
                Reset
              </button>
            </div>
            <div class="space-y-2">
              <For each={TOKENS}>
                {(t) => (
                  <label class="flex items-center justify-between gap-2 text-sm">
                    <span class="truncate text-muted-foreground">{t.label}</span>
                    <span class="flex items-center gap-2">
                      <input
                        type="color"
                        value={hslStrToHex(values[t.name] ?? '0 0% 0%')}
                        onInput={(e) => setVar(t.name, hexToHslStr(e.currentTarget.value))}
                        class="h-6 w-8 cursor-pointer rounded border border-border bg-transparent"
                        aria-label={t.label}
                      />
                    </span>
                  </label>
                )}
              </For>
            </div>
          </Card>
        </div>

        {/* Live preview + export */}
        <div class="min-w-0 flex-1 space-y-6">
          <Card glass class="p-6">
            <div class="flex flex-wrap items-center gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div class="mt-4 flex flex-wrap items-center gap-2">
              <Badge tone="neutral">neutral</Badge>
              <Badge tone="success">success</Badge>
              <Badge tone="warning">warning</Badge>
              <Badge tone="danger">danger</Badge>
              <Badge tone="info">info</Badge>
              <Switch checked onChange={() => {}} label="Switch" />
            </div>
            <div class="mt-4">
              <Progress value={64} label="Progress" />
            </div>
            <div class="mt-4">
              <Alert tone="info" title="Live preview">
                Every component reads these CSS variables — move a color and watch it update.
              </Alert>
            </div>
          </Card>

          <section class="space-y-3">
            <h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Export — CSS</h2>
            <CodeBlock code={cssExport()} />
          </section>

          <section class="space-y-3">
            <h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Export — JSON</h2>
            <CodeBlock code={jsonExport()} />
          </section>
        </div>
      </div>
    </div>
  )
}
