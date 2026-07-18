// Example template — Members / Team admin. Full-page composition dogfooding A4ui.
// Theme-agnostic: only semantic tokens/utilities, so it reskins under any theme.
import { For, createSignal, type JSX } from 'solid-js'
import { KeyRound, Shield, Users } from 'lucide-solid'

import {
  Affix,
  Anchor,
  Avatar,
  AvatarGroup,
  Badge,
  BottomNavigation,
  Button,
  List,
  TagInput,
  Transfer,
  type BadgeTone,
} from '../../src'

type Member = { name: string; role: string; status: string; tone: BadgeTone }

const members: Member[] = [
  { name: 'Marina Vega', role: 'Engineering Lead', status: 'Active', tone: 'success' },
  { name: 'Theo Nakamura', role: 'Product Designer', status: 'Active', tone: 'success' },
  { name: 'Priya Anand', role: 'Backend Engineer', status: 'Away', tone: 'warning' },
  { name: 'Lucas Moreau', role: 'QA Analyst', status: 'Invited', tone: 'info' },
  { name: 'Sofia Rossi', role: 'Data Scientist', status: 'Offline', tone: 'neutral' },
]

const people = [
  { value: 'marina', label: 'Marina Vega' },
  { value: 'theo', label: 'Theo Nakamura' },
  { value: 'priya', label: 'Priya Anand' },
  { value: 'lucas', label: 'Lucas Moreau' },
  { value: 'sofia', label: 'Sofia Rossi' },
  { value: 'noah', label: 'Noah Fischer' },
  { value: 'amara', label: 'Amara Okoye' },
]

const initials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export default function Members(): JSX.Element {
  const [roles, setRoles] = createSignal<string[]>(['admin', 'editor'])
  const [projectMembers, setProjectMembers] = createSignal<string[]>(['marina', 'theo'])
  const [tab, setTab] = createSignal('members')

  return (
    <div class="mx-auto max-w-5xl py-8">
      <header class="mb-6 flex flex-col gap-1">
        <h1 class="text-2xl font-bold tracking-tight">Team</h1>
        <p class="text-sm text-muted-foreground">
          Manage members, assign roles, and control who has access to the project.
        </p>
      </header>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_12rem]">
        {/* Left column — the actual admin sections */}
        <div class="min-w-0 space-y-12">
          <section id="members" class="scroll-mt-24 space-y-4">
            <div class="flex items-center justify-between gap-4">
              <h2 class="text-lg font-semibold">Members</h2>
              <AvatarGroup
                max={4}
                avatars={members.map((m) => ({ fallback: initials(m.name), alt: m.name }))}
              />
            </div>
            <List
              items={members.map((m) => ({
                title: m.name,
                description: m.role,
                avatar: <Avatar fallback={initials(m.name)} alt={m.name} />,
                meta: <Badge tone={m.tone}>{m.status}</Badge>,
                actions: (
                  <Button variant="outline" class="px-2 py-1 text-xs">
                    Manage
                  </Button>
                ),
              }))}
            />
          </section>

          <section id="roles" class="scroll-mt-24 space-y-4">
            <div>
              <h2 class="text-lg font-semibold">Roles</h2>
              <p class="text-sm text-muted-foreground">Assign role tags applied across the team.</p>
            </div>
            <TagInput value={roles()} onChange={setRoles} placeholder="Add a role…" />
            <p class="text-xs text-muted-foreground">
              {roles().length} role{roles().length === 1 ? '' : 's'} assigned.
            </p>
          </section>

          <section id="access" class="scroll-mt-24 space-y-4">
            <div>
              <h2 class="text-lg font-semibold">Access</h2>
              <p class="text-sm text-muted-foreground">
                Move people between the available pool and the project.
              </p>
            </div>
            <Transfer
              items={people}
              selected={projectMembers()}
              onChange={setProjectMembers}
              titles={['Available', 'Project members']}
            />
          </section>

          {/* Mobile-view simulation */}
          <section class="space-y-3">
            <h2 class="text-lg font-semibold">Mobile view</h2>
            <div class="mx-auto max-w-sm overflow-hidden rounded-xl border border-border">
              <div class="grid h-40 place-items-center bg-muted/40 text-sm text-muted-foreground">
                <For each={[tab()]}>{(t) => <span>Viewing: {t}</span>}</For>
              </div>
              <BottomNavigation
                value={tab()}
                onChange={setTab}
                items={[
                  { value: 'members', label: 'Members', icon: <Users class="h-5 w-5" /> },
                  { value: 'roles', label: 'Roles', icon: <Shield class="h-5 w-5" /> },
                  { value: 'access', label: 'Access', icon: <KeyRound class="h-5 w-5" /> },
                ]}
              />
            </div>
          </section>
        </div>

        {/* Right column — sticky table-of-contents nav */}
        <div class="hidden lg:block">
          <Affix offsetTop={80}>
            <nav class="w-48">
              <p class="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                On this page
              </p>
              <Anchor
                items={[
                  { id: 'members', label: 'Members' },
                  { id: 'roles', label: 'Roles' },
                  { id: 'access', label: 'Access' },
                ]}
              />
            </nav>
          </Affix>
        </div>
      </div>
    </div>
  )
}
