// Responsive grid wrapper for arranging ProductCards (or any children).
import type { JSX, ParentProps } from 'solid-js'

import { cn } from '../lib/cn'

export interface ProductGridProps extends ParentProps {
  class?: string
}

/**
 * Responsive grid wrapper: 2 columns by default, 3 at `sm`, 4 at `lg`.
 * Typically used to lay out a list of {@link ProductCard}s.
 *
 * @example
 * ```tsx
 * <ProductGrid>
 *   <For each={products()}>{(p) => <ProductCard {...p} />}</For>
 * </ProductGrid>
 * ```
 */
export function ProductGrid(props: ProductGridProps): JSX.Element {
  return (
    <div class={cn('grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4', props.class)}>
      {props.children}
    </div>
  )
}
