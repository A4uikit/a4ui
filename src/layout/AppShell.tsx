// Generic app shell: the fixed SpaceBackground (z-0) behind a flex layout of an
// optional sidebar slot + a content column (optional banner + topbar + routed
// <main>). Unlike the source app's AppShell, this is slot-based and unopinionated
// about the sidebar — pass your own via the `sidebar` prop, and it manages its
// own width/collapse (the flex layout reflows the content column automatically,
// so no --sidebar-w padding coupling). The <main> is wrapped in Suspense + an
// ErrorBoundary so a route chunk failing or still loading never blanks the shell.
import { ErrorBoundary, Show, Suspense, type JSX, type ParentProps } from 'solid-js'

import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { SpaceBackground } from './SpaceBackground'

/** Props for {@link AppShell}. All slots are optional — pass only what your app needs. */
interface AppShellProps extends ParentProps {
  /** Left column (e.g. a Sidebar). Rendered as a flex child; owns its own width. */
  sidebar?: JSX.Element
  /** Top bar inside the content column, above <main>. */
  topbar?: JSX.Element
  /** Full-width strip above the topbar (e.g. a demo/announcement banner). */
  banner?: JSX.Element
  /** Fixed z-0 backdrop. Defaults to <SpaceBackground/>; pass a node to override,
      or `null` for a plain background. */
  background?: JSX.Element
  /** Max content width for <main>. Default '1400px'. */
  maxWidth?: string
  /** Override the default error fallback shown when a route throws. Receives
      the caught error and a `reset` callback that re-renders the ErrorBoundary's
      children. */
  errorFallback?: (err: unknown, reset: () => void) => JSX.Element
}

function defaultErrorFallback(err: unknown, reset: () => void): JSX.Element {
  return (
    <div class="mx-auto max-w-md py-20 text-center">
      <p class="text-lg font-semibold">Something went wrong loading this page</p>
      <p class="mt-1 break-words text-sm text-muted-foreground">{String((err as Error)?.message ?? err)}</p>
      <div class="mt-4 flex justify-center gap-2">
        <Button variant="outline" onClick={reset}>
          Retry
        </Button>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </div>
    </div>
  )
}

/**
 * Generic app shell: a fixed {@link SpaceBackground} behind a flex layout of
 * an optional sidebar slot plus a content column (optional banner + topbar +
 * routed `<main>`). Slot-based and unopinionated about the sidebar — pass
 * your own component via `sidebar` and it manages its own width/collapse.
 * `<main>` is wrapped in `Suspense` + an `ErrorBoundary` so a route chunk
 * failing or still loading never blanks the shell.
 *
 * @example
 * ```tsx
 * <AppShell sidebar={<Sidebar />} topbar={<Topbar />}>
 *   <Route />
 * </AppShell>
 * ```
 */
export function AppShell(props: ParentProps<AppShellProps>): JSX.Element {
  const fallback = (err: unknown, reset: () => void) =>
    (props.errorFallback ?? defaultErrorFallback)(err, reset)
  return (
    <div class="relative min-h-screen">
      <Show when={props.background !== null} fallback={null}>
        {props.background ?? <SpaceBackground />}
      </Show>
      <div class="relative z-10 flex min-h-screen">
        {props.sidebar}
        <div class="flex min-w-0 flex-1 flex-col">
          {props.banner}
          {props.topbar}
          <main
            class="relative mx-auto w-full min-w-0 flex-1 px-4 py-6 sm:px-6"
            style={{ 'max-width': props.maxWidth ?? '1400px' }}
          >
            {/* Never blank the content column: Suspense shows a spinner while a
                route's chunk streams in, and the ErrorBoundary catches any other
                runtime error with a friendly retry/reload — the shell stays put. */}
            <ErrorBoundary fallback={fallback}>
              <Suspense
                fallback={
                  <div class="flex justify-center py-24 text-muted-foreground">
                    <Spinner />
                  </div>
                }
              >
                {/* Routed content. No page cross-fade transition: solid-transition-group
                    left the outgoing (lazy) page mounted, which stacked its height
                    below the new page and created a huge phantom scroll region. */}
                {props.children}
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  )
}
