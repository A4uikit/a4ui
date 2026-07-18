// Example template — Pricing. Full-page composition dogfooding A4ui components.
// Theme-agnostic: only semantic tokens/utilities, so it reskins under any theme.
import { createSignal, For, type JSX } from 'solid-js'
import { Check } from 'lucide-solid'

import { Button, Card, Badge, Switch } from '../../src'

interface Tier {
  name: string
  tagline: string
  monthly: number
  annual: number
  featured: boolean
  cta: string
  features: string[]
}

const TIERS: Tier[] = [
  {
    name: 'Starter',
    tagline: 'For individuals shipping their first project.',
    monthly: 0,
    annual: 0,
    featured: false,
    cta: 'Get started',
    features: ['1 project', 'Up to 3 team members', 'Community support', '1 GB storage'],
  },
  {
    name: 'Pro',
    tagline: 'For growing teams that need more power.',
    monthly: 24,
    annual: 19,
    featured: true,
    cta: 'Start free trial',
    features: [
      'Unlimited projects',
      'Up to 20 team members',
      'Priority support',
      '100 GB storage',
      'Advanced analytics',
    ],
  },
  {
    name: 'Enterprise',
    tagline: 'For organizations with custom needs.',
    monthly: 79,
    annual: 64,
    featured: false,
    cta: 'Contact sales',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Dedicated support',
      'SSO & audit logs',
      'Custom SLA',
    ],
  },
]

export default function Pricing(): JSX.Element {
  const [annual, setAnnual] = createSignal(false)

  return (
    <div class="mx-auto max-w-7xl space-y-8 py-8">
      <div class="mx-auto max-w-2xl text-center">
        <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h1>
        <p class="mt-3 text-muted-foreground">
          Start free and scale as you grow. No hidden fees, cancel anytime.
        </p>
      </div>

      <div class="flex items-center justify-center gap-3">
        <span class="text-sm text-muted-foreground">Monthly</span>
        <Switch checked={annual()} onChange={setAnnual} />
        <span class="text-sm font-medium">Annual</span>
        <Badge tone="success">Save 20%</Badge>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <For each={TIERS}>
          {(tier) => (
            <Card
              glass={tier.featured}
              glow={tier.featured}
              class={`flex flex-col p-6 ${tier.featured ? 'ring-2 ring-primary' : ''}`}
            >
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold">{tier.name}</h2>
                {tier.featured && <Badge tone="info">Most popular</Badge>}
              </div>
              <p class="mt-1 text-sm text-muted-foreground">{tier.tagline}</p>

              <div class="mt-5 flex items-baseline gap-1">
                <span class="text-4xl font-bold tracking-tight">
                  ${annual() ? tier.annual : tier.monthly}
                </span>
                <span class="text-sm text-muted-foreground">/ month</span>
              </div>
              <p class="mt-1 h-4 text-xs text-muted-foreground">
                {annual() && tier.annual > 0 ? 'Billed annually' : ' '}
              </p>

              <ul class="mt-6 flex-1 space-y-3">
                <For each={tier.features}>
                  {(feature) => (
                    <li class="flex items-start gap-2 text-sm">
                      <Check class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  )}
                </For>
              </ul>

              <Button variant={tier.featured ? 'primary' : 'outline'} class="mt-6 w-full">
                {tier.cta}
              </Button>
            </Card>
          )}
        </For>
      </div>
    </div>
  )
}
