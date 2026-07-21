// SlideArrowButton — CTA button where the label slides toward `direction` on
// hover while an arrow slides in from the opposite edge. Pure CSS
// (transform + opacity only), so it needs no JS animation engine and gets
// the reduced-motion guard for free from the global @media block in styles.css.
import type { JSX, ParentProps } from 'solid-js'
import { Show, splitProps } from 'solid-js'
import { ArrowLeft, ArrowRight } from 'lucide-solid'

import { cn } from '../lib/cn'

/** Direction the label/arrow slide toward on hover. Defaults to `'right'`. */
export type SlideArrowDirection = 'right' | 'left'

/** Visual style of a {@link SlideArrowButton}. Defaults to `'solid'`. */
export type SlideArrowButtonVariant = 'solid' | 'outline'

const VARIANT_CLASSES: Record<SlideArrowButtonVariant, string> = {
  solid: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border border-border bg-transparent text-foreground hover:bg-muted',
}

const BUTTON_BASE =
  'group relative inline-flex items-center justify-center overflow-hidden rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none disabled:opacity-50'

// Both the label and the arrow only ever animate `transform`/`opacity` —
// compositor-only properties — so this is a plain CSS transition, no JS
// animation loop and no layout thrashing.
const TRANSITION = 'transition-transform duration-200 ease-out'

export interface SlideArrowButtonProps extends ParentProps {
  onClick?: (e: MouseEvent) => void
  /** Direction the label/arrow slide toward on hover. Defaults to `'right'`. */
  direction?: SlideArrowDirection
  /** Custom icon; defaults to `ArrowRight`/`ArrowLeft` per `direction`. */
  icon?: JSX.Element
  /** Visual style. Defaults to `'solid'`. */
  variant?: SlideArrowButtonVariant
  disabled?: boolean
  class?: string
  /** Accessible label, forwarded to the underlying `<button>`. */
  'aria-label'?: string
}

/**
 * CTA button: at rest the label sits centered; on hover it slides toward
 * `direction` while an arrow slides in from the opposite edge. Pure CSS
 * transform/opacity transitions — no JS animation engine.
 *
 * @example
 * ```tsx
 * <SlideArrowButton onClick={() => go()}>Get started</SlideArrowButton>
 * <SlideArrowButton direction="left" variant="outline">Back</SlideArrowButton>
 * ```
 */
export function SlideArrowButton(props: SlideArrowButtonProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'children',
    'onClick',
    'direction',
    'icon',
    'variant',
    'disabled',
    'class',
    'aria-label',
  ])

  const direction = (): SlideArrowDirection => local.direction ?? 'right'
  const isRight = () => direction() === 'right'

  const icon = (): JSX.Element =>
    local.icon ??
    (isRight() ? (
      <ArrowRight class="h-4 w-4" aria-hidden="true" />
    ) : (
      <ArrowLeft class="h-4 w-4" aria-hidden="true" />
    ))

  // Label slides fully out of the way (100%) in the hover direction, arrow
  // slides in the same amount from the opposite edge — they swap places.
  const labelClasses = (): string =>
    cn(TRANSITION, isRight() ? 'group-hover:-translate-x-full' : 'group-hover:translate-x-full')

  const arrowClasses = (): string =>
    cn(
      'absolute inset-0 flex items-center justify-center opacity-0',
      TRANSITION,
      'transition-[transform,opacity]',
      isRight()
        ? 'translate-x-full group-hover:translate-x-0 group-hover:opacity-100'
        : '-translate-x-full group-hover:translate-x-0 group-hover:opacity-100',
    )

  return (
    <button
      type="button"
      disabled={local.disabled}
      class={cn(BUTTON_BASE, VARIANT_CLASSES[local.variant ?? 'solid'], local.class)}
      aria-label={local['aria-label']}
      onClick={(e) => local.onClick?.(e)}
      {...rest}
    >
      <span class={labelClasses()}>{local.children}</span>
      <Show when={!local.disabled}>
        <span class={arrowClasses()}>{icon()}</span>
      </Show>
    </button>
  )
}
