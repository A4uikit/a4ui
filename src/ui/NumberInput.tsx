// Numeric field with −/+ steppers on Kobalte's NumberField primitive.
import { NumberField as KNumberField } from '@kobalte/core/number-field'
import type { JSX } from 'solid-js'

import { cn } from '../lib/cn'

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  class?: string
}

const TRIGGER_CLASS =
  'grid h-9 w-9 shrink-0 place-items-center border border-input bg-background text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50'

export function NumberInput(props: NumberInputProps): JSX.Element {
  return (
    <KNumberField
      rawValue={props.value}
      onRawValueChange={(v) => props.onChange(v)}
      minValue={props.min}
      maxValue={props.max}
      class={cn('inline-flex items-stretch', props.class)}
    >
      <KNumberField.DecrementTrigger class={cn(TRIGGER_CLASS, 'rounded-l-md')} aria-label="Decrement">
        −
      </KNumberField.DecrementTrigger>
      <KNumberField.Input class="w-16 border-y border-input bg-background px-3 py-2 text-center text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30" />
      <KNumberField.IncrementTrigger class={cn(TRIGGER_CLASS, 'rounded-r-md')} aria-label="Increment">
        +
      </KNumberField.IncrementTrigger>
    </KNumberField>
  )
}
