// Horizontal bottom navigation bar of equal-width icon + label items,
// rendered inline where placed so the consumer controls positioning.
import type { JSX } from 'solid-js'
import { For } from 'solid-js'

import { cn } from '../lib/cn'

/** A single destination within a {@link BottomNavigation}. */
export interface BottomNavItem {
  value: string
  label: string
  icon: JSX.Element
}

export interface BottomNavigationProps {
  items: BottomNavItem[]
  value: string
  onChange: (value: string) => void
  class?: string
}

/**
 * Horizontal bar of equal-width navigation items, each stacking an icon above
 * a short label. The active item (matching `value`) is highlighted and marked
 * with `aria-current="page"`. Renders inline where placed — the consumer is
 * responsible for positioning (e.g. `fixed inset-x-0 bottom-0`).
 *
 * @example
 * ```tsx
 * <BottomNavigation
 *   value={tab()}
 *   onChange={setTab}
 *   items={[
 *     { value: 'home', label: 'Home', icon: <HomeIcon /> },
 *     { value: 'search', label: 'Search', icon: <SearchIcon /> },
 *     { value: 'profile', label: 'Profile', icon: <UserIcon /> },
 *   ]}
 * />
 * ```
 */
export function BottomNavigation(props: BottomNavigationProps): JSX.Element {
  return (
    <nav class={cn('flex items-stretch border-t border-border bg-glass', props.class)}>
      <For each={props.items}>
        {(item) => {
          const active = () => item.value === props.value
          return (
            <button
              type="button"
              aria-current={active() ? 'page' : undefined}
              onClick={() => props.onChange(item.value)}
              class={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] transition-colors',
                active() ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          )
        }}
      </For>
    </nav>
  )
}
