// Single-choice segmented control on Kobalte's SegmentedControl primitive,
// with an animated indicator sliding under the selected item.
import { SegmentedControl as KSegmentedControl } from '@kobalte/core/segmented-control'
import type { JSX } from 'solid-js'
import { For } from 'solid-js'

import { cn } from '../lib/cn'

export interface SegmentedOption {
  value: string
  label: string
}

interface SegmentedControlProps {
  value: string
  onChange: (value: string) => void
  options: SegmentedOption[]
  class?: string
}

export function SegmentedControl(props: SegmentedControlProps): JSX.Element {
  return (
    <KSegmentedControl
      value={props.value}
      onChange={props.onChange}
      class={cn('relative inline-flex rounded-md border border-border bg-card p-1', props.class)}
    >
      <KSegmentedControl.Indicator class="absolute rounded-sm bg-primary shadow-sm transition-all" />
      <For each={props.options}>
        {(option) => (
          <KSegmentedControl.Item
            value={option.value}
            class="relative z-10 flex cursor-pointer items-center px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors data-[selected]:text-primary-foreground"
          >
            <KSegmentedControl.ItemInput />
            <KSegmentedControl.ItemLabel>{option.label}</KSegmentedControl.ItemLabel>
          </KSegmentedControl.Item>
        )}
      </For>
    </KSegmentedControl>
  )
}
