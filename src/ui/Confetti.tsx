// Decorative confetti burst: a spawn-then-remove particle idiom (same as
// Ripple.tsx) driven by the native Web Animations API — each piece is a
// one-shot element with nothing for a JS animation engine to add. Angle and
// velocity per piece are derived deterministically from the piece's index
// (via Math.sin), not Math.random, so a burst is reproducible and doesn't
// depend on an RNG.
import { createEffect, on, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface ConfettiProps {
  /** Bump this (e.g. a counter) to fire a burst. Mount does not count. */
  trigger?: number
  /** Number of pieces per burst. @default 80 */
  count?: number
  class?: string
}

const CONFETTI_COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--foreground))']

/**
 * Fires one burst of confetti pieces from the bottom-center of `container`,
 * flying up and outward in a fan, rotating, then falling with gravity and
 * fading out — each piece removes itself once its animation finishes. Angle,
 * speed, fall distance and spin are derived deterministically from each
 * piece's index (Math.sin), so the same `count` always produces the same
 * fan. `container` should be `position: relative` (or already positioned)
 * with `overflow: hidden` so pieces don't affect layout. No-op under
 * {@link motionReduced}. This is the primitive behind {@link Confetti}.
 *
 * @example
 * ```ts
 * fireConfetti(cardEl, { count: 120 })
 * ```
 */
export function fireConfetti(container: HTMLElement, opts: { count?: number } = {}): void {
  if (motionReduced()) return
  const count = opts.count ?? 80
  const rect = container.getBoundingClientRect()
  const originX = rect.width / 2
  const originY = rect.height

  for (let i = 0; i < count; i++) {
    // Fan the burst across a ~126° arc centered straight up; wobble is a
    // deterministic pseudo-random 0..1 derived from the index.
    const spread = Math.PI * 0.7
    const wobble = Math.sin(i * 12.9898) * 0.5 + 0.5
    const angle = -Math.PI / 2 + (wobble - 0.5) * spread
    const speed = 180 + (Math.sin(i * 4.567) * 0.5 + 0.5) * 160
    const dx = Math.cos(angle) * speed
    const dy = Math.sin(angle) * speed
    const fall = 200 + (Math.sin(i * 5.113) * 0.5 + 0.5) * 160
    const rotation = 240 + (Math.sin(i * 3.377) * 0.5 + 0.5) * 640
    const duration = 900 + (Math.sin(i * 2.1) * 0.5 + 0.5) * 500

    const el = document.createElement('span')
    el.setAttribute('aria-hidden', 'true')
    Object.assign(el.style, {
      position: 'absolute',
      left: `${originX}px`,
      top: `${originY}px`,
      width: `${5 + (i % 3) * 2}px`,
      height: `${10 + (i % 4) * 2}px`,
      borderRadius: '1px',
      background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      pointerEvents: 'none',
    })
    container.appendChild(el)

    const animation = el.animate(
      [
        { transform: 'translate(-50%,-50%) translate(0px,0px) rotate(0deg)', opacity: '1' },
        {
          transform: `translate(-50%,-50%) translate(${dx * 0.7}px,${dy}px) rotate(${rotation * 0.5}deg)`,
          opacity: '1',
          offset: 0.45,
        },
        {
          transform: `translate(-50%,-50%) translate(${dx}px,${dy + fall}px) rotate(${rotation}deg)`,
          opacity: '0',
        },
      ],
      { duration, easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)' },
    )
    const done = (): void => el.remove()
    animation.finished.then(done).catch(done)
  }
}

/**
 * Absolutely-positioned confetti layer: fires a burst of colored pieces from
 * the bottom-center whenever `trigger` changes (the initial mount does not
 * fire one). Purely decorative — `pointer-events-none` and `aria-hidden`.
 * Place it inside a `position: relative` container; pair with a `count`
 * prop, or reach for {@link fireConfetti} directly to fire into an
 * arbitrary element outside Solid's render tree.
 *
 * @example
 * ```tsx
 * const [bursts, setBursts] = createSignal(0)
 * return (
 *   <div class="relative h-64">
 *     <Confetti trigger={bursts()} count={100} />
 *     <Button onClick={() => setBursts((n) => n + 1)}>Celebrate</Button>
 *   </div>
 * )
 * ```
 */
export function Confetti(props: ConfettiProps): JSX.Element {
  let containerEl: HTMLDivElement | undefined

  createEffect(
    on(
      () => props.trigger,
      () => {
        if (!containerEl) return
        fireConfetti(containerEl, { count: props.count })
      },
      { defer: true },
    ),
  )

  return (
    <div
      ref={containerEl}
      class={cn('absolute inset-0 overflow-hidden pointer-events-none', props.class)}
      aria-hidden="true"
    />
  )
}
