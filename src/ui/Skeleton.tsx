// Placeholder for loading content — plain div, no primitive. Pulses by default;
// opt into a sweeping shimmer band with `shimmer`.
import type { JSX } from 'solid-js'

import { cn } from '../lib/cn'

interface SkeletonProps {
  /** Size/shape the placeholder to match the content it stands in for, e.g. `"h-4 w-32 rounded-full"`. */
  class?: string
  /**
   * Use a light band sweeping across the placeholder instead of the default
   * pulse. Pure CSS (`.skeleton-shimmer`), token-tinted, reduced-motion aware.
   */
  shimmer?: boolean
}

/**
 * Placeholder block for content that is still loading. Plain `div`, no Kobalte
 * primitive — size it via `class` to match the shape of the real content (text
 * line, avatar, card, etc.). Pulses by default; pass `shimmer` for a sweeping
 * light band instead.
 *
 * @example
 * ```tsx
 * <Skeleton class="h-4 w-48" />
 * <Skeleton shimmer class="h-4 w-48" /> // sweeping band instead of pulse
 * ```
 */
export function Skeleton(props: SkeletonProps): JSX.Element {
  return (
    <div
      class={cn('rounded-md bg-muted', props.shimmer ? 'skeleton-shimmer' : 'animate-pulse', props.class)}
    />
  )
}
