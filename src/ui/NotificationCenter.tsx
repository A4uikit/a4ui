// Bell-triggered notification panel built on A4ui's Popover primitive.
import { Bell, X } from 'lucide-solid'
import { For, type JSX, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Popover } from './Popover'

/** A single entry rendered by {@link NotificationCenter}. */
export interface NotificationItem {
  id: string
  title: string
  description?: string
  time?: string
  read?: boolean
}

export interface NotificationCenterProps {
  /** Notifications to display, newest first. */
  items: NotificationItem[]
  /** Called with an item's id when its dismiss button is clicked. */
  onDismiss?: (id: string) => void
  /** Called when the "Mark all read" action is clicked. */
  onMarkAllRead?: () => void
  class?: string
}

/**
 * Bell button that opens a popover listing notifications, with an unread count
 * badge, per-item dismiss, and a "mark all read" action. Built on {@link Popover}.
 *
 * @example
 * ```tsx
 * <NotificationCenter
 *   items={items}
 *   onDismiss={(id) => remove(id)}
 *   onMarkAllRead={() => markAll()}
 * />
 * ```
 */
export function NotificationCenter(props: NotificationCenterProps): JSX.Element {
  const unread = () => props.items.filter((item) => !item.read).length

  const trigger = (
    <span class={cn('relative inline-grid place-items-center rounded-md p-2 text-foreground', props.class)}>
      <Bell class="h-5 w-5" />
      <Show when={unread() > 0}>
        <span class="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
          {unread()}
        </span>
      </Show>
    </span>
  )

  return (
    <Popover trigger={trigger} class="w-80 p-0">
      <div class="flex items-center justify-between border-b border-border px-4 py-3">
        <span class="text-sm font-semibold text-foreground">Notifications</span>
        <button
          type="button"
          class="text-xs font-medium text-primary hover:underline"
          onClick={() => props.onMarkAllRead?.()}
        >
          Mark all read
        </button>
      </div>
      <Show
        when={props.items.length > 0}
        fallback={<p class="px-4 py-8 text-center text-sm text-muted-foreground">You're all caught up</p>}
      >
        <ul class="max-h-96 divide-y divide-border overflow-y-auto">
          <For each={props.items}>
            {(item) => (
              <li class="flex items-start gap-2 px-4 py-3">
                <div class="min-w-0 flex-1">
                  <p class="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Show when={!item.read}>
                      <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    </Show>
                    <span class="truncate">{item.title}</span>
                  </p>
                  <Show when={item.description}>
                    <p class="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                  </Show>
                  <Show when={item.time}>
                    <p class="mt-1 text-[11px] text-muted-foreground">{item.time}</p>
                  </Show>
                </div>
                <button
                  type="button"
                  aria-label="Dismiss"
                  class="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => props.onDismiss?.(item.id)}
                >
                  <X class="h-4 w-4" />
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </Popover>
  )
}
