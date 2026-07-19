// Material-style click ripple: a wrapper that spawns an expanding, fading
// circle from the pointer's down position on every `pointerdown` — Motion's
// `animate` drives the scale/opacity tween since each ripple is a one-shot
// spawn-then-discard element, not a persistent CSS transition. `x`/`y` are
// animated to a constant -50% alongside `scale` so Motion (which owns the
// element's `transform` once it's animating any transform sub-property)
// composes `translate(-50%,-50%) scale(...)` itself rather than clobbering a
// translate we'd otherwise have set by hand via inline style.
import { createSignal, For, onCleanup, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { animate, motionReduced } from '../lib/motion'

export interface RippleProps {
  children: JSX.Element
  /** Ripple color (CSS color). @default 'currentColor' */
  color?: string
  /** Ripple opacity 0..1. @default 0.3 */
  opacity?: number
  class?: string
}

interface RippleInstance {
  id: number
  x: number
  y: number
  size: number
}

let nextRippleId = 0

/**
 * Wraps `children` in a `position: relative; overflow: hidden` layer that
 * spawns a Material-style ripple — a circle centered on the pointer's down
 * position, sized to cover the wrapped content, expanding and fading out —
 * on every `pointerdown`. Rapid clicks stack multiple ripples; each removes
 * itself once its animation finishes. A no-op under reduced motion: children
 * still render, but no ripple ever spawns.
 *
 * @example
 * ```tsx
 * <Ripple color="white" opacity={0.25}>
 *   <button class="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Save</button>
 * </Ripple>
 * ```
 */
export function Ripple(props: RippleProps): JSX.Element {
  const [ripples, setRipples] = createSignal<RippleInstance[]>([])
  const active = new Set<ReturnType<typeof animate>>()

  let containerEl: HTMLSpanElement | undefined

  const remove = (id: number): void => {
    setRipples((current) => current.filter((ripple) => ripple.id !== id))
  }

  const spawnAnimation = (el: HTMLSpanElement, id: number, opacity: number): void => {
    const controls = animate(
      el,
      { x: ['-50%', '-50%'], y: ['-50%', '-50%'], scale: [0, 1], opacity: [opacity, 0] },
      { duration: 0.6, ease: 'easeOut' },
    )
    active.add(controls)
    controls.finished
      .then(() => {
        active.delete(controls)
        remove(id)
      })
      .catch(() => {})
  }

  const handlePointerDown = (event: PointerEvent): void => {
    if (motionReduced() || !containerEl) return

    const rect = containerEl.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const maxDist = Math.max(
      Math.hypot(x, y),
      Math.hypot(rect.width - x, y),
      Math.hypot(x, rect.height - y),
      Math.hypot(rect.width - x, rect.height - y),
    )

    setRipples((current) => [...current, { id: nextRippleId++, x, y, size: maxDist * 2 }])
  }

  onCleanup(() => {
    active.forEach((controls) => controls.stop())
    active.clear()
  })

  return (
    <span
      ref={containerEl}
      class={cn('relative inline-block overflow-hidden', props.class)}
      onPointerDown={handlePointerDown}
    >
      {props.children}
      <span aria-hidden="true" class="pointer-events-none absolute inset-0">
        <For each={ripples()}>
          {(ripple) => (
            <span
              ref={(el) => spawnAnimation(el, ripple.id, props.opacity ?? 0.3)}
              class="absolute rounded-full"
              style={{
                left: `${ripple.x}px`,
                top: `${ripple.y}px`,
                width: `${ripple.size}px`,
                height: `${ripple.size}px`,
                background: props.color ?? 'currentColor',
              }}
            />
          )}
        </For>
      </span>
    </span>
  )
}
