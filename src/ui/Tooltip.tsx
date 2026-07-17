// Hover/focus tooltip on Kobalte's Tooltip primitive. `children` is the trigger.
import { Tooltip as KTooltip } from '@kobalte/core/tooltip'
import type { JSX, ParentProps } from 'solid-js'

import { cn } from '../lib/cn'

interface TooltipProps extends ParentProps {
  /** Content shown inside the tooltip popover. */
  content: JSX.Element
  /** Applied to the tooltip popover (`KTooltip.Content`), not the trigger. */
  class?: string
}

/**
 * Hover/focus tooltip, built on Kobalte's Tooltip primitive. `children` is
 * the trigger element; `content` is rendered in a portal on hover/focus.
 *
 * @example
 * ```tsx
 * <Tooltip content="Delete this item">
 *   <IconButton icon={<TrashIcon />} aria-label="Delete" />
 * </Tooltip>
 * ```
 */
export function Tooltip(props: TooltipProps): JSX.Element {
  return (
    <KTooltip>
      <KTooltip.Trigger class="inline-flex">{props.children}</KTooltip.Trigger>
      <KTooltip.Portal>
        <KTooltip.Content
          class={cn(
            'z-50 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-card-foreground shadow-md',
            props.class,
          )}
        >
          <KTooltip.Arrow />
          {props.content}
        </KTooltip.Content>
      </KTooltip.Portal>
    </KTooltip>
  )
}
