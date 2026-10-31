// Field — composable form-field layout: FieldSet/FieldLegend/FieldGroup for
// structure, Field for one labelled control. A per-field context hands out one
// control id and collects description/error ids, so the label's `for`, the
// control's `aria-describedby`, `aria-errormessage` and `aria-invalid` are
// wired automatically. The control is discovered in the DOM after mount (first
// input/textarea/select/combobox/switch inside the field), so plain, Kobalte
// and InputGroup controls all work with no render-prop.
//
// Layout note: Tailwind 3.4 (the preset's version) has no built-in `@container`
// variants, so `orientation="responsive"` and FieldGroup use viewport
// breakpoints (`sm:`), not container queries.
import type { JSX, ParentProps } from 'solid-js'
import {
  createContext,
  createEffect,
  createSignal,
  createUniqueId,
  For,
  onCleanup,
  onMount,
  Show,
  splitProps,
  useContext,
} from 'solid-js'

import { cn } from '../lib/cn'

/** Layout direction of a {@link Field}. */
export type FieldOrientation = 'vertical' | 'horizontal' | 'responsive'

interface FieldContextValue {
  /** Id of the control (adopted from the control if it already has one). */
  controlId: () => string
  registerDescription: (id: string) => () => void
  registerError: (id: string) => () => void
}

const FieldContext = createContext<FieldContextValue>()

const CONTROL_SELECTOR =
  '[data-field-control], input:not([type="hidden"]), textarea, select, [role="combobox"], [role="switch"], [role="checkbox"]'

// Add an id to a signal-held list; returns the remover.
function register(setter: (fn: (prev: string[]) => string[]) => void, id: string): () => void {
  setter((prev) => [...prev, id])
  return () => setter((prev) => prev.filter((x) => x !== id))
}

const ORIENTATION_CLASSES: Record<FieldOrientation, string> = {
  vertical: 'flex-col',
  horizontal: 'flex-row items-center justify-between gap-3',
  responsive: 'flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-3',
}

export interface FieldSetProps extends ParentProps, JSX.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  class?: string
}

/**
 * Semantic `<fieldset>` that groups related fields. Pair with {@link FieldLegend}.
 *
 * @example
 * ```tsx
 * <FieldSet>
 *   <FieldLegend>Profile</FieldLegend>
 *   <FieldGroup>...</FieldGroup>
 * </FieldSet>
 * ```
 */
export function FieldSet(props: FieldSetProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <fieldset class={cn('m-0 flex min-w-0 flex-col gap-4 border-0 p-0', local.class)} {...rest}>
      {local.children}
    </fieldset>
  )
}

export interface FieldLegendProps extends ParentProps, JSX.HTMLAttributes<HTMLLegendElement> {
  /** `legend` is a section heading; `label` is the smaller label size. Defaults to `legend`. */
  variant?: 'legend' | 'label'
  class?: string
}

/**
 * Caption of a {@link FieldSet}.
 *
 * @example
 * ```tsx
 * <FieldLegend variant="label">Notifications</FieldLegend>
 * ```
 */
export function FieldLegend(props: FieldLegendProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'variant', 'children'])
  return (
    <legend
      data-variant={local.variant ?? 'legend'}
      class={cn(
        'mb-1 font-semibold text-foreground',
        local.variant === 'label' ? 'text-sm' : 'text-base',
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </legend>
  )
}

export interface FieldGroupProps extends ParentProps, JSX.HTMLAttributes<HTMLDivElement> {
  class?: string
}

/**
 * Vertical stack of {@link Field}s with consistent spacing.
 *
 * @example
 * ```tsx
 * <FieldGroup><Field>...</Field><Field>...</Field></FieldGroup>
 * ```
 */
export function FieldGroup(props: FieldGroupProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <div data-slot="field-group" class={cn('flex w-full flex-col gap-5', local.class)} {...rest}>
      {local.children}
    </div>
  )
}

export interface FieldProps extends ParentProps, JSX.HTMLAttributes<HTMLDivElement> {
  /** `vertical` (default), `horizontal`, or `responsive` (stacked below `sm`, a row above). */
  orientation?: FieldOrientation
  /** Marks the field invalid: sets `data-invalid` and `aria-invalid` on the control. */
  invalid?: boolean
  class?: string
}

/**
 * One labelled form field. Provides the id context used by {@link FieldLabel},
 * {@link FieldDescription} and {@link FieldError}, and wires the control inside
 * it (`id`, `aria-describedby`, `aria-errormessage`, `aria-invalid`).
 *
 * @example
 * ```tsx
 * <Field invalid={!!error()}>
 *   <FieldLabel>Email</FieldLabel>
 *   <Input value={email()} onInput={setEmail} />
 *   <FieldDescription>We never share it.</FieldDescription>
 *   <FieldError>{error()}</FieldError>
 * </Field>
 * ```
 */
