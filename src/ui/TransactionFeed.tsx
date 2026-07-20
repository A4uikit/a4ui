// Dense transaction/activity list for finance dashboards: icon, title +
// subtitle on the left, currency amount (+ optional date) on the right.
// Outgoing amounts render in the default foreground; incoming amounts use a
// success text tone (never a hardcoded green) so it recolors with the theme.
import { For, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

/** A single row in a {@link TransactionFeed}. */
export interface Transaction {
  id: string
  title: string
  subtitle?: string
  /** Negative = outgoing, positive (or zero) = incoming. */
  amount: number
  /** ISO or display string. Required to group rows when `groupByDate` is set. */
  date?: string
  icon?: JSX.Element
}

export interface TransactionFeedProps {
  transactions: Transaction[]
  /** ISO 4217 currency code. Defaults to `'USD'`. */
  currency?: string
  /** BCP 47 locale used for formatting. Defaults to `'en-US'`. */
  locale?: string
  /** Group rows under date headers (uses each tx.date). @default false */
  groupByDate?: boolean
  class?: string
}

interface TransactionGroup {
  date: string
  items: Transaction[]
}

/** Groups transactions by `date`, preserving first-seen order of each group. */
function groupTransactions(transactions: Transaction[]): TransactionGroup[] {
  const groups: TransactionGroup[] = []
  const byDate = new Map<string, TransactionGroup>()
  for (const tx of transactions) {
    const key = tx.date ?? ''
    let group = byDate.get(key)
    if (!group) {
      group = { date: key, items: [] }
      byDate.set(key, group)
      groups.push(group)
    }
    group.items.push(tx)
  }
  return groups
}

/**
 * Dense vertical list of transactions/activity for finance dashboards. Each
 * row shows an optional leading icon, a title + subtitle, and the amount
 * formatted as currency — incoming (`amount >= 0`) in a success text tone,
 * outgoing as `-$X` in the default foreground. Optionally groups rows under
 * `text-xs uppercase` date headers via `groupByDate`.
 *
 * @example
 * ```tsx
 * <TransactionFeed
 *   transactions={[
 *     { id: '1', title: 'Acme Corp', subtitle: 'Invoice #1042', amount: 1200, date: '2026-07-18' },
 *     { id: '2', title: 'Cloud Hosting', subtitle: 'Monthly plan', amount: -49.99, date: '2026-07-17' },
 *   ]}
 * />
 * ```
 */
export function TransactionFeed(props: TransactionFeedProps): JSX.Element {
  const format = (value: number) =>
    new Intl.NumberFormat(props.locale ?? 'en-US', {
      style: 'currency',
      currency: props.currency ?? 'USD',
    }).format(Math.abs(value))

  const row = (tx: Transaction, showDate: boolean) => (
    <li class="flex items-center gap-3 py-2.5">
      <Show when={tx.icon}>
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">{tx.icon}</div>
      </Show>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-foreground">{tx.title}</p>
        <Show when={tx.subtitle}>
          <p class="truncate text-xs text-muted-foreground">{tx.subtitle}</p>
        </Show>
      </div>
      <div class="shrink-0 text-right">
        <p
          class={cn(
            'text-sm font-medium tabular-nums',
            tx.amount >= 0 ? 'text-emerald-400 light:text-emerald-700' : 'text-foreground',
          )}
        >
          {tx.amount >= 0 ? format(tx.amount) : `-${format(tx.amount)}`}
        </p>
        <Show when={showDate && tx.date}>
          <p class="text-xs text-muted-foreground">{tx.date}</p>
        </Show>
      </div>
    </li>
  )

  return (
    <Show
      when={props.groupByDate}
      fallback={
        <ul class={cn('divide-y divide-border/60', props.class)}>
          <For each={props.transactions}>{(tx) => row(tx, true)}</For>
        </ul>
      }
    >
      <div class={cn('flex flex-col gap-4', props.class)}>
        <For each={groupTransactions(props.transactions)}>
          {(group) => (
            <div>
              <Show when={group.date}>
                <p class="mb-1 text-xs uppercase text-muted-foreground">{group.date}</p>
              </Show>
              <ul class="divide-y divide-border/60">
                <For each={group.items}>{(tx) => row(tx, false)}</For>
              </ul>
            </div>
          )}
        </For>
      </div>
    </Show>
  )
}
