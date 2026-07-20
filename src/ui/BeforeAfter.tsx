// BeforeAfter — an image comparison slider: two images stacked in the same
// box, the "after" image clipped to a draggable split so dragging the handle
// reveals more of one and hides the other. Pure signal + CSS `clip-path`
// (engine-free — no `motion` dependency), same spirit as TiltCard/Spotlight.
// Dragging is instant (no transition to fight the pointer); clicking the
// track to jump the split animates smoothly unless reduced motion is on.
import { createSignal, Show, type JSX } from 'solid-js'
import { ChevronsLeftRight } from 'lucide-solid'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface BeforeAfterProps {
  /** Image URL shown fully, underneath. */
  before: string
  /** Image URL revealed by the handle, on top, clipped to the split. */
  after: string
  /** Accessible description of the comparison, used as the slider's label. */
  alt: string
  /** Corner labels as `[beforeLabel, afterLabel]`, e.g. `['Antes', 'Después']`. */
  labels?: [string, string]
  /** Initial split position, 0..100 (percent of width revealing `after`). @default 50 */
  start?: number
  class?: string
}

const clamp = (value: number): number => Math.min(100, Math.max(0, value))

/**
 * A before/after image comparison slider: drag the handle (pointer or
 * Left/Right arrow keys once focused) to reveal more of `after` versus
 * `before`. The `after` image is clipped with `clip-path: inset(...)` driven
 * by a `0..100` split signal — no canvas, no animation engine. Clicking
 * anywhere on the track jumps the split there with a short transition
 * (skipped under `prefers-reduced-motion`); dragging itself is always instant.
 *
 * @example
 * ```tsx
 * <BeforeAfter
 *   before="/room-before.jpg"
 *   after="/room-after.jpg"
 *   alt="Living room before and after renovation"
 *   labels={['Antes', 'Después']}
 *   class="aspect-video rounded-2xl border border-border"
 * />
 * ```
 */
export function BeforeAfter(props: BeforeAfterProps): JSX.Element {
  const [x, setX] = createSignal(clamp(props.start ?? 50))
  const [dragging, setDragging] = createSignal(false)

  let container: HTMLDivElement | undefined

  const updateFromClientX = (clientX: number): void => {
    if (!container) return
    const rect = container.getBoundingClientRect()
    setX(clamp(((clientX - rect.left) / rect.width) * 100))
  }

  const onHandlePointerDown = (event: PointerEvent): void => {
    const handle = event.currentTarget as HTMLElement
    handle.setPointerCapture(event.pointerId)
    handle.focus()
    setDragging(true)
    updateFromClientX(event.clientX)

    const move = (moveEvent: PointerEvent): void => updateFromClientX(moveEvent.clientX)
    const release = (): void => {
      setDragging(false)
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', release)
      handle.removeEventListener('lostpointercapture', release)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', release)
    handle.addEventListener('lostpointercapture', release)
    event.preventDefault()
  }

  const onTrackClick = (event: MouseEvent): void => {
    updateFromClientX(event.clientX)
  }

  const onKeyDown = (event: KeyboardEvent): void => {
    const step = event.shiftKey ? 10 : 2
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault()
      setX((value) => clamp(value - step))
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault()
      setX((value) => clamp(value + step))
    } else if (event.key === 'Home') {
      event.preventDefault()
      setX(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setX(100)
    }
  }

  const transitionClass = () =>
    !dragging() && !motionReduced() ? 'transition-[clip-path] duration-200 ease-out' : ''

  return (
    <div
      ref={container}
      class={cn('relative aspect-video w-full select-none overflow-hidden', props.class)}
      onClick={onTrackClick}
    >
      <img
        src={props.before}
        alt=""
        aria-hidden="true"
        draggable={false}
        class="absolute inset-0 h-full w-full object-cover"
      />
      <img
        src={props.after}
        alt={props.alt}
        draggable={false}
        class={cn('absolute inset-0 h-full w-full object-cover', transitionClass())}
        style={{ 'clip-path': `inset(0 ${100 - x()}% 0 0)` }}
      />

      <Show when={props.labels}>
        {(labels) => (
          <>
            <span class="pointer-events-none absolute bottom-3 left-3 rounded-md border border-border bg-background/70 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
              {labels()[0]}
            </span>
            <span class="pointer-events-none absolute bottom-3 right-3 rounded-md border border-border bg-background/70 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
              {labels()[1]}
            </span>
          </>
        )}
      </Show>

      <div
        role="slider"
        tabindex={0}
        aria-label={props.alt}
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(x())}
        onPointerDown={onHandlePointerDown}
        onKeyDown={onKeyDown}
        onClick={(event) => event.stopPropagation()}
        class={cn(
          'group absolute inset-y-0 flex w-8 -translate-x-1/2 cursor-ew-resize touch-none items-center justify-center',
          "before:pointer-events-none before:absolute before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 before:bg-background before:content-['']",
          'focus-visible:outline-none',
        )}
        style={{ left: `${x()}%` }}
      >
        <span class="grid h-8 w-8 place-items-center rounded-full border border-border bg-background text-foreground shadow-md group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background">
          <ChevronsLeftRight class="h-4 w-4" />
        </span>
      </div>
    </div>
  )
}
