// Docs registry — the single source of truth for the documentation site. Each
// entry renders a live demo (dogfooding the real components) plus the code you'd
// write to use it. Add one object per component; the sidebar and content area
// are generated from this array.
import {
  Apple,
  Beef,
  Bell,
  Briefcase,
  Calendar as CalendarIcon,
  Cloud,
  Croissant,
  Folder,
  Heading,
  Heart,
  Home,
  Image as ImageIcon,
  Inbox,
  Milk,
  Minus,
  Package,
  Plane,
  Plus,
  Settings,
  Table as TableIcon,
  Type,
  Rocket,
  Search,
  ShoppingCart,
  Snowflake,
  Sparkles,
  Star,
  User,
  Zap,
  Check,
  Copy,
  Moon,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-solid'
import { createSignal, For, onCleanup, onMount, Show, type JSX } from 'solid-js'

import * as UI from '../src'
import * as Commerce from '../src/commerce'
import * as Charts from '../src/charts'
import { MarkdownGuide } from './MarkdownGuide'
// Long-form guides render the actual repo markdown (single-source, never drift).
import spatialGlassMd from '../SPATIAL-GLASS.md?raw'
import integrationsMd from '../INTEGRATIONS.md?raw'
import stabilityMd from '../STABILITY.md?raw'
import migrationMd from '../MIGRATION.md?raw'
import changelogMd from '../CHANGELOG.md?raw'

// Live prop control ("knob"). Entries opt in via `controls`; the docs render a
// panel and pass the current values to `demo`/`code`.
export type Control =
  | { type: 'boolean'; label: string; default: boolean }
  | { type: 'select'; label: string; options: string[]; default: string }
  | { type: 'text'; label: string; default: string }
  | { type: 'number'; label: string; default: number; min?: number; max?: number }

export type ControlValues = Record<string, string | number | boolean>

export interface DocEntry {
  id: string
  title: string
  group: string
  blurb: string
  /** Optional live prop controls. Keys are read by `demo`/`code`. */
  controls?: Record<string, Control>
  /** Live demo. Receives current control values ({} when no controls). Entries
      written as `() => (...)` still satisfy this (extra param is ignored). */
  demo: (c: ControlValues) => JSX.Element
  /** Code block: a static string, or a function of the control values. */
  code?: string | ((c: ControlValues) => string)
  /** Extra labelled examples of the same component with different props, shown
      under the main demo as a "Variations" section so you can see how props
      change it side by side. */
  variants?: { label: string; demo: () => JSX.Element }[]
  /** Long-form markdown guide (not a component demo): render just the prose,
      no Example/Controls/Code chrome. */
  guide?: boolean
}

// Sidebar group order.
export const DOC_GROUPS = [
  'Get started',
  'Actions',
  'Forms',
  'Data',
  'Commerce',
  'Charts',
  'Overlays',
  'Feedback',
  'Navigation',
  'Layout',
  'Motion',
  'Guides',
]

// Shared demo content for the micro-interaction gallery (CardSpread / 3D).
const demoCards = (n = 5): JSX.Element[] =>
  Array.from({ length: n }, (_, i) => (
    <div class="grid h-full place-items-center p-4 text-center text-sm font-medium text-card-foreground">
      Card {i + 1}
    </div>
  ))

const demoPanels = (labels: string[]): JSX.Element[] =>
  labels.map((label) => (
    <div class="grid h-full w-full place-items-center rounded-xl border border-border bg-card p-6 text-center text-sm font-medium text-card-foreground">
      {label}
    </div>
  ))

export const DOCS: DocEntry[] = [
  // ---- Get started ----------------------------------------------------------
  {
    id: 'instalacion',
    title: 'Installation',
    group: 'Get started',
    blurb:
      'A4ui is a SolidJS component library with a "Spatial Glass" look. Install it and get all the design decisions solved for you.',
    demo: () => (
      <div class="space-y-3 text-sm text-muted-foreground">
        <p>1. Install the package. 2. Add the preset to Tailwind. 3. Import the styles once. Done.</p>
        <p>
          Requires <code class="rounded bg-muted px-1 font-mono">solid-js</code> and{' '}
          <code class="rounded bg-muted px-1 font-mono">tailwindcss</code> in your project.
        </p>
      </div>
    ),
    code: `# 1. install
npm install @a4ui/core

// 2. tailwind.config.ts — add the preset
import a4ui from '@a4ui/core/preset'
export default {
  presets: [a4ui],
  content: ['./src/**/*.{ts,tsx}', './node_modules/@a4ui/core/dist/**/*.js'],
}

// 3. your entry (just once)
import '@a4ui/core/styles.css'`,
  },
  {
    id: 'uso',
    title: 'Quick start',
    group: 'Get started',
    blurb:
      'Import any component from "a4ui" and use it. Everything respects the light/dark theme and Kobalte accessibility.',
    demo: () => (
      <div class="flex flex-wrap items-center gap-3">
        <UI.Button>A button</UI.Button>
        <UI.Badge tone="success">Ready</UI.Badge>
        <UI.Spinner />
      </div>
    ),
    code: `import { Button, Badge, Spinner } from '@a4ui/core'

export function Example() {
  return (
    <>
      <Button>A button</Button>
      <Badge tone="success">Ready</Badge>
      <Spinner />
    </>
  )
}`,
  },
  {
    id: 'themes',
    title: 'Themes',
    group: 'Get started',
    blurb:
      'Swap the whole color palette at runtime. Five built-in themes; apply one by name, restore the saved one on boot, or bring your own. Separate from the light/dark switch — a theme recolors under either mode.',
    demo: () => (
      <div class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <For each={UI.themes}>
            {(t) => (
              <UI.Button
                variant={t.name === UI.activeTheme().name ? 'primary' : 'outline'}
                onClick={() => UI.selectTheme(t.name)}
              >
                {t.icon} {t.label}
              </UI.Button>
            )}
          </For>
        </div>
        <p class="text-sm text-muted-foreground">
          Click one — the whole site recolors live, and the choice is remembered across reloads. Or open the ⚙
          theme-settings drawer (top bar) to fine-tune every token and export the CSS/JSON.
        </p>
      </div>
    ),
    code: `import { initTheme, selectTheme } from '@a4ui/core'

// On app start — restore the saved theme (falls back to 'space')
initTheme()

// Switch anywhere: the UI recolors instantly and the choice persists
selectTheme('dino') // 'space' | 'dino' | 'doctor' | 'scientist' | 'soccer'

// ── Bring your own palette ─────────────────────────────────────────────
// Design it live in the ⚙ theme-settings drawer, hit "Export — JSON", then:
import { applyThemeDefinition, type ThemeDefinition } from '@a4ui/core'

const brand: ThemeDefinition = {
  name: 'brand', label: 'Brand', icon: '🎨', description: 'Our palette',
  // 15 tokens each, as "H S% L%" channels (from the export):
  dark:  { background: '222 47% 7%', foreground: '213 31% 91%', primary: '160 84% 39%', /* … */ },
  light: { background: '0 0% 100%',  foreground: '222 47% 11%', primary: '160 84% 34%', /* … */ },
}
applyThemeDefinition(brand) // or add it to your own picker`,
  },
  {
    id: 'icons',
    title: 'Icons',
    group: 'Get started',
    blurb:
      'A4ui already ships lucide-solid — 1500+ crisp, consistent icons, no extra install. Tree-shakeable too: import one icon and ONLY that icon ships (~0.3 kB), never the whole set. Size with h-/w-, color with text-*.',
    demo: () => (
      <div class="space-y-5">
        <div class="flex flex-wrap items-center gap-5 text-foreground">
          <Heart class="h-6 w-6" />
          <Star class="h-6 w-6" />
          <Rocket class="h-6 w-6" />
          <Cloud class="h-6 w-6" />
          <Zap class="h-6 w-6" />
          <Sparkles class="h-6 w-6" />
          <Bell class="h-6 w-6" />
        </div>
        <div class="flex flex-wrap items-center gap-4">
          <Star class="h-4 w-4 text-muted-foreground" />
          <Star class="h-6 w-6 text-primary" />
          <Star class="h-8 w-8 text-accent" />
          <Star class="h-10 w-10 text-destructive" />
        </div>
        <UI.Button>
          <Rocket class="h-4 w-4" /> Launch
        </UI.Button>
      </div>
    ),
    code: `// A4ui depends on lucide-solid, so its 1500+ icons are ready — no extra install.
// Tree-shaking: importing one icon ships ONLY that icon (~0.3 kB), not the 1500+.
import { Heart, Star, Rocket } from 'lucide-solid'
import { Button } from '@a4ui/core'

<Star class="h-5 w-5 text-primary" />              {/* size via h-/w-, color via text-* */}
<Button><Rocket class="h-4 w-4" /> Launch</Button>

// Browse every icon at https://lucide.dev/icons`,
  },
  {
    id: 'templates',
    title: 'Templates',
    group: 'Get started',
    blurb:
      'Complete, real company sites built with A4ui — each its own theme, live on Cloudflare Pages. Proof the system builds full pages, not just demos. Source: github.com/A4uikit/templates',
    demo: () => {
      const TEMPLATES = [
        { slug: 'beauty', name: 'Lumière', kind: 'Estética & skincare' },
        { slug: 'hvac', name: 'AirePro', kind: 'Aire acondicionado' },
        { slug: 'laser-engraving', name: 'Roble & Láser', kind: 'Grabado láser' },
        { slug: 'charcuterie', name: 'La Tabla', kind: 'Charcutería' },
        { slug: 'towing', name: 'Grúas Rescate 24', kind: 'Grúas 24/7' },
        { slug: 'computers', name: 'TecnoFix', kind: 'Cómputo & CCTV' },
        { slug: 'taller', name: 'Taller GT', kind: 'Taller mecánico' },
        { slug: 'restaurant', name: 'Sazón', kind: 'Restaurante' },
        { slug: 'saas-landing', name: 'Nimbus', kind: 'SaaS landing' },
        { slug: 'dolls', name: 'Juguetería Luna', kind: 'Juguetería' },
        { slug: 'sports', name: 'GolMX', kind: 'Deportes' },
        { slug: 'sports-live', name: 'En Vivo MX', kind: 'Marcadores en vivo' },
        { slug: 'phones', name: 'CelMX', kind: 'Tienda de teléfonos' },
        { slug: 'realestate', name: 'Casa Nova', kind: 'Inmobiliaria' },
        { slug: 'fintech', name: 'Nuvo', kind: 'Wallet / neobank' },
      ]
      return (
        <div class="grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <For each={TEMPLATES}>
            {(t) => {
              const url = `https://a4ui-${t.slug}.pages.dev`
              return (
                <div class="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
                  {/* browser chrome */}
                  <div class="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
                    <span class="flex gap-1.5">
                      <span class="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                      <span class="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                      <span class="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                    </span>
                    <span class="truncate rounded bg-background/70 px-2 py-0.5 text-[11px] text-muted-foreground">
                      a4ui-{t.slug}.pages.dev
                    </span>
                    <span class="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      demo
                    </span>
                  </div>
                  {/* live preview (lazy iframe, non-interactive) */}
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    class="group relative block h-56 overflow-hidden bg-background"
                  >
                    <iframe
                      src={url}
                      title={t.name}
                      loading="lazy"
                      class="pointer-events-none absolute left-0 top-0 h-[178%] w-[178%] origin-top-left scale-[0.5625] border-0"
                    />
                    <span class="absolute inset-0 grid place-items-center bg-background/0 opacity-0 transition-opacity group-hover:bg-background/40 group-hover:opacity-100">
                      <span class="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
                        Ver demo ↗
                      </span>
                    </span>
                  </a>
                  {/* meta + actions */}
                  <div class="space-y-3 p-4">
                    <div>
                      <p class="font-medium text-foreground">{t.name}</p>
                      <p class="text-sm text-muted-foreground">{t.kind}</p>
                    </div>
                    <div class="flex gap-2">
                      <UI.Button
                        variant="outline"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        class="flex-1 justify-center px-3 py-1.5 text-sm"
                      >
                        Ver demo ↗
                      </UI.Button>
                      <UI.Button
                        href={`${import.meta.env.BASE_URL}templates/${t.slug}.zip`}
                        class="justify-center px-3 py-1.5 text-sm"
                      >
                        ZIP
                      </UI.Button>
                    </div>
                  </div>
                </div>
              )
            }}
          </For>
        </div>
      )
    },
    code: `// 15 complete vertical sites built with @a4ui/core, each on its own
// Cloudflare Pages project (a4ui-<slug>.pages.dev). Monorepo:
//   https://github.com/A4uikit/templates
// e.g. https://a4ui-beauty.pages.dev · https://a4ui-fintech.pages.dev`,
  },
  {
    id: 'motion-stagger',
    title: 'Stagger',
    group: 'Motion',
    blurb:
      'Cascade a group in with a per-item delay (stagger) and a spring. Motion (motion.dev) is the engine A4ui uses — the package re-exports animate / inView / scroll / stagger / spring, plus animateIn / revealOnScroll.',
    demo: () => {
      const boxes: HTMLDivElement[] = []
      const play = () => {
        UI.animate(
          boxes.filter(Boolean),
          { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0px)'] },
          { delay: UI.stagger(0.08), type: 'spring', stiffness: 400, damping: 22 },
        )
      }
      onMount(play)
      return (
        <div class="space-y-4">
          <div class="flex gap-2">
            <For each={[0, 1, 2, 3, 4, 5]}>
              {(i) => (
                <div
                  ref={(el) => (boxes[i] = el)}
                  class="grid h-12 w-12 place-items-center rounded-lg bg-primary/80 text-sm font-semibold text-primary-foreground"
                >
                  {i + 1}
                </div>
              )}
            </For>
          </div>
          <UI.Button onClick={play}>Replay</UI.Button>
        </div>
      )
    },
    code: `import { animate, stagger, animateIn, revealOnScroll } from '@a4ui/core'

// Staggered spring entrance
animate(boxes, { opacity: [0, 1], y: [16, 0] }, { delay: stagger(0.08), type: 'spring' })

// The one-liners the library uses internally (both reduced-motion aware):
onMount(() => animateIn(cardEl, { delay: 0.1 }))          // fade/slide in on mount
onMount(() => revealOnScroll(sectionEl, { amount: 0.2 })) // reveal once on scroll`,
  },
  {
    id: 'motion-spring',
    title: 'Spring',
    group: 'Motion',
    blurb: 'Physics-based spring — fling the ball and it settles with a natural bounce.',
    demo: () => {
      let ball!: HTMLDivElement
      const [right, setRight] = createSignal(false)
      const fling = () => {
        const next = !right()
        setRight(next)
        UI.animate(ball, { x: next ? 220 : 0 }, { type: 'spring', stiffness: 300, damping: 14 })
      }
      return (
        <div class="space-y-4">
          <div class="h-14 w-full max-w-md">
            <div ref={ball} class="h-12 w-12 rounded-full bg-accent" />
          </div>
          <UI.Button onClick={fling}>Fling</UI.Button>
        </div>
      )
    },
    code: `animate(ball, { x: 220 }, { type: 'spring', stiffness: 300, damping: 14 })`,
  },
  {
    id: 'motion-reveal',
    title: 'Scroll reveal',
    group: 'Motion',
    blurb: 'Reveal items the first time they scroll into view (Motion inView). Scroll the list ↓',
    demo: () => {
      let container!: HTMLDivElement
      onMount(() => {
        container
          .querySelectorAll<HTMLElement>('[data-reveal]')
          .forEach((el) => UI.revealOnScroll(el, { amount: 0.6 }))
      })
      return (
        <div
          ref={container}
          class="h-56 w-full max-w-sm space-y-2 overflow-y-auto rounded-lg border border-border p-3"
        >
          <For each={Array.from({ length: 9 }, (_, i) => i)}>
            {(i) => (
              <div data-reveal class="rounded-md bg-muted px-3 py-4 text-sm text-foreground">
                Item {i + 1}
              </div>
            )}
          </For>
        </div>
      )
    },
    code: `onMount(() => items.forEach((el) => revealOnScroll(el, { amount: 0.6 })))`,
  },
  {
    id: 'motion-hover',
    title: 'Hover & press',
    group: 'Motion',
    blurb: 'Springy scale on hover and a dip on press, driven by Motion animate.',
    demo: () => {
      const spring = { type: 'spring', stiffness: 400, damping: 15 } as const
      return (
        <div
          onMouseEnter={(e) => UI.animate(e.currentTarget, { scale: 1.1 }, spring)}
          onMouseLeave={(e) => UI.animate(e.currentTarget, { scale: 1 }, spring)}
          onPointerDown={(e) => UI.animate(e.currentTarget, { scale: 0.94 }, spring)}
          onPointerUp={(e) => UI.animate(e.currentTarget, { scale: 1.1 }, spring)}
          class="grid h-24 w-24 cursor-pointer select-none place-items-center rounded-xl bg-primary/80 text-sm font-medium text-primary-foreground"
        >
          Hover me
        </div>
      )
    },
    code: `<div onMouseEnter={(e) => animate(e.currentTarget, { scale: 1.1 }, { type: 'spring' })} … />`,
  },
  {
    id: 'motion-count',
    title: 'Count up',
    group: 'Motion',
    blurb: 'Tween a number up with createCountUp (Motion under the hood). Replay to run it again.',
    demo: () => {
      const [target, setTarget] = createSignal(1280)
      const n = UI.createCountUp(target, 900)
      const replay = () => {
        setTarget(0)
        setTimeout(() => setTarget(900 + Math.floor(Math.random() * 800)), 40)
      }
      return (
        <div class="space-y-3">
          <p class="text-4xl font-bold tabular-nums text-foreground">{Math.round(n()).toLocaleString()}</p>
          <UI.Button onClick={replay}>Replay</UI.Button>
        </div>
      )
    },
    code: `const n = createCountUp(() => value(), 900)
<span>{Math.round(n()).toLocaleString()}</span>`,
  },
  {
    id: 'motion-scramble',
    title: 'Scramble text',
    group: 'Motion',
    blurb:
      'Text that decodes from random glyphs — reusable as the <ScrambleText> component. Run on mount or on hover.',
    demo: () => {
      const [seed, setSeed] = createSignal(0)
      return (
        <div class="space-y-4">
          <div class="text-2xl font-bold text-foreground">
            {/* keyed by seed so "Replay" remounts and re-scrambles */}
            <For each={[seed()]}>{() => <UI.ScrambleText text="Spatial Glass" duration={900} />}</For>
          </div>
          <p class="text-sm text-muted-foreground">
            Hover: <UI.ScrambleText text="decode on hover" trigger="hover" class="text-foreground" />
          </p>
          <UI.Button onClick={() => setSeed((s) => s + 1)}>Replay</UI.Button>
        </div>
      )
    },
    code: `import { ScrambleText } from '@a4ui/core'

<ScrambleText text="Spatial Glass" />                    // decodes on mount
<ScrambleText text="decode on hover" trigger="hover" />  // re-runs on mouseenter`,
  },
  {
    id: 'motion-text-reveal',
    title: 'Text reveal',
    group: 'Motion',
    blurb: 'Reveal a line word-by-word (or char-by-char) with a staggered fade — the <TextReveal> component.',
    demo: () => {
      const [seed, setSeed] = createSignal(0)
      return (
        <div class="space-y-4">
          <div class="text-xl font-semibold text-foreground">
            <For each={[seed()]}>
              {() => <UI.TextReveal text="Design systems that feel alive." by="word" />}
            </For>
          </div>
          <UI.Button onClick={() => setSeed((s) => s + 1)}>Replay</UI.Button>
        </div>
      )
    },
    code: `import { TextReveal } from '@a4ui/core'

<TextReveal text="Design systems that feel alive." by="word" />
<TextReveal text="reveal on scroll" onView />  // triggers the first time it enters view`,
  },
  {
    id: 'motion-hold',
    title: 'Hold to confirm',
    group: 'Motion',
    blurb:
      'Press and hold to confirm a weighty action — a fill sweeps and only fires at 100%. The <HoldToConfirm> component.',
    demo: () => {
      const [done, setDone] = createSignal(0)
      return (
        <div class="space-y-3">
          <UI.HoldToConfirm label="Hold to delete" holdMs={1200} onConfirm={() => setDone((n) => n + 1)} />
          <p class="text-sm text-muted-foreground">
            Confirmed <span class="font-semibold text-foreground">{done()}</span> time(s).
          </p>
        </div>
      )
    },
    code: `import { HoldToConfirm } from '@a4ui/core'

<HoldToConfirm label="Hold to delete" holdMs={1200} onConfirm={() => remove()} />`,
  },
  {
    id: 'motion-loaders',
    title: 'Loaders',
    group: 'Motion',
    blurb:
      'Loading indicators: <LoadingDots> (staggered bounce) and <FillText> (a band sweeping through text).',
    demo: () => (
      <div class="space-y-5">
        <div class="flex items-center gap-6 text-foreground">
          <UI.LoadingDots />
          <UI.LoadingDots size={12} class="text-primary" />
        </div>
        <UI.FillText text="Loading your workspace…" class="text-lg" />
      </div>
    ),
    code: `import { LoadingDots, FillText } from '@a4ui/core'

<LoadingDots />                         // three dots bouncing in a wave
<FillText text="Loading your workspace…" />  // a highlight sweeps through the text`,
  },
  {
    id: 'motion-curtain',
    title: 'Curtain transition',
    group: 'Motion',
    blurb:
      'Full-screen page/route wipe with seven variants (fade · doors · blinds · shutter · iris · clip · pixels) — one <Curtain> component. Pick a style and play it.',
    demo: () => {
      const variants: UI.CurtainVariant[] = ['fade', 'doors', 'blinds', 'shutter', 'iris', 'clip', 'pixels']
      const [variant, setVariant] = createSignal<UI.CurtainVariant>('doors')
      const [show, setShow] = createSignal(false)
      // Cover the screen, then immediately uncover — a full transition preview.
      const play = () => {
        setShow(true)
      }
      return (
        <div class="space-y-4">
          <div class="flex flex-wrap gap-2">
            <For each={variants}>
              {(v) => (
                <UI.Button variant={variant() === v ? 'primary' : 'outline'} onClick={() => setVariant(v)}>
                  {v}
                </UI.Button>
              )}
            </For>
          </div>
          <UI.Button onClick={play}>Play transition</UI.Button>
          <UI.Curtain
            show={show()}
            variant={variant()}
            color="hsl(var(--primary))"
            onCovered={() => setShow(false)}
          />
        </div>
      )
    },
    code: `import { Curtain } from '@a4ui/core'

// Controlled cover -> uncover; great for route transitions.
const [show, setShow] = createSignal(false)
<Curtain show={show()} variant="doors" onCovered={() => setShow(false)} />`,
  },
  {
    id: 'motion-parallax',
    title: 'Parallax',
    group: 'Motion',
    blurb:
      'Wrap anything in <Parallax> and it drifts at a fraction of scroll speed for depth. Scroll the panel ↓',
    demo: () => (
      <div class="h-64 w-full max-w-md space-y-6 overflow-y-auto rounded-lg border border-border p-4">
        <div class="h-24 rounded-md bg-muted" />
        <UI.Parallax amount={60}>
          <div class="grid h-28 place-items-center rounded-xl bg-primary/80 text-sm font-medium text-primary-foreground">
            I drift on scroll
          </div>
        </UI.Parallax>
        <div class="h-24 rounded-md bg-muted" />
        <UI.Parallax amount={-40}>
          <div class="grid h-28 place-items-center rounded-xl bg-accent/80 text-sm font-medium">
            so do I (opposite)
          </div>
        </UI.Parallax>
        <div class="h-40 rounded-md bg-muted" />
      </div>
    ),
    code: `import { Parallax } from '@a4ui/core'

<Parallax amount={60}><img src="hero.jpg" /></Parallax>  // drifts as it scrolls through view`,
  },
  {
    id: 'motion-notifications',
    title: 'Notification stack',
    group: 'Motion',
    blurb:
      'Stacked notifications that peek behind one another — click the stack (or "Show all") to expand the full list, "Show less" to collapse. The <NotificationStack> component. Add a few ↓',
    demo: () => {
      let seq = 0
      const SAMPLES = [
        { title: 'New follower', description: 'Marina started following you.' },
        { title: 'Payment received', description: '$49.00 from Acme Inc.' },
        { title: 'Build passed', description: 'main is green — 359 tests.' },
        { title: 'Reminder', description: 'Standup in 10 minutes.' },
      ]
      const [items, setItems] = createSignal<UI.StackNotification[]>([])
      const add = () => {
        const s = SAMPLES[seq % SAMPLES.length]
        seq += 1
        setItems((xs) => [{ id: seq, icon: <Bell class="h-4 w-4" />, ...s }, ...xs])
      }
      return (
        <div class="space-y-4">
          <UI.Button onClick={add}>Add notification</UI.Button>
          <UI.NotificationStack
            items={items()}
            onDismiss={(id) => setItems((xs) => xs.filter((x) => x.id !== id))}
          />
        </div>
      )
    },
    code: `import { NotificationStack, type StackNotification } from '@a4ui/core'

const [items, setItems] = createSignal<StackNotification[]>([])
<NotificationStack items={items()} onDismiss={(id) => setItems((xs) => xs.filter((x) => x.id !== id))} />`,
  },
  {
    id: 'motion-badge-state',
    title: 'Multi-state badge',
    group: 'Motion',
    blurb:
      'A status pill that morphs color and swaps its icon as state changes (idle · loading · success · error) — the <MultiStateBadge> component.',
    demo: () => {
      const [state, setState] = createSignal<UI.BadgeState>('idle')
      const run = () => {
        setState('loading')
        setTimeout(() => setState('success'), 1400)
      }
      return (
        <div class="space-y-4">
          <UI.MultiStateBadge state={state()} />
          <div class="flex flex-wrap gap-2">
            <UI.Button onClick={run}>Run task</UI.Button>
            <UI.Button variant="outline" onClick={() => setState('error')}>
              Fail
            </UI.Button>
            <UI.Button variant="ghost" onClick={() => setState('idle')}>
              Reset
            </UI.Button>
          </div>
        </div>
      )
    },
    code: `import { MultiStateBadge, type BadgeState } from '@a4ui/core'

const [state, setState] = createSignal<BadgeState>('idle')
<MultiStateBadge state={state()} />  // idle · loading · success · error`,
  },
  {
    id: 'motion-fly-cart',
    title: 'Add to cart',
    group: 'Motion',
    blurb:
      'The classic "fly to basket" — a ghost arcs from the product to the cart, which bumps. The flyToCart() helper.',
    demo: () => {
      let product!: HTMLDivElement
      let cart!: HTMLButtonElement
      const [count, setCount] = createSignal(0)
      const add = () => {
        UI.flyToCart(product, cart, {
          image:
            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" rx="10" fill="%237c3aed"/></svg>',
          onArrive: () => setCount((n) => n + 1),
        })
      }
      return (
        <div class="flex items-center justify-between gap-8">
          <div class="space-y-3">
            <div
              ref={product}
              class="grid h-24 w-24 place-items-center rounded-xl bg-primary/80 text-sm font-medium text-primary-foreground"
            >
              Product
            </div>
            <UI.Button onClick={add}>Add to cart</UI.Button>
          </div>
          <button
            ref={cart}
            type="button"
            class="relative grid h-12 w-12 place-items-center rounded-full border border-border bg-card text-foreground"
            aria-label={`Cart, ${count()} items`}
          >
            <ShoppingCart class="h-5 w-5" />
            <span class="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
              {count()}
            </span>
          </button>
        </div>
      )
    },
    code: `import { flyToCart } from '@a4ui/core'

flyToCart(productEl, cartIconEl, { image: product.image, onArrive: () => addToCart(product) })`,
  },
  {
    id: 'motion-now-playing',
    title: 'Now playing',
    group: 'Motion',
    blurb:
      'A compact media widget with a live equalizer that dances while playing — the <NowPlaying> component.',
    demo: () => {
      const [playing, setPlaying] = createSignal(true)
      return (
        <div class="space-y-4">
          <UI.NowPlaying
            title="Interstellar Drift"
            artist="The Riveras"
            playing={playing()}
            class="max-w-sm"
          />
          <UI.Button onClick={() => setPlaying((p) => !p)}>{playing() ? 'Pause' : 'Play'}</UI.Button>
        </div>
      )
    },
    code: `import { NowPlaying } from '@a4ui/core'

<NowPlaying title="Interstellar Drift" artist="The Riveras" playing cover="/art.jpg" />`,
  },
  {
    id: 'motion-expandable',
    title: 'Expandable (shared layout)',
    group: 'Motion',
    blurb:
      'A card that morphs into a dialog and back with a shared-element (FLIP) transition — the <Expandable> component. "dialog" mimics a family-photo modal, "full" the App-Store card expand. Click a card ↓',
    demo: () => {
      const CARDS = [
        { title: 'Deep Work', tag: 'Focus', body: 'Block distractions and enter flow with a single tap.' },
        {
          title: 'Stargazer',
          tag: 'Astronomy',
          body: 'Identify constellations in real time from your camera.',
        },
      ]
      return (
        <div class="flex flex-wrap gap-4">
          <For each={CARDS}>
            {(c) => (
              <UI.Expandable
                size="dialog"
                maxWidth={520}
                trigger={
                  <div class="card w-52 rounded-2xl border border-border bg-card p-4">
                    <div class="mb-2 h-24 rounded-xl bg-primary/70" />
                    <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.tag}</p>
                    <p class="text-base font-semibold text-foreground">{c.title}</p>
                  </div>
                }
              >
                <div class="p-6">
                  <div class="mb-4 h-40 rounded-xl bg-primary/70" />
                  <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.tag}</p>
                  <h3 class="text-2xl font-bold text-foreground">{c.title}</h3>
                  <p class="mt-2 text-muted-foreground">{c.body}</p>
                  <p class="mt-4 text-sm text-muted-foreground">
                    The card you tapped grows into this panel — same element, animated position and size, so
                    nothing stretches. Press Escape, click the backdrop, or the ✕ to shrink it back.
                  </p>
                </div>
              </UI.Expandable>
            )}
          </For>
          <UI.Expandable
            size="full"
            trigger={
              <div class="card grid w-52 place-items-center rounded-2xl border border-border bg-accent/70 p-4 text-center text-sm font-semibold">
                Open full-screen
                <span class="text-xs font-normal opacity-80">(App-Store style)</span>
              </div>
            }
          >
            <div class="p-8">
              <h3 class="text-3xl font-bold text-foreground">Featured</h3>
              <p class="mt-2 max-w-prose text-muted-foreground">
                size=&quot;full&quot; expands the card to nearly the whole viewport — the App-Store “tap a
                card, it takes over the screen” pattern, same FLIP transition.
              </p>
            </div>
          </UI.Expandable>
        </div>
      )
    },
    code: `import { Expandable } from '@a4ui/core'

<Expandable size="dialog" trigger={<Card>Tap to expand</Card>}>
  <div class="p-6">Full details — the card morphs into this panel</div>
</Expandable>`,
  },
  {
    id: 'motion-typewriter',
    title: 'Typewriter',
    group: 'Motion',
    blurb:
      'Types a string out char-by-char (with a blinking caret), cycling through several — the <Typewriter> component.',
    demo: () => (
      <div class="text-2xl font-semibold text-foreground">
        <UI.Typewriter
          text={['Spatial Glass.', 'For SolidJS.', 'Accessible by default.', 'Themeable at runtime.']}
        />
      </div>
    ),
    code: `import { Typewriter } from '@a4ui/core'

<Typewriter text={['Spatial Glass.', 'For SolidJS.']} />  // single string or an array to cycle`,
  },
  {
    id: 'motion-ripple',
    title: 'Ripple',
    group: 'Motion',
    blurb:
      'Material-style click ripple you wrap around anything — the <Ripple> component. Buttons have it baked in: <Button ripple>. Click the tile ↓',
    demo: () => (
      <UI.Ripple class="inline-block cursor-pointer rounded-xl">
        <div class="grid h-24 w-48 place-items-center rounded-xl bg-primary/80 text-sm font-medium text-primary-foreground">
          Click anywhere
        </div>
      </UI.Ripple>
    ),
    code: `import { Ripple } from '@a4ui/core'

<Ripple><button class="btn">Click me</button></Ripple>`,
  },
  {
    id: 'motion-magnetic',
    title: 'Magnetic',
    group: 'Motion',
    blurb:
      'Wrap anything in <Magnetic> and it springs toward the cursor as you hover near it. Hover the button ↓',
    demo: () => (
      <UI.Magnetic strength={16}>
        <UI.Button variant="primary">Magnetic</UI.Button>
      </UI.Magnetic>
    ),
    code: `import { Magnetic } from '@a4ui/core'

<Magnetic strength={16}><Button>Hover me</Button></Magnetic>`,
  },
  {
    id: 'motion-tilt',
    title: 'Tilt card',
    group: 'Motion',
    blurb:
      'A 3D tilt that follows the cursor — the <TiltCard> component. Cards have it baked in: <Card tilt>. Move your cursor over the card ↓',
    demo: () => (
      <UI.TiltCard>
        <div class="card grid h-36 w-60 place-items-center rounded-2xl border border-border bg-card p-4 text-center text-sm font-medium">
          Tilt me
        </div>
      </UI.TiltCard>
    ),
    code: `import { TiltCard } from '@a4ui/core'

<TiltCard><Card>Tilt me</Card></TiltCard>`,
    variants: [
      {
        label: 'Subtle (max=4)',
        demo: () => (
          <UI.TiltCard max={4}>
            <div class="card grid h-36 w-60 place-items-center rounded-2xl border border-border bg-card p-4 text-center text-sm font-medium">
              Subtle tilt
            </div>
          </UI.TiltCard>
        ),
      },
      {
        label: 'Dramatic (max=20)',
        demo: () => (
          <UI.TiltCard max={20}>
            <div class="card grid h-36 w-60 place-items-center rounded-2xl border border-border bg-card p-4 text-center text-sm font-medium">
              Dramatic tilt
            </div>
          </UI.TiltCard>
        ),
      },
    ],
  },
  {
    id: 'motion-spotlight',
    title: 'Spotlight',
    group: 'Motion',
    blurb:
      'A soft glow that follows the cursor across the surface — the <Spotlight> component. Cards have it baked in: <Card spotlight>. Move over it ↓',
    demo: () => (
      <UI.Spotlight class="rounded-2xl">
        <div class="grid h-36 w-72 place-items-center rounded-2xl border border-border bg-card p-4 text-center text-sm font-medium text-foreground">
          Move your cursor here
        </div>
      </UI.Spotlight>
    ),
    code: `import { Spotlight } from '@a4ui/core'

<Spotlight><Card>Move your cursor here</Card></Spotlight>`,
    variants: [
      {
        label: 'Accent color',
        demo: () => (
          <UI.Spotlight class="rounded-2xl" color="hsl(var(--accent))">
            <div class="grid h-36 w-72 place-items-center rounded-2xl border border-border bg-card p-4 text-center text-sm font-medium text-foreground">
              Accent glow
            </div>
          </UI.Spotlight>
        ),
      },
      {
        label: 'Small, tight glow',
        demo: () => (
          <UI.Spotlight class="rounded-2xl" size={80}>
            <div class="grid h-36 w-72 place-items-center rounded-2xl border border-border bg-card p-4 text-center text-sm font-medium text-foreground">
              Tight glow
            </div>
          </UI.Spotlight>
        ),
      },
    ],
  },
  {
    id: 'motion-scroll-progress',
    title: 'Scroll progress',
    group: 'Motion',
    blurb:
      'A reading-progress bar pinned to the top of the viewport that fills as the page scrolls — the <ScrollProgress> component. Scroll this page and watch the very top ↑',
    demo: () => (
      <div class="space-y-2">
        <UI.ScrollProgress />
        <p class="text-sm text-muted-foreground">
          The bar at the very top of the window fills as you scroll. Add it once near your app root.
        </p>
      </div>
    ),
    code: `import { ScrollProgress } from '@a4ui/core'

<ScrollProgress /> // fixed top-of-viewport bar tied to page scroll`,
  },
  {
    id: 'motion-gradient-text',
    title: 'Gradient text',
    group: 'Motion',
    blurb: 'Text with a smoothly animated multi-color gradient — the <GradientText> component.',
    demo: () => <UI.GradientText class="text-4xl">Spatial Glass for SolidJS</UI.GradientText>,
    code: `import { GradientText } from '@a4ui/core'

<GradientText class="text-4xl">Spatial Glass</GradientText>`,
    variants: [
      {
        label: 'Rose → amber',
        demo: () => (
          <UI.GradientText class="text-4xl" from="#f43f5e" via="#f97316" to="#f43f5e">
            Sonora Precision
          </UI.GradientText>
        ),
      },
      {
        label: 'Sky → violet',
        demo: () => (
          <UI.GradientText class="text-4xl" from="#0ea5e9" via="#8b5cf6" to="#0ea5e9">
            Launch Ready
          </UI.GradientText>
        ),
      },
    ],
  },

  // ---- Actions --------------------------------------------------------------
  {
    id: 'button',
    title: 'Button',
    group: 'Actions',
    blurb:
      'Button with 4 variants. Defaults to type="button" so it never submits forms by accident. `ripple` bakes in a Material click ripple (engine-free). Pass `href` to render as an <a> link (keeps the look + ripple). Try the controls ↓',
    controls: {
      variant: {
        type: 'select',
        label: 'variant',
        options: ['primary', 'secondary', 'outline', 'ghost'],
        default: 'primary',
      },
      disabled: { type: 'boolean', label: 'disabled', default: false },
      ripple: { type: 'boolean', label: 'ripple', default: true },
      label: { type: 'text', label: 'text', default: 'Save' },
    },
    demo: (c) => (
      <UI.Button
        variant={c.variant as UI.ButtonVariant}
        disabled={c.disabled as boolean}
        ripple={c.ripple as boolean}
      >
        {c.label as string}
      </UI.Button>
    ),
    code: (c) =>
      `<Button variant="${c.variant}"${c.disabled ? ' disabled' : ''}${c.ripple ? ' ripple' : ''}>${c.label}</Button>

// href renders it as an <a> (router link / tel: CTA), same look + ripple:
<Button ripple href="tel:+525512345678">Llama ahora</Button>${c.ripple ? '\n\n// ripple spawns a Material-style press ripple — no wrapper, no motion dep' : ''}`,
    variants: [
      { label: 'Secondary', demo: () => <UI.Button variant="secondary">Cancel</UI.Button> },
      { label: 'Outline', demo: () => <UI.Button variant="outline">Learn more</UI.Button> },
      { label: 'Ghost', demo: () => <UI.Button variant="ghost">Dismiss</UI.Button> },
      {
        label: 'With icon',
        demo: () => (
          <UI.Button variant="primary">
            <Sparkles class="mr-2 h-4 w-4" /> Upgrade
          </UI.Button>
        ),
      },
    ],
  },

  // ---- Feedback -------------------------------------------------------------
  {
    id: 'alert',
    title: 'Alert',
    group: 'Feedback',
    blurb: 'Inline banner for contextual messages, with 4 tones. Try the controls ↓',
    controls: {
      tone: {
        type: 'select',
        label: 'tone',
        options: ['info', 'success', 'warning', 'danger'],
        default: 'info',
      },
      title: { type: 'text', label: 'title', default: 'Information' },
    },
    demo: (c) => (
      <div class="w-full">
        <UI.Alert tone={c.tone as UI.AlertTone} title={c.title as string}>
          This is the alert content.
        </UI.Alert>
      </div>
    ),
    code: (c) => `<Alert tone="${c.tone}" title="${c.title}">This is the alert content.</Alert>`,
    variants: [
      {
        label: 'Success',
        demo: () => (
          <UI.Alert tone="success" title="Payment received">
            Your invoice was paid in full.
          </UI.Alert>
        ),
      },
      {
        label: 'Warning',
        demo: () => (
          <UI.Alert tone="warning" title="Storage almost full">
            You're at 92% of your plan quota.
          </UI.Alert>
        ),
      },
      {
        label: 'Danger',
        demo: () => (
          <UI.Alert tone="danger" title="Sync failed">
            Check your connection and try again.
          </UI.Alert>
        ),
      },
    ],
  },

  // ---- Forms ----------------------------------------------------------------
  {
    id: 'switch',
    title: 'Switch',
    group: 'Forms',
    blurb: 'Accessible on/off toggle (Kobalte).',
    controls: {
      label: { type: 'text', label: 'label', default: 'Notifications' },
      disabled: { type: 'boolean', label: 'disabled', default: false },
    },
    demo: (c) => {
      const [on, setOn] = createSignal(true)
      return (
        <UI.Switch
          checked={on()}
          onChange={setOn}
          label={c.label as string}
          disabled={c.disabled as boolean}
        />
      )
    },
    code: (c) => `const [on, setOn] = createSignal(true)
<Switch checked={on()} onChange={setOn} label="${c.label}"${c.disabled ? ' disabled' : ''} />`,
    variants: [
      { label: 'On', demo: () => <UI.Switch checked={true} onChange={() => {}} label="Auto-save" /> },
      { label: 'Off', demo: () => <UI.Switch checked={false} onChange={() => {}} label="Dark mode" /> },
      {
        label: 'Disabled',
        demo: () => <UI.Switch checked={true} onChange={() => {}} label="Beta features" disabled />,
      },
    ],
  },

  // ---- Data -----------------------------------------------------------------
  {
    id: 'stat',
    title: 'Stat',
    group: 'Data',
    blurb:
      'KPI card with an animated entrance (solid-motionone) and a count-up on the number (respects reduced-motion). Change the value and watch it count ↓',
    controls: {
      label: { type: 'text', label: 'label', default: 'Revenue' },
      value: { type: 'number', label: 'value', default: 125400, min: 0, max: 1000000 },
      tone: {
        type: 'select',
        label: 'tone',
        options: ['primary', 'success', 'danger', 'neutral'],
        default: 'success',
      },
    },
    demo: (c) => (
      <div class="w-full max-w-xs">
        <UI.Stat
          label={c.label as string}
          value={c.value as number}
          tone={c.tone as UI.StatTone}
          format={(n) => `$${Math.round(n).toLocaleString()}`}
        />
      </div>
    ),
    code: (c) => `<Stat label="${c.label}" value={${c.value}} tone="${c.tone}"
  format={(n) => \`$\${Math.round(n).toLocaleString()}\`} />`,
    variants: [
      { label: 'Success', demo: () => <UI.Stat label="Renewals" value={2840} tone="success" /> },
      { label: 'Danger', demo: () => <UI.Stat label="Churn" value={312} tone="danger" /> },
      { label: 'Neutral', demo: () => <UI.Stat label="Open tickets" value={57} tone="neutral" /> },
    ],
  },

  // ---- Overlays -------------------------------------------------------------
  {
    id: 'tooltip',
    title: 'Tooltip',
    group: 'Overlays',
    blurb: 'Floating label shown on focus/hover (Kobalte).',
    controls: {
      content: { type: 'text', label: 'content', default: "I'm a tooltip" },
    },
    demo: (c) => (
      <UI.Tooltip content={c.content as string}>
        <UI.Button variant="outline">Hover me</UI.Button>
      </UI.Tooltip>
    ),
    code: (c) => `<Tooltip content="${c.content}">
  <Button variant="outline">Hover me</Button>
</Tooltip>`,
    variants: [
      {
        label: 'Long content',
        demo: () => (
          <UI.Tooltip content="This action cannot be undone once confirmed">
            <UI.Button variant="ghost">Delete account</UI.Button>
          </UI.Tooltip>
        ),
      },
      {
        label: 'Icon trigger',
        demo: () => (
          <UI.Tooltip content="Notifications">
            <UI.Button variant="outline">
              <Bell class="h-4 w-4" />
            </UI.Button>
          </UI.Tooltip>
        ),
      },
    ],
  },

  // ---- Actions --------------------------------------------------------------
  {
    id: 'dropdown',
    title: 'Dropdown',
    group: 'Actions',
    blurb:
      'Actions menu (Kobalte). The trigger itself IS the button, so its children must be non-interactive.',
    demo: () => (
      <UI.Dropdown
        label="Actions"
        items={[
          { label: 'Edit', onSelect: () => UI.toast.info('Edit') },
          { label: 'Duplicate', onSelect: () => UI.toast.info('Duplicate') },
          { label: 'Delete', onSelect: () => UI.toast.error('Deleted'), destructive: true },
        ]}
      >
        <span class="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
          Actions ▾
        </span>
      </UI.Dropdown>
    ),
    code: `<Dropdown
  label="Actions"
  items={[
    { label: 'Edit', onSelect: () => edit() },
    { label: 'Delete', onSelect: () => remove(), destructive: true },
  ]}
>
  <span class="...">Actions ▾</span>
</Dropdown>`,
  },
  {
    id: 'context-menu',
    title: 'ContextMenu',
    group: 'Actions',
    blurb: 'Context menu shown on right-click over the child element (the target).',
    demo: () => (
      <UI.ContextMenu
        items={[
          { label: 'Copy', onSelect: () => UI.toast.info('Copied') },
          { label: 'Paste', onSelect: () => UI.toast.info('Pasted') },
          { label: 'Delete', onSelect: () => UI.toast.error('Deleted'), destructive: true },
        ]}
      >
        <div class="grid h-24 w-full place-items-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
          Right-click here
        </div>
      </UI.ContextMenu>
    ),
    code: `<ContextMenu
  items={[
    { label: 'Copy', onSelect: () => copy() },
    { label: 'Delete', onSelect: () => remove(), destructive: true },
  ]}
>
  <div class="...">Right-click here</div>
</ContextMenu>`,
  },
  {
    id: 'toggle',
    title: 'Toggle',
    group: 'Actions',
    blurb: 'Two-state button (pressed / not) — ideal for toolbars.',
    demo: () => {
      const [on, setOn] = createSignal(false)
      return (
        <UI.Toggle pressed={on()} onChange={setOn}>
          <span class="text-sm font-semibold">B</span>
        </UI.Toggle>
      )
    },
    code: `const [bold, setBold] = createSignal(false)
<Toggle pressed={bold()} onChange={setBold}>
  <BoldIcon />
</Toggle>`,
    variants: [
      {
        label: 'Pressed',
        demo: () => (
          <UI.Toggle pressed={true} onChange={() => {}}>
            <Star class="h-4 w-4" />
          </UI.Toggle>
        ),
      },
      {
        label: 'Not pressed',
        demo: () => (
          <UI.Toggle pressed={false} onChange={() => {}}>
            <Star class="h-4 w-4" />
          </UI.Toggle>
        ),
      },
    ],
  },
  {
    id: 'toggle-group',
    title: 'ToggleGroup',
    group: 'Actions',
    blurb: 'Row of segmented buttons; the value can become null when deselected.',
    demo: () => {
      const [align, setAlign] = createSignal<string | null>('left')
      return (
        <UI.ToggleGroup
          value={align()}
          onChange={setAlign}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ]}
        />
      )
    },
    code: `const [align, setAlign] = createSignal<string | null>('left')
<ToggleGroup
  value={align()}
  onChange={setAlign}
  options={[
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
  ]}
/>`,
    variants: [
      {
        label: 'No selection',
        demo: () => {
          const [view, setView] = createSignal<string | null>(null)
          return (
            <UI.ToggleGroup
              value={view()}
              onChange={setView}
              options={[
                { value: 'grid', label: 'Grid' },
                { value: 'list', label: 'List' },
              ]}
            />
          )
        },
      },
      {
        label: 'Three options, middle selected',
        demo: () => {
          const [size, setSize] = createSignal<string | null>('md')
          return (
            <UI.ToggleGroup
              value={size()}
              onChange={setSize}
              options={[
                { value: 'sm', label: 'S' },
                { value: 'md', label: 'M' },
                { value: 'lg', label: 'L' },
              ]}
            />
          )
        },
      },
    ],
  },
  {
    id: 'segmented-control',
    title: 'SegmentedControl',
    group: 'Actions',
    blurb: 'Single selection with an animated indicator that slides under the active option.',
    demo: () => {
      const [view, setView] = createSignal('list')
      return (
        <UI.SegmentedControl
          value={view()}
          onChange={setView}
          options={[
            { value: 'list', label: 'List' },
            { value: 'cards', label: 'Cards' },
            { value: 'table', label: 'Table' },
          ]}
        />
      )
    },
    code: `const [view, setView] = createSignal('list')
<SegmentedControl
  value={view()}
  onChange={setView}
  options={[
    { value: 'list', label: 'List' },
    { value: 'cards', label: 'Cards' },
  ]}
/>`,
  },

  // ---- Forms ----------------------------------------------------------------
  {
    id: 'input',
    title: 'Input',
    group: 'Forms',
    blurb: 'Controlled text field. Uses value/onInput (onInput receives the string, not the event).',
    controls: {
      placeholder: { type: 'text', label: 'placeholder', default: 'Full name' },
      disabled: { type: 'boolean', label: 'disabled', default: false },
    },
    demo: (c) => {
      const [name, setName] = createSignal('')
      return (
        <UI.Input
          value={name()}
          onInput={setName}
          placeholder={c.placeholder as string}
          disabled={c.disabled as boolean}
          class="max-w-xs"
        />
      )
    },
    code: (c) => `const [name, setName] = createSignal('')
<Input value={name()} onInput={setName} placeholder="${c.placeholder}"${c.disabled ? ' disabled' : ''} />`,
    variants: [
      {
        label: 'Pre-filled value',
        demo: () => {
          const [name, setName] = createSignal('Marina Vega')
          return <UI.Input value={name()} onInput={setName} placeholder="Full name" class="max-w-xs" />
        },
      },
      {
        label: 'Disabled',
        demo: () => <UI.Input value="Read only" onInput={() => {}} disabled class="max-w-xs" />,
      },
      {
        label: 'Email type',
        demo: () => {
          const [email, setEmail] = createSignal('')
          return (
            <UI.Input
              type="email"
              value={email()}
              onInput={setEmail}
              placeholder="you@example.com"
              class="max-w-xs"
            />
          )
        },
      },
    ],
  },
  {
    id: 'textarea',
    title: 'Textarea',
    group: 'Forms',
    blurb: 'Controlled multi-line field, resizable vertically.',
    controls: {
      placeholder: { type: 'text', label: 'placeholder', default: 'Write a note…' },
      disabled: { type: 'boolean', label: 'disabled', default: false },
    },
    demo: (c) => {
      const [text, setText] = createSignal('')
      return (
        <UI.Textarea
          value={text()}
          onInput={setText}
          placeholder={c.placeholder as string}
          disabled={c.disabled as boolean}
          class="max-w-sm"
        />
      )
    },
    code: (c) => `const [note, setNote] = createSignal('')
<Textarea value={note()} onInput={setNote} placeholder="${c.placeholder}"${c.disabled ? ' disabled' : ''} />`,
    variants: [
      {
        label: 'Pre-filled value',
        demo: () => {
          const [text, setText] = createSignal('Loved the product, will buy again.')
          return <UI.Textarea value={text()} onInput={setText} class="max-w-sm" />
        },
      },
      {
        label: 'Disabled',
        demo: () => <UI.Textarea value="Locked note" onInput={() => {}} disabled class="max-w-sm" />,
      },
    ],
  },
  {
    id: 'select',
    title: 'Select',
    group: 'Forms',
    blurb: 'Controlled native select (value/onChange receives the string). The <option>s go as children.',
    demo: () => {
      const [status, setStatus] = createSignal('active')
      return (
        <UI.Select value={status()} onChange={setStatus} aria-label="Status" class="max-w-xs">
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="archived">Archived</option>
        </UI.Select>
      )
    },
    code: `const [status, setStatus] = createSignal('active')
<Select value={status()} onChange={setStatus} aria-label="Status">
  <option value="active">Active</option>
  <option value="paused">Paused</option>
</Select>`,
  },
  {
    id: 'combobox',
    title: 'Combobox',
    group: 'Forms',
    blurb: 'Single selection with type-to-search (Kobalte). Options as a list of strings.',
    demo: () => {
      const [state, setState] = createSignal('Sonora')
      return (
        <div class="max-w-xs">
          <UI.Combobox
            options={['Sonora', 'Sinaloa', 'Jalisco', 'Nuevo León', 'Chihuahua']}
            value={state()}
            onChange={setState}
            placeholder="Search a state…"
          />
        </div>
      )
    },
    code: `const [state, setState] = createSignal('Sonora')
<Combobox
  options={['Sonora', 'Sinaloa', 'Jalisco', 'Nuevo León']}
  value={state()}
  onChange={setState}
  placeholder="Search a state…"
/>`,
  },
  {
    id: 'checkbox',
    title: 'Checkbox',
    group: 'Forms',
    blurb: 'Checkbox with a clickable label (checked/onChange).',
    controls: {
      label: { type: 'text', label: 'label', default: 'I accept the terms' },
    },
    demo: (c) => {
      const [accepted, setAccepted] = createSignal(false)
      return <UI.Checkbox checked={accepted()} onChange={setAccepted} label={c.label as string} />
    },
    code: (c) => `const [accepted, setAccepted] = createSignal(false)
<Checkbox checked={accepted()} onChange={setAccepted} label="${c.label}" />`,
    variants: [
      {
        label: 'Checked',
        demo: () => <UI.Checkbox checked={true} onChange={() => {}} label="Subscribe to newsletter" />,
      },
      {
        label: 'Unchecked',
        demo: () => <UI.Checkbox checked={false} onChange={() => {}} label="Remember me" />,
      },
    ],
  },
  {
    id: 'radio-group',
    title: 'RadioGroup',
    group: 'Forms',
    blurb: 'Accessible single-choice group (Kobalte), with an optional label.',
    demo: () => {
      const [plan, setPlan] = createSignal('monthly')
      return (
        <UI.RadioGroup
          value={plan()}
          onChange={setPlan}
          label="Billing plan"
          options={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'annual', label: 'Annual' },
            { value: 'enterprise', label: 'Enterprise', disabled: true },
          ]}
        />
      )
    },
    code: `const [plan, setPlan] = createSignal('monthly')
<RadioGroup
  value={plan()}
  onChange={setPlan}
  label="Billing plan"
  options={[
    { value: 'monthly', label: 'Monthly' },
    { value: 'annual', label: 'Annual' },
  ]}
/>`,
  },
  {
    id: 'slider',
    title: 'Slider',
    group: 'Forms',
    blurb: 'Single-value slider (Kobalte), with a visible label and value.',
    controls: {
      label: { type: 'text', label: 'label', default: 'Max price' },
      min: { type: 'number', label: 'min', default: 0, min: 0, max: 100 },
      max: { type: 'number', label: 'max', default: 100, min: 0, max: 1000 },
      step: { type: 'number', label: 'step', default: 5, min: 1, max: 50 },
    },
    demo: (c) => {
      const [price, setPrice] = createSignal(50)
      return (
        <div class="w-64">
          <UI.Slider
            value={price()}
            onChange={setPrice}
            min={c.min as number}
            max={c.max as number}
            step={c.step as number}
            label={c.label as string}
          />
        </div>
      )
    },
    code: (c) => `const [price, setPrice] = createSignal(50)
<Slider value={price()} onChange={setPrice} min={${c.min}} max={${c.max}} step={${c.step}} label="${c.label}" />`,
    variants: [
      {
        label: 'Volume (0–10)',
        demo: () => {
          const [v, setV] = createSignal(6)
          return (
            <div class="w-64">
              <UI.Slider value={v()} onChange={setV} min={0} max={10} step={1} label="Volume" />
            </div>
          )
        },
      },
      {
        label: 'Discount % (fine step)',
        demo: () => {
          const [v, setV] = createSignal(15)
          return (
            <div class="w-64">
              <UI.Slider value={v()} onChange={setV} min={0} max={50} step={1} label="Discount %" />
            </div>
          )
        },
      },
      {
        label: 'Budget (large range)',
        demo: () => {
          const [v, setV] = createSignal(4000)
          return (
            <div class="w-64">
              <UI.Slider value={v()} onChange={setV} min={0} max={10000} step={250} label="Budget" />
            </div>
          )
        },
      },
    ],
  },
  {
    id: 'number-input',
    title: 'NumberInput',
    group: 'Forms',
    blurb: 'Numeric field with −/+ buttons (Kobalte NumberField).',
    controls: {
      min: { type: 'number', label: 'min', default: 0, min: -100, max: 100 },
      max: { type: 'number', label: 'max', default: 99, min: 0, max: 1000 },
    },
    demo: (c) => {
      const [quantity, setQuantity] = createSignal(1)
      return (
        <UI.NumberInput
          value={quantity()}
          onChange={setQuantity}
          min={c.min as number}
          max={c.max as number}
        />
      )
    },
    code: (c) => `const [quantity, setQuantity] = createSignal(1)
<NumberInput value={quantity()} onChange={setQuantity} min={${c.min}} max={${c.max}} />`,
  },
  {
    id: 'date-field',
    title: 'DateField',
    group: 'Forms',
    blurb: 'Date picker with a calendar. Click the month or year to jump; « » step a year. YYYY-MM-DD.',
    demo: () => {
      const [date, setDate] = createSignal('')
      return (
        <div class="max-w-xs">
          <UI.DateField value={date()} onChange={setDate} label="Due date" />
        </div>
      )
    },
    code: `const [date, setDate] = createSignal('')
<DateField value={date()} onChange={setDate} label="Due date" />`,
  },
  {
    id: 'time-field',
    title: 'TimeField',
    group: 'Forms',
    blurb: 'Time picker with hour/minute columns. Value in 24h "HH:MM"; optional 12h AM/PM display.',
    demo: () => {
      const [time, setTime] = createSignal('')
      return (
        <div class="max-w-xs">
          <UI.TimeField value={time()} onChange={setTime} label="Start time" hour12 />
        </div>
      )
    },
    code: `const [time, setTime] = createSignal('')
<TimeField value={time()} onChange={setTime} label="Start time" hour12 />`,
  },
  {
    id: 'date-time-field',
    title: 'DateTimeField',
    group: 'Forms',
    blurb: 'Combined date + time picker. Value in "YYYY-MM-DD HH:MM" (local); each half fills independently.',
    demo: () => {
      const [when, setWhen] = createSignal('')
      return (
        <div class="max-w-md">
          <UI.DateTimeField value={when()} onChange={setWhen} hour12 />
        </div>
      )
    },
    code: `const [when, setWhen] = createSignal('')
<DateTimeField value={when()} onChange={setWhen} hour12 />`,
  },
  {
    id: 'date-range-picker',
    title: 'DateRangePicker',
    group: 'Forms',
    blurb: 'Pick a start and end date on one calendar; the range fills in between.',
    demo: () => {
      const [range, setRange] = createSignal({ start: '', end: '' })
      return (
        <div class="max-w-xs">
          <UI.DateRangePicker value={range()} onChange={setRange} label="Trip dates" />
        </div>
      )
    },
    code: `const [range, setRange] = createSignal({ start: '', end: '' })
<DateRangePicker value={range()} onChange={setRange} label="Trip dates" />`,
  },
  {
    id: 'form-field',
    title: 'FormField',
    group: 'Forms',
    blurb: 'Accessible field wrapper — label, control, description and error share one id.',
    demo: () => (
      <div class="max-w-xs">
        <UI.FormField>
          <UI.FormLabel>Email</UI.FormLabel>
          <UI.FormControl>
            {(f) => (
              <input
                id={f.id}
                aria-describedby={f['aria-describedby']}
                placeholder="you@example.com"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            )}
          </UI.FormControl>
          <UI.FormDescription>We'll never share it.</UI.FormDescription>
          <UI.FormError>Enter a valid email address.</UI.FormError>
        </UI.FormField>
      </div>
    ),
    code: `<FormField>
  <FormLabel>Email</FormLabel>
  <FormControl>{(f) => <input {...f} />}</FormControl>
  <FormDescription>We'll never share it.</FormDescription>
  <FormError>{errors().email}</FormError>
</FormField>`,
  },
  {
    id: 'price-tag',
    title: 'PriceTag',
    group: 'Commerce',
    blurb: 'Formatted price with an optional strikethrough compare-at and a discount badge.',
    demo: () => (
      <div class="flex items-center gap-8">
        <Commerce.PriceTag amount={64} />
        <Commerce.PriceTag amount={129} compareAt={169} size="lg" />
      </div>
    ),
    code: `<PriceTag amount={129} compareAt={169} />`,
  },
  {
    id: 'quantity-stepper',
    title: 'QuantityStepper',
    group: 'Commerce',
    blurb: 'Increment/decrement control with min/max clamping.',
    demo: () => {
      const [qty, setQty] = createSignal(1)
      return <Commerce.QuantityStepper value={qty()} onChange={setQty} min={1} max={10} />
    },
    code: `const [qty, setQty] = createSignal(1)
<QuantityStepper value={qty()} onChange={setQty} min={1} max={10} />`,
  },
  {
    id: 'product-card',
    title: 'ProductCard',
    group: 'Commerce',
    blurb:
      'Product tile — image, badge, title, rating, price, add-to-cart. `tilt`/`spotlight` forward to the underlying Card — hover it with them on ↓',
    controls: {
      tilt: { type: 'boolean', label: 'tilt', default: true },
      spotlight: { type: 'boolean', label: 'spotlight', default: true },
    },
    demo: (c) => (
      <div class="w-56">
        <Commerce.ProductCard
          title="Nebula Hoodie"
          brand="Orbit"
          category="Apparel"
          price={64}
          compareAt={80}
          badge="Sale"
          rating={4}
          image="https://picsum.photos/seed/a4ui-hoodie/400/400"
          tilt={c.tilt as boolean}
          spotlight={c.spotlight as boolean}
          onAddToCart={() => {}}
        />
      </div>
    ),
    code: (c) => `<ProductCard title="Nebula Hoodie" brand="Orbit" category="Apparel"
  price={64} compareAt={80} badge="Sale" badgeTone="sale"
  rating={4} image="/hoodie.jpg"${c.tilt ? ' tilt' : ''}${c.spotlight ? ' spotlight' : ''} onAddToCart={add} />${
    c.tilt || c.spotlight ? '\n\n// tilt/spotlight forward to Card — engine-free, reduced-motion aware' : ''
  }`,
    variants: [
      {
        label: 'No badge',
        demo: () => (
          <div class="w-56">
            <Commerce.ProductCard
              title="Comet Cap"
              brand="Orbit"
              category="Accessories"
              price={22}
              rating={5}
              image="https://picsum.photos/seed/a4ui-cap/400/400"
            />
          </div>
        ),
      },
      {
        label: 'New, featured tone',
        demo: () => (
          <div class="w-56">
            <Commerce.ProductCard
              title="Aurora Tee"
              brand="Orbit"
              category="Apparel"
              price={28}
              badge="New"
              badgeTone="new"
              rating={5}
              image="https://picsum.photos/seed/a4ui-tee/400/400"
            />
          </div>
        ),
      },
      {
        label: 'Featured, no discount',
        demo: () => (
          <div class="w-56">
            <Commerce.ProductCard
              title="Nova Jacket"
              brand="Orbit"
              category="Outerwear"
              price={120}
              badge="Featured"
              badgeTone="featured"
              image="https://picsum.photos/seed/a4ui-jacket/400/400"
            />
          </div>
        ),
      },
    ],
  },
  {
    id: 'product-grid',
    title: 'ProductGrid',
    group: 'Commerce',
    blurb: 'Responsive grid wrapper for ProductCards (2 / 3 / 4 columns).',
    demo: () => (
      <Commerce.ProductGrid class="max-w-2xl">
        <Commerce.ProductCard
          title="Nebula Hoodie"
          price={64}
          rating={4}
          image="https://picsum.photos/seed/a4ui-p1/300/300"
        />
        <Commerce.ProductCard
          title="Aurora Tee"
          price={28}
          compareAt={36}
          badge="Sale"
          rating={5}
          image="https://picsum.photos/seed/a4ui-p2/300/300"
        />
        <Commerce.ProductCard
          title="Comet Cap"
          price={22}
          image="https://picsum.photos/seed/a4ui-p3/300/300"
        />
      </Commerce.ProductGrid>
    ),
    code: `<ProductGrid>
  <ProductCard … />
  <ProductCard … />
</ProductGrid>`,
  },
  {
    id: 'cart-line',
    title: 'CartLine',
    group: 'Commerce',
    blurb: 'A cart row — thumbnail, title, quantity stepper, line total, remove.',
    demo: () => {
      const [qty, setQty] = createSignal(2)
      return (
        <div class="max-w-md">
          <Commerce.CartLine
            title="Nebula Hoodie"
            price={64}
            quantity={qty()}
            image="https://picsum.photos/seed/a4ui-hoodie/120/120"
            onQuantityChange={setQty}
            onRemove={() => {}}
          />
        </div>
      )
    },
    code: `<CartLine title="Nebula Hoodie" price={64} quantity={qty()}
  onQuantityChange={setQty} onRemove={remove} />`,
  },
  {
    id: 'cart-summary',
    title: 'CartSummary',
    group: 'Commerce',
    blurb: 'Itemized totals panel with a checkout button.',
    demo: () => (
      <div class="max-w-xs">
        <Commerce.CartSummary
          lines={[
            { label: 'Subtotal', amount: 128 },
            { label: 'Shipping', amount: 8 },
            { label: 'Tax', amount: 10.24 },
          ]}
          total={146.24}
          onCheckout={() => {}}
        />
      </div>
    ),
    code: `<CartSummary lines={[{ label: 'Subtotal', amount: 128 }, …]}
  total={146.24} onCheckout={checkout} />`,
  },
  {
    id: 'filter-group',
    title: 'FilterGroup',
    group: 'Commerce',
    blurb: 'A titled facet group of checkboxes with optional counts.',
    demo: () => {
      const [sel, setSel] = createSignal<string[]>(['tops'])
      return (
        <div class="max-w-xs">
          <Commerce.FilterGroup
            title="Category"
            selected={sel()}
            onChange={setSel}
            options={[
              { value: 'tops', label: 'Tops', count: 12 },
              { value: 'bottoms', label: 'Bottoms', count: 8 },
              { value: 'shoes', label: 'Shoes', count: 5 },
            ]}
          />
        </div>
      )
    },
    code: `const [sel, setSel] = createSignal<string[]>([])
<FilterGroup title="Category" selected={sel()} onChange={setSel} options={facets} />`,
  },
  {
    id: 'multi-select',
    title: 'MultiSelect',
    group: 'Forms',
    blurb: 'Multi-select dropdown with search and removable chips.',
    demo: () => {
      const [val, setVal] = createSignal<string[]>(['solid', 'vite'])
      return (
        <div class="max-w-xs">
          <UI.MultiSelect
            value={val()}
            onChange={setVal}
            placeholder="Pick your stack"
            options={[
              { value: 'solid', label: 'SolidJS' },
              { value: 'vite', label: 'Vite' },
              { value: 'ts', label: 'TypeScript' },
              { value: 'tailwind', label: 'Tailwind CSS' },
              { value: 'kobalte', label: 'Kobalte' },
            ]}
          />
        </div>
      )
    },
    code: `const [val, setVal] = createSignal<string[]>([])
<MultiSelect value={val()} onChange={setVal} options={options} />`,
  },
  {
    id: 'file-upload',
    title: 'FileUpload',
    group: 'Forms',
    blurb: 'Drag-and-drop uploader with per-file progress, error/retry and remove.',
    demo: () => {
      const [files, setFiles] = createSignal<UI.UploadFile[]>([
        { id: '1', name: 'contract.pdf', size: 1_400_000, progress: 100, status: 'done' },
        { id: '2', name: 'cover-photo.jpg', size: 3_200_000, progress: 62, status: 'uploading' },
        { id: '3', name: 'export.csv', size: 240_000, progress: 0, status: 'error', error: 'Upload failed' },
      ])
      return (
        <div class="w-full max-w-md">
          <UI.FileUpload
            files={files()}
            onAdd={() => {}}
            onRemove={(id) => setFiles(files().filter((f) => f.id !== id))}
            onRetry={() => {}}
          />
        </div>
      )
    },
    code: `<FileUpload files={files()} onAdd={upload} onRemove={remove} onRetry={retry} />`,
  },
  {
    id: 'sparkline',
    title: 'Sparkline',
    group: 'Charts',
    blurb: 'Tiny inline trend line (SVG, theme-tinted).',
    demo: () => (
      <div class="flex items-center gap-6">
        <Charts.Sparkline data={[4, 8, 5, 9, 7, 12, 10, 14, 11, 16]} width={160} height={40} area />
        <Charts.Sparkline
          data={[16, 11, 13, 9, 10, 6, 8, 5, 7, 3]}
          width={160}
          height={40}
          tone="destructive"
        />
      </div>
    ),
    code: `<Sparkline data={[4, 8, 5, 9, 7, 12, 10, 14]} area />`,
  },
  {
    id: 'bar-chart',
    title: 'BarChart',
    group: 'Charts',
    blurb: 'Simple labelled vertical bars.',
    demo: () => (
      <div class="w-full max-w-md">
        <Charts.BarChart
          data={[
            { label: 'Mon', value: 12 },
            { label: 'Tue', value: 19 },
            { label: 'Wed', value: 8 },
            { label: 'Thu', value: 22 },
            { label: 'Fri', value: 16 },
            { label: 'Sat', value: 6 },
            { label: 'Sun', value: 10 },
          ]}
        />
      </div>
    ),
    code: `<BarChart data={[{ label: 'Mon', value: 12 }, …]} />`,
  },
  {
    id: 'donut-chart',
    title: 'DonutChart',
    group: 'Charts',
    blurb: 'SVG donut with theme-tinted segments and a center total.',
    demo: () => (
      <Charts.DonutChart
        data={[
          { label: 'Direct', value: 42, tone: 'primary' },
          { label: 'Social', value: 28, tone: 'accent' },
          { label: 'Referral', value: 18, tone: 'emit' },
          { label: 'Other', value: 12, tone: 'received' },
        ]}
      />
    ),
    code: `<DonutChart data={[{ label: 'Direct', value: 42, tone: 'primary' }, …]} />`,
  },
  {
    id: 'dropzone',
    title: 'Dropzone',
    group: 'Forms',
    blurb: 'Drag-and-drop area (or click to choose). Hands File[] to onFiles; you control the upload.',
    controls: {
      hint: { type: 'text', label: 'hint', default: 'XML or PDF, up to 10 MB' },
      disabled: { type: 'boolean', label: 'disabled', default: false },
    },
    demo: (c) => (
      <div class="w-full max-w-md">
        <UI.Dropzone
          multiple
          accept=".xml,.pdf"
          hint={c.hint as string}
          disabled={c.disabled as boolean}
          onFiles={(files) => UI.toast.success(`${files.length} file(s) selected`)}
        />
      </div>
    ),
    code: (c) => `<Dropzone
  multiple
  accept=".xml,.pdf"
  hint="${c.hint}"${c.disabled ? '\n  disabled' : ''}
  onFiles={(files) => upload(files)}
/>`,
  },

  // ---- Data -----------------------------------------------------------------
  {
    id: 'badge',
    title: 'Badge',
    group: 'Data',
    blurb: 'Status pill with 5 semantic tones. `pulse` adds a pinging dot for "live" states.',
    controls: {
      tone: {
        type: 'select',
        label: 'tone',
        options: ['neutral', 'success', 'warning', 'danger', 'info'],
        default: 'success',
      },
      text: { type: 'text', label: 'text', default: 'paid' },
      pulse: { type: 'boolean', label: 'pulse', default: false },
    },
    demo: (c) => (
      <UI.Badge tone={c.tone as UI.BadgeTone} pulse={c.pulse as boolean}>
        {c.text as string}
      </UI.Badge>
    ),
    code: (c) =>
      `<Badge tone="${c.tone}"${c.pulse ? ' pulse' : ''}>${c.text}</Badge>${
        c.pulse
          ? '\n\n// pulse = pinging dot for live/recording/online states (CSS, reduced-motion aware)'
          : ''
      }`,
  },
  {
    id: 'card',
    title: 'Card',
    group: 'Data',
    blurb:
      'Container surface with sub-parts (Header/Title/Content). With glass, a frosted surface + glow. `tilt` and `spotlight` bake in the cursor interactions from the Motion category — hover the card with them on ↓',
    controls: {
      glass: { type: 'boolean', label: 'glass', default: true },
      glow: { type: 'boolean', label: 'glow', default: true },
      tilt: { type: 'boolean', label: 'tilt', default: true },
      spotlight: { type: 'boolean', label: 'spotlight', default: true },
    },
    demo: (c) => (
      <UI.Card
        glass={c.glass as boolean}
        glow={c.glow as boolean}
        tilt={c.tilt as boolean}
        spotlight={c.spotlight as boolean}
        class="w-full max-w-sm"
      >
        <UI.CardHeader>
          <UI.CardTitle>Invoice #A4-1024</UI.CardTitle>
        </UI.CardHeader>
        <UI.CardContent class="text-sm text-muted-foreground">
          Issued Jul 12, 2026 · Total $12,400 MXN.
        </UI.CardContent>
      </UI.Card>
    ),
    code: (
      c,
    ) => `<Card${c.glass ? ' glass' : ''}${c.glow ? ' glow' : ' glow={false}'}${c.tilt ? ' tilt' : ''}${
      c.spotlight ? ' spotlight' : ''
    }>
  <CardHeader>
    <CardTitle>Invoice #A4-1024</CardTitle>
  </CardHeader>
  <CardContent>Issued Jul 12, 2026 · Total $12,400 MXN.</CardContent>
</Card>${c.tilt || c.spotlight ? '\n\n// tilt = 3D hover tilt · spotlight = cursor-following glow (engine-free, reduced-motion aware)' : ''}`,
  },
  {
    id: 'table',
    title: 'Table',
    group: 'Data',
    blurb: 'Table primitives (Table + Head/Body/Row/HeadCell/Cell). For long lists, virtualize.',
    demo: () => (
      <UI.Table>
        <UI.TableHead>
          <UI.TableRow>
            <UI.TableHeadCell>Product</UI.TableHeadCell>
            <UI.TableHeadCell>Stock</UI.TableHeadCell>
          </UI.TableRow>
        </UI.TableHead>
        <UI.TableBody>
          <UI.TableRow>
            <UI.TableCell>Sensor A4</UI.TableCell>
            <UI.TableCell>128</UI.TableCell>
          </UI.TableRow>
          <UI.TableRow>
            <UI.TableCell>Module X</UI.TableCell>
            <UI.TableCell>42</UI.TableCell>
          </UI.TableRow>
        </UI.TableBody>
      </UI.Table>
    ),
    code: `<Table>
  <TableHead>
    <TableRow>
      <TableHeadCell>Product</TableHeadCell>
      <TableHeadCell>Stock</TableHeadCell>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>Sensor A4</TableCell>
      <TableCell>128</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
  },
  {
    id: 'virtual-list',
    title: 'VirtualList',
    group: 'Data',
    blurb: 'Virtualized list: only the visible rows live in the DOM. Requires a fixed height in class.',
    controls: {
      rows: { type: 'number', label: 'rows', default: 1000, min: 0, max: 100000 },
    },
    demo: (c) => (
      <UI.VirtualList
        each={Array.from({ length: c.rows as number }, (_, i) => i)}
        estimateSize={36}
        class="h-[200px] w-full rounded-md border border-border"
      >
        {(i) => (
          <div class="flex h-9 items-center border-b border-border px-3 text-sm text-foreground">
            Row {i + 1}
          </div>
        )}
      </UI.VirtualList>
    ),
    code: (c) => `<VirtualList
  each={records()} {/* ${c.rows} rows */}
  estimateSize={36}
  class="h-[65vh] w-full"
>
  {(record) => <RecordRow record={record} />}
</VirtualList>`,
  },
  {
    id: 'pagination',
    title: 'Pagination',
    group: 'Data',
    blurb: 'Previous/next pager with "Page X of Y" and an optional summary on the left.',
    controls: {
      totalPages: { type: 'number', label: 'totalPages', default: 8, min: 1, max: 100 },
    },
    demo: (c) => {
      const [page, setPage] = createSignal(1)
      return (
        <div class="w-full max-w-md rounded-md border border-border">
          <UI.Pagination
            page={page()}
            totalPages={c.totalPages as number}
            onChange={setPage}
            summary={<span>1,234 records</span>}
          />
        </div>
      )
    },
    code: (c) => `const [page, setPage] = createSignal(1)
<Pagination
  page={page()}
  totalPages={${c.totalPages}}
  onChange={setPage}
  summary={<span>1,234 records</span>}
/>`,
  },
  {
    id: 'avatar',
    title: 'Avatar',
    group: 'Data',
    blurb: 'User avatar (Kobalte Image): shows the image or, if it fails, the initials.',
    controls: {
      fallback: { type: 'text', label: 'fallback', default: 'LR' },
      src: { type: 'text', label: 'src', default: '' },
    },
    demo: (c) => (
      <div class="flex items-center gap-3">
        <UI.Avatar src={(c.src as string) || undefined} fallback={c.fallback as string} />
      </div>
    ),
    code: (c) =>
      c.src
        ? `<Avatar src="${c.src}" alt="User" fallback="${c.fallback}" />`
        : `<Avatar fallback="${c.fallback}" />`,
    variants: [
      {
        label: 'With image',
        demo: () => <UI.Avatar src="https://picsum.photos/seed/a4ui-avatar/80/80" fallback="JD" />,
      },
      { label: 'Initials fallback', demo: () => <UI.Avatar fallback="AR" /> },
      { label: 'Larger size', demo: () => <UI.Avatar fallback="MK" class="h-14 w-14 text-base" /> },
    ],
  },
  {
    id: 'progress',
    title: 'Progress',
    group: 'Data',
    blurb: 'Determinate progress bar (Kobalte Progress), with an optional label and value.',
    controls: {
      value: { type: 'number', label: 'value', default: 64, min: 0, max: 100 },
      label: { type: 'text', label: 'label', default: 'Uploading files' },
    },
    demo: (c) => (
      <div class="w-64">
        <UI.Progress value={c.value as number} label={c.label as string} />
      </div>
    ),
    code: (c) => `<Progress value={${c.value}} label="${c.label}" />`,
    variants: [
      { label: 'Just started', demo: () => <UI.Progress value={0} label="Uploading files" /> },
      { label: 'Halfway', demo: () => <UI.Progress value={40} label="Uploading files" /> },
      { label: 'Complete', demo: () => <UI.Progress value={100} label="Uploading files" /> },
    ],
  },
  {
    id: 'meter',
    title: 'Meter',
    group: 'Data',
    blurb: 'Static gauge for a measurement (Kobalte Meter) — e.g. disk usage or quota.',
    controls: {
      value: { type: 'number', label: 'value', default: 38, min: 0, max: 50 },
      label: { type: 'text', label: 'label', default: 'Storage' },
    },
    demo: (c) => (
      <div class="w-64">
        <UI.Meter value={c.value as number} max={50} label={c.label as string} />
      </div>
    ),
    code: (c) => `<Meter value={${c.value}} max={50} label="${c.label}" />`,
    variants: [
      { label: 'Low usage', demo: () => <UI.Meter value={8} max={50} label="Storage" /> },
      { label: 'Near limit', demo: () => <UI.Meter value={46} max={50} label="Storage" /> },
      { label: 'Different scale', demo: () => <UI.Meter value={180} max={200} label="API calls" /> },
    ],
  },
  {
    id: 'separator',
    title: 'Separator',
    group: 'Data',
    blurb: 'Horizontal or vertical visual/semantic divider (Kobalte Separator).',
    controls: {
      orientation: {
        type: 'select',
        label: 'orientation',
        options: ['horizontal', 'vertical'],
        default: 'horizontal',
      },
    },
    demo: (c) =>
      c.orientation === 'vertical' ? (
        <div class="flex h-16 items-center gap-4 text-sm text-foreground">
          <span>Left</span>
          <UI.Separator orientation="vertical" />
          <span>Right</span>
        </div>
      ) : (
        <div class="w-full max-w-xs space-y-3 text-sm text-foreground">
          <p>Top section</p>
          <UI.Separator orientation="horizontal" />
          <p>Bottom section</p>
        </div>
      ),
    code: (c) => `<Separator orientation="${c.orientation}" />`,
    variants: [
      {
        label: 'Both orientations together',
        demo: () => (
          <div class="flex items-center gap-4 text-sm text-foreground">
            <div class="w-32 space-y-3">
              <p>Above</p>
              <UI.Separator orientation="horizontal" />
              <p>Below</p>
            </div>
            <UI.Separator orientation="vertical" class="h-12" />
            <span>Aside</span>
          </div>
        ),
      },
      {
        label: 'Between toolbar buttons',
        demo: () => (
          <div class="flex items-center gap-2 rounded-md border border-border p-2 text-sm text-foreground">
            <span>Bold</span>
            <UI.Separator orientation="vertical" class="h-4" />
            <span>Italic</span>
            <UI.Separator orientation="vertical" class="h-4" />
            <span>Underline</span>
          </div>
        ),
      },
    ],
  },
  {
    id: 'skeleton',
    title: 'Skeleton',
    group: 'Data',
    blurb:
      'Placeholder while content loads. Set the size with class. `shimmer` sweeps a light band instead of pulsing.',
    controls: {
      shimmer: { type: 'boolean', label: 'shimmer', default: false },
    },
    demo: (c) => (
      <div class="w-full max-w-sm space-y-2">
        <UI.Skeleton shimmer={c.shimmer as boolean} class="h-4 w-3/4" />
        <UI.Skeleton shimmer={c.shimmer as boolean} class="h-4 w-1/2" />
        <UI.Skeleton shimmer={c.shimmer as boolean} class="h-24 w-full" />
      </div>
    ),
    code: (c) => `<Skeleton${c.shimmer ? ' shimmer' : ''} class="h-4 w-3/4" />
<Skeleton${c.shimmer ? ' shimmer' : ''} class="h-24 w-full" />${
      c.shimmer ? '\n\n// shimmer = sweeping light band (CSS, token-tinted) instead of the default pulse' : ''
    }`,
  },

  // ---- Overlays -------------------------------------------------------------
  {
    id: 'modal',
    title: 'Modal',
    group: 'Overlays',
    blurb: 'Dialog (Kobalte). variant="center" for short confirmations; "drawer" (default) for forms.',
    controls: {
      variant: { type: 'select', label: 'variant', options: ['drawer', 'center'], default: 'center' },
      title: { type: 'text', label: 'title', default: 'Confirm action' },
    },
    demo: (c) => {
      const [open, setOpen] = createSignal(false)
      return (
        <>
          <UI.Button onClick={() => setOpen(true)}>Open modal</UI.Button>
          <UI.Modal
            open={open()}
            onOpenChange={setOpen}
            variant={c.variant as 'drawer' | 'center'}
            title={c.title as string}
          >
            <p class="text-sm text-muted-foreground">Do you want to continue with this action?</p>
            <div class="mt-4 flex justify-end gap-2">
              <UI.Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </UI.Button>
              <UI.Button onClick={() => setOpen(false)}>Confirm</UI.Button>
            </div>
          </UI.Modal>
        </>
      )
    },
    code: (c) => `const [open, setOpen] = createSignal(false)
<Button onClick={() => setOpen(true)}>Open</Button>
<Modal open={open()} onOpenChange={setOpen} variant="${c.variant}" title="${c.title}">
  <p>Do you want to continue?</p>
</Modal>`,
  },
  {
    id: 'drawer',
    title: 'Drawer',
    group: 'Overlays',
    blurb:
      'Sliding panel anchored to the right (Kobalte Dialog), with an optional fixed header (title/subtitle).',
    controls: {
      title: { type: 'text', label: 'title', default: 'Customer detail' },
      subtitle: { type: 'text', label: 'subtitle', default: 'Rivera S.A. de C.V.' },
    },
    demo: (c) => {
      const [open, setOpen] = createSignal(false)
      return (
        <>
          <UI.Button variant="outline" onClick={() => setOpen(true)}>
            Open panel
          </UI.Button>
          <UI.Drawer
            open={open()}
            onOpenChange={setOpen}
            title={c.title as string}
            subtitle={c.subtitle as string}
          >
            <div class="p-6 text-sm text-muted-foreground">Side panel content: a form, details, etc.</div>
          </UI.Drawer>
        </>
      )
    },
    code: (c) => `const [open, setOpen] = createSignal(false)
<Button onClick={() => setOpen(true)}>Open panel</Button>
<Drawer open={open()} onOpenChange={setOpen} title="${c.title}" subtitle="${c.subtitle}">
  <div class="p-6">…</div>
</Drawer>`,
  },
  {
    id: 'popover',
    title: 'Popover',
    group: 'Overlays',
    blurb: 'Floating panel shown on trigger click (Kobalte Popover).',
    demo: () => (
      <UI.Popover trigger={<UI.Button variant="outline">Open popover</UI.Button>}>
        <div class="w-48 text-sm">
          <p class="font-medium text-foreground">Floating panel</p>
          <p class="text-muted-foreground">Contextual content on click.</p>
        </div>
      </UI.Popover>
    ),
    code: `<Popover trigger={<Button variant="outline">Filters</Button>}>
  <div class="w-48">…content…</div>
</Popover>`,
  },
  {
    id: 'hover-card',
    title: 'HoverCard',
    group: 'Overlays',
    blurb: 'Floating panel that appears on hover over the trigger (Kobalte HoverCard).',
    demo: () => (
      <UI.HoverCard trigger={<UI.Button variant="ghost">@luis_rivera</UI.Button>}>
        <div class="w-56 text-sm">
          <p class="font-semibold text-foreground">Luis Alfredo Rivera</p>
          <p class="text-muted-foreground">Engineering · Sonora Precision</p>
        </div>
      </UI.HoverCard>
    ),
    code: `<HoverCard trigger={<a href="/u/luis">@luis_rivera</a>}>
  <ProfileSummary user={user} />
</HoverCard>`,
  },
  {
    id: 'alert-dialog',
    title: 'AlertDialog',
    group: 'Overlays',
    blurb: 'Centered confirmation dialog (Kobalte AlertDialog) for destructive actions.',
    controls: {
      title: { type: 'text', label: 'title', default: 'Delete account?' },
    },
    demo: (c) => {
      const [open, setOpen] = createSignal(false)
      return (
        <>
          <UI.Button variant="outline" onClick={() => setOpen(true)}>
            Delete account
          </UI.Button>
          <UI.AlertDialog open={open()} onOpenChange={setOpen} title={c.title as string}>
            This action is permanent and can't be undone.{' '}
            <UI.Button variant="ghost" class="mt-3" onClick={() => setOpen(false)}>
              Got it
            </UI.Button>
          </UI.AlertDialog>
        </>
      )
    },
    code: (c) => `const [open, setOpen] = createSignal(false)
<Button onClick={() => setOpen(true)}>Delete account</Button>
<AlertDialog open={open()} onOpenChange={setOpen} title="${c.title}">
  This action is permanent and can't be undone.
</AlertDialog>`,
  },

  // ---- Feedback -------------------------------------------------------------
  {
    id: 'toast',
    title: 'Toast',
    group: 'Feedback',
    blurb:
      'Imperative notifications: call toast.success/error/info from anywhere. The Toaster is already mounted.',
    demo: () => (
      <div class="flex flex-wrap gap-2">
        <UI.Button onClick={() => UI.toast.success('Saved', 'Your changes were saved.')}>Success</UI.Button>
        <UI.Button variant="outline" onClick={() => UI.toast.error('Failed to save')}>
          Error
        </UI.Button>
        <UI.Button variant="ghost" onClick={() => UI.toast.info('Syncing…')}>
          Info
        </UI.Button>
      </div>
    ),
    code: `// just once, near the root:
<Toaster />

// from anywhere:
toast.success('Saved', 'Your changes were saved.')
toast.error('Failed to save')`,
  },
  {
    id: 'spinner',
    title: 'Spinner',
    group: 'Feedback',
    blurb: 'Spinning loading indicator with role="status" and an accessible label.',
    demo: () => (
      <div class="flex items-center gap-4">
        <UI.Spinner />
        <UI.Spinner class="h-8 w-8 text-primary" label="Processing" />
      </div>
    ),
    code: `<Spinner />
<Spinner class="h-8 w-8 text-primary" label="Processing" />`,
    variants: [
      { label: 'Small', demo: () => <UI.Spinner class="h-3 w-3" /> },
      { label: 'Large, tinted', demo: () => <UI.Spinner class="h-10 w-10 text-primary" /> },
      { label: 'Custom label', demo: () => <UI.Spinner label="Saving" /> },
    ],
  },

  // ---- Navigation -----------------------------------------------------------
  {
    id: 'tabs',
    title: 'Tabs',
    group: 'Navigation',
    blurb: 'Accessible tabs (Kobalte) with an animated indicator. Controlled by value/onChange.',
    demo: () => {
      const [tab, setTab] = createSignal('general')
      return (
        <div class="w-full max-w-md">
          <UI.Tabs
            value={tab()}
            onChange={setTab}
            items={[
              {
                value: 'general',
                label: 'General',
                content: <p class="text-sm text-muted-foreground">General settings.</p>,
              },
              {
                value: 'security',
                label: 'Security',
                content: <p class="text-sm text-muted-foreground">Password and access.</p>,
              },
              {
                value: 'billing',
                label: 'Billing',
                content: <p class="text-sm text-muted-foreground">Payment methods.</p>,
              },
            ]}
          />
        </div>
      )
    },
    code: `const [tab, setTab] = createSignal('general')
<Tabs
  value={tab()}
  onChange={setTab}
  items={[
    { value: 'general', label: 'General', content: <GeneralSettings /> },
    { value: 'security', label: 'Security', content: <SecuritySettings /> },
  ]}
/>`,
  },
  {
    id: 'accordion',
    title: 'Accordion',
    group: 'Navigation',
    blurb:
      'Accessible accordion (Kobalte) with animated open/close height. multiple lets several sections be open at once.',
    demo: () => (
      <div class="w-full max-w-md">
        <UI.Accordion
          items={[
            { value: 'shipping', title: 'How long does shipping take?', content: '3 to 5 business days.' },
            {
              value: 'payment',
              title: 'Which payment methods do you accept?',
              content: 'Card, bank transfer, and OXXO.',
            },
            { value: 'warranty', title: 'Is there a warranty?', content: '12 months on all equipment.' },
          ]}
        />
      </div>
    ),
    code: `<Accordion
  items={[
    { value: 'shipping', title: 'How long does shipping take?', content: '3 to 5 business days.' },
    { value: 'payment', title: 'Which payment methods do you accept?', content: 'Card and bank transfer.' },
  ]}
/>`,
  },
  {
    id: 'breadcrumb',
    title: 'Breadcrumb',
    group: 'Navigation',
    blurb: 'Navigation trail (Kobalte Breadcrumbs). The last item is the current page.',
    demo: () => (
      <UI.Breadcrumb
        items={[{ label: 'Home', href: '#' }, { label: 'Customers', href: '#' }, { label: 'Rivera S.A.' }]}
      />
    ),
    code: `<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Customers', href: '/customers' },
    { label: 'Rivera S.A.' },
  ]}
