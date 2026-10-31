import { Show, splitProps, type JSX, type ParentProps } from 'solid-js'

import { cn } from '../lib/cn'

interface LabelProps extends ParentProps, Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, 'for'> {
  /** Id of the control this label names. */
  for?: string
  /** Appends an `*` marker (hidden from assistive tech; set `required` on the control too). */
  required?: boolean
  /** Dims the label. It also dims when it follows a disabled `.peer` control. */
  disabled?: boolean
  class?: string
}

export type { LabelProps }

/**
 * Styled `<label>`. Clicking it focuses/activates the control matching `for`.
 * Dims when `disabled`, inside a `.group` with `data-disabled`, or after a
 * disabled `.peer` control.
 *
 * @example
 * ```tsx
 * <Label for="email" required>Email</Label>
 * <Input id="email" value={email()} onInput={setEmail} required />
 * ```
 */
export function Label(props: LabelProps): JSX.Element {
  const [local, rest] = splitProps(props, ['required', 'disabled', 'class', 'children'])
  return (
    <label
      data-disabled={local.disabled ? '' : undefined}
      class={cn(
        'inline-flex select-none items-center gap-1 text-sm font-medium leading-none text-foreground',
        'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
        'group-data-[disabled]:cursor-not-allowed group-data-[disabled]:opacity-50',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        local.class,
      )}
      {...rest}
    >
      {local.children}
      <Show when={local.required}>
        <span aria-hidden="true" class="text-destructive">
          *
        </span>
      </Show>
    </label>
  )
}
