// Landing / home view for the a4ui catalog. Rendered inside App's AppShell
// (starfield + page transition). The live panels are lazy-loaded so the copy and
// the calls to action paint without waiting for charts and forms.
import { For, lazy, Suspense, type JSX } from 'solid-js'

import { Badge, Button, Card, Skeleton, themes } from '../src'

// Entry count per docs group, derived from preview/registry.tsx at build time
// (see vite.preview.config.ts) so these numbers cannot go stale. Importing the
// registry here would pull every demo into the first paint.
declare const __A4UI_DOC_COUNTS__: Record<string, number>

const HeroPanel = lazy(() => import('./HomeShowcase').then((m) => ({ default: m.HeroPanel })))
const ShowcaseGrid = lazy(() => import('./HomeShowcase').then((m) => ({ default: m.ShowcaseGrid })))

const REPO_URL = 'https://github.com/A4uikit/a4ui'

const CATEGORIES = [
  { title: 'Actions', href: '#/button', items: 'Button · ButtonGroup · Dropdown · HoldToConfirm' },
  { title: 'Forms', href: '#/field', items: 'Field · InputGroup · Combobox · DateField · Questionnaire' },
  { title: 'Data', href: '#/data-grid', items: 'DataGrid · VirtualList · Kanban · GanttChart · Tree' },
  { title: 'Commerce', href: '#/product-card', items: 'ProductCard · CartSummary · PriceTag' },
  { title: 'Charts', href: '#/bar-chart', items: 'BarChart · AreaChart · PieChart · RadialBarChart' },
  { title: 'Overlays', href: '#/modal', items: 'Modal · Drawer · Popover · AlertDialog · Command' },
  { title: 'Feedback', href: '#/alert', items: 'Alert · Toast · Progress · Skeleton' },
  { title: 'Navigation', href: '#/tabs', items: 'Tabs · Menubar · NavigationMenu · Breadcrumb' },
  { title: 'Layout', href: '#/sidebar', items: 'Sidebar · AppShell · ScrollArea · AspectRatio' },
  {
    title: 'Sections',
    href: '#/hero-section',
    items: 'Hero · FeatureGrid · Testimonials · Faq · SiteFooter',
  },
  { title: 'Motion', href: '#/motion-expandable', items: 'ScrambleText · Curtain · Expandable · Parallax' },
]

// Everything the catalog ships as a component: guides and setup pages excluded.
const componentCount = CATEGORIES.reduce((sum, c) => sum + (__A4UI_DOC_COUNTS__[c.title] ?? 0), 0)

const STATS = [
  { n: String(componentCount), label: 'Components' },
  { n: String(CATEGORIES.length), label: 'Categories' },
  { n: String(themes.length), label: 'Themes' },
  { n: '10k+', label: 'Virtualized rows' },
]

// Google Lighthouse scores, measured live on the deployed site (desktop).
const SCORES = [
  { n: '99', label: 'Performance' },
  { n: '100', label: 'Accessibility' },
  { n: '100', label: 'Best Practices' },
  { n: '100', label: 'SEO' },
]

const LAYERS = [
  {
    tag: 'Behavior',
    tech: 'Kobalte',
    desc: 'Focus, keyboard, ARIA, and portals: correct accessibility out of the box.',
    icon: '⌨️',
  },
  {
    tag: 'Motion',
    tech: 'Motion (motion.dev)',
    desc: 'Springs, scroll reveals, count-up, and calm mode. Respects reduced-motion.',
    icon: '🎞️',
  },
  {
    tag: 'Visual',
    tech: 'Tailwind preset + tokens',
    desc: 'Glassmorphism, starfield background, glow, and light/dark theme via tokens.',
    icon: '🪟',
  },
]

function SectionHeading(props: { title: string; blurb?: string }): JSX.Element {
  return (
    <div class="max-w-2xl">
      <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">{props.title}</h2>
      {props.blurb && <p class="mt-2 text-muted-foreground">{props.blurb}</p>}
    </div>
  )
}

