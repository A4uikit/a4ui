// Inline quantity stepper: a bordered "−"/value/"+" group, clamped to [min, max].
import { Minus, Plus } from 'lucide-solid'
import type { JSX } from 'solid-js'

import { cn } from '../lib/cn'

export interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  /** Minimum allowed value. Defaults to `0`. */
  min?: number
  /** Maximum allowed value. Defaults to `Number.MAX_SAFE_INTEGER`. */
  max?: number
  disabled?: boolean
  class?: string
}

/**
 * Bordered "−"/value/"+" control for adjusting an integer quantity, clamped to
 * `[min, max]`.
 *
 * @example
 * ```tsx
 * <QuantityStepper value={qty()} onChange={setQty} min={1} max={10} />
 * ```
 */
export function QuantityStepper(props: QuantityStepperProps): JSX.Element {
  const min = () => props.min ?? 0
  const max = () => props.max ?? Number.MAX_SAFE_INTEGER

  const clamp = (n: number) => Math.min(max(), Math.max(min(), n))

  const decrement = () => props.onChange(clamp(props.value - 1))
  const increment = () => props.onChange(clamp(props.value + 1))

  return (
    <div class={cn('inline-flex items-stretch rounded-md border border-input', props.class)}>
      <button
        type="button"
        aria-label="Decrease quantity"
        class="grid h-8 w-8 place-items-center hover:bg-muted disabled:opacity-40"
        disabled={props.disabled || props.value <= min()}
        onClick={decrement}
      >
        <Minus class="h-4 w-4" />
      </button>
      <span class="grid min-w-[2.5rem] place-items-center tabular-nums">{props.value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        class="grid h-8 w-8 place-items-center hover:bg-muted disabled:opacity-40"
        disabled={props.disabled || props.value >= max()}
        onClick={increment}
      >
        <Plus class="h-4 w-4" />
      </button>
    </div>
  )
}
