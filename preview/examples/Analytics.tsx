// Example template — Analytics. Full-page composition dogfooding A4ui components.
// Theme-agnostic: only semantic tokens/utilities, so it reskins under any theme.
import { Download, Printer, Share2 } from 'lucide-solid'
import { For, type JSX } from 'solid-js'

import {
  Avatar,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Descriptions,
  List,
  Progress,
  RingProgress,
  SpeedDial,
  Stat,
  Timeline,
} from '../../src'

const goals: { label: string; value: number; caption: string }[] = [
  { label: 'Revenue', value: 78, caption: 'Monthly target' },
  { label: 'Signups', value: 54, caption: 'Quarter goal' },
  { label: 'Retention', value: 92, caption: 'SLA uptime' },
]

const channels: { label: string; value: number }[] = [
  { label: 'Organic search', value: 42 },
  { label: 'Direct', value: 28 },
  { label: 'Social', value: 18 },
  { label: 'Referral', value: 12 },
]

const events: {
  title: string
  description?: string
  time: string
  tone: 'default' | 'primary' | 'success' | 'danger'
}[] = [
  {
    title: 'Traffic spike detected',
    description: 'Campaign "Summer" drove +2.4k visits.',
    time: '2m ago',
    tone: 'primary',
  },
  {
    title: 'Conversion goal reached',
    description: 'Checkout funnel hit 5% for the day.',
    time: '46m ago',
    tone: 'success',
  },
  {
    title: 'New referral source',
    description: 'producthunt.com started sending traffic.',
    time: '2h ago',
    tone: 'default',
  },
  {
    title: 'Bounce rate rose',
    description: 'Landing /pricing above 60% threshold.',
    time: '5h ago',
    tone: 'danger',
  },
]

const topPages: { title: string; description: string; views: string }[] = [
  { title: '/home', description: 'Landing page', views: '18.2k' },
  { title: '/pricing', description: 'Plans & billing', views: '9.4k' },
  { title: '/blog/scaling-solidjs', description: 'Article', views: '6.1k' },
  { title: '/docs', description: 'Documentation', views: '4.8k' },
]

const referrers = ['google.com', 'twitter.com', 'producthunt.com', 'news.ycombinator.com']

const domainInitials = (host: string): string =>
  host
    .replace(/\.com$/, '')
    .slice(0, 2)
    .toUpperCase()

export default function Analytics(): JSX.Element {
  return (
    <div class="mx-auto max-w-5xl space-y-6 py-8">
      <header class="flex flex-col gap-1">
        <h1 class="text-2xl font-bold tracking-tight">Analytics</h1>
        <p class="text-sm text-muted-foreground">
          Traffic, engagement, and conversions for the last 30 days.
        </p>
      </header>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card class="p-4">
          <Stat label="Visitors" value={128400} tone="primary" format={(n) => n.toLocaleString()} />
          <p class="mt-2 text-xs text-muted-foreground">+14.2% vs prev. period</p>
        </Card>
        <Card class="p-4">
          <Stat label="Page views" value={342810} tone="neutral" format={(n) => n.toLocaleString()} />
          <p class="mt-2 text-xs text-muted-foreground">+9.8% vs prev. period</p>
        </Card>
        <Card class="p-4">
          <Stat label="Conversion" value={4.7} tone="success" format={(n) => `${n.toFixed(1)}%`} />
          <p class="mt-2 text-xs text-muted-foreground">+0.6pt vs prev. period</p>
        </Card>
        <Card class="p-4">
          <Stat label="Bounce rate" value={38.2} tone="danger" format={(n) => `${n.toFixed(1)}%`} />
          <p class="mt-2 text-xs text-muted-foreground">-1.3pt vs prev. period</p>
        </Card>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Goal completion</CardTitle>
          </CardHeader>
          <CardContent class="grid grid-cols-3 gap-2">
            <For each={goals}>
              {(goal) => (
                <div class="flex flex-col items-center gap-2 text-center">
                  <RingProgress value={goal.value} />
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-foreground">{goal.label}</p>
                    <p class="truncate text-xs text-muted-foreground">{goal.caption}</p>
                  </div>
                </div>
              )}
            </For>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic by channel</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <For each={channels}>{(channel) => <Progress value={channel.value} label={channel.label} />}</For>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle>Recent events</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline items={events} />
          </CardContent>
        </Card>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top pages</CardTitle>
          </CardHeader>
          <CardContent>
            <List
              items={topPages.map((page) => ({
                title: page.title,
                description: page.description,
                meta: (
                  <span class="font-medium text-foreground">
                    {page.views} <span class="text-muted-foreground">views</span>
                  </span>
                ),
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <List
              items={referrers.map((host, i) => ({
                title: host,
                description: 'Referral source',
                avatar: <Avatar fallback={domainInitials(host)} />,
                meta: <Badge tone={i === 0 ? 'success' : 'neutral'}>{`${(24 - i * 5).toString()}%`}</Badge>,
              }))}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Descriptions
            columns={2}
            items={[
              { label: 'Reporting period', value: 'Jun 18 – Jul 18, 2026' },
              { label: 'Status', value: <Badge tone="success">On track</Badge> },
              { label: 'Total sessions', value: '196,540' },
              { label: 'Avg. session', value: '3m 42s' },
              { label: 'New vs returning', value: '64% / 36%' },
              { label: 'Top device', value: <Badge tone="info">Mobile</Badge> },
            ]}
          />
        </CardContent>
      </Card>

      <SpeedDial
        actions={[
          { icon: <Download class="h-5 w-5" />, label: 'Export CSV', onClick: () => {} },
          { icon: <Share2 class="h-5 w-5" />, label: 'Share report', onClick: () => {} },
          { icon: <Printer class="h-5 w-5" />, label: 'Print', onClick: () => {} },
        ]}
      />
    </div>
  )
}
