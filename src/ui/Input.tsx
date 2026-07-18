// `disabled` is wired onto the <input> element (not just styled).
import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'

import { cn } from '../lib/cn'

const INPUT_BASE =
  'w-full rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground px-3 py-2 text-sm outline-none transition-colors a4-field disabled:cursor-not-allowed disabled:opacity-50'

interface InputProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onInput'> {
  value: string
  /** Called with the raw string value on every input event (controlled). */
  onInput: (value: string) => void
  class?: string
}

/**
 * Themed text input with a value/onInput controlled-string API (instead of raw
 * DOM events). All other native `<input>` attributes pass through, so `type`,
 * `disabled`, `placeholder`, etc. work as usual.
 *
 * @example
 * ```tsx
 * const [name, setName] = createSignal('')
 * <Input value={name()} onInput={setName} placeholder="Full name" />
 * ```
 */
export function Input(props: InputProps): JSX.Element {
  const [local, rest] = splitProps(props, ['value', 'onInput', 'class'])
  return (
    <input
      class={cn(INPUT_BASE, local.class)}
      value={local.value}
      onInput={(ev) => local.onInput(ev.currentTarget.value)}
      {...rest}
    />
  )
}
