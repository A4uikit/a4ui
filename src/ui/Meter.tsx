// Static measurement gauge on Kobalte's Meter primitive (e.g. disk usage).
import { Meter as KMeter } from '@kobalte/core/meter'
import type { JSX } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../lib/cn'

interface MeterProps {
  value: number
  /** @default 100 */
  max?: number
  /** Label shown above the track, paired with an auto-formatted value label. */
  label?: string
  class?: string
}

/**
 * Static measurement gauge (e.g. disk/quota usage) on Kobalte's `Meter` primitive.
 * Unlike a progress bar, a meter represents a fixed measurement against a range,
 * not an in-flight operation.
 *
 * @example
 * ```tsx
 * <Meter value={72} max={100} label="Storage used" />
 * ```
 */
export function Meter(props: MeterProps): JSX.Element {
  // Kobalte's Meter.Fill has no intrinsic width — we set it ourselves from the
  // value as a fraction of the range, clamped to 0–100%. (Without this the bar
  // ignored `max`, so e.g. value 38 of max 50 read "76%" but filled only ~38%.)
  const percent = () => {
    const max = props.max ?? 100
    if (max <= 0) return 0
    return Math.max(0, Math.min(100, (props.value / max) * 100))
  }
  return (
    <KMeter
      value={props.value}
      minValue={0}
      maxValue={props.max ?? 100}
      class={cn('flex flex-col gap-1.5', props.class)}
    >
      <Show when={props.label}>
        <div class="flex items-center justify-between text-sm text-foreground">
          <KMeter.Label>{props.label}</KMeter.Label>
          <KMeter.ValueLabel class="text-muted-foreground" />
        </div>
      </Show>
      <KMeter.Track class="h-2 overflow-hidden rounded-full bg-muted">
        <KMeter.Fill
          class="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percent()}%` }}
        />
      </KMeter.Track>
    </KMeter>
  )
}
