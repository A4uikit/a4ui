// Vertical navigation rail — the vertical alternative to BottomNavigation / a
// compact sidebar. Icon-first, optional labels under each icon; when labels
// are hidden, the icon is wrapped in a Tooltip instead.
import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Tooltip } from './Tooltip'

/** A single destination within a {@link SideRail}. */
export interface SideRailItem {
  value: string
  label: string
  icon?: JSX.Element
  /** Optional badge (e.g. an unread count) rendered on the item. */
  badge?: JSX.Element
}

export interface SideRailProps {
  items: SideRailItem[]
  value: string
  onChange: (value: string) => void
  /** Show text labels under icons. When false, labels go in a tooltip. @default true */
  labels?: boolean
  class?: string
}

/**
 * Narrow vertical column of stacked icon+label destinations — the vertical
 * counterpart to {@link BottomNavigation} for side placement. The active item
 * is highlighted with a left indicator bar and `aria-selected`. ArrowUp/
 * ArrowDown move the selection between items (roving activation, matching the
 * WAI-ARIA tabs pattern). Renders inline where placed — the consumer is
 * responsible for positioning (e.g. `fixed inset-y-0 left-0`).
 *
 * @example
 * ```tsx
 * <SideRail
 *   value={section()}
 *   onChange={setSection}
 *   items={[
 *     { value: 'home', label: 'Home', icon: <HomeIcon /> },
 *     { value: 'inbox', label: 'Inbox', icon: <InboxIcon />, badge: <Badge tone="info">3</Badge> },
 *     { value: 'settings', label: 'Settings', icon: <SettingsIcon /> },
 *   ]}
 * />
 * ```
 */
export function SideRail(props: SideRailProps): JSX.Element {
  const showLabels = () => props.labels ?? true

  const move = (delta: 1 | -1, currentIndex: number) => {
    const count = props.items.length
    const nextIndex = (currentIndex + delta + count) % count
    const next = props.items[nextIndex]
    if (next) props.onChange(next.value)
  }

  return (
    <div
      role="tablist"
      aria-orientation="vertical"
      class={cn('flex w-20 flex-col items-stretch gap-1 border-r border-border bg-glass py-2', props.class)}
    >
      <For each={props.items}>
        {(item, index) => {
          const active = () => item.value === props.value

          const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              move(1, index())
            } else if (event.key === 'ArrowUp') {
              event.preventDefault()
              move(-1, index())
            }
          }

          const button = (
            <button
              type="button"
              role="tab"
              aria-selected={active()}
              tabIndex={active() ? 0 : -1}
              onClick={() => props.onChange(item.value)}
              onKeyDown={onKeyDown}
              class={cn(
                'relative flex flex-col items-center gap-1 px-2 py-2.5 text-[11px] transition-colors',
                active() ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span
                aria-hidden="true"
                class={cn(
                  'absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary transition-opacity',
                  active() ? 'opacity-100' : 'opacity-0',
                )}
              />
              <span class="relative inline-flex">
                {item.icon}
                <Show when={item.badge}>
                  <span class="absolute -right-2 -top-2">{item.badge}</span>
                </Show>
              </span>
              <Show when={showLabels()}>
                <span class="truncate">{item.label}</span>
              </Show>
            </button>
          )

          return (
            <Show when={showLabels()} fallback={<Tooltip content={item.label}>{button}</Tooltip>}>
              {button}
            </Show>
          )
        }}
      </For>
    </div>
  )
}