/>`,
  },
  {
    id: 'page-header',
    title: 'PageHeader',
    group: 'Navigation',
    blurb: 'Consistent page header: optional breadcrumb, title, subtitle, and an actions slot on the right.',
    controls: {
      title: { type: 'text', label: 'title', default: 'Rivera S.A. de C.V.' },
      subtitle: { type: 'text', label: 'subtitle', default: 'Customer since 2019 · 42 invoices' },
    },
    demo: (c) => (
      <div class="w-full">
        <UI.PageHeader
          breadcrumb={['Customers', 'Rivera S.A.']}
          title={c.title as string}
          subtitle={c.subtitle as string}
          actions={<UI.Button>New invoice</UI.Button>}
        />
      </div>
    ),
    code: (c) => `<PageHeader
  breadcrumb={['Customers', 'Rivera S.A.']}
  title="${c.title}"
  subtitle="${c.subtitle}"
  actions={<Button>New invoice</Button>}
/>`,
  },

  // ---- Layout ---------------------------------------------------------------
  {
    id: 'app-shell',
    title: 'AppShell',
    group: 'Layout',
    blurb:
      'Slot-based app structure: space background (z-0), sidebar, topbar, banner, and a <main> with a cross-fade between routes.',
    demo: () => (
      <p class="text-sm text-muted-foreground">
        AppShell wraps the ENTIRE app (background + sidebar + topbar + routes), so it isn't shown live here —
        it would nest a second shell. See the code for real usage.
      </p>
    ),
    code: `import { AppShell } from '@a4ui/core'

