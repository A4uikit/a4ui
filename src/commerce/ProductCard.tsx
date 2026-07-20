// Product summary card: square image with a corner ribbon (Sale/New/…), brand
// eyebrow, title, category tag, optional rating, price, and an "Add to cart"
// action. Frosted glass surface with the cursor-following edge glow.
import type { JSX } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Rating } from '../ui/Rating'
import { PriceTag } from './PriceTag'

/** Corner-ribbon colour intent. */
export type ProductBadgeTone = 'sale' | 'new' | 'featured'

const RIBBON_TONE: Record<ProductBadgeTone, string> = {
  sale: 'bg-destructive text-destructive-foreground',
  new: 'bg-primary text-primary-foreground',
  featured: 'bg-accent text-accent-foreground',
}

export interface ProductCardProps {
  title: string
  price: number
  compareAt?: number
  image: string
  /** Brand name — shown as a small eyebrow above the title. */
  brand?: string
  /** Category — shown as a small tag under the title. */
  category?: string
  /** Rating from 0-5; renders a readonly {@link Rating} when present. */
  rating?: number
  /** Corner-ribbon label over the image top-right corner, e.g. `'Sale'`, `'New'`. */
  badge?: string
  /** Ribbon colour. Inferred from `badge` text when omitted (sale/new → featured). */
  badgeTone?: ProductBadgeTone
  currency?: string
  locale?: string
  onAddToCart?: () => void
  /**
   * 3D hover tilt toward the cursor — forwarded to the underlying {@link Card}
   * ({@link attachTilt}). Engine-free and reduced-motion aware.
   */
  tilt?: boolean
  /**
   * Cursor-following radial glow inside the card — forwarded to the underlying
   * {@link Card} ({@link attachSpotlight}). Engine-free and reduced-motion aware.
   */
  spotlight?: boolean
  class?: string
}

/** Guess a ribbon tone from the badge text when one isn't given. */
function inferTone(badge: string | undefined, tone: ProductBadgeTone | undefined): ProductBadgeTone {
  if (tone) return tone
  const b = (badge ?? '').toLowerCase()
  if (/sale|off|%|deal/.test(b)) return 'sale'
  if (/new/.test(b)) return 'new'
  return 'featured'
}

/**
 * Card summarizing a single product: image with a corner ribbon, brand, title,
 * category, optional rating, price (with compare-at/discount), and an optional
 * "Add to cart" button. Frosted glass with edge glow.
 *
 * @example
 * ```tsx
 * <ProductCard
 *   title="Wireless Headphones"
 *   brand="Acme"
 *   category="Audio"
 *   price={79.99}
 *   compareAt={99.99}
 *   image="/headphones.jpg"
 *   rating={4}
 *   badge="Sale"
 *   badgeTone="sale"
 *   onAddToCart={() => addToCart(sku)}
 * />
 * ```
 */
export function ProductCard(props: ProductCardProps): JSX.Element {
  return (
    <Card
      glass
      glow
      tilt={props.tilt}
      spotlight={props.spotlight}
      class={cn('flex h-full flex-col overflow-hidden p-4', props.class)}
    >
      <div class="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <img src={props.image} alt={props.title} loading="lazy" class="h-full w-full object-cover" />
        <Show when={props.badge}>
          {/* Diagonal corner ribbon (clipped by the overflow-hidden image box). */}
          <span
            class={cn(
              'absolute -right-9 top-3.5 w-32 rotate-45 py-1 text-center text-[11px] font-semibold uppercase tracking-wide shadow-md',
              RIBBON_TONE[inferTone(props.badge, props.badgeTone)],
            )}
          >
            {props.badge}
          </span>
        </Show>
      </div>
      {/* flex-1 + mt-auto on the button pins "Add to cart" to the bottom, so
          cards of differing content height still line up in a grid row. */}
      <div class="mt-3 flex flex-1 flex-col gap-1.5">
        <Show when={props.brand}>
          <span class="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {props.brand}
          </span>
        </Show>
        <p class="line-clamp-1 font-medium text-foreground">{props.title}</p>
        <Show when={props.category}>
          <span class="w-fit rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {props.category}
          </span>
        </Show>
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
          <Button class="mt-auto w-full" onClick={() => props.onAddToCart?.()}>
            Add to cart
          </Button>
        </Show>
      </div>
    </Card>
  )
}