export function Field(props: FieldProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'orientation', 'invalid', 'children'])
  const uid = createUniqueId()
  const [controlId, setControlId] = createSignal(`${uid}-control`)
  const [descIds, setDescIds] = createSignal<string[]>([])
  const [errIds, setErrIds] = createSignal<string[]>([])
  let root!: HTMLDivElement

  const ctx: FieldContextValue = {
    controlId,
    registerDescription: (id) => register(setDescIds, id),
    registerError: (id) => register(setErrIds, id),
  }

  const findControl = (): HTMLElement | null => root.querySelector<HTMLElement>(CONTROL_SELECTOR)

  onMount(() => {
    const el = findControl()
    if (!el) return
    if (el.id) setControlId(el.id)
    else el.id = controlId()
  })

  // Re-apply ARIA wiring whenever descriptions/errors/invalid change.
  createEffect(() => {
    const desc = descIds()
    const err = errIds()
    const invalid = !!local.invalid
    const el = findControl()
    if (!el) return
    const ids = [...desc, ...err]
    if (ids.length) el.setAttribute('aria-describedby', ids.join(' '))
    else el.removeAttribute('aria-describedby')
    if (invalid) el.setAttribute('aria-invalid', 'true')
    else el.removeAttribute('aria-invalid')
    if (invalid && err.length) el.setAttribute('aria-errormessage', err.join(' '))
    else el.removeAttribute('aria-errormessage')
  })

  return (
    <FieldContext.Provider value={ctx}>
      <div
        ref={root}
        role="group"
        data-slot="field"
        data-orientation={local.orientation ?? 'vertical'}
        data-invalid={local.invalid ? '' : undefined}
        class={cn(
          'group/field flex w-full gap-2',
          ORIENTATION_CLASSES[local.orientation ?? 'vertical'],
          local.class,
        )}
        {...rest}
      >
        {local.children}
      </div>
    </FieldContext.Provider>
  )
}

/**
 * Wrapper for a title + description block next to a control, e.g. the text half
 * of a horizontal switch row.
 *
 * @example
 * ```tsx
 * <FieldContent><FieldTitle>Alerts</FieldTitle><FieldDescription>Email me.</FieldDescription></FieldContent>
 * ```
 */
export function FieldContent(props: ParentProps<{ class?: string }>): JSX.Element {
  return <div class={cn('flex flex-1 flex-col gap-1', props.class)}>{props.children}</div>
}

export interface FieldLabelProps extends ParentProps, JSX.LabelHTMLAttributes<HTMLLabelElement> {
  class?: string
}

/**
 * `<label>` bound to the enclosing {@link Field}'s control through `for`.
 *
 * @example
 * ```tsx
 * <FieldLabel>Full name</FieldLabel>
 * ```
 */
export function FieldLabel(props: FieldLabelProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'children', 'for'])
  const ctx = useContext(FieldContext)
  return (
    <label
      for={local.for ?? ctx?.controlId()}
      class={cn(
        'text-sm font-medium leading-none text-foreground group-data-[invalid]/field:text-destructive',
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </label>
  )
}

/**
 * Non-label title text for a field (use where a `<label>` would be wrong).
 *
 * @example
 * ```tsx
 * <FieldTitle>Two-factor authentication</FieldTitle>
 * ```
 */
export function FieldTitle(props: ParentProps<{ class?: string }>): JSX.Element {
  return (
    <div class={cn('text-sm font-medium leading-none text-foreground', props.class)}>{props.children}</div>
  )
}

/**
 * Helper text, linked to the control through `aria-describedby`.
 *
 * @example
 * ```tsx
 * <FieldDescription>Use 8 or more characters.</FieldDescription>
 * ```
 */
export function FieldDescription(props: ParentProps<{ class?: string; id?: string }>): JSX.Element {
  const ctx = useContext(FieldContext)
  // eslint-disable-next-line solid/reactivity -- id is stable for the element's lifetime
  const id = props.id ?? createUniqueId()
  if (ctx) onCleanup(ctx.registerDescription(id))
  return (
    <p id={id} class={cn('text-xs text-muted-foreground', props.class)}>
      {props.children}
    </p>
  )
}

export interface FieldSeparatorProps {
  /** Optional text shown in the middle of the rule. */
  children?: JSX.Element
  class?: string
}

/**
 * Horizontal rule between fields, optionally with text in the middle.
 *
 * @example
 * ```tsx
 * <FieldSeparator>or continue with</FieldSeparator>
 * ```
 */
export function FieldSeparator(props: FieldSeparatorProps): JSX.Element {
  return (
    <div
      role="separator"
      data-slot="field-separator"
      class={cn('relative flex items-center gap-3 text-xs text-muted-foreground', props.class)}
    >
      <span class="h-px flex-1 bg-border" />
      <Show when={props.children}>
        <span>{props.children}</span>
        <span class="h-px flex-1 bg-border" />
      </Show>
    </div>
  )
}

export interface FieldErrorProps {
  /** Error messages; entries may be strings or `{ message }` objects (e.g. schema issues). */
  errors?: Array<string | { message?: string } | undefined>
  /** Custom content, used when `errors` is not given. */
  children?: JSX.Element
  class?: string
}

/**
 * Validation message(s) for a field. Renders nothing when empty, a single line
 * for one message and a list for several. `role="alert"` is set only while
 * something is shown, so assistive tech announces it when it appears.
 *
 * @example
 * ```tsx
 * <FieldError errors={['Too short', 'Needs a number']} />
 * ```
 */
export function FieldError(props: FieldErrorProps): JSX.Element {
  const ctx = useContext(FieldContext)
  const id = createUniqueId()
  const messages = (): string[] => {
    const out: string[] = []
    for (const e of props.errors ?? []) {
      const m = typeof e === 'string' ? e : e?.message
      if (m) out.push(m)
    }
    return out
  }
  const visible = (): boolean => messages().length > 0 || !!props.children
  createEffect(() => {
    if (!ctx || !visible()) return
    onCleanup(ctx.registerError(id))
  })
  return (
    <Show when={visible()}>
      <div id={id} role="alert" data-slot="field-error" class={cn('text-xs text-destructive', props.class)}>
        <Show when={messages().length > 1} fallback={<>{messages()[0] ?? props.children}</>}>
          <ul class="ml-4 list-disc space-y-0.5">
            <For each={messages()}>{(m) => <li>{m}</li>}</For>
          </ul>
        </Show>
      </div>
    </Show>
  )
}
