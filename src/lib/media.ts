// Reactive CSS media-query matcher. Used to render EITHER the desktop table or
// the mobile cards (not both) so a virtualized long list keeps only one
// structure in the DOM.
import { createSignal, onCleanup } from 'solid-js'

/**
 * Reactive `matchMedia` matcher: returns a signal accessor that updates when
 * the query's match state changes, cleaning up its listener on unmount.
 * Handy for rendering either a desktop or mobile layout instead of hiding one
 * with CSS.
 *
 * @example
 * ```tsx
 * const isDesktop = useMediaQuery('(min-width: 768px)')
 * return isDesktop() ? <DesktopTable /> : <MobileCards />
 * ```
 */
export function useMediaQuery(query: string): () => boolean {
  const mql = typeof window !== 'undefined' ? window.matchMedia(query) : null
  const [matches, setMatches] = createSignal(mql ? mql.matches : false)
  if (mql) {
    const on = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', on)
    onCleanup(() => mql.removeEventListener('change', on))
  }
  return matches
}
