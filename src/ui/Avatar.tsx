// User avatar on Kobalte's Image primitive — shows the image or initials fallback.
import { Image as KImage } from '@kobalte/core/image'
import type { JSX } from 'solid-js'

import { cn } from '../lib/cn'

interface AvatarProps {
  src?: string
  alt?: string
  fallback: string
  class?: string
}

export function Avatar(props: AvatarProps): JSX.Element {
  return (
    <KImage
      class={cn(
        'inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted',
        props.class,
      )}
    >
      <KImage.Img src={props.src} alt={props.alt} class="h-full w-full object-cover" />
      <KImage.Fallback class="grid h-full w-full place-items-center text-xs font-medium text-muted-foreground">
        {props.fallback}
      </KImage.Fallback>
    </KImage>
  )
}
