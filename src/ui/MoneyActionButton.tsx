// Prominent CTA reserved for value-moving actions (send / request / pay /
// withdraw). One accent, tightly scoped to money movement — deliberately
// bolder than the generic Button so it reads as "this moves money" at a
// glance, distinct from ordinary actions elsewhere in the UI.
import { ArrowDownLeft, ArrowUpRight, Banknote, CreditCard } from 'lucide-solid'
import type { Component, JSX } from 'solid-js'
import { splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { cn } from '../lib/cn'

/** Money-movement action a {@link MoneyActionButton} represents; picks the leading icon. */
export type MoneyActionKind = 'send' | 'request' | 'pay' | 'withdraw'

const KIND_ICON: Record<MoneyActionKind, Component<{ class?: string }>> = {
  send: ArrowUpRight,
  request: ArrowDownLeft,
  pay: CreditCard,
  withdraw: Banknote,
}

export interface MoneyActionButtonProps {
  children: JSX.Element
  /** Which money-movement action this triggers. Defaults to `'send'`. */
  kind?: MoneyActionKind
  onClick?: () => void
  disabled?: boolean
  class?: string
}

const BASE =
  'inline-flex h-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold bg-primary text-primary-foreground transition-[background-color,transform] duration-150 motion-reduce:transition-none hover:bg-primary/90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none disabled:opacity-50'

/**
 * Bold, full-height pill CTA reserved for value-moving actions — send,
 * request, pay, withdraw. Uses the app's single accent (`bg-primary`) so it
 * stands out from ordinary buttons, with a leading icon chosen by `kind`.
 *
 * @example
 * ```tsx
 * <MoneyActionButton kind="send" onClick={() => sendMoney()}>Send</MoneyActionButton>
 * ```
 */
export function MoneyActionButton(props: MoneyActionButtonProps): JSX.Element {
  const [local, rest] = splitProps(props, ['children', 'kind', 'class'])
  const Icon = () => KIND_ICON[local.kind ?? 'send']

  return (
    <button type="button" class={cn(BASE, local.class)} {...rest}>
      <Dynamic component={Icon()} class="h-4 w-4 shrink-0" aria-hidden="true" />
      {local.children}
    </button>
  )
}
