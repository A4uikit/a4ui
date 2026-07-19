// Material-style click ripple: an expanding, fading circle from the pointer's
// down position on every `pointerdown`. The tween is driven by the native Web
// Animations API (el.animate) — each ripple is a one-shot spawn-then-discard
// element, so there's nothing for a JS animation engine to add. Being
// engine-free is deliberate: it lets <Button ripple> bake this in without
// pulling the `motion` package into every Button consumer's bundle.
import { type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface RippleProps {
  children: JSX.Element
  /** Ripple color (CSS color). @default 'currentColor' */
  color?: string
  /** Ripple opacity 0..1. @default 0.3 */
  opacity?: number
  class?: string
}

/**
 * Spawns one Material-style ripple inside `container` at the pointer's
 * position, expanding to cover the container and fading out, then removes
 * itself. The container must be `position: relative; overflow: hidden`.
 * Engine-free (Web Animations API); no-op under reduced motion. This is the
 * primitive behind {@link Ripple} and `<Button ripple>`.
 */
export function spawnRipple(
  container: HTMLElement,
  event: PointerEvent,
  opts: { color?: string; opacity?: number } = {},
): void {
  if (motionReduced()) return
  const rect = container.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  // Diameter = 2× the distance to the farthest corner, so the circle always
  // covers the whole container from wherever the press landed.
  const size =
    2 *
    Math.max(
      Math.hypot(x, y),
      Math.hypot(rect.width - x, y),
      Math.hypot(x, rect.height - y),
      Math.hypot(rect.width - x, rect.height - y),
    )

  const el = document.createElement('span')
  el.setAttribute('aria-hidden', 'true')
  Object.assign(el.style, {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '9999px',
    background: opts.color ?? 'currentColor',
    pointerEvents: 'none',
    transform: 'translate(-50%,-50%) scale(0)',
  })
  container.appendChild(el)

  const animation = el.animate(
    [
      { transform: 'translate(-50%,-50%) scale(0)', opacity: String(opts.opacity ?? 0.3) },
      { transform: 'translate(-50%,-50%) scale(1)', opacity: '0' },
    ],
    { duration: 600, easing: 'ease-out' },
  )
  const done = (): void => el.remove()
  animation.finished.then(done).catch(done)
}

/**
 * Wraps `children` in a `position: relative; overflow: hidden` layer that
 * spawns a Material-style ripple — a circle centered on the pointer's down
 * position, sized to cover the wrapped content, expanding and fading out —
 * on every `pointerdown`. Rapid clicks stack multiple ripples; each removes
 * itself once its animation finishes. A no-op under reduced motion: children
 * still render, but no ripple ever spawns.
 *
 * Buttons don't need the wrapper — use `<Button ripple>` instead.
 *
 * @example
 * ```tsx
 * <Ripple color="white" opacity={0.25}>
 *   <div class="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Save</div>
 * </Ripple>
 * ```
 */
export function Ripple(props: RippleProps): JSX.Element {
  let containerEl: HTMLSpanElement | undefined

  const handlePointerDown = (event: PointerEvent): void => {
    if (!containerEl) return
    spawnRipple(containerEl, event, { color: props.color, opacity: props.opacity })
  }

  return (
    <span
      ref={containerEl}
      class={cn('relative inline-block overflow-hidden', props.class)}
      onPointerDown={handlePointerDown}
    >
      {props.children}
    </span>
  )
}
