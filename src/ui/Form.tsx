// Accessible form-field primitives. `FormField` provisions a shared,
// auto-generated id via context so `FormLabel`, `FormControl`,
// `FormDescription`, and `FormError` can associate themselves (`for`,
// `aria-describedby`, element ids) without the consumer wiring ids by hand.
import type { JSX } from 'solid-js'
import { createContext, createUniqueId, Show, useContext } from 'solid-js'

import { cn } from '../lib/cn'

interface FormFieldContextValue {
  id: string
  describedBy: string
}

const FormFieldContext = createContext<FormFieldContextValue>()

function useFormFieldContext(): FormFieldContextValue {
  const ctx = useContext(FormFieldContext)
  return ctx ?? { id: '', describedBy: '' }
}

export interface FormFieldProps {
  /** Optional explicit id; otherwise auto-generated. */
  id?: string
  children: JSX.Element
  class?: string
}

/**
 * Container/provider that gives `FormLabel`, `FormControl`,
 * `FormDescription`, and `FormError` a shared field id so they wire up
 * `for`/`id`/`aria-describedby` automatically.
 *
 * Pairs well with a schema validator (Valibot/Zod): the consumer computes
 * the error string and passes it to `FormError`.
 *
 * @example
 * ```tsx
 * <FormField>
 *   <FormLabel>Email</FormLabel>
 *   <FormControl>
 *     {(fieldProps) => <input type="email" {...fieldProps} />}
 *   </FormControl>
 *   <FormDescription>We'll never share your email.</FormDescription>
 *   <FormError>{errors().email}</FormError>
 * </FormField>
 * ```
 */
export function FormField(props: FormFieldProps): JSX.Element {
  // eslint-disable-next-line solid/reactivity -- id is stable for a field's lifetime
  const id = props.id ?? createUniqueId()
  const value: FormFieldContextValue = {
    id,
    describedBy: `${id}-desc ${id}-error`,
  }
  return (
    <FormFieldContext.Provider value={value}>
      <div class={cn('space-y-1.5', props.class)}>{props.children}</div>
    </FormFieldContext.Provider>
  )
}

/** Label associated with the enclosing `FormField`'s control via `for`. */
export function FormLabel(props: { children: JSX.Element; class?: string }): JSX.Element {
  const ctx = useFormFieldContext()
  return (
    <label for={ctx.id} class={cn('text-sm font-medium text-foreground', props.class)}>
      {props.children}
    </label>
  )
}

/**
 * Render-prop bridge that hands the enclosing `FormField`'s `id` and
 * `aria-describedby` to the caller's control, to be spread onto the actual
 * input/select/textarea element.
 */
export function FormControl(props: {
  children: (fieldProps: { id: string; 'aria-describedby': string }) => JSX.Element
}): JSX.Element {
  const ctx = useFormFieldContext()
  return <>{props.children({ id: ctx.id, 'aria-describedby': ctx.describedBy })}</>
}

/** Helper text for the enclosing `FormField`, linked via `aria-describedby`. */
export function FormDescription(props: { children: JSX.Element; class?: string }): JSX.Element {
  const ctx = useFormFieldContext()
  return (
    <p id={`${ctx.id}-desc`} class={cn('text-xs text-muted-foreground', props.class)}>
      {props.children}
    </p>
  )
}

/**
 * Error text for the enclosing `FormField`, linked via `aria-describedby`.
 * Renders nothing when there is no error to show.
 */
export function FormError(props: { children?: JSX.Element; class?: string }): JSX.Element {
  const ctx = useFormFieldContext()
  return (
    <Show when={props.children}>
      <p id={`${ctx.id}-error`} role="alert" class={cn('text-xs text-destructive', props.class)}>
        {props.children}
      </p>
    </Show>
  )
}
