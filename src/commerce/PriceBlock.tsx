// Richer price display than PriceTag: compare-at savings badge, a coupon
// chip with the after-coupon price, and an optional financing estimate line.
import { CreditCard } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Badge } from '../ui/Badge'

/** Text size of a {@link PriceBlock}'s main amount. Defaults to `'lg'`. */
export type PriceBlockSize = 'md' | 'lg'

const SIZE_CLASSES: Record<PriceBlockSize, string> = {
  md: 'text-xl',
  lg: 'text-3xl',
}

export interface PriceBlockCoupon {
  code: string
  /** Flat amount off (currency units). If omitted, no reduction is computed. */
  amount?: number
  /** Optional label override. */
  label?: string
}

export interface PriceBlockFinancing {
  /** Number of monthly installments. */
  months: number
  /** Annual APR as a decimal, e.g. 0.1 for 10%. Omit/0 = interest-free split. */
  apr?: number
}

export interface PriceBlockProps {
  amount: number
  /** Original price; struck through and used for the savings badge when > amount. */
  compareAt?: number
  /** ISO 4217 currency code. Defaults to `'USD'`. */
  currency?: string
  /** BCP 47 locale used for formatting. Defaults to `'en-US'`. */
  locale?: string
  /** Coupon; renders a chip and the after-coupon price. */
  coupon?: PriceBlockCoupon
  /** Financing estimate; renders "As low as $X/mo". */
  financing?: PriceBlockFinancing
  /** Extra note under the price (e.g. a wire-transfer discount line). */
  note?: JSX.Element
  /** Text size of the main price. Defaults to `'lg'`. */
  size?: PriceBlockSize
  class?: string
}

/**
 * Full price display: main amount, optional struck-through compare-at price
 * with a savings badge, a coupon chip with the after-coupon price, and an
 * optional financing estimate ("As low as $X/mo").
 *
 * @example
 * ```tsx
 * <PriceBlock
 *   amount={249}
 *   compareAt={329}
 *   coupon={{ code: 'SAVE50', amount: 50 }}
 *   financing={{ months: 12, apr: 0.1 }}
 * />
 * ```
 */
export function PriceBlock(props: PriceBlockProps): JSX.Element {
  const format = (value: number) =>
    new Intl.NumberFormat(props.locale ?? 'en-US', {
      style: 'currency',
      currency: props.currency ?? 'USD',
    }).format(value)

  const onSale = () => (props.compareAt ?? 0) > props.amount

  const savings = () => (props.compareAt as number) - props.amount

  const discountPercent = () => Math.round((1 - props.amount / (props.compareAt as number)) * 100)

  const afterCouponAmount = () => {
    const couponAmount = props.coupon?.amount ?? 0
    return Math.max(0, props.amount - couponAmount)
  }

  const monthlyPayment = () => {
    const financing = props.financing as PriceBlockFinancing
    const apr = financing.apr ?? 0
    if (apr > 0) {
      const r = apr / 12
      const n = financing.months
      const m = (props.amount * r) / (1 - (1 + r) ** -n)
      return Math.round(m * 100) / 100
    }
    return Math.round((props.amount / financing.months) * 100) / 100
  }

  return (
    <div class={cn('flex flex-col gap-1', props.class)}>
      <div class="flex flex-wrap items-center gap-2">
        <span class={cn('font-bold text-foreground', SIZE_CLASSES[props.size ?? 'lg'])}>
          {format(props.amount)}
        </span>
        <Show when={onSale()}>
          <span class="text-muted-foreground line-through">{format(props.compareAt as number)}</span>
          <Badge tone="danger">
            Save {format(savings())} (-{discountPercent()}%)
          </Badge>
        </Show>
      </div>
      <Show when={props.coupon}>
        {(coupon) => (
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1 rounded-md border border-dashed border-primary/50 px-2 py-0.5 text-xs font-mono text-foreground">
              {coupon().label ?? 'Coupon'} {coupon().code}
            </span>
            <Show when={coupon().amount !== undefined}>
              <span class="text-sm text-muted-foreground">
                {format(afterCouponAmount())} after code {coupon().code}
              </span>
            </Show>
          </div>
        )}
      </Show>
      <Show when={props.financing}>
        <span class="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <CreditCard class="h-4 w-4" />
          As low as {format(monthlyPayment())}/mo
        </span>
      </Show>
      <Show when={props.note}>{props.note}</Show>
    </div>
  )
}
