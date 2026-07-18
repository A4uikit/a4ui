// Product summary card: square image with an optional overlay badge, title,
// optional rating, price, and an optional "Add to cart" action.
import type { JSX } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Rating } from '../ui/Rating'
import { PriceTag } from './PriceTag'

export interface ProductCardProps {
  title: string
  price: number
  compareAt?: number
  image: string
  /** Rating from 0-5; renders a readonly {@link Rating} when present. */
  rating?: number
  /** Small overlay label shown over the image top-left, e.g. `'New'`. */
  badge?: string
  currency?: string
  locale?: string
  onAddToCart?: () => void
  class?: string
}

/**
 * Card summarizing a single product: image, title, optional rating, price
 * (with compare-at/discount), and an optional "Add to cart" button.
 *
 * @example
 * ```tsx
 * <ProductCard
 *   title="Wireless Headphones"
 *   price={79.99}
 *   compareAt={99.99}
 *   image="/headphones.jpg"
 *   rating={4}
 *   badge="New"
 *   onAddToCart={() => addToCart(sku)}
 * />
 * ```
 */
export function ProductCard(props: ProductCardProps): JSX.Element {
  return (
    <Card class={cn('overflow-hidden p-4', props.class)}>
      <div class="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <img src={props.image} alt={props.title} loading="lazy" class="h-full w-full object-cover" />
        <Show when={props.badge}>
          <Badge class="absolute left-2 top-2">{props.badge}</Badge>
        </Show>
      </div>
      <div class="mt-3 space-y-2">
        <p class="line-clamp-1 font-medium text-foreground">{props.title}</p>
        <Show when={props.rating !== undefined}>
          <Rating value={props.rating as number} readonly max={5} />
        </Show>
        <PriceTag
          amount={props.price}
          compareAt={props.compareAt}
          currency={props.currency}
          locale={props.locale}
        />
        <Show when={props.onAddToCart}>
          <Button class="w-full" onClick={() => props.onAddToCart?.()}>
            Add to cart
          </Button>
        </Show>
      </div>
    </Card>
  )
}
