// Preview site: AppShell (starfield + page transition) with a full-width topbar,
// a Home landing, and a Bootstrap/Tailwind-style docs area. The docs registry,
// command palette, and live theme-settings drawer are lazy-loaded so the Home
// landing ships a minimal bundle.
import { Settings as SettingsIcon, Search as SearchIcon } from 'lucide-solid'
import { createEffect, createSignal, lazy, onCleanup, onMount, Show, Suspense, type JSX } from 'solid-js'

import { AppShell, Button, Drawer, EffectsToggle, initTheme, ThemeToggle, Toaster } from '../src'
import { Home } from './Home'
import { ThemeSelect } from './ThemeSelect'

const DocContent = lazy(() => import('./Docs').then((m) => ({ default: m.DocContent })))
const DocsNav = lazy(() => import('./DocsNav').then((m) => ({ default: m.DocsNav })))
const CommandPalette = lazy(() => import('./CommandPalette'))
const SettingsDrawer = lazy(() => import('./SettingsDrawer').then((m) => ({ default: m.SettingsDrawer })))

const FIRST_DOC = 'instalacion'

type View = { kind: 'home' } | { kind: 'docs'; id: string }

// Deep-link support: #/<id> = that doc, empty = Home.
function viewFromHash(): View {
  const id = decodeURIComponent(location.hash.replace(/^#\/?/, '')).trim()
  return id ? { kind: 'docs', id } : { kind: 'home' }
}

export function App(): JSX.Element {
  const [view, setView] = createSignal<View>(viewFromHash())
  const [navOpen, setNavOpen] = createSignal(false)
  const [cmdkOpen, setCmdkOpen] = createSignal(false)
  const [cmdkMounted, setCmdkMounted] = createSignal(false)
  const [settingsOpen, setSettingsOpen] = createSignal(false)
  const [settingsMounted, setSettingsMounted] = createSignal(false)

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
  const openSettings = () => {
    setSettingsMounted(true)
    setSettingsOpen(true)
  }

  // Restore the saved theme (palette) on boot, then wire ⌘K / Ctrl+K.
  onMount(() => {
    initTheme()
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
    <header class="bg-glass sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-6">
      <div class="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          class="text-lg font-bold tracking-tight"
          onClick={() => setView({ kind: 'home' })}
        >
          A4ui
        </button>
        <nav class="flex items-center gap-1">
          {/* Home is hidden on mobile — the A4ui brand already returns home. */}
          <Button
            class="hidden sm:inline-flex"
            variant={navVariant(view().kind === 'home')}
            onClick={() => setView({ kind: 'home' })}
          >
            Home
          </Button>
          <Button variant={navVariant(isDocs())} onClick={() => openDocs()}>
            Docs
          </Button>
        </nav>
      </div>
      <div class="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={openCmdk}
          class="inline-flex items-center gap-2 rounded-md border border-border bg-card/50 p-2 text-sm text-muted-foreground transition hover:text-foreground sm:px-3 sm:py-1.5"
          aria-label="Search components"
        >
          <SearchIcon class="h-4 w-4 sm:hidden" />
          <span class="hidden sm:inline">Search</span>
          <kbd class="hidden rounded border border-border px-1 text-[10px] sm:inline">⌘K</kbd>
        </button>
        <ThemeSelect />
        <button
          type="button"
          onClick={openSettings}
          class="grid h-9 w-9 place-items-center rounded-md border border-border bg-card/50 text-muted-foreground transition hover:text-foreground"
          aria-label="Theme settings"
          title="Theme settings"
        >
          <SettingsIcon class="h-4 w-4" />
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

      {/* Live theme-settings drawer (lazy; mounted on first open). Non-modal — the
          whole site recolors behind it as you edit. */}
      <Show when={settingsMounted()}>
        <Suspense>
          <SettingsDrawer open={settingsOpen()} onOpenChange={setSettingsOpen} />
        </Suspense>
      </Show>

      <Toaster />
    </>
  )
}
