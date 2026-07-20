// Vertical list primitive (plain HTML + Tailwind, no headless dep). Renders a
// semantic <ul> of rows, each with an optional leading avatar, a title +
// optional description column, and an optional trailing meta/actions slot.
import { For, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

/** A single row in a {@link List}. */
export interface ListItem {
  title: string
  description?: string
  avatar?: JSX.Element
  meta?: JSX.Element
  actions?: JSX.Element
}

interface ListProps {
  items: ListItem[]
  /**
   * Cascade the rows in on mount — each row fades/slides up staggered by its
   * index. Pure CSS (`list-row-stagger`), reduced-motion aware. @default false
   */
  stagger?: boolean
  class?: string
}

export type { ListProps }

/**
 * Vertical list of rows inside a rounded, bordered container with divider
 * lines between items. Each item shows an optional leading `avatar`, a
 * `title` with optional `description`, and an optional trailing `meta` /
 * `actions` slot.
 *
 * @example
 * ```tsx
 * <List
 *   items={[
 *     {
 *       title: 'Alfredo Rivera',
 *       description: 'Owner',
 *       avatar: <Avatar name="Alfredo" />,
 *       meta: <span>2h ago</span>,
 *       actions: <Button size="sm">Edit</Button>,
 *     },
 *   ]}
 * />
 * ```
 */
export function List(props: ListProps): JSX.Element {
  return (
    <ul class={cn('divide-y divide-border rounded-lg border border-border', props.class)}>
      <For each={props.items}>
        {(item, i) => (
          <li
            class={cn('flex items-center gap-3 px-4 py-3', props.stagger && 'list-row-stagger')}
            style={props.stagger ? { 'animation-delay': `${i() * 60}ms` } : undefined}
          >
            <Show when={item.avatar}>
              <div class="shrink-0">{item.avatar}</div>
            </Show>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-foreground">{item.title}</p>
              <Show when={item.description}>
                <p class="text-xs text-muted-foreground">{item.description}</p>
              </Show>
            </div>
            <Show when={item.meta}>
              <div class="text-xs text-muted-foreground">{item.meta}</div>
            </Show>
            <Show when={item.actions}>
              <div class="shrink-0">{item.actions}</div>
            </Show>
          </li>
        )}
      </For>
    </ul>
  )
}
