// Semantic key/value detail list — a <dl> laid out as a responsive grid. For
// showing an entity's attributes (a "properties" / "details" panel). Values are
// JSX so they can carry badges, links, or formatted content; all colors come
// from semantic theme tokens so it stays theme-agnostic.
import { For, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

/** A single label/value row in a {@link Descriptions} list. */
export interface DescriptionItem {
  label: string
  value: JSX.Element
}

export interface DescriptionsProps {
  items: DescriptionItem[]
  /** Number of columns on `sm`+ screens (1, 2, or 3). Default: 1. */
  columns?: number
  class?: string
}

const COLUMN_CLASSES: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
}

/**
 * Renders a set of label/value pairs as a semantic `<dl>` in a responsive grid.
 * Use `columns` to fan the pairs out into 2 or 3 columns on wider screens.
 *
 * @example
 * ```tsx
 * <Descriptions
 *   columns={2}
 *   items={[
 *     { label: 'Status', value: <Badge tone="success">Active</Badge> },
 *     { label: 'Owner', value: 'Ada Lovelace' },
 *   ]}
 * />
 * ```
 */
export function Descriptions(props: DescriptionsProps): JSX.Element {
  return (
    <dl class={cn('grid gap-x-6', COLUMN_CLASSES[props.columns ?? 1] ?? COLUMN_CLASSES[1], props.class)}>
      <For each={props.items}>
        {(item) => (
          <div class="border-b border-border py-2">
            <dt class="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</dt>
            <dd class="mt-0.5 text-sm text-foreground">{item.value}</dd>
          </div>
        )}
      </For>
    </dl>
  )
}
