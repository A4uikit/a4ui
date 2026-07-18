// Example template — Checkout. Full-page composition dogfooding A4ui commerce components.
// Theme-agnostic: only semantic tokens/utilities, so it reskins under any theme.
import { createMemo, createSignal, For, type JSX } from 'solid-js'

import { Card, CardContent, CardHeader, CardTitle, Input, Separator } from '../../src'
import { CartLine, CartSummary } from '../../src/commerce'
import { FormControl, FormDescription, FormError, FormField, FormLabel } from '../../src/ui/Form'

interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  image: string
}

const SHIPPING_FLAT = 6.99
const TAX_RATE = 0.08

export default function Checkout(): JSX.Element {
  const [cartItems, setCartItems] = createSignal<CartItem[]>([
    {
      id: 'c1',
      title: 'Canvas Weekender Bag',
      price: 89,
      quantity: 1,
      image: 'https://picsum.photos/seed/checkout-bag/200/200',
    },
    {
      id: 'c2',
      title: 'Ceramic Pour-Over Set',
      price: 46,
      quantity: 2,
      image: 'https://picsum.photos/seed/checkout-pourover/200/200',
    },
    {
      id: 'c3',
      title: 'Merino Wool Beanie',
      price: 32,
      quantity: 1,
      image: 'https://picsum.photos/seed/checkout-beanie/200/200',
    },
  ])

  const [name, setName] = createSignal('')
  const [email, setEmail] = createSignal('')
  const [address, setAddress] = createSignal('')

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const subtotal = createMemo(() => cartItems().reduce((sum, item) => sum + item.price * item.quantity, 0))
  const shipping = createMemo(() => (cartItems().length > 0 ? SHIPPING_FLAT : 0))
  const tax = createMemo(() => subtotal() * TAX_RATE)
  const total = createMemo(() => subtotal() + shipping() + tax())

  const summaryLines = createMemo(() => [
    { label: 'Subtotal', amount: subtotal() },
    { label: 'Shipping', amount: shipping() },
    { label: 'Tax', amount: tax() },
  ])

  return (
    <div class="mx-auto max-w-5xl space-y-6 py-8">
      <header class="flex flex-col gap-1">
        <h1 class="text-2xl font-bold tracking-tight">Checkout</h1>
        <p class="text-sm text-muted-foreground">Review your cart and enter your shipping details.</p>
      </header>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your cart</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <For each={cartItems()}>
                {(item) => (
                  <CartLine
                    title={item.title}
                    price={item.price}
                    quantity={item.quantity}
                    image={item.image}
                    onQuantityChange={(quantity) => updateQuantity(item.id, quantity)}
                    onRemove={() => removeItem(item.id)}
                  />
                )}
              </For>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping details</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <FormField>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  {(fieldProps) => (
                    <Input {...fieldProps} value={name()} onInput={setName} placeholder="Ada Lovelace" />
                  )}
                </FormControl>
                <FormDescription>As it should appear on the shipping label.</FormDescription>
              </FormField>

              <FormField>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  {(fieldProps) => (
                    <Input
                      {...fieldProps}
                      type="email"
                      value={email()}
                      onInput={setEmail}
                      placeholder="ada@example.com"
                    />
                  )}
                </FormControl>
                <FormError>
                  {email().length > 0 && !email().includes('@') ? 'Enter a valid email address.' : undefined}
                </FormError>
              </FormField>

              <FormField>
                <FormLabel>Shipping address</FormLabel>
                <FormControl>
                  {(fieldProps) => (
                    <Input
                      {...fieldProps}
                      value={address()}
                      onInput={setAddress}
                      placeholder="123 Market Street, San Francisco, CA"
                    />
                  )}
                </FormControl>
                <FormDescription>
                  We only ship to the address on file with your payment method.
                </FormDescription>
              </FormField>
            </CardContent>
          </Card>
        </div>

        <div class="space-y-6">
          <CartSummary
            lines={summaryLines()}
            total={total()}
            checkoutLabel="Place order"
            onCheckout={() => setCartItems([])}
          />
          <Separator />
          <p class="text-xs text-muted-foreground">
            Taxes are estimated at checkout. Final amounts are calculated when your order ships.
          </p>
        </div>
      </div>
    </div>
  )
}
