// Labeled consumption bar (e.g. token/quota usage) on Kobalte's Meter
// primitive — same idiom as Meter.tsx/Progress.tsx, plus a warning-tone fill
// past a configurable threshold and a "N left" remaining line.
import { Meter as KMeter } from '@kobalte/core/meter'
import type { JSX } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../lib/cn'

export interface UsageMeterProps {
  used: number
  limit: number
  /** Header content shown before the "{used}/{limit}{unit}" count. */
  label?: JSX.Element
  /** Appended to displayed numbers, e.g. `' tokens'` or `'%'`. */
  unit?: string
  /** Fraction of `limit` (0–1) at which the fill switches to the warning tone. @default 0.85 */
  warnAt?: number
  class?: string
}

/**
 * Labeled consumption bar: a header row with `label` and the raw
 * "{used}/{limit}{unit}" count, a track whose fill width is `used / limit`
 * (clamped to 0–100%) and switches to a warning tone once that ratio reaches
 * `warnAt`, and a small "{remaining} left" line underneath. Built on Kobalte's
 * `Meter` primitive, so it carries the same `role="meter"` a11y semantics as
 * {@link Meter}.
 *
 * @example
 * ```tsx
 * <UsageMeter used={92} limit={100} label="API requests" unit=" req" warnAt={0.9} />
 * ```
 */
export function UsageMeter(props: UsageMeterProps): JSX.Element {
  const unit = () => props.unit ?? ''
  const ratio = () => (props.limit > 0 ? props.used / props.limit : 0)
  const percent = () => Math.max(0, Math.min(100, ratio() * 100))
  const isWarning = () => ratio() >= (props.warnAt ?? 0.85)
  const remaining = () => Math.max(0, props.limit - props.used)

  return (
    <KMeter
      value={props.used}
      minValue={0}
      maxValue={props.limit}
      getValueLabel={() => `${props.used}/${props.limit}${unit()}`}
      class={cn('flex flex-col gap-1.5', props.class)}
    >
      <div class="flex items-center justify-between text-sm text-foreground">
        <Show when={props.label}>
          <KMeter.Label>{props.label}</KMeter.Label>
        </Show>
        <KMeter.ValueLabel class="ml-auto tabular-nums text-muted-foreground" />
      </div>
      <KMeter.Track class="h-2 overflow-hidden rounded-full bg-muted">
        <KMeter.Fill
          class={cn(
            'h-full rounded-full transition-all duration-500',
            isWarning() ? 'bg-amber-500' : 'bg-primary',
          )}
          style={{ width: `${percent()}%` }}
        />
      </KMeter.Track>
      <p class="text-xs text-muted-foreground">
        {remaining()}
        {unit()} left
      </p>
    </KMeter>
  )
}
