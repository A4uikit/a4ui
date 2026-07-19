// Text that "decodes" into place: characters scramble through random glyphs
// before locking, left to right, into the final string — motion.dev's
// scramble-text effect, reimplemented here with a plain setInterval (locking
// one more character's worth of the string on each tick) rather than the
// `motion` package, since the effect is character substitution, not a tween.
import { createSignal, onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface ScrambleTextProps {
  text: string
  /** When to run: on mount, or on hover. @default 'mount' */
  trigger?: 'mount' | 'hover'
  /** Total scramble duration in ms. @default 800 */
  duration?: number
  class?: string
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*<>-_'
const TICK_MS = 30

function randomGlyph(): string {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)] as string
}

/**
 * Text that scrambles through random glyphs before "decoding" into the final
 * string, left to right, over `duration` ms. Runs once on mount by default;
 * pass `trigger="hover"` to (re)run it — cleanly restarting if it's still
 * mid-scramble — on pointer hover instead. Renders the final text as-is, with
 * no scramble, when the user prefers reduced motion.
 *
 * @example
 * ```tsx
 * <ScrambleText text="ACCESS GRANTED" trigger="hover" duration={600} />
 * ```
 */
export function ScrambleText(props: ScrambleTextProps): JSX.Element {
  // eslint-disable-next-line solid/reactivity -- one-time seed; scramble() re-reads props.text on each run
  const [display, setDisplay] = createSignal(props.text)
  let intervalId: ReturnType<typeof setInterval> | undefined

  const stop = (): void => {
    if (intervalId === undefined) return
    clearInterval(intervalId)
    intervalId = undefined
  }

  const scramble = (): void => {
    const text = props.text
    if (motionReduced()) {
      setDisplay(text)
      return
    }

    // Restart cleanly if a previous scramble (from a prior trigger) is still running.
    stop()
    const totalTicks = Math.max(1, Math.round((props.duration ?? 800) / TICK_MS))
    let tick = 0

    intervalId = setInterval(() => {
      tick += 1

      if (tick >= totalTicks) {
        setDisplay(text)
        stop()
        return
      }

      const lockedCount = Math.floor((tick / totalTicks) * text.length)
      setDisplay(
        text
          .split('')
          .map((char, i) => (char === ' ' || i < lockedCount ? char : randomGlyph()))
          .join(''),
      )
    }, TICK_MS)
  }

  onMount(() => {
    if (props.trigger !== 'hover') scramble()
  })
  onCleanup(stop)

  const handleMouseEnter = (): void => {
    if (props.trigger === 'hover') scramble()
  }

  return (
    <span class={cn('font-mono', props.class)} onMouseEnter={handleMouseEnter}>
      {display()}
    </span>
  )
}
