// Example template — Dashboard. Full-page composition dogfooding A4ui components.
// Theme-agnostic: only semantic tokens/utilities, so it reskins under any theme.
import { For, type JSX } from 'solid-js'

import {
  Avatar,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Separator,
  Stat,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from '../../src'

type OrderTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const orders: { id: string; customer: string; status: string; tone: OrderTone; amount: string }[] = [
  { id: '#A-1042', customer: 'Marina Vega', status: 'Paid', tone: 'success', amount: '$1,280.00' },
  { id: '#A-1041', customer: 'Theo Nakamura', status: 'Pending', tone: 'warning', amount: '$640.50' },
  { id: '#A-1040', customer: 'Priya Anand', status: 'Refunded', tone: 'danger', amount: '$210.00' },
  { id: '#A-1039', customer: 'Lucas Moreau', status: 'Paid', tone: 'success', amount: '$3,015.75' },
  { id: '#A-1038', customer: 'Sofia Rossi', status: 'Shipped', tone: 'info', amount: '$489.20' },
]

const goals: { label: string; value: number }[] = [
  { label: 'Monthly revenue target', value: 78 },
  { label: 'New signups', value: 54 },
  { label: 'Support SLA', value: 92 },
]

const activity: { name: string; action: string; when: string }[] = [
  { name: 'Marina Vega', action: 'placed a new order', when: '2m ago' },
  { name: 'Theo Nakamura', action: 'upgraded to Pro', when: '18m ago' },
  { name: 'Priya Anand', action: 'requested a refund', when: '1h ago' },
  { name: 'Lucas Moreau', action: 'left a 5-star review', when: '3h ago' },
]

const initials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export default function Dashboard(): JSX.Element {
  return (
    <div class="mx-auto max-w-5xl space-y-6 py-8">
      <header class="flex flex-col gap-1">
        <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p class="text-sm text-muted-foreground">Welcome back — here's how your store is performing today.</p>
      </header>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card class="p-4">
          <Stat label="Revenue" value={48250} tone="primary" format={(n) => `$${n.toLocaleString()}`} />
          <p class="mt-2 text-xs text-muted-foreground">+12.4% vs last month</p>
        </Card>
        <Card class="p-4">
          <Stat label="Active users" value={9312} tone="success" format={(n) => n.toLocaleString()} />
          <p class="mt-2 text-xs text-muted-foreground">+3.1% vs last month</p>
        </Card>
        <Card class="p-4">
          <Stat label="Orders" value={1876} tone="neutral" format={(n) => n.toLocaleString()} />
          <p class="mt-2 text-xs text-muted-foreground">+8.7% vs last month</p>
        </Card>
        <Card class="p-4">
          <Stat label="Churn" value={2.4} tone="danger" format={(n) => `${n.toFixed(1)}%`} />
          <p class="mt-2 text-xs text-muted-foreground">-0.5% vs last month</p>
        </Card>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card class="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Order</TableHeadCell>
                  <TableHeadCell>Customer</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Amount</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <For each={orders}>
                  {(order) => (
                    <TableRow>
                      <TableCell class="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>
                        <Badge tone={order.tone}>{order.status}</Badge>
                      </TableCell>
                      <TableCell class="font-medium">{order.amount}</TableCell>
                    </TableRow>
                  )}
                </For>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle>Goals & activity</CardTitle>
          </CardHeader>
          <CardContent class="space-y-5">
            <div class="space-y-4">
              <For each={goals}>{(goal) => <Progress value={goal.value} label={goal.label} />}</For>
            </div>

            <Separator />

            <div class="space-y-3">
              <For each={activity}>
                {(item) => (
                  <div class="flex items-center gap-3">
                    <Avatar fallback={initials(item.name)} />
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm">
                        <span class="font-medium">{item.name}</span>{' '}
                        <span class="text-muted-foreground">{item.action}</span>
                      </p>
                    </div>
                    <span class="shrink-0 text-xs text-muted-foreground">{item.when}</span>
                  </div>
                )}
              </For>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
