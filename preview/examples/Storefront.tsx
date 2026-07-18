// Example template — Storefront. Full-page composition dogfooding A4ui commerce components.
// Theme-agnostic: only semantic tokens/utilities, so it reskins under any theme.
import { ShoppingCart } from 'lucide-solid'
import { createSignal, For, Show, type JSX } from 'solid-js'

import { Button } from '../../src'
import { FilterGroup, ProductCard, ProductGrid } from '../../src/commerce'

interface Product {
  id: string
  title: string
  price: number
  compareAt?: number
  image: string
  rating?: number
  badge?: string
}

const products: Product[] = [
  {
    id: 'p1',
    title: 'Canvas Weekender Bag',
    price: 89,
    compareAt: 120,
    image: 'https://picsum.photos/seed/storefront-bag/600/600',
    rating: 4,
    badge: 'Sale',
  },
  {
    id: 'p2',
    title: 'Ceramic Pour-Over Set',
    price: 46,
    image: 'https://picsum.photos/seed/storefront-pourover/600/600',
    rating: 5,
  },
  {
    id: 'p3',
    title: 'Merino Wool Beanie',
    price: 32,
    image: 'https://picsum.photos/seed/storefront-beanie/600/600',
    rating: 4,
    badge: 'New',
  },
  {
    id: 'p4',
    title: 'Walnut Desk Organizer',
    price: 58,
    image: 'https://picsum.photos/seed/storefront-organizer/600/600',
    rating: 4,
  },
  {
    id: 'p5',
    title: 'Recycled Wool Throw',
    price: 74,
    compareAt: 95,
    image: 'https://picsum.photos/seed/storefront-throw/600/600',
    rating: 5,
    badge: 'Sale',
  },
  {
    id: 'p6',
    title: 'Brass Desk Lamp',
    price: 110,
    image: 'https://picsum.photos/seed/storefront-lamp/600/600',
    rating: 3,
  },
  {
    id: 'p7',
    title: 'Stoneware Mug Set',
    price: 38,
    image: 'https://picsum.photos/seed/storefront-mugs/600/600',
    rating: 4,
    badge: 'New',
  },
  {
    id: 'p8',
    title: 'Leather Card Wallet',
    price: 42,
    compareAt: 54,
    image: 'https://picsum.photos/seed/storefront-wallet/600/600',
    rating: 4,
  },
]

const categoryOptions = [
  { value: 'home', label: 'Home', count: 5 },
  { value: 'accessories', label: 'Accessories', count: 3 },
  { value: 'lighting', label: 'Lighting', count: 1 },
]

const brandOptions = [
  { value: 'atelier', label: 'Atelier Co.', count: 4 },
  { value: 'northfield', label: 'Northfield', count: 3 },
  { value: 'lumen', label: 'Lumen', count: 1 },
]

export default function Storefront(): JSX.Element {
  const [cartCount, setCartCount] = createSignal(0)
  // Illustrative only: the selections drive the checkbox UI but don't filter
  // the product grid below.
  const [categories, setCategories] = createSignal<string[]>([])
  const [brands, setBrands] = createSignal<string[]>([])

  return (
    <div class="mx-auto max-w-5xl space-y-6 py-8">
      <header class="flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <h1 class="text-2xl font-bold tracking-tight">Storefront</h1>
          <p class="text-sm text-muted-foreground">Small-batch goods for the home and everyday carry.</p>
        </div>
        <Button variant="outline" class="relative">
          <ShoppingCart class="h-4 w-4" />
          Cart
          {/* Count bubble — only when there are items, filled for contrast. */}
          <Show when={cartCount() > 0}>
            <span class="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
              {cartCount()}
            </span>
          </Show>
        </Button>
      </header>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <aside class="space-y-6">
          <FilterGroup
            title="Category"
            options={categoryOptions}
            selected={categories()}
            onChange={setCategories}
          />
          <FilterGroup title="Brand" options={brandOptions} selected={brands()} onChange={setBrands} />
        </aside>

        <ProductGrid class="sm:grid-cols-2 lg:grid-cols-3">
          <For each={products}>
            {(product) => (
              <ProductCard
                title={product.title}
                price={product.price}
                compareAt={product.compareAt}
                image={product.image}
                rating={product.rating}
                badge={product.badge}
                onAddToCart={() => setCartCount((count) => count + 1)}
              />
            )}
          </For>
        </ProductGrid>
      </div>
    </div>
  )
}
