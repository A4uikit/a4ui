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
  // Kobalte's Separator renders an <hr>, which carries default block margins and
  // a zero height that defeat `self-stretch` on the vertical variant — reset both
  // (border-0 m-0) and give vertical a fallback min-height so it shows even when
  // its flex parent doesn't stretch it.
  return (
    <KSeparator
      orientation={orientation()}
      class={cn(
        'shrink-0 border-0 bg-border m-0',
        orientation() === 'vertical' ? 'w-px min-h-4 h-full self-stretch' : 'h-px w-full',
        props.class,
      )}
    />
  )
}
