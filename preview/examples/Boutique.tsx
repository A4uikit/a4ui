// Example template — Boutique. Full-page composition dogfooding A4ui commerce
// components: facet filtering, three product-card display styles, a cart
// Drawer, and social-proof bands. Theme-agnostic: only semantic tokens/
// utilities, so it reskins under any theme.
import { ShoppingCart } from 'lucide-solid'
import { createMemo, createSignal, For, Match, onMount, Show, Switch, type JSX } from 'solid-js'

import {
  AnnouncementBar,
  animateIn,
  Button,
  Card,
  Drawer,
  Image,
  LikeButton,
  LogoWall,
  RatingsSummary,
  SegmentedControl,
} from '../../src'
import {
  CartLine,
  CartSummary,
  createCart,
  FacetSidebar,
  PriceBlock,
  ProductCard,
  ProductGrid,
} from '../../src/commerce'
import type { FacetSection } from '../../src/commerce'

interface Product {
  id: string
  sku: string
  title: string
  price: number
  compareAt?: number
  image: string
  rating?: number
  badge?: string
  type: 'camera' | 'lens' | 'accessory'
  brand: string
  mount: string
}

const TYPE_LABELS: Record<string, string> = {
  camera: 'Camera',
  lens: 'Lens',
  accessory: 'Accessory',
}
const BRAND_LABELS: Record<string, string> = {
  nocturne: 'Nocturne',
  vantage: 'Vantage',
  meridian: 'Meridian',
  solstice: 'Solstice',
}
const MOUNT_LABELS: Record<string, string> = {
  e: 'E Mount',
  z: 'Z Mount',
  x: 'X Mount',
  universal: 'Universal',
}

const products: Product[] = [
  {
    id: 'p1',
    sku: 'NC-BODY-07',
    title: 'Nocturne V7 Mirrorless Body',
    price: 649,
    compareAt: 799,
    image: 'https://picsum.photos/seed/boutique-nocturne-v7/600/600',
    rating: 5,
    badge: 'Sale',
    type: 'camera',
    brand: 'nocturne',
    mount: 'e',
  },
  {
    id: 'p2',
    sku: 'VG-BODY-3',
    title: 'Vantage G3 Rangefinder',
    price: 1290,
    image: 'https://picsum.photos/seed/boutique-vantage-g3/600/600',
    rating: 4,
    badge: 'Featured',
    type: 'camera',
    brand: 'vantage',
    mount: 'x',
  },
  {
    id: 'p3',
    sku: 'MR-BODY-X1',
    title: 'Meridian X1 Compact',
    price: 420,
    image: 'https://picsum.photos/seed/boutique-meridian-x1/600/600',
    rating: 4,
    type: 'camera',
    brand: 'meridian',
    mount: 'z',
  },
  {
    id: 'p4',
    sku: 'NC-LNS-35',
    title: 'Nocturne 35mm f/1.4',
    price: 380,
    compareAt: 460,
    image: 'https://picsum.photos/seed/boutique-nocturne-35/600/600',
    rating: 5,
    badge: 'Sale',
    type: 'lens',
    brand: 'nocturne',
    mount: 'e',
  },
  {
    id: 'p5',
    sku: 'VG-LNS-85',
    title: 'Vantage 85mm f/1.8 Portrait',
    price: 310,
    image: 'https://picsum.photos/seed/boutique-vantage-85/600/600',
    rating: 4,
    badge: 'New',
    type: 'lens',
    brand: 'vantage',
    mount: 'x',
  },
  {
    id: 'p6',
    sku: 'MR-LNS-2470',
    title: 'Meridian 24-70mm f/2.8',
    price: 540,
    image: 'https://picsum.photos/seed/boutique-meridian-2470/600/600',
    rating: 5,
    type: 'lens',
    brand: 'meridian',
    mount: 'z',
  },
  {
    id: 'p7',
    sku: 'SL-LNS-50',
    title: 'Solstice 50mm f/1.2',
    price: 265,
    image: 'https://picsum.photos/seed/boutique-solstice-50/600/600',
    rating: 4,
    type: 'lens',
    brand: 'solstice',
    mount: 'e',
  },
  {
    id: 'p8',
    sku: 'NC-ACC-STRAP',
    title: 'Nocturne Leather Wrist Strap',
    price: 38,
    image: 'https://picsum.photos/seed/boutique-nocturne-strap/600/600',
    rating: 4,
    type: 'accessory',
    brand: 'nocturne',
    mount: 'universal',
  },
  {
    id: 'p9',
    sku: 'VG-ACC-BAG',
    title: 'Vantage Canvas Camera Bag',
    price: 96,
    compareAt: 120,
    image: 'https://picsum.photos/seed/boutique-vantage-bag/600/600',
    rating: 5,
    badge: 'Sale',
    type: 'accessory',
    brand: 'vantage',
    mount: 'universal',
  },
  {
    id: 'p10',
    sku: 'MR-ACC-FILTER',
    title: 'Meridian 67mm ND Filter Kit',
    price: 54,
    image: 'https://picsum.photos/seed/boutique-meridian-filter/600/600',
    rating: 3,
    type: 'accessory',
    brand: 'meridian',
    mount: 'universal',
  },
]

