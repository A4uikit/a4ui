// Landing / home view for the a4ui catalog. Dogfoods Card/Button/Badge and the
// glass surfaces. Rendered inside App's AppShell (starfield + page transition).
import { For, type JSX } from 'solid-js'

import { Badge, Button, Card, themes } from '../src'

const LAYERS = [
  {
    tag: 'Behavior',
    tech: 'Kobalte',
    desc: 'Focus, keyboard, ARIA, and portals — correct accessibility out of the box.',
    icon: '⌨️',
  },
  {
    tag: 'Motion',
    tech: 'solid-transition-group + motionone',
    desc: 'Short, functional transitions, count-up, and calm mode. Respects reduced-motion.',
    icon: '🎞️',
  },
  {
    tag: 'Visual',
    tech: 'Tailwind preset + tokens',
    desc: 'Glassmorphism, starfield background, glow, and light/dark theme via tokens.',
    icon: '🪟',
  },
]

const STATS = [
  { n: '40+', label: 'components' },
  { n: '6', label: 'helpers' },
  { n: String(themes.length), label: 'themes' },
  { n: '10k+', label: 'virtualized rows' },
]

const REPO_URL = 'https://github.com/A4uikit/a4ui'

// Google Lighthouse scores, measured live on the deployed site (desktop).
const SCORES = [
  { n: '97', label: 'Performance' },
  { n: '100', label: 'Accessibility' },
  { n: '100', label: 'Best Practices' },
  { n: '100', label: 'SEO' },
]

const CATEGORIES = [
  { title: 'Actions', items: 'Button · Dropdown' },
  { title: 'Data', items: 'Table · VirtualList · Pagination · Badge' },
  { title: 'Forms', items: 'Input · Select · Checkbox · DateField · Dropzone' },
  { title: 'Overlays', items: 'Modal · Drawer · Toast' },
  { title: 'Navigation', items: 'Tabs · Accordion · PageHeader' },
  { title: 'Layout', items: 'AppShell · SpaceBackground · NavGroup' },
]

export function Home(props: { onExplore: () => void }): JSX.Element {
  return (
    <div class="mx-auto max-w-4xl space-y-14 pb-24 pt-8">
      {/* Hero */}
      <section class="text-center">
        <Badge tone="info">Spatial Glass · SolidJS</Badge>
        <h1 class="mt-4 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
          A4ui
        </h1>
        <p class="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          The Rivera family's design system + component library. Install{' '}
          <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">a4ui</code> and get all the good
          design done for you — like Bootstrap/MUI, but with its own look.
        </p>
        <div class="mt-8 flex items-center justify-center gap-3">
          <Button onClick={props.onExplore}>Explore components →</Button>
          <Button variant="outline" onClick={() => window.open(REPO_URL, '_blank', 'noopener,noreferrer')}>
            GitHub
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <For each={STATS}>
          {(s) => (
            <Card glass class="p-5 text-center">
              <div class="text-3xl font-bold tabular-nums">{s.n}</div>
              <div class="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
            </Card>
          )}
        </For>
      </section>

      {/* Lighthouse scores (measured live) */}
      <section class="space-y-4">
        <h2 class="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Lighthouse scores
        </h2>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <For each={SCORES}>
            {(s) => (
              <Card glass glow class="p-5 text-center">
                <div class="flex items-baseline justify-center gap-1">
                  <span class="text-4xl font-bold tabular-nums text-primary">{s.n}</span>
                  <span class="text-sm text-muted-foreground">/100</span>
                </div>
                <div class="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
              </Card>
            )}
          </For>
        </div>
        <p class="text-center text-xs text-muted-foreground">
          Measured live on this deployed site with Google Lighthouse (desktop).{' '}
          <a
            href="https://a4uikit.github.io/a4ui/lighthouse.html"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary underline underline-offset-2"
          >
            View the report
          </a>
        </p>
      </section>

      {/* 3 capas */}
      <section class="space-y-5">
        <h2 class="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Three layers, one identity
        </h2>
        <div class="grid gap-4 md:grid-cols-3">
          <For each={LAYERS}>
            {(l) => (
              <Card glass class="p-6">
                <div class="text-2xl">{l.icon}</div>
                <h3 class="mt-3 text-lg font-semibold">{l.tag}</h3>
                <p class="mt-0.5 font-mono text-xs text-primary">{l.tech}</p>
                <p class="mt-2 text-sm text-muted-foreground">{l.desc}</p>
              </Card>
            )}
          </For>
        </div>
      </section>

      {/* Install */}
      <section class="space-y-4">
        <h2 class="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Installation
        </h2>
        <Card class="mx-auto max-w-2xl overflow-hidden">
          <pre class="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-foreground">
            <span class="text-muted-foreground"># install</span>
            {'\n'}npm install @a4ui/core{'\n\n'}
            <span class="text-muted-foreground">// tailwind.config.ts</span>
            {'\n'}import a4ui from '@a4ui/core/preset'{'\n'}
            export default {'{'} presets: [a4ui] {'}'}
            {'\n\n'}
            <span class="text-muted-foreground">// entry</span>
            {'\n'}import '@a4ui/core/styles.css'{'\n'}
            import {'{'} Button, Card, Modal {'}'} from '@a4ui/core'
          </pre>
        </Card>
      </section>

      {/* Categories */}
      <section class="space-y-5">
        <h2 class="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          What's included
        </h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <For each={CATEGORIES}>
            {(c) => (
              <Card glass class="p-5">
                <h3 class="font-semibold">{c.title}</h3>
                <p class="mt-1 text-sm text-muted-foreground">{c.items}</p>
              </Card>
            )}
          </For>
        </div>
        <div class="text-center">
          <Button variant="ghost" onClick={props.onExplore}>
            See all in the catalog →
          </Button>
        </div>
      </section>
    </div>
  )
}
