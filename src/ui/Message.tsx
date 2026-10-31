// Message — one chat message row. By default full-width with no bubble; pass
// `variant` for a bubble style and `align` to push it to one side. Rich content
// is passed as children so the caller can render markdown, code blocks, lists,
// etc. inside the readable prose block.
import { createContext, type JSX, Match, Show, Switch, useContext } from 'solid-js'

import { cn } from '../lib/cn'

/** Who sent a {@link Message}; drives its subtle visual treatment. */
export type ChatRole = 'user' | 'assistant' | 'system'

/** Bubble style of a {@link Message}. */
export type MessageVariant =
  'default' | 'secondary' | 'muted' | 'tinted' | 'outline' | 'ghost' | 'destructive'

/** Which side of the thread a message sits on. */
export type MessageAlign = 'start' | 'end'

export interface MessageProps {
  role: ChatRole
  children: JSX.Element
  /** Display name shown in the header line. Omitted for `system` messages. */
  author?: string
  /** Small avatar node, e.g. an icon or `<Avatar/>`. Omitted for `system` messages. */
  avatar?: JSX.Element
  /** Preformatted timestamp string, e.g. `'2:45 PM'`. */
  timestamp?: string
  /** Stable id, rendered as `data-message-id` so `ChatThread.scrollToMessage` can find it. */
  id?: string
  /**
   * Bubble style. When omitted the legacy role-based treatment applies
   * (`assistant` faint panel, `user` faint tint).
   */
  variant?: MessageVariant
  /** Push the message to one side and shrink it to its content (max 85% wide). */
  align?: MessageAlign
  /** Slot under the content, e.g. a row of reaction chips. */
  reactions?: JSX.Element
  /** Slot under the content for `Attachment`s (wrap several in `AttachmentGroup`). */
  attachments?: JSX.Element
  class?: string
}

const VARIANT: Record<MessageVariant, string> = {
  default: 'border border-border bg-card text-card-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  muted: 'bg-muted/60 text-foreground',
  tinted: 'border border-primary/20 bg-primary/10 text-foreground',
  outline: 'border border-border bg-transparent text-foreground',
  ghost: 'bg-transparent text-foreground',
  destructive: 'border border-destructive/30 bg-destructive/10 text-destructive',
}

interface MessageGroupContext {
  align?: MessageAlign
  variant?: MessageVariant
}

const GroupContext = createContext<MessageGroupContext>()

/**
 * One chat message: an optional avatar/author header followed by a prose
 * content block, with optional `reactions` and `attachments` slots. Role is
 * differentiated with subtle, token-based treatment — or choose a bubble
 * `variant` and an `align` side. Inside a {@link MessageGroup} the header is
 * suppressed (the group shows the sender once).
 *
 * @example
 * ```tsx
 * <Message role="assistant" author="Nova" timestamp="2:45 PM" variant="secondary" align="start">
 *   <p>Here's the summary you asked for.</p>
 * </Message>
 * ```
 */
export function Message(props: MessageProps): JSX.Element {
  const group = useContext(GroupContext)
  const variant = (): MessageVariant | undefined => props.variant ?? group?.variant
  const align = (): MessageAlign | undefined => props.align ?? group?.align
  return (
    <Switch>
      <Match when={props.role === 'system'}>
        <div
          data-message-id={props.id}
          class={cn('text-center text-xs text-muted-foreground italic', props.class)}
        >
          {props.children}
        </div>
      </Match>
      <Match when={true}>
        <div
          data-message-id={props.id}
          data-variant={variant()}
          data-align={align()}
          class={cn(
            'flex flex-col gap-1',
            variant() ? 'rounded-2xl px-3.5 py-2.5' : 'rounded-xl',
            variant() ? VARIANT[variant()!] : 'text-foreground',
            !variant() && props.role === 'assistant' && 'bg-muted/40 p-3',
            !variant() && props.role === 'user' && 'bg-primary/5 p-3',
            align() && 'w-fit max-w-[85%]',
            align() === 'end' && 'self-end',
            align() === 'start' && 'self-start',
            props.class,
          )}
        >
          <Show when={!group && (props.author || props.avatar || props.timestamp)}>
            <div class="flex items-center gap-2">
              {props.avatar}
              <Show when={props.author}>
                <span class="text-sm font-medium text-foreground">{props.author}</span>
              </Show>
              <Show when={props.timestamp}>
                <span class="text-xs text-muted-foreground">{props.timestamp}</span>
              </Show>
            </div>
          </Show>
          <div class="space-y-2 text-sm leading-relaxed">{props.children}</div>
          <Show when={props.attachments}>
            <div data-slot="message-attachments" class="mt-1 max-w-full">
              {props.attachments}
            </div>
          </Show>
          <Show when={props.reactions}>
            <div data-slot="message-reactions" class="mt-1 flex flex-wrap items-center gap-1">
              {props.reactions}
            </div>
          </Show>
        </div>
      </Match>
    </Switch>
  )
}

export interface MessageGroupProps {
  /** Sender name, shown once above the group. */
  author?: string
  /** Sender avatar, shown once next to the name. */
  avatar?: JSX.Element
  /** Timestamp of the first message, shown once. */
  timestamp?: string
  /** Side for every message in the group (a message can still override it). */
  align?: MessageAlign
  /** Bubble style for every message in the group (a message can still override it). */
  variant?: MessageVariant
  /** The consecutive `Message`s from this sender. */
  children: JSX.Element
  class?: string
}

/**
 * Visually groups consecutive messages from one sender: avatar, name and time
 * appear once, and the bubbles sit closer together than separate messages.
 *
 * @example
 * ```tsx
 * <MessageGroup author="Nova" avatar={<Avatar name="Nova" size="sm" />} variant="secondary" align="start">
 *   <Message role="assistant">First thought.</Message>
 *   <Message role="assistant">And a follow-up.</Message>
 * </MessageGroup>
 * ```
 */
export function MessageGroup(props: MessageGroupProps): JSX.Element {
  return (
    <GroupContext.Provider
      value={{
        get align() {
          return props.align
        },
        get variant() {
          return props.variant
        },
      }}
    >
      <div
        role="group"
        aria-label={props.author ? `Messages from ${props.author}` : undefined}
        data-slot="message-group"
        class={cn('flex flex-col gap-1', props.class)}
      >
        <Show when={props.author || props.avatar || props.timestamp}>
          <div class={cn('flex items-center gap-2', props.align === 'end' && 'flex-row-reverse')}>
            {props.avatar}
            <Show when={props.author}>
              <span class="text-sm font-medium text-foreground">{props.author}</span>
            </Show>
            <Show when={props.timestamp}>
              <span class="text-xs text-muted-foreground">{props.timestamp}</span>
            </Show>
          </div>
        </Show>
        {props.children}
      </div>
    </GroupContext.Provider>
  )
}
