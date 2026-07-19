// FillText — text with a color "fill" band sweeping left-to-right on loop,
// for loading states. The sweep is a background-position animation clipped
// to the glyphs via `background-clip: text`, driven by Motion's `animate`.
// Falls back to plain static text under reduced motion.
import { onCleanup, onMount, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { animate, motionReduced } from '../lib/motion'

export interface FillTextProps {
  text: string
  /** Seconds per sweep. @default 1.6 */
  duration?: number
  class?: string
}

/**
 * Renders `text` with a bright gradient band that sweeps across the glyphs
 * repeatedly, useful as a lightweight loading indicator. Respects
 * `prefers-reduced-motion` by rendering plain muted text instead of animating.
 *
 * @example
 * ```tsx
 * <FillText text="Loading results…" />
 * ```
 */
export function FillText(props: FillTextProps): JSX.Element {
  let el!: HTMLSpanElement
  let controls: { stop: () => void } | undefined

  onMount(() => {
    if (motionReduced()) return

    controls = animate(
      el,
      { backgroundPosition: ['200% 0%', '-200% 0%'] },
      { duration: props.duration ?? 1.6, ease: 'linear', repeat: Infinity },
    )

    onCleanup(() => controls?.stop())
  })

  return (
    <span role="status" class={cn('font-medium', props.class)}>
      <Show when={!motionReduced()} fallback={<span class="text-muted-foreground">{props.text}</span>}>
        <span
          ref={el}
          style={{
            background:
              'linear-gradient(90deg, hsl(var(--muted-foreground)) 0%, hsl(var(--muted-foreground)) 40%, hsl(var(--foreground)) 50%, hsl(var(--muted-foreground)) 60%, hsl(var(--muted-foreground)) 100%)',
            'background-size': '200% 100%',
            '-webkit-background-clip': 'text',
            'background-clip': 'text',
            '-webkit-text-fill-color': 'transparent',
            color: 'transparent',
          }}
        >
          {props.text}
        </span>
      </Show>
    </span>
  )
}
