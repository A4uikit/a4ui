// GitHub-contributions-style activity grid: the last `weeks` weeks rendered as
// columns of 7 Sun→Sat day-cells, each shaded into one of 5 intensity buckets by
// its count. Plain Solid + theme tokens (works in light/dark) — level 0 is
// `bg-muted`, levels 1–4 are `bg-primary` at rising opacity via a static class
// map (never computed classes). Native `title` gives a hover tooltip per day.
import type { JSX } from 'solid-js'
import { For } from 'solid-js'

import { cn } from '../lib/cn'

/** A single day's activity count, keyed by an ISO `YYYY-MM-DD` date. */
export interface HeatmapValue {
  date: string
  count: number
}

export interface CalendarHeatmapProps {
  /** Activity counts to plot; dates outside the visible range are ignored. */
  values: HeatmapValue[]
  /** Number of week-columns to show, ending on today. Default 26. */
  weeks?: number
  class?: string
}

// Level 0 uses the neutral muted token; levels 1–4 tint the primary token at
// increasing opacity. Kept as a literal map so Tailwind can see every class.
const LEVEL_CLASSES = ['bg-muted', 'bg-primary/25', 'bg-primary/45', 'bg-primary/70', 'bg-primary'] as const

/** Bucket a raw count into an intensity level 0..4. */
function levelFor(count: number): number {
  if (count <= 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 9) return 3
  return 4
}

/** Local-time `YYYY-MM-DD` key for a Date. */
function isoKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * GitHub-contributions-style heatmap: a grid of the last `weeks` weeks ending
 * today, laid out as columns (one per week) of 7 vertically-stacked day-cells
 * (Sun→Sat). Each cell is shaded by its count into 5 intensity levels and shows
 * a native tooltip like "3 on 2026-07-10". A "Less … More" legend sits below.
 * Theme-agnostic (semantic tokens only).
 *
 * @example
 * ```tsx
 * <CalendarHeatmap values={[{ date: '2026-07-10', count: 3 }]} weeks={26} />
 * ```
 */
export function CalendarHeatmap(props: CalendarHeatmapProps): JSX.Element {
  const weeks = () => props.weeks ?? 26

  // date -> count lookup from the provided values.
  const counts = () => {
    const map = new Map<string, number>()
    for (const v of props.values) map.set(v.date, (map.get(v.date) ?? 0) + v.count)
    return map
  }

  // Build `weeks` columns ending on the week that contains today. The grid ends
  // on the Saturday of the current week; column 0 is the earliest week.
  const columns = () => {
    const lookup = counts()
    const today = new Date()
    // Start of the current week (Sunday), then step back to the first column.
    const currentSunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
    const cols: { date: Date; count: number; level: number; key: string }[][] = []
    for (let w = 0; w < weeks(); w++) {
      const weekOffset = (weeks() - 1 - w) * 7
      const col: { date: Date; count: number; level: number; key: string }[] = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(
          currentSunday.getFullYear(),
          currentSunday.getMonth(),
          currentSunday.getDate() - weekOffset + d,
        )
        const key = isoKey(date)
        const count = lookup.get(key) ?? 0
        col.push({ date, count, level: levelFor(count), key })
      }
      cols.push(col)
    }
    return cols
  }

  return (
    <div class={cn('inline-flex flex-col gap-2', props.class)}>
      <div class="flex gap-1">
        <For each={columns()}>
          {(col) => (
            <div class="flex flex-col gap-1">
              <For each={col}>
                {(cell) => (
                  <div
                    title={`${cell.count} on ${cell.key}`}
                    class={cn('h-[11px] w-[11px] rounded-sm', LEVEL_CLASSES[cell.level])}
                  />
                )}
              </For>
            </div>
          )}
        </For>
      </div>

      <div class="flex items-center gap-1 text-xs text-muted-foreground">
        <span>Less</span>
        <For each={LEVEL_CLASSES}>
          {(levelClass) => <div class={cn('h-[11px] w-[11px] rounded-sm', levelClass)} />}
        </For>
        <span>More</span>
      </div>
    </div>
  )
}
