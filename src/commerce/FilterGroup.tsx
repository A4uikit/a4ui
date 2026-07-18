// Titled group of checkbox facet options (e.g. size, color, brand) with
// optional result counts, for faceted search/filter sidebars.
import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Checkbox } from '../ui/Checkbox'

export interface FacetOption {
  value: string
  label: string
  count?: number
}

export interface FilterGroupProps {
  title: string
  options: FacetOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  class?: string
}

/**
 * Titled group of checkbox facet options (e.g. size, color, brand), each with
 * an optional result count, for faceted search/filter sidebars.
 *
 * @example
 * ```tsx
 * <FilterGroup
 *   title="Size"
 *   options={[{ value: 'sm', label: 'Small', count: 12 }, { value: 'md', label: 'Medium', count: 8 }]}
 *   selected={selected()}
 *   onChange={setSelected}
 * />
 * ```
 */
export function FilterGroup(props: FilterGroupProps): JSX.Element {
  const toggle = (value: string, checked: boolean) => {
    const next = props.selected.slice()
    const index = next.indexOf(value)
    if (checked) {
      if (index === -1) next.push(value)
    } else if (index !== -1) {
      next.splice(index, 1)
    }
    props.onChange(next)
  }

  return (
    <div class={cn('space-y-2', props.class)}>
      <p class="text-sm font-semibold text-foreground">{props.title}</p>
      <div class="space-y-1.5">
        <For each={props.options}>
          {(option) => (
            <div class="flex items-center justify-between gap-2">
              <Checkbox
                checked={props.selected.includes(option.value)}
                onChange={(checked) => toggle(option.value, checked)}
                label={option.label}
              />
              <Show when={option.count != null}>
                <span class="text-xs text-muted-foreground">{option.count}</span>
              </Show>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
