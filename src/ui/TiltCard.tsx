// TiltCard — tilts its wrapped content in 3D toward the cursor on hover, like
// a card catching the light. The tilt is a direct transform smoothed by a CSS
// transition (engine-free — no `motion` dependency), which keeps it cheap
// enough for <Card tilt> to bake in without growing every Card consumer's
// bundle. No-op (static) under reduced motion.
import { onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface TiltCardProps {
  children: JSX.Element
  /** Max tilt in degrees. @default 10 */
  max?: number
  class?: string
}

/**
 * Binds a cursor-following 3D tilt: pointer moves over `listenEl` rotate
 * `animEl` toward the cursor (clamped to `max` degrees) with a slight lift,
 * easing back flat on pointerleave. Returns a cleanup that unbinds and clears
 * the transform. Engine-free (CSS transitions); no-op under reduced motion.
 * This is the primitive behind {@link TiltCard} and `<Card tilt>` — pass the
 * same element twice to tilt the element the pointer is over.
 */
export function attachTilt(
  listenEl: HTMLElement,
  animEl: HTMLElement,
  opts: { max?: number } = {},
): () => void {
  if (motionReduced()) return () => {}
  animEl.style.willChange = 'transform'

  const move = (event: PointerEvent): void => {
    const rect = listenEl.getBoundingClientRect()
    const nx = (event.clientX - rect.left) / rect.width - 0.5
    const ny = (event.clientY - rect.top) / rect.height - 0.5
    const max = opts.max ?? 10
    animEl.style.transition = 'transform 0.15s ease-out'
    animEl.style.transform = `perspective(800px) rotateX(${(ny * -2 * max).toFixed(2)}deg) rotateY(${(nx * 2 * max).toFixed(2)}deg) scale(1.02)`
  }
  const leave = (): void => {
    animEl.style.transition = 'transform 0.4s ease'
    animEl.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)'
  }

  listenEl.addEventListener('pointermove', move)
  listenEl.addEventListener('pointerleave', leave)
  return () => {
    listenEl.removeEventListener('pointermove', move)
    listenEl.removeEventListener('pointerleave', leave)
    animEl.style.transform = ''
    animEl.style.transition = ''
    animEl.style.willChange = ''
  }
}

/**
 * Wraps `children` in a card that tilts in 3D toward the cursor: as the
 * pointer moves within its bounds, the card rotates on both axes (clamped to
 * `max` degrees) and lifts slightly, easing back flat on pointerleave.
 * Respects `prefers-reduced-motion` (renders static).
 *
 * A4ui's own `Card` can do this without the wrapper — `<Card tilt>`.
 *
 * @example
 * ```tsx
 * <TiltCard max={12}>
 *   <div class="rounded-2xl border border-border bg-card p-6">Card content</div>
 * </TiltCard>
 * ```
 */
export function TiltCard(props: TiltCardProps): JSX.Element {
  let root!: HTMLDivElement
  let inner!: HTMLDivElement

  onMount(() => {
    const cleanup = attachTilt(root, inner, { max: props.max })
    onCleanup(cleanup)
  })

  return (
    <div ref={root} class={cn('inline-block', props.class)} style={{ perspective: '800px' }}>
      <div ref={inner} style={{ 'transform-style': 'preserve-3d' }}>
        {props.children}
      </div>
    </div>
  )
}
