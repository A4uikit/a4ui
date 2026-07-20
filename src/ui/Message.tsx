// Message — one chat message row, full-width (no bubble). Rich content is
// passed as children so the caller can render markdown, code blocks, lists,
// etc. inside the readable prose block.
import { type JSX, Match, Show, Switch } from 'solid-js'

import { cn } from '../lib/cn'

/** Who sent a {@link Message}; drives its subtle visual treatment. */
export type ChatRole = 'user' | 'assistant' | 'system'

export interface MessageProps {
  role: ChatRole
  children: JSX.Element
  /** Display name shown in the header line. Omitted for `system` messages. */
  author?: string
  /** Small avatar node, e.g. an icon or `<Avatar/>`. Omitted for `system` messages. */
  avatar?: JSX.Element
  /** Preformatted timestamp string, e.g. `'2:45 PM'`. */
  timestamp?: string
  class?: string
}

/**
 * Full-width chat message row with no bubble: an optional avatar/author
 * header line followed by a prose content block. Role is differentiated with
 * subtle, token-based treatment only — `assistant` gets a faint muted panel,
 * `user` stays plain, `system` is a small centered note.
 *
 * @example
 * ```tsx
 * <Message role="assistant" author="Nova" timestamp="2:45 PM">
 *   <p>Here's the summary you asked for.</p>
 * </Message>
 * ```
 */
export function Message(props: MessageProps): JSX.Element {
  return (
    <Switch>
      <Match when={props.role === 'system'}>
        <div class={cn('text-center text-xs text-muted-foreground italic', props.class)}>
          {props.children}
        </div>
      </Match>
      <Match when={true}>
        <div
          class={cn(
            'flex flex-col gap-1',
            props.role === 'assistant' && 'rounded-xl bg-muted/40 p-3',
            props.role === 'user' && 'rounded-xl bg-primary/5 p-3',
            props.class,
          )}
        >
          <Show when={props.author || props.avatar || props.timestamp}>
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
          <div class="space-y-2 text-sm leading-relaxed text-foreground">{props.children}</div>
        </div>
      </Match>
    </Switch>
  )
}
