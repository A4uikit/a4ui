import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'
import { cn } from '../lib/cn'

export interface SpecRow {
  label: string
  value: JSX.Element | string
}

export interface SpecGroup {
  title?: string
  rows: SpecRow[]
}

export interface SpecSheetProps {
  groups: SpecGroup[]
  /** 1 or 2 columns of rows per group on wider screens. Defaults to 1. */
  columns?: 1 | 2
  class?: string
}

/**
 * A grouped key/value specification table, for product specs, tech sheets,
 * or any other structured attribute list. Rows are label/value pairs with a
 * subtle divider; groups can carry an optional uppercase title and rows can
 * flow in one or two columns on wider screens. Designed to sit inside a
 * `Card` with a clean, glassy-neutral look.
 *
 * @example
 * ```tsx
 * <SpecSheet
 *   columns={2}
 *   groups={[
 *     {
 *       title: 'Display',
 *       rows: [
 *         { label: 'Panel', value: 'AMOLED, 6.4"' },
 *         { label: 'Resolution', value: '2340 x 1080' },
 *         { label: 'Refresh rate', value: '120 Hz' },
 *       ],
 *     },
 *     {
 *       title: 'Battery',
 *       rows: [
 *         { label: 'Capacity', value: '4500 mAh' },
 *         { label: 'Charging', value: '65 W wired' },
 *       ],
 *     },
 *   ]}
 * />
 * ```
 */
export function SpecSheet(props: SpecSheetProps): JSX.Element {
  return (
    <div class={cn('flex flex-col gap-6', props.class)}>
      <For each={props.groups}>
        {(group) => (
          <div class="flex flex-col gap-2">
            <Show when={group.title}>
              <div class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {group.title}
              </div>
            </Show>
            <dl
              class={cn(
                'divide-y divide-border/60',
                props.columns === 2 && 'grid grid-cols-1 gap-x-8 sm:grid-cols-2 sm:divide-y-0',
              )}
            >
              <For each={group.rows}>
                {(row) => (
                  <div
                    class={cn(
                      'flex items-baseline justify-between gap-4 py-2 text-sm',
                      props.columns === 2 && 'border-b border-border/60 sm:border-b',
                    )}
                  >
                    <dt class="text-muted-foreground">{row.label}</dt>
                    <dd class="text-right font-medium text-foreground">{row.value}</dd>
                  </div>
                )}
              </For>
            </dl>
          </div>
        )}
      </For>
    </div>
  )
}
