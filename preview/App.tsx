// Preview site: AppShell (starfield + page transition) with a full-width topbar,
// a Home landing, and a Bootstrap/Tailwind-style docs area (sidebar + per-component
// live examples). View state is a signal — no router dep needed for a preview.
import { createEffect, createSignal, Show, type JSX } from 'solid-js'

import { AppShell, Button, Drawer, EffectsToggle, ThemeToggle, Toaster } from '../src'
import { DocContent } from './Docs'
import { DocsNav } from './DocsNav'
import { Home } from './Home'
import { DOCS } from './registry'

type View = { kind: 'home' } | { kind: 'docs'; id: string }

// Deep-link support: #/button opens that doc; empty hash is Home.
function viewFromHash(): View {
  const id = decodeURIComponent(location.hash.replace(/^#\/?/, ''))
  return id && DOCS.some((d) => d.id === id) ? { kind: 'docs', id } : { kind: 'home' }
}

export function App(): JSX.Element {
  const [view, setView] = createSignal<View>(viewFromHash())
  const [navOpen, setNavOpen] = createSignal(false)
  createEffect(() => {
    const v = view()
    const next = v.kind === 'docs' ? `#/${v.id}` : ''
    if (location.hash !== next) location.hash = next
  })
  const isDocs = () => view().kind === 'docs'
  const selectedId = () => {
    const v = view()
    return v.kind === 'docs' ? v.id : ''
  }
  const openDocs = (id: string = DOCS[0].id) => setView({ kind: 'docs', id })

  const topbar = (
    <header class="bg-glass sticky top-0 z-20 flex items-center justify-between border-b border-border px-6 py-3">
      <div class="flex items-center gap-4">
        <button type="button" class="text-lg font-bold tracking-tight" onClick={() => setView({ kind: 'home' })}>
          A4ui
        </button>
        <nav class="flex items-center gap-1">
          <Button variant={view().kind === 'home' ? 'secondary' : 'ghost'} onClick={() => setView({ kind: 'home' })}>
            Inicio
          </Button>
          <Button variant={isDocs() ? 'secondary' : 'ghost'} onClick={() => openDocs()}>
            Docs
          </Button>
        </nav>
      </div>
      <div class="flex items-center gap-1">
        <EffectsToggle />
        <ThemeToggle />
      </div>
    </header>
  )

  return (
    <>
      <AppShell topbar={topbar}>
        <Show when={isDocs()} fallback={<Home onExplore={() => openDocs()} />}>
          <div class="flex gap-8">
            {/* Desktop sidebar. On mobile it's hidden — the ☰ button opens a Drawer. */}
            <aside class="hidden w-56 shrink-0 md:block">
              <div class="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pr-2">
                <DocsNav selected={selectedId()} onSelect={(id) => setView({ kind: 'docs', id })} />
              </div>
            </aside>
            <div class="min-w-0 flex-1">
              <button
                type="button"
                class="mb-4 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground md:hidden"
                onClick={() => setNavOpen(true)}
              >
                ☰ Componentes
              </button>
              <DocContent id={selectedId()} />
            </div>
          </div>
        </Show>
      </AppShell>

      {/* Mobile docs navigation (dogfoods the Drawer). */}
      <Drawer open={navOpen()} onOpenChange={setNavOpen} title="Componentes">
        <div class="p-4">
          <DocsNav
            selected={selectedId()}
            onSelect={(id) => {
              setView({ kind: 'docs', id })
              setNavOpen(false)
            }}
          />
        </div>
      </Drawer>

      <Toaster />
    </>
  )
}
