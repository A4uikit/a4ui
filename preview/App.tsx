// Preview site: AppShell (starfield + page transition) with a full-width topbar,
// a Home landing, and a Bootstrap/Tailwind-style docs area. The docs registry,
// command palette, and live theme-settings drawer are lazy-loaded so the Home
// landing ships a minimal bundle.
import { Settings as SettingsIcon, Search as SearchIcon } from 'lucide-solid'
import {
  createEffect,
  createSignal,
  For,
  lazy,
  Match,
  onCleanup,
  onMount,
  Show,
  Suspense,
  Switch,
  type JSX,
} from 'solid-js'

import {
  activeTheme,
  AppShell,
  Button,
  Drawer,
  EffectsToggle,
  initTheme,
  Skeleton,
  SpaceBackground,
  ThemeToggle,
  Toaster,
} from '../src'
import { Home } from './Home'
import { ThemeSelect } from './ThemeSelect'
import { applyOverrides } from './themeStore'

// The default space starfield is eager (it's what most visitors see first). The
// bespoke, theme-specific backdrops are lazy — they only render for snow /
// christmas / motif themes, so they stay out of the initial bundle.
const SnowScenery = lazy(() => import('../src/layout/SnowScenery').then((m) => ({ default: m.SnowScenery })))
const ChristmasBackground = lazy(() =>
  import('../src/layout/ChristmasBackground').then((m) => ({ default: m.ChristmasBackground })),
)
const ThemedScenery = lazy(() =>
  import('../src/layout/ThemedScenery').then((m) => ({ default: m.ThemedScenery })),
)

// Backdrop follows the active theme: space keeps its starfield; snow and
// christmas have bespoke scenery; every other theme gets the token-tinted
// ThemedScenery with its motifs.
function Scenery(): JSX.Element {
  return (
    <Suspense fallback={<div class="fixed inset-0 -z-10 bg-background" />}>
      <Switch fallback={<SpaceBackground />}>
        <Match when={activeTheme().name === 'snow'}>
          <SnowScenery />
        </Match>
        <Match when={activeTheme().name === 'christmas'}>
          <ChristmasBackground />
        </Match>
        <Match when={activeTheme().motifs}>{(motifs) => <ThemedScenery motifs={motifs()} />}</Match>
      </Switch>
    </Suspense>
  )
}

const HeroShowcase = lazy(() => import('./HeroShowcase').then((m) => ({ default: m.HeroShowcase })))
const DocContent = lazy(() => import('./Docs').then((m) => ({ default: m.DocContent })))

// Shown while the docs/registry chunk streams in on the first navigation to a
// component — a skeleton of the doc page (title · blurb · demo · code) so it
// never flashes blank. Uses the real <Skeleton> since the app JS is already up.
function DocSkeleton(): JSX.Element {
  return (
    <div class="space-y-4">
      <Skeleton class="h-8 w-56" />
      <Skeleton class="h-4 w-full max-w-2xl" />
      <Skeleton class="h-4 w-2/3 max-w-xl" />
      <Skeleton class="mt-3 h-64 w-full rounded-xl" />
      <Skeleton class="h-40 w-full rounded-xl" />
    </div>
  )
}

// Grid of placeholder cards for the examples gallery's first load.
function GridSkeleton(): JSX.Element {
  return (
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <For each={Array.from({ length: 6 })}>{() => <Skeleton class="h-40 w-full rounded-xl" />}</For>
    </div>
  )
}

// Full docs page (sidebar + content) while the shared registry chunk loads.
function DocsPageSkeleton(): JSX.Element {
  return (
    <div class="flex gap-8">
      <aside class="hidden w-56 shrink-0 space-y-2 md:block">
        <For each={Array.from({ length: 10 })}>{() => <Skeleton class="h-6 w-full" />}</For>
      </aside>
      <div class="min-w-0 flex-1">
        <DocSkeleton />
      </div>
    </div>
  )
}
const DocsNav = lazy(() => import('./DocsNav').then((m) => ({ default: m.DocsNav })))
const CommandPalette = lazy(() => import('./CommandPalette'))
const SettingsDrawer = lazy(() => import('./SettingsDrawer').then((m) => ({ default: m.SettingsDrawer })))
const ExamplesGallery = lazy(() => import('./Examples').then((m) => ({ default: m.ExamplesGallery })))
const ExampleView = lazy(() => import('./Examples').then((m) => ({ default: m.ExampleView })))

// Brand marks (lucide dropped its logo icons) — monochrome, follow currentColor.
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
  </svg>
)
const NpmIcon = () => (
  <svg viewBox="0 0 18 7" fill="currentColor" class="h-auto w-6" aria-hidden="true">
    <path d="M0 0h18v6H9v1H5V6H0V0zm1 5h2V2h1v3h1V1H1v4zm5-4v5h2V5h2V1H6zm2 1h1v2H8V2zm3-1v4h2V2h1v3h1V2h1v3h1V1h-6z" />
  </svg>
)