const PRICE_MIN = 0
const PRICE_MAX = 1300

/** Facet options with live counts derived from the product data. */
const facetOptions = (key: 'type' | 'brand' | 'mount', labels: Record<string, string>) =>
  Object.keys(labels).map((value) => ({
    value,
    label: labels[value],
    count: products.filter((p) => p[key] === value).length,
  }))

const FACET_SECTIONS: FacetSection[] = [
  { key: 'type', title: 'Type', options: facetOptions('type', TYPE_LABELS) },
  { key: 'brand', title: 'Brand', options: facetOptions('brand', BRAND_LABELS) },
  { key: 'mount', title: 'Mount', options: facetOptions('mount', MOUNT_LABELS), defaultOpen: false },
]

type CardStyle = 'standard' | 'detailed' | 'compact'

export default function Boutique(): JSX.Element {
  const [cartOpen, setCartOpen] = createSignal(false)
  const [cardStyle, setCardStyle] = createSignal<CardStyle>('standard')
  const [selected, setSelected] = createSignal<Record<string, string[]>>({})
  const [priceRange, setPriceRange] = createSignal<[number, number]>([PRICE_MIN, PRICE_MAX])

  const cart = createCart<Product>()

  // Faceted filtering: OR within a facet, AND across facets, empty facet = all.
  const filtered = createMemo(() =>
    products.filter((p) => {
      const facetsMatch = (['type', 'brand', 'mount'] as const).every((key) => {
        const values = selected()[key] ?? []
        return values.length === 0 || values.includes(p[key])
      })
      return facetsMatch && p.price >= priceRange()[0] && p.price <= priceRange()[1]
    }),
  )

  return (
    <div class="space-y-6 pb-8">
      <AnnouncementBar tone="accent" dismissible couponCode="GRAIN15">
        Free shipping over $150 — take 15% off pre-owned lenses with code GRAIN15
      </AnnouncementBar>

      <div class="mx-auto max-w-7xl space-y-8 px-4">
        <header class="flex items-center justify-between gap-4 pt-2">
          <div class="flex flex-col gap-1">
            <h1 class="text-2xl font-bold tracking-tight">Aperture</h1>
            <p class="text-sm text-muted-foreground">
              Hand-inspected, pre-owned cameras &amp; lenses — every unit graded and guaranteed.
            </p>
          </div>
          <Button variant="outline" class="relative" onClick={() => setCartOpen(true)}>
            <ShoppingCart class="h-4 w-4" />
            Cart
            {/* Count bubble — only when there are items, filled for contrast. */}
            <Show when={cart.count() > 0}>
              <span class="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
                {cart.count()}
              </span>
            </Show>
          </Button>
        </header>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <aside>
            <FacetSidebar
              sections={FACET_SECTIONS}
              selected={selected()}
              onChange={(key, values) => setSelected({ ...selected(), [key]: values })}
              price={{ min: PRICE_MIN, max: PRICE_MAX, value: priceRange() }}
              onPriceChange={setPriceRange}
              resultCount={filtered().length}
              onClearAll={() => {
                setSelected({})
                setPriceRange([PRICE_MIN, PRICE_MAX])
              }}
            />
          </aside>

          <div class="space-y-4">
            <div class="flex items-center justify-end">
              <SegmentedControl
                value={cardStyle()}
                onChange={(value) => setCardStyle(value as CardStyle)}
                options={[
                  { value: 'standard', label: 'Standard' },
                  { value: 'detailed', label: 'Detailed' },
                  { value: 'compact', label: 'Compact' },
                ]}
              />
            </div>

            <Show
              when={filtered().length > 0}
              fallback={
                <div class="grid place-items-center rounded-xl border border-dashed border-border py-24 text-center text-sm text-muted-foreground">
                  No gear matches those filters.
                </div>
              }
            >
              <ProductGrid class="sm:grid-cols-2 lg:grid-cols-3">
                <For each={filtered()}>
                  {(product, i) => {
                    let el: HTMLDivElement | undefined
                    onMount(() => {
                      if (el) animateIn(el, { delay: i() * 0.05 })
                    })
                    return (
                      <div ref={el} class="relative h-full">
                        {/* Wishlist toggle — pinned to the card's top-right corner, on top
                            of whichever card style is active. Own glass chip so it reads
                            clearly over the product photo in every style. */}
                        <LikeButton
                          icon="heart"
                          aria-label={`Save ${product.title}`}
                          class="absolute right-2 top-2 z-10 rounded-full bg-background/70 p-1.5 backdrop-blur-sm"
                        />
                        <Switch>
                          <Match when={cardStyle() === 'standard'}>
                            <ProductCard
                              title={product.title}
                              brand={BRAND_LABELS[product.brand]}
                              category={TYPE_LABELS[product.type]}
                              price={product.price}
                              compareAt={product.compareAt}
                              image={product.image}
                              rating={product.rating}
                              badge={product.badge}
                              onAddToCart={() => cart.add(product)}
                            />
                          </Match>

                          <Match when={cardStyle() === 'detailed'}>
                            <Card glass class="flex h-full flex-col gap-3 p-4">
                              <Image src={product.image} alt={product.title} class="aspect-square w-full" />
                              <div class="flex flex-1 flex-col gap-1.5">
                                <span class="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                  {BRAND_LABELS[product.brand]} · {MOUNT_LABELS[product.mount]}
                                </span>
                                <p class="line-clamp-1 font-medium text-foreground">{product.title}</p>
                                <p class="font-mono text-[11px] text-muted-foreground">SKU {product.sku}</p>
                                <PriceBlock
                                  amount={product.price}
                                  compareAt={product.compareAt}
                                  coupon={
                                    product.badge === 'Sale'
                                      ? { code: 'GRAIN15', amount: Math.round(product.price * 0.15) }
                                      : undefined
                                  }
                                  size="md"
                                />
                                <Button class="mt-auto w-full" onClick={() => cart.add(product)}>
                                  Add to cart
                                </Button>
                              </div>
                            </Card>
                          </Match>

                          <Match when={cardStyle() === 'compact'}>
                            <Card glass class="flex h-full flex-col gap-2 p-3">
                              <Image
                                src={product.image}
                                alt={product.title}
                                preview={false}
                                class="aspect-square w-full"
                              />
                              <p class="line-clamp-1 text-sm font-medium text-foreground">{product.title}</p>
                              <p class="text-sm font-semibold text-foreground">${product.price}</p>
                              <Button
                                variant="outline"
                                class="mt-auto w-full px-2 py-1 text-xs"
                                onClick={() => cart.add(product)}
                              >
                                Add
                              </Button>
                            </Card>
                          </Match>
                        </Switch>
                      </div>
                    )
                  }}
                </For>
              </ProductGrid>
            </Show>
          </div>
        </div>

        <section class="space-y-3">
          <p class="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
            As featured in
          </p>
          <LogoWall
            logos={[
              { src: 'https://picsum.photos/seed/boutique-outlet-1/160/48', alt: 'Shutter Weekly' },
              { src: 'https://picsum.photos/seed/boutique-outlet-2/160/48', alt: 'Lens & Light' },
              { src: 'https://picsum.photos/seed/boutique-outlet-3/160/48', alt: 'Frame Digest' },
              { src: 'https://picsum.photos/seed/boutique-outlet-4/160/48', alt: 'Optics Journal' },
              { src: 'https://picsum.photos/seed/boutique-outlet-5/160/48', alt: 'Analog Times' },
              { src: 'https://picsum.photos/seed/boutique-outlet-6/160/48', alt: 'The Aperture Review' },
            ]}
          />
        </section>

        <RatingsSummary
          sources={[
            { name: 'Gear Trust', score: 4.8, outOf: 5, count: 1830 },
            { name: 'Buyer Verified', score: 4.7, outOf: 5, count: 962 },
            { name: 'Camera Circle', score: 4.9, outOf: 5, count: 540 },
            { name: 'Trade-In Index', score: 'A+', count: 275 },
          ]}
        />
      </div>

      <Drawer
        open={cartOpen()}
        onOpenChange={setCartOpen}
        title="Your cart"
        subtitle={`${cart.count()} item${cart.count() === 1 ? '' : 's'}`}
      >
        <div class="flex flex-col gap-5 p-5">
          <Show
            when={cart.items().length > 0}
            fallback={<p class="text-sm text-muted-foreground">Your cart is empty.</p>}
          >
            <div class="flex flex-col gap-4">
              <For each={cart.items()}>
                {(entry) => (
                  <CartLine
                    title={entry.product.title}
                    price={entry.product.price}
                    quantity={entry.qty}
                    image={entry.product.image}
                    onQuantityChange={(quantity) => cart.setQty(entry.product.id, quantity)}
                    onRemove={() => cart.remove(entry.product.id)}
                  />
                )}
              </For>
            </div>
            <CartSummary
              lines={[{ label: 'Subtotal', amount: cart.subtotal() }]}
              total={cart.subtotal()}
              onCheckout={() => {
                cart.clear()
                setCartOpen(false)
              }}
            />
          </Show>
        </div>
      </Drawer>
    </div>
  )
}
