// BarList — a ranked horizontal bar list built from plain flex `div`s (no
// SVG, no charting library). Rows are sorted by value descending; each row
// is a full-width track with a low-opacity theme-toned fill sized to
// `value / max`, the `name` overlaid at the left (truncated, linked when
// `href` is set) and the formatted value at the right. Colors come from
// theme tokens only.
import { For, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

export interface BarListDatum {
  name: string
  value: number
  href?: string
}

export interface BarListProps {
  data: BarListDatum[]
  /** Formats the raw value shown at the row's end. Default `String`. */
  valueFormat?: (n: number) => string
  /** Fill color token. Default 'primary'. */
  tone?: 'primary' | 'accent'
  class?: string
}

/**
 * Ranked horizontal bar list: rows sorted by `value` descending, each a
 * full-width track with a low-opacity fill sized to `value / max` of the
 * tallest row, the `name` overlaid at the left (truncated, rendered as a
 * link when `href` is set) and the formatted value at the right. Compact
 * and reflows with its container.
 *
 * @example
 * ```tsx
 * <BarList
 *   data={[
 *     { name: '/dashboard', value: 842, href: '/pages/dashboard' },
 *     { name: '/settings', value: 231 },
 *   ]}
 *   tone="accent"
 * />
 * ```
 */
export function BarList(props: BarListProps): JSX.Element {
  const tone = () => props.tone ?? 'primary'
  const format = () => props.valueFormat ?? ((n: number) => String(n))
  const fillClass = () => (tone() === 'accent' ? 'bg-accent/15' : 'bg-primary/15')
  const sorted = () => [...props.data].sort((a, b) => b.value - a.value)
  const max = () => Math.max(...props.data.map((d) => d.value), 0) || 1

  return (
    <div class={cn('flex w-full flex-col gap-1.5', props.class)}>
      <For each={sorted()}>
        {(datum) => (
          <div class="relative isolate flex h-8 w-full min-w-0 items-center overflow-hidden rounded-md bg-muted/40">
            <div
              class={cn('absolute inset-y-0 left-0 rounded-md transition-all', fillClass())}
              style={{ width: `${Math.max((datum.value / max()) * 100, 0)}%` }}
            />
            <Show
              when={datum.href}
              fallback={
                <span class="relative z-10 min-w-0 flex-1 truncate px-2.5 text-sm text-foreground">
                  {datum.name}
                </span>
              }
            >
              <a
                href={datum.href}
                class="relative z-10 min-w-0 flex-1 truncate px-2.5 text-sm text-foreground underline-offset-2 hover:underline"
              >
                {datum.name}
              </a>
            </Show>
            <span class="relative z-10 shrink-0 px-2.5 text-sm tabular-nums text-muted-foreground">
              {format()(datum.value)}
            </span>
          </div>
        )}
      </For>
    </div>
  )
}
