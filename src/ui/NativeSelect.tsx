import { ChevronDown } from 'lucide-solid'
import { createEffect, splitProps, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

export type NativeSelectSize = 'sm' | 'default'

interface NativeSelectProps extends Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** @default 'default' */
  size?: NativeSelectSize
  /** Marks the field invalid (destructive border + `aria-invalid`). */
  invalid?: boolean
  /** Class for the `<select>`; use `wrapperClass` for the outer box. */
  class?: string
  wrapperClass?: string
}

export type { NativeSelectProps }

const SIZE: Record<NativeSelectSize, string> = {
  default: 'py-2 text-sm',
  sm: 'py-1 text-xs',
}

/**
 * Styled native `<select>` — gets the OS picker on mobile. Takes `<option>` and
 * `<optgroup>` children; `value`, `onChange` and every other select attribute
 * pass straight through.
 *
 * @example
 * ```tsx
 * <NativeSelect value={plan()} onChange={(e) => setPlan(e.currentTarget.value)} aria-label="Plan">
 *   <option value="free">Free</option>
 *   <option value="pro">Pro</option>
 * </NativeSelect>
 * ```
 */
export function NativeSelect(props: NativeSelectProps): JSX.Element {
  const [local, rest] = splitProps(props, ['size', 'invalid', 'class', 'wrapperClass', 'children', 'value'])
  let select: HTMLSelectElement | undefined
  // Set after mount: a `value` attribute applied before the <option> children exist is ignored.
  createEffect(() => {
    if (select && local.value !== undefined) select.value = String(local.value)
  })
  return (
    <div class={cn('relative w-full', local.wrapperClass)}>
      <select
        ref={select}
        aria-invalid={local.invalid ? 'true' : undefined}
        class={cn(
          'peer w-full appearance-none rounded-md border bg-background ps-3 pe-9 text-foreground outline-none transition-colors a4-field disabled:cursor-not-allowed disabled:opacity-50',
          local.invalid ? 'border-destructive' : 'border-input',
          SIZE[local.size ?? 'default'],
          local.class,
        )}
        {...rest}
      >
        {local.children}
      </select>
      <ChevronDown
        aria-hidden="true"
        class="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground peer-disabled:opacity-50"
      />
    </div>
  )
}
