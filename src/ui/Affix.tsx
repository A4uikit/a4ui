// Pins its children to the top of the viewport once scrolled past their original position.
import type { JSX, ParentProps } from 'solid-js'
import { createSignal, onCleanup, onMount, Show } from 'solid-js'
import { cn } from '../lib/cn'

interface AffixProps extends ParentProps {
  /** Distance in pixels from the top of the viewport to pin at once affixed. Defaults to `0`. */
  offsetTop?: number
  class?: string
}

/**
 * Sticks its children to the top of the viewport once the user scrolls past the
 * element's original position. While affixed, the children are rendered in a
 * `position: fixed` container and a same-size spacer preserves the document flow
 * so surrounding layout doesn't jump.
 *
 * @example
 * ```tsx
 * <Affix offsetTop={16}>
 *   <nav class="rounded-md bg-card px-4 py-2 text-foreground">Sticky toolbar</nav>
 * </Affix>
 * ```
 */
export function Affix(props: AffixProps): JSX.Element {
  const [affixed, setAffixed] = createSignal(false)
  const [size, setSize] = createSignal({ width: 0, height: 0 })
  let ref: HTMLDivElement | undefined

  onMount(() => {
    // Anchor is the element's original document position; captured once so the
    // trigger point stays stable even after the wrapper becomes empty (affixed).
    let anchorTop = 0
    const measure = () => {
      if (!ref) return
      const rect = ref.getBoundingClientRect()
      if (!affixed()) {
        anchorTop = rect.top + window.scrollY
        setSize({ width: rect.width, height: rect.height })
      }
    }
    const update = () => {
      const offset = props.offsetTop ?? 0
      setAffixed(window.scrollY + offset > anchorTop)
    }
    const onScroll = () => {
      measure()
      update()
    }

    measure()
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    onCleanup(() => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    })
  })

  return (
    <div ref={ref} class={cn(props.class)}>
      <Show when={affixed()} fallback={props.children}>
        {/* Spacer keeps the original footprint so the page below doesn't shift up. */}
        <div style={{ width: `${size().width}px`, height: `${size().height}px` }} aria-hidden="true" />
        <div class="fixed z-40" style={{ top: `${props.offsetTop ?? 0}px`, width: `${size().width}px` }}>
          {props.children}
        </div>
      </Show>
    </div>
  )
}
