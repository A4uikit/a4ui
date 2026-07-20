// Streams `text` in as new characters are appended — eases in the newly
// added tail at `speed` chars/sec (via a rAF loop) rather than snapping
// straight to the new length, with a blinking caret while more is expected.
// Built for AI answer UIs where `text` grows incrementally as tokens arrive.
import { createEffect, createSignal, onCleanup, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface StreamingTextProps {
  /** The (possibly growing) full text so far. */
  text: string
  /** Whether more text is still coming; shows the blinking caret while `true`. @default true */
  streaming?: boolean
  /** Reveal speed, in characters per second, for newly appended text. @default 120 */
  speed?: number
  class?: string
}

/**
 * Reveals `text` as it "streams" in: when `text` grows, the newly appended
 * characters ease in at `speed` chars/sec instead of snapping into place,
 * with a blinking caret while `streaming`. Already-revealed characters never
 * re-animate — only the new tail is eased in, so appending to `text` doesn't
 * replay the whole reveal. Skips the reveal (shows the full text at once)
 * under reduced motion — the caret still blinks while `streaming` in that
 * case. `streaming={false}` shows the full text immediately with no caret,
 * for the final/settled answer.
 *
 * @example
 * ```tsx
 * <StreamingText text={answer()} streaming={!done()} />
 * ```
 */
export function StreamingText(props: StreamingTextProps): JSX.Element {
  // eslint-disable-next-line solid/reactivity -- one-time seed; the effect below re-reads props.text on each change
  const [revealed, setRevealed] = createSignal(motionReduced() ? props.text.length : 0)

  let raf: number | undefined
  let prevText = ''

  const stop = (): void => {
    if (raf === undefined) return
    cancelAnimationFrame(raf)
    raf = undefined
  }

  createEffect(() => {
    const text = props.text
    const isAppend = text.startsWith(prevText)
    const from = isAppend ? revealed() : 0
    prevText = text

    stop()

    if (motionReduced() || (props.streaming ?? true) === false) {
      setRevealed(text.length)
      return
    }

    if (from >= text.length) {
      setRevealed(text.length)
      return
    }

    const speed = props.speed ?? 120
    let count = from
    let last: number | undefined

    const step = (now: number): void => {
      if (last === undefined) last = now
      const elapsed = (now - last) / 1000
      last = now
      count = Math.min(text.length, count + elapsed * speed)
      setRevealed(Math.floor(count))
      raf = count < text.length ? requestAnimationFrame(step) : undefined
    }

    setRevealed(from)
    raf = requestAnimationFrame(step)
  })

  onCleanup(stop)

  const display = (): string => props.text.slice(0, revealed())
  const showCaret = (): boolean => props.streaming ?? true

  return (
    <span class={cn('whitespace-pre-wrap', props.class)}>
      {display()}
      {showCaret() && (
        <span aria-hidden="true" class="animate-pulse text-current motion-reduce:animate-none">
          ▍
        </span>
      )}
    </span>
  )
}
