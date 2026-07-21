// Example template — Finance dashboard. Composes the finance components
// (BalanceCard, KpiBlock, TransactionFeed, MoneyActionButton) with a SideRail.
// Theme-agnostic: semantic tokens only. Fictional data.
import { CreditCard, Home, PieChart, Receipt, Settings } from 'lucide-solid'
import { createSignal, type JSX } from 'solid-js'

import { BalanceCard, Badge, KpiBlock, MoneyActionButton, SideRail, TransactionFeed } from '../../src'

const TXNS = [
  { id: '1', title: 'Northwind Traders', subtitle: 'Invoice #2041', amount: 4200, date: '2026-07-18' },
  { id: '2', title: 'Cloud Hosting', subtitle: 'Monthly plan', amount: -129.0, date: '2026-07-18' },
  { id: '3', title: 'Aurora Design Co.', subtitle: 'Retainer', amount: 1800, date: '2026-07-17' },
  { id: '4', title: 'Payroll', subtitle: '4 contractors', amount: -6240.5, date: '2026-07-16' },
  { id: '5', title: 'Meridian LLC', subtitle: 'Refund', amount: 74.25, date: '2026-07-16' },
  { id: '6', title: 'Office lease', subtitle: 'July', amount: -2100, date: '2026-07-15' },
]

const SPARK = (points: string, tone: 'up' | 'down'): JSX.Element => (
  <svg
    viewBox="0 0 100 24"
    class={tone === 'up' ? 'h-6 w-full text-primary/70' : 'h-6 w-full text-muted-foreground'}
    aria-hidden="true"
  >
    <polyline points={points} fill="none" stroke="currentColor" stroke-width="2" />
  </svg>
)

export default function Finance(): JSX.Element {
  const [section, setSection] = createSignal('overview')

  return (
    <div class="mx-auto flex max-w-6xl items-start gap-6 py-6">
      <SideRail
        class="sticky top-6 shrink-0 rounded-xl"
        value={section()}
        onChange={setSection}
        items={[
          { value: 'overview', label: 'Overview', icon: <Home class="h-5 w-5" /> },
          { value: 'cards', label: 'Cards', icon: <CreditCard class="h-5 w-5" /> },
          {
            value: 'invoices',
            label: 'Invoices',
            icon: <Receipt class="h-5 w-5" />,
            badge: <Badge tone="info">2</Badge>,
          },
          { value: 'reports', label: 'Reports', icon: <PieChart class="h-5 w-5" /> },
          { value: 'settings', label: 'Settings', icon: <Settings class="h-5 w-5" /> },
        ]}
      />

      <div class="min-w-0 flex-1 space-y-6">
        <header class="flex flex-wrap items-end justify-between gap-4">
          <h1 class="text-2xl font-bold tracking-tight">Treasury</h1>
          <div class="flex gap-2">
            <MoneyActionButton kind="send" onClick={() => {}}>
              Send
            </MoneyActionButton>
            <MoneyActionButton kind="request" onClick={() => {}}>
              Request
            </MoneyActionButton>
          </div>
        </header>

        <div class="grid gap-4 md:grid-cols-3">
          <BalanceCard
            label="Total balance"
            amount={284920.44}
            delta={0.042}
            sub={<span class="text-xs text-muted-foreground">Operating · •••• 4821</span>}
          />
          <KpiBlock
            label="Inflow (30d)"
            value="$52,140"
            delta={0.128}
            chart={SPARK('0,18 15,15 30,17 45,10 60,12 75,5 90,7 100,3', 'up')}
          />
          <KpiBlock
            label="Burn (30d)"
            value="$38,610"
            delta={-0.041}
            chart={SPARK('0,6 15,8 30,7 45,11 60,13 75,15 90,18 100,20', 'down')}
          />
        </div>

        <div class="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section>
            <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Recent activity
            </h2>
            <div class="rounded-xl border border-border bg-card p-2">
              <TransactionFeed transactions={TXNS} groupByDate />
            </div>
          </section>
          <aside class="space-y-4">
            <BalanceCard
              label="Reserve"
              amount={95000}
              sub={<span class="text-xs text-muted-foreground">Savings · 4.1% APY</span>}
            />
            <KpiBlock label="Runway" value="14 mo" delta={0.02} />
            <div class="space-y-3 rounded-xl border border-border bg-card p-4">
              <p class="text-sm font-semibold text-foreground">Quick actions</p>
              <div class="flex flex-col gap-2">
                <MoneyActionButton kind="pay" class="w-full justify-center" onClick={() => {}}>
                  Pay a bill
                </MoneyActionButton>
                <MoneyActionButton kind="withdraw" class="w-full justify-center" onClick={() => {}}>
                  Withdraw
                </MoneyActionButton>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
