// A stacked-notifications widget (phone lock-screen style): the newest card is
// full-size on top and older cards peek out behind it, scaled down and offset.
// Presentational + controlled — the parent owns `items` (newest first) and
// removes a card when `onDismiss` fires; the stack re-flows with a CSS transition.
import { For, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { animateIn, motionReduced } from '../lib/motion'

export interface StackNotification {
  id: string | number
  title: string
  description?: string
  icon?: JSX.Element
}

export interface NotificationStackProps {
  /** Newest first. The parent owns this array. */
  items: StackNotification[]
  /** How many cards are visible before the rest collapse behind. @default 3 */
  max?: number
  /** Fired when a card is dismissed; the parent should drop it from `items`. */
  onDismiss?: (id: string | number) => void
  class?: string
}

/**
 * Stacked notifications. Cards behind the front one are offset down and scaled,
 * so they peek from the bottom edge; removing the front card promotes the rest
 * with a smooth transition (skipped under reduced motion). New cards fade/slide
 * in via `animateIn`.
 *
 * @example
 * ```tsx
 * const [items, setItems] = createStore<StackNotification[]>([])
 * <NotificationStack
 *   items={items}
 *   onDismiss={(id) => setItems((xs) => xs.filter((x) => x.id !== id))}
 * />
 * ```
 */
export function NotificationStack(props: NotificationStackProps): JSX.Element {
  const max = () => props.max ?? 3

  return (
    <div
      role="log"
      aria-live="polite"
      class={cn('relative w-full max-w-sm', props.class)}
      // reserve room for the front card plus the peek of those behind it
      style={{ 'min-height': `${88 + (Math.min(props.items.length, max()) - 1) * 10}px` }}
    >
      <For each={props.items}>
        {(item, i) => {
          const hidden = () => i() > max() - 1
          return (
            <div
              ref={(el) => animateIn(el, { y: -8 })}
              class={cn(
                'card absolute inset-x-0 top-0 rounded-xl border border-border bg-card p-3 shadow-lg',
                !motionReduced() && 'transition-[transform,opacity] duration-300 ease-out',
              )}
              style={{
                transform: `translateY(${i() * 10}px) scale(${1 - i() * 0.05})`,
                opacity: hidden() ? 0 : 1 - i() * 0.15,
                'z-index': props.items.length - i(),
                'pointer-events': hidden() ? 'none' : 'auto',
                'transform-origin': 'top center',
              }}
            >
              <div class="flex items-start gap-2.5">
                {item.icon && <span class="mt-0.5 shrink-0 text-primary">{item.icon}</span>}
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-foreground">{item.title}</p>
                  {item.description && (
                    <p class="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={`Dismiss ${item.title}`}
                  onClick={() => props.onDismiss?.(item.id)}
                  class="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <svg
                    viewBox="0 0 24 24"
                    class="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            </div>
          )
        }}
      </For>
    </div>
  )
}
