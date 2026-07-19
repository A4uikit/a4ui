// Magnetic — pulls its wrapped content toward the cursor while the pointer
// hovers over it, and springs back to rest on pointerleave. Motion's `animate`
// drives the translate (a spring, so repeated pointermoves smoothly retarget
// mid-flight rather than snapping). No-op (static) under reduced motion.
import { onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { animate, motionReduced } from '../lib/motion'

export interface MagneticProps {
  children: JSX.Element
  /** Max px the element travels toward the cursor. @default 12 */
  strength?: number
  class?: string
}

/**
 * Wraps `children` in an element that's magnetically drawn toward the
 * cursor: as the pointer moves within its bounds, the element translates a
 * fraction of the way toward it (clamped to `strength` px), springing back
 * to rest on pointerleave. Respects `prefers-reduced-motion` (renders
 * static).
 *
 * @example
 * ```tsx
 * <Magnetic strength={16}>
 *   <button class="rounded-full bg-primary px-6 py-3 text-primary-foreground">Hover me</button>
 * </Magnetic>
 * ```
 */
export function Magnetic(props: MagneticProps): JSX.Element {
  let root!: HTMLDivElement

  onMount(() => {
    if (motionReduced()) return

    let controls: ReturnType<typeof animate> | undefined

    const handlePointerMove = (event: PointerEvent): void => {
      const rect = root.getBoundingClientRect()
      const nx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
      const ny = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
      const strength = props.strength ?? 12

      controls?.stop()
      controls = animate(
        root,
        { x: nx * strength, y: ny * strength },
        { type: 'spring', stiffness: 300, damping: 20 },
      )
    }

    const handlePointerLeave = (): void => {
      controls?.stop()
      controls = animate(root, { x: 0, y: 0 }, { type: 'spring', stiffness: 300, damping: 20 })
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
    <div ref={root} class={cn('inline-block will-change-transform', props.class)}>
      {props.children}
    </div>
  )
}
