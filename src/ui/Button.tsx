import type { JSX, ParentProps } from 'solid-js'
import { splitProps } from 'solid-js'

import { cn } from '../lib/cn'
import { spawnRipple } from './Ripple'

/** Visual style of a {@link Button}. Defaults to `'primary'`. */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-muted text-foreground hover:bg-muted/70',
  outline: 'border border-border bg-transparent text-foreground hover:bg-muted',
  ghost: 'bg-transparent text-foreground hover:bg-muted',
}

// transition-colors (hover) + transform (press) — both compositor-only, CSS
// handles it so there's no JS gesture-recognition cost per button.
const BUTTON_BASE =
  'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-[color,background-color,transform] duration-150 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none disabled:opacity-50'

interface ButtonProps extends ParentProps, Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Visual style. Defaults to `'primary'`. */
  variant?: ButtonVariant
  class?: string
  /** Defaults to "button" so action buttons inside a form never submit it by accident. */
  type?: 'button' | 'submit' | 'reset'
  /**
   * Material-style click ripple from the press position. Engine-free (Web
   * Animations API, shared with {@link spawnRipple}) and reduced-motion aware —
   * costs nothing when off.
   */
  ripple?: boolean
}

/**
 * Base button primitive: a plain `<button>` with A4ui's variants, focus ring,
 * and press/hover transitions. Accepts all standard button HTML attributes.
 *
 * @example
 * ```tsx
 * <Button variant="outline" onClick={() => save()}>Save</Button>
 * <Button ripple onClick={() => save()}>Save</Button> // with a click ripple
 * ```
 */
export function Button(props: ButtonProps): JSX.Element {
  const [local, rest] = splitProps(props, ['variant', 'class', 'type', 'children', 'ripple', 'onPointerDown'])

  const handlePointerDown: JSX.EventHandler<HTMLButtonElement, PointerEvent> = (event) => {
    if (local.ripple) spawnRipple(event.currentTarget, event, { opacity: 0.35 })
    const user = local.onPointerDown
    if (typeof user === 'function') user(event)
    else if (user) user[0](user[1], event)
  }

  return (
    <button
      type={local.type ?? 'button'}
      class={cn(
        BUTTON_BASE,
        VARIANT_CLASSES[local.variant ?? 'primary'],
        local.ripple && 'relative overflow-hidden',
        local.class,
      )}
      onPointerDown={handlePointerDown}
      {...rest}
    >
      {local.children}
    </button>
  )
}
