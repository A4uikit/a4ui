// Chronological audit-trail list, newest first, grouped by day with a
// Timeline-style connector line down the left. Distinct from
// TransactionFeed (dense finance rows, no day grouping/connector) — this is
// generic activity/audit history ("who did what, when").
import { Activity } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Avatar } from './Avatar'

/** A single audit-trail entry rendered by {@link ActivityFeed}. */
export interface ActivityItem {
  id: string
  /** Name of the user/system that performed the action. */
  actor: string
  /** What happened, rendered right after `actor` (e.g. `"commented on Invoice #42"`). */
  action: JSX.Element
  /** Leading icon shown when `avatar` is omitted. Defaults to a generic activity icon. */
  icon?: JSX.Element
  /** ISO 8601 timestamp of the event. */
  timestamp: string
  avatar?: string
}

export interface ActivityFeedProps {
  items: ActivityItem[]
  class?: string
}

interface ActivityGroup {
  label: string
  items: ActivityItem[]
}

const DAY_MS = 86_400_000

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/** `"Today"` / `"Yesterday"` / a locale date, based on calendar-day distance from now. */
function dayLabel(timestamp: string): string {
  const date = new Date(timestamp)
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY_MS)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

/** Compact relative time (`"2h ago"`, `"just now"`) computed from an ISO timestamp. */
function relativeTime(timestamp: string): string {
  const diffSeconds = Math.round((Date.now() - new Date(timestamp).getTime()) / 1000)
  if (diffSeconds < 60) return 'just now'
  const diffMinutes = Math.round(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  const diffWeeks = Math.round(diffDays / 7)
  if (diffWeeks < 5) return `${diffWeeks}w ago`
  const diffMonths = Math.round(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths}mo ago`
  return `${Math.round(diffDays / 365)}y ago`
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

/** Groups items newest-first by calendar day, preserving first-seen group order. */
function groupByDay(items: ActivityItem[]): ActivityGroup[] {
  const sorted = [...items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const groups: ActivityGroup[] = []
  const byLabel = new Map<string, ActivityGroup>()
  for (const item of sorted) {
    const label = dayLabel(item.timestamp)
    let group = byLabel.get(label)
    if (!group) {
      group = { label, items: [] }
      byLabel.set(label, group)
      groups.push(group)
    }
    group.items.push(item)
  }
  return groups
}

/**
 * Chronological audit-trail list (newest first), grouped under subtle day
 * headers (`"Today"` / `"Yesterday"` / a locale date) with a continuous
 * connector line down the left, in the same spirit as {@link Timeline}. Each
 * row shows an avatar (or a fallback icon), `"{actor} {action}"`, and a
 * relative timestamp whose `title` carries the absolute time. Distinct from
 * {@link TransactionFeed}: this is generic activity/audit history, not a
 * financial ledger.
 *
 * @example
 * ```tsx
 * <ActivityFeed
 *   items={[
 *     {
 *       id: '1',
 *       actor: 'Ada Lovelace',
 *       action: <>commented on <strong>Invoice #42</strong></>,
 *       timestamp: '2026-07-21T09:15:00Z',
 *       avatar: ada.avatarUrl,
 *     },
 *     {
 *       id: '2',
 *       actor: 'System',
 *       action: 'archived the project',
 *       timestamp: '2026-07-20T18:02:00Z',
 *     },
 *   ]}
 * />
 * ```
 */
export function ActivityFeed(props: ActivityFeedProps): JSX.Element {
  const groups = () => groupByDay(props.items)

  return (
    <div class={cn('flex flex-col gap-6', props.class)}>
      <For each={groups()}>
        {(group) => (
          <div>
            <p class="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {group.label}
            </p>
            <ol class="relative flex flex-col gap-5">
              <For each={group.items}>
                {(item, index) => (
                  <li class="relative flex gap-3 pl-1">
                    <Show when={index() < group.items.length - 1}>
                      <span
                        aria-hidden="true"
                        class="absolute left-[1.375rem] top-9 -bottom-5 w-px -translate-x-1/2 bg-border"
                      />
                    </Show>
                    <Show
                      when={item.avatar}
                      fallback={
                        <span class="relative z-[1] grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                          {item.icon ?? <Activity class="h-4 w-4" />}
                        </span>
                      }
                    >
                      <span class="relative z-[1] shrink-0">
                        <Avatar src={item.avatar} alt={item.actor} fallback={initials(item.actor)} />
                      </span>
                    </Show>
                    <div class="min-w-0 flex-1 pt-1.5">
                      <p class="text-sm text-foreground">
                        <span class="font-medium">{item.actor}</span> {item.action}
                      </p>
                      <p
                        class="mt-0.5 text-xs text-muted-foreground"
                        title={new Date(item.timestamp).toLocaleString()}
                      >
                        {relativeTime(item.timestamp)}
                      </p>
                    </div>
                  </li>
                )}
              </For>
            </ol>
          </div>
        )}
      </For>
    </div>
  )
}
