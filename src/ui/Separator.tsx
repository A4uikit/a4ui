// Visual/semantic divider on Kobalte's Separator primitive.
import { Separator as KSeparator } from '@kobalte/core/separator'
import type { JSX } from 'solid-js'

import { cn } from '../lib/cn'

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  class?: string
}

export function Separator(props: SeparatorProps): JSX.Element {
  const orientation = () => props.orientation ?? 'horizontal'
  return (
    <KSeparator
      orientation={orientation()}
      class={cn(
        'bg-border',
        orientation() === 'vertical' ? 'w-px self-stretch' : 'h-px w-full',
        props.class,
      )}
    />
  )
}
