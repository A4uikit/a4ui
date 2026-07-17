// Virtualized list: only the visible rows (+ overscan) live in the DOM, so a
// list of any length renders and scrolls instantly. Wraps @tanstack/solid-virtual
// with the remeasureAfterLayout fix (the virtualizer otherwise caches a 0×0
// viewport when the scroll container isn't laid out at mount and never renders
// a row). The consumer owns the scroll container's HEIGHT — pass it via `class`
// (e.g. "h-[65vh]"); a fixed/constrained height is required for virtualization.
import { createVirtualizer } from '@tanstack/solid-virtual'
import { For, type Accessor, type JSX } from 'solid-js'
import { createSignal } from 'solid-js'

import { cn } from '../lib/cn'
import { remeasureAfterLayout } from '../lib/virtual'

interface VirtualListProps<T> {
  /** The full data set. Only the visible slice is rendered. */
  each: T[]
  /** Estimated row size in px — a number, or a per-index function. */
  estimateSize: number | ((index: number) => number)
  /** Rows to render beyond the viewport on each side. Default 10. */
  overscan?: number
  /** Scroll-container classes. MUST constrain height (e.g. "h-[65vh]"). */
  class?: string
  /** Row renderer. `index` is an accessor so it stays reactive as rows recycle. */
  children: (item: T, index: Accessor<number>) => JSX.Element
}

export function VirtualList<T>(props: VirtualListProps<T>): JSX.Element {
  const [scrollEl, setScrollEl] = createSignal<HTMLElement>()
  const virt = createVirtualizer({
    get count() {
      return props.each.length
    },
    getScrollElement: () => scrollEl() ?? null,
    estimateSize: (i) => (typeof props.estimateSize === 'function' ? props.estimateSize(i) : props.estimateSize),
    get overscan() {
      return props.overscan ?? 10
    },
  })
  // eslint-disable-next-line solid/reactivity -- scrollEl is read inside the helper's onMount (a tracked scope)
  remeasureAfterLayout(scrollEl, setScrollEl)

  return (
    <div ref={setScrollEl} class={cn('overflow-auto', props.class)}>
      {/* Full-height spacer so the scrollbar reflects the whole list; each row is
          absolutely positioned at its computed offset. */}
      <div style={{ position: 'relative', width: '100%', height: `${virt.getTotalSize()}px` }}>
        <For each={virt.getVirtualItems()}>
          {(vi) => (
            <div
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: `${vi.size}px`,
                transform: `translateY(${vi.start}px)`,
              }}
            >
              {props.children(props.each[vi.index], () => vi.index)}
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
