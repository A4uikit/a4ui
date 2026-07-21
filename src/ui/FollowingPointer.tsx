// FollowingPointer — hides the native cursor over `children` and renders a
// custom arrow + label chip that follows the mouse instead. Position is
// written straight to the DOM node's `transform` on every pointermove (same
// "skip the signal, touch the ref directly" idiom as Magnetic.tsx) rather
// than through a reactive signal, so the follow is jank-free. No-op (native
// cursor kept, nothing custom rendered) under motionReduced().
import { onCleanup, onMount, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface FollowingPointerProps {
  label?: JSX.Element
  /** Tone of the custom cursor + label chip. @default 'primary' */
  color?: 'primary' | 'accent'
  children: JSX.Element
  class?: string
}

/**
 * Wraps `children` in a `relative` container that hides the native cursor
 * and renders a custom pointer — a small arrow glyph plus a rounded label
 * chip in the given tone — that follows the mouse within the container.
 * Hidden until the pointer enters, hidden again on leave. Under
 * {@link motionReduced}, the native cursor is kept and nothing custom is
 * rendered. Listeners are cleaned up on unmount.
 *
 * @example
 * ```tsx
 * <FollowingPointer label="Alex" color="accent">
 *   <div class="grid h-48 place-items-center rounded-lg border">Hover me</div>
 * </FollowingPointer>
 * ```
 */
export function FollowingPointer(props: FollowingPointerProps): JSX.Element {
  let root: HTMLDivElement | undefined
  let pointerEl: HTMLDivElement | undefined

  onMount(() => {
    if (motionReduced() || !root || !pointerEl) return

    const handlePointerMove = (event: PointerEvent): void => {
      const rect = root!.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      pointerEl!.style.transform = `translate(${x}px, ${y}px)`
    }

    const handlePointerEnter = (event: PointerEvent): void => {
      pointerEl!.style.opacity = '1'
      handlePointerMove(event)
    }

    const handlePointerLeave = (): void => {
      pointerEl!.style.opacity = '0'
    }

    root.addEventListener('pointermove', handlePointerMove)
    root.addEventListener('pointerenter', handlePointerEnter)
    root.addEventListener('pointerleave', handlePointerLeave)

    onCleanup(() => {
      root!.removeEventListener('pointermove', handlePointerMove)
      root!.removeEventListener('pointerenter', handlePointerEnter)
      root!.removeEventListener('pointerleave', handlePointerLeave)
    })
  })

  const tone = (): 'primary' | 'accent' => (props.color === 'accent' ? 'accent' : 'primary')

  return (
    <div ref={root} class={cn('relative', !motionReduced() && 'cursor-none', props.class)}>
      {props.children}
      <Show when={!motionReduced()}>
        <div
          ref={pointerEl}
          aria-hidden="true"
          class="pointer-events-none absolute left-0 top-0 z-50 flex items-center opacity-0 transition-opacity duration-150 will-change-transform"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            class={cn(
              '-translate-x-0.5 -translate-y-0.5 drop-shadow',
              tone() === 'accent' ? 'text-accent' : 'text-primary',
            )}
          >
            <path
              d="M2 2 L18 9 L10 11 L8 18 Z"
              fill="currentColor"
              stroke="hsl(var(--background))"
              stroke-width="1"
            />
          </svg>
          <Show when={props.label}>
            <div
              class={cn(
                'ml-2 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium shadow-lg',
                tone() === 'accent'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-primary text-primary-foreground',
              )}
            >
              {props.label}
            </div>
          </Show>
        </div>
      </Show>
    </div>
  )
}
