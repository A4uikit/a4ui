// List + detail-pane layout with keyboard navigation, e.g. an inbox or a
// command-result view. The list is a `listbox`; Up/Down move the selection,
// Home/End jump to the first/last item. Controlled (`selectedId`+`onSelect`)
// or uncontrolled (internal signal, defaults to the first item).
import type { JSX } from 'solid-js'
import { createMemo, createSignal, For, Show } from 'solid-js'

import { cn } from '../lib/cn'

export interface MasterDetailItem {
  id: string
  label: string
  meta?: JSX.Element
  detail: JSX.Element
}

export interface MasterDetailProps {
  items: MasterDetailItem[]
  /** Controlled selection. Uncontrolled (internal signal, defaults to the first item) when omitted. */
  selectedId?: string
  onSelect?: (id: string) => void
  class?: string
}

/**
 * List + detail-pane layout: a scrollable list of items on the left, the
 * selected item's detail content on the right. Arrow keys (and Home/End)
 * move the selection within the list.
 *
 * @example
 * ```tsx
 * <MasterDetail
 *   items={messages.map((m) => ({ id: m.id, label: m.subject, meta: <Badge>{m.from}</Badge>, detail: <MessageBody message={m} /> }))}
 * />
 * ```
 */
export function MasterDetail(props: MasterDetailProps): JSX.Element {
  const [internalId, setInternalId] = createSignal<string | undefined>(props.items[0]?.id)

  const selectedId = createMemo(() => props.selectedId ?? internalId())

  const select = (id: string) => {
    if (props.selectedId === undefined) setInternalId(id)
    props.onSelect?.(id)
  }

  const selectedItem = createMemo(() => props.items.find((item) => item.id === selectedId()))

  let listEl: HTMLDivElement | undefined

  const onKeyDown = (event: KeyboardEvent) => {
    const items = props.items
    if (items.length === 0) return
    const currentIndex = items.findIndex((item) => item.id === selectedId())

    let nextIndex: number
    if (event.key === 'ArrowDown')
      nextIndex = currentIndex < 0 ? 0 : Math.min(currentIndex + 1, items.length - 1)
    else if (event.key === 'ArrowUp') nextIndex = currentIndex < 0 ? 0 : Math.max(currentIndex - 1, 0)
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = items.length - 1
    else return

    event.preventDefault()
    const next = items[nextIndex]
    if (!next) return
    select(next.id)
    listEl?.querySelector<HTMLElement>(`[data-item-id="${next.id}"]`)?.focus()
  }

  return (
    <div class={cn('grid grid-cols-1 gap-4 sm:grid-cols-[16rem_1fr]', props.class)}>
      <div
        ref={listEl}
        role="listbox"
        aria-label="Items"
        tabindex={0}
        onKeyDown={onKeyDown}
        class="flex max-h-96 flex-col gap-1 overflow-y-auto rounded-xl border border-border bg-card p-1 text-card-foreground sm:max-h-[28rem]"
      >
        <For each={props.items}>
          {(item) => {
            const isSelected = () => item.id === selectedId()
            return (
              <button
                type="button"
                role="option"
                aria-selected={isSelected()}
                data-item-id={item.id}
                tabindex={-1}
                onClick={() => select(item.id)}
                class={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  isSelected() ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/60',
                )}
              >
                <span class="truncate">{item.label}</span>
                <Show when={item.meta}>{item.meta}</Show>
              </button>
            )
          }}
        </For>
      </div>
      <div class="rounded-xl border border-border bg-card p-5 text-card-foreground">
        {/* keyed: re-render the detail when the selected item changes (a plain
            Show wouldn't re-run its child when `when` stays truthy across items). */}
        <Show
          when={selectedItem()}
          keyed
          fallback={<p class="text-sm text-muted-foreground">Select an item to see its details.</p>}
        >
          {(item) => item.detail}
        </Show>
      </div>
    </div>
  )
}
