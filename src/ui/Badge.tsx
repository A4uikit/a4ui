// Badge — generic tone pill. The app-specific tone/label mappers
// (flowBadgeProps, statusBadgeTone, priorityBadgeTone, …) stay in the consuming
// app: they encode business vocabulary (income/expense, project priority, user
// roles), not design-system concerns.
import { type JSX, type ParentProps, splitProps } from 'solid-js'

import { cn } from '../lib/cn'

/** Semantic tone of a {@link Badge}; drives its background/text/ring color. */
export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-muted text-muted-foreground ring-border',
  success: 'bg-emerald-500/15 text-emerald-600 ring-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-600 ring-amber-500/30',
  danger: 'bg-rose-500/15 text-rose-600 ring-rose-500/30',
  info: 'bg-sky-500/15 text-sky-600 ring-sky-500/30',
}

const BADGE_BASE =
  'badge inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap'

interface BadgeProps extends ParentProps {
  /** Visual/semantic tone. Defaults to `'neutral'`. */
  tone?: BadgeTone
  class?: string
}

/**
 * Small rounded pill for status/labels, e.g. counts, states, or tags.
 * Generic design-system primitive — app-specific tone mappers (e.g. mapping a
 * business status to a {@link BadgeTone}) should live in the consuming app.
 *
 * @example
 * ```tsx
 * <Badge tone="success">Active</Badge>
 * ```
 */
export function Badge(props: BadgeProps): JSX.Element {
  const [local, rest] = splitProps(props, ['tone', 'class', 'children'])
  return (
    <span class={cn(BADGE_BASE, TONE_CLASSES[local.tone ?? 'neutral'], local.class)} {...rest}>
      {local.children}
    </span>
  )
}
