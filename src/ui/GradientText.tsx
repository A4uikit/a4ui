// GradientText — text with a smoothly animated multi-color gradient sweeping
// across the glyphs on loop. The sweep is a background-position animation
// clipped to the glyphs via `background-clip: text`, driven by Motion's
// `animate`. Falls back to a static (non-animated) gradient under reduced
// motion — still colorful, just not moving.
import { onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { animate, motionReduced } from '../lib/motion'

export interface GradientTextProps {
  children: JSX.Element
  /** CSS gradient color stop at 0%. @default 'hsl(var(--primary))' */
  from?: string
  /** CSS gradient color stop at 50%. @default 'hsl(var(--accent))' */
  via?: string
  /** CSS gradient color stop at 100%. @default 'hsl(var(--primary))' */
  to?: string
  /** Seconds per loop. @default 4 */
  duration?: number
  class?: string
}

/**
 * Renders `children` clipped to a horizontal gradient whose position sweeps
 * back and forth in a loop, for eye-catching headings. Respects
 * `prefers-reduced-motion` by rendering a static gradient instead of
 * animating.
 *
 * @example
 * ```tsx
 * <GradientText duration={6}>Sonora Precision</GradientText>
 * ```
 */
export function GradientText(props: GradientTextProps): JSX.Element {
  let el!: HTMLSpanElement
  let controls: { stop: () => void } | undefined

  onMount(() => {
    if (motionReduced()) return

    controls = animate(
      el,
      { backgroundPosition: ['0% 0%', '200% 0%'] },
      { duration: props.duration ?? 4, ease: 'linear', repeat: Infinity },
    )

    onCleanup(() => controls?.stop())
  })

  return (
    <span
      ref={el}
      class={cn('inline-block font-bold', props.class)}
      style={{
        'background-image': `linear-gradient(90deg, ${props.from ?? 'hsl(var(--primary))'} 0%, ${
          props.via ?? 'hsl(var(--accent))'
        } 50%, ${props.to ?? 'hsl(var(--primary))'} 100%)`,
        'background-size': '200% 100%',
        '-webkit-background-clip': 'text',
        'background-clip': 'text',
        '-webkit-text-fill-color': 'transparent',
        color: 'transparent',
      }}
    >
      {props.children}
    </span>
  )
}
