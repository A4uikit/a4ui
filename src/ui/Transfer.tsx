import type { JSX } from 'solid-js'
import { createSignal, For } from 'solid-js'
import { ChevronLeft, ChevronRight } from 'lucide-solid'

import { cn } from '../lib/cn'
import { Button } from './Button'

/** A single option shown in either pane of a {@link Transfer}. */
export interface TransferItem {
  value: string
  label: string
}

export interface TransferProps {
  /** Full pool of options; membership in `selected` decides which pane each lands in. */
  items: TransferItem[]
  /** Values currently in the right ("selected") pane. */
  selected: string[]
  /** Called with the next selected-value array whenever items are moved across. */
  onChange: (selected: string[]) => void
  /** Pane headers, `[availableTitle, selectedTitle]`. Defaults to `['Available', 'Selected']`. */
  titles?: [string, string]
  class?: string
}

/**
 * Dual-list picker: two side-by-side panes let the user shuttle items between
 * an "available" pool and a "selected" set. Tick rows in either pane, then use
 * the middle chevrons to move the ticked items across; `onChange` receives the
 * updated array of selected values.
 *
 * @example
 * ```tsx
 * const [picked, setPicked] = createSignal<string[]>(['a'])
 * <Transfer
 *   items={[{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana' }]}
 *   selected={picked()}
 *   onChange={setPicked}
 *   titles={['Fruits', 'Basket']}
 * />
 * ```
 */
export function Transfer(props: TransferProps): JSX.Element {
  const [checked, setChecked] = createSignal<Set<string>>(new Set())

  const titles = () => props.titles ?? ['Available', 'Selected']
  const available = () => props.items.filter((item) => !props.selected.includes(item.value))
  const chosen = () => props.items.filter((item) => props.selected.includes(item.value))

  const toggle = (value: string) => {
    const next = new Set(checked())
    if (next.has(value)) next.delete(value)
    else next.add(value)
    setChecked(next)
  }

  const moveRight = () => {
    const moving = available().filter((item) => checked().has(item.value))
    if (moving.length === 0) return
    props.onChange([...props.selected, ...moving.map((item) => item.value)])
    setChecked(new Set<string>())
  }

  const moveLeft = () => {
    const remove = new Set(
      chosen()
        .filter((item) => checked().has(item.value))
        .map((item) => item.value),
    )
    if (remove.size === 0) return
    props.onChange(props.selected.filter((value) => !remove.has(value)))
    setChecked(new Set<string>())
  }

  const pane = (title: string, rows: () => TransferItem[]) => (
    <div class="flex min-w-0 flex-1 flex-col rounded-lg border border-border">
      <div class="border-b border-border px-3 py-2 text-sm font-medium text-foreground">{title}</div>
      <ul class="max-h-64 flex-1 overflow-y-auto p-1">
        <For each={rows()}>
          {(item) => (
            <li>
              <label class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted">
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-input accent-primary"
                  checked={checked().has(item.value)}
                  onChange={() => toggle(item.value)}
                />
                <span class="min-w-0 truncate">{item.label}</span>
              </label>
            </li>
          )}
        </For>
      </ul>
    </div>
  )

  return (
    <div class={cn('flex items-stretch gap-3', props.class)}>
      {pane(titles()[0], available)}
      <div class="flex flex-col items-center justify-center gap-2">
        <Button variant="outline" class="px-2" onClick={moveRight} aria-label="Move to selected">
          <ChevronRight class="h-4 w-4" />
        </Button>
        <Button variant="outline" class="px-2" onClick={moveLeft} aria-label="Move to available">
          <ChevronLeft class="h-4 w-4" />
        </Button>
      </div>
      {pane(titles()[1], chosen)}
    </div>
  )
}
