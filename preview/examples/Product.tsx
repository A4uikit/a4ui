// Example template — Product detail. Full-page composition dogfooding A4ui components.
// Theme-agnostic: only semantic tokens/utilities, so it reskins under any theme.
import { For, createSignal, type JSX } from 'solid-js'

import {
  AvatarGroup,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Carousel,
  Descriptions,
  Image,
  NumberInput,
  Rating,
  Tabs,
} from '../../src'

const gallery: { alt: string }[] = [
  { alt: 'Aurora headphones — front view' },
  { alt: 'Aurora headphones — side profile' },
  { alt: 'Aurora headphones — folded flat' },
  { alt: 'Aurora headphones — in carrying case' },
]

const specs: { label: string; value: JSX.Element }[] = [
  { label: 'Driver', value: '40mm dynamic, neodymium' },
  { label: 'Battery life', value: 'Up to 38 hours' },
  { label: 'Connectivity', value: 'Bluetooth 5.3 · USB-C · 3.5mm' },
  { label: 'Noise cancelling', value: <Badge tone="info">Adaptive ANC</Badge> },
  { label: 'Weight', value: '254 g' },
  { label: 'Warranty', value: '2 years' },
]

const reviews: { name: string; initials: string; rating: number; when: string; body: string }[] = [
  {
    name: 'Marina Vega',
    initials: 'MV',
    rating: 5,
    when: '3 days ago',
    body: 'The ANC is genuinely impressive on a plane, and they stay comfortable for hours.',
  },
  {
    name: 'Theo Nakamura',
    initials: 'TN',
    rating: 4,
    when: '1 week ago',
    body: 'Great sound and battery. App could use a better EQ, but the hardware is excellent.',
  },
  {
    name: 'Priya Anand',
    initials: 'PA',
    rating: 5,
    when: '2 weeks ago',
    body: 'Switched from a much pricier pair and honestly prefer these. Build feels premium.',
  },
]

const reviewers = [
  { fallback: 'MV', alt: 'Marina Vega' },
  { fallback: 'TN', alt: 'Theo Nakamura' },
  { fallback: 'PA', alt: 'Priya Anand' },
  { fallback: 'LM', alt: 'Lucas Moreau' },
  { fallback: 'SR', alt: 'Sofia Rossi' },
  { fallback: 'JK', alt: 'Jonas Keller' },
]

export default function Product(): JSX.Element {
  const [qty, setQty] = createSignal(1)
  const [tab, setTab] = createSignal('description')

  return (
    <div class="mx-auto max-w-5xl space-y-6 py-8">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Audio', href: '/audio' },
          { label: 'Headphones', href: '/audio/headphones' },
          { label: 'Aurora ANC' },
        ]}
      />

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Carousel
          slides={gallery.map((slide) => (
            <Image src="/og.png" alt={slide.alt} class="aspect-video w-full" />
          ))}
        />

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <Badge tone="success">In stock</Badge>
              <Badge tone="info">New</Badge>
            </div>
            <h1 class="text-2xl font-bold tracking-tight">Aurora ANC Wireless Headphones</h1>
            <div class="flex items-center gap-2">
              <Rating value={5} readonly />
              <span class="text-sm text-muted-foreground">4.8 · 1,204 reviews</span>
            </div>
          </div>

          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-bold text-foreground">$249</span>
            <span class="text-sm text-muted-foreground line-through">$329</span>
            <span class="text-sm font-medium text-primary">Save 24%</span>
          </div>

          <p class="text-sm text-muted-foreground">
            Adaptive noise cancelling, 38-hour battery, and plush memory-foam ear cups — tuned for long
            listening sessions and calls on the go.
          </p>

          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-foreground">Quantity</span>
            <NumberInput value={qty()} onChange={setQty} min={1} max={10} />
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <Button class="flex-1">Add to cart</Button>
            <Button variant="outline" class="flex-1">
              Buy now
            </Button>
          </div>
        </div>
      </div>

      <Card class="p-6">
        <Tabs
          value={tab()}
          onChange={setTab}
          items={[
            {
              value: 'description',
              label: 'Description',
              content: (
                <div class="space-y-3 text-sm text-muted-foreground">
                  <p>
                    The Aurora ANC pairs a custom 40mm driver with adaptive noise cancelling that reads your
                    surroundings and adjusts in real time. Whether you're commuting, working, or unwinding,
                    the soundstage stays clear and the bass stays composed.
                  </p>
                  <p>
                    A single charge lasts up to 38 hours, and a quick 10-minute top-up returns several hours
                    of playback. Multipoint Bluetooth keeps your laptop and phone connected at once, so
                    switching from a call to a playlist is seamless.
                  </p>
                </div>
              ),
            },
            {
              value: 'specs',
              label: 'Specs',
              content: <Descriptions columns={2} items={specs} />,
            },
            {
              value: 'reviews',
              label: 'Reviews',
              content: (
                <div class="space-y-5">
                  <div class="flex items-center gap-3">
                    <AvatarGroup avatars={reviewers} max={4} />
                    <span class="text-sm text-muted-foreground">Loved by 1,204 verified buyers</span>
                  </div>
                  <div class="space-y-4">
                    <For each={reviews}>
                      {(review) => (
                        <div class="space-y-1 border-b border-border pb-4 last:border-0 last:pb-0">
                          <div class="flex items-center justify-between gap-2">
                            <span class="text-sm font-medium text-foreground">{review.name}</span>
                            <span class="text-xs text-muted-foreground">{review.when}</span>
                          </div>
                          <Rating value={review.rating} readonly />
                          <p class="text-sm text-muted-foreground">{review.body}</p>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}
