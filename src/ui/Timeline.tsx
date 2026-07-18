// Vertical timeline: a continuous line with a tone-colored dot per event, plus
// title / optional time / optional description. Semantic <ol>/<li>, theme-agnostic
// tokens only (with fixed semantic accents like Badge/Stat use for success).
import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { cn } from '../lib/cn'

/** Accent applied to a {@link TimelineItem}'s dot on the line. */
export type TimelineTone = 'default' | 'primary' | 'success' | 'danger'

const DOT_CLASSES: Record<TimelineTone, string> = {
  default: 'bg-muted border border-border',
  primary: 'bg-primary',
  success: 'bg-emerald-500',
  danger: 'bg-destructive',
}

/** A single event rendered by {@link Timeline}. */
export interface TimelineItem {
  /** Headline for the event (rendered emphasized). */
  title: string
  /** Optional supporting copy shown under the title. */
  description?: string
  /** Optional timestamp / relative time label. */
  time?: string
  /** Accent for the dot on the line. Defaults to `'default'`. */
  tone?: TimelineTone
}

export interface TimelineProps {
  items: TimelineItem[]
  class?: string
}

/**
 * Vertical timeline of events. A continuous line runs down the left with a
 * tone-colored dot marking each entry; to the right sit the title, an optional
 * right-aligned time, and an optional description. The line segment stops at the
 * last item's dot. Renders as a semantic `<ol>`/`<li>` list.
 *
 * @example
 * ```tsx
 * <Timeline
 *   items={[
 *     { title: 'Order placed', time: '09:24', tone: 'primary' },
 *     { title: 'Shipped', description: 'Left the warehouse.', time: '11:02', tone: 'success' },
 *     { title: 'Delayed', description: 'Weather hold.', time: '14:30', tone: 'danger' },
 *   ]}
 * />
 * ```
 */
export function Timeline(props: TimelineProps): JSX.Element {
  return (
    <ol class={cn('relative flex flex-col gap-6', props.class)}>
      <For each={props.items}>
        {(item, index) => (
          <li class="relative flex gap-4 pl-2">
            {/* Line segment: hidden on the last item so it doesn't extend past the dot. */}
            <Show when={index() < props.items.length - 1}>
              <span
                aria-hidden="true"
                class="absolute left-[calc(0.5rem+0.375rem)] top-3 -bottom-6 w-px -translate-x-1/2 bg-border"
              />
            </Show>
            <span
              aria-hidden="true"
              class={cn(
                'relative z-[1] mt-1 h-3 w-3 shrink-0 rounded-full',
                DOT_CLASSES[item.tone ?? 'default'],
              )}
            />
            <div class="min-w-0 flex-1">
              <div class="flex items-baseline justify-between gap-3">
                <p class="font-medium text-foreground">{item.title}</p>
                <Show when={item.time}>
                  <span class="shrink-0 text-xs text-muted-foreground">{item.time}</span>
                </Show>
              </div>
              <Show when={item.description}>
                <p class="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </Show>
            </div>
          </li>
        )}
      </For>
    </ol>
  )
}
