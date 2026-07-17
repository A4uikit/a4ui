// Single-value range slider on Kobalte's Slider primitive. Kobalte works in
// arrays (multi-thumb); we wrap/unwrap the single value for a simpler API.
import { Slider as KSlider } from '@kobalte/core/slider'
import type { JSX } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../lib/cn'

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  class?: string
}

export function Slider(props: SliderProps): JSX.Element {
  return (
    <KSlider
      value={[props.value]}
      onChange={(v) => props.onChange(v[0])}
      minValue={props.min ?? 0}
      maxValue={props.max ?? 100}
      step={props.step ?? 1}
      class={cn('flex flex-col gap-2', props.class)}
    >
      <Show when={props.label}>
        <div class="flex items-center justify-between text-sm text-foreground">
          <KSlider.Label>{props.label}</KSlider.Label>
          <KSlider.ValueLabel class="text-muted-foreground" />
        </div>
      </Show>
      <KSlider.Track class="relative h-1.5 w-full rounded-full bg-muted">
        <KSlider.Fill class="absolute h-full rounded-full bg-primary" />
        <KSlider.Thumb class="-top-1.5 block h-4 w-4 rounded-full bg-primary outline-none focus:ring-2 focus:ring-ring/40">
          <KSlider.Input />
        </KSlider.Thumb>
      </KSlider.Track>
    </KSlider>
  )
}
