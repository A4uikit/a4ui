// Order summary panel: itemized lines (subtotal, shipping, tax, ...), a
// divider, a bold total row, and an optional checkout button.
import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Button } from '../ui/Button'

export interface CartSummaryItem {
  label: string
  amount: number
}

export interface CartSummaryProps {
  /** Itemized rows, e.g. Subtotal, Shipping, Tax. */
  lines: CartSummaryItem[]
  total: number
  /** ISO 4217 currency code. Defaults to `'USD'`. */
  currency?: string
  /** BCP 47 locale used for formatting. Defaults to `'en-US'`. */
  locale?: string
  /** Label for the checkout button. Defaults to `'Checkout'`. */
  checkoutLabel?: string
  onCheckout?: () => void
  class?: string
}

/**
 * Order summary panel listing itemized amounts (subtotal, shipping, tax,
 * ...), a bold total, and an optional full-width checkout button.
 *
 * @example
 * ```tsx
 * <CartSummary
 *   lines={[{ label: 'Subtotal', amount: 59.98 }, { label: 'Shipping', amount: 4.99 }]}
 *   total={64.97}
 *   onCheckout={() => goToCheckout()}
 * />
 * ```
 */
export function CartSummary(props: CartSummaryProps): JSX.Element {
  const format = (value: number) =>
    new Intl.NumberFormat(props.locale ?? 'en-US', {
      style: 'currency',
      currency: props.currency ?? 'USD',
    }).format(value)

  return (
    <div class={cn('card glow-edge rounded-xl p-5 text-card-foreground', props.class)}>
      <For each={props.lines}>
        {(line) => (
          <div class="flex items-center justify-between py-1 text-sm">
            <span class="text-muted-foreground">{line.label}</span>
            <span class="tabular-nums text-foreground">{format(line.amount)}</span>
          </div>
        )}
      </For>
      <div class="my-3 border-t border-border" />
      <div class="flex items-center justify-between text-base font-bold text-foreground">
        <span>Total</span>
        <span class="tabular-nums">{format(props.total)}</span>
      </div>
      <Show when={props.onCheckout}>
        <Button class="mt-4 w-full" onClick={() => props.onCheckout?.()}>
          {props.checkoutLabel ?? 'Checkout'}
        </Button>
      </Show>
    </div>
  )
}
