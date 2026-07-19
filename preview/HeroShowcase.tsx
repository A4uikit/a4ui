// A curated, editorial "hero" board — a single screen that shows off A4ui's
// identity (glass surfaces, tokens, charts, motion) on the starfield backdrop.
// Rendered at the hidden `#/hero` route and screenshotted at 2x for the README
// banner. Not linked from the nav; it's a capture target, not a docs page.
import type { JSX } from 'solid-js'

import { Badge, Button, Card, GradientText, Rating, RingProgress, Stat } from '../src'
import { DonutChart, Sparkline } from '../src/charts'

export function HeroShowcase(): JSX.Element {
  return (
    <div class="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-10 px-6 py-16">
      <div class="text-center">
        <Badge tone="info">Spatial Glass · SolidJS</Badge>
        <h1 class="mt-4 text-6xl font-bold tracking-tight sm:text-7xl">
          <GradientText>A4ui</GradientText>
        </h1>
        <p class="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          An accessible design system for SolidJS — glass surfaces, runtime themes, motion, charts and 1500+
          icons.
        </p>
      </div>

      <div class="grid w-full gap-5 sm:grid-cols-3">
        <Card glass glow class="p-6">
          <p class="mb-4 text-sm font-semibold text-muted-foreground">Traffic by channel</p>
          <div class="flex justify-center">
            <DonutChart
              data={[
                { label: 'Direct', value: 42, tone: 'primary' },
                { label: 'Search', value: 28, tone: 'accent' },
                { label: 'Social', value: 18, tone: 'success' },
                { label: 'Referral', value: 12, tone: 'warning' },
              ]}
            />
          </div>
        </Card>

        <Card glass class="flex flex-col gap-5 p-6">
          <Stat label="Revenue" value={48250} tone="primary" format={(n) => `$${n.toLocaleString()}`} />
          <Stat label="Active users" value={9312} tone="success" format={(n) => n.toLocaleString()} />
          <div>
            <p class="mb-2 text-xs font-medium text-muted-foreground">Last 10 days</p>
            <Sparkline data={[4, 8, 5, 9, 7, 12, 10, 14, 11, 16]} width={220} height={44} area />
          </div>
        </Card>

        <Card glass class="flex flex-col items-center gap-5 p-6">
          <div class="flex items-center gap-4">
            <RingProgress value={78} />
            <RingProgress value={54} />
            <RingProgress value={92} />
          </div>
          <Rating value={4} readOnly />
          <div class="flex flex-wrap justify-center gap-2">
            <Badge tone="success">New</Badge>
            <Badge tone="warning">Beta</Badge>
            <Badge tone="info">a11y</Badge>
          </div>
          <Button variant="primary">Get started →</Button>
        </Card>
      </div>
    </div>
  )
}
