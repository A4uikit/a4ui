// Example template — Landing / marketing page. Full-page composition dogfooding A4ui.
// Theme-agnostic: only semantic tokens/utilities, so it reskins under any theme.
import { createSignal, For, onMount, type JSX } from 'solid-js'
import { Zap, Shield, Boxes, Palette, Gauge, Search } from 'lucide-solid'

import {
  Button,
  Card,
  Badge,
  Marquee,
  Highlight,
  Collapse,
  TagInput,
  RingProgress,
  BackToTop,
  revealOnScroll,
} from '../../src'

interface Feature {
  icon: (props: { class?: string }) => JSX.Element
  title: string
  body: string
}

const FEATURES: Feature[] = [
  {
    icon: Zap,
    title: 'Fast by default',
    body: 'Compositor-only transitions and lean primitives keep every interaction at 60fps.',
  },
  {
    icon: Palette,
    title: 'Theme-agnostic',
    body: 'Semantic tokens mean components reskin under any theme with zero component edits.',
  },
  {
    icon: Boxes,
    title: 'Composable',
    body: 'Small, focused primitives you assemble — no monolithic widgets, no lock-in.',
  },
  {
    icon: Shield,
    title: 'Accessible',
    body: 'Built on Kobalte where it matters, with focus rings and ARIA baked in.',
  },
  {
    icon: Gauge,
    title: 'Tiny footprint',
    body: 'Tree-shakeable SolidJS with no runtime bloat, so bundles stay small.',
  },
  {
    icon: Search,
    title: 'DX-first',
    body: 'Typed props, sensible defaults, and copy-paste examples for every component.',
  },
]

const TRUSTED = ['Northwind', 'Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Soylent', 'Stark']

interface Stat {
  value: number
  label: string
  caption: string
}

const STATS: Stat[] = [
  { value: 99, label: '99%', caption: 'Uptime SLA' },
  { value: 87, label: '87', caption: 'Components' },
  { value: 64, label: '64k', caption: 'Weekly installs' },
  { value: 42, label: '4.2k', caption: 'GitHub stars' },
]

interface Faq {
  q: string
  a: string
}

const FAQS: Faq[] = [
  {
    q: 'Is A4ui free to use?',
    a: 'Yes — A4ui is open source and MIT licensed. Use it in personal and commercial projects.',
  },
  {
    q: 'Does it support dark mode?',
    a: 'It supports any theme. Every component reads semantic tokens, so light, dark, and custom themes all just work.',
  },
  {
    q: 'Which framework does it target?',
    a: 'A4ui is built for SolidJS and ships fully typed, tree-shakeable components.',
  },
  {
    q: 'Can I customize the components?',
    a: 'Absolutely. Pass a class to override styles, or retheme globally by swapping token values.',
  },
]

const SAMPLE = 'A4ui is a theme-agnostic SolidJS component library built with semantic Tailwind tokens.'

