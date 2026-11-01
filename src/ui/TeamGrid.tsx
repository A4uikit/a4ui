// TeamGrid — the people behind a business: photo, name, role and a short bio.
import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Avatar } from './Avatar'
import { Card } from './Card'
import { initials, SectionHeading } from './internal/sectionKit'

/** One person rendered by {@link TeamGrid}. */
export interface TeamMember {
  name: string
  role: string
  /** Photo URL. Falls back to the name's initials. */
  photo?: string
  /** One or two sentences about the person. */
  bio?: string
}

export interface TeamGridProps {
  title?: string
  subtitle?: string
  members: TeamMember[]
  /** Columns on wide screens. Defaults to `3`. */
  columns?: 2 | 3 | 4
  /** Anchor id for in-page navigation. */
  id?: string
  class?: string
}

const COLS: Record<2 | 3 | 4, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

/**
 * Team section: a responsive grid of glass cards with each person's photo (or
 * initials), name, role and an optional short bio.
 *
 * @example
 * ```tsx
 * <TeamGrid
 *   title="Our team"
 *   members={[{ name: 'Ana Ruiz', role: 'Founder', bio: 'Ten years building for small shops.' }]}
 * />
 * ```
 */
export function TeamGrid(props: TeamGridProps): JSX.Element {
  return (
    <section
      id={props.id}
      class={cn('mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-20', props.class)}
    >
      <SectionHeading title={props.title} subtitle={props.subtitle} />
      <ul class={cn('grid gap-6', COLS[props.columns ?? 3])}>
        <For each={props.members}>
          {(member) => (
            <li class="flex">
              <Card glass class="flex w-full flex-col items-center gap-3 p-6 text-center">
                <Avatar
                  src={member.photo}
                  alt=""
                  fallback={initials(member.name)}
                  class="h-24 w-24 text-lg"
                />
                <div>
                  <h3 class="text-base font-semibold text-foreground">{member.name}</h3>
                  <p class="text-sm text-primary">{member.role}</p>
                </div>
                <Show when={member.bio}>
                  <p class="text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
                </Show>
              </Card>
            </li>
          )}
        </For>
      </ul>
    </section>
  )
}
