// Overlapping stack of avatars with a "+N" overflow counter past `max`.
import type { JSX } from 'solid-js'
import { For } from 'solid-js'

import { cn } from '../lib/cn'
import { Avatar } from './Avatar'

export interface AvatarGroupProps {
  avatars: { src?: string; fallback: string; alt?: string }[]
  /** Maximum number of avatars to render before collapsing the rest into `+N`. */
  max?: number
  class?: string
}

/**
 * Renders a row of overlapping {@link Avatar}s. When there are more avatars than
 * `max` (default 4), the remainder collapse into a trailing `+N` counter.
 *
 * @example
 * ```tsx
 * <AvatarGroup
 *   max={3}
 *   avatars={[
 *     { src: a.avatarUrl, alt: a.name, fallback: 'AA' },
 *     { src: b.avatarUrl, alt: b.name, fallback: 'BB' },
 *     { fallback: 'CC' },
 *     { fallback: 'DD' },
 *   ]}
 * />
 * ```
 */
export function AvatarGroup(props: AvatarGroupProps): JSX.Element {
  const max = () => props.max ?? 4
  const shown = () => props.avatars.slice(0, max())
  const overflow = () => props.avatars.length - shown().length

  return (
    <div class={cn('flex items-center', props.class)}>
      <For each={shown()}>
        {(avatar, index) => (
          <div class={cn('ring-2 ring-background rounded-full', index() > 0 && '-ml-2')}>
            <Avatar src={avatar.src} alt={avatar.alt} fallback={avatar.fallback} />
          </div>
        )}
      </For>
      {overflow() > 0 && (
        <div class="-ml-2 ring-2 ring-background rounded-full">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
            +{overflow()}
          </span>
        </div>
      )}
    </div>
  )
}
