// Preview site: AppShell (starfield + page transition) with a full-width topbar,
// a Home landing, and a Bootstrap/Tailwind-style docs area (sidebar + per-component
// live examples). The docs view (registry + every component demo) and the ⌘K
// command palette are lazy-loaded so the Home landing ships a minimal bundle.
import { createEffect, createSignal, lazy, onCleanup, onMount, Show, Suspense, type JSX } from 'solid-js'

import { AppShell, Button, Drawer, EffectsToggle, ThemeToggle, Toaster } from '../src'
import { Home } from './Home'

// Lazy: these pull the registry + all component demos into a separate chunk.
const DocContent = lazy(() => import('./Docs').then((m) => ({ default: m.DocContent })))
const DocsNav = lazy(() => import('./DocsNav').then((m) => ({ default: m.DocsNav })))
const CommandPalette = lazy(() => import('./CommandPalette'))

const FIRST_DOC = 'instalacion'

type View = { kind: 'home' } | { kind: 'docs'; id: string }

// Deep-link support: #/button opens that doc; empty hash is Home. We don't
// validate the id against the registry here (that would import it eagerly) —
// DocContent falls back to the first doc for an unknown id.
function viewFromHash(): View {
  const id = decodeURIComponent(location.hash.replace(/^#\/?/, '')).trim()
  return id ? { kind: 'docs', id } : { kind: 'home' }
}

export function App(): JSX.Element {
  const [view, setView] = createSignal<View>(viewFromHash())
  const [navOpen, setNavOpen] = createSignal(false)
  const [cmdkOpen, setCmdkOpen] = createSignal(false)
  const [cmdkMounted, setCmdkMounted] = createSignal(false) // keep mounted after first open for exit animation

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
  const openDocs = (id: string = FIRST_DOC) => setView({ kind: 'docs', id })
  const openCmdk = () => {
    setCmdkMounted(true)
    setCmdkOpen(true)
  }

  // Global ⌘K / Ctrl+K opens the command palette.
  onMount(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        openCmdk()
      }
    }
    window.addEventListener('keydown', onKey)
    onCleanup(() => window.removeEventListener('keydown', onKey))
  })

  const topbar = (
    <header class="bg-glass sticky top-0 z-20 flex items-center justify-between border-b border-border px-6 py-3">
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="text-lg font-bold tracking-tight"
          onClick={() => setView({ kind: 'home' })}
        >
          A4ui
        </button>
        <nav class="flex items-center gap-1">
          <Button
            variant={view().kind === 'home' ? 'secondary' : 'ghost'}
            onClick={() => setView({ kind: 'home' })}
          >
            Home
          </Button>
          <Button variant={isDocs() ? 'secondary' : 'ghost'} onClick={() => openDocs()}>
            Docs
          </Button>
        </nav>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          onClick={openCmdk}
          class="inline-flex items-center gap-2 rounded-md border border-border bg-card/50 px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
          aria-label="Search components"
        >
          Search
          <kbd class="hidden rounded border border-border px-1 text-[10px] sm:inline">⌘K</kbd>
        </button>
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
                ☰ Components
              </button>
              <DocContent id={selectedId()} />
            </div>
          </div>
        </Show>
      </AppShell>

      {/* Mobile docs navigation (dogfoods the Drawer). */}
      <Drawer open={navOpen()} onOpenChange={setNavOpen} title="Components">
        <div class="p-4">
          <Suspense>
            <DocsNav
              selected={selectedId()}
              onSelect={(id) => {
                setView({ kind: 'docs', id })
                setNavOpen(false)
              }}
            />
          </Suspense>
        </div>
      </Drawer>

      {/* ⌘K command palette (lazy; mounted on first open). */}
      <Show when={cmdkMounted()}>
        <Suspense>
          <CommandPalette open={cmdkOpen()} onOpenChange={setCmdkOpen} onSelect={(id) => openDocs(id)} />
        </Suspense>
      </Show>

      <Toaster />
    </>
  )
}
