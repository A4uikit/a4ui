// Multiplayer presence: a stacked avatar group (same overlap idiom as
// AvatarGroup) of active users with an online dot, plus optional data-driven
// remote cursors positioned within the caller's own relative canvas wrapper.
// Distinct from the decorative FollowingPointer, which follows the LOCAL
// pointer — these render OTHER users' server-driven positions.
import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Avatar } from './Avatar'

/** A user currently present/active in a collaborative session. */
export interface PresenceUser {
  id: string
  name: string
  avatar?: string
  /** Accent for this user's remote cursor label. Falls back to the primary token. */
  color?: string
}

/** A remote user's pointer position, as fractions of the shared canvas. */
export interface RemoteCursor {
  userId: string
  /** 0..1 fraction of the container's width. */
  x: number
  /** 0..1 fraction of the container's height. */
  y: number
}

export interface PresenceAvatarsProps {
  users: PresenceUser[]
  /** Max avatars shown before collapsing the rest into `+N`. @default 4 */
  max?: number
  /**
   * Remote cursors to render. Positioned absolutely against the nearest
   * `relative` ancestor, so the caller wraps its canvas/surface with
   * `class="relative"` for the cursors to anchor to — this component itself
   * does not create that positioning context.
   */
  cursors?: RemoteCursor[]
  class?: string
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

/**
 * Stacked avatar group of users active in a collaborative session, each with
 * a small online dot and a name tooltip; overflow past `max` (default 4)
 * collapses into a trailing `+N` chip, mirroring {@link AvatarGroup}. When
 * `cursors` is given, also renders labeled remote cursors — a small arrow
 * plus a name chip tinted with the user's `color` — positioned at `x`/`y`
 * fractions of the nearest `relative` ancestor and animated smoothly as
 * positions update.
 *
 * @example
 * ```tsx
 * <div class="relative h-64 w-full overflow-hidden rounded-lg border">
 *   <PresenceAvatars
 *     class="absolute right-3 top-3"
 *     users={[
 *       { id: 'u1', name: 'Ada Lovelace' },
 *       { id: 'u2', name: 'Grace Hopper', color: 'hsl(280 80% 60%)' },
 *     ]}
 *     cursors={[{ userId: 'u2', x: 0.42, y: 0.6 }]}
 *   />
 * </div>
 * ```
 */
export function PresenceAvatars(props: PresenceAvatarsProps): JSX.Element {
  const max = () => props.max ?? 4
  const shown = () => props.users.slice(0, max())
  const overflow = () => props.users.length - shown().length
  const cursorUser = (userId: string) => props.users.find((user) => user.id === userId)

  return (
    <>
      <div class={cn('flex items-center', props.class)}>
        <For each={shown()}>
          {(user, index) => (
            <div
              class={cn('relative rounded-full ring-2 ring-background', index() > 0 && '-ml-2')}
              title={user.name}
            >
              <Avatar src={user.avatar} alt={user.name} fallback={initials(user.name)} />
              <span
                aria-hidden="true"
                class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background"
              />
            </div>
          )}
        </For>
        <Show when={overflow() > 0}>
          <div class="-ml-2 rounded-full ring-2 ring-background">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
              +{overflow()}
            </span>
          </div>
        </Show>
      </div>
      <Show when={props.cursors && props.cursors.length > 0}>
        <div class="pointer-events-none absolute inset-0 z-50 overflow-hidden">
          <For each={props.cursors}>
            {(cursor) => {
              const user = () => cursorUser(cursor.userId)
              const color = () => user()?.color ?? 'hsl(var(--primary))'
              return (
                <Show when={user()}>
                  <div
                    class="absolute flex -translate-x-0.5 -translate-y-0.5 items-center transition-[left,top] duration-150 ease-out will-change-[left,top]"
                    style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" class="drop-shadow">
                      <path
                        d="M2 2 L18 9 L10 11 L8 18 Z"
                        fill={color()}
                        stroke="hsl(var(--background))"
                        stroke-width="1"
                      />
                    </svg>
                    <span
                      class="ml-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium text-white shadow"
                      style={{ 'background-color': color() }}
                    >
                      {user()!.name}
                    </span>
                  </div>
                </Show>
              )
            }}
          </For>
        </div>
      </Show>
    </>
  )
}
