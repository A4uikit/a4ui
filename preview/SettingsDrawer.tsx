// Live theme settings — a non-modal slide-over. Pick a base theme or move any
// token's color and the WHOLE site recolors live behind the panel (no dimming
// backdrop, page stays interactive); the CSS/JSON export updates as you go.
// Edits write the token vars inline on <html>, overriding the active theme.
import { RotateCcw, X } from 'lucide-solid'
import { createMemo, For, onCleanup, onMount, type JSX } from 'solid-js'
import { createStore } from 'solid-js/store'

import { activeTheme, Badge, themes } from '../src'
import { CodeBlock } from './CodeBlock'
import { chooseBaseTheme, setOverride } from './themeStore'

interface TokenDef {
  name: string
  label: string
}

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

// ---- "H S% L%" (token format) <-> #rrggbb (<input type=color> format) ----

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

interface SettingsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDrawer(props: SettingsDrawerProps): JSX.Element {
  const [values, setValues] = createStore<Record<string, string>>({})

  // Read the current computed token values into the pickers (includes the active
  // theme + any inline edits already made this session).
  const seed = () => {
    const cs = getComputedStyle(document.documentElement)
    const next: Record<string, string> = {}
    for (const t of TOKENS) next[t.name] = cs.getPropertyValue(`--${t.name}`).trim()
    setValues(next)
  }

  onMount(() => {
    seed()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && props.open) props.onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    onCleanup(() => window.removeEventListener('keydown', onKey))
  })

  // Live-apply a single token globally (inline on <html> wins over the theme) and
  // remember it for this browser session so a refresh keeps the edit.
  const setVar = (name: string, hsl: string) => {
    setValues(name, hsl)
    setOverride(name, hsl)
  }

  // Switch base theme: drop custom edits, apply the theme, reseed pickers.
  const chooseBase = (name: string) => {
    chooseBaseTheme(name)
    seed()
  }

  // Reset → back to the currently selected preset (clears session edits).
  const reset = () => chooseBase(activeTheme().name)

  const cssExport = createMemo(
    () => `:root {\n${TOKENS.map((t) => `  --${t.name}: ${values[t.name]};`).join('\n')}\n}`,
  )
  const jsonExport = createMemo(() =>
    JSON.stringify(Object.fromEntries(TOKENS.map((t) => [t.name, values[t.name]])), null, 2),
  )

  return (
    <div
      role="dialog"
      aria-label="Theme settings"
      aria-hidden={!props.open}
      class="bg-glass fixed right-0 top-0 z-50 flex h-full w-[92vw] max-w-[360px] flex-col overflow-y-auto border-l border-border shadow-2xl transition-transform duration-300 ease-out"
      classList={{
        'translate-x-0': props.open,
        'translate-x-full': !props.open,
        'pointer-events-none': !props.open,
      }}
    >
      <div class="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/90 px-5 py-4 backdrop-blur">
        <div>
          <p class="text-[15px] font-bold leading-tight">Theme settings</p>
          <p class="text-[12px] text-muted-foreground">Edits recolor the site live</p>
        </div>
        <div class="flex items-center gap-1">
          <button
            type="button"
            onClick={reset}
            class="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Reset to theme"
            title="Reset to theme"
          >
            <RotateCcw class="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => props.onOpenChange(false)}
            class="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div class="space-y-6 p-5">
        {/* Base theme */}
        <section>
          <p class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Base theme
          </p>
          <div class="flex flex-wrap gap-2">
            <For each={themes}>
              {(t) => (
                <button
                  type="button"
                  onClick={() => chooseBase(t.name)}
                  class="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm transition"
                  classList={{
                    'border-primary bg-primary/10 text-foreground': t.name === activeTheme().name,
                    'border-border text-muted-foreground hover:text-foreground':
                      t.name !== activeTheme().name,
                  }}
                >
                  <span aria-hidden="true">{t.icon}</span>
                  {t.label}
                </button>
              )}
            </For>
          </div>
        </section>

        {/* Token pickers */}
        <section>
          <p class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Colors</p>
          <div class="space-y-1.5">
            <For each={TOKENS}>
              {(t) => (
                // Swatch on the LEFT so the native color popup opens toward the
                // screen centre (the drawer is flush to the right edge — a swatch
                // on the right would open its picker off-screen and get clipped).
                <label class="flex items-center gap-3 rounded-md px-1 py-1.5 text-sm hover:bg-muted/40">
                  <input
                    type="color"
                    value={hslStrToHex(values[t.name] ?? '0 0% 0%')}
                    onInput={(e) => setVar(t.name, hexToHslStr(e.currentTarget.value))}
                    class="h-8 w-10 shrink-0 cursor-pointer rounded border border-border bg-transparent"
                    aria-label={t.label}
                  />
                  <span class="flex-1 truncate text-muted-foreground">{t.label}</span>
                  <span class="font-mono text-[10px] text-muted-foreground">{values[t.name]}</span>
                </label>
              )}
            </For>
          </div>
        </section>

        {/* Live preview strip (also visible across the whole site behind the panel) */}
        <section class="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">neutral</Badge>
          <Badge tone="success">success</Badge>
          <Badge tone="warning">warning</Badge>
          <Badge tone="danger">danger</Badge>
          <Badge tone="info">info</Badge>
        </section>

        {/* Export */}
        <section class="space-y-2">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Export — CSS</p>
          <CodeBlock code={cssExport()} />
        </section>
        <section class="space-y-2">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Export — JSON</p>
          <CodeBlock code={jsonExport()} />
        </section>
      </div>
    </div>
  )
}
