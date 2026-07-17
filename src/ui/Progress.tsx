// Determinate progress bar on Kobalte's Progress primitive.
import { Progress as KProgress } from '@kobalte/core/progress'
import type { JSX } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../lib/cn'

interface ProgressProps {
  value: number
  max?: number
  label?: string
  class?: string
}

export function Progress(props: ProgressProps): JSX.Element {
  return (
    <KProgress
      value={props.value}
      minValue={0}
      maxValue={props.max ?? 100}
      class={cn('flex flex-col gap-1.5', props.class)}
    >
      <Show when={props.label}>
        <div class="flex items-center justify-between text-sm text-foreground">
          <KProgress.Label>{props.label}</KProgress.Label>
          <KProgress.ValueLabel class="text-muted-foreground" />
        </div>
      </Show>
      <KProgress.Track class="h-2 overflow-hidden rounded-full bg-muted">
        <KProgress.Fill class="h-full rounded-full bg-primary transition-all" />
      </KProgress.Track>
    </KProgress>
  )
}