export function Home(props: { onExplore: () => void }): JSX.Element {
  return (
    <div class="w-full space-y-16 pb-24 pt-4 lg:space-y-24 lg:pt-10" data-testid="home">
      {/* Hero */}
      <section class="grid items-center gap-10 lg:grid-cols-2 xl:gap-16">
        <div class="min-w-0">
          <Badge tone="info">Spatial Glass · SolidJS</Badge>
          <h1 class="mt-4 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl xl:text-7xl">
            A4ui
          </h1>
          <p class="mt-5 max-w-xl text-lg text-muted-foreground xl:text-xl">
            The Rivera family's design system + component library. Install{' '}
            <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">@a4ui/core</code> and get all the
            good design done for you, like Bootstrap/MUI, but with its own look.
          </p>
          <div class="mt-8 flex flex-wrap items-center gap-3">
            <Button onClick={props.onExplore}>Explore components →</Button>
            <Button variant="outline" onClick={() => window.open(REPO_URL, '_blank', 'noopener,noreferrer')}>
              GitHub
            </Button>
          </div>
        </div>
        <div class="min-h-[28rem] min-w-0">
          <Suspense fallback={<Skeleton class="h-[28rem] w-full rounded-xl" />}>
            <HeroPanel />
          </Suspense>
        </div>
      </section>

      {/* Numbers */}
      <section class="grid gap-4 lg:grid-cols-2" aria-label="Key numbers">
        <div class="grid grid-cols-2 content-start gap-4 sm:grid-cols-4" data-testid="home-stats">
          <For each={STATS}>
            {(s) => (
              <Card glass class="p-5 text-center">
                <div class="text-3xl font-bold tabular-nums">{s.n}</div>
                <div class="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
              </Card>
            )}
          </For>
        </div>
        <div class="space-y-2">
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <For each={SCORES}>
              {(s) => (
                <Card glass glow class="p-5 text-center">
                  <div class="flex items-baseline justify-center gap-1">
                    <span class="text-3xl font-bold tabular-nums text-primary">{s.n}</span>
                    <span class="text-sm text-muted-foreground">/100</span>
                  </div>
                  <div class="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
                </Card>
              )}
            </For>
          </div>
          <p class="text-xs text-muted-foreground">
            Measured live on this deployed site with Google Lighthouse (desktop).{' '}
            <a
              href="https://a4ui.pages.dev/lighthouse.html"
              target="_blank"
              rel="noopener noreferrer"
              class="font-medium text-foreground underline underline-offset-2 hover:text-primary"
            >
              View the report
            </a>
          </p>
        </div>
      </section>

      {/* Live components */}
      <section class="space-y-6">
        <SectionHeading
          title="Try it on this page"
          blurb="These are the real components, with working state. Type in the fields, change tabs and switch themes."
        />
        <Suspense fallback={<Skeleton class="h-[44rem] w-full rounded-xl" />}>
          <ShowcaseGrid />
        </Suspense>
      </section>

      {/* Layers + install */}
      <section class="grid gap-10 lg:grid-cols-2 xl:gap-16">
        <div class="min-w-0 space-y-6">
          <SectionHeading title="Three layers, one identity" />
          <div class="space-y-4">
            <For each={LAYERS}>
              {(l) => (
                <Card glass class="flex gap-4 p-5">
                  <div class="text-2xl" aria-hidden="true">
                    {l.icon}
                  </div>
                  <div class="min-w-0">
                    <h3 class="font-semibold">{l.tag}</h3>
                    <p class="mt-0.5 font-mono text-xs text-primary">{l.tech}</p>
                    <p class="mt-2 text-sm text-muted-foreground">{l.desc}</p>
                  </div>
                </Card>
              )}
            </For>
          </div>
        </div>
        <div class="flex min-w-0 flex-col gap-6">
          <SectionHeading title="Installation" />
          <Card class="flex-1 overflow-hidden">
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
              {'\n\n'}
              <span class="text-muted-foreground">// use it</span>
              {'\n'}export const Save = () =&gt; &lt;Button&gt;Save&lt;/Button&gt;
            </pre>
          </Card>
        </div>
      </section>

      {/* Categories */}
      <section class="space-y-6">
        <SectionHeading title="What's included" />
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <For each={CATEGORIES}>
            {(c) => (
              <a
                href={c.href}
                class="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card glass class="h-full p-5 transition group-hover:border-primary/50">
                  <div class="flex items-baseline justify-between gap-2">
                    <h3 class="font-semibold">{c.title}</h3>
                    <span class="text-xs tabular-nums text-muted-foreground">
                      {__A4UI_DOC_COUNTS__[c.title] ?? 0}
                    </span>
                  </div>
                  <p class="mt-1 text-sm text-muted-foreground">{c.items}</p>
                </Card>
              </a>
            )}
          </For>
          <Card glass class="grid h-full place-items-center p-5">
            <Button variant="ghost" onClick={props.onExplore}>
              See all in the catalog →
            </Button>
          </Card>
        </div>
      </section>
    </div>
  )
}
