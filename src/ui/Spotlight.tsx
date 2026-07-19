// Spotlight — a soft radial glow that follows the cursor inside the wrapped
// element, like a light hovering over the surface. This is a plain CSS
// follow (the overlay's `background` is written directly on pointermove)
// rather than a Motion tween: a radial-gradient position update has no
// transform to spring, so there's nothing for Motion to add here. Only the
// fade in/out on enter/leave uses a CSS `transition: opacity`. No-op (no
// glow, children still render) under reduced motion.
import { onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface SpotlightProps {
  children: JSX.Element
  /** Glow color (CSS color). @default 'hsl(var(--primary))' */
  color?: string
  /** Glow radius in px. @default 180 */
  size?: number
  class?: string
}

/**
 * Wraps `children` in a `position: relative; overflow: hidden` layer with a
 * radial glow that tracks the cursor, fading in on pointerenter and out on
 * pointerleave. Children render above the glow. Respects
 * `prefers-reduced-motion` (renders children with no glow at all).
 *
 * @example
 * ```tsx
 * <Spotlight color="hsl(var(--primary))" size={220}>
 *   <div class="rounded-2xl border border-border p-8">Hover for glow</div>
 * </Spotlight>
 * ```
 */
export function Spotlight(props: SpotlightProps): JSX.Element {
  let root!: HTMLDivElement
  let overlay!: HTMLSpanElement

  onMount(() => {
    if (motionReduced()) return

    const size = props.size ?? 180
    const color = props.color ?? 'hsl(var(--primary))'

    const paint = (x: number, y: number): void => {
      overlay.style.background = `radial-gradient(${size}px circle at ${x}px ${y}px, color-mix(in srgb, ${color} 30%, transparent), transparent 70%)`
    }

    const handlePointerMove = (event: PointerEvent): void => {
      const rect = root.getBoundingClientRect()
      paint(event.clientX - rect.left, event.clientY - rect.top)
    }

    const handlePointerEnter = (): void => {
      overlay.style.opacity = '1'
    }

    const handlePointerLeave = (): void => {
      overlay.style.opacity = '0'
    }

    root.addEventListener('pointermove', handlePointerMove)
    root.addEventListener('pointerenter', handlePointerEnter)
    root.addEventListener('pointerleave', handlePointerLeave)

    onCleanup(() => {
      root.removeEventListener('pointermove', handlePointerMove)
      root.removeEventListener('pointerenter', handlePointerEnter)
      root.removeEventListener('pointerleave', handlePointerLeave)
    })
  })

  return (
    <div ref={root} class={cn('relative overflow-hidden', props.class)}>
      {props.children}
      <span
        ref={overlay}
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
      />
    </div>
  )
}
