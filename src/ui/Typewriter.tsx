// Terminal-style text reveal: characters appear one at a time via a plain
// setTimeout loop (not a CSS transition, since each character is a discrete
// reveal step, not a tween). Accepts a single string or an array to cycle
// through — type, pause, delete, type the next — with an optional blinking
// caret, whose keyframe is injected once into the document head (mirroring
// LoadingDots's approach to a component-scoped CSS animation).
import { createSignal, onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface TypewriterProps {
  /** The full string (or strings, cycled) to type out. */
  text: string | string[]
  /** ms per character. @default 55 */
  speed?: number
  /** ms to pause on a completed string before deleting (only when `text` is an array). @default 1400 */
  pause?: number
  /** Show a blinking caret. @default true */
  caret?: boolean
  /** Loop through the array forever. @default true when text is an array */
  loop?: boolean
  class?: string
}

const STYLE_ID = 'a4ui-typewriter-style'

function ensureStyleInjected(): void {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
@keyframes a4-caret-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
`
  document.head.appendChild(style)
}

function toList(text: string | string[]): string[] {
  return Array.isArray(text) ? text : [text]
}

/**
 * Types `text` out one character at a time, like a terminal. When `text` is
 * an array, each string types in, holds for `pause` ms, then deletes before
 * the next one types in — cycling forever unless `loop` is `false` (defaults
 * to looping only when there's more than one string). Shows the first (or
 * only) string statically, with no typing and no caret blink, when the user
 * prefers reduced motion.
 *
 * @example
 * ```tsx
 * <Typewriter text={['Building things…', 'Shipping things…']} speed={40} />
 * ```
 */
export function Typewriter(props: TypewriterProps): JSX.Element {
  ensureStyleInjected()

  // eslint-disable-next-line solid/reactivity -- one-time seed; run() re-reads props.text on each (re)start
  const [display, setDisplay] = createSignal(motionReduced() ? (toList(props.text)[0] ?? '') : '')

  let timer: ReturnType<typeof setTimeout> | undefined

  const stop = (): void => {
    if (timer === undefined) return
    clearTimeout(timer)
    timer = undefined
  }

  const run = (): void => {
    stop()
    const list = toList(props.text)
    const first = list[0] ?? ''

    if (motionReduced() || list.length === 0) {
      setDisplay(first)
      return
    }

    const speed = props.speed ?? 55
    const pause = props.pause ?? 1400
    const shouldLoop = props.loop ?? list.length > 1

    let stringIndex = 0
    let charIndex = 0
    let phase: 'typing' | 'pausing' | 'deleting' = 'typing'

    const step = (): void => {
      const text = list[stringIndex] ?? ''

      if (phase === 'typing') {
        charIndex += 1
        setDisplay(text.slice(0, charIndex))
        if (charIndex >= text.length) {
          const isLastString = stringIndex >= list.length - 1
          if (list.length <= 1 || (isLastString && !shouldLoop)) {
            stop()
            return
          }
          phase = 'pausing'
          timer = setTimeout(step, pause)
          return
        }
        timer = setTimeout(step, speed)
        return
      }

      if (phase === 'pausing') {
        phase = 'deleting'
        timer = setTimeout(step, speed)
        return
      }

      // deleting
      charIndex -= 1
      setDisplay(text.slice(0, Math.max(0, charIndex)))
      if (charIndex <= 0) {
        stringIndex = (stringIndex + 1) % list.length
        phase = 'typing'
      }
      timer = setTimeout(step, speed)
    }

    setDisplay('')
    timer = setTimeout(step, speed)
  }

  onMount(run)
  onCleanup(stop)

  const showCaret = (): boolean => (props.caret ?? true) && !motionReduced()

  return (
    <span class={cn('font-mono', props.class)}>
      {display()}
      {showCaret() && (
        <span
          aria-hidden="true"
          class="inline-block"
          style={{ animation: 'a4-caret-blink 1s step-end infinite' }}
        >
          |
        </span>
      )}
    </span>
  )
}