<AppShell
  sidebar={<MySidebar />}
  topbar={<MyTopbar />}
  banner={<DemoBanner />}
>
  <Routes>…</Routes>
</AppShell>`,
  },
  {
    id: 'space-background',
    title: 'SpaceBackground',
    group: 'Layout',
    blurb:
      'The "space glass" background: a fixed layer (z-0) with stars, nebula, planets, and shooting stars. Respects reduced-motion.',
    demo: () => (
      <p class="text-sm text-muted-foreground">
        SpaceBackground is a fixed full-screen layer (already active behind this page thanks to the catalog
        itself). It isn't rendered live here so it doesn't stack a second background. Usage in the code.
      </p>
    ),
    code: `import { SpaceBackground } from '@a4ui/core'

// AppShell usually adds it for you; to use it standalone:
<div class="relative min-h-screen">
  <SpaceBackground />
  <div class="relative z-10">…content…</div>
</div>`,
  },
  {
    id: 'theme-toggle',
    title: 'ThemeToggle',
    group: 'Layout',
    blurb: 'Button that toggles light/dark theme. The icon shows the CURRENT theme (🌙 dark, ☀️ light).',
    demo: () => <UI.ThemeToggle />,
    code: `import { ThemeToggle } from '@a4ui/core'

<ThemeToggle />`,
  },
  {
    id: 'effects-toggle',
    title: 'EffectsToggle',
    group: 'Layout',
    blurb:
      'Turns visual effects on/off (glass + starfield + animations). Off = calm mode, opaque and motionless.',
    demo: () => <UI.EffectsToggle />,
    code: `import { EffectsToggle } from '@a4ui/core'

