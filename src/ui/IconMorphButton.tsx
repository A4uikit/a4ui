// IconMorphButton — a two-state icon toggle whose glyph morphs between an
// inactive and active icon with a spring: the outgoing icon scales down +
// rotates + fades out while the incoming scales up + rotates in + fades in,
// both stacked absolutely inside a fixed-size box. Built for icon actions
// with an obvious before/after (copy → copied, mute → muted, follow →
// following). Optional label crossfades alongside the icon.
import type { JSX } from 'solid-js'
import { Show, createEffect, createSignal, onCleanup } from 'solid-js'

import { cn } from '../lib/cn'
import { animate, motionReduced } from '../lib/motion'

/** Visual style of an {@link IconMorphButton}. Defaults to `'ghost'`. */
export type IconMorphButtonVariant = 'solid' | 'ghost' | 'outline'

const VARIANT_CLASSES: Record<IconMorphButtonVariant, string> = {
  solid: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border border-border bg-transparent text-foreground hover:bg-muted',
  ghost: 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
}

const BASE =
  'inline-flex h-9 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none disabled:opacity-50'

const SPRING = { type: 'spring', stiffness: 380, damping: 30 } as const

export interface IconMorphButtonProps {
  /** Icon shown while `pressed` is `false`, e.g. `<Copy size={18} />`. */
  inactive: JSX.Element
  /** Icon shown while `pressed` is `true`, e.g. `<Check size={18} />`. */
  active: JSX.Element
  /** Controlled pressed state. Omit to let the button manage its own state. */
  pressed?: boolean
  /** Initial pressed state when uncontrolled. Defaults to `false`. */
  defaultPressed?: boolean
  /** Fired with the next pressed state, controlled or uncontrolled. */
  onChange?: (pressed: boolean) => void
  /**
   * When greater than `0`, auto-reverts to `inactive` after this many ms once
   * pressed (e.g. copy → check → copy). The timer is cleared on cleanup and
   * restarted on every re-press. @default 0
   */
  revertAfter?: number
  /** Optional label shown next to the icon while `pressed` is `false`. */
  label?: JSX.Element
  /** Optional label shown next to the icon while `pressed` is `true`. */
  activeLabel?: JSX.Element
  /** Visual style. Defaults to `'ghost'`. */
  variant?: IconMorphButtonVariant
  class?: string
  'aria-label'?: string
}

/**
 * Two-state icon toggle button whose icon morphs (spring scale + rotate +
 * fade) between `inactive` and `active` glyphs, stacked in a fixed-size box.
 * Supports controlled (`pressed`/`onChange`) or uncontrolled
 * (`defaultPressed`) use, an optional auto-revert timer, and an optional
 * crossfading label. Falls back to an instant swap under reduced motion.
 *
 * @example
 * ```tsx
 * <IconMorphButton
 *   inactive={<Copy size={18} />}
 *   active={<Check size={18} />}
 *   aria-label="Copy to clipboard"
 *   revertAfter={1500}
 *   onChange={(pressed) => {
 *     if (pressed) void navigator.clipboard?.writeText('npm install @a4ui/core')
 *   }}
 * />
 * ```
 */
