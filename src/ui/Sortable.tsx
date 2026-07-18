// Generic drag-to-reorder list. Dragging is pointer-events based (mouse +
// touch, no HTML5 drag/drop, no external lib): a grip handle starts the drag,
// a floating clone follows the pointer through a Portal, and the grabbed
// row's slot collapses into a dashed placeholder until it's dropped.
import { createEffect, createSignal, For, Show, type JSX } from 'solid-js'
import { Portal } from 'solid-js/web'
import { GripVertical } from 'lucide-solid'

import { cn } from '../lib/cn'

export interface SortableProps<T> {
  /** The items to render, in current order. */
  items: T[]
  /** Stable unique key for an item (used for drag tracking + list keying). */
  itemKey: (item: T) => string
  /** Render an item's content (the grip handle is added automatically to its left). */
  children: (item: T) => JSX.Element
  /** Called with the new order after a drop. */
  onReorder: (items: T[]) => void
  /** Disable dragging. */
  disabled?: boolean
  class?: string
}

interface Drag {
  key: string
  y: number
  offset: number
  height: number
  width: number
  left: number
}

/**
 * Vertical list whose rows reorder by dragging a grip handle. Pointer-events
 * driven (works with mouse and touch): the grabbed row leaves behind a dashed
 * placeholder while a floating clone follows the pointer, and other rows shift
 * live as the pointer crosses their midpoint. `onReorder` fires once on drop
 * with the final order.
 *
 * @example
 * ```tsx
 * <Sortable
 *   items={fields()}
 *   itemKey={(f) => f.id}
 *   onReorder={setFields}
 * >
 *   {(field) => <span>{field.label}</span>}
 * </Sortable>
 * ```
 */
export function Sortable<T>(props: SortableProps<T>): JSX.Element {
  // eslint-disable-next-line solid/reactivity -- seed once; a createEffect below keeps it in sync
  const [local, setLocal] = createSignal<T[]>(props.items)
  const [drag, setDrag] = createSignal<Drag | null>(null)
  let listRef: HTMLDivElement | undefined

  createEffect(() => {
    const next = props.items
    if (!drag()) setLocal(next)
  })

  const onDragMove = (e: PointerEvent) => {
    const d = drag()
    if (!d || !listRef) return
    setDrag({ ...d, y: e.clientY })
    const rows = Array.from(listRef.querySelectorAll<HTMLElement>('[data-sortable-item]'))
    let target = rows.length - 1
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].getBoundingClientRect()
      if (e.clientY < r.top + r.height / 2) {
        target = i
        break
      }
    }
    const cur = local()
    const from = cur.findIndex((it) => props.itemKey(it) === d.key)
    if (from === -1 || from === target) return
    const next = cur.slice()
    const [moved] = next.splice(from, 1)
    next.splice(target, 0, moved)
    setLocal(next)
  }

  const onDragStart = (e: PointerEvent, key: string) => {
    if (props.disabled) return
    e.preventDefault()
    const row = (e.currentTarget as HTMLElement).closest('[data-sortable-item]') as HTMLElement | null
    if (!row) return
    const r = row.getBoundingClientRect()
    setDrag({ key, y: e.clientY, offset: e.clientY - r.top, height: r.height, width: r.width, left: r.left })

    const move = (ev: PointerEvent) => onDragMove(ev)
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      const order = local()
      const had = drag() !== null
      setDrag(null)
      if (had) props.onReorder(order)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const draggedItem = () => {
    const d = drag()
    if (!d) return undefined
    return local().find((it) => props.itemKey(it) === d.key)
  }

  return (
    <div ref={listRef} class={cn('flex flex-col gap-2', drag() && 'select-none', props.class)}>
      <For each={local()} fallback={null}>
        {(item) => {
          const key = props.itemKey(item)
          const isDragged = () => drag()?.key === key
          return (
            <Show
              when={!isDragged()}
              fallback={
                <div
                  data-sortable-item
                  class="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5"
                  style={{ height: `${drag()?.height ?? 0}px` }}
                />
              }
            >
              <div
                data-sortable-item
                class="flex items-center gap-2 rounded-lg border border-border bg-card p-2"
              >
                <button
                  type="button"
                  onPointerDown={(e) => onDragStart(e, key)}
                  style={{ 'touch-action': 'none' }}
                  class="cursor-grab active:cursor-grabbing text-muted-foreground shrink-0"
                  aria-label="Drag to reorder"
                  disabled={props.disabled}
                >
                  <GripVertical class="h-4 w-4" />
                </button>
                <div class="min-w-0 flex-1">{props.children(item)}</div>
              </div>
            </Show>
          )
        }}
      </For>
      <Show when={drag()}>
        {(d) => (
          <Portal>
            <div
              class="fixed shadow-2xl flex items-center gap-2 rounded-lg border border-border bg-card p-2"
              style={{
                left: `${d().left}px`,
                top: `${d().y - d().offset}px`,
                width: `${d().width}px`,
                'pointer-events': 'none',
                'z-index': 70,
              }}
            >
              <span class="text-muted-foreground shrink-0">
                <GripVertical class="h-4 w-4" />
              </span>
              <div class="min-w-0 flex-1">
                <Show when={draggedItem()}>{(item) => props.children(item())}</Show>
              </div>
            </div>
          </Portal>
        )}
      </Show>
    </div>
  )
}
