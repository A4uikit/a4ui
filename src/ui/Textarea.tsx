// Controlled multi-line text field — plain <textarea>, mirrors Input.tsx.
import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'

import { cn } from '../lib/cn'

const TEXTAREA_BASE =
  'w-full min-h-[80px] resize-y rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground px-3 py-2 text-sm outline-none transition-colors a4-field disabled:cursor-not-allowed disabled:opacity-50'

interface TextareaProps extends Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onInput'> {
  value: string
  /** Called with the new string value on every input event (not the raw DOM event). */
  onInput: (value: string) => void
  class?: string
}

/**
 * Controlled multi-line text field — a plain `<textarea>` styled to match
 * {@link Input}. Any other native textarea attribute (e.g. `rows`, `placeholder`,
 * `disabled`) is passed through.
 *
 * @example
 * ```tsx
 * const [bio, setBio] = createSignal('')
 * <Textarea value={bio()} onInput={setBio} placeholder="Tell us about yourself" />
 * ```
 */
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
