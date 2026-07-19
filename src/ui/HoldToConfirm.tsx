// A destructive/important-action button that requires a press-and-HOLD (not a
// single click) to confirm — the fill sweeping across the button doubles as a
// "how much longer" progress affordance, guarding against accidental taps.
import type { JSX } from 'solid-js'
import { createSignal, onCleanup } from 'solid-js'

import { cn } from '../lib/cn'
import { animate, motionReduced } from '../lib/motion'

export interface HoldToConfirmProps {
  onConfirm: () => void
  /** Button label. @default 'Hold to confirm' */
  label?: string
  /** How long to hold, in ms. @default 1200 */
  holdMs?: number
  disabled?: boolean
  class?: string
}

/**
 * Press-and-hold button for destructive/important actions: `onConfirm` only
 * fires once the pointer (or Space/Enter) has been held down for `holdMs`.
 * A fill layer sweeps left-to-right as visual progress; releasing early stops
 * and resets it. Under reduced motion the hold is still required (gated by a
 * plain timer instead of the tracked animation), but the fill jumps instead
 * of sweeping and the success flourish is skipped.
 *
 * @example
 * ```tsx
 * <HoldToConfirm label="Hold to delete" holdMs={1500} onConfirm={() => deleteItem(id)} />
 * ```
 */
export function HoldToConfirm(props: HoldToConfirmProps): JSX.Element {
  const [holding, setHolding] = createSignal(false)

  let buttonEl: HTMLButtonElement | undefined
  let fillEl: HTMLSpanElement | undefined
  let controls: ReturnType<typeof animate> | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  let active = false

  const holdMs = () => props.holdMs ?? 1200

  const resetFill = (durationSec: number) => {
    if (!fillEl) return
    if (motionReduced()) {
      fillEl.style.transform = 'scaleX(0)'
      return
    }
    animate(fillEl, { scaleX: 0 }, { duration: durationSec, ease: 'easeOut' })
  }

  const succeed = () => {
    active = false
    setHolding(false)
    props.onConfirm()
    if (!motionReduced() && buttonEl) {
      animate(buttonEl, { scale: [1, 1.04, 1] }, { duration: 0.3, ease: 'easeOut' })
    }
    resetFill(0.2)
  }

  const cancel = () => {
    if (!active) return
    active = false
    setHolding(false)
    controls?.stop()
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
    resetFill(0.15)
  }

  const start = (event: PointerEvent | KeyboardEvent) => {
    if (props.disabled || active) return
    event.preventDefault()
    active = true
    setHolding(true)

    if (motionReduced()) {
      if (fillEl) fillEl.style.transform = 'scaleX(1)'
      timer = setTimeout(() => {
        if (active) succeed()
      }, holdMs())
      return
    }

    if (!fillEl) return
    controls = animate(fillEl, { scaleX: [0, 1] }, { duration: holdMs() / 1000, ease: 'linear' })
    controls.finished
      // eslint-disable-next-line solid/reactivity -- promise callback, not a tracked scope; setHolding runs fine here
      .then(() => {
        if (active) succeed()
      })
      .catch(() => {})
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== ' ' && event.key !== 'Enter') return
    if (event.repeat) return
    start(event)
  }

  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key !== ' ' && event.key !== 'Enter') return
    cancel()
  }

  onCleanup(() => {
    controls?.stop()
    if (timer !== undefined) clearTimeout(timer)
  })

  return (
    <button
      ref={buttonEl}
      type="button"
      disabled={props.disabled}
      aria-label={props.label ?? 'Hold to confirm'}
      aria-busy={holding()}
      class={cn(
        'relative overflow-hidden rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium disabled:pointer-events-none disabled:opacity-50',
        props.class,
      )}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    >
      <span
        aria-hidden="true"
        ref={fillEl}
        class="absolute inset-0 origin-left bg-primary/25"
        style={{ transform: 'scaleX(0)' }}
      />
      <span class="relative z-10">{props.label ?? 'Hold to confirm'}</span>
    </button>
  )
}