export function IconMorphButton(props: IconMorphButtonProps): JSX.Element {
  const [internalPressed, setInternalPressed] = createSignal(props.defaultPressed ?? false)
  const pressed = (): boolean => props.pressed ?? internalPressed()

  const setPressed = (next: boolean): void => {
    if (props.pressed === undefined) setInternalPressed(next)
    props.onChange?.(next)
  }

  let revertTimer: ReturnType<typeof setTimeout> | undefined

  const handleClick = (): void => {
    clearTimeout(revertTimer)
    const next = !pressed()
    setPressed(next)
    const revertAfter = props.revertAfter ?? 0
    if (next && revertAfter > 0) {
      revertTimer = setTimeout(() => setPressed(false), revertAfter)
    }
  }

  let inactiveIconEl: HTMLSpanElement | undefined
  let activeIconEl: HTMLSpanElement | undefined
  let inactiveLabelEl: HTMLSpanElement | undefined
  let activeLabelEl: HTMLSpanElement | undefined

  let iconOutControls: ReturnType<typeof animate> | undefined
  let iconInControls: ReturnType<typeof animate> | undefined
  let labelOutControls: ReturnType<typeof animate> | undefined
  let labelInControls: ReturnType<typeof animate> | undefined

  const setInstant = (el: HTMLElement | undefined, visible: boolean, morph: boolean): void => {
    if (!el) return
    el.style.opacity = visible ? '1' : '0'
    if (morph) el.style.transform = visible ? 'scale(1) rotate(0deg)' : 'scale(0.6) rotate(0deg)'
  }

  const applyInstant = (isPressed: boolean): void => {
    setInstant(inactiveIconEl, !isPressed, true)
    setInstant(activeIconEl, isPressed, true)
    setInstant(inactiveLabelEl, !isPressed, false)
    setInstant(activeLabelEl, isPressed, false)
  }

  let isFirstRun = true

  createEffect(() => {
    const isPressed = pressed()

    if (isFirstRun) {
      isFirstRun = false
      applyInstant(isPressed)
      return
    }

    iconOutControls?.stop()
    iconInControls?.stop()
    labelOutControls?.stop()
    labelInControls?.stop()

    if (motionReduced()) {
      applyInstant(isPressed)
      return
    }

    const outgoingIcon = isPressed ? inactiveIconEl : activeIconEl
    const incomingIcon = isPressed ? activeIconEl : inactiveIconEl
    const outRotate = isPressed ? 90 : -90
    const inRotate = isPressed ? -90 : 90

    if (outgoingIcon) {
      iconOutControls = animate(
        outgoingIcon,
        { opacity: [1, 0], scale: [1, 0.6], rotate: [0, outRotate] },
        SPRING,
      )
    }
    if (incomingIcon) {
      iconInControls = animate(
        incomingIcon,
        { opacity: [0, 1], scale: [0.6, 1], rotate: [inRotate, 0] },
        SPRING,
      )
    }

    const outgoingLabel = isPressed ? inactiveLabelEl : activeLabelEl
    const incomingLabel = isPressed ? activeLabelEl : inactiveLabelEl

    if (outgoingLabel) {
      labelOutControls = animate(outgoingLabel, { opacity: [1, 0] }, { duration: 0.18, ease: 'easeOut' })
    }
    if (incomingLabel) {
      labelInControls = animate(incomingLabel, { opacity: [0, 1] }, { duration: 0.18, ease: 'easeOut' })
    }
  })

  onCleanup(() => {
    clearTimeout(revertTimer)
    iconOutControls?.stop()
    iconInControls?.stop()
    labelOutControls?.stop()
    labelInControls?.stop()
  })

  const hasLabel = (): boolean => props.label !== undefined || props.activeLabel !== undefined

  return (
    <button
      type="button"
      aria-pressed={pressed()}
      aria-label={props['aria-label']}
      onClick={handleClick}
      class={cn(BASE, hasLabel() ? 'px-3' : 'w-9', VARIANT_CLASSES[props.variant ?? 'ghost'], props.class)}
    >
      <span class="relative inline-block h-5 w-5 shrink-0">
        <span
          ref={inactiveIconEl}
          class="absolute inset-0 flex items-center justify-center will-change-transform"
          aria-hidden={pressed()}
        >
          {props.inactive}
        </span>
        <span
          ref={activeIconEl}
          class="absolute inset-0 flex items-center justify-center will-change-transform"
          aria-hidden={!pressed()}
        >
          {props.active}
        </span>
      </span>
      <Show when={hasLabel()}>
        <span class="inline-grid">
          <Show when={props.label}>
            <span ref={inactiveLabelEl} class="col-start-1 row-start-1" aria-hidden={pressed()}>
              {props.label}
            </span>
          </Show>
          <Show when={props.activeLabel}>
            <span ref={activeLabelEl} class="col-start-1 row-start-1" aria-hidden={!pressed()}>
              {props.activeLabel}
            </span>
          </Show>
        </span>
      </Show>
    </button>
  )
}
