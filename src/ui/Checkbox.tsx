import type { JSX } from 'solid-js'

import { cn } from '../lib/cn'

interface CheckboxProps {
  checked: boolean
  /** Called with the new checked state whenever the input is toggled. */
  onChange: (checked: boolean) => void
  /** Visible label rendered next to the checkbox; also makes the whole row clickable. */
  label: string
  class?: string
}

/**
 * Plain labeled checkbox (native `<input type="checkbox">`, not a Kobalte
 * wrapper) for simple boolean toggles with a visible label.
 *
 * @example
 * ```tsx
 * <Checkbox checked={agreed()} onChange={setAgreed} label="I agree to the terms" />
 * ```
 */
export function Checkbox(props: CheckboxProps): JSX.Element {
  return (
    <label class={cn('inline-flex items-center gap-2 text-sm text-foreground', props.class)}>
      <input
        type="checkbox"
        class="h-4 w-4 rounded border-input"
        checked={props.checked}
        onChange={(ev) => props.onChange(ev.currentTarget.checked)}
      />
      {props.label}
    </label>
  )
}
