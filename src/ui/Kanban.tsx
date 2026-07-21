// Kanban board: columns of draggable cards, reorderable within a column and
// movable across columns. Pointer-events based drag (no HTML5 drag/drop),
// the same grip-handle + floating-clone idiom as Sortable.tsx, extended to
// track which column the pointer is currently over so cards can cross
// container boundaries. No transition/animation is applied to the drag
// itself (same as Sortable), so there's nothing to gate on reduced motion —
// drops are instant either way.
import { createEffect, createSignal, For, Show, type JSX } from 'solid-js'
import { Portal } from 'solid-js/web'
import { GripVertical } from 'lucide-solid'

import { cn } from '../lib/cn'
import { Badge } from './Badge'
import { Card } from './Card'

/** A single card on a {@link Kanban} board. */
export interface KanbanCard {
  /** Stable unique id (used for drag tracking + list keying). */
  id: string
  /** Card body — usually a title/label. */
  title: JSX.Element
  /** Optional trailing badge (e.g. priority, assignee initials). */
  badge?: JSX.Element
}

/** A column of a {@link Kanban} board. */
export interface KanbanColumn {
  /** Stable unique id. */
  id: string
  /** Column heading. */
  title: string
  /** Cards in the column, top to bottom. */
  cards: KanbanCard[]
  /** Optional WIP limit — the count badge switches to a warning tone past it. */
  limit?: number
}

export interface KanbanProps {
  /** Columns, in display order left to right. */
  columns: KanbanColumn[]
  /** Called with the full new columns array after any drag (reorder or move). */
  onChange?: (columns: KanbanColumn[]) => void
  class?: string
}

interface Drag {
  cardId: string
  card: KanbanCard
  fromColumnId: string
  currentColumnId: string
  y: number
  x: number
  offsetY: number
  offsetX: number
  height: number
  width: number
}

/**
 * Horizontal Kanban board: glass column panels holding vertical lists of
 * draggable cards. Drag a card by its grip handle to reorder it within a
 * column or drop it into another column — a dashed placeholder marks the
 * drop slot and a floating clone follows the pointer, the same pointer-events
 * idiom as {@link Sortable} extended to track which column's list the
 * pointer is currently over. Works controlled (pass `columns` sourced from
 * your own state + `onChange` to write it back) or uncontrolled (pass
 * `columns` once and just read the final layout from `onChange`).
 *
 * @example
 * ```tsx
 * const [columns, setColumns] = createSignal<KanbanColumn[]>([
 *   { id: 'todo', title: 'To do', cards: [{ id: '1', title: 'Write spec' }] },
 *   { id: 'doing', title: 'Doing', cards: [], limit: 2 },
 *   { id: 'done', title: 'Done', cards: [] },
 * ])
 * <Kanban columns={columns()} onChange={setColumns} />
 * ```
 */
