// PricingTable — a responsive grid of pricing tiers, each a Card with a
// feature checklist and a CTA Button. When any tier carries an annual price,
// a monthly/annual toggle renders above the grid (controlled or uncontrolled).
import { Check } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { For, Show, createSignal, splitProps } from 'solid-js'

import { cn } from '../lib/cn'
import { Badge } from './Badge'
import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { spawnRipple } from './Ripple'

// Mirrors Button's `primary`/`outline` classes for the `href` case, where the
// CTA must render as an `<a>` — Button itself only renders a `<button>`.
const CTA_LINK_BASE =
  'relative inline-flex w-full items-center justify-center overflow-hidden rounded-md px-3 py-2 text-sm font-medium transition-[color,background-color,transform] duration-150 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-ring'
const CTA_LINK_VARIANT = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border border-border bg-transparent text-foreground hover:bg-muted',
}

/** Billing period a {@link PricingTable} can show. */
export type PricingPeriod = 'monthly' | 'annual'

/** One plan/tier rendered by {@link PricingTable}. */
export interface PricingTier {
  /** Plan name, e.g. `"Pro"`. */
  name: string
  /** Pre-formatted price for the monthly period, e.g. `"$0"` or `"$99/mes"`. */
  price: string
  /** Pre-formatted price for the annual period. When ANY tier sets this, the toggle renders. */
  priceAnnual?: string
  /** Short one-line description under the plan name. */
  description?: string
  /** Bullet list of included features, each rendered with a check icon. */
  features: string[]
  /** Renders this tier emphasized: `glass` surface, a ring, and a "Popular" {@link Badge}. */
  highlighted?: boolean
  /** Call-to-action button. Rendered as an `<a>` when `href` is set, otherwise a `<button>`. */
  cta?: { label: string; href?: string; onClick?: () => void }
}

interface PricingTableProps {
  /** Tiers to render, in order, as a responsive grid. */
  tiers: PricingTier[]
  /** Controlled billing period. Omit to let the toggle manage its own state. */
  period?: PricingPeriod
  /** Fired when the toggle changes period, controlled or uncontrolled. */
  onPeriodChange?: (period: PricingPeriod) => void
  class?: string
}

/**
 * Responsive pricing grid: one {@link Card} per tier, a feature checklist, and
 * a CTA {@link Button}. The highlighted tier gets a frosted glass surface, a
 * ring, and a "Popular" {@link Badge}. When any tier sets `priceAnnual`, a
 * monthly/annual toggle renders above the grid — pass `period` +
 * `onPeriodChange` to control it, or omit both to let it manage its own state.
 *
 * @example
 * ```tsx
 * <PricingTable
 *   tiers={[
 *     { name: 'Free', price: '$0', features: ['1 project', 'Community support'], cta: { label: 'Start' } },
 *     {
 *       name: 'Pro',
 *       price: '$19/mo',
 *       priceAnnual: '$190/yr',
 *       description: 'For growing teams',
 *       features: ['Unlimited projects', 'Priority support'],
 *       highlighted: true,
 *       cta: { label: 'Upgrade', href: '/upgrade' },
 *     },
 *   ]}
 * />
 * ```
 */
export function PricingTable(props: PricingTableProps): JSX.Element {
  const [local] = splitProps(props, ['tiers', 'period', 'onPeriodChange', 'class'])

  const [internalPeriod, setInternalPeriod] = createSignal<PricingPeriod>('monthly')
  const period = () => local.period ?? internalPeriod()
  const setPeriod = (next: PricingPeriod) => {
    if (local.period === undefined) setInternalPeriod(next)
    local.onPeriodChange?.(next)
  }

  const showToggle = () => local.tiers.some((tier) => tier.priceAnnual !== undefined)
  const priceFor = (tier: PricingTier) =>
    period() === 'annual' ? (tier.priceAnnual ?? tier.price) : tier.price

  return (
    <div class={cn('flex flex-col items-center gap-8', local.class)}>
      <Show when={showToggle()}>
        <div class="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 p-1 text-sm">
          <button
            type="button"
            class={cn(
              'rounded-full px-3 py-1.5 font-medium transition-colors',
              period() === 'monthly'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
            aria-pressed={period() === 'monthly'}
            onClick={() => setPeriod('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            class={cn(
              'rounded-full px-3 py-1.5 font-medium transition-colors',
              period() === 'annual'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
            aria-pressed={period() === 'annual'}
            onClick={() => setPeriod('annual')}
          >
            Annual
          </button>
        </div>
      </Show>

      <div class="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <For each={local.tiers}>
          {(tier) => (
            <Card
              glass={tier.highlighted}
              class={cn('relative flex flex-col', tier.highlighted && 'ring-2 ring-primary')}
            >
              <Show when={tier.highlighted}>
                <Badge tone="info" class="absolute -top-3 right-6">
                  Popular
                </Badge>
              </Show>
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <Show when={tier.description}>
                  <p class="text-sm text-muted-foreground">{tier.description}</p>
                </Show>
                <p class="pt-2 text-3xl font-bold text-foreground">{priceFor(tier)}</p>
              </CardHeader>
              <CardContent class="flex flex-1 flex-col gap-6">
                <ul class="flex flex-1 flex-col gap-2">
                  <For each={tier.features}>
                    {(feature) => (
                      <li class="flex items-start gap-2 text-sm text-foreground">
                        <Check class="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        {feature}
                      </li>
                    )}
                  </For>
                </ul>
                <Show when={tier.cta}>
                  {(cta) => (
                    <Show
                      when={cta().href}
                      fallback={
                        <Button
                          ripple
                          onClick={cta().onClick}
                          variant={tier.highlighted ? 'primary' : 'outline'}
                          class="w-full"
                        >
                          {cta().label}
                        </Button>
                      }
                    >
                      {(href) => (
                        <a
                          href={href()}
                          onClick={cta().onClick}
                          onPointerDown={(event) =>
                            spawnRipple(event.currentTarget, event, { opacity: 0.35 })
                          }
                          class={cn(
                            CTA_LINK_BASE,
                            CTA_LINK_VARIANT[tier.highlighted ? 'primary' : 'outline'],
                          )}
                        >
                          {cta().label}
                        </a>
                      )}
                    </Show>
                  )}
                </Show>
              </CardContent>
            </Card>
          )}
        </For>
      </div>
    </div>
  )
}
