// Controlled multi-line text field — plain <textarea>, mirrors Input.tsx.
import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'

import { cn } from '../lib/cn'

const TEXTAREA_BASE =
  'w-full min-h-[80px] resize-y rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50'

interface TextareaProps
  extends Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onInput'> {
  value: string
  onInput: (value: string) => void
  class?: string
}

export function Textarea(props: TextareaProps): JSX.Element {
  const [local, rest] = splitProps(props, ['value', 'onInput', 'class'])
  return (
    <textarea
      class={cn(TEXTAREA_BASE, local.class)}
      value={local.value}
      onInput={(ev) => local.onInput(ev.currentTarget.value)}
      {...rest}
    />
  )
}
