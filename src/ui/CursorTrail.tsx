// Decorative cursor trail: same spawn-then-remove particle idiom as
// Ripple.tsx / Confetti.tsx, driven by the native Web Animations API. The
// layer itself is pointer-events-none, so the listener lives on the
// `relative` parent that hosts it.
import { onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface CursorTrailProps {
  /** Blob tone. @default 'primary' */
  color?: 'primary' | 'accent'
  /** Blob diameter in px. @default 24 */
  size?: number
  class?: string
}

const SPAWN_THROTTLE_MS = 20

/**
 * Layer that spawns a soft, blurred blob at the cursor position on every
 * throttled `pointermove` over its parent, scaling down and fading out as
 * it removes itself — leaving a trail. Must sit inside a `position:
 * relative` parent (the layer listens on `parentElement`, since it is
 * itself `pointer-events-none`). Purely decorative — `pointer-events-none`
 * and `aria-hidden`. No-op under {@link motionReduced}; listeners are
 * cleaned up on unmount.
 *
 * @example
 * ```tsx
 * <div class="relative h-48 rounded-lg border">
 *   <CursorTrail color="accent" size={32} />
 * </div>
 * ```
 */
export function CursorTrail(props: CursorTrailProps): JSX.Element {
  let layerEl: HTMLDivElement | undefined
  let lastSpawn = 0

  const handlePointerMove = (event: PointerEvent): void => {
    if (motionReduced() || !layerEl) return
    const now = performance.now()
    if (now - lastSpawn < SPAWN_THROTTLE_MS) return
    lastSpawn = now

    const rect = layerEl.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const size = props.size ?? 24
    const tone = props.color === 'accent' ? 'accent' : 'primary'

    const el = document.createElement('span')
    el.setAttribute('aria-hidden', 'true')
    Object.assign(el.style, {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '9999px',
      background: `hsl(var(--${tone}) / 0.35)`,
      filter: 'blur(6px)',
      pointerEvents: 'none',
      transform: 'translate(-50%,-50%) scale(1)',
    })
    layerEl.appendChild(el)

    const animation = el.animate(
      [
        { transform: 'translate(-50%,-50%) scale(1)', opacity: '1' },
        { transform: 'translate(-50%,-50%) scale(0.2)', opacity: '0' },
      ],
      { duration: 500, easing: 'ease-out' },
    )
    const done = (): void => el.remove()
    animation.finished.then(done).catch(done)
  }

  onMount(() => {
    const parent = layerEl?.parentElement
    parent?.addEventListener('pointermove', handlePointerMove)
    onCleanup(() => parent?.removeEventListener('pointermove', handlePointerMove))
  })

  return (
    <div ref={layerEl} class={cn('absolute inset-0 pointer-events-none', props.class)} aria-hidden="true" />
  )
}
