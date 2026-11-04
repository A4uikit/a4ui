import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dropdown,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Input,
  Modal,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  Tabs,
  ThemeToggle,
} from '@a4ui/core'
import { BarChart, Sparkline } from '@a4ui/core/charts'
import { createSignal, For } from 'solid-js'

const VARIANTS = ['primary', 'secondary', 'outline', 'ghost'] as const
const TONES = ['neutral', 'success', 'warning', 'danger', 'info'] as const

export function App() {
  const [name, setName] = createSignal('')
  const [password, setPassword] = createSignal('abc')
  const [tab, setTab] = createSignal('general')
  const [open, setOpen] = createSignal(false)

  return (
    <main class="mx-auto grid max-w-4xl gap-8 p-6">
      <header class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">A4ui on Tailwind 4</h1>
        <ThemeToggle />
      </header>

      <section id="buttons" class="flex flex-wrap gap-3">
        <For each={VARIANTS}>{(variant) => <Button variant={variant}>{variant}</Button>}</For>
        <Button disabled>disabled</Button>
      </section>

      <section id="badges" class="flex flex-wrap gap-2">
        <For each={TONES}>{(tone) => <Badge tone={tone}>{tone}</Badge>}</For>
      </section>

      <section id="light-variant">
        <p class="bg-primary/15 text-emerald-300 light:text-emerald-700">
          Lighter text on dark, darker text on light.
        </p>
      </section>

      <section id="cards" class="grid gap-4 sm:grid-cols-2">
        <Card glass>
          <CardHeader>
            <CardTitle>Glass card</CardTitle>
          </CardHeader>
          <CardContent class="text-sm text-muted-foreground">Frosted surface with a border glow.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Plain card</CardTitle>
          </CardHeader>
          <CardContent class="text-sm text-muted-foreground">No frosted surface.</CardContent>
        </Card>
      </section>

      <section id="form" class="max-w-sm">
        <FieldSet>
          <FieldLegend>Profile</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel>Full name</FieldLabel>
              <Input value={name()} onInput={setName} placeholder="Ada Orbit" />
              <FieldDescription>As it appears on invoices.</FieldDescription>
            </Field>
            <Field invalid>
              <FieldLabel>Password</FieldLabel>
              <Input type="password" value={password()} onInput={setPassword} />
              <FieldError errors={['At least 8 characters', 'Include a number']} />
            </Field>
          </FieldGroup>
        </FieldSet>
      </section>

      <section id="tabs" class="max-w-md">
        <Tabs
          value={tab()}
          onChange={setTab}
          items={[
            { value: 'general', label: 'General', content: <p class="text-sm">General settings.</p> },
            { value: 'security', label: 'Security', content: <p class="text-sm">Password and access.</p> },
          ]}
        />
      </section>

      <section id="overlays" class="flex gap-3">
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal open={open()} onOpenChange={setOpen} variant="center" title="Confirm action">
          <p class="text-sm text-muted-foreground">Do you want to continue with this action?</p>
          <div class="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </div>
        </Modal>
        <Dropdown
          label="Actions"
          items={[
            { label: 'Edit', onSelect: () => {} },
            { label: 'Delete', onSelect: () => {}, destructive: true },
          ]}
        >
          <span class="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
            Actions
          </span>
        </Dropdown>
      </section>

      <section id="sidebar" class="relative h-72 overflow-hidden rounded-xl border border-border">
        <SidebarProvider>
          <Sidebar label="Navigation">
            <SidebarHeader>
              <span class="truncate text-sm font-bold">Orbit</span>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton active>Overview</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Reports</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <div class="flex-1 p-4 text-sm">Main content</div>
        </SidebarProvider>
      </section>

      <section id="charts" class="grid gap-4">
        <Sparkline data={[4, 8, 5, 9, 7, 12, 10, 14]} width={160} height={40} area />
        <BarChart
          data={[
            { label: 'Mon', value: 12 },
            { label: 'Tue', value: 19 },
            { label: 'Wed', value: 8 },
          ]}
        />
      </section>
    </main>
  )
}
