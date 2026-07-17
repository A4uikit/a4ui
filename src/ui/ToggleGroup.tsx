// Segmented button row on Kobalte's ToggleGroup primitive.
import { ToggleGroup as KToggleGroup } from '@kobalte/core/toggle-group'
import type { JSX } from 'solid-js'
import { For } from 'solid-js'

import { cn } from '../lib/cn'

/** One option in a {@link ToggleGroup}: its `value` and visible `label`. */
export interface ToggleGroupOption {
  value: string
  label: string
}

interface ToggleGroupProps {
  /** Currently selected option's `value`, or `null` if none is selected. Controlled — pair with `onChange`. */
  value: string | null
  onChange: (value: string | null) => void
  /** Options to render, in order, as segmented buttons. */
  options: ToggleGroupOption[]
  class?: string
}

/**
 * Single-select segmented button row, built on Kobalte's ToggleGroup
 * primitive — for exclusive-choice controls like view mode or alignment.
 *
 * @example
 * ```tsx
 * const [align, setAlign] = createSignal<string | null>('left')
 * <ToggleGroup
 *   value={align()}
 *   onChange={setAlign}
 *   options={[
 *     { value: 'left', label: 'Left' },
 *     { value: 'center', label: 'Center' },
 *   ]}
 * />
 * ```
 */
export function ToggleGroup(props: ToggleGroupProps): JSX.Element {
  return (
    <KToggleGroup
      value={props.value}
      onChange={props.onChange}
      class={cn('inline-flex gap-1 rounded-md border border-border bg-card p-1', props.class)}
    >
      <For each={props.options}>
        {(option) => (
          <KToggleGroup.Item
            value={option.value}
            class="rounded-sm px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[pressed]:bg-primary data-[pressed]:text-primary-foreground"
          >
            {option.label}
          </KToggleGroup.Item>
        )}
      </For>
    </KToggleGroup>
  )
}
