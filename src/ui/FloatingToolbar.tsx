// Detached, centered glass toolbar that condenses (tighter padding, slight
// scale-down, stronger blur) once the page scrolls past a small threshold —
// a "Liquid Glass"-style floating bar for persistent actions.
import type { JSX } from 'solid-js'
import { createSignal, onCleanup, onMount } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

// Scroll distance (px) past which the bar condenses.
const CONDENSE_THRESHOLD = 24

const POSITION_CLASSES: Record<'top' | 'bottom', string> = {
  top: 'top-4',
  bottom: 'bottom-4',
}

export interface FloatingToolbarProps {
  children: JSX.Element
  /** Which edge of the viewport the bar is anchored to. Defaults to `'bottom'`. */
  position?: 'top' | 'bottom'
  /** Shrink padding/scale and intensify the glass blur once scrolled past ~24px. Defaults to `true`. */
  condenseOnScroll?: boolean
  class?: string
}

/**
 * Fixed, horizontally-centered glass toolbar that floats above the page
 * content. When `condenseOnScroll` is on (the default), it tightens its
 * padding and scales down slightly once the user scrolls past a small
 * threshold, mimicking a "Liquid Glass" detached bar. Reduced-motion aware:
 * the condense change applies instantly, without a transition, when
 * {@link motionReduced} is true.
 *
 * @example
 * ```tsx
 * <FloatingToolbar position="bottom">
 *   <IconButton label="Undo"><UndoIcon /></IconButton>
 *   <IconButton label="Redo"><RedoIcon /></IconButton>
 * </FloatingToolbar>
 * ```
 */
export function FloatingToolbar(props: FloatingToolbarProps): JSX.Element {
  const [condensed, setCondensed] = createSignal(false)

  onMount(() => {
    if (props.condenseOnScroll === false) return

    const onScroll = () => {
      setCondensed(window.scrollY > CONDENSE_THRESHOLD)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    onCleanup(() => window.removeEventListener('scroll', onScroll))
  })

  return (
    <div
      role="toolbar"
      class={cn(
        'card glass fixed left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full',
        'border border-border/60 shadow-lg',
        POSITION_CLASSES[props.position ?? 'bottom'],
        !motionReduced() && 'transition-all duration-300 ease-out',
        condensed()
          ? 'scale-95 gap-0.5 px-2 py-1 backdrop-blur-xl'
          : 'scale-100 gap-1 px-3 py-2 backdrop-blur-md',
        props.class,
      )}
    >
      {props.children}
    </div>
  )
}
