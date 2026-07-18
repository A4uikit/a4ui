// BackToTop — a fixed circular button that scrolls the window back to the top.
// Only appears once the page has scrolled past `threshold` px. Listener is bound
// in onMount (client-only), so it's SSR-safe.
import type { JSX } from 'solid-js'
import { createSignal, onCleanup, onMount, Show } from 'solid-js'
import { ArrowUp } from 'lucide-solid'

import { cn } from '../lib/cn'

export interface BackToTopProps {
  /** Scroll distance (px) after which the button appears. Defaults to `300`. */
  threshold?: number
  class?: string
}

/**
 * A floating "scroll to top" button, fixed to the bottom-right of the viewport.
 * It fades in once the user scrolls past `threshold` and smooth-scrolls back up
 * on click.
 *
 * @example
 * ```tsx
 * <BackToTop threshold={500} />
 * ```
 */
export function BackToTop(props: BackToTopProps): JSX.Element {
  const [visible, setVisible] = createSignal(false)

  onMount(() => {
    const onScroll = () => setVisible(window.scrollY > (props.threshold ?? 300))
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    onCleanup(() => window.removeEventListener('scroll', onScroll))
  })

  return (
    <Show when={visible()}>
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        class={cn(
          'fixed bottom-6 right-6 z-40 grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg',
          props.class,
        )}
      >
        <ArrowUp class="h-5 w-5" />
      </button>
    </Show>
  )
}
