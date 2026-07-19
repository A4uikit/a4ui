// TiltCard — tilts its wrapped content in 3D toward the cursor on hover, like
// a card catching the light. The outer element sets the CSS perspective; the
// inner element (which actually rotates) gets `transform-style: preserve-3d`
// so nested content keeps its own depth. Motion's `animate` drives the
// rotate/scale as a spring. No-op (static) under reduced motion.
import { onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { animate, motionReduced } from '../lib/motion'

export interface TiltCardProps {
  children: JSX.Element
  /** Max tilt in degrees. @default 10 */
  max?: number
  class?: string
}

/**
 * Wraps `children` in a card that tilts in 3D toward the cursor: as the
 * pointer moves within its bounds, the card rotates on both axes (clamped to
 * `max` degrees) and lifts slightly, springing back flat on pointerleave.
 * Respects `prefers-reduced-motion` (renders static).
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
    if (motionReduced()) return

    let controls: ReturnType<typeof animate> | undefined

    const handlePointerMove = (event: PointerEvent): void => {
      const rect = root.getBoundingClientRect()
      const nx = (event.clientX - rect.left) / rect.width - 0.5
      const ny = (event.clientY - rect.top) / rect.height - 0.5
      const max = props.max ?? 10

      controls?.stop()
      controls = animate(
        inner,
        { rotateX: ny * -2 * max, rotateY: nx * 2 * max, scale: 1.02 },
        { type: 'spring', stiffness: 300, damping: 20 },
      )
    }

    const handlePointerLeave = (): void => {
      controls?.stop()
      controls = animate(
        inner,
        { rotateX: 0, rotateY: 0, scale: 1 },
        { type: 'spring', stiffness: 300, damping: 20 },
      )
    }

    root.addEventListener('pointermove', handlePointerMove)
    root.addEventListener('pointerleave', handlePointerLeave)

    onCleanup(() => {
      root.removeEventListener('pointermove', handlePointerMove)
      root.removeEventListener('pointerleave', handlePointerLeave)
      controls?.stop()
    })
  })

  return (
    <div ref={root} class={cn('inline-block', props.class)} style={{ perspective: '800px' }}>
      <div ref={inner} class="will-change-transform" style={{ 'transform-style': 'preserve-3d' }}>
        {props.children}
      </div>
    </div>
  )
}
