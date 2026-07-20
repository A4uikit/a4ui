// Example template — Pre-owned premium camera product detail page. Full-page
// composition showcasing PriceBlock, ConditionScale, SpecSheet, and
// RatingsSummary alongside the gallery/cart primitives.
// Theme-agnostic: only semantic tokens/utilities, so it reskins under any theme.
import { ShieldCheck, BadgeCheck, RotateCcw, Truck } from 'lucide-solid'
import { For, createSignal, type JSX } from 'solid-js'

import { Badge, Breadcrumb, Button, Drawer, Expandable, Image, SpecSheet, RatingsSummary } from '../../src'
import {
  CartLine,
  CartSummary,
  ConditionScale,
  createCart,
  PriceBlock,
  ProductCard,
  ProductGrid,
  type CartProduct,
} from '../../src/commerce'

const thumbnails: { alt: string; src: string }[] = [
  { alt: 'Nocturne M2 Rangefinder — front', src: 'https://picsum.photos/seed/nocturne-m2-1/160/160' },
  { alt: 'Nocturne M2 Rangefinder — top plate', src: 'https://picsum.photos/seed/nocturne-m2-2/160/160' },
  { alt: 'Nocturne M2 Rangefinder — back LCD', src: 'https://picsum.photos/seed/nocturne-m2-3/160/160' },
  { alt: 'Nocturne M2 Rangefinder — lens mount', src: 'https://picsum.photos/seed/nocturne-m2-4/160/160' },
  { alt: 'Nocturne M2 Rangefinder — base plate', src: 'https://picsum.photos/seed/nocturne-m2-5/160/160' },
  {
    alt: 'Nocturne M2 Rangefinder — in leather case',
    src: 'https://picsum.photos/seed/nocturne-m2-6/160/160',
  },
]

const specGroups = [
  {
    title: 'Body',
    rows: [
      { label: 'Construction', value: 'Magnesium alloy, brass top plate' },
      { label: 'Viewfinder', value: '0.74x optical rangefinder, 35/50/90mm frame lines' },
      { label: 'Shutter', value: 'Mechanical focal-plane, 1/4000s – 8s' },
      { label: 'Weight', value: '590 g (body only)' },
    ],
  },
  {
    title: 'Sensor',
    rows: [
      { label: 'Sensor type', value: 'Full-frame CMOS, 24MP' },
      { label: 'ISO range', value: '200 – 51,200' },
      { label: 'Image processor', value: 'Nocturne Optic Engine III' },
      { label: 'Storage', value: 'Single SD UHS-II' },
    ],
  },
  {
    title: 'In the box',
    rows: [
      { label: 'Included', value: 'Body cap, shoulder strap, charger' },
      { label: 'Battery', value: '1x lithium-ion pack (rated 320 shots)' },
      { label: 'Documentation', value: 'Quick-start guide, warranty card' },
    ],
  },
]

const ratingSources = [
  { name: 'Grainhouse Reviews', score: 4.8, outOf: 5, count: 612 },
  { name: 'Rangefinder Weekly', score: 4.7, outOf: 5, count: 289 },
  { name: 'Verified Buyers', score: 4.9, outOf: 5, count: 1043 },
  { name: 'Camera Trust Index', score: 'A+', count: 174 },
]

const trustBadges = [
  { icon: ShieldCheck, label: 'Authenticity guaranteed' },
  { icon: BadgeCheck, label: '1-year warranty' },
  { icon: RotateCcw, label: '30-day returns' },
  { icon: Truck, label: 'Free shipping' },
]

interface CameraProduct extends CartProduct {
  id: string
  price: number
  title: string
  image: string
}

const mainProduct: CameraProduct = {
  id: 'nocturne-m2-graphite',
  price: 2249,
  title: 'Nocturne M2 Rangefinder — Graphite',
  image: 'https://picsum.photos/seed/nocturne-m2-1/800/800',
}

const relatedCameras: {
  id: string
  title: string
  price: number
  compareAt?: number
  image: string
  badge?: string
}[] = [
  {
    id: 'nocturne-m1-black',
    title: 'Nocturne M1 Rangefinder — Black',
    price: 1499,
    compareAt: 1799,
    image: 'https://picsum.photos/seed/nocturne-m1/400/400',
    badge: 'Sale',
  },
  {
    id: 'nocturne-35mm-f2',
    title: 'Nocturne Optic 35mm f/2',
    price: 899,
    image: 'https://picsum.photos/seed/nocturne-lens-35/400/400',
  },
  {
    id: 'nocturne-leather-case',
    title: 'Nocturne Half-Case, Leather',
    price: 129,
    image: 'https://picsum.photos/seed/nocturne-case/400/400',
    badge: 'New',
  },
  {
    id: 'nocturne-strap',
    title: 'Nocturne Woven Wrist Strap',
    price: 45,
    image: 'https://picsum.photos/seed/nocturne-strap/400/400',
  },
]