export function Kanban(props: KanbanProps): JSX.Element {
  // eslint-disable-next-line solid/reactivity -- seed once; a createEffect below keeps it in sync
  const [local, setLocal] = createSignal<KanbanColumn[]>(props.columns)
  const [drag, setDrag] = createSignal<Drag | null>(null)
  const listRefs: Record<string, HTMLDivElement | undefined> = {}

  createEffect(() => {
    const next = props.columns
    if (!drag()) setLocal(next)
  })

  const moveCard = (cardId: string, targetColumnId: string, targetIndex: number) => {
    setLocal((cur) => {
      const next = cur.map((col) => ({ ...col, cards: col.cards.slice() }))
      const fromCol = next.find((col) => col.cards.some((card) => card.id === cardId))
      const toCol = next.find((col) => col.id === targetColumnId)
      if (!fromCol || !toCol) return cur
      const fromIndex = fromCol.cards.findIndex((card) => card.id === cardId)
      const [moved] = fromCol.cards.splice(fromIndex, 1)
      toCol.cards.splice(Math.min(targetIndex, toCol.cards.length), 0, moved)
      return next
    })
  }

  const onDragMove = (e: PointerEvent) => {
    const d = drag()
    if (!d) return

    // Which column's list is the pointer over horizontally?
    let targetColumnId = d.currentColumnId
    for (const [colId, el] of Object.entries(listRefs)) {
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (e.clientX >= r.left && e.clientX <= r.right) {
        targetColumnId = colId
        break
      }
    }

    // Where in that column's (other) cards does the pointer sit vertically?
    const listEl = listRefs[targetColumnId]
    const rows = listEl
      ? Array.from(listEl.querySelectorAll<HTMLElement>('[data-kanban-card]')).filter(
          (row) => row.dataset.kanbanCard !== d.cardId,
        )
      : []
    let targetIndex = rows.length
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].getBoundingClientRect()
      if (e.clientY < r.top + r.height / 2) {
        targetIndex = i
        break
      }
    }

    setDrag({ ...d, y: e.clientY, x: e.clientX, currentColumnId: targetColumnId })
    moveCard(d.cardId, targetColumnId, targetIndex)
  }

  const onDragStart = (e: PointerEvent, card: KanbanCard, columnId: string) => {
    e.preventDefault()
    const row = (e.currentTarget as HTMLElement).closest<HTMLElement>('[data-kanban-card]')
    if (!row) return
    const r = row.getBoundingClientRect()
    setDrag({
      cardId: card.id,
      card,
      fromColumnId: columnId,
      currentColumnId: columnId,
      y: e.clientY,
      x: e.clientX,
      offsetY: e.clientY - r.top,
      offsetX: e.clientX - r.left,
      height: r.height,
      width: r.width,
    })

    const move = (ev: PointerEvent) => onDragMove(ev)
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      const had = drag() !== null
      setDrag(null)
      if (had) props.onChange?.(local())
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div class={cn('flex gap-4 overflow-x-auto pb-2', drag() && 'select-none', props.class)}>
      <For each={local()}>
        {(column) => {
          const count = () => column.cards.length
          const overLimit = () => column.limit !== undefined && count() > column.limit
          return (
            <Card glass class="flex w-72 shrink-0 flex-col">
              <div class="flex items-center justify-between gap-2 border-b border-border p-3">
                <h3 class="truncate font-semibold text-foreground">{column.title}</h3>
                <Badge tone={overLimit() ? 'warning' : 'neutral'}>
                  {column.limit !== undefined ? `${count()}/${column.limit}` : `${count()}`}
                </Badge>
              </div>
              <div
                ref={(el) => (listRefs[column.id] = el)}
                class="flex min-h-[60px] flex-1 flex-col gap-2 overflow-y-auto p-3"
              >
                <For each={column.cards}>
                  {(card) => {
                    const isDragged = () => drag()?.cardId === card.id
                    return (
                      <Show
                        when={!isDragged()}
                        fallback={
                          <div
                            data-kanban-card={card.id}
                            class="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5"
                            style={{ height: `${drag()?.height ?? 0}px` }}
                          />
                        }
                      >
                        <div
                          data-kanban-card={card.id}
                          tabIndex={0}
                          class="flex items-center gap-2 rounded-lg border border-border bg-card p-2 text-card-foreground"
                        >
                          <button
                            type="button"
                            onPointerDown={(e) => onDragStart(e, card, column.id)}
                            style={{ 'touch-action': 'none' }}
                            class="shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing"
                            aria-label="Drag to move card"
                          >
                            <GripVertical class="h-4 w-4" />
                          </button>
                          <div class="min-w-0 flex-1">{card.title}</div>
                          <Show when={card.badge}>{card.badge}</Show>
                        </div>
                      </Show>
                    )
                  }}
                </For>
              </div>
            </Card>
          )
        }}
      </For>
      <Show when={drag()}>
        {(d) => (
          <Portal>
            <div
              class="fixed flex items-center gap-2 rounded-lg border border-border bg-card p-2 text-card-foreground shadow-2xl"
              style={{
                left: `${d().x - d().offsetX}px`,
                top: `${d().y - d().offsetY}px`,
                width: `${d().width}px`,
                'pointer-events': 'none',
                'z-index': 70,
              }}
            >
              <span class="shrink-0 text-muted-foreground">
                <GripVertical class="h-4 w-4" />
              </span>
              <div class="min-w-0 flex-1">{d().card.title}</div>
              <Show when={d().card.badge}>{d().card.badge}</Show>
            </div>
          </Portal>
        )}
      </Show>
    </div>
  )
}
