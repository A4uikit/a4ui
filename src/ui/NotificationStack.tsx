// A stacked-notifications widget (phone lock-screen style): collapsed, the
// newest card is full-size on top and older ones peek out behind it, scaled
// down and offset. Click the stack (or "Show all") to EXPAND it into a full,
// scrollable list; "Show less" collapses it back. Presentational + controlled —
// the parent owns `items` (newest first) and removes a card on `onDismiss`.
import { createSignal, For, Show, type JSX } from 'solid-js'

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
  /** How many cards peek when collapsed. @default 3 */
  max?: number
  /** Fired when a card is dismissed; the parent should drop it from `items`. */
  onDismiss?: (id: string | number) => void
  class?: string
}

/**
 * Stacked notifications. Collapsed, cards behind the front one are offset down
 * and scaled so they peek from the bottom edge; click the stack to expand every
 * notification into a scrollable list, and "Show less" to collapse. Removing the
 * front card promotes the rest; new cards fade/slide in via `animateIn`.
 *
 * @example
 * ```tsx
 * const [items, setItems] = createSignal<StackNotification[]>([])
 * <NotificationStack
 *   items={items()}
 *   onDismiss={(id) => setItems((xs) => xs.filter((x) => x.id !== id))}
 * />
 * ```
 */
export function NotificationStack(props: NotificationStackProps): JSX.Element {
  const max = () => props.max ?? 3
  const [expanded, setExpanded] = createSignal(false)
  const canExpand = () => props.items.length > 1

  return (
    <div role="log" aria-live="polite" class={cn('w-full max-w-sm', props.class)}>
      <div
        class={cn(
          expanded()
            ? 'max-h-[60vh] space-y-2 overflow-y-auto pr-1'
            : cn('relative', canExpand() && 'cursor-pointer'),
        )}
        style={
          expanded()
            ? undefined
            : // reserve room for the front card plus the peek of those behind it
              { 'min-height': `${88 + (Math.min(props.items.length, max()) - 1) * 10}px` }
        }
        onClick={() => {
          if (!expanded() && canExpand()) setExpanded(true)
        }}
      >
        <For each={props.items}>
          {(item, i) => {
            const collapsedHidden = () => !expanded() && i() > max() - 1
            return (
              <div
                ref={(el) => animateIn(el, { y: -8 })}
                class={cn(
                  'card rounded-xl border border-border bg-card p-3 shadow-lg',
                  expanded() ? 'relative' : 'absolute inset-x-0 top-0',
                  !motionReduced() && !expanded() && 'transition-[transform,opacity] duration-300 ease-out',
                )}
                style={
                  expanded()
                    ? undefined
                    : {
                        transform: `translateY(${i() * 10}px) scale(${1 - i() * 0.05})`,
                        opacity: collapsedHidden() ? 0 : 1 - i() * 0.15,
                        'z-index': props.items.length - i(),
                        'pointer-events': collapsedHidden() ? 'none' : 'auto',
                        'transform-origin': 'top center',
                      }
                }
              >
                <div class="flex items-start gap-2.5">
                  {item.icon && <span class="mt-0.5 shrink-0 text-primary">{item.icon}</span>}
                  <div class="min-w-0 flex-1">
                    <p class={cn('text-sm font-medium text-foreground', !expanded() && 'truncate')}>
                      {item.title}
                    </p>
                    {item.description && (
                      <p class="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label={`Dismiss ${item.title}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      props.onDismiss?.(item.id)
                    }}
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

      <Show when={canExpand()}>
        <button
          type="button"
          aria-expanded={expanded()}
          onClick={() => setExpanded((v) => !v)}
          class="mt-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {expanded() ? 'Show less' : `Show all ${props.items.length}`}
        </button>
      </Show>
    </div>
  )
}
