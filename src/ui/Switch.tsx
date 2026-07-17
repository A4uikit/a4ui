// Accessible on/off toggle on Kobalte's Switch primitive.
import { Switch as KSwitch } from '@kobalte/core/switch'
import type { JSX } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../lib/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  class?: string
}

export function Switch(props: SwitchProps): JSX.Element {
  return (
    <KSwitch
      checked={props.checked}
      onChange={props.onChange}
      disabled={props.disabled}
      class={cn('inline-flex items-center gap-2', props.class)}
    >
      <KSwitch.Input />
      <KSwitch.Control class="inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-input px-0.5 transition-colors data-[checked]:bg-primary data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50">
        <KSwitch.Thumb class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform data-[checked]:translate-x-4" />
      </KSwitch.Control>
      <Show when={props.label}>
        <KSwitch.Label class="text-sm text-foreground">{props.label}</KSwitch.Label>
      </Show>
    </KSwitch>
  )
}
