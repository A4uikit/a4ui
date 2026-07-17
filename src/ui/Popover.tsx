// Click-triggered floating panel on Kobalte's Popover primitive.
import { Popover as KPopover } from '@kobalte/core/popover'
import type { JSX, ParentProps } from 'solid-js'

import { cn } from '../lib/cn'

interface PopoverProps extends ParentProps {
  trigger: JSX.Element
  class?: string
}

export function Popover(props: PopoverProps): JSX.Element {
  return (
    <KPopover>
      <KPopover.Trigger class="inline-flex">{props.trigger}</KPopover.Trigger>
      <KPopover.Portal>
        <KPopover.Content
          class={cn(
            'bg-glass z-50 rounded-lg border border-border p-4 text-card-foreground shadow-lg',
            props.class,
          )}
        >
          <KPopover.Arrow />
          {props.children}
        </KPopover.Content>
      </KPopover.Portal>
    </KPopover>
  )
}
