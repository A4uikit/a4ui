// Example template — Admin. Full-page composition dogfooding A4ui components.
// Theme-agnostic: only semantic tokens/utilities, so it reskins under any theme.
import type { JSX } from 'solid-js'
import { For, createSignal } from 'solid-js'

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  MultiSelect,
  type MultiSelectOption,
  Separator,
  Stat,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from '../../src'
import { BarChart, DonutChart, Sparkline, type BarDatum, type DonutSegment } from '../../src/charts'

const segmentOptions: MultiSelectOption[] = [
  { value: 'na', label: 'North America' },
  { value: 'emea', label: 'EMEA' },
  { value: 'apac', label: 'APAC' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'smb', label: 'SMB' },
]

const activeUsersTrend = [820, 910, 880, 960, 1040, 1010, 1120]
const revenueTrend = [42, 45, 41, 48, 52, 50, 57]
const churnTrend = [3.1, 2.9, 3.4, 2.8, 2.5, 2.7, 2.3]
const ticketsTrend = [58, 64, 60, 71, 66, 62, 55]

const trafficSources: DonutSegment[] = [
  { label: 'Organic', value: 48, tone: 'primary' },
  { label: 'Referral', value: 26, tone: 'accent' },
  { label: 'Direct', value: 18, tone: 'emit' },
  { label: 'Social', value: 8, tone: 'received' },
]

const weeklySignups: BarDatum[] = [
  { label: 'Mon', value: 24 },
  { label: 'Tue', value: 31 },
  { label: 'Wed', value: 28 },
  { label: 'Thu', value: 40 },
  { label: 'Fri', value: 36 },
  { label: 'Sat', value: 18 },
  { label: 'Sun', value: 15 },
]

const users: {
  name: string
  email: string
  role: string
  roleTone: 'neutral' | 'info' | 'success'
  status: string
  statusTone: 'success' | 'warning' | 'danger'
}[] = [
  {
    name: 'Elena Marsh',
    email: 'elena.marsh@example.com',
    role: 'Owner',
    roleTone: 'success',
    status: 'Active',
    statusTone: 'success',
  },
  {
    name: 'Diego Torres',
    email: 'diego.torres@example.com',
    role: 'Admin',
    roleTone: 'info',
    status: 'Active',
    statusTone: 'success',
  },
  {
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    role: 'Member',
    roleTone: 'neutral',
    status: 'Invited',
    statusTone: 'warning',
  },
  {
    name: 'Sam Okafor',
    email: 'sam.okafor@example.com',
    role: 'Member',
    roleTone: 'neutral',
    status: 'Active',
    statusTone: 'success',
  },
  {
    name: 'Yuki Tanaka',
    email: 'yuki.tanaka@example.com',
    role: 'Admin',
    roleTone: 'info',
    status: 'Suspended',
    statusTone: 'danger',
  },
]

export default function Admin(): JSX.Element {
  const [segments, setSegments] = createSignal<string[]>(['na', 'enterprise'])

  return (
    <div class="mx-auto max-w-7xl space-y-6 py-8">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex flex-col gap-1">
          <h1 class="text-2xl font-bold tracking-tight">Admin</h1>
          <p class="text-sm text-muted-foreground">
            Workspace health, growth, and account management at a glance.
          </p>
        </div>
        <MultiSelect
          options={segmentOptions}
          value={segments()}
          onChange={setSegments}
          placeholder="Filter region / segment…"
          class="w-full sm:w-64"
        />
      </header>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card class="p-4">
          <Stat label="Active users" value={1120} tone="primary" format={(n) => n.toLocaleString()} />
          <Sparkline data={activeUsersTrend} tone="primary" area class="mt-3 w-full" />
        </Card>
        <Card class="p-4">
          <Stat label="MRR" value={57200} tone="success" format={(n) => `$${(n / 1000).toFixed(1)}k`} />
          <Sparkline data={revenueTrend} tone="accent" area class="mt-3 w-full" />
        </Card>
        <Card class="p-4">
          <Stat label="Churn rate" value={2.3} tone="danger" format={(n) => `${n.toFixed(1)}%`} />
          <Sparkline data={churnTrend} tone="destructive" class="mt-3 w-full" />
        </Card>
        <Card class="p-4">
          <Stat label="Open tickets" value={55} tone="neutral" format={(n) => n.toLocaleString()} />
          <Sparkline data={ticketsTrend} tone="primary" class="mt-3 w-full" />
        </Card>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Traffic sources</CardTitle>
          </CardHeader>
          <CardContent class="flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
            <DonutChart data={trafficSources} />
            <ul class="w-full max-w-48 space-y-2">
              <For each={trafficSources}>
                {(segment) => (
                  <li class="flex items-center justify-between gap-2 text-sm">
                    <span class="flex items-center gap-2 text-muted-foreground">
                      <span
                        class="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          'background-color': `hsl(var(--${
                            segment.tone === 'primary' || segment.tone === 'accent'
                              ? segment.tone
                              : `data-${segment.tone}`
                          }))`,
                        }}
                      />
                      {segment.label}
                    </span>
                    <span class="font-medium tabular-nums text-foreground">{segment.value}%</span>
                  </li>
                )}
              </For>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly signups</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={weeklySignups} tone="accent" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent users</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Name</TableHeadCell>
                  <TableHeadCell>Email</TableHeadCell>
                  <TableHeadCell>Role</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <For each={users}>
                  {(user) => (
                    <TableRow>
                      <TableCell class="font-medium text-foreground">{user.name}</TableCell>
                      <TableCell class="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge tone={user.roleTone}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge tone={user.statusTone}>{user.status}</Badge>
                      </TableCell>
                    </TableRow>
                  )}
                </For>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Separator />
    </div>
  )
}
