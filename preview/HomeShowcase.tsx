// Live component panels for the Home page. Everything here is a real @a4ui/core
// component with working state, so the landing doubles as a demo. Lazy-loaded
// from Home.tsx to keep charts and forms off the critical path.
import { Search } from 'lucide-solid'
import { createSignal, For, type JSX } from 'solid-js'

import {
  activeTheme,
  Avatar,
  Badge,
  Button,
  Calendar,
  Card,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  KpiBlock,
  Message,
  MessageGroup,
  Progress,
  Switch,
  Tabs,
  themes,
} from '../src'
import { AreaChart, BarList } from '../src/charts'
import { chooseBaseTheme } from './themeStore'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
const VISITS = [38, 44, 41, 56, 62, 58, 71, 79, 92]
const SIGNUPS = [12, 18, 16, 24, 29, 27, 35, 41, 48]

/** Sample analytics dashboard shown beside the hero copy. */
export function HeroPanel(): JSX.Element {
  return (
    <Card glass glow class="space-y-4 p-4 sm:p-5" data-testid="home-hero-panel">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate font-semibold">Northwind analytics</p>
          <p class="truncate text-xs text-muted-foreground">Last 9 months</p>
        </div>
        <Badge tone="success" pulse>
          Live
        </Badge>
      </div>
      <div class="grid gap-3 sm:grid-cols-3">
        <KpiBlock label="Revenue" value="$48.2k" delta={0.124} />
        <KpiBlock label="Customers" value="1,284" delta={0.041} />
        <KpiBlock label="Refunds" value="23" delta={-0.06} />
      </div>
      <AreaChart
        height={190}
        series={[
          { key: 'visits', label: 'Visits' },
          { key: 'signups', label: 'Signups', color: 'accent' },
        ]}
        data={MONTHS.map((label, i) => ({ label, values: { visits: VISITS[i], signups: SIGNUPS[i] } }))}
      />
    </Card>
  )
}

function Panel(props: { title: string; href: string; class?: string; children: JSX.Element }): JSX.Element {
  return (
    <Card glass class={`flex min-w-0 flex-col gap-4 p-5 ${props.class ?? ''}`}>
      <div class="flex items-baseline justify-between gap-3">
        <h3 class="font-semibold">{props.title}</h3>
        <a
          href={props.href}
          class="shrink-0 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
          aria-label={`${props.title} documentation`}
        >
          Docs →
        </a>
      </div>
      {props.children}
    </Card>
  )
}

function FormPanel(): JSX.Element {
  const [name, setName] = createSignal('Rosa Medina')
  const [query, setQuery] = createSignal('')
  const [alerts, setAlerts] = createSignal(true)
  return (
    <Panel title="Forms" href="#/field" class="xl:col-span-4">
      <FieldGroup>
        <Field>
          <FieldLabel>Full name</FieldLabel>
          <Input value={name()} onInput={setName} />
          <FieldDescription>As it appears on invoices.</FieldDescription>
        </Field>
        <InputGroup>
          <InputGroupAddon>
            <Search class="h-4 w-4" aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            value={query()}
            onInput={setQuery}
            placeholder="Search customers"
            aria-label="Search customers"
          />
        </InputGroup>
        <Switch checked={alerts()} onChange={setAlerts} label="Email alerts" />
      </FieldGroup>
    </Panel>
  )
}

function CalendarPanel(): JSX.Element {
  const [day, setDay] = createSignal(new Date())
  return (
    <Panel title="Calendar" href="#/calendar" class="xl:col-span-4">
      <Calendar value={day()} onChange={setDay} class="mx-auto" />
    </Panel>
  )
}

function ChatPanel(): JSX.Element {
  return (
    <Panel title="Chat" href="#/message" class="md:col-span-2 xl:col-span-4">
      <div class="flex flex-1 flex-col justify-end gap-3">
        <Message role="user" author="Rosa" variant="tinted" align="end" timestamp="9:41">
          Can the invoice go out today?
        </Message>
        <MessageGroup
          author="Luis"
          avatar={<Avatar fallback="LO" class="h-8 w-8 text-xs" />}
          variant="secondary"
        >
          <Message role="assistant">Yes, it is ready.</Message>
          <Message role="assistant">Sending it before noon, I will copy you in.</Message>
        </MessageGroup>
        <Message role="system">Luis marked the invoice as sent</Message>
      </div>
    </Panel>
  )
}

function TabsPanel(): JSX.Element {
  const [tab, setTab] = createSignal('usage')
  return (
    <Panel title="Tabs and progress" href="#/tabs" class="xl:col-span-4">
      <Tabs
        value={tab()}
        onChange={setTab}
        items={[
          {
            value: 'usage',
            label: 'Usage',
            content: (
              <div class="space-y-4 pt-3">
                <Progress value={72} label="Storage" />
                <Progress value={38} label="Bandwidth" />
              </div>
            ),
          },
          {
            value: 'team',
            label: 'Team',
            content: (
              <div class="flex items-center gap-2 pt-3">
                <For each={['AR', 'LO', 'MK', 'JD']}>{(who) => <Avatar fallback={who} />}</For>
                <span class="text-sm text-muted-foreground">4 members</span>
              </div>
            ),
          },
        ]}
      />
    </Panel>
  )
}

function TrafficPanel(): JSX.Element {
  return (
    <Panel title="Charts" href="#/bar-list" class="xl:col-span-4">
      <BarList
        tone="accent"
        data={[
          { name: '/pricing', value: 842 },
          { name: '/docs', value: 531 },
          { name: '/blog', value: 317 },
          { name: '/contact', value: 164 },
        ]}
      />
    </Panel>
  )
}

function ThemesPanel(): JSX.Element {
  return (
    <Panel title="Themes" href="#/themes" class="xl:col-span-4">
      <p class="text-sm text-muted-foreground">Colors are tokens. Pick one and the whole page changes.</p>
      <div class="flex flex-wrap gap-2">
        <For each={themes}>
          {(theme) => (
            <Button
              variant={activeTheme().name === theme.name ? 'primary' : 'outline'}
              aria-pressed={activeTheme().name === theme.name}
              onClick={() => chooseBaseTheme(theme.name)}
            >
              <span aria-hidden="true" class="me-1.5">
                {theme.icon}
              </span>
              {theme.label}
            </Button>
          )}
        </For>
      </div>
    </Panel>
  )
}

/** Full-width mosaic of working components. */
export function ShowcaseGrid(): JSX.Element {
  return (
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-12" data-testid="home-showcase">
      <FormPanel />
      <CalendarPanel />
      <ChatPanel />
      <TabsPanel />
      <TrafficPanel />
      <ThemesPanel />
    </div>
  )
}
