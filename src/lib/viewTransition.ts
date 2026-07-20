// Wrapper around the browser View Transitions API. Not every target browser
// implements `document.startViewTransition` yet, and even where it exists we
// want to skip it under reduced motion — this module centralizes both checks
// so callers don't have to feature-detect or re-import motionReduced themselves.
import { motionReduced } from './motion'

/** Minimal shape of `Document` augmented with the View Transitions API. */
interface DocumentWithViewTransitions {
  startViewTransition: (callback: () => void) => unknown
}

function supportsViewTransitions(doc: Document): doc is Document & DocumentWithViewTransitions {
  return (
    'startViewTransition' in doc &&
    typeof (doc as unknown as DocumentWithViewTransitions).startViewTransition === 'function'
  )
}

/**
 * Run `update` inside a View Transition when the browser supports it, so DOM
 * changes cross-fade automatically; otherwise just run `update` synchronously.
 * Respects reduced-motion (skips the transition).
 * @example
 * startViewTransition(() => setRoute('details'))
 */
export function startViewTransition(update: () => void): void {
  if (typeof document === 'undefined' || motionReduced() || !supportsViewTransitions(document)) {
    update()
    return
  }
  document.startViewTransition(update)
}
