// ⌘K command palette — fuzzy-search every component and jump to its doc.
// Lazy-loaded from App (it imports the registry), so the Home bundle stays small.
import { Dialog } from '@kobalte/core/dialog'
import { createEffect, createMemo, createSignal, For, Show, type JSX } from 'solid-js'

import { DOCS } from './registry'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (id: string) => void
}

export default function CommandPalette(props: CommandPaletteProps): JSX.Element {
  const [query, setQuery] = createSignal('')
  const [active, setActive] = createSignal(0)

  const results = createMemo(() => {
    const q = query().trim().toLowerCase()
    if (!q) return DOCS
    return DOCS.filter((d) => `${d.title} ${d.group} ${d.blurb}`.toLowerCase().includes(q))
  })

  // Reset the highlighted row whenever the result set changes.
  createEffect(() => {
    results()
    setActive(0)
  })

  const pick = (id: string) => {
    props.onSelect(id)
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
      const d = list[active()]
      if (d) pick(d.id)
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
              placeholder="Search components…"
              aria-label="Search components"
              class="w-full border-b border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <ul class="max-h-80 overflow-y-auto p-2">
              <Show
                when={results().length}
                fallback={<li class="px-3 py-8 text-center text-sm text-muted-foreground">No results</li>}
              >
                <For each={results()}>
                  {(d, i) => (
                    <li>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i())}
                        onClick={() => pick(d.id)}
                        class="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors"
                        classList={{
                          'bg-primary/15 text-foreground': active() === i(),
                          'text-muted-foreground': active() !== i(),
                        }}
                      >
                        <span class="text-sm text-foreground">{d.title}</span>
                        <span class="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {d.group}
                        </span>
                      </button>
                    </li>
                  )}
                </For>
              </Show>
            </ul>
            <div class="flex items-center gap-3 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
              <span>↑↓ to navigate</span>
              <span>↵ to open</span>
              <span>esc to close</span>
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog>
  )
}
