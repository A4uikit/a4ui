// Hover-triggered floating panel on Kobalte's HoverCard primitive.
import { HoverCard as KHoverCard } from '@kobalte/core/hover-card'
import type { JSX, ParentProps } from 'solid-js'

import { cn } from '../lib/cn'

interface HoverCardProps extends ParentProps {
  /** Content that opens the card on hover/focus. */
  trigger: JSX.Element
  class?: string
}

/**
 * Floating panel that appears on hover (or focus) of a trigger element, built on
 * Kobalte's `HoverCard` primitive. Good for previews/tooltips with richer content
 * than a plain `title` attribute — e.g. a user avatar preview card.
 *
 * @example
 * ```tsx
 * <HoverCard trigger={<Avatar src={user.avatar} />}>
 *   <p>{user.name}</p>
 * </HoverCard>
 * ```
 */
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
