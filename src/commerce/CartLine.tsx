// A single cart row: thumbnail, title + unit price, quantity stepper, line
// total, and an optional remove button.
import { Trash2 } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../lib/cn'
import { PriceTag } from './PriceTag'
import { QuantityStepper } from './QuantityStepper'

export interface CartLineProps {
  title: string
  /** Unit price. */
  price: number
  quantity: number
  image?: string
  /** ISO 4217 currency code. Defaults to `'USD'`. */
  currency?: string
  /** BCP 47 locale used for formatting. Defaults to `'en-US'`. */
  locale?: string
  onQuantityChange?: (quantity: number) => void
  onRemove?: () => void
  class?: string
}

/**
 * One line item in a shopping cart: thumbnail, title with unit price, a
 * {@link QuantityStepper}, the line total, and an optional remove action.
 *
 * @example
 * ```tsx
 * <CartLine
 *   title="Wireless Mouse"
 *   price={29.99}
 *   quantity={2}
 *   image="/mouse.jpg"
 *   onQuantityChange={setQty}
 *   onRemove={() => removeLine(id)}
 * />
 * ```
 */
export function CartLine(props: CartLineProps): JSX.Element {
  const lineTotal = () => props.price * props.quantity

  const format = (value: number) =>
    new Intl.NumberFormat(props.locale ?? 'en-US', {
      style: 'currency',
      currency: props.currency ?? 'USD',
    }).format(value)

  return (
    <div class={cn('flex flex-wrap items-center gap-4', props.class)}>
      <Show when={props.image}>
        <img
          src={props.image}
          alt={props.title}
          class="h-16 w-16 shrink-0 rounded-md bg-muted object-cover"
        />
      </Show>
      <div class="min-w-[8rem] flex-1">
        <p class="line-clamp-1 font-medium text-foreground">{props.title}</p>
        <PriceTag amount={props.price} currency={props.currency} locale={props.locale} size="sm" />
      </div>
      <QuantityStepper
        value={props.quantity}
        onChange={(quantity) => props.onQuantityChange?.(quantity)}
        min={1}
      />
      <span class="min-w-[4rem] text-right font-medium tabular-nums text-foreground">
        {format(lineTotal())}
      </span>
      <Show when={props.onRemove}>
        <button
          type="button"
          aria-label="Remove item"
          class="text-muted-foreground hover:text-foreground"
          onClick={() => props.onRemove?.()}
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </Show>
    </div>
  )
}
