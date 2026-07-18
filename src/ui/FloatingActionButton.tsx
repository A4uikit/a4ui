import type { JSX } from 'solid-js'

import { cn } from '../lib/cn'

/** Screen corner a {@link FloatingActionButton} anchors to. Defaults to `'bottom-right'`. */
export type FloatingActionButtonPosition = 'bottom-right' | 'bottom-left'

const POSITION_CLASSES: Record<FloatingActionButtonPosition, string> = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
}

// brightness-110 on hover keeps the tint theme-agnostic — it lifts whatever
// primary color the active theme resolves to, no per-variant color needed.
const FAB_BASE =
  'fixed z-40 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:brightness-110'

export interface FloatingActionButtonProps {
  /** Icon rendered centered inside the button. */
  icon: JSX.Element
  /** Accessible label; surfaced via `aria-label`. */
  label: string
  onClick?: () => void
  /** Screen corner to anchor to. Defaults to `'bottom-right'`. */
  position?: FloatingActionButtonPosition
  class?: string
}

/**
 * A fixed circular primary action button pinned to a screen corner.
 *
 * @example
 * ```tsx
 * <FloatingActionButton icon={<PlusIcon />} label="New item" onClick={() => create()} />
 * ```
 */
export function FloatingActionButton(props: FloatingActionButtonProps): JSX.Element {
  return (
    <button
      type="button"
      aria-label={props.label}
      onClick={() => props.onClick?.()}
      class={cn(FAB_BASE, POSITION_CLASSES[props.position ?? 'bottom-right'], props.class)}
    >
      {props.icon}
    </button>
  )
}
