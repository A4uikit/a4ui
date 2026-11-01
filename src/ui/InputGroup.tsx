// InputGroup — one bordered, focus-ringed shell around a borderless input or
// textarea plus addons (icons, text, buttons, hints) on any side. The group
// owns the border and the focus ring (focus-within via the shared `a4-field`
// class), so the inner controls draw none of their own.
import type { JSX, ParentProps } from 'solid-js'
import { splitProps } from 'solid-js'

import { cn } from '../lib/cn'
import { Button } from './Button'

export interface InputGroupProps extends ParentProps, JSX.HTMLAttributes<HTMLDivElement> {
  class?: string
}

/**
 * Wrapper that owns a single border and focus ring for an input and its addons.
 * Addons are placed by their `align` prop, whatever their order in the DOM.
 *
 * @example
 * ```tsx
 * <InputGroup>
 *   <InputGroupAddon><Search class="h-4 w-4" /></InputGroupAddon>
 *   <InputGroupInput value={q()} onInput={setQ} placeholder="Search" />
 * </InputGroup>
 * ```
 */
export function InputGroup(props: InputGroupProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <div
      role="group"
      data-slot="input-group"
      class={cn(
        'a4-field group/input-group relative flex w-full min-w-0 flex-wrap items-center rounded-md border border-input bg-background text-sm text-foreground',
        'has-[[data-slot=input-group-control][aria-invalid=true]]:border-destructive',
        'has-[[data-slot=input-group-control]:disabled]:opacity-50',
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </div>
  )
}

export type InputGroupAddonAlign = 'inline-start' | 'inline-end' | 'block-start' | 'block-end'

export interface InputGroupAddonProps extends ParentProps, JSX.HTMLAttributes<HTMLDivElement> {
  /** Where the addon sits. Defaults to `inline-start`. */
  align?: InputGroupAddonAlign
  class?: string
}

// Inline addons share the control's row (control is flex-1); block addons take
// a full row above/below it via `basis-full` + flex-wrap on the group.
const ADDON_ALIGN: Record<InputGroupAddonAlign, string> = {
  'inline-start': 'order-1 pl-3',
  'inline-end': 'order-3 pr-3',
  'block-start': 'order-0 basis-full px-3 pt-2',
  'block-end': 'order-4 basis-full px-3 pb-2',
}

/**
 * Adornment around the control. Clicking anywhere on it (except on a button)
 * focuses the group's input or textarea.
 *
 * @example
 * ```tsx
 * <InputGroupAddon align="inline-end"><Kbd>/</Kbd></InputGroupAddon>
 * ```
 */
export function InputGroupAddon(props: InputGroupAddonProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'align', 'children', 'onClick'])
  const align = (): InputGroupAddonAlign => local.align ?? 'inline-start'
  return (
    <div
      role="presentation"
      data-slot="input-group-addon"
      data-align={align()}
      class={cn(
        'flex cursor-text select-none items-center gap-2 py-1.5 text-sm text-muted-foreground [&>svg]:h-4 [&>svg]:w-4',
        ADDON_ALIGN[align()],
        local.class,
      )}
      onClick={(e) => {
        if (typeof local.onClick === 'function') local.onClick(e)
        if ((e.target as HTMLElement).closest('button')) return
        e.currentTarget.parentElement?.querySelector<HTMLElement>('[data-slot=input-group-control]')?.focus()
      }}
      {...rest}
    >
      {local.children}
    </div>
  )
}

/**
 * Plain text inside an addon (a prefix like `https://` or a unit).
 *
 * @example
 * ```tsx
 * <InputGroupAddon><InputGroupText>https://</InputGroupText></InputGroupAddon>
 * ```
 */
export function InputGroupText(props: ParentProps<{ class?: string }>): JSX.Element {
  return (
    <span
      class={cn('flex items-center gap-2 text-sm text-muted-foreground [&>svg]:h-4 [&>svg]:w-4', props.class)}
    >
      {props.children}
    </span>
  )
}

/** Compact sizes for {@link InputGroupButton}. */
export type InputGroupButtonSize = 'xs' | 'sm' | 'icon-xs' | 'icon-sm'

const BUTTON_SIZE: Record<InputGroupButtonSize, string> = {
  xs: 'h-6 gap-1 rounded px-2 py-0 text-xs',
  sm: 'h-7 gap-1.5 px-2.5 py-0 text-sm',
  'icon-xs': 'h-6 w-6 rounded p-0',
  'icon-sm': 'h-7 w-7 p-0',
}

export interface InputGroupButtonProps
  extends ParentProps, Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Compact size. Defaults to `xs`. */
  size?: InputGroupButtonSize
  /** Button variant; ghost by default so it blends into the group. */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  type?: 'button' | 'submit' | 'reset'
  class?: string
}

/**
 * Compact {@link Button} for use inside an addon. Ghost by default.
 *
 * @example
 * ```tsx
 * <InputGroupButton size="icon-xs" aria-label="Show password"><Eye /></InputGroupButton>
 * ```
 */
export function InputGroupButton(props: InputGroupButtonProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'size', 'variant', 'children'])
  return (
    <Button
      variant={local.variant ?? 'ghost'}
      class={cn('shadow-none [&>svg]:h-3.5 [&>svg]:w-3.5', BUTTON_SIZE[local.size ?? 'xs'], local.class)}
      {...rest}
    >
      {local.children}
    </Button>
  )
}

const CONTROL_BASE =
  'order-2 min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-foreground shadow-none outline-none ring-0 placeholder:text-muted-foreground disabled:cursor-not-allowed'

export interface InputGroupInputProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onInput'
> {
  value: string
  /** Called with the raw string value on every input event. */
  onInput: (value: string) => void
  class?: string
}

/**
 * Borderless `<input>` for an {@link InputGroup} (same value/onInput API as `Input`).
 *
 * @example
 * ```tsx
 * <InputGroupInput value={url()} onInput={setUrl} placeholder="example.com" />
 * ```
 */
export function InputGroupInput(props: InputGroupInputProps): JSX.Element {
  const [local, rest] = splitProps(props, ['value', 'onInput', 'class'])
  return (
    <input
      data-slot="input-group-control"
      class={cn(CONTROL_BASE, local.class)}
      value={local.value}
      onInput={(e) => local.onInput(e.currentTarget.value)}
      {...rest}
    />
  )
}

export interface InputGroupTextareaProps extends Omit<
  JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onInput'
> {
  value: string
  /** Called with the new string value on every input event. */
  onInput: (value: string) => void
  class?: string
}

/**
 * Borderless `<textarea>` for an {@link InputGroup}.
 *
 * @example
 * ```tsx
 * <InputGroupTextarea value={msg()} onInput={setMsg} rows={3} />
 * ```
 */
export function InputGroupTextarea(props: InputGroupTextareaProps): JSX.Element {
  const [local, rest] = splitProps(props, ['value', 'onInput', 'class'])
  return (
    <textarea
      data-slot="input-group-control"
      class={cn(CONTROL_BASE, 'min-h-[72px] resize-none', local.class)}
      value={local.value}
      onInput={(e) => local.onInput(e.currentTarget.value)}
      {...rest}
    />
  )
}
