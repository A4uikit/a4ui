// SlashMenu — filterable "/" insert/command menu (the "type / to insert
// anything" pattern). Presentational and keyboard-driven; the caller wires
// the '/' trigger and owns `open` + `query` (usually whatever the user typed
// after '/').
import { createEffect, createMemo, createSignal, For, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

/** A single insertable item in a {@link SlashMenu}. */
export interface SlashItem {
  /** Value passed to `onSelect` when this item is picked. */
  value: string
  /** Primary text shown on the row. */
  label: string
  /** Optional secondary text shown muted below the label. */
  description?: string
  /** Optional leading icon. */
  icon?: JSX.Element
  /** Extra terms matched against the query, in addition to label + description. */
  keywords?: string[]
}

export interface SlashMenuProps {
  items: SlashItem[]
  /** Filter text — typically whatever the user typed after '/'. */
  query: string
  /** Invoked with the picked item's `value` (click or Enter). */
  onSelect: (value: string) => void
  /** Renders nothing when `false`. @default true */
  open?: boolean
  class?: string
}

/**
 * Floating, keyboard-navigable menu for a "/"-triggered insert/command flow.
 * Filters `items` against `query` (case-insensitive match over label +
 * description + keywords), highlights an active row (↑/↓, wraps), and picks
 * it on Enter or click. Purely presentational: the caller owns the '/'
 * trigger, `open`, and `query` — this component only renders the filtered
 * list and reports the pick.
 *
 * @example
 * ```tsx
 * const [query, setQuery] = createSignal('')
 * <SlashMenu
 *   items={[{ value: 'heading', label: 'Heading', icon: <Heading size={16} /> }]}
 *   query={query()}
 *   onSelect={(value) => insertBlock(value)}
 * />
 * ```
 */
export function SlashMenu(props: SlashMenuProps): JSX.Element {
  const [active, setActive] = createSignal(0)
  let rootRef: HTMLDivElement | undefined

  const isOpen = () => props.open ?? true

  const results = createMemo<SlashItem[]>(() => {
    const q = props.query.trim().toLowerCase()
    if (!q) return props.items
    return props.items.filter((item) =>
      `${item.label} ${item.description ?? ''} ${(item.keywords ?? []).join(' ')}`.toLowerCase().includes(q),
    )
  })

  // Keep the highlighted row in range whenever the filtered set changes.
  createEffect(() => {
    results()
    setActive(0)
  })

  // Focus the menu whenever it opens so arrow keys work immediately.
  createEffect(() => {
    if (isOpen()) rootRef?.focus()
  })

  const pick = (item: SlashItem) => props.onSelect(item.value)

  const onKeyDown = (e: KeyboardEvent) => {
    const list = results()
    if (list.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % list.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + list.length) % list.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = list[active()]
      if (item) pick(item)
    }
  }

  return (
    <Show when={isOpen()}>
      <div
        ref={rootRef}
        role="listbox"
        tabindex={0}
        onKeyDown={onKeyDown}
        class={cn(
          'card max-h-72 overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-lg outline-none',
          props.class,
        )}
      >
        <Show
          when={results().length}
          fallback={<div class="px-3 py-6 text-center text-sm text-muted-foreground">No matches</div>}
        >
          <For each={results()}>
            {(item, i) => (
              <div
                role="option"
                aria-selected={active() === i()}
                onMouseEnter={() => setActive(i())}
                onClick={() => pick(item)}
                class={cn(
                  'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left transition-colors',
                  active() === i() ? 'bg-muted' : undefined,
                )}
              >
                <Show when={item.icon}>
                  <span class="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground">
                    {item.icon}
                  </span>
                </Show>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm text-foreground">{item.label}</div>
                  <Show when={item.description}>
                    <div class="truncate text-xs text-muted-foreground">{item.description}</div>
                  </Show>
                </div>
              </div>
            )}
          </For>
        </Show>
      </div>
    </Show>
  )
}
