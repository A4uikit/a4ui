// Hover/focus tooltip on Kobalte's Tooltip primitive. `children` is the trigger.
import { Tooltip as KTooltip } from '@kobalte/core/tooltip'
import type { JSX, ParentProps } from 'solid-js'

import { cn } from '../lib/cn'

interface TooltipProps extends ParentProps {
  content: JSX.Element
  class?: string
}

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
