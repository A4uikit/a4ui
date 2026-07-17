// Landing / home view for the a4ui catalog. Dogfoods Card/Button/Badge and the
// glass surfaces. Rendered inside App's AppShell (starfield + page transition).
import { For, type JSX } from 'solid-js'

import { Badge, Button, Card } from '../src'

const LAYERS = [
  {
    tag: 'Comportamiento',
    tech: 'Kobalte',
    desc: 'Foco, teclado, ARIA y portales — accesibilidad correcta de fábrica.',
    icon: '⌨️',
  },
  {
    tag: 'Movimiento',
    tech: 'solid-transition-group + motionone',
    desc: 'Transiciones cortas y funcionales, count-up, y modo calmado. Respeta reduced-motion.',
    icon: '🎞️',
  },
  {
    tag: 'Visual',
    tech: 'Tailwind preset + tokens',
    desc: 'Glassmorphism, fondo estelar, glow, y tema claro/oscuro por tokens.',
    icon: '🪟',
  },
]

const STATS = [
  { n: '40+', label: 'componentes' },
  { n: '6', label: 'helpers' },
  { n: '2', label: 'temas' },
  { n: '10k+', label: 'filas virtualizadas' },
]

const CATEGORIES = [
  { title: 'Acciones', items: 'Button · Dropdown' },
  { title: 'Datos', items: 'Table · VirtualList · Pagination · Badge' },
  { title: 'Formularios', items: 'Input · Select · Checkbox · DateField · Dropzone' },
  { title: 'Overlays', items: 'Modal · Drawer · Toast' },
  { title: 'Navegación', items: 'Tabs · Accordion · PageHeader' },
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
          El design system + librería de componentes de la familia Rivera. Instala <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">a4ui</code> y
          ten todo el diseño bueno hecho — como Bootstrap/MUI, pero con look propio.
        </p>
        <div class="mt-8 flex items-center justify-center gap-3">
          <Button onClick={props.onExplore}>Explorar componentes →</Button>
          <Button variant="outline" onClick={() => window.open('https://github.com', '_blank')}>
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

      {/* 3 capas */}
      <section class="space-y-5">
        <h2 class="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Tres capas, una identidad
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
        <h2 class="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">Instalación</h2>
        <Card class="mx-auto max-w-2xl overflow-hidden">
          <pre class="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-foreground">
            <span class="text-muted-foreground"># instalar</span>
            {'\n'}npm install @a4ui/core{'\n\n'}
            <span class="text-muted-foreground">// tailwind.config.ts</span>
            {'\n'}import a4ui from '@a4ui/core/preset'{'\n'}
            export default {'{'} presets: [a4ui] {'}'}{'\n\n'}
            <span class="text-muted-foreground">// entry</span>
            {'\n'}import '@a4ui/core/styles.css'{'\n'}
            import {'{'} Button, Card, Modal {'}'} from '@a4ui/core'
          </pre>
        </Card>
      </section>

      {/* Categorías */}
      <section class="space-y-5">
        <h2 class="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">Qué incluye</h2>
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
            Ver todos en el catálogo →
          </Button>
        </div>
      </section>
    </div>
  )
}
