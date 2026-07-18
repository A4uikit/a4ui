// Preview site: AppShell (starfield + page transition) with a full-width topbar,
// a Home landing, a Bootstrap/Tailwind-style docs area, and a live Theme Builder.
// The docs registry, command palette, and theme builder are lazy-loaded so the
// Home landing ships a minimal bundle.
import {
  createEffect,
  createSignal,
  lazy,
  Match,
  onCleanup,
  onMount,
  Show,
  Suspense,
  Switch,
  type JSX,
} from 'solid-js'

import { AppShell, Button, Drawer, EffectsToggle, ThemeToggle, Toaster } from '../src'
import { Home } from './Home'

const DocContent = lazy(() => import('./Docs').then((m) => ({ default: m.DocContent })))
const DocsNav = lazy(() => import('./DocsNav').then((m) => ({ default: m.DocsNav })))
const CommandPalette = lazy(() => import('./CommandPalette'))
const ThemeBuilder = lazy(() => import('./ThemeBuilder'))

const FIRST_DOC = 'instalacion'
const BUILDER_HASH = 'theme-builder'

type View = { kind: 'home' } | { kind: 'docs'; id: string } | { kind: 'builder' }

// Deep-link support: #/theme-builder = builder, #/<id> = that doc, empty = Home.
function viewFromHash(): View {
  const id = decodeURIComponent(location.hash.replace(/^#\/?/, '')).trim()
  if (id === BUILDER_HASH) return { kind: 'builder' }
  return id ? { kind: 'docs', id } : { kind: 'home' }
}

export function App(): JSX.Element {
  const [view, setView] = createSignal<View>(viewFromHash())
  const [navOpen, setNavOpen] = createSignal(false)
  const [cmdkOpen, setCmdkOpen] = createSignal(false)
  const [cmdkMounted, setCmdkMounted] = createSignal(false)

  createEffect(() => {
    const v = view()
    const next = v.kind === 'docs' ? `#/${v.id}` : v.kind === 'builder' ? `#/${BUILDER_HASH}` : ''
    if (location.hash !== next) location.hash = next
  })

  const kind = () => view().kind
  const selectedId = () => {
    const v = view()
    return v.kind === 'docs' ? v.id : ''
  }
  const openDocs = (id: string = FIRST_DOC) => setView({ kind: 'docs', id })
  const openBuilder = () => setView({ kind: 'builder' })
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

  const navVariant = (active: boolean) => (active ? 'secondary' : 'ghost')

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
          <Button variant={navVariant(kind() === 'home')} onClick={() => setView({ kind: 'home' })}>
            Home
          </Button>
          <Button variant={navVariant(kind() === 'docs')} onClick={() => openDocs()}>
            Docs
          </Button>
          <Button variant={navVariant(kind() === 'builder')} onClick={openBuilder}>
            Theme
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
        <Switch fallback={<Home onExplore={() => openDocs()} />}>
          <Match when={kind() === 'builder'}>
            <Suspense>
              <ThemeBuilder />
            </Suspense>
          </Match>
          <Match when={kind() === 'docs'}>
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
          </Match>
        </Switch>
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
