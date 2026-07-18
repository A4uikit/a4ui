// Example template — Profile. Full-page composition dogfooding A4ui components.
// Theme-agnostic: only semantic tokens/utilities, so it reskins under any theme.
import { createSignal, For, type JSX } from 'solid-js'

import { Avatar, Badge, Button, Card, CardContent, Progress, Separator, Stat, Tabs } from '../../src'

const POSTS = [
  {
    title: 'Shipping a design system that survives every theme',
    excerpt:
      'The trick is never reaching for a palette color. Semantic tokens do the reskinning for you — here is how we kept 40 components honest.',
    time: '2h ago',
    tag: 'Engineering',
  },
  {
    title: 'A weekend rewriting our animation layer',
    excerpt:
      'Motion-one plus a reduced-motion guard got us buttery count-ups without punishing anyone who asked the OS to calm down.',
    time: '1d ago',
    tag: 'Notes',
  },
  {
    title: 'Why I stopped hand-rolling focus states',
    excerpt:
      'Kobalte primitives handle the boring accessibility parts, so we get to spend the budget on the parts people actually see.',
    time: '4d ago',
    tag: 'Accessibility',
  },
]

const SKILLS = [
  { label: 'SolidJS', value: 92 },
  { label: 'Design systems', value: 84 },
  { label: 'CSS architecture', value: 78 },
]

const ACTIVITY = [
  { action: 'Published a new post', target: 'Shipping a design system', time: '2h ago' },
  { action: 'Earned the', target: 'Pro contributor badge', time: 'Yesterday' },
  { action: 'Starred', target: 'a4ui/core on GitHub', time: '3d ago' },
  { action: 'Followed', target: '@kobalte', time: '5d ago' },
]

const TABS = [
  { value: 'posts', label: 'Posts' },
  { value: 'about', label: 'About' },
  { value: 'activity', label: 'Activity' },
]

export default function Profile(): JSX.Element {
  const [tab, setTab] = createSignal('posts')
  const [following, setFollowing] = createSignal(false)

  return (
    <div class="mx-auto max-w-3xl space-y-6 py-8">
      {/* Profile header */}
      <Card class="overflow-hidden">
        <div
          class="h-20 w-full bg-muted bg-cover bg-center"
          style={{ 'background-image': 'url(https://picsum.photos/seed/a4ui-profile-cover/1200/300)' }}
        />
        <CardContent class="p-6">
          <div class="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div class="h-24 w-24 shrink-0 overflow-hidden rounded-full ring-4 ring-card">
                <Avatar
                  src="https://placedog.net/200/200?id=7"
                  fallback="AR"
                  alt="Alfredo Rivera"
                  class="h-24 w-24 text-xl"
                />
              </div>
              <div class="space-y-1 pb-1">
                <div class="flex items-center gap-2">
                  <h1 class="text-2xl font-bold tracking-tight text-foreground">Alfredo Rivera</h1>
                  <Badge tone="success">Pro</Badge>
                </div>
                <p class="text-sm text-muted-foreground">@alfredo · San Luis Potosí, MX</p>
              </div>
            </div>
            <div class="flex gap-2">
              <Button
                variant={following() ? 'outline' : 'primary'}
                onClick={() => setFollowing(!following())}
              >
                {following() ? 'Following' : 'Follow'}
              </Button>
              <Button variant="secondary">Message</Button>
            </div>
          </div>
          <p class="mt-4 max-w-prose text-sm text-muted-foreground">
            Front-end engineer building theme-agnostic component libraries. I care about crisp motion,
            accessible defaults, and CSS that reads like prose.
          </p>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Followers" value={12480} format={(n) => n.toLocaleString()} tone="primary" />
        <Stat label="Following" value={318} tone="neutral" />
        <Stat label="Posts" value={207} tone="success" />
      </div>

      {/* Tabs control */}
      <Tabs items={TABS} value={tab()} onChange={setTab} />

      {/* Panels driven by the tab signal */}
      {tab() === 'posts' && (
        <div class="space-y-4">
          <For each={POSTS}>
            {(post) => (
              <Card>
                <CardContent class="space-y-2 p-5">
                  <div class="flex items-center justify-between gap-3">
                    <Badge tone="info">{post.tag}</Badge>
                    <span class="text-xs text-muted-foreground">{post.time}</span>
                  </div>
                  <h3 class="text-base font-semibold text-foreground">{post.title}</h3>
                  <p class="text-sm text-muted-foreground">{post.excerpt}</p>
                  <div class="flex gap-4 pt-1 text-xs text-muted-foreground">
                    <span>♥ 128</span>
                    <span>↺ 24</span>
                    <span>💬 16</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </For>
        </div>
      )}

      {tab() === 'about' && (
        <Card>
          <CardContent class="space-y-5 p-6">
            <div class="space-y-3">
              <h3 class="text-sm font-semibold text-foreground">Details</h3>
              <dl class="grid grid-cols-1 gap-y-2 text-sm sm:grid-cols-2">
                <div class="flex justify-between gap-4 sm:block">
                  <dt class="text-muted-foreground">Role</dt>
                  <dd class="font-medium text-foreground">Front-end Engineer</dd>
                </div>
                <div class="flex justify-between gap-4 sm:block">
                  <dt class="text-muted-foreground">Company</dt>
                  <dd class="font-medium text-foreground">Sonora Precision</dd>
                </div>
                <div class="flex justify-between gap-4 sm:block">
                  <dt class="text-muted-foreground">Joined</dt>
                  <dd class="font-medium text-foreground">March 2021</dd>
                </div>
                <div class="flex justify-between gap-4 sm:block">
                  <dt class="text-muted-foreground">Website</dt>
                  <dd class="font-medium text-primary">a4ui.dev</dd>
                </div>
              </dl>
            </div>
            <Separator />
            <div class="space-y-4">
              <h3 class="text-sm font-semibold text-foreground">Skills</h3>
              <For each={SKILLS}>{(skill) => <Progress value={skill.value} label={skill.label} />}</For>
            </div>
          </CardContent>
        </Card>
      )}

      {tab() === 'activity' && (
        <Card>
          <CardContent class="p-6">
            <ol class="space-y-5">
              <For each={ACTIVITY}>
                {(item, i) => (
                  <li class="flex gap-4">
                    <div class="flex flex-col items-center">
                      <span class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                      {i() < ACTIVITY.length - 1 && <span class="mt-1 w-px flex-1 bg-border" />}
                    </div>
                    <div class="-mt-0.5 space-y-0.5 pb-1">
                      <p class="text-sm text-foreground">
                        {item.action} <span class="font-medium">{item.target}</span>
                      </p>
                      <p class="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </li>
                )}
              </For>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