<EffectsToggle />`,
  },
  {
    id: 'section',
    title: 'Section',
    group: 'Layout',
    blurb:
      'Centered content container — max width (size) + vertical rhythm (py) + optional id anchor. The layout wrapper every page repeats.',
    demo: () => (
      <div class="w-full">
        <UI.Section size="md" py="sm" class="rounded-lg border border-dashed border-border text-center">
          <p class="text-sm text-muted-foreground">Centered, max-w-md, py-sm</p>
        </UI.Section>
      </div>
    ),
    code: `<Section id="services" size="6xl" py="lg">
  <h2>Servicios</h2>
</Section>

// full-bleed band + centered content:
<div class="bg-muted/30">
  <Section size="4xl" py="md">…</Section>
</div>`,
  },
  {
    id: 'aurora',
    title: 'Aurora',
    group: 'Layout',
    blurb:
      'Ambient theme-tinted blurred-blob backdrop so glass surfaces read as glass. Fixed behind the page; keep the root transparent. The no-starfield alternative to SpaceBackground.',
    // Illustration: a `relative` box mimics the real (fixed) Aurora so it stays
    // inside the demo — the code shows the real usage.
    demo: () => (
      <div class="relative h-64 w-full overflow-hidden rounded-xl border border-border bg-background">
        <div class="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            class="absolute -left-16 -top-16 h-64 w-64 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.45), transparent 70%)' }}
          />
          <div
            class="absolute -right-12 top-1/4 h-56 w-56 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.4), transparent 70%)' }}
          />
        </div>
        <div class="relative grid h-full place-items-center p-6">
          <UI.Card glass class="max-w-xs p-6 text-center">
            <p class="font-medium text-foreground">Superficie glass</p>
            <p class="mt-1 text-sm text-muted-foreground">
              El color del aurora se ve a través del frosted blur.
            </p>
          </UI.Card>
        </div>
      </div>
    ),
    code: `// at the top of your layout — root must NOT set its own bg:
