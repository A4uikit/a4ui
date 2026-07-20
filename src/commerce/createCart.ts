// A minimal signal-backed shopping cart store: add/remove/setQty/clear plus
// derived count() and subtotal(). Generic over the product shape so it can
// back CartLine/CartSummary (or any custom card) without re-implementing the
// same bookkeeping in every commerce template.
import type { Accessor } from 'solid-js'
import { createMemo, createSignal } from 'solid-js'

export interface CartProduct {
  id: string | number
  price: number
}

export interface CartEntry<T extends CartProduct> {
  product: T
  qty: number
}

export interface Cart<T extends CartProduct> {
  /** Reactive list of cart entries. */
  items: Accessor<CartEntry<T>[]>
  /** Add a product, or increment its `qty` if it's already in the cart. */
  add: (product: T, qty?: number) => void
  /** Remove a product from the cart by id. */
  remove: (id: T['id']) => void
  /** Set a product's quantity. `qty <= 0` removes the entry. */
  setQty: (id: T['id'], qty: number) => void
  /** Empty the cart. */
  clear: () => void
  /** Total number of units across all entries. */
  count: () => number
  /** Sum of `price * qty` across all entries. */
  subtotal: () => number
  /** Whether a product with this id is currently in the cart. */
  has: (id: T['id']) => boolean
}

/**
 * Create a signal-backed shopping cart store, generic over the product type.
 * `count()` and `subtotal()` are memoized and stay in sync with `items()`.
 *
 * @example
 * ```ts
 * interface Product extends CartProduct {
 *   id: string
 *   price: number
 *   title: string
 * }
 *
 * const cart = createCart<Product>()
 *
 * cart.add({ id: 'sku-1', price: 29.99, title: 'Wireless Mouse' })
 * cart.add({ id: 'sku-1', price: 29.99, title: 'Wireless Mouse' }) // qty -> 2
 * cart.setQty('sku-1', 3)
 *
 * cart.count()    // 3
 * cart.subtotal() // 89.97
 *
 * cart.remove('sku-1')
 * cart.has('sku-1') // false
 * ```
 */
export function createCart<T extends CartProduct>(initial: CartEntry<T>[] = []): Cart<T> {
  const [items, setItems] = createSignal<CartEntry<T>[]>(initial)

  const add = (product: T, qty = 1): void => {
    setItems((current) => {
      const existing = current.find((entry) => entry.product.id === product.id)
      if (existing) {
        return current.map((entry) =>
          entry.product.id === product.id ? { ...entry, qty: entry.qty + qty } : entry,
        )
      }
      return [...current, { product, qty }]
    })
  }

  const remove = (id: T['id']): void => {
    setItems((current) => current.filter((entry) => entry.product.id !== id))
  }

  const setQty = (id: T['id'], qty: number): void => {
    if (qty <= 0) {
      remove(id)
      return
    }
    setItems((current) => current.map((entry) => (entry.product.id === id ? { ...entry, qty } : entry)))
  }

  const clear = (): void => {
    setItems([])
  }

  const count = createMemo(() => items().reduce((total, entry) => total + entry.qty, 0))

  const subtotal = createMemo(() =>
    items().reduce((total, entry) => total + entry.product.price * entry.qty, 0),
  )

  const has = (id: T['id']): boolean => items().some((entry) => entry.product.id === id)

  return { items, add, remove, setQty, clear, count, subtotal, has }
}
