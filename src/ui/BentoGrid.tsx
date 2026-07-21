// BentoGrid + BentoCard — responsive grid of glass tiles with variable spans.
import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'

import { cn } from '../lib/cn'

export interface BentoGridProps {
  children: JSX.Element
  class?: string
}

export interface BentoCardProps {
  children: JSX.Element
  /** Number of grid columns to span at `sm`+ (2) and `lg`+ (3). Defaults to 1. */
  colSpan?: 1 | 2 | 3
  /** Number of grid rows to span. Defaults to 1. */
  rowSpan?: 1 | 2
  class?: string
}

// Static lookup so Tailwind's content scanner can see the full class names
// (dynamic `col-span-${n}` strings are invisible to it and get purged).
const COL_SPAN_CLASSES: Record<NonNullable<BentoCardProps['colSpan']>, string> = {
  1: '',
  2: 'sm:col-span-2',
  3: 'sm:col-span-2 lg:col-span-3',
}

const ROW_SPAN_CLASSES: Record<NonNullable<BentoCardProps['rowSpan']>, string> = {
  1: '',
  2: 'row-span-2',
}

/**
 * Responsive CSS grid for bento-style layouts — 1 column on mobile, 2 at
 * `sm`, 3 at `lg`. Compose with {@link BentoCard} tiles, using `colSpan`/
 * `rowSpan` on each tile to create the varied-size bento look.
 *
 * @example
 * ```tsx
 * <BentoGrid>
 *   <BentoCard colSpan={2} rowSpan={2}>
 *     <h3 class="text-lg font-semibold">Overview</h3>
 *   </BentoCard>
 *   <BentoCard>
 *     <h3 class="text-lg font-semibold">Uptime</h3>
 *   </BentoCard>
 *   <BentoCard>
 *     <h3 class="text-lg font-semibold">Latency</h3>
 *   </BentoCard>
 *   <BentoCard colSpan={3}>
 *     <h3 class="text-lg font-semibold">Recent activity</h3>
 *   </BentoCard>
 * </BentoGrid>
 * ```
 */
export function BentoGrid(props: BentoGridProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <div
      class={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(11rem,auto)]',
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </div>
  )
}

/** Glass tile for a {@link BentoGrid}, spanning columns/rows via `colSpan`/`rowSpan`. */
export function BentoCard(props: BentoCardProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'children', 'colSpan', 'rowSpan'])
  return (
    <div
      class={cn(
        'rounded-2xl border border-border bg-card p-5 text-card-foreground overflow-hidden',
        'transition-transform hover:-translate-y-0.5',
        COL_SPAN_CLASSES[local.colSpan ?? 1],
        ROW_SPAN_CLASSES[local.rowSpan ?? 1],
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </div>
  )
}
