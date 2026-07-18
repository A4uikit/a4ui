// Price display: current amount, optional struck-through compare-at price, and
// a danger Badge showing the discount percent when the item is on sale.
import type { JSX } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Badge } from '../ui/Badge'

/** Text size of a {@link PriceTag}'s main amount. Defaults to `'md'`. */
export type PriceTagSize = 'sm' | 'md' | 'lg'

const SIZE_CLASSES: Record<PriceTagSize, string> = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
}

export interface PriceTagProps {
  amount: number
  /** Original price; shown struck-through when greater than `amount`. */
  compareAt?: number
  /** ISO 4217 currency code. Defaults to `'USD'`. */
  currency?: string
  /** BCP 47 locale used for formatting. Defaults to `'en-US'`. */
  locale?: string
  /** Text size of the main price. Defaults to `'md'`. */
  size?: PriceTagSize
  class?: string
}

/**
 * Formatted price display with an optional struck-through compare-at price
 * and a discount-percent badge when the item is on sale.
 *
 * @example
 * ```tsx
 * <PriceTag amount={29.99} compareAt={39.99} currency="USD" />
 * ```
 */
export function PriceTag(props: PriceTagProps): JSX.Element {
  const format = (value: number) =>
    new Intl.NumberFormat(props.locale ?? 'en-US', {
      style: 'currency',
      currency: props.currency ?? 'USD',
    }).format(value)

  const onSale = () => (props.compareAt ?? 0) > props.amount

  const discountPercent = () => Math.round((1 - props.amount / (props.compareAt as number)) * 100)

  return (
    <div class={cn('inline-flex items-center gap-2', props.class)}>
      <span class={cn('font-bold text-foreground', SIZE_CLASSES[props.size ?? 'md'])}>
        {format(props.amount)}
      </span>
      <Show when={onSale()}>
        <span class="text-muted-foreground line-through">{format(props.compareAt as number)}</span>
        <Badge tone="danger">-{discountPercent()}%</Badge>
      </Show>
    </div>
  )
}
