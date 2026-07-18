// Visual/semantic divider on Kobalte's Separator primitive.
import { Separator as KSeparator } from '@kobalte/core/separator'
import type { JSX } from 'solid-js'

import { cn } from '../lib/cn'

interface SeparatorProps {
  /** Default: `'horizontal'`. */
  orientation?: 'horizontal' | 'vertical'
  class?: string
}

/**
 * Visual/semantic divider, built on Kobalte's `Separator` primitive (renders
 * with the correct ARIA role for the given orientation). Use to separate
 * groups of content, e.g. inside a menu or between toolbar sections.
 *
 * @example
 * ```tsx
 * <Separator orientation="vertical" />
 * ```
 */
export function Separator(props: SeparatorProps): JSX.Element {
  const orientation = () => props.orientation ?? 'horizontal'
  return (
    <KSeparator
      orientation={orientation()}
      class={cn('bg-border', orientation() === 'vertical' ? 'w-px self-stretch' : 'h-px w-full', props.class)}
    />
  )
}