export default function Showpiece(): JSX.Element {
  const [mainImage, setMainImage] = createSignal(thumbnails[0].src.replace('/160/160', '/800/800'))
  const [mainAlt, setMainAlt] = createSignal(thumbnails[0].alt)
  const [cartOpen, setCartOpen] = createSignal(false)

  const cart = createCart<CameraProduct>()

  const addToCart = () => {
    cart.add(mainProduct)
    setCartOpen(true)
  }

  return (
    <div class="mx-auto max-w-7xl space-y-10 py-8">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Cameras', href: '/cameras' },
          { label: 'Nocturne M2 Rangefinder' },
        ]}
      />

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div class="flex flex-col gap-3">
          <Expandable
            trigger={
              <Image
                src={mainImage()}
                alt={mainAlt()}
                preview={false}
                class="aspect-square w-full object-cover"
              />
            }
            size="dialog"
            maxWidth={800}
          >
            <img src={mainImage()} alt={mainAlt()} class="max-h-[80vh] w-full rounded-lg object-contain" />
          </Expandable>
          <div class="grid grid-cols-6 gap-2">
            <For each={thumbnails}>
              {(thumb) => (
                <button
                  type="button"
                  class="overflow-hidden rounded-lg border border-border transition hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring"
                  onClick={() => {
                    setMainImage(thumb.src.replace('/160/160', '/800/800'))
                    setMainAlt(thumb.alt)
                  }}
                >
                  <img
                    src={thumb.src}
                    alt={thumb.alt}
                    loading="lazy"
                    class="aspect-square w-full object-cover"
                  />
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Buy box */}
        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <Badge tone="success">In stock</Badge>
              <Badge tone="info">Certified pre-owned</Badge>
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-foreground">Nocturne M2 Rangefinder</h1>
            <p class="font-mono text-xs text-muted-foreground">SKU: NOC-M2-GPH-24187</p>
          </div>

          <PriceBlock
            amount={2249}
            compareAt={2599}
            coupon={{ code: 'GRAIN200', amount: 200 }}
            financing={{ months: 12, apr: 0.1 }}
            note={<p class="text-sm text-muted-foreground">Save an extra $45 paying by bank transfer.</p>}
          />

          <ConditionScale value={8} />

          <div class="flex flex-col gap-3 sm:flex-row">
            <Button class="flex-1" onClick={addToCart}>
              Add to cart
            </Button>
            <Button variant="outline" class="flex-1">
              Ask about this camera
            </Button>
          </div>

          <div class="grid grid-cols-2 gap-3 border-t border-border pt-5 sm:grid-cols-4">
            <For each={trustBadges}>
              {(item) => (
                <div class="flex flex-col items-center gap-1.5 text-center">
                  <item.icon class="h-5 w-5 text-muted-foreground" />
                  <span class="text-xs text-muted-foreground">{item.label}</span>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>

      <SpecSheet groups={specGroups} columns={2} />

      <RatingsSummary sources={ratingSources} />

      <div class="flex flex-col gap-4">
        <h2 class="text-lg font-bold text-foreground">You may also like</h2>
        <ProductGrid>
          <For each={relatedCameras}>
            {(item) => (
              <ProductCard
                title={item.title}
                price={item.price}
                compareAt={item.compareAt}
                image={item.image}
                brand="Nocturne"
                badge={item.badge}
                onAddToCart={() =>
                  cart.add({ id: item.id, price: item.price, title: item.title, image: item.image })
                }
              />
            )}
          </For>
        </ProductGrid>
      </div>

      <Drawer
        open={cartOpen()}
        onOpenChange={setCartOpen}
        title="Your cart"
        subtitle={`${cart.count()} item(s)`}
      >
        <div class="flex flex-1 flex-col gap-5 p-5">
          <div class="flex flex-col gap-4">
            <For each={cart.items()}>
              {(entry) => (
                <CartLine
                  title={entry.product.title}
                  price={entry.product.price}
                  quantity={entry.qty}
                  image={entry.product.image}
                  onQuantityChange={(qty) => cart.setQty(entry.product.id, qty)}
                  onRemove={() => cart.remove(entry.product.id)}
                />
              )}
            </For>
          </div>
          <CartSummary
            lines={[
              { label: 'Subtotal', amount: cart.subtotal() },
              { label: 'Shipping', amount: 0 },
            ]}
            total={cart.subtotal()}
            onCheckout={() => setCartOpen(false)}
          />
        </div>
      </Drawer>
    </div>
  )
}
