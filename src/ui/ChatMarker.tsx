// ChatMarker — an inline system note inside a conversation ("Nova joined",
// "Yesterday", "Conversation archived").
import { Show, type JSX, type ParentProps } from 'solid-js'

import { cn } from '../lib/cn'

export type ChatMarkerVariant = 'default' | 'border' | 'separator'

interface ChatMarkerProps extends ParentProps {
  /** `default`: muted text. `border`: bordered pill. `separator`: text between two lines. @default 'default' */
  variant?: ChatMarkerVariant
  /** Optional leading icon; decorative (`aria-hidden`). */
  icon?: JSX.Element
  class?: string
}

export type { ChatMarkerProps }

/**
 * Inline system note in a thread, e.g. a date divider or a status change.
 *
 * @example
 * ```tsx
 * <ChatMarker variant="separator">Yesterday</ChatMarker>
 * <ChatMarker variant="border" icon={<UserPlus />}>Nova joined</ChatMarker>
 * ```
 */
export function ChatMarker(props: ChatMarkerProps): JSX.Element {
  const variant = (): ChatMarkerVariant => props.variant ?? 'default'
  const label = (): JSX.Element => (
    <span
      class={cn(
        'inline-flex items-center gap-1.5 text-xs text-muted-foreground [&>span>svg]:h-3.5 [&>span>svg]:w-3.5',
        variant() === 'border' && 'rounded-full border border-border bg-muted/40 px-3 py-1',
      )}
    >
      <Show when={props.icon}>
        <span aria-hidden="true" class="inline-flex">
          {props.icon}
        </span>
      </Show>
      {props.children}
    </span>
  )
  return (
    <div
      data-slot="chat-marker"
      data-variant={variant()}
      class={cn('flex w-full items-center justify-center gap-3 py-1', props.class)}
    >
      <Show when={variant() === 'separator'} fallback={label()}>
        <span aria-hidden="true" class="h-px flex-1 bg-border" />
        {label()}
        <span aria-hidden="true" class="h-px flex-1 bg-border" />
      </Show>
    </div>
  )
}
