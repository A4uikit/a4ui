// BarChart — a simple vertical bar chart built from plain flex `div`s (no
// SVG, no charting library). Bar heights are percentages of the tallest
// value so the whole chart reflows with its container, and height changes
// animate via `transition-all`. Colors come from theme tokens only.
import { For, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

export interface BarDatum {
  label: string
  value: number
}

export interface BarChartProps {
  data: BarDatum[]
  /** Height of the plot area in px. Default 160. */
  height?: number
  /** Fill color token. Default 'primary'. */
  tone?: 'primary' | 'accent'
  class?: string
}

/**
 * Vertical bar chart rendered with flexbox: each bar's height is `value /
 * max` of the plot area, filled with a theme token, with its label truncated
 * beneath it and its raw value available via a native tooltip.
 *
 * @example
 * ```tsx
 * <BarChart data={[{ label: 'Mon', value: 12 }, { label: 'Tue', value: 30 }]} tone="accent" />
 * ```
 */
export function BarChart(props: BarChartProps): JSX.Element {
  const height = () => props.height ?? 160
  const tone = () => props.tone ?? 'primary'
  const max = () => Math.max(...props.data.map((d) => d.value), 0) || 1
  const barClass = () => (tone() === 'accent' ? 'bg-accent' : 'bg-primary')

  return (
    <div class={cn('flex w-full items-end gap-2', props.class)} style={{ height: `${height()}px` }}>
      <For each={props.data}>
        {(datum) => (
          <div class="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
            <div
              title={`${datum.label}: ${datum.value}`}
              class={cn('w-full rounded-t transition-all', barClass())}
              style={{ height: `${Math.max((datum.value / max()) * 100, 0)}%` }}
            />
            <span class="w-full truncate text-center text-xs text-muted-foreground">{datum.label}</span>
          </div>
        )}
      </For>
    </div>
  )
}