<div class="relative min-h-screen text-foreground">
  <Aurora />
  <YourPage />   {/* glass cards now read over the tinted backdrop */}
</div>

<Aurora intensity={0.6} animated />   // stronger + slow drift`,
    variants: [
      {
        label: 'variant="blobs" (default)',
        demo: () => (
          <div class="relative h-40 w-full overflow-hidden rounded-xl border border-border bg-background">
            <div
              class="absolute -left-10 -top-10 h-40 w-40 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.5), transparent 70%)' }}
            />
            <div
              class="absolute -right-8 top-1/3 h-36 w-36 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.45), transparent 70%)' }}
            />
          </div>
        ),
      },
      {
        label: 'variant="mesh"',
        demo: () => (
          <div
            class="h-40 w-full overflow-hidden rounded-xl border border-border blur-[1px]"
            style={{
              background:
                'radial-gradient(45% 45% at 18% 22%, hsl(var(--primary) / 0.5), transparent 70%), radial-gradient(45% 45% at 82% 26%, hsl(var(--accent) / 0.45), transparent 70%), radial-gradient(45% 45% at 72% 82%, hsl(var(--primary) / 0.4), transparent 70%), radial-gradient(45% 45% at 14% 78%, hsl(var(--accent) / 0.45), transparent 70%)',
            }}
          />
        ),
      },
    ],
  },
  {
    id: 'pricing-table',
    title: 'PricingTable',
    group: 'Layout',
    blurb: 'Tiered pricing cards with a highlighted "Popular" tier and an optional monthly/annual toggle.',
    demo: () => (
      <UI.PricingTable
        tiers={[
          {
            name: 'Free',
            price: '$0',
            priceAnnual: '$0',
            features: ['1 project', 'Community support'],
            cta: { label: 'Start' },
          },
          {
            name: 'Pro',
            price: '$12/mo',
            priceAnnual: '$120/yr',
            features: ['Unlimited projects', 'Priority support', 'Analytics'],
            highlighted: true,
            cta: { label: 'Upgrade' },
          },
          {
            name: 'Team',
            price: '$29/mo',
            priceAnnual: '$290/yr',
            features: ['Everything in Pro', 'SSO', 'Roles'],
            cta: { label: 'Contact' },
          },
        ]}
      />
    ),
    code: `<PricingTable tiers={[
  { name: 'Free', price: '$0', priceAnnual: '$0', features: ['1 project'], cta: { label: 'Start' } },
  { name: 'Pro', price: '$12/mo', priceAnnual: '$120/yr', features: ['Unlimited'], highlighted: true, cta: { label: 'Upgrade', href: '/signup' } },
]} />`,
  },
  {
    id: 'before-after',
    title: 'BeforeAfter',
    group: 'Data',
    blurb:
      'Draggable before/after image comparison slider — keyboard-accessible, reduced-motion aware, engine-free.',
    demo: () => (
      <div class="w-full max-w-lg">
        <UI.BeforeAfter
          before="https://picsum.photos/seed/a4ui-before/800/450?grayscale"
          after="https://picsum.photos/seed/a4ui-before/800/450"
          alt="Ejemplo antes/después"
          labels={['Antes', 'Después']}
          class="aspect-video"
        />
      </div>
    ),
    code: `<BeforeAfter before="/antes.jpg" after="/despues.jpg" alt="Resultado" labels={['Antes','Después']} />`,
  },
  {
    id: 'configurator',
    title: 'Configurator',
    group: 'Data',
    blurb:
      'Data-driven "pick options → live preview + running total" builder (select / counter / text groups). Distilled from the templates\' engraving customizer and board builder.',
    demo: () => {
      const [cfg, setCfg] = createSignal<UI.ConfiguratorState>({
        producto: 'termo',
        color: 'plata',
        texto: 'Familia',
      })
      return (
        <div class="w-full">
          <UI.Configurator
            value={cfg()}
            onChange={setCfg}
            formatTotal={(n) => `$${n} MXN`}
            groups={[
              {
                type: 'select',
                name: 'producto',
                label: 'Producto',
                options: [
                  { value: 'termo', label: 'Termo acero', price: 450 },
                  { value: 'placa', label: 'Placa de madera', price: 320 },
                ],
              },
              {
                type: 'select',
                name: 'color',
                label: 'Acabado',
                options: [
                  { value: 'plata', label: 'Plata' },
                  { value: 'negro', label: 'Negro', price: 40 },
                ],
              },
              {
                type: 'text',
                name: 'texto',
                label: 'Texto a grabar',
                placeholder: 'Tu texto…',
                maxLength: 20,
              },
            ]}
            action={{ label: 'Solicitar diseño' }}
            preview={(state) => (
              <div class="grid aspect-square place-items-center rounded-xl border border-border bg-muted/40 p-6 text-center">
                <div>
                  <p class="text-xs uppercase tracking-wide text-muted-foreground">
                    {(state.producto as string) === 'placa' ? 'Placa' : 'Termo'} · {state.color as string}
                  </p>
                  <p class="mt-2 text-2xl font-semibold text-foreground">
                    {(state.texto as string) || 'Tu texto'}
                  </p>
                  <p class="mt-1 text-xs text-muted-foreground">grabado láser</p>
                </div>
              </div>
            )}
          />
        </div>
      )
    },
    code: `const [cfg, setCfg] = createSignal<ConfiguratorState>({ producto: 'termo', texto: '' })
<Configurator
  value={cfg()} onChange={setCfg} formatTotal={(n) => \`$\${n} MXN\`}
  groups={[
    { type: 'select', name: 'producto', label: 'Producto', options: [
      { value: 'termo', label: 'Termo', price: 450 } ] },
    { type: 'counter', name: 'extras', label: 'Extras', items: [
      { id: 'caja', label: 'Caja de regalo', price: 60 } ] },
    { type: 'text', name: 'texto', label: 'Texto a grabar', maxLength: 20 },
  ]}
  action={{ label: 'Solicitar diseño', onClick: submit }}
  preview={(state, total) => <MyPreview state={state} total={total} />}
/>`,
  },
  {
    id: 'action-bar',
    title: 'ActionBar',
    group: 'Layout',
    blurb:
      'Sticky action/emergency bar: a status slot + a prominent CTA (renders as <a> for tel:/links). For urgent-service pages.',
    demo: () => (
      <div class="w-full overflow-hidden rounded-lg border border-border">
        <UI.ActionBar
          sticky={false}
          status={
            <UI.Badge tone="success" pulse>
              24/7
            </UI.Badge>
          }
          message="Servicio de emergencia"
          action={{ label: 'Llama ahora', href: 'tel:+525512345678' }}
        />
      </div>
    ),
    code: `<ActionBar
  sticky
  status={<Badge tone="success" pulse>24/7</Badge>}
  message="Servicio de emergencia"
  action={{ label: 'Llama ahora', href: 'tel:+525512345678' }}
/>`,
  },
  {
    id: 'nav-group',
    title: 'NavGroup',
    group: 'Layout',
    blurb:
      'Collapsible sidebar category (native <details>). Open by default; the chevron rotates when collapsed.',
    controls: {
      title: { type: 'text', label: 'title', default: 'Billing' },
    },
    demo: (c) => (
      <div class="w-56">
        <UI.NavGroup title={c.title as string}>
          <a
            href="#"
            class="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Invoices
          </a>
          <a
            href="#"
            class="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Payments
          </a>
          <a
            href="#"
            class="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Credit notes
          </a>
        </UI.NavGroup>
      </div>
    ),
    code: (c) => `<NavGroup title="${c.title}">
  <NavLink href="/invoices">Invoices</NavLink>
  <NavLink href="/payments">Payments</NavLink>
</NavGroup>`,
  },
  {
    id: 'carousel',
    title: 'Carousel',
    group: 'Data',
    blurb:
      'One slide at a time with arrows, clickable dots, arrow-key nav, drag/touch swipe, and optional autoplay (pauses on hover). Drag the slide ↓',
    controls: {
      swipe: { type: 'boolean', label: 'swipe', default: true },
    },
    demo: (c) => (
      <div class="w-full max-w-md">
        <UI.Carousel
          autoplayMs={3500}
          swipe={c.swipe as boolean}
          slides={[1, 2, 3].map((n) => (
            <div class="grid h-40 place-items-center bg-muted text-2xl font-bold text-foreground">
              Slide {n}
            </div>
          ))}
        />
      </div>
    ),
    code: (c) => `<Carousel
  autoplayMs={3500}${c.swipe ? '' : '\n  swipe={false}'}
  slides={[<Slide1 />, <Slide2 />, <Slide3 />]}
/>${c.swipe ? '\n\n// drag/touch to swipe between slides (CSS snap, no engine)' : ''}`,
  },
  {
    id: 'stepper',
    title: 'Stepper',
    group: 'Navigation',
    blurb: 'Progress across ordered steps — completed, active, and upcoming states. Horizontal or vertical.',
    demo: () => {
      const [active, setActive] = createSignal(1)
      return (
        <div class="w-full max-w-lg space-y-4">
          <UI.Stepper
            active={active()}
            onStepClick={setActive}
            steps={[
              { label: 'Account', description: 'Your details' },
              { label: 'Plan', description: 'Pick a tier' },
              { label: 'Payment', description: 'Add a card' },
              { label: 'Done' },
            ]}
          />
          <div class="flex gap-2">
            <UI.Button variant="outline" onClick={() => setActive((s) => Math.max(0, s - 1))}>
              Back
            </UI.Button>
            <UI.Button onClick={() => setActive((s) => Math.min(3, s + 1))}>Next</UI.Button>
          </div>
        </div>
      )
    },
    code: `const [active, setActive] = createSignal(1)
<Stepper active={active()} onStepClick={setActive} steps={[
  { label: 'Account', description: 'Your details' },
  { label: 'Plan', description: 'Pick a tier' },
  { label: 'Payment' },
]} />`,
  },
  {
    id: 'timeline',
    title: 'Timeline',
    group: 'Data',
    blurb: 'Vertical sequence of events with tinted dots, titles, timestamps, and descriptions.',
    demo: () => (
      <div class="w-full max-w-md">
        <UI.Timeline
          items={[
            { title: 'Order placed', time: '09:24', tone: 'primary', description: 'Payment confirmed.' },
            { title: 'Packed', time: '11:02', tone: 'default' },
            { title: 'Shipped', time: '15:40', tone: 'success', description: 'Out for delivery.' },
            { title: 'Delayed', time: '—', tone: 'danger', description: 'Weather hold.' },
          ]}
        />
      </div>
    ),
    code: `<Timeline items={[
  { title: 'Order placed', time: '09:24', tone: 'primary' },
  { title: 'Shipped', time: '15:40', tone: 'success' },
]} />`,
    variants: [
      {
        label: 'All success',
        demo: () => (
          <div class="w-full max-w-md">
            <UI.Timeline
              items={[
                { title: 'Build passed', time: '08:10', tone: 'success' },
                { title: 'Tests passed', time: '08:14', tone: 'success' },
                { title: 'Deployed', time: '08:20', tone: 'success', description: 'v2.4.0 is live.' },
              ]}
            />
          </div>
        ),
      },
      {
        label: 'Compact, no descriptions',
        demo: () => (
          <div class="w-full max-w-md">
            <UI.Timeline
              items={[
                { title: 'Submitted', time: '10:00' },
                { title: 'Approved', time: '10:42', tone: 'primary' },
              ]}
            />
          </div>
        ),
      },
      {
        label: 'Single failure',
        demo: () => (
          <div class="w-full max-w-md">
            <UI.Timeline
              items={[
                { title: 'Payment attempted', time: '13:05', tone: 'danger', description: 'Card declined.' },
              ]}
            />
          </div>
        ),
      },
    ],
  },
  {
    id: 'rating',
    title: 'Rating',
    group: 'Forms',
    blurb:
      'Star rating with hover preview, click-to-set, and keyboard support. Set readonly to just display.',
    controls: {
      readonly: { type: 'boolean', label: 'readonly', default: false },
    },
    demo: (c) => {
      const [value, setValue] = createSignal(3)
      return <UI.Rating value={value()} onChange={setValue} readonly={c.readonly as boolean} />
    },
    code: (c) => `const [value, setValue] = createSignal(3)
<Rating value={value()} onChange={setValue}${c.readonly ? ' readonly' : ''} />`,
    variants: [
      { label: 'Fully filled', demo: () => <UI.Rating value={5} readonly /> },
      { label: 'Partial', demo: () => <UI.Rating value={2} readonly /> },
      { label: 'Out of 10', demo: () => <UI.Rating value={7} max={10} readonly /> },
    ],
  },
  {
    id: 'empty',
    title: 'Empty',
    group: 'Feedback',
    blurb: 'Placeholder for empty states — icon, title, description, and an optional action slot.',
    demo: () => (
      <UI.Empty
        title="No invoices yet"
        description="When you create your first invoice it'll show up here."
        action={<UI.Button>New invoice</UI.Button>}
      />
    ),
    code: `<Empty
  title="No invoices yet"
  description="When you create your first invoice it'll show up here."
  action={<Button>New invoice</Button>}
/>`,
    variants: [
      {
        label: 'No action',
        demo: () => (
          <UI.Empty title="No results found" description="Try adjusting your filters or search terms." />
        ),
      },
      {
        label: 'Title only',
        demo: () => <UI.Empty title="Inbox zero" />,
      },
      {
        label: 'Custom icon',
        demo: () => (
          <UI.Empty
            icon={<Search class="h-6 w-6" />}
            title="No matches"
            description="Nothing matched your search."
            action={<UI.Button variant="outline">Clear search</UI.Button>}
          />
        ),
      },
    ],
  },
  {
    id: 'calendar',
    title: 'Calendar',
    group: 'Forms',
    blurb: 'Full month grid — navigate months and pick a day. Selected day highlighted; today ringed.',
    demo: () => {
      const [d, setD] = createSignal<Date>(new Date())
      return (
        <div class="max-w-xs">
          <UI.Calendar value={d()} onChange={setD} />
        </div>
      )
    },
    code: `const [d, setD] = createSignal(new Date())
<Calendar value={d()} onChange={setD} />`,
  },
  {
    id: 'tree',
    title: 'Tree',
    group: 'Data',
    blurb: 'Hierarchical, expandable node tree with rotating chevrons and keyboard-friendly rows.',
    demo: () => (
      <div class="max-w-xs">
        <UI.Tree
          defaultExpanded={['src', 'ui']}
          nodes={[
            {
              id: 'src',
              label: 'src',
              children: [
                {
                  id: 'ui',
                  label: 'ui',
                  children: [
                    { id: 'button', label: 'Button.tsx' },
                    { id: 'card', label: 'Card.tsx' },
                  ],
                },
                { id: 'index', label: 'index.ts' },
              ],
            },
            { id: 'pkg', label: 'package.json' },
          ]}
        />
      </div>
    ),
    code: `<Tree defaultExpanded={['src']} nodes={[
  { id: 'src', label: 'src', children: [
    { id: 'index', label: 'index.ts' },
  ]},
  { id: 'pkg', label: 'package.json' },
]} />`,
  },
  {
    id: 'kbd',
    title: 'Kbd',
    group: 'Layout',
    blurb: 'Inline keyboard-key indicator for shortcuts.',
    demo: () => (
      <div class="flex items-center gap-1 text-sm text-muted-foreground">
        Press <UI.Kbd>⌘</UI.Kbd> <UI.Kbd>K</UI.Kbd> to search
      </div>
    ),
    code: `Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search`,
    variants: [
      {
        label: 'Save shortcut',
        demo: () => (
          <div class="flex items-center gap-1 text-sm text-muted-foreground">
            <UI.Kbd>Ctrl</UI.Kbd> <UI.Kbd>S</UI.Kbd> to save
          </div>
        ),
      },
      {
        label: 'Three-key chord',
        demo: () => (
          <div class="flex items-center gap-1 text-sm text-muted-foreground">
            <UI.Kbd>Ctrl</UI.Kbd> <UI.Kbd>Shift</UI.Kbd> <UI.Kbd>P</UI.Kbd>
          </div>
        ),
      },
      {
        label: 'Single key',
        demo: () => (
          <div class="flex items-center gap-1 text-sm text-muted-foreground">
            Press <UI.Kbd>Esc</UI.Kbd> to close
          </div>
        ),
      },
    ],
  },
  {
    id: 'avatar-group',
    title: 'AvatarGroup',
    group: 'Data',
    blurb: 'Overlapping stack of avatars with an overflow "+N" count.',
    demo: () => (
      <UI.AvatarGroup
        max={4}
        avatars={[
          { fallback: 'AR' },
          { fallback: 'TN' },
          { fallback: 'PA' },
          { fallback: 'LM' },
          { fallback: 'SR' },
          { fallback: 'JK' },
        ]}
      />
    ),
    code: `<AvatarGroup max={4} avatars={[
  { fallback: 'AR' }, { fallback: 'TN' }, { fallback: 'PA' },
  { fallback: 'LM' }, { fallback: 'SR' }, { fallback: 'JK' },
]} />`,
  },
  {
    id: 'descriptions',
    title: 'Descriptions',
    group: 'Data',
    blurb: 'Read-only key/value layout for record details, in 1–3 responsive columns.',
    demo: () => (
      <div class="w-full max-w-lg">
        <UI.Descriptions
          columns={2}
          items={[
            { label: 'Name', value: 'Luis Rivera' },
            { label: 'Email', value: 'luis@example.com' },
            { label: 'Role', value: <UI.Badge tone="info">Admin</UI.Badge> },
            { label: 'Status', value: 'Active' },
          ]}
        />
      </div>
    ),
    code: `<Descriptions columns={2} items={[
  { label: 'Name', value: 'Luis Rivera' },
  { label: 'Role', value: <Badge tone="info">Admin</Badge> },
]} />`,
  },
  {
    id: 'result',
    title: 'Result',
    group: 'Feedback',
    blurb: 'Full-status screen for success/error/404/500 outcomes, with an actions slot.',
    controls: {
      status: {
        type: 'select',
        label: 'status',
        options: ['success', 'error', 'info', 'warning', '404', '500'],
        default: 'success',
      },
    },
    demo: (c) => (
      <div class="w-full">
        <UI.Result
          status={c.status as UI.ResultStatus}
          title="Payment successful"
          description="Your order has been confirmed and is on its way."
          actions={<UI.Button>Continue</UI.Button>}
        />
      </div>
    ),
    code: (c) => `<Result
  status="${c.status}"
  title="Payment successful"
  description="Your order has been confirmed."
  actions={<Button>Continue</Button>}
/>`,
    variants: [
      {
        label: 'Error',
        demo: () => (
          <div class="w-full">
            <UI.Result
              status="error"
              title="Payment failed"
              description="Your card was declined. Try another payment method."
              actions={<UI.Button variant="outline">Try again</UI.Button>}
            />
          </div>
        ),
      },
      {
        label: '404',
        demo: () => (
          <div class="w-full">
            <UI.Result
              status="404"
              title="Page not found"
              description="The page you're looking for doesn't exist."
            />
          </div>
        ),
      },
      {
        label: '500',
        demo: () => (
          <div class="w-full">
            <UI.Result
              status="500"
              title="Something went wrong"
              description="Our servers had an issue. Please try again later."
            />
          </div>
        ),
      },
    ],
  },
  {
    id: 'splitter',
    title: 'Splitter',
    group: 'Layout',
    blurb: 'Two resizable panes with a draggable divider (keyboard-resizable too).',
    demo: () => (
      <div class="w-full">
        <UI.Splitter
          class="h-56 rounded-lg border border-border"
          start={<div class="p-4 text-sm text-muted-foreground">Drag the divider →</div>}
          end={<div class="p-4 text-sm text-muted-foreground">← Resize me</div>}
        />
      </div>
    ),
    code: `<Splitter
  start={<Sidebar />}
  end={<Content />}
/>`,
  },
  {
    id: 'command',
    title: 'Command',
    group: 'Overlays',
    blurb: 'Reusable ⌘K command palette — fuzzy filter, keyboard nav, grouped items.',
    demo: () => {
      const [open, setOpen] = createSignal(false)
      return (
        <>
          <UI.Button onClick={() => setOpen(true)}>Open command palette</UI.Button>
          <UI.Command
            open={open()}
            onOpenChange={setOpen}
            items={[
              { label: 'New file', hint: '⌘N', group: 'Actions', onSelect: () => {} },
              { label: 'Search', hint: '⌘K', group: 'Actions', onSelect: () => {} },
              { label: 'Open settings', group: 'App', onSelect: () => {} },
              { label: 'Toggle theme', group: 'App', onSelect: () => {} },
            ]}
          />
        </>
      )
    },
    code: `const [open, setOpen] = createSignal(false)
<Command open={open()} onOpenChange={setOpen} items={[
  { label: 'New file', hint: '⌘N', onSelect: createFile },
  { label: 'Search', hint: '⌘K', onSelect: openSearch },
]} />`,
  },
  {
    id: 'tag-input',
    title: 'TagInput',
    group: 'Forms',
    blurb: 'Multi-value text entry rendered as removable chips. Enter adds, Backspace removes the last.',
    demo: () => {
      const [tags, setTags] = createSignal(['solid', 'ui'])
      return (
        <div class="max-w-sm">
          <UI.TagInput value={tags()} onChange={setTags} placeholder="Add a tag…" />
        </div>
      )
    },
    code: `const [tags, setTags] = createSignal(['solid', 'ui'])
<TagInput value={tags()} onChange={setTags} placeholder="Add a tag…" />`,
  },
  {
    id: 'collapse',
    title: 'Collapse',
    group: 'Layout',
    blurb: 'A single expand/collapse region with a rotating chevron and animated height.',
    demo: () => {
      const [open, setOpen] = createSignal(true)
      return (
        <div class="w-full max-w-md rounded-lg border border-border">
          <UI.Collapse open={open()} onOpenChange={setOpen} title="Shipping details">
            Ships in 2–3 business days via your selected carrier.
          </UI.Collapse>
        </div>
      )
    },
    code: `const [open, setOpen] = createSignal(true)
<Collapse open={open()} onOpenChange={setOpen} title="Shipping details">
  Ships in 2–3 business days.
</Collapse>`,
  },
  {
    id: 'ring-progress',
    title: 'RingProgress',
    group: 'Feedback',
    blurb: 'Circular percentage progress ring.',
    demo: () => <UI.RingProgress value={68} />,
    code: `<RingProgress value={68} />`,
    variants: [
      { label: 'Low', demo: () => <UI.RingProgress value={24} /> },
      { label: 'Complete', demo: () => <UI.RingProgress value={100} /> },
      { label: 'Large, thicker', demo: () => <UI.RingProgress value={55} size={140} thickness={12} /> },
    ],
  },
  {
    id: 'back-to-top',
    title: 'BackToTop',
    group: 'Navigation',
    blurb: 'Floating button that appears after scrolling and returns to the top (bottom-right).',
    demo: () => (
      <div class="text-sm text-muted-foreground">
        Scroll the page down — a “back to top” button appears in the bottom-right corner.
        <UI.BackToTop threshold={40} />
      </div>
    ),
    code: `<BackToTop threshold={300} />`,
  },
  {
    id: 'fab',
    title: 'FloatingActionButton',
    group: 'Actions',
    blurb:
      'Prominent circular primary action pinned to a corner of the viewport. `ripple` adds a Material press ripple.',
    controls: {
      ripple: { type: 'boolean', label: 'ripple', default: true },
    },
    demo: (c) => (
      <div class="text-sm text-muted-foreground">
        A floating action button is pinned to the bottom-right corner →
        <UI.FloatingActionButton
          label="Compose"
          icon={<Plus class="h-6 w-6" />}
          ripple={c.ripple as boolean}
        />
      </div>
    ),
    code: (c) =>
      `<FloatingActionButton label="Compose" icon={<Plus />}${c.ripple ? ' ripple' : ''} />${
        c.ripple ? '\n\n// ripple = Material press ripple (engine-free, reduced-motion aware)' : ''
      }`,
    variants: [
      {
        label: 'Bottom-left',
        demo: () => (
          <div class="text-sm text-muted-foreground">
            Pinned to the bottom-left corner →
            <UI.FloatingActionButton
              label="New chat"
              icon={<Plus class="h-6 w-6" />}
              position="bottom-left"
            />
          </div>
        ),
      },
    ],
  },
  {
    id: 'anchor',
    title: 'Anchor',
    group: 'Navigation',
    blurb: 'Table-of-contents scroll-spy that highlights the section currently in view.',
    demo: () => (
      <UI.Anchor
        items={[
          { id: 'intro', label: 'Introduction' },
          { id: 'install', label: 'Installation' },
          { id: 'usage', label: 'Usage' },
        ]}
      />
    ),
    code: `<Anchor items={[
  { id: 'intro', label: 'Introduction' },
  { id: 'usage', label: 'Usage' },
]} />`,
  },
  {
    id: 'highlight',
    title: 'Highlight',
    group: 'Data',
    blurb: 'Highlights every match of a query within a string.',
    demo: () => (
      <div class="text-sm text-foreground">
        <UI.Highlight text="The quick brown fox jumps over the lazy dog" query="the" />
      </div>
    ),
    code: `<Highlight text="…the lazy dog" query="the" />`,
    variants: [
      {
        label: 'Different query',
        demo: () => (
          <div class="text-sm text-foreground">
            <UI.Highlight text="The quick brown fox jumps over the lazy dog" query="fox" />
          </div>
        ),
      },
      {
        label: 'Multiple matches',
        demo: () => (
          <div class="text-sm text-foreground">
            <UI.Highlight text="Sonora Precision Sonora Analytics" query="sonora" />
          </div>
        ),
      },
      {
        label: 'No match',
        demo: () => (
          <div class="text-sm text-foreground">
            <UI.Highlight text="The quick brown fox jumps over the lazy dog" query="xyz" />
          </div>
        ),
      },
    ],
  },
  {
    id: 'list',
    title: 'List',
    group: 'Data',
    blurb:
      'Structured list with avatar, title/description, meta, and actions per row. `stagger` cascades the rows in on mount.',
    controls: {
      stagger: { type: 'boolean', label: 'stagger', default: true },
    },
    demo: (c) => (
      <div class="w-full max-w-md">
        <UI.List
          stagger={c.stagger as boolean}
          items={[
            {
              title: 'Marina Vega',
              description: 'Product designer',
              meta: '2m ago',
              avatar: <UI.Avatar fallback="MV" />,
            },
            {
              title: 'Theo Nakamura',
              description: 'Engineer',
              meta: '1h ago',
              avatar: <UI.Avatar fallback="TN" />,
            },
            {
              title: 'Priya Anand',
              description: 'PM',
              meta: '3h ago',
              avatar: <UI.Avatar fallback="PA" />,
            },
          ]}
        />
      </div>
    ),
    code: (c) => `<List${c.stagger ? ' stagger' : ''} items={[
  { title: 'Marina Vega', description: 'Product designer', avatar: <Avatar fallback="MV" /> },
]} />${c.stagger ? '\n\n// stagger = rows cascade in on mount (CSS, reduced-motion aware)' : ''}`,
  },
  {
    id: 'countdown',
    title: 'Countdown',
    group: 'Data',
    blurb: 'Live countdown to a target date — days, hours, minutes, seconds.',
    demo: () => <UI.Countdown to={new Date(Date.now() + (3 * 24 * 60 + 15) * 60 * 1000)} />,
    code: `<Countdown to={new Date('2026-12-31T00:00:00')} />`,
    variants: [
      {
        label: 'Weeks away',
        demo: () => <UI.Countdown to={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} />,
      },
      {
        label: 'Minutes away',
        demo: () => <UI.Countdown to={new Date(Date.now() + 10 * 60 * 1000)} />,
      },
    ],
  },
  {
    id: 'clock',
    title: 'Clock',
    group: 'Data',
    blurb: 'Live clock — analog dial or digital readout, with an optional time zone.',
    demo: () => (
      <div class="flex flex-wrap items-center gap-8">
        <UI.Clock variant="analog" size={140} />
        <UI.Clock hour12 />
      </div>
    ),
    code: `<Clock variant="analog" size={140} />
<Clock hour12 />`,
  },
  {
    id: 'sortable',
    title: 'Sortable',
    group: 'Data',
    blurb: 'Drag rows by the grip handle to reorder them (pointer-based, touch-friendly).',
    demo: () => {
      const [rows, setRows] = createSignal([
        { id: 'a', label: 'Design review' },
        { id: 'b', label: 'Write the RFC' },
        { id: 'c', label: 'Ship the release' },
        { id: 'd', label: 'Update the changelog' },
      ])
      return (
        <div class="w-full max-w-sm">
          <UI.Sortable items={rows()} itemKey={(r) => r.id} onReorder={setRows}>
            {(row) => <span class="text-sm text-foreground">{row.label}</span>}
          </UI.Sortable>
        </div>
      )
    },
    code: `const [rows, setRows] = createSignal(items)
<Sortable items={rows()} itemKey={(r) => r.id} onReorder={setRows}>
  {(row) => <span>{row.label}</span>}
</Sortable>`,
  },
  {
    id: 'affix',
    title: 'Affix',
    group: 'Layout',
    blurb: 'Pins its content to the top of the viewport once you scroll past it.',
    demo: () => (
      <div class="text-sm text-muted-foreground">
        Wrap content in <code class="rounded bg-muted px-1 font-mono">&lt;Affix&gt;</code> to pin it while the
        page scrolls.
      </div>
    ),
    code: `<Affix offsetTop={80}>
  <Toolbar />
</Affix>`,
  },
  {
    id: 'transfer',
    title: 'Transfer',
    group: 'Forms',
    blurb: 'Dual-list picker — move items between an available and a selected column.',
    demo: () => {
      const [sel, setSel] = createSignal(['b'])
      return (
        <UI.Transfer
          selected={sel()}
          onChange={setSel}
          items={[
            { value: 'a', label: 'Apples' },
            { value: 'b', label: 'Bananas' },
            { value: 'c', label: 'Cherries' },
            { value: 'd', label: 'Dates' },
          ]}
        />
      )
    },
    code: `const [sel, setSel] = createSignal(['b'])
<Transfer selected={sel()} onChange={setSel} items={items} />`,
  },
  {
    id: 'image',
    title: 'Image',
    group: 'Data',
    blurb: 'Lazy image with a click-to-zoom lightbox. `blurUp` reveals it from blurred to sharp on load.',
    controls: {
      blurUp: { type: 'boolean', label: 'blurUp', default: true },
    },
    // Base-aware src so the asset resolves under a deployed subpath (e.g. /a4ui/).
    demo: (c) => (
      <UI.Image
        src={`${import.meta.env.BASE_URL}og.png`}
        alt="A4ui preview"
        blurUp={c.blurUp as boolean}
        class="h-32 w-56"
      />
    ),
    code: (c) =>
      `<Image src="/hero.png" alt="Hero"${c.blurUp ? ' blurUp' : ''} />${
        c.blurUp ? '\n\n// blurUp = blur-to-sharp reveal on load (CSS, reduced-motion aware)' : ''
      }`,
  },
  {
    id: 'speed-dial',
    title: 'SpeedDial',
    group: 'Actions',
    blurb:
      'A FAB that fans out into multiple quick actions. The main button carries a Material press ripple.',
    demo: () => (
      <div class="text-sm text-muted-foreground">
        Tap the + in the bottom-right corner to fan out actions →
        <UI.SpeedDial
          actions={[
            { icon: <Home class="h-5 w-5" />, label: 'Home', onClick: () => {} },
            { icon: <Search class="h-5 w-5" />, label: 'Search', onClick: () => {} },
          ]}
        />
      </div>
    ),
    code: `<SpeedDial actions={[
  { icon: <Home />, label: 'Home', onClick: goHome },
]} />`,
  },
  {
    id: 'bottom-navigation',
    title: 'BottomNavigation',
    group: 'Navigation',
    blurb: 'Mobile-style bottom bar for top-level navigation.',
    demo: () => {
      const [tab, setTab] = createSignal('home')
      return (
        <div class="w-full max-w-sm overflow-hidden rounded-lg border border-border">
          <UI.BottomNavigation
            value={tab()}
            onChange={setTab}
            items={[
              { value: 'home', label: 'Home', icon: <Home class="h-5 w-5" /> },
              { value: 'search', label: 'Search', icon: <Search class="h-5 w-5" /> },
              { value: 'me', label: 'Profile', icon: <User class="h-5 w-5" /> },
            ]}
          />
        </div>
      )
    },
    code: `const [tab, setTab] = createSignal('home')
<BottomNavigation value={tab()} onChange={setTab} items={items} />`,
  },
  {
    id: 'marquee',
    title: 'Marquee',
    group: 'Layout',
    blurb: 'Seamless infinite scroller — pauses on hover, respects reduced motion.',
    demo: () => (
      <UI.Marquee class="w-full">
        <span class="mx-6 text-sm text-muted-foreground">SolidJS</span>
        <span class="mx-6 text-sm text-muted-foreground">Kobalte</span>
        <span class="mx-6 text-sm text-muted-foreground">Tailwind</span>
        <span class="mx-6 text-sm text-muted-foreground">Spatial Glass</span>
      </UI.Marquee>
    ),
    code: `<Marquee>
  <Logo1 /> <Logo2 /> <Logo3 />
</Marquee>`,
  },
  {
    id: 'data-grid',
    title: 'DataGrid',
    group: 'Data',
    blurb: 'Sortable, filterable, paginated table — click a header to sort, type to filter.',
    demo: () => (
      <div class="w-full">
        <UI.DataGrid
          pageSize={5}
          columns={[
            { key: 'name', header: 'Name', sortable: true },
            { key: 'role', header: 'Role', sortable: true },
            { key: 'commits', header: 'Commits', sortable: true },
            {
              key: 'status',
              header: 'Status',
              render: (r) => (
                <UI.Badge tone={r.status === 'Active' ? 'success' : 'neutral'}>{String(r.status)}</UI.Badge>
              ),
            },
          ]}
          rows={[
            { name: 'Marina Vega', role: 'Designer', commits: 128, status: 'Active' },
            { name: 'Theo Nakamura', role: 'Engineer', commits: 342, status: 'Active' },
            { name: 'Priya Anand', role: 'PM', commits: 54, status: 'Away' },
            { name: 'Lucas Moreau', role: 'Engineer', commits: 201, status: 'Active' },
            { name: 'Sofia Rossi', role: 'Designer', commits: 89, status: 'Away' },
            { name: 'Jae Kim', role: 'Engineer', commits: 156, status: 'Active' },
            { name: 'Nadia Haddad', role: 'PM', commits: 47, status: 'Active' },
          ]}
        />
      </div>
    ),
    code: `<DataGrid pageSize={5}
  columns={[{ key: 'name', header: 'Name', sortable: true }, …]}
  rows={rows}
/>`,
  },
  {
    id: 'tree-select',
    title: 'TreeSelect',
    group: 'Forms',
    blurb: 'A select whose options come from an expandable tree; pick a leaf.',
    demo: () => {
      const [val, setVal] = createSignal<string>()
      return (
        <div class="max-w-xs">
          <UI.TreeSelect
            value={val()}
            onChange={(v) => setVal(v)}
            placeholder="Select a folder…"
            nodes={[
              {
                id: 'src',
                label: 'src',
                children: [
                  { id: 'ui', label: 'ui' },
                  { id: 'lib', label: 'lib' },
                ],
              },
              { id: 'docs', label: 'docs' },
            ]}
          />
        </div>
      )
    },
    code: `const [val, setVal] = createSignal<string>()
<TreeSelect value={val()} onChange={setVal} nodes={nodes} />`,
  },
  {
    id: 'cascader',
    title: 'Cascader',
    group: 'Forms',
    blurb: 'Cascading columns for hierarchical choices (e.g. country → state → city).',
    demo: () => {
      const [path, setPath] = createSignal<string[]>([])
      return (
        <UI.Cascader
          value={path()}
          onChange={(p) => setPath(p)}
          placeholder="Select a location…"
          options={[
            {
              value: 'mx',
              label: 'Mexico',
              children: [
                {
                  value: 'son',
                  label: 'Sonora',
                  children: [
                    { value: 'hmo', label: 'Hermosillo' },
                    { value: 'obr', label: 'Ciudad Obregón' },
                  ],
                },
                { value: 'jal', label: 'Jalisco', children: [{ value: 'gdl', label: 'Guadalajara' }] },
              ],
            },
            {
              value: 'us',
              label: 'USA',
              children: [
                { value: 'ca', label: 'California', children: [{ value: 'sf', label: 'San Francisco' }] },
              ],
            },
          ]}
        />
      )
    },
    code: `const [path, setPath] = createSignal<string[]>([])
<Cascader value={path()} onChange={setPath} options={options} />`,
  },
  {
    id: 'mentions',
    title: 'Mentions',
    group: 'Forms',
    blurb: 'Textarea with @mention autocomplete — type @ to search and insert a name.',
    demo: () => {
      const [text, setText] = createSignal('Nice work ')
      return (
        <div class="max-w-md">
          <UI.Mentions
            value={text()}
            onChange={setText}
            placeholder="Type @ to mention someone…"
            options={[
              { value: 'marina', label: 'Marina Vega' },
              { value: 'theo', label: 'Theo Nakamura' },
              { value: 'priya', label: 'Priya Anand' },
            ]}
          />
        </div>
      )
    },
    code: `const [text, setText] = createSignal('')
<Mentions value={text()} onChange={setText} options={people} />`,
  },
  {
    id: 'tour',
    title: 'Tour',
    group: 'Overlays',
    blurb: 'Guided coachmarks — spotlights elements step by step with a tooltip.',
    demo: () => {
      const [open, setOpen] = createSignal(false)
      return (
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <UI.Button onClick={() => setOpen(true)}>Start tour</UI.Button>
            <div id="tour-target-1" class="rounded-md border border-border bg-card px-3 py-2 text-sm">
              Dashboard
            </div>
            <div id="tour-target-2" class="rounded-md border border-border bg-card px-3 py-2 text-sm">
              Settings
            </div>
          </div>
          <UI.Tour
            open={open()}
            onOpenChange={setOpen}
            steps={[
              { target: '#tour-target-1', title: 'Your dashboard', description: 'Everything starts here.' },
              { target: '#tour-target-2', title: 'Settings', description: 'Tweak things to taste.' },
            ]}
          />
        </div>
      )
    },
    code: `const [open, setOpen] = createSignal(false)
<Tour open={open()} onOpenChange={setOpen} steps={[
  { target: '#nav', title: 'Navigation', description: 'Jump anywhere.' },
]} />`,
  },
  {
    id: 'notification-center',
    title: 'NotificationCenter',
    group: 'Overlays',
    blurb: 'A bell with an unread count that opens a dismissible notification feed.',
    demo: () => {
      const [items, setItems] = createSignal([
        {
          id: '1',
          title: 'New comment',
          description: 'Theo replied to your thread',
          time: '2m',
          read: false,
        },
        { id: '2', title: 'Deploy finished', description: 'v0.5.0 is live', time: '1h', read: false },
        { id: '3', title: 'Weekly report', description: 'Your summary is ready', time: '1d', read: true },
      ])
      return (
        <UI.NotificationCenter
          items={items()}
          onDismiss={(id) => setItems(items().filter((n) => n.id !== id))}
          onMarkAllRead={() => setItems(items().map((n) => ({ ...n, read: true })))}
        />
      )
    },
    code: `<NotificationCenter
  items={items()}
  onDismiss={dismiss}
  onMarkAllRead={markAllRead}
/>`,
  },
  {
    id: 'color-picker',
    title: 'ColorPicker',
    group: 'Forms',
    blurb: 'Pick a color via the native picker, a hex field, or preset swatches.',
    demo: () => {
      const [color, setColor] = createSignal('#3b82f6')
      return (
        <div class="space-y-3">
          <UI.ColorPicker value={color()} onChange={setColor} />
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            Selected: <span class="font-mono">{color()}</span>
            <span class="h-4 w-4 rounded" style={{ background: color() }} />
          </div>
        </div>
      )
    },
    code: `const [color, setColor] = createSignal('#3b82f6')
<ColorPicker value={color()} onChange={setColor} />`,
  },
  {
    id: 'comment',
    title: 'Comment',
    group: 'Data',
    blurb: 'Threaded comment layout with avatars, timestamps, actions, and nested replies.',
    demo: () => (
      <div class="w-full max-w-lg">
        <UI.Comment
          actions={() => (
            <>
              <button type="button" class="hover:text-foreground">
                Reply
              </button>
              <button type="button" class="hover:text-foreground">
                Like
              </button>
            </>
          )}
          comment={{
            id: '1',
            author: 'Marina Vega',
            time: '2h ago',
            content: 'This component API is really clean — shipping it. 🚀',
            replies: [
              {
                id: '2',
                author: 'Theo Nakamura',
                time: '1h ago',
                content: 'Agreed. The nested threading is a nice touch.',
              },
            ],
          }}
        />
      </div>
    ),
    code: `<Comment
  comment={{ id: '1', author: 'Marina', content: 'Nice!', replies: [...] }}
  actions={(c) => <button>Reply</button>}
/>`,
  },
  {
    id: 'calendar-heatmap',
    title: 'CalendarHeatmap',
    group: 'Data',
    blurb: 'GitHub-style activity grid — intensity per day over the last weeks.',
    demo: () => {
      const today = new Date()
      const values = Array.from({ length: 140 }, (_, i) => {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        return { date: d.toISOString().slice(0, 10), count: (i * 5) % 12 }
      })
      return (
        <div class="w-full overflow-x-auto">
          <UI.CalendarHeatmap values={values} weeks={20} />
        </div>
      )
    },
    code: `<CalendarHeatmap
  weeks={26}
  values={[{ date: '2026-07-10', count: 3 }, …]}
/>`,
  },
  {
    id: 'portal',
    title: 'Portal',
    group: 'Layout',
    blurb:
      'Renders children into a detached DOM node (default <body>) — escapes overflow and stacking contexts.',
    demo: () => (
      <div class="text-sm text-muted-foreground">
        The badge below is rendered via <code class="rounded bg-muted px-1 font-mono">Portal</code> into{' '}
        <code class="rounded bg-muted px-1 font-mono">&lt;body&gt;</code>, so it escapes this card →
        <UI.Portal>
          <div class="fixed bottom-4 left-4 z-50 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow-lg">
            Rendered via Portal
          </div>
        </UI.Portal>
      </div>
    ),
    code: `<Portal>
  <div class="fixed inset-0 grid place-items-center">Floating layer</div>
</Portal>`,
  },

  // ---- Guides ---------------------------------------------------------------
  // Long-form docs rendered from the repo markdown (single-source).
  {
    id: 'guide-spatial-glass',
    title: 'Spatial Glass',
    group: 'Guides',
    blurb:
      'The recipe for the A4ui look — Aurora backdrop, glass surfaces, the cursor light, tasteful motion, Expandable. Follow it and a page looks like A4ui.',
    demo: () => <MarkdownGuide src={spatialGlassMd} links={changelogComponentLinks()} />,
    guide: true,
  },
  {
    id: 'guide-integrations',
    title: 'Integrations',
    group: 'Guides',
    blurb: 'Use A4ui in Vite + Solid, SolidStart (SSR), Astro, or React/Next/Vue/vanilla via Web Components.',
    demo: () => <MarkdownGuide src={integrationsMd} links={changelogComponentLinks()} />,
    guide: true,
  },
  {
    id: 'guide-stability',
    title: 'Stability',
    group: 'Guides',
    blurb:
      'Versioning policy and the Stable / Experimental / Internal tiers — what is safe to build on before 1.0.',
    demo: () => <MarkdownGuide src={stabilityMd} links={changelogComponentLinks()} />,
    guide: true,
  },
  {
    id: 'guide-migration',
    title: 'Upgrading',
    group: 'Guides',
    blurb: 'Upgrade notes across the 0.x line — what changed and what (if anything) you need to do.',
    demo: () => <MarkdownGuide src={migrationMd} links={changelogComponentLinks()} />,
    guide: true,
  },
  {
    id: 'guide-changelog',
    title: 'Changelog',
    group: 'Guides',
    blurb: 'Every release of @a4ui/core, newest first.',
    demo: () => <MarkdownGuide src={changelogMd} links={changelogComponentLinks()} />,
    guide: true,
  },

  // ---- Commerce (added) -----------------------------------------------------
  {
    id: 'price-block',
    title: 'PriceBlock',
    group: 'Commerce',
    blurb:
      'Richer price than PriceTag: compare-at savings, a coupon chip with the after-coupon price, and a financing estimate.',
    demo: () => (
      <Commerce.PriceBlock
        amount={249}
        compareAt={329}
        coupon={{ code: 'SAVE50', amount: 50 }}
        financing={{ months: 12, apr: 0.1 }}
      />
    ),
    code: `<PriceBlock amount={249} compareAt={329}
  coupon={{ code: 'SAVE50', amount: 50 }}
  financing={{ months: 12, apr: 0.1 }} />`,
    variants: [
      { label: 'Compare-at only', demo: () => <Commerce.PriceBlock amount={89} compareAt={129} /> },
      {
        label: 'With coupon',
        demo: () => <Commerce.PriceBlock amount={60} coupon={{ code: 'WELCOME10', amount: 10 }} />,
      },
      {
        label: 'With financing',
        demo: () => <Commerce.PriceBlock amount={899} financing={{ months: 24, apr: 0.15 }} />,
      },
      { label: 'Plain', demo: () => <Commerce.PriceBlock amount={42.5} /> },
    ],
  },
  {
    id: 'facet-sidebar',
    title: 'FacetSidebar',
    group: 'Commerce',
    blurb:
      'Full faceted-filter panel: collapsible checkbox sections, a price range, active chips, and clear-all.',
    demo: () => {
      const [selected, setSelected] = createSignal<Record<string, string[]>>({
        type: ['mug'],
        color: ['blue'],
      })
      const [price, setPrice] = createSignal<[number, number]>([10, 60])
      return (
        <div class="max-w-xs">
          <Commerce.FacetSidebar
            sections={[
              {
                key: 'type',
                title: 'Type',
                options: [
                  { value: 'mug', label: 'Mug', count: 4 },
                  { value: 'plate', label: 'Plate', count: 2 },
                  { value: 'bowl', label: 'Bowl', count: 3 },
                ],
              },
              {
                key: 'color',
                title: 'Color',
                options: [
                  { value: 'blue', label: 'Blue', count: 5 },
                  { value: 'green', label: 'Green', count: 2 },
                ],
              },
              {
                key: 'material',
                title: 'Material',
                collapsible: true,
                defaultOpen: false,
                options: [
                  { value: 'ceramic', label: 'Ceramic', count: 6 },
                  { value: 'glass', label: 'Glass', count: 1 },
                ],
              },
            ]}
            selected={selected()}
            onChange={(key, values) => setSelected({ ...selected(), [key]: values })}
            price={{ min: 0, max: 100, value: price() }}
            onPriceChange={setPrice}
            resultCount={7}
            onClearAll={() => {
              setSelected({})
              setPrice([0, 100])
            }}
          />
        </div>
      )
    },
    code: `const [selected, setSelected] = createSignal<Record<string, string[]>>({})
const [price, setPrice] = createSignal<[number, number]>([0, 100])
<FacetSidebar sections={facets} selected={selected()}
  onChange={(key, values) => setSelected({ ...selected(), [key]: values })}
  price={{ min: 0, max: 100, value: price() }} onPriceChange={setPrice}
  resultCount={7} onClearAll={() => { setSelected({}); setPrice([0, 100]) }} />`,
  },
  {
    id: 'condition-scale',
    title: 'ConditionScale',
    group: 'Commerce',
    blurb:
      'A graded-condition meter (e.g. 1–10 for a pre-owned item) with a marker, tier label, and endpoints.',
    demo: () => (
      <div class="max-w-sm">
        <Commerce.ConditionScale value={8} />
      </div>
    ),
    code: `<ConditionScale value={8} />`,
    variants: [
      { label: 'Excellent (9)', demo: () => <Commerce.ConditionScale value={9} /> },
      { label: 'Fair (2)', demo: () => <Commerce.ConditionScale value={2} /> },
      {
        label: 'Custom scale (0-100)',
        demo: () => (
          <Commerce.ConditionScale
            value={62}
            min={0}
            max={100}
            tiers={[
              { min: 90, label: 'Like New' },
              { min: 70, label: 'Lightly Used' },
              { min: 40, label: 'Worn' },
              { min: 0, label: 'Heavily Worn' },
            ]}
          />
        ),
      },
    ],
  },

  // ---- Data (added) ---------------------------------------------------------
  {
    id: 'spec-sheet',
    title: 'SpecSheet',
    group: 'Data',
    blurb: 'A grouped key/value specification table for product specs and tech sheets.',
    demo: () => (
      <UI.SpecSheet
        columns={2}
        groups={[
          {
            title: 'Display',
            rows: [
              { label: 'Panel', value: 'AMOLED, 6.4"' },
              { label: 'Resolution', value: '2340 x 1080' },
              { label: 'Refresh rate', value: '120 Hz' },
              { label: 'Peak brightness', value: '1200 nits' },
            ],
          },
          {
            title: 'Battery',
            rows: [
              { label: 'Capacity', value: '4500 mAh' },
              { label: 'Charging', value: '65 W wired' },
              { label: 'Wireless', value: '30 W' },
            ],
          },
        ]}
      />
    ),
    code: `<SpecSheet columns={2} groups={[
  { title: 'Display', rows: [
    { label: 'Panel', value: 'AMOLED, 6.4"' },
    { label: 'Refresh rate', value: '120 Hz' },
  ] },
  { title: 'Battery', rows: [{ label: 'Capacity', value: '4500 mAh' }] },
]} />`,
    variants: [
      {
        label: '1 column',
        demo: () => (
          <UI.SpecSheet
            groups={[
              {
                title: 'Processor',
                rows: [
                  { label: 'Chip', value: 'A18 Pro' },
                  { label: 'Cores', value: '6-core CPU' },
                ],
              },
            ]}
          />
        ),
      },
      {
        label: '2 columns',
        demo: () => (
          <UI.SpecSheet
            columns={2}
            groups={[
              {
                title: 'Camera',
                rows: [
                  { label: 'Main', value: '48 MP' },
                  { label: 'Ultra-wide', value: '12 MP' },
                  { label: 'Zoom', value: '5x optical' },
                  { label: 'Video', value: '4K @ 60fps' },
                ],
              },
            ]}
          />
        ),
      },
    ],
  },
  {
    id: 'ratings-summary',
    title: 'RatingsSummary',
    group: 'Data',
    blurb: 'A compact social-proof grid of aggregate ratings across multiple review sources.',
    demo: () => (
      <UI.RatingsSummary
        sources={[
          { name: 'Google', score: 4.8, outOf: 5, count: 2140 },
          { name: 'Trustpilot', score: 4.6, outOf: 5, count: 980 },
          { name: 'Verified Buyers', score: 4.9, outOf: 5, count: 512 },
          { name: 'App Store', score: 'A+', count: 310 },
        ]}
      />
    ),
    code: `<RatingsSummary sources={[
  { name: 'Google', score: 4.8, outOf: 5, count: 2140 },
  { name: 'Trustpilot', score: 4.6, outOf: 5, count: 980 },
]} />`,
  },
  {
    id: 'logo-wall',
    title: 'LogoWall',
    group: 'Data',
    blurb: '"As seen in" grid of press/partner logos — grayscale by default, color on hover.',
    demo: () => (
      <UI.LogoWall
        logos={[
          { src: 'https://picsum.photos/seed/techdaily/160/48', alt: 'TechDaily' },
          { src: 'https://picsum.photos/seed/stylemag/160/48', alt: 'StyleMag' },
          { src: 'https://picsum.photos/seed/marketwire/160/48', alt: 'MarketWire' },
          { src: 'https://picsum.photos/seed/urbanpost/160/48', alt: 'UrbanPost' },
          { src: 'https://picsum.photos/seed/dailyscoop/160/48', alt: 'DailyScoop' },
          { src: 'https://picsum.photos/seed/northwire/160/48', alt: 'NorthWire' },
        ]}
      />
    ),
    code: `<LogoWall logos={[
  { src: '/press/techdaily.svg', alt: 'TechDaily' },
  { src: '/press/stylemag.svg', alt: 'StyleMag', href: 'https://stylemag.example' },
]} />`,
  },

  // ---- Feedback (added) -----------------------------------------------------
  {
    id: 'announcement-bar',
    title: 'AnnouncementBar',
    group: 'Feedback',
    blurb: 'Full-bleed promo bar — optional dismiss and a copyable coupon-code pill.',
    demo: () => (
      <UI.AnnouncementBar tone="accent" dismissible couponCode="SAVE20" href="#/announcement-bar">
        Summer sale is live — 20% off everything
      </UI.AnnouncementBar>
    ),
    code: `<AnnouncementBar tone="accent" dismissible couponCode="SAVE20" href="/sale">
  Summer sale is live — 20% off everything
</AnnouncementBar>`,
    variants: [
      {
        label: 'Primary tone',
        demo: () => <UI.AnnouncementBar tone="primary">New: dark mode is here</UI.AnnouncementBar>,
      },
      {
        label: 'Accent, no coupon',
        demo: () => <UI.AnnouncementBar tone="accent">Free shipping this week</UI.AnnouncementBar>,
      },
      {
        label: 'Neutral, dismissible',
        demo: () => (
          <UI.AnnouncementBar tone="neutral" dismissible>
            Scheduled maintenance tonight at 10pm
          </UI.AnnouncementBar>
        ),
      },
      {
        label: 'With coupon',
        demo: () => (
          <UI.AnnouncementBar tone="primary" couponCode="LAUNCH15">
            Launch week — 15% off
          </UI.AnnouncementBar>
        ),
      },
    ],
  },

  // ---- Conversation / AI, transitions, depth (roadmap phase 1) ---------------
  {
    id: 'chat-thread',
    title: 'ChatThread',
    group: 'Data',
    blurb:
      'Scrollable, centered reading column that stacks chat messages — the container for conversation/AI UIs.',
    demo: () => (
      <UI.ChatThread maxWidth={520} class="h-64 rounded-xl border border-border p-4">
        <UI.Message role="user" author="You">
          What can you do?
        </UI.Message>
        <UI.Message role="assistant" author="Assistant">
          I can summarize threads, draft replies, and answer questions about your data.
        </UI.Message>
        <UI.Message role="user" author="You">
          Nice — summarize this one.
        </UI.Message>
      </UI.ChatThread>
    ),
    code: `<ChatThread maxWidth={520}>
  <Message role="user">…</Message>
  <Message role="assistant">…</Message>
</ChatThread>`,
  },
  {
    id: 'message',
    title: 'Message',
    group: 'Data',
    blurb: 'One chat message row — full-width (no bubble), role-styled, content as children.',
    demo: () => (
      <div class="flex max-w-md flex-col gap-3">
        <UI.Message role="user" author="Alex Rivera" timestamp="2:41 PM">
          <p>Can you pull the Q3 numbers for the Aurora account?</p>
        </UI.Message>
        <UI.Message role="assistant" author="Nova" timestamp="2:42 PM">
          <p>Aurora's Q3 churn was 3.2%, down from 4.1% in Q2.</p>
        </UI.Message>
        <UI.Message role="system">Nova joined the conversation</UI.Message>
      </div>
    ),
    code: `<Message role="user" author="Alex">…</Message>
<Message role="assistant" author="Nova">…</Message>
<Message role="system">Nova joined</Message>`,
  },
  {
    id: 'streaming-text',
    title: 'StreamingText',
    group: 'Motion',
    blurb: 'Reveals text as it "streams" in with a blinking caret — for AI answer UIs.',
    demo: () => {
      const full =
        'Spatial Glass blends translucent surfaces, soft light, and tasteful motion into one system.'
      const [text, setText] = createSignal('')
      const [streaming, setStreaming] = createSignal(true)
      onMount(() => {
        let i = 0
        const id = setInterval(() => {
          i += 3
          setText(full.slice(0, i))
          if (i >= full.length) {
            setStreaming(false)
            clearInterval(id)
          }
        }, 120)
        onCleanup(() => clearInterval(id))
      })
      return (
        <div class="max-w-prose text-lg text-foreground">
          <UI.StreamingText text={text()} streaming={streaming()} />
        </div>
      )
    },
    code: `<StreamingText text={answer()} streaming={!done()} />`,
  },
  {
    id: 'citation',
    title: 'Citation',
    group: 'Data',
    blurb: 'Inline numbered source chips + a compact SourceList — for AI answers with citations.',
    demo: () => (
      <div class="flex max-w-md flex-col gap-3">
        <p class="text-sm text-foreground">
          Glass surfaces use a translucent backdrop blur
          <UI.Citation index={1} href="https://example.com/spec" title="Design spec" />, tuned so text keeps
          AA contrast
          <UI.Citation index={2} title="Contrast audit" />.
        </p>
        <UI.SourceList
          sources={[{ title: 'Design spec', href: 'https://example.com/spec' }, { title: 'Contrast audit' }]}
        />
      </div>
    ),
    code: `text <Citation index={1} href="/spec" title="Design spec" />.
<SourceList sources={[{ title: 'Design spec', href: '/spec' }]} />`,
  },
  {
    id: 'prompt-composer',
    title: 'PromptComposer',
    group: 'Forms',
    blurb:
      'Chat input: auto-growing textarea, removable attachment chips, attach + send. Submits on Cmd/Ctrl+Enter.',
    demo: () => {
      const [value, setValue] = createSignal('')
      const [attachments, setAttachments] = createSignal(['spec.pdf', 'diagram.png'])
      return (
        <UI.PromptComposer
          value={value()}
          onInput={setValue}
          onSubmit={() => setValue('')}
          placeholder="Ask anything…"
          hint="Cmd/Ctrl+Enter to send"
          attachments={attachments()}
          onRemoveAttachment={(i) => setAttachments((xs) => xs.filter((_, idx) => idx !== i))}
          onAttach={() => setAttachments((xs) => [...xs, 'note.txt'])}
          class="max-w-lg"
        />
      )
    },
    code: `<PromptComposer value={value()} onInput={setValue} onSubmit={send}
  attachments={['spec.pdf']} onAttach={pick} />`,
  },
  {
    id: 'artifact-panel',
    title: 'ArtifactPanel',
    group: 'Layout',
    blurb:
      'Inline right-side panel for AI-generated output next to a chat — reveals by animating width (not a portalled overlay).',
    demo: () => {
      const [open, setOpen] = createSignal(false)
      return (
        <div class="flex h-64 overflow-hidden rounded-xl border border-border">
          <div class="flex min-w-0 flex-1 flex-col gap-3 p-4">
            <p class="text-sm text-muted-foreground">Chat pane (main content)…</p>
            <UI.Button variant="outline" onClick={() => setOpen((v) => !v)}>
              {open() ? 'Hide artifact' : 'Show artifact'}
            </UI.Button>
          </div>
          <UI.ArtifactPanel open={open()} onClose={() => setOpen(false)} title="notes.md" width={320}>
            <div class="p-4 text-sm text-muted-foreground">Generated output renders here.</div>
          </UI.ArtifactPanel>
        </div>
      )
    },
    code: `const [open, setOpen] = createSignal(false)
<ArtifactPanel open={open()} onClose={() => setOpen(false)} title="notes.md">
  …generated output…
</ArtifactPanel>`,
  },
  {
    id: 'floating-toolbar',
    title: 'FloatingToolbar',
    group: 'Layout',
    blurb:
      'Fixed, centered glass toolbar that condenses as you scroll — a detached action bar (renders fixed-position over the page).',
    demo: () => (
      <UI.FloatingToolbar position="bottom">
        <UI.Button variant="ghost" aria-label="Add">
          <Plus class="h-4 w-4" />
        </UI.Button>
        <UI.Button variant="ghost" aria-label="Favorite">
          <Heart class="h-4 w-4" />
        </UI.Button>
        <UI.Button variant="ghost" aria-label="Star">
          <Star class="h-4 w-4" />
        </UI.Button>
        <UI.Button variant="ghost" aria-label="Search">
          <Search class="h-4 w-4" />
        </UI.Button>
      </UI.FloatingToolbar>
    ),
    code: `<FloatingToolbar position="bottom">
  <Button variant="ghost"><Plus /></Button>
  <Button variant="ghost"><Search /></Button>
</FloatingToolbar>`,
  },
  {
    id: 'page-transition',
    title: 'PageTransition',
    group: 'Motion',
    blurb: 'Cross-fades (or slides) keyed content in and out on change — for route/view transitions.',
    demo: () => {
      const [view, setView] = createSignal(1)
      const next = () => setView((v) => (v % 3) + 1)
      return (
        <div class="flex flex-col gap-3">
          <UI.Button onClick={next}>Next view ({view()})</UI.Button>
          <UI.PageTransition key={view()} mode="slide" class="rounded-xl border border-border bg-card p-4">
            <Show when={view() === 1}>
              <div>
                <h3 class="font-semibold text-foreground">Welcome aboard</h3>
                <p class="text-sm text-muted-foreground">Orbital Freight — shipment 1 of 3.</p>
              </div>
            </Show>
            <Show when={view() === 2}>
              <div>
                <h3 class="font-semibold text-foreground">In transit</h3>
                <p class="text-sm text-muted-foreground">Container OF-4471 cleared customs.</p>
              </div>
            </Show>
            <Show when={view() === 3}>
              <div>
                <h3 class="font-semibold text-foreground">Delivered</h3>
                <p class="text-sm text-muted-foreground">Signed for at 14:32.</p>
              </div>
            </Show>
          </UI.PageTransition>
        </div>
      )
    },
    code: `<PageTransition key={view()} mode="slide">
  <Show when={view() === 1}>…</Show>
  <Show when={view() === 2}>…</Show>
</PageTransition>`,
  },
  {
    id: 'inline-select',
    title: 'InlineSelect',
    group: 'Forms',
    blurb:
      'Edit-in-place select: click the value to swap it for a dropdown, pick to commit. For inline status/priority fields.',
    demo: () => {
      const [status, setStatus] = createSignal('doing')
      return (
        <UI.InlineSelect
          value={status()}
          onChange={setStatus}
          options={[
            { value: 'todo', label: 'To do' },
            { value: 'doing', label: 'In progress' },
            { value: 'review', label: 'In review' },
            { value: 'done', label: 'Done' },
          ]}
        />
      )
    },
    code: `const [status, setStatus] = createSignal('doing')
<InlineSelect value={status()} onChange={setStatus} options={statusOptions} />`,
  },

  // ---- Phase 2 — code, search, navigation, master-detail ---------------------
  {
    id: 'code-tabs',
    title: 'CodeTabs',
    group: 'Data',
    blurb: 'Tabbed code blocks with a per-tab copy button — for install snippets or multiple languages.',
    demo: () => (
      <UI.CodeTabs
        tabs={[
          { label: 'npm', code: 'npm install @acme/widgets' },
          { label: 'pnpm', code: 'pnpm add @acme/widgets' },
          { label: 'yarn', code: 'yarn add @acme/widgets' },
        ]}
      />
    ),
    code: `<CodeTabs tabs={[
  { label: 'npm', code: 'npm install @acme/widgets' },
  { label: 'pnpm', code: 'pnpm add @acme/widgets' },
]} />`,
  },
  {
    id: 'pill-search',
    title: 'PillSearch',
    group: 'Forms',
    blurb: 'A rounded-full bar compressing several search fields into segments, with a round search button.',
    demo: () => (
      <UI.PillSearch
        fields={[
          { key: 'location', label: 'Location', value: 'Lisbon, PT' },
          { key: 'dates', label: 'Dates', placeholder: 'Add dates' },
          { key: 'guests', label: 'Guests', placeholder: 'Add guests' },
        ]}
        onFieldClick={() => {}}
        onSearch={() => {}}
      />
    ),
    code: `<PillSearch
  fields={[
    { key: 'location', label: 'Location', value: 'Lisbon' },
    { key: 'dates', label: 'Dates', placeholder: 'Add dates' },
  ]}
  onSearch={search}
/>`,
    variants: [
      {
        label: 'All fields filled',
        demo: () => (
          <UI.PillSearch
            fields={[
              { key: 'location', label: 'Location', value: 'Porto, PT' },
              { key: 'dates', label: 'Dates', value: 'Aug 3 - 10' },
              { key: 'guests', label: 'Guests', value: '2 guests' },
            ]}
          />
        ),
      },
      {
        label: 'Two fields',
        demo: () => (
          <UI.PillSearch
            fields={[
              { key: 'query', label: 'Search', placeholder: 'Search products' },
              { key: 'category', label: 'Category', value: 'Electronics' },
            ]}
          />
        ),
      },
      {
        label: 'Four fields',
        demo: () => (
          <UI.PillSearch
            fields={[
              { key: 'location', label: 'Location', value: 'Madrid, ES' },
              { key: 'checkin', label: 'Check-in', placeholder: 'Add date' },
              { key: 'checkout', label: 'Check-out', placeholder: 'Add date' },
              { key: 'guests', label: 'Guests', value: '4 guests' },
            ]}
          />
        ),
      },
    ],
  },
  {
    id: 'category-strip',
    title: 'CategoryStrip',
    group: 'Navigation',
    blurb: 'Horizontally-scrollable icon + label category filters with an active-underline indicator.',
    demo: () => {
      const [category, setCategory] = createSignal('fresh')
      return (
        <UI.CategoryStrip
          class="max-w-md"
          value={category()}
          onChange={setCategory}
          items={[
            { value: 'fresh', label: 'Fresh', icon: <Apple class="h-5 w-5" /> },
            { value: 'bakery', label: 'Bakery', icon: <Croissant class="h-5 w-5" /> },
            { value: 'dairy', label: 'Dairy', icon: <Milk class="h-5 w-5" /> },
            { value: 'meat', label: 'Meat', icon: <Beef class="h-5 w-5" /> },
            { value: 'frozen', label: 'Frozen', icon: <Snowflake class="h-5 w-5" /> },
            { value: 'pantry', label: 'Pantry', icon: <Package class="h-5 w-5" /> },
          ]}
        />
      )
    },
    code: `<CategoryStrip value={cat()} onChange={setCat} items={categories} />`,
  },
  {
    id: 'master-detail',
    title: 'MasterDetail',
    group: 'Layout',
    blurb: 'List + detail-pane layout with keyboard navigation — like an inbox. Controlled or uncontrolled.',
    demo: () => (
      <UI.MasterDetail
        class="h-64"
        items={[
          {
            id: 'm1',
            label: 'Q3 roadmap review',
            meta: <UI.Badge tone="info">Eng</UI.Badge>,
            detail: (
              <div class="space-y-2">
                <h3 class="font-semibold text-foreground">Q3 roadmap review</h3>
                <p class="text-sm text-muted-foreground">
                  Priorities for next quarter and open questions for infra.
                </p>
              </div>
            ),
          },
          {
            id: 'm2',
            label: 'Invoice #4021 paid',
            meta: <UI.Badge tone="success">Billing</UI.Badge>,
            detail: (
              <div class="space-y-2">
                <h3 class="font-semibold text-foreground">Invoice #4021 paid</h3>
                <p class="text-sm text-muted-foreground">Payment of $1,240.00 received.</p>
              </div>
            ),
          },
          {
            id: 'm3',
            label: 'Server alert: high latency',
            meta: <UI.Badge tone="danger">Alert</UI.Badge>,
            detail: (
              <div class="space-y-2">
                <h3 class="font-semibold text-foreground">High latency</h3>
                <p class="text-sm text-muted-foreground">p95 exceeded 800ms on checkout-api.</p>
              </div>
            ),
          },
        ]}
      />
    ),
    code: `<MasterDetail items={messages.map((m) => ({
  id: m.id, label: m.subject, detail: <Body m={m} />,
}))} />`,
  },
  {
    id: 'slash-menu',
    title: 'SlashMenu',
    group: 'Overlays',
    blurb: 'Filterable "/" insert menu — a block/command picker with keyboard navigation.',
    demo: () => {
      const [query, setQuery] = createSignal('')
      const [log, setLog] = createSignal<string[]>([])
      return (
        <div class="max-w-sm space-y-2">
          <input
            type="text"
            value={query()}
            onInput={(e) => setQuery(e.currentTarget.value)}
            placeholder="Type to filter blocks…"
            class="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <UI.SlashMenu
            query={query()}
            onSelect={(v) => setLog((l) => [...l, v])}
            items={[
              {
                value: 'heading',
                label: 'Heading',
                description: 'Big section heading',
                icon: <Heading class="h-4 w-4" />,
                keywords: ['h1', 'title'],
              },
              {
                value: 'text',
                label: 'Text',
                description: 'Plain paragraph',
                icon: <Type class="h-4 w-4" />,
                keywords: ['paragraph'],
              },
              {
                value: 'image',
                label: 'Image',
                description: 'Upload or embed',
                icon: <ImageIcon class="h-4 w-4" />,
                keywords: ['photo'],
              },
              {
                value: 'table',
                label: 'Table',
                description: 'Rows and columns',
                icon: <TableIcon class="h-4 w-4" />,
                keywords: ['grid'],
              },
              {
                value: 'divider',
                label: 'Divider',
                description: 'Horizontal rule',
                icon: <Minus class="h-4 w-4" />,
                keywords: ['hr'],
              },
            ]}
          />
          <p class="text-xs text-muted-foreground">Inserted: {log().join(', ') || '—'}</p>
        </div>
      )
    },
    code: `const [query, setQuery] = createSignal('')
<input value={query()} onInput={(e) => setQuery(e.currentTarget.value)} />
<SlashMenu items={blocks} query={query()} onSelect={insertBlock} />`,
  },
  {
    id: 'data-view',
    title: 'DataView',
    group: 'Data',
    blurb: 'One dataset, switchable views — table, board (kanban), and gallery — via a segmented control.',
    demo: () => {
      type Task = { id: string; title: string; status: string; assignee: string }
      const tasks: Task[] = [
        { id: 't1', title: 'Draft Q3 roadmap', status: 'Todo', assignee: 'Nadia' },
        { id: 't2', title: 'Fix checkout redirect', status: 'In progress', assignee: 'Marco' },
        { id: 't3', title: 'Write onboarding email', status: 'Todo', assignee: 'Priya' },
        { id: 't4', title: 'Ship dark-mode toggle', status: 'Done', assignee: 'Marco' },
        { id: 't5', title: 'Audit API rate limits', status: 'In progress', assignee: 'Nadia' },
        { id: 't6', title: 'Update pricing copy', status: 'Done', assignee: 'Priya' },
      ]
      return (
        <UI.DataView<Task>
          data={tasks}
          getId={(t) => t.id}
          columns={[
            { key: 'title', header: 'Title' },
            { key: 'status', header: 'Status' },
            { key: 'assignee', header: 'Assignee' },
          ]}
          groupBy={(t) => t.status}
          card={(t) => (
            <div class="flex flex-col gap-1">
              <span class="font-medium text-foreground">{t.title}</span>
              <span class="text-xs text-muted-foreground">{t.assignee}</span>
            </div>
          )}
        />
      )
    },
    code: `<DataView data={tasks} getId={(t) => t.id}
  columns={cols} groupBy={(t) => t.status} card={renderCard} />`,
  },
  {
    id: 'refractive-glass',
    title: 'Refractive glass',
    group: 'Layout',
    blurb:
      'A heavier glass surface with a specular sheen + bright top edge (the `.glass-refractive` utility). For hero/feature panels over a colourful backdrop like Aurora.',
    demo: () => (
      <div
        class="relative overflow-hidden rounded-2xl p-10"
        style={{
          background:
            'radial-gradient(45% 45% at 25% 20%, hsl(var(--primary) / 0.55), transparent 70%), radial-gradient(45% 45% at 80% 80%, hsl(var(--accent) / 0.55), transparent 70%)',
        }}
      >
        <div class="glass-refractive mx-auto max-w-sm p-6">
          <h3 class="text-lg font-semibold text-foreground">Refractive glass</h3>
          <p class="mt-1 text-sm text-muted-foreground">
            A specular sheen and bright top edge read as light refracting through the material.
          </p>
        </div>
      </div>
    ),
    code: `<Aurora variant="mesh" animated />
<div class="glass-refractive p-6">…</div>`,
    variants: [
      {
        label: 'As a stat panel',
        demo: () => (
          <div
            class="relative overflow-hidden rounded-xl p-6"
            style={{
              background: 'radial-gradient(60% 60% at 30% 20%, hsl(var(--primary) / 0.5), transparent 70%)',
            }}
          >
            <div class="glass-refractive p-5">
              <p class="text-xs text-muted-foreground">Monthly revenue</p>
              <p class="text-2xl font-bold text-foreground">$48,204</p>
            </div>
          </div>
        ),
      },
      {
        label: 'As a compact pill',
        demo: () => (
          <div
            class="relative overflow-hidden rounded-xl p-6"
            style={{
              background: 'radial-gradient(60% 60% at 70% 30%, hsl(var(--accent) / 0.5), transparent 70%)',
            }}
          >
            <span class="glass-refractive inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground">
              <Sparkles class="h-4 w-4 text-primary" /> Pro plan
            </span>
          </div>
        ),
      },
    ],
  },

  // ---- Phase 3 — scroll storytelling, finance, spaces/rail -------------------
  {
    id: 'scroll-scene',
    title: 'ScrollScene',
    group: 'Motion',
    blurb: 'Binds a render to the element’s scroll progress (0→1) — for scroll-driven storytelling.',
    demo: () => (
      <UI.ScrollScene class="block h-64">
        {(progress) => (
          <div class="flex h-full flex-col items-center justify-center gap-2">
            <div
              class="rounded-xl border border-border bg-card p-6 text-center"
              style={{
                transform: `translateY(${(1 - progress()) * 24}px) scale(${0.9 + progress() * 0.1})`,
                opacity: 0.4 + progress() * 0.6,
              }}
            >
              <p class="font-semibold text-foreground">Comet Freight Co.</p>
              <p class="text-sm text-muted-foreground">Scroll to reveal</p>
            </div>
            <p class="text-xs text-muted-foreground">{Math.round(progress() * 100)}%</p>
          </div>
        )}
      </UI.ScrollScene>
    ),
    code: `<ScrollScene>
  {(progress) => <div style={{ opacity: progress() }}>…</div>}
</ScrollScene>`,
  },
  {
    id: 'sticky-reveal',
    title: 'StickyReveal',
    group: 'Motion',
    blurb:
      'Pins its content while scrolling through a tall section, fading it in — scroll inside the preview to see it.',
    demo: () => (
      <div class="h-[280px] overflow-y-auto rounded-lg ring-1 ring-border">
        <UI.StickyReveal height="150vh">
          <UI.Card class="w-72 p-8 text-center">
            <h3 class="text-xl font-bold text-foreground">Pinned moment</h3>
            <p class="mt-2 text-sm text-muted-foreground">Fades and rises in as you scroll.</p>
          </UI.Card>
        </UI.StickyReveal>
      </div>
    ),
    code: `<StickyReveal height="180vh">
  <Card class="p-8">Pinned content…</Card>
</StickyReveal>`,
  },
  {
    id: 'balance-card',
    title: 'BalanceCard',
    group: 'Data',
    blurb: 'Balance-first summary card with a formatted amount and an up/down delta chip.',
    demo: () => (
      <UI.BalanceCard
        label="Total balance"
        amount={128430.52}
        delta={0.042}
        sub={<span class="text-xs text-muted-foreground">Available · •••• 4821</span>}
      />
    ),
    code: `<BalanceCard label="Total balance" amount={128430.52} delta={0.042} />`,
    variants: [
      {
        label: 'Positive delta',
        demo: () => <UI.BalanceCard label="Revenue" amount={52140} delta={0.128} />,
      },
      {
        label: 'Negative delta',
        demo: () => <UI.BalanceCard label="Burn" amount={38610} delta={-0.041} />,
      },
      {
        label: 'No delta',
        demo: () => <UI.BalanceCard label="Reserve" amount={95000} />,
      },
      {
        label: 'Euro, with sub-line',
        demo: () => (
          <UI.BalanceCard
            label="Saldo"
            amount={12840.5}
            currency="EUR"
            locale="es-ES"
            delta={0.02}
            sub={<span class="text-xs text-muted-foreground">Disponible</span>}
          />
        ),
      },
    ],
  },
  {
    id: 'transaction-feed',
    title: 'TransactionFeed',
    group: 'Data',
    blurb: 'Dense transaction/activity list with success-toned incoming amounts and optional date grouping.',
    demo: () => (
      <UI.TransactionFeed
        class="w-full max-w-sm"
        groupByDate
        transactions={[
          { id: '1', title: 'Acme Corp', subtitle: 'Invoice #1042', amount: 1200, date: '2026-07-18' },
          { id: '2', title: 'Cloud Hosting', subtitle: 'Monthly plan', amount: -49.99, date: '2026-07-18' },
          { id: '3', title: 'Nova Design Studio', subtitle: 'Retainer', amount: 850, date: '2026-07-17' },
          {
            id: '4',
            title: 'Office Supplies Co',
            subtitle: 'Order #88213',
            amount: -132.4,
            date: '2026-07-17',
          },
          { id: '5', title: 'Jane Whitfield', subtitle: 'Refund', amount: 26.5, date: '2026-07-16' },
        ]}
      />
    ),
    code: `<TransactionFeed groupByDate transactions={txns} />`,
  },
  {
    id: 'kpi-block',
    title: 'KpiBlock',
    group: 'Data',
    blurb: 'A labelled metric with a signed delta chip and an optional inline chart slot.',
    demo: () => (
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <UI.KpiBlock label="Monthly revenue" value="$48,204" delta={0.128} />
        <UI.KpiBlock
          label="Active subscriptions"
          value="1,092"
          delta={0.041}
          chart={
            <svg viewBox="0 0 100 24" class="h-6 w-full text-primary/70" aria-hidden="true">
              <polyline
                points="0,18 15,15 30,17 45,10 60,12 75,5 90,7 100,3"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          }
        />
        <UI.KpiBlock label="Churn rate" value="2.3%" delta={-0.017} />
      </div>
    ),
    code: `<KpiBlock label="Monthly revenue" value="$48,204" delta={0.128} />
<KpiBlock label="Subscriptions" value="1,092" delta={0.041} chart={<Sparkline data={data} />} />`,
    variants: [
      {
        label: 'Positive delta',
        demo: () => <UI.KpiBlock label="New signups" value="3,204" delta={0.086} />,
      },
      { label: 'Negative delta', demo: () => <UI.KpiBlock label="Refunds" value="128" delta={-0.052} /> },
      { label: 'No delta', demo: () => <UI.KpiBlock label="Open tickets" value="47" /> },
      {
        label: 'With chart',
        demo: () => (
          <UI.KpiBlock
            label="Weekly orders"
            value="892"
            delta={0.031}
            chart={
              <svg viewBox="0 0 100 24" class="h-6 w-full text-primary/70" aria-hidden="true">
                <polyline
                  points="0,20 15,16 30,18 45,9 60,11 75,6 90,8 100,2"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            }
          />
        ),
      },
    ],
  },
  {
    id: 'money-action-button',
    title: 'MoneyActionButton',
    group: 'Actions',
    blurb:
      'A prominent CTA reserved for value-moving actions — one accent, tightly scoped to money movement.',
    demo: () => (
      <div class="flex flex-wrap items-center gap-3">
        <UI.MoneyActionButton kind="send" onClick={() => {}}>
          Send
        </UI.MoneyActionButton>
        <UI.MoneyActionButton kind="pay" onClick={() => {}}>
          Pay invoice
        </UI.MoneyActionButton>
        <UI.MoneyActionButton kind="withdraw" onClick={() => {}}>
          Withdraw
        </UI.MoneyActionButton>
      </div>
    ),
    code: `<MoneyActionButton kind="send" onClick={send}>Send</MoneyActionButton>`,
    variants: [
      { label: 'Send', demo: () => <UI.MoneyActionButton kind="send">Send</UI.MoneyActionButton> },
      { label: 'Request', demo: () => <UI.MoneyActionButton kind="request">Request</UI.MoneyActionButton> },
      { label: 'Pay', demo: () => <UI.MoneyActionButton kind="pay">Pay invoice</UI.MoneyActionButton> },
      {
        label: 'Disabled',
        demo: () => (
          <UI.MoneyActionButton kind="withdraw" disabled>
            Withdraw
          </UI.MoneyActionButton>
        ),
      },
    ],
  },
  {
    id: 'spaces',
    title: 'Spaces',
    group: 'Navigation',
    blurb:
      'Switchable, swipeable context containers — one space at a time, with a pill rail and drag-to-swipe.',
    demo: () => (
      <UI.Spaces
        spaces={[
          {
            id: 'personal',
            label: 'Personal',
            icon: <Home class="h-4 w-4" />,
            content: (
              <div class="p-6 text-sm text-muted-foreground">
                Weekend plans, reading list, and the family calendar.
              </div>
            ),
          },
          {
            id: 'work',
            label: 'Work',
            icon: <Briefcase class="h-4 w-4" />,
            content: (
              <div class="p-6 text-sm text-muted-foreground">
                Sprint board, standup notes, and open review requests.
              </div>
            ),
          },
          {
            id: 'travel',
            label: 'Travel',
            icon: <Plane class="h-4 w-4" />,
            content: (
              <div class="p-6 text-sm text-muted-foreground">
                Lisbon itinerary, boarding passes, and packing list.
              </div>
            ),
          },
        ]}
      />
    ),
    code: `<Spaces spaces={[
  { id: 'personal', label: 'Personal', icon: <Home />, content: <PersonalPane /> },
  { id: 'work', label: 'Work', icon: <Briefcase />, content: <WorkPane /> },
]} />`,
  },
  {
    id: 'side-rail',
    title: 'SideRail',
    group: 'Navigation',
    blurb:
      'A vertical icon + label navigation rail — the vertical alternative to top tabs or a compact sidebar.',
    demo: () => {
      const [section, setSection] = createSignal('inbox')
      return (
        <UI.SideRail
          value={section()}
          onChange={setSection}
          items={[
            { value: 'home', label: 'Home', icon: <Home class="h-5 w-5" /> },
            {
              value: 'inbox',
              label: 'Inbox',
              icon: <Inbox class="h-5 w-5" />,
              badge: <UI.Badge tone="info">3</UI.Badge>,
            },
            { value: 'calendar', label: 'Calendar', icon: <CalendarIcon class="h-5 w-5" /> },
            { value: 'files', label: 'Files', icon: <Folder class="h-5 w-5" /> },
            { value: 'settings', label: 'Settings', icon: <Settings class="h-5 w-5" /> },
          ]}
        />
      )
    },
    code: `const [tab, setTab] = createSignal('inbox')
<SideRail value={tab()} onChange={setTab} items={navItems} />`,
  },
  {
    id: 'block-editor',
    title: 'BlockEditor',
    group: 'Data',
    blurb: 'A block stack: drag a handle to reorder, delete on hover, and a slash-menu "+ Add block" picker.',
    demo: () => {
      const [blocks, setBlocks] = createSignal([
        {
          id: 'b1',
          type: 'heading',
          content: <h3 class="text-lg font-semibold text-foreground">Project kickoff</h3>,
        },
        { id: 'b2', type: 'text', content: <p class="text-sm text-foreground">Kickoff notes go here.</p> },
        {
          id: 'b3',
          type: 'quote',
          content: (
            <blockquote class="border-l-2 border-border pl-3 text-sm italic text-muted-foreground">
              “Ship small, ship often.”
            </blockquote>
          ),
        },
      ])
      return (
        <div class="w-full max-w-md">
          <UI.BlockEditor
            blocks={blocks()}
            onChange={setBlocks}
            blockTypes={[
              { value: 'heading', label: 'Heading', description: 'Big section title' },
              { value: 'text', label: 'Text', description: 'Plain paragraph' },
              { value: 'quote', label: 'Quote', description: 'Blockquote' },
            ]}
            onAddBlock={(type) =>
              setBlocks((prev) => [
                ...prev,
                {
                  id: `b${prev.length + 1}`,
                  type,
                  content: <p class="text-sm text-foreground">New {type} block</p>,
                },
              ])
            }
          />
        </div>
      )
    },
    code: `const [blocks, setBlocks] = createSignal(initialBlocks)
<BlockEditor blocks={blocks()} onChange={setBlocks}
  blockTypes={blockTypes} onAddBlock={(type) => append(type)} />`,
  },

  // ---- Micro-interactions (buttons + card/3D transitions) -------------------
  {
    id: 'micro-button',
    title: 'MicroButton',
    group: 'Actions',
    blurb:
      'A button that fires a physically-tuned feedback effect — spin, shake, pulse, ring or sparkle on click, or a glare sweep on hover. Transform/opacity only, reduced-motion safe. Click the buttons ↓',
    demo: () => (
      <div class="flex flex-wrap items-center gap-3">
        <UI.MicroButton effect="sparkle" aria-label="Sparkle">
          <Sparkles size={16} />
        </UI.MicroButton>
        <UI.MicroButton effect="ring" variant="outline" aria-label="Ring">
          <Bell size={16} />
        </UI.MicroButton>
        <UI.MicroButton effect="spin" variant="ghost" aria-label="Spin">
          <Settings size={16} />
        </UI.MicroButton>
        <UI.MicroButton effect="glare">Deploy</UI.MicroButton>
      </div>
    ),
    code: `import { MicroButton } from '@a4ui/core'

<MicroButton effect="sparkle"><Sparkles size={16} /></MicroButton>
<MicroButton effect="glare">Deploy</MicroButton>`,
    variants: [
      {
        label: 'spin',
        demo: () => (
          <UI.MicroButton effect="spin" variant="ghost" aria-label="spin">
            <Settings size={16} />
          </UI.MicroButton>
        ),
      },
      {
        label: 'shake',
        demo: () => (
          <UI.MicroButton effect="shake" variant="outline" aria-label="shake">
            <Zap size={16} />
          </UI.MicroButton>
        ),
      },
      {
        label: 'pulse',
        demo: () => (
          <UI.MicroButton effect="pulse" aria-label="pulse">
            <Heart size={16} />
          </UI.MicroButton>
        ),
      },
      {
        label: 'ring',
        demo: () => (
          <UI.MicroButton effect="ring" variant="outline" aria-label="ring">
            <Bell size={16} />
          </UI.MicroButton>
        ),
      },
      {
        label: 'sparkle',
        demo: () => (
          <UI.MicroButton effect="sparkle" aria-label="sparkle">
            <Sparkles size={16} />
          </UI.MicroButton>
        ),
      },
      { label: 'glare (hover)', demo: () => <UI.MicroButton effect="glare">Deploy App</UI.MicroButton> },
    ],
  },
  {
    id: 'icon-morph-button',
    title: 'IconMorphButton',
    group: 'Actions',
    blurb:
      'A two-state icon toggle whose glyph morphs — spring scale + rotate + fade — between states: copy→check, mute, theme. Click ↓',
    demo: () => (
      <div class="flex flex-wrap items-center gap-3">
        <UI.IconMorphButton
          inactive={<Copy size={18} />}
          active={<Check size={18} />}
          aria-label="Copy install command"
          revertAfter={1500}
          label="Copy"
          activeLabel="Copied"
          variant="outline"
        />
        <UI.IconMorphButton
          inactive={<Volume2 size={18} />}
          active={<VolumeX size={18} />}
          aria-label="Mute"
        />
        <UI.IconMorphButton
          inactive={<Sun size={18} />}
          active={<Moon size={18} />}
          aria-label="Toggle theme"
        />
      </div>
    ),
    code: `import { IconMorphButton } from '@a4ui/core'
import { Copy, Check } from 'lucide-solid'

<IconMorphButton
  inactive={<Copy size={18} />} active={<Check size={18} />}
  revertAfter={1500} label="Copy" activeLabel="Copied"
  onChange={(p) => p && navigator.clipboard?.writeText(text)}
/>`,
  },
  {
    id: 'like-button',
    title: 'LikeButton',
    group: 'Actions',
    blurb:
      'Like / favorite / save toggle (heart · star · bookmark via one `icon` prop) with a spring pop and a staggered icon burst. Click ↓',
    demo: () => (
      <div class="flex items-center gap-6">
        <UI.LikeButton defaultPressed count={128} showCount aria-label="Like this post" />
        <UI.LikeButton icon="star" aria-label="Add to favorites" />
        <UI.LikeButton icon="bookmark" aria-label="Save for later" />
      </div>
    ),
    code: `import { LikeButton } from '@a4ui/core'

<LikeButton count={128} showCount />
<LikeButton icon="star" />
<LikeButton icon="bookmark" />`,
    variants: [
      {
        label: 'heart + count',
        demo: () => <UI.LikeButton defaultPressed count={128} showCount aria-label="Like" />,
      },
      { label: 'star', demo: () => <UI.LikeButton icon="star" aria-label="Favorite" /> },
      { label: 'bookmark', demo: () => <UI.LikeButton icon="bookmark" aria-label="Save" /> },
    ],
  },
  {
    id: 'slide-arrow-button',
    title: 'SlideArrowButton',
    group: 'Actions',
    blurb:
      'A CTA where the label slides out and an arrow slides in from the opposite edge on hover — pure CSS transform. Hover ↓',
    demo: () => (
      <div class="flex flex-wrap items-center gap-3">
        <UI.SlideArrowButton>Get started</UI.SlideArrowButton>
        <UI.SlideArrowButton direction="left" variant="outline">
          Back
        </UI.SlideArrowButton>
      </div>
    ),
    code: `import { SlideArrowButton } from '@a4ui/core'

<SlideArrowButton>Get started</SlideArrowButton>
<SlideArrowButton direction="left" variant="outline">Back</SlideArrowButton>`,
  },
  {
    id: 'focus-blur-group',
    title: 'FocusBlurGroup',
    group: 'Motion',
    blurb:
      'Hover or focus one item and it stays sharp while its siblings blur and dim — a spotlight for lists and navs. Hover a link ↓',
    demo: () => (
      <UI.FocusBlurGroup
        items={['Overview', 'Pricing', 'Docs', 'Changelog', 'Blog']}
        class="flex flex-wrap gap-6 text-sm font-medium text-foreground"
      >
        {(label) => (
          <a href="#/motion-magnetic" class="cursor-pointer">
            {label}
          </a>
        )}
      </UI.FocusBlurGroup>
    ),
    code: `import { FocusBlurGroup } from '@a4ui/core'

<FocusBlurGroup items={links} class="flex gap-6">
  {(link) => <a href={link.href}>{link.label}</a>}
</FocusBlurGroup>`,
  },
  {
    id: 'card-spread',
    title: 'CardSpread',
    group: 'Motion',
    blurb:
      'A stack of cards that fans out into an arc, line, corner, cascade, scatter or wheel. Hover the stack ↓ (the Variations below are pinned open).',
    demo: () => <UI.CardSpread aria-label="Sample cards" items={demoCards()} />,
    code: `import { CardSpread } from '@a4ui/core'

<CardSpread layout="arc" items={[<Card>Day 1</Card>, <Card>Day 2</Card>, /* … */]} />`,
    variants: [
      { label: 'arc', demo: () => <UI.CardSpread open layout="arc" items={demoCards()} /> },
      { label: 'long-arc', demo: () => <UI.CardSpread open layout="long-arc" items={demoCards()} /> },
      { label: 'linear', demo: () => <UI.CardSpread open layout="linear" items={demoCards()} /> },
      { label: 'corner', demo: () => <UI.CardSpread open layout="corner" items={demoCards()} /> },
      { label: 'cascade', demo: () => <UI.CardSpread open layout="cascade" items={demoCards()} /> },
      { label: 'scatter', demo: () => <UI.CardSpread open layout="scatter" items={demoCards()} /> },
      { label: 'wheel', demo: () => <UI.CardSpread open layout="wheel" items={demoCards()} /> },
    ],
  },
  {
    id: 'carousel-3d',
    title: 'Carousel3D',
    group: 'Motion',
    blurb:
      'A 3D coverflow / arc carousel — slides curve back around the active one. Drag, use the arrows, the dots, or ← → keys ↓',
    demo: () => (
      <UI.Carousel3D
        slides={demoPanels(['Ridge Loop', 'Falls Overlook', 'Summit Pass', 'Coastal Trail', 'Pine Descent'])}
      />
    ),
    code: `import { Carousel3D } from '@a4ui/core'

<Carousel3D variant="coverflow" slides={[<Card>A</Card>, <Card>B</Card>, /* … */]} />`,
    variants: [
      {
        label: 'coverflow',
        demo: () => <UI.Carousel3D variant="coverflow" slides={demoPanels(['A', 'B', 'C', 'D', 'E'])} />,
      },
      {
        label: 'arc',
        demo: () => <UI.Carousel3D variant="arc" slides={demoPanels(['A', 'B', 'C', 'D', 'E'])} />,
      },
    ],
  },
  {
    id: 'time-machine-stack',
    title: 'TimeMachineStack',
    group: 'Motion',
    blurb:
      'An Apple-style depth stack: the active card is front and the rest recede into the screen. Use the scrubber on the right or ↑ ↓ keys ↓',
    demo: () => (
      <UI.TimeMachineStack
        slides={demoPanels([
          'Sunset over the bay',
          'Empty beach at dawn',
          'Fog through the pines',
          'City lights',
          'Desert road',
        ])}
      />
    ),
    code: `import { TimeMachineStack } from '@a4ui/core'

<TimeMachineStack slides={[<Card>One</Card>, <Card>Two</Card>, /* … */]} />`,
  },
]

// Names → docs route, for linkifying component/utility mentions inside the
// rendered markdown guides (e.g. every `ComponentName` in the changelog becomes
// a link to its page). Built from the registry so it never drifts; a few aliases
// cover CSS utilities and layout pieces that aren't their own DocEntry.
const GUIDE_LINK_ALIASES: Record<string, string> = {
  '.glass-refractive': '#/refractive-glass',
  '.elevation-1': '#/refractive-glass',
  '.elevation-4': '#/refractive-glass',
  Aurora: '#/aurora',
}
export function changelogComponentLinks(): Record<string, string> {
  const map: Record<string, string> = { ...GUIDE_LINK_ALIASES }
  for (const d of DOCS) if (!d.guide) map[d.title] = `#/${d.id}`
  return map
}
