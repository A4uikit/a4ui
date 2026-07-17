// Static measurement gauge on Kobalte's Meter primitive (e.g. disk usage).
import { Meter as KMeter } from '@kobalte/core/meter'
import type { JSX } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../lib/cn'

interface MeterProps {
  value: number
  max?: number
  label?: string
  class?: string
}

export function Meter(props: MeterProps): JSX.Element {
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
        <KMeter.Fill class="h-full rounded-full bg-primary transition-all" />
      </KMeter.Track>
    </KMeter>
  )
}
