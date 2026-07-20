// Balance-first summary card for finance dashboards: a label, a large
// formatted balance, and an optional up/down delta chip.
import type { JSX } from 'solid-js'
import { Show } from 'solid-js'
import { TrendingDown, TrendingUp } from 'lucide-solid'

import { cn } from '../lib/cn'
import { Badge } from './Badge'
import { Card, CardContent } from './Card'

export interface BalanceCardProps {
  label: string
  amount: number
  /** ISO 4217 currency code. Defaults to `'USD'`. */
  currency?: string
  /** BCP 47 locale used for formatting. Defaults to `'en-US'`. */
  locale?: string
  /** Period-over-period change as a fraction (0.042 = +4.2%). Shows an up/down chip. */
  delta?: number
  /** Small line under the balance (e.g. "Available" / account number). */
  sub?: JSX.Element
  class?: string
}

/**
 * Balance-first summary card: label, large formatted amount, and an optional
 * signed-percent delta chip (up/down colored via {@link Badge} tones).
 *
 * @example
 * ```tsx
 * <BalanceCard label="Total balance" amount={128430.52} delta={0.042} />
 * ```
 */
export function BalanceCard(props: BalanceCardProps): JSX.Element {
  const format = () =>
    new Intl.NumberFormat(props.locale ?? 'en-US', {
      style: 'currency',
      currency: props.currency ?? 'USD',
    }).format(props.amount)

  const isPositive = () => (props.delta ?? 0) >= 0

  const deltaLabel = () => {
    const pct = Math.abs(props.delta as number) * 100
    const rounded = Math.round(pct * 10) / 10
    return `${isPositive() ? '+' : '-'}${rounded}%`
  }

  return (
    <Card glass class={cn('inline-block', props.class)}>
      <CardContent class="flex flex-col gap-2">
        <span class="text-sm text-muted-foreground">{props.label}</span>
        <div class="flex items-center gap-3">
          <span class="text-3xl font-bold text-foreground">{format()}</span>
          <Show when={props.delta !== undefined}>
            <Badge tone={isPositive() ? 'success' : 'danger'}>
              <Show when={isPositive()} fallback={<TrendingDown class="h-3 w-3" aria-hidden="true" />}>
                <TrendingUp class="h-3 w-3" aria-hidden="true" />
              </Show>
              {deltaLabel()}
            </Badge>
          </Show>
        </div>
        <Show when={props.sub}>{props.sub}</Show>
      </CardContent>
    </Card>
  )
}
