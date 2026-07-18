// Resizable split panes with a draggable, keyboard-operable divider.
import type { JSX } from 'solid-js'
import { createSignal } from 'solid-js'
import { cn } from '../lib/cn'

export interface SplitterProps {
  /** Content of the first pane (left when horizontal, top when vertical). */
  start: JSX.Element
  /** Content of the second pane (right when horizontal, bottom when vertical). */
  end: JSX.Element
  /** Layout axis. `'horizontal'` (default) splits side-by-side with a vertical divider; `'vertical'` stacks the panes with a horizontal divider. */
  orientation?: 'horizontal' | 'vertical'
  /** Initial size of the first pane, as a percentage of the container. Defaults to `50`. */
  initial?: number
  /** Minimum size of the first pane, as a percentage. Defaults to `15`. */
  min?: number
  /** Maximum size of the first pane, as a percentage. Defaults to `85`. */
  max?: number
  class?: string
}

/**
 * Two panes separated by a draggable divider that resizes them. Drag the
 * divider with a pointer or focus it and use the Arrow keys to nudge the split.
 * The first pane's size is tracked as a percentage and clamped to `[min, max]`.
 *
 * @example
 * ```tsx
 * <Splitter
 *   orientation="horizontal"
 *   initial={40}
 *   start={<div class="p-4">Sidebar</div>}
 *   end={<div class="p-4">Main content</div>}
 * />
 * ```
 */
export function Splitter(props: SplitterProps): JSX.Element {
  const orientation = () => props.orientation ?? 'horizontal'
  const min = () => props.min ?? 15
  const max = () => props.max ?? 85

  const clamp = (value: number) => Math.min(max(), Math.max(min(), value))

  const [size, setSize] = createSignal(clamp(props.initial ?? 50))

  let container: HTMLDivElement | undefined

  const updateFromPointer = (event: PointerEvent) => {
    if (!container) return
    const rect = container.getBoundingClientRect()
    const pct =
      orientation() === 'horizontal'
        ? ((event.clientX - rect.left) / rect.width) * 100
        : ((event.clientY - rect.top) / rect.height) * 100
    setSize(clamp(pct))
  }

  const onPointerDown = (event: PointerEvent) => {
    const divider = event.currentTarget as HTMLElement
    divider.setPointerCapture(event.pointerId)
    divider.addEventListener('pointermove', updateFromPointer)
    const release = () => {
      divider.removeEventListener('pointermove', updateFromPointer)
      divider.removeEventListener('pointerup', release)
      divider.removeEventListener('lostpointercapture', release)
    }
    divider.addEventListener('pointerup', release)
    divider.addEventListener('lostpointercapture', release)
    event.preventDefault()
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const step = 3
    let delta = 0
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') delta = -step
    else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') delta = step
    else if (event.key === 'Home') return setSize(min())
    else if (event.key === 'End') return setSize(max())
    else return
    event.preventDefault()
    setSize((s) => clamp(s + delta))
  }

  return (
    <div
      ref={container}
      class={cn(
        'flex overflow-hidden',
        orientation() === 'horizontal' ? 'h-64 flex-row' : 'flex-col',
        props.class,
      )}
    >
      <div class="overflow-auto" style={{ 'flex-basis': `${size()}%` }}>
        {props.start}
      </div>
      <div
        role="separator"
        aria-orientation={orientation()}
        aria-valuenow={Math.round(size())}
        aria-valuemin={min()}
        aria-valuemax={max()}
        tabindex={0}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        class={cn(
          'shrink-0 bg-border transition-colors hover:bg-primary/50 focus-visible:bg-primary/50 focus-visible:outline-none',
          orientation() === 'horizontal' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize',
        )}
      />
      <div class="flex-1 overflow-auto" style={{ 'flex-basis': `${100 - size()}%` }}>
        {props.end}
      </div>
    </div>
  )
}
