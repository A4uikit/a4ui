// Labelled metric block for dashboards: value + a signed delta chip, with an
// optional inline chart slot (e.g. a Sparkline from @a4ui/core/charts) passed
// in by the consumer — this component never imports the charts package.
import { ArrowDown, ArrowUp } from 'lucide-solid'
import { Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { Badge } from './Badge'
import { Card, CardContent } from './Card'

export interface KpiBlockProps {
  label: string
  value: string | number
  /** Change as a fraction (0.128 = +12.8%). Shows a signed up/down chip. */
  delta?: number
  /** Optional chart node (e.g. a <Sparkline/> from @a4ui/core/charts) shown at the bottom. */
  chart?: JSX.Element
  class?: string
}

const formatDelta = (delta: number) => `${delta >= 0 ? '+' : ''}${(delta * 100).toFixed(1)}%`

/**
 * Labelled metric tile for dashboards: a large value with a signed
 * up/down delta chip and an optional chart slot at the bottom. The chart is
 * consumer-supplied (e.g. a `<Sparkline/>` from `@a4ui/core/charts`) — this
 * component takes it as a prop rather than importing the charts package.
 *
 * @example
 * ```tsx
 * <KpiBlock label="Monthly revenue" value="$48,204" delta={0.128} />
 * ```
 */
export function KpiBlock(props: KpiBlockProps): JSX.Element {
  return (
    <Card glass class={props.class}>
      <CardContent class="p-5">
        <p class="text-sm text-muted-foreground">{props.label}</p>
        <div class="mt-1 flex items-center gap-2">
          <span class="text-2xl font-semibold text-foreground">{props.value}</span>
          <Show when={props.delta !== undefined}>
            <Badge tone={(props.delta as number) >= 0 ? 'success' : 'danger'}>
              {(props.delta as number) >= 0 ? (
                <ArrowUp class="h-3 w-3" aria-hidden="true" />
              ) : (
                <ArrowDown class="h-3 w-3" aria-hidden="true" />
              )}
              {formatDelta(props.delta as number)}
            </Badge>
          </Show>
        </div>
        <Show when={props.chart}>
          <div class={cn('mt-3')}>{props.chart}</div>
        </Show>
      </CardContent>
    </Card>
  )
}
