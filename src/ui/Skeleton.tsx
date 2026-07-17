// Pulsing placeholder for loading content — plain div, no primitive.
import type { JSX } from 'solid-js'

import { cn } from '../lib/cn'

interface SkeletonProps {
  /** Size/shape the placeholder to match the content it stands in for, e.g. `"h-4 w-32 rounded-full"`. */
  class?: string
}

/**
 * Pulsing placeholder block for content that is still loading. Plain `div`,
 * no Kobalte primitive — size it via `class` to match the shape of the real
 * content (text line, avatar, card, etc.).
 *
 * @example
 * ```tsx
 * <Skeleton class="h-4 w-48" />
 * ```
 */
export function Skeleton(props: SkeletonProps): JSX.Element {
  return <div class={cn('animate-pulse rounded-md bg-muted', props.class)} />
}
