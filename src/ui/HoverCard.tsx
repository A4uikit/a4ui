// Hover-triggered floating panel on Kobalte's HoverCard primitive.
import { HoverCard as KHoverCard } from '@kobalte/core/hover-card'
import type { JSX, ParentProps } from 'solid-js'

import { cn } from '../lib/cn'

interface HoverCardProps extends ParentProps {
  trigger: JSX.Element
  class?: string
}

export function HoverCard(props: HoverCardProps): JSX.Element {
  return (
    <KHoverCard>
      <KHoverCard.Trigger class="inline-flex">{props.trigger}</KHoverCard.Trigger>
      <KHoverCard.Portal>
        <KHoverCard.Content
          class={cn(
            'bg-glass z-50 rounded-lg border border-border p-4 text-card-foreground shadow-lg',
            props.class,
          )}
        >
          <KHoverCard.Arrow />
          {props.children}
        </KHoverCard.Content>
      </KHoverCard.Portal>
    </KHoverCard>
  )
}
