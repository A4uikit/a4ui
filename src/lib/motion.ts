// Shared motion helpers. CSS-driven transitions (Tailwind classes, Kobalte's
// data-expanded/data-closed keyframes) get their reduced-motion guard for free
// from the global `@media (prefers-reduced-motion: reduce)` block in styles.css —
// this module is for the JS-driven paths (Motion's `animate`, the KPI count-up)
// that can't rely on a CSS media query alone. JS animation uses **Motion**
// (motion.dev, the `motion` package) — `animate`/`scroll`/`inView`/`stagger` are
// re-exported below so components (and consumers) share one motion engine.
import { animate } from 'motion'
import { createEffect, createSignal, onCleanup, untrack, type Accessor } from 'solid-js'

import { isCalm } from './effects'

// Re-export Motion's imperative API so the whole library shares one engine and
// consumers can reach it without a second dependency.
export { animate, inView, scroll, stagger, spring } from 'motion'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Snapshot of the user's reduced-motion preference at call time. Not
 * reactive to preference changes mid-session (matches theme.ts's one-shot
 * environment read) — reload picks up changes.
 *
 * @example
 * ```ts
 * if (prefersReducedMotion()) skipEntranceAnimation()
 * ```
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

// --- "force full motion" override (the ⚡ MotionToggle) --------------------
// Persisted opt-out from the OS "reduce motion" preference; toggling it also
// adds/removes `.force-motion` on <html>, which the reduced-motion @media block
// in styles.css keys off to re-enable CSS animation.
const FORCE_MOTION_KEY = 'a4ui-motion-forced'

function motionStore(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

const [motionForced, setMotionForcedSignal] = createSignal(motionStore()?.getItem(FORCE_MOTION_KEY) === '1')

if (typeof document !== 'undefined') {
  document.documentElement.classList.toggle('force-motion', untrack(motionForced))
}

/**
 * Reactive accessor for the persisted "force full motion" opt-out (the ⚡
 * MotionToggle) — `true` re-enables animation even when the OS requests
 * reduced motion.
 *
 * @example
 * ```ts
 * const forced = useMotionForced()
 * console.log(forced()) // true | false
 * ```
 */
export function useMotionForced(): Accessor<boolean> {
  return motionForced
}

/**
 * Persist the "force full motion" choice, toggle `html.force-motion`
 * (which the reduced-motion `@media` block in styles.css keys off), and
 * update {@link useMotionForced}.
 *
 * @example
 * ```ts
 * setMotionForced(true) // opt back into full motion despite OS setting
 * ```
 */
export function setMotionForced(on: boolean): void {
  motionStore()?.setItem(FORCE_MOTION_KEY, on ? '1' : '0')
  if (typeof document !== 'undefined') document.documentElement.classList.toggle('force-motion', on)
  setMotionForcedSignal(on)
}

/**
 * Effective reduced-motion: reduced when calm mode (visual effects OFF) is on,
 * or when the OS asks for reduced motion and the user hasn't forced it. JS-driven
 * motion (SpaceBackground, count-up) gates on this rather than
 * prefersReducedMotion() directly.
 *
 * @example
 * ```ts
 * if (!motionReduced()) startParallaxLoop()
 * ```
 */
export function motionReduced(): boolean {
  return isCalm() || (prefersReducedMotion() && !motionForced())
}

/**
 * Tweens a numeric signal toward `target()` with Motion's `animate` (ease-out),
 * for KPI count-ups. Jumps straight to the target under reduced motion.
 *
 * @example
 * ```tsx
 * const animated = createCountUp(() => props.value, 800)
 * return <span>{Math.round(animated())}</span>
 * ```
 */
export function createCountUp(target: Accessor<number>, durationMs = 600): Accessor<number> {
  const [value, setValue] = createSignal(0)
  let controls: { stop: () => void } | undefined

  createEffect(() => {
    const to = target()
    controls?.stop()

    if (motionReduced()) {
      setValue(to)
      return
    }

    const from = untrack(value)
    if (from === to) return

    controls = animate(from, to, {
      duration: durationMs / 1000,
      ease: 'easeOut',
      onUpdate: (latest: number) => setValue(latest),
    })
  })

  onCleanup(() => controls?.stop())

  return value
}

/**
 * Fade + slide an element in on mount with Motion (ease-out), respecting
 * reduced motion (a no-op then). Call it from a ref/onMount; use `delay` to
 * stagger a row.
 *
 * @example
 * ```tsx
 * let el!: HTMLDivElement
 * onMount(() => animateIn(el, { delay: 0.1 }))
 * return <div ref={el}>…</div>
 * ```
 */
export function animateIn(el: Element, opts: { y?: number; duration?: number; delay?: number } = {}): void {
  if (motionReduced()) return
  animate(
    el,
    { opacity: [0, 1], y: [opts.y ?? 8, 0] },
    { duration: opts.duration ?? 0.32, delay: opts.delay ?? 0, ease: 'easeOut' },
  )
}
