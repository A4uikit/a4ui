// Cascading multi-level select — pick a value by drilling through columns.
import { ChevronDown, ChevronRight } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { For, Show, createMemo, createSignal, onCleanup, onMount } from 'solid-js'

import { cn } from '../lib/cn'

/** A node in a {@link Cascader} tree. `children` makes it a branch column. */
export interface CascaderOption {
  value: string
  label: string
  children?: CascaderOption[]
}

export interface CascaderProps {
  options: CascaderOption[]
  /** The currently selected value-path (root → leaf). */
  value?: string[]
  /** Fired when a leaf is chosen, with the full value-path and label-path. */
  onChange: (path: string[], labels: string[]) => void
  placeholder?: string
  class?: string
}

const TRIGGER_BASE =
  'flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30'

// Walk the tree along `value`, collecting the matched options so we can resolve
// their labels. Stops early if the path diverges from the current options.
function resolvePath(options: CascaderOption[], value: string[]): CascaderOption[] {
  const chain: CascaderOption[] = []
  let level: CascaderOption[] | undefined = options
  for (const v of value) {
    const match: CascaderOption | undefined = level?.find((o) => o.value === v)
    if (!match) break
    chain.push(match)
    level = match.children
  }
  return chain
}

/**
 * Cascading multi-level select. Renders a Select-styled trigger showing the
 * selected path (labels joined with " / "); clicking opens a floating panel of
 * side-by-side columns. Hovering an option with children reveals the next
 * column; clicking a leaf commits the selection and closes the panel.
 *
 * @example
 * ```tsx
 * <Cascader
 *   options={[
 *     { value: 'mx', label: 'Mexico', children: [
 *       { value: 'son', label: 'Sonora' },
 *       { value: 'jal', label: 'Jalisco' },
 *     ] },
 *   ]}
 *   value={path()}
 *   onChange={(p, labels) => { setPath(p); console.log(labels.join(' / ')) }}
 *   placeholder="Select a region"
 * />
 * ```
 */
export function Cascader(props: CascaderProps): JSX.Element {
  const [open, setOpen] = createSignal(false)
  // The chain of options hovered/chosen so far — drives which columns show.
  const [activePath, setActivePath] = createSignal<CascaderOption[]>([])
  let root!: HTMLDivElement

  const selected = createMemo(() => resolvePath(props.options, props.value ?? []))
  const selectedLabel = createMemo(() =>
    selected()
      .map((o) => o.label)
      .join(' / '),
  )

  // Columns to render: level 0 is the root, each further level is the children
  // of the corresponding option on the active path (if it has any).
  const columns = createMemo(() => {
    const cols: CascaderOption[][] = [props.options]
    for (const opt of activePath()) {
      if (opt.children && opt.children.length) cols.push(opt.children)
      else break
    }
    return cols
  })

  const onDocClick = (ev: MouseEvent) => {
    if (root && !root.contains(ev.target as Node)) setOpen(false)
  }
  onMount(() => document.addEventListener('mousedown', onDocClick))
  onCleanup(() => document.removeEventListener('mousedown', onDocClick))

  function toggle() {
    if (!open()) setActivePath(selected())
    setOpen((o) => !o)
  }

  // Set the active path up to (and including) `opt` at `colIndex`.
  function enter(colIndex: number, opt: CascaderOption) {
    setActivePath([...activePath().slice(0, colIndex), opt])
  }

  function choose(colIndex: number, opt: CascaderOption) {
    enter(colIndex, opt)
    if (opt.children && opt.children.length) return
    const chain = [...activePath().slice(0, colIndex), opt]
    props.onChange(
      chain.map((o) => o.value),
      chain.map((o) => o.label),
    )
    setOpen(false)
  }

  return (
    <div ref={root} class={cn('relative inline-block', props.class)}>
      <button type="button" class={TRIGGER_BASE} aria-haspopup="true" aria-expanded={open()} onClick={toggle}>
        <Show
          when={selectedLabel()}
          fallback={<span class="text-muted-foreground">{props.placeholder}</span>}
        >
          <span class="truncate">{selectedLabel()}</span>
        </Show>
        <ChevronDown class="h-4 w-4 shrink-0 opacity-60" />
      </button>
      <Show when={open()}>
        <div class="absolute z-50 mt-1 flex overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-md">
          <For each={columns()}>
            {(column, colIndex) => (
              <ul class="min-w-[10rem] max-h-64 overflow-y-auto border-r border-border p-1 last:border-r-0">
                <For each={column}>
                  {(opt) => {
                    const hasChildren = () => !!opt.children && opt.children.length > 0
                    const isActive = () => activePath()[colIndex()]?.value === opt.value
                    return (
                      <li
                        class={cn(
                          'flex items-center justify-between gap-4 rounded px-2 py-1.5 text-sm hover:bg-muted cursor-pointer',
                          isActive() && 'bg-muted text-foreground',
                        )}
                        onMouseEnter={() => hasChildren() && enter(colIndex(), opt)}
                        onClick={() => choose(colIndex(), opt)}
                      >
                        <span class="truncate">{opt.label}</span>
                        <Show when={hasChildren()}>
                          <ChevronRight class="h-4 w-4 shrink-0 opacity-60" />
                        </Show>
                      </li>
                    )
                  }}
                </For>
              </ul>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
