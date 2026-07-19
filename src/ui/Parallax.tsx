// Parallax — moves its children at a fraction of scroll speed for depth,
// driven by Motion's `scroll` progress callback (0..1) as the element passes
// through the viewport. No-op (static) under reduced motion.
import { onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced, scroll } from '../lib/motion'

export interface ParallaxProps {
  children: JSX.Element
  /** Parallax strength; positive moves slower/opposite. Pixels of travel across the scroll range. @default 80 */
  amount?: number
  class?: string
}

/**
 * Wraps `children` in an element that drifts vertically as the page scrolls,
 * creating a depth effect. Tracks scroll progress of the element itself
 * against the viewport via Motion's `scroll`; respects `prefers-reduced-motion`
 * (renders static).
 *
 * @example
 * ```tsx
 * <Parallax amount={120}>
 *   <img src="/hero.png" alt="" />
 * </Parallax>
 * ```
 */
export function Parallax(props: ParallaxProps): JSX.Element {
  let root!: HTMLDivElement

  onMount(() => {
    if (motionReduced()) return

    const amount = props.amount ?? 80
    const stop = scroll(
      (progress: number) => {
        root.style.transform = `translateY(${(progress - 0.5) * -2 * amount}px)`
      },
      { target: root },
    )

    onCleanup(() => stop())
  })

  return (
    <div ref={root} class={cn('will-change-transform', props.class)}>
      {props.children}
    </div>
  )
}
