// ⌘K command palette on Kobalte's Dialog primitive — a generic, app-agnostic
// version of preview/CommandPalette. Feed it a flat list of CommandItems and it
// handles fuzzy filtering (label + hint + group), keyboard navigation
// (↑/↓/Enter), optional grouping, and query reset on close. Theme-agnostic:
// every color comes from a semantic token, never a literal.
import { Dialog } from '@kobalte/core/dialog'
import { createEffect, createMemo, createSignal, For, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

/** A single selectable row in the palette. */
export interface CommandItem {
  /** Primary text shown on the left of the row. */
  label: string
  /** Optional secondary text shown muted on the right. */
  hint?: string
  /** Optional group name; rows sharing a group render under one header. */
  group?: string
  /** Invoked when the row is picked (click or Enter). */
  onSelect: () => void
}

export interface CommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Flat list of commands; filtered live against the search query. */
  items: CommandItem[]
  /** Search input placeholder. @default 'Type a command…' */
  placeholder?: string
}

/**
 * A ⌘K command palette: a centered, top-anchored dialog with a search input and
 * a filtered, keyboard-navigable list of commands. Filtering is a
 * case-insensitive substring match over each item's `label + hint + group`.
 * Picking a row runs its `onSelect`, closes the palette, and clears the query.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = createSignal(false)
 * <Command
 *   open={open()}
 *   onOpenChange={setOpen}
 *   items={[
 *     { label: 'New file', hint: '⌘N', group: 'File', onSelect: () => createFile() },
 *     { label: 'Toggle theme', group: 'View', onSelect: () => toggleTheme() },
 *   ]}
 * />
 * ```
 */
export function Command(props: CommandProps): JSX.Element {
  const [query, setQuery] = createSignal('')
  const [active, setActive] = createSignal(0)

  const results = createMemo<CommandItem[]>(() => {
    const q = query().trim().toLowerCase()
    if (!q) return props.items
    return props.items.filter((item) =>
      `${item.label} ${item.hint ?? ''} ${item.group ?? ''}`.toLowerCase().includes(q),
    )
  })

  // Keep the highlighted row in range whenever the result set changes.
  createEffect(() => {
    results()
    setActive(0)
  })

  // Reset the query whenever the palette closes so it opens fresh next time.
  createEffect(() => {
    if (!props.open) setQuery('')
  })

  const pick = (item: CommandItem) => {
    item.onSelect()
    props.onOpenChange(false)
    setQuery('')
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const list = results()
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, list.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = list[active()]
      if (item) pick(item)
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay class="modal-overlay fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" />
        <div class="fixed inset-x-0 top-[14vh] z-50 mx-auto w-full max-w-lg px-4">
          <Dialog.Content
            role="dialog"
            class="modal-content bg-glass overflow-hidden rounded-xl border border-border shadow-2xl"
          >
            <input
              autofocus
              type="text"
              value={query()}
              onInput={(e) => setQuery(e.currentTarget.value)}
              onKeyDown={onKeyDown}
              placeholder={props.placeholder ?? 'Type a command…'}
              aria-label={props.placeholder ?? 'Type a command…'}
              class="w-full border-b border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <ul class="max-h-80 overflow-y-auto p-2">
              <Show
                when={results().length}
                fallback={<li class="px-3 py-8 text-center text-sm text-muted-foreground">No results</li>}
              >
                <For each={results()}>
                  {(item, i) => (
                    <li>
                      <Show when={item.group && (i() === 0 || results()[i() - 1]?.group !== item.group)}>
                        <div class="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          {item.group}
                        </div>
                      </Show>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i())}
                        onClick={() => pick(item)}
                        class={cn(
                          'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors',
                          active() === i() ? 'bg-primary/15 text-foreground' : 'text-muted-foreground',
                        )}
                      >
                        <span class="text-sm text-foreground">{item.label}</span>
                        <Show when={item.hint}>
                          <span class="text-[11px] uppercase tracking-wide text-muted-foreground">
                            {item.hint}
                          </span>
                        </Show>
                      </button>
                    </li>
                  )}
                </For>
              </Show>
            </ul>
            <div class="flex items-center gap-3 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
              <span>↑↓ to navigate</span>
              <span>↵ to select</span>
              <span>esc to close</span>
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog>
  )
}
