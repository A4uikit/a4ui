// Click-triggered floating panel on Kobalte's Popover primitive.
import { Popover as KPopover } from '@kobalte/core/popover'
import type { JSX, ParentProps } from 'solid-js'

import { cn } from '../lib/cn'

interface PopoverProps extends ParentProps {
  /** Element that opens the popover on click; wrapped in an inline-flex trigger. */
  trigger: JSX.Element
  class?: string
}

/**
 * Click-triggered floating panel, built on Kobalte's `Popover` primitive
 * (handles positioning, focus, dismiss, and portaling). Use for contextual
 * content anchored to a trigger element, such as a filter panel or menu.
 *
 * @example
 * ```tsx
 * <Popover trigger={<Button>Filters</Button>}>
 *   <p>Panel content</p>
 * </Popover>
 * ```
 */
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
