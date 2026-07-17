// Helpers for @tanstack/solid-virtual lists.
import { onMount, type Accessor } from 'solid-js'

/**
 * Works around a `@tanstack/solid-virtual` bug where the virtualizer measures
 * a 0×0 viewport: it attaches its `ResizeObserver` during the render pass
 * (when `getScrollElement` first returns the scroll container), before the
 * container has been laid out, so it caches a 0×0 size and never renders any
 * rows. Once layout settles, this detaches+reattaches the scroll element so
 * the observer re-measures the real height. Call it right after wiring up
 * the virtualizer, passing the scroll-element signal's getter and setter.
 *
 * @example
 * ```ts
 * const [scrollEl, setScrollEl] = createSignal<HTMLElement>()
 * const virtualizer = createVirtualizer({ getScrollElement: scrollEl, ... })
 * remeasureAfterLayout(scrollEl, setScrollEl)
 * ```
 */
export function remeasureAfterLayout(
  scrollEl: Accessor<HTMLElement | undefined>,
  setScrollEl: (v: HTMLElement | undefined) => void,
): void {
  onMount(() => {
    requestAnimationFrame(() => {
      const el = scrollEl()
      if (el) {
        setScrollEl(undefined)
        setScrollEl(el)
      }
    })
  })
}
