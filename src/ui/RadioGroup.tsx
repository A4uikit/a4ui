// Accessible single-choice group on Kobalte's RadioGroup primitive.
import { RadioGroup as KRadioGroup } from '@kobalte/core/radio-group'
import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { cn } from '../lib/cn'

/** A single selectable choice within a {@link RadioGroup}. */
export interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

interface RadioGroupProps {
  value: string
  onChange: (value: string) => void
  options: RadioOption[]
  /** Group label rendered above the options. */
  label?: string
  class?: string
}

/**
 * Accessible single-choice group, built on Kobalte's `RadioGroup` primitive
 * (arrow-key navigation, ARIA roles). Use when all options should stay
 * visible at once, unlike {@link Select} which hides options until opened.
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   label="Plan"
 *   value={plan()}
 *   onChange={setPlan}
 *   options={[
 *     { value: 'free', label: 'Free' },
 *     { value: 'pro', label: 'Pro' },
 *   ]}
 * />
 * ```
 */
export function RadioGroup(props: RadioGroupProps): JSX.Element {
  return (
    <KRadioGroup
      value={props.value}
      onChange={props.onChange}
      class={cn('flex flex-col gap-2', props.class)}
    >
      <Show when={props.label}>
        <KRadioGroup.Label class="text-sm font-medium text-foreground">
          {props.label}
        </KRadioGroup.Label>
      </Show>
      <For each={props.options}>
        {(option) => (
          <KRadioGroup.Item
            value={option.value}
            disabled={option.disabled}
            class="flex items-center gap-2 text-sm text-foreground data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
          >
            <KRadioGroup.ItemInput />
            <KRadioGroup.ItemControl class="grid h-4 w-4 place-items-center rounded-full border border-input transition-colors data-[checked]:border-primary">
              <KRadioGroup.ItemIndicator class="h-2 w-2 rounded-full bg-primary" />
            </KRadioGroup.ItemControl>
            <KRadioGroup.ItemLabel>{option.label}</KRadioGroup.ItemLabel>
          </KRadioGroup.Item>
        )}
      </For>
    </KRadioGroup>
  )
}
