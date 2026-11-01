// FeatureGrid — a heading plus a responsive grid of feature cards (icon, title,
// short text).
import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Card } from './Card'
import { SectionHeading } from './internal/sectionKit'

/** One feature rendered by {@link FeatureGrid}. */
export interface FeatureItem {
  title: string
  text: string
  /** Optional icon node, shown in a tinted tile above the title. */
  icon?: JSX.Element
}

export interface FeatureGridProps {
  title?: string
  subtitle?: string
  items: FeatureItem[]
  /** Columns on wide screens (one column on phones). Defaults to `3`. */
  columns?: 2 | 3 | 4
  /** Anchor id for in-page navigation. */
  id?: string
  class?: string
}

const COLS: Record<2 | 3 | 4, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

/**
 * Section listing a product's features: an optional heading and a responsive
 * grid of glass cards, each with an optional icon, a title and a short text.
 *
 * @example
 * ```tsx
 * <FeatureGrid
 *   title="Why teams switch"
 *   items={[
 *     { title: 'Fast', text: 'Pages load in under a second.' },
 *     { title: 'Accessible', text: 'Keyboard and screen-reader friendly.' },
 *     { title: 'Themeable', text: 'Swap palettes without touching CSS.' },
 *   ]}
 * />
 * ```
 */
export function FeatureGrid(props: FeatureGridProps): JSX.Element {
  return (
    <section
      id={props.id}
      class={cn('mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-20', props.class)}
    >
      <SectionHeading title={props.title} subtitle={props.subtitle} />
      <ul class={cn('grid gap-6', COLS[props.columns ?? 3])}>
        <For each={props.items}>
          {(item) => (
            <li class="flex">
              <Card glass class="flex w-full flex-col gap-3 p-6">
                <Show when={item.icon}>
                  <div class="grid h-11 w-11 place-items-center rounded-lg bg-primary/15 text-primary [&_svg]:h-5 [&_svg]:w-5">
                    {item.icon}
                  </div>
                </Show>
                <h3 class="text-lg font-semibold text-foreground">{item.title}</h3>
                <p class="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </Card>
            </li>
          )}
        </For>
      </ul>
    </section>
  )
}