const FIRST_DOC = 'instalacion'

type View =
  | { kind: 'home' }
  | { kind: 'docs'; id: string }
  | { kind: 'examples' }
  | { kind: 'example'; id: string }
  | { kind: 'hero' } // hidden capture route for the README hero banner

// Deep-link support: #/examples = gallery, #/examples/<id> = one example,
// #/hero = the hero showcase (capture target), #/<id> = that doc, empty = Home.
function viewFromHash(): View {
  const raw = decodeURIComponent(location.hash.replace(/^#\/?/, '')).trim()
  if (raw === 'examples') return { kind: 'examples' }
  if (raw.startsWith('examples/')) return { kind: 'example', id: raw.slice('examples/'.length) }
  if (raw === 'hero') return { kind: 'hero' }
  return raw ? { kind: 'docs', id: raw } : { kind: 'home' }
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
    const next =
      v.kind === 'docs'
        ? `#/${v.id}`
        : v.kind === 'examples'
          ? '#/examples'
          : v.kind === 'example'
            ? `#/examples/${v.id}`
            : v.kind === 'hero'
              ? '#/hero'
              : ''
    if (location.hash !== next) location.hash = next
  })

  const isDocs = () => view().kind === 'docs'
  const inExamples = () => view().kind === 'examples' || view().kind === 'example'
  const selectedId = () => {
    const v = view()
    return v.kind === 'docs' || v.kind === 'example' ? v.id : ''
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

  // Restore the saved theme (palette) + any session token edits on boot, then
  // wire ⌘K / Ctrl+K.
  onMount(() => {
    initTheme()
    applyOverrides()
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        openCmdk()
      }
    }
    // Keep the view in sync with the URL hash so deep links, the browser
    // back/forward buttons, and manual hash edits all work.
    const onHash = () => setView(viewFromHash())
    window.addEventListener('keydown', onKey)
    window.addEventListener('hashchange', onHash)
    onCleanup(() => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('hashchange', onHash)
    })
  })

  const navVariant = (active: boolean) => (active ? 'secondary' : 'ghost')

  const topbar = (
    <header class="bg-glass sticky top-0 z-20 flex items-center justify-between gap-1.5 border-b border-border px-2 py-3 sm:gap-2 sm:px-6">
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
          <Button variant={navVariant(inExamples())} onClick={() => setView({ kind: 'examples' })}>
            Examples
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
        <a
          href="https://github.com/A4uikit/a4ui"
          target="_blank"
          rel="noopener noreferrer"
          class="hidden h-9 w-9 place-items-center rounded-md border border-border bg-card/50 text-muted-foreground transition hover:text-foreground sm:grid"
          aria-label="GitHub repository"
          title="GitHub"
        >
          <GithubIcon />
        </a>
        <a
          href="https://www.npmjs.com/package/@a4ui/core"
          target="_blank"
          rel="noopener noreferrer"
          class="hidden h-9 w-9 place-items-center rounded-md border border-border bg-card/50 text-muted-foreground transition hover:text-foreground sm:grid"
          aria-label="npm package"
          title="npm"
        >
          <NpmIcon />
        </a>
        {/* Hidden on mobile to keep the topbar within 390px (calm-mode is a
            power-user toggle; it stays available from small screens up). */}
        <span class="hidden sm:inline-flex">
          <EffectsToggle />
        </span>
        <ThemeToggle />
      </div>
    </header>
  )

  return (
    <>
      <AppShell topbar={topbar} background={<Scenery />} maxWidth="1600px">
        <Switch fallback={<Home onExplore={() => openDocs()} />}>
          <Match when={view().kind === 'hero'}>
            <Suspense>
              <HeroShowcase />
            </Suspense>
          </Match>
          <Match when={view().kind === 'examples'}>
            <Suspense fallback={<GridSkeleton />}>
              <ExamplesGallery onOpen={(id) => setView({ kind: 'example', id })} />
            </Suspense>
          </Match>
          <Match when={view().kind === 'example'}>
            <Suspense fallback={<DocSkeleton />}>
              <ExampleView id={selectedId()} onBack={() => setView({ kind: 'examples' })} />
            </Suspense>
          </Match>
          <Match when={isDocs()}>
            {/* One boundary for the whole docs page: on the first visit BOTH the
                sidebar nav and the content are lazy (they share the registry
                chunk), so a single skeleton covers them instead of a bare spinner. */}
            <Suspense fallback={<DocsPageSkeleton />}>
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
            </Suspense>
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