export default function Landing(): JSX.Element {
  const [query, setQuery] = createSignal('theme')
  const [open, setOpen] = createSignal<number | null>(0)
  const [interests, setInterests] = createSignal<string[]>(['solid', 'design-systems'])

  let marqueeEl: HTMLElement | undefined
  let featuresEl: HTMLElement | undefined
  let statsEl: HTMLElement | undefined
  let faqEl: HTMLElement | undefined
  let newsletterEl: HTMLElement | undefined

  onMount(() => {
    if (marqueeEl) revealOnScroll(marqueeEl, { amount: 0.15 })
    if (featuresEl) revealOnScroll(featuresEl, { amount: 0.15 })
    if (statsEl) revealOnScroll(statsEl, { amount: 0.15 })
    if (faqEl) revealOnScroll(faqEl, { amount: 0.15 })
    if (newsletterEl) revealOnScroll(newsletterEl, { amount: 0.15 })
  })

  return (
    <div class="mx-auto max-w-7xl space-y-16 py-8">
      {/* Hero */}
      <section class="mx-auto max-w-3xl text-center">
        <Badge tone="info">v0.4.0 now available</Badge>
        <h1 class="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Build beautiful UIs, faster</h1>
        <p class="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          A theme-agnostic SolidJS component library. Ship polished, accessible interfaces without fighting
          your design system.
        </p>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary" class="px-5">
            Get started
          </Button>
          <Button variant="outline" class="px-5">
            View on GitHub
          </Button>
        </div>
      </section>

      {/* Trusted by marquee */}
      <section ref={marqueeEl} class="space-y-4">
        <p class="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Trusted by teams at
        </p>
        <Marquee speed={28}>
          <For each={TRUSTED}>
            {(name) => (
              <span class="mx-4 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground">
                {name}
              </span>
            )}
          </For>
        </Marquee>
      </section>

      {/* Features grid */}
      <section ref={featuresEl} class="space-y-8">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-3xl font-bold tracking-tight">Everything you need</h2>
          <p class="mt-3 text-muted-foreground">
            A complete toolkit of primitives that compose into anything.
          </p>
        </div>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <For each={FEATURES}>
            {(feature) => (
              <Card class="p-6">
                <div class="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon class="h-5 w-5" />
                </div>
                <h3 class="mt-4 text-base font-semibold">{feature.title}</h3>
                <p class="mt-2 text-sm text-muted-foreground">{feature.body}</p>
              </Card>
            )}
          </For>
        </div>
      </section>

      {/* Stats band */}
      <section ref={statsEl} class="rounded-xl border border-border bg-card p-8">
        <div class="grid grid-cols-2 gap-8 md:grid-cols-4">
          <For each={STATS}>
            {(stat) => (
              <div class="flex flex-col items-center gap-3 text-center">
                <RingProgress
                  value={stat.value}
                  label={<span class="text-sm font-semibold">{stat.label}</span>}
                />
                <span class="text-sm text-muted-foreground">{stat.caption}</span>
              </div>
            )}
          </For>
        </div>
      </section>

      {/* Search preview with Highlight */}
      <section class="mx-auto max-w-2xl space-y-4">
        <div class="text-center">
          <h2 class="text-2xl font-bold tracking-tight">Search that finds it</h2>
          <p class="mt-2 text-sm text-muted-foreground">
            Type below to see matches highlighted in real time.
          </p>
        </div>
        <input
          type="text"
          value={query()}
          onInput={(ev) => setQuery(ev.currentTarget.value)}
          placeholder="Search…"
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <Card class="p-4">
          <Highlight text={SAMPLE} query={query()} class="text-sm leading-relaxed text-foreground" />
        </Card>
      </section>

      {/* FAQ via Collapse items */}
      <section ref={faqEl} class="mx-auto max-w-2xl space-y-4">
        <div class="text-center">
          <h2 class="text-3xl font-bold tracking-tight">Frequently asked questions</h2>
        </div>
        <div class="divide-y divide-border rounded-xl border border-border">
          <For each={FAQS}>
            {(faq, i) => (
              <Collapse
                open={open() === i()}
                onOpenChange={(next) => setOpen(next ? i() : null)}
                title={faq.q}
                class="px-1 py-1"
              >
                {faq.a}
              </Collapse>
            )}
          </For>
        </div>
      </section>

      {/* Newsletter / interests */}
      <section ref={newsletterEl} class="rounded-xl border border-border bg-card p-8">
        <div class="mx-auto max-w-2xl space-y-4 text-center">
          <h2 class="text-2xl font-bold tracking-tight">Stay in the loop</h2>
          <p class="text-sm text-muted-foreground">
            Tell us what you care about and we'll tailor the updates you receive.
          </p>
          <div class="flex flex-col gap-3 sm:flex-row">
            <TagInput
              value={interests()}
              onChange={setInterests}
              placeholder="Add an interest…"
              class="flex-1 text-left"
            />
            <Button variant="primary" class="shrink-0 px-5">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <BackToTop threshold={200} />
    </div>
  )
}
