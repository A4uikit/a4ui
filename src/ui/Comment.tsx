// Threaded comment layout — an avatar, header/content/actions, and recursive replies.
import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { Avatar } from './Avatar'

/** A single comment node, optionally carrying its own nested `replies`. */
export interface CommentData {
  /** Unique identifier for the comment. */
  id: string
  /** Display name of the comment's author. */
  author: string
  /** Author avatar image URL; falls back to the author's initials. */
  avatar?: string
  /** Human-readable timestamp shown next to the author. */
  time?: string
  /** The comment body. */
  content: JSX.Element
  /** Nested replies, rendered recursively below the comment. */
  replies?: CommentData[]
}

export interface CommentProps {
  comment: CommentData
  /** Renders an actions row (e.g. reply/like) for a given comment. */
  actions?: (comment: CommentData) => JSX.Element
  class?: string
}

/** Derives up-to-two-letter initials from an author name. */
function initials(author: string): string {
  return author
    .trim()
    .split(/\s+/)
    .map((word) => word[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/**
 * Threaded comment layout: a left-aligned {@link Avatar} beside the author,
 * timestamp, content, and an optional actions row. Any `replies` are rendered
 * recursively in a left-indented, bordered thread, inheriting the same `actions`.
 *
 * @example
 * ```tsx
 * <Comment
 *   comment={{
 *     id: '1',
 *     author: 'Jane Doe',
 *     time: '2h ago',
 *     content: <p>Great work on this!</p>,
 *     replies: [{ id: '2', author: 'John Smith', content: <p>Agreed.</p> }],
 *   }}
 *   actions={(c) => <button>Reply to {c.author}</button>}
 * />
 * ```
 */
export function Comment(props: CommentProps): JSX.Element {
  return (
    <div class={props.class}>
      <div class="flex gap-3">
        <Avatar
          src={props.comment.avatar}
          alt={props.comment.author}
          fallback={initials(props.comment.author)}
        />
        <div class="flex-1">
          <div class="flex items-baseline gap-2">
            <span class="text-sm font-medium text-foreground">{props.comment.author}</span>
            <Show when={props.comment.time}>
              <span class="text-xs text-muted-foreground">{props.comment.time}</span>
            </Show>
          </div>
          <div class="mt-1 text-sm text-foreground">{props.comment.content}</div>
          <Show when={props.actions}>
            <div class="mt-2 flex gap-3 text-xs text-muted-foreground">{props.actions?.(props.comment)}</div>
          </Show>
        </div>
      </div>
      <Show when={props.comment.replies?.length}>
        <div class="mt-4 space-y-4 border-l border-border pl-4">
          <For each={props.comment.replies}>
            {(reply) => <Comment comment={reply} actions={props.actions} />}
          </For>
        </div>
      </Show>
    </div>
  )
}
