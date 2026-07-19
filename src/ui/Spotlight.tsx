// Spotlight — a soft radial glow that follows the cursor inside the wrapped
// element, like a light hovering over the surface. This is a plain CSS
// follow (the overlay's `background` is written directly on pointermove)
// rather than a Motion tween: a radial-gradient position update has no
// transform to spring, so there's nothing for an animation engine to add.
// Engine-free, which lets <Card spotlight> bake it in for free. Only the
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
 * Appends a cursor-following radial-glow overlay inside `el` (which must be
 * `position: relative; overflow: hidden`) and binds the pointer handlers.
 * Returns a cleanup that unbinds and removes the overlay. Engine-free; no-op
 * under reduced motion. This is the primitive behind {@link Spotlight} and
 * `<Card spotlight>`.
 */
export function attachSpotlight(el: HTMLElement, opts: { color?: string; size?: number } = {}): () => void {
  if (motionReduced()) return () => {}

  const overlay = document.createElement('span')
  overlay.setAttribute('aria-hidden', 'true')
  overlay.className = 'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300'
  el.appendChild(overlay)

  const size = opts.size ?? 180
  const color = opts.color ?? 'hsl(var(--primary))'

  const paint = (x: number, y: number): void => {
    overlay.style.background = `radial-gradient(${size}px circle at ${x}px ${y}px, color-mix(in srgb, ${color} 30%, transparent), transparent 70%)`
  }
  const handlePointerMove = (event: PointerEvent): void => {
    const rect = el.getBoundingClientRect()
    paint(event.clientX - rect.left, event.clientY - rect.top)
  }
  const handlePointerEnter = (): void => {
    overlay.style.opacity = '1'
  }
  const handlePointerLeave = (): void => {
    overlay.style.opacity = '0'
  }

  el.addEventListener('pointermove', handlePointerMove)
  el.addEventListener('pointerenter', handlePointerEnter)
  el.addEventListener('pointerleave', handlePointerLeave)
  return () => {
    el.removeEventListener('pointermove', handlePointerMove)
    el.removeEventListener('pointerenter', handlePointerEnter)
    el.removeEventListener('pointerleave', handlePointerLeave)
    overlay.remove()
  }
}

/**
 * Wraps `children` in a `position: relative; overflow: hidden` layer with a
 * radial glow that tracks the cursor, fading in on pointerenter and out on
 * pointerleave. Children render below the (pointer-transparent) glow.
 * Respects `prefers-reduced-motion` (renders children with no glow at all).
 *
 * A4ui's own `Card` can do this without the wrapper — `<Card spotlight>`.
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

  onMount(() => {
    const cleanup = attachSpotlight(root, { color: props.color, size: props.size })
    onCleanup(cleanup)
  })

  return (
    <div ref={root} class={cn('relative overflow-hidden', props.class)}>
      {props.children}
    </div>
  )
}
