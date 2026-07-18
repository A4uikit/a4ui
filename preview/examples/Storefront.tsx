// Example template — Storefront. Full-page composition dogfooding A4ui commerce components.
// Theme-agnostic: only semantic tokens/utilities, so it reskins under any theme.
import { ShoppingCart } from 'lucide-solid'
import { createMemo, createSignal, For, onMount, Show, type JSX } from 'solid-js'

import { animateIn, Button } from '../../src'
import { FilterGroup, ProductCard, ProductGrid } from '../../src/commerce'

interface Product {
  id: string
  title: string
  price: number
  compareAt?: number
  image: string
  rating?: number
  badge?: string
  category: string
  brand: string
}

const CATEGORY_LABELS: Record<string, string> = {
  home: 'Home',
  accessories: 'Accessories',
  lighting: 'Lighting',
}
const BRAND_LABELS: Record<string, string> = {
  atelier: 'Atelier Co.',
  northfield: 'Northfield',
  lumen: 'Lumen',
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
    category: 'accessories',
    brand: 'atelier',
  },
  {
    id: 'p2',
    title: 'Ceramic Pour-Over Set',
    price: 46,
    image: 'https://picsum.photos/seed/storefront-pourover/600/600',
    rating: 5,
    category: 'home',
    brand: 'atelier',
  },
  {
    id: 'p3',
    title: 'Merino Wool Beanie',
    price: 32,
    image: 'https://picsum.photos/seed/storefront-beanie/600/600',
    rating: 4,
    badge: 'New',
    category: 'accessories',
    brand: 'northfield',
  },
  {
    id: 'p4',
    title: 'Walnut Desk Organizer',
    price: 58,
    image: 'https://picsum.photos/seed/storefront-organizer/600/600',
    rating: 4,
    category: 'home',
    brand: 'northfield',
  },
  {
    id: 'p5',
    title: 'Recycled Wool Throw',
    price: 74,
    compareAt: 95,
    image: 'https://picsum.photos/seed/storefront-throw/600/600',
    rating: 5,
    badge: 'Sale',
    category: 'home',
    brand: 'atelier',
  },
  {
    id: 'p6',
    title: 'Brass Desk Lamp',
    price: 110,
    image: 'https://picsum.photos/seed/storefront-lamp/600/600',
    rating: 3,
    category: 'lighting',
    brand: 'lumen',
  },
  {
    id: 'p7',
    title: 'Stoneware Mug Set',
    price: 38,
    image: 'https://picsum.photos/seed/storefront-mugs/600/600',
    rating: 4,
    badge: 'New',
    category: 'home',
    brand: 'northfield',
  },
  {
    id: 'p8',
    title: 'Leather Card Wallet',
    price: 42,
    compareAt: 54,
    image: 'https://picsum.photos/seed/storefront-wallet/600/600',
    rating: 4,
    badge: 'Sale',
    category: 'accessories',
    brand: 'atelier',
  },
]

/** Facet options with live counts derived from the product data. */
const facetOptions = (key: 'category' | 'brand', labels: Record<string, string>) =>
  Object.keys(labels).map((value) => ({
    value,
    label: labels[value],
    count: products.filter((p) => p[key] === value).length,
  }))

export default function Storefront(): JSX.Element {
  const [cartCount, setCartCount] = createSignal(0)
  const [categories, setCategories] = createSignal<string[]>([])
  const [brands, setBrands] = createSignal<string[]>([])

  // Faceted filtering: OR within a facet, AND across facets; empty facet = all.
  const filtered = createMemo(() =>
    products.filter(
      (p) =>
        (categories().length === 0 || categories().includes(p.category)) &&
        (brands().length === 0 || brands().includes(p.brand)),
    ),
  )

  return (
    <div class="mx-auto max-w-7xl space-y-6 py-8">
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
            options={facetOptions('category', CATEGORY_LABELS)}
            selected={categories()}
            onChange={setCategories}
          />
          <FilterGroup
            title="Brand"
            options={facetOptions('brand', BRAND_LABELS)}
            selected={brands()}
            onChange={setBrands}
          />
          <p class="text-xs text-muted-foreground">
            Showing {filtered().length} of {products.length}
          </p>
        </aside>

        <Show
          when={filtered().length > 0}
          fallback={
            <div class="grid place-items-center rounded-xl border border-dashed border-border py-24 text-center text-sm text-muted-foreground">
              No products match those filters.
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
                  <div ref={el}>
                    <ProductCard
                      title={product.title}
                      brand={BRAND_LABELS[product.brand]}
                      category={CATEGORY_LABELS[product.category]}
                      price={product.price}
                      compareAt={product.compareAt}
                      image={product.image}
                      rating={product.rating}
                      badge={product.badge}
                      onAddToCart={() => setCartCount((count) => count + 1)}
                    />
                  </div>
                )
              }}
            </For>
          </ProductGrid>
        </Show>
      </div>
    </div>
  )
}
