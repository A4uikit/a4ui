// ScrollScene — binds a render prop to the element's own scroll progress (0
// as it enters the viewport from the bottom, 1 as it leaves past the top),
// for scroll-driven storytelling. Unlike Parallax (which applies a fixed
// transform via Motion's `scroll`), this exposes the raw progress signal so
// the caller decides what to do with it.
import { createSignal, onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

export interface ScrollSceneProps {
  /** Render-prop receiving a reactive progress accessor (0..1). */
  children: (progress: () => number) => JSX.Element
  class?: string
}

/**
 * Wraps `children` in an element that tracks its own scroll progress: 0 when
 * its top edge reaches the bottom of the viewport, 1 when its bottom edge
 * passes the top of the viewport. Progress is exposed as a reactive accessor
 * via a render prop, so the caller drives whatever transform/animation it
 * wants — this component only measures. Scroll position isn't itself motion,
 * so it keeps measuring under `prefers-reduced-motion`; it just never
 * animates anything on its own.
 *
 * @example
 * ```tsx
 * <ScrollScene>
 *   {(progress) => (
 *     <div style={{ opacity: progress() }}>Reveal on scroll</div>
 *   )}
 * </ScrollScene>
 * ```
 */
export function ScrollScene(props: ScrollSceneProps): JSX.Element {
  let root!: HTMLDivElement
  const [progress, setProgress] = createSignal(0)

  onMount(() => {
    let ticking = false

    const measure = () => {
      ticking = false
      const rect = root.getBoundingClientRect()
      const viewportH = window.innerHeight
      const raw = (viewportH - rect.top) / (viewportH + rect.height)
      setProgress(Math.min(1, Math.max(0, raw)))
    }

    const onScrollOrResize = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize, { passive: true })

    onCleanup(() => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
    })
  })

  return (
    <div ref={root} class={cn(props.class)}>
      {props.children(progress)}
    </div>
  )
}
