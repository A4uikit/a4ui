// Responsive grid wrapper for arranging ProductCards (or any children).
import { children as resolveChildren, For, Show, type JSX, type ParentProps } from 'solid-js'

import { cn } from '../lib/cn'

export interface ProductGridProps extends ParentProps {
  /**
   * Cascade the cells in on mount: each fades/slides up staggered by its index.
   * Pure CSS (`list-row-stagger`), reduced-motion aware. Wraps each child in a
   * `div` only while enabled. @default false
   */
  stagger?: boolean
  class?: string
}

/**
 * Responsive grid wrapper: 2 columns by default, 3 at `sm`, 4 at `lg`.
 * Typically used to lay out a list of {@link ProductCard}s.
 *
 * @example
 * ```tsx
 * <ProductGrid stagger>
 *   <For each={products()}>{(p) => <ProductCard {...p} />}</For>
 * </ProductGrid>
 * ```
 */
export function ProductGrid(props: ProductGridProps): JSX.Element {
  const resolved = resolveChildren(() => props.children)
  return (
    <div class={cn('grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4', props.class)}>
      <Show when={props.stagger} fallback={resolved()}>
        <For each={resolved.toArray()}>
          {(cell, i) => (
            <div class="list-row-stagger h-full" style={{ 'animation-delay': `${i() * 60}ms` }}>
              {cell}
            </div>
          )}
        </For>
      </Show>
    </div>
  )
}
