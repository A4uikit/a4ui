// Searchable single-select on Kobalte's Combobox primitive (string options).
import { Combobox as KCombobox } from '@kobalte/core/combobox'
import { Check, ChevronsUpDown } from 'lucide-solid'
import type { JSX } from 'solid-js'

import { cn } from '../lib/cn'

interface ComboboxProps {
  /** Full list of selectable string options (filtered as the user types). */
  options: string[]
  value: string
  /** Called with the newly selected option, or `''` if the selection is cleared. */
  onChange: (value: string) => void
  placeholder?: string
  class?: string
}

/**
 * Searchable single-select dropdown for plain string options, built on
 * Kobalte's `Combobox` primitive with a filterable text input and trigger.
 *
 * @example
 * ```tsx
 * <Combobox
 *   options={['Draft', 'Active', 'Archived']}
 *   value={status()}
 *   onChange={setStatus}
 *   placeholder="Select a status"
 * />
 * ```
 */
export function Combobox(props: ComboboxProps): JSX.Element {
  return (
    <KCombobox
      options={props.options}
      value={props.value}
      onChange={(v) => props.onChange(v ?? '')}
      placeholder={props.placeholder}
      class={cn('w-full', props.class)}
      itemComponent={(itemProps) => (
        <KCombobox.Item
          item={itemProps.item}
          class="flex cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-muted"
        >
          <KCombobox.ItemLabel>{itemProps.item.rawValue}</KCombobox.ItemLabel>
          <KCombobox.ItemIndicator>
            <Check class="h-4 w-4" />
          </KCombobox.ItemIndicator>
        </KCombobox.Item>
      )}
    >
      <KCombobox.Control class="flex w-full items-center rounded-md border border-input bg-background text-foreground transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
        <KCombobox.Input class="w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground" />
        <KCombobox.Trigger class="grid h-9 w-9 shrink-0 place-items-center text-muted-foreground">
          <KCombobox.Icon>
            <ChevronsUpDown class="h-4 w-4" />
          </KCombobox.Icon>
        </KCombobox.Trigger>
      </KCombobox.Control>
      <KCombobox.Portal>
        <KCombobox.Content class="z-50 overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-sm">
          <KCombobox.Listbox class="max-h-60 overflow-y-auto" />
        </KCombobox.Content>
      </KCombobox.Portal>
    </KCombobox>
  )
}
