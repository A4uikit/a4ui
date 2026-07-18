// User avatar on Kobalte's Image primitive — shows the image or initials fallback.
import { Image as KImage } from '@kobalte/core/image'
import type { JSX } from 'solid-js'

import { cn } from '../lib/cn'

interface AvatarProps {
  /** Image URL. If it fails to load (or is omitted), `fallback` is shown instead. */
  src?: string
  alt?: string
  /** Text shown when there is no image or it fails to load (typically initials). */
  fallback: string
  class?: string
}

/**
 * Circular user avatar built on Kobalte's `Image` primitive; automatically
 * falls back to initials/text when the image is missing or fails to load.
 *
 * @example
 * ```tsx
 * <Avatar src={user.avatarUrl} alt={user.name} fallback="JD" />
 * ```
 */
export function Avatar(props: AvatarProps): JSX.Element {
  return (
    <KImage class={cn('inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted', props.class)}>
      <KImage.Img src={props.src} alt={props.alt} class="h-full w-full object-cover" />
      <KImage.Fallback class="grid h-full w-full place-items-center text-xs font-medium text-muted-foreground">
        {props.fallback}
      </KImage.Fallback>
    </KImage>
  )
}
