// Infinite horizontal scroller that loops its children seamlessly.
import type { JSX, ParentProps } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

interface MarqueeProps extends ParentProps {
  /** Seconds for one full loop of the track. Lower is faster. Defaults to `20`. */
  speed?: number
  /** Pause the scroll while the pointer hovers the strip. Defaults to `true`. */
  pauseOnHover?: boolean
  class?: string
}

/**
 * A horizontally scrolling strip that loops its children seamlessly. The
 * children are rendered twice inside a flex track; when the first copy has
 * scrolled fully out of view the second copy sits exactly where the first
 * began, so the animation restarts with no visible seam. Honors reduced
 * motion (the track sits still) and, by default, pauses on hover.
 *
 * @example
 * ```tsx
 * <Marquee speed={30}>
 *   <span class="mx-4">A4ui</span>
 *   <span class="mx-4">SolidJS</span>
 *   <span class="mx-4">Tailwind</span>
 * </Marquee>
 * ```
 */
export function Marquee(props: MarqueeProps): JSX.Element {
  const pauseOnHover = () => props.pauseOnHover ?? true

  return (
    <div class={cn('overflow-hidden', props.class)}>
      <style>{'@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}'}</style>
      <div
        class={cn('flex w-max shrink-0', pauseOnHover() && 'hover:[animation-play-state:paused]')}
        style={motionReduced() ? undefined : { animation: `marquee ${props.speed ?? 20}s linear infinite` }}
      >
        <div class="flex shrink-0">{props.children}</div>
        <div class="flex shrink-0" aria-hidden="true">
          {props.children}
        </div>
      </div>
    </div>
  )
}
