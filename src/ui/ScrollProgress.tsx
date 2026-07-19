// ScrollProgress — a thin bar pinned to the top of the viewport that fills
// left-to-right as the page scrolls, a common reading-progress indicator.
// Driven by Motion's `scroll` progress callback (0..1). Renders a static,
// unfilled bar under reduced motion (no scroll subscription).
import { onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced, scroll } from '../lib/motion'

export interface ScrollProgressProps {
  /** Bar height in px. @default 3 */
  height?: number
  /** Bar color (CSS color). @default 'hsl(var(--primary))' */
  color?: string
  class?: string
}

/**
 * Renders a fixed bar at the top of the viewport whose fill tracks how far
 * the page has been scrolled. Subscribes to Motion's `scroll` on mount and
 * scales the inner bar horizontally; respects `prefers-reduced-motion`
 * (renders a static, empty bar instead).
 *
 * @example
 * ```tsx
 * <ScrollProgress height={4} color="hsl(var(--accent))" />
 * ```
 */
export function ScrollProgress(props: ScrollProgressProps): JSX.Element {
  let bar!: HTMLDivElement

  onMount(() => {
    bar.style.transform = 'scaleX(0)'

    if (motionReduced()) return

    const stop = scroll((progress: number) => {
      bar.style.transform = `scaleX(${progress})`
    })

    onCleanup(() => stop())
  })

  return (
    <div
      aria-hidden="true"
      class={cn('fixed top-0 left-0 z-[9999] w-full', props.class)}
      style={{ height: `${props.height ?? 3}px` }}
    >
      <div
        ref={bar}
        class="origin-left will-change-transform"
        style={{
          height: '100%',
          width: '100%',
          'background-color': props.color ?? 'hsl(var(--primary))',
        }}
      />
    </div>
  )
}
