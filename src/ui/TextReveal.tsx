// Reveal text word-by-word or char-by-char with a Motion (motion.dev) stagger:
// each unit starts translated down and transparent, then fades/slides in with
// `animate`'s `delay: stagger(...)`, either on mount or the first time the
// text scrolls into view (`inView`). Whitespace units are rendered as plain
// text (not wrapped/animated) so word spacing stays exactly what it would be
// without the effect.
import { createMemo, onMount, For, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { animate, inView, motionReduced, stagger } from '../lib/motion'

export interface TextRevealProps {
  text: string
  /** Split unit. @default 'word' */
  by?: 'word' | 'char'
  /** Reveal when scrolled into view instead of on mount. @default false */
  onView?: boolean
  class?: string
}

/** Split `text` into render units: words with their surrounding spaces kept as separate whitespace units, or individual characters. */
function splitUnits(text: string, by: 'word' | 'char'): string[] {
  if (by === 'char') return text.split('')
  return text.split(/(\s+)/).filter((unit) => unit.length > 0)
}

const isWhitespace = (unit: string): boolean => /^\s+$/.test(unit)

/**
 * Reveals `text`, split into words or characters, with a staggered
 * fade + slide-up (via Motion's `animate` + `stagger`). Runs once on mount by
 * default; pass `onView` to instead reveal the first time the component
 * scrolls into view. Whitespace between words renders as plain text, not an
 * animated unit. Under reduced motion, everything stays visible and no
 * animation runs.
 *
 * @example
 * ```tsx
 * <TextReveal text="Ship it." by="char" onView />
 * ```
 */
export function TextReveal(props: TextRevealProps): JSX.Element {
  const units = createMemo(() => splitUnits(props.text, props.by ?? 'word'))
  const spans: (HTMLSpanElement | undefined)[] = []
  let root: HTMLSpanElement | undefined

  const reveal = (): void => {
    const targets = spans.filter((el): el is HTMLSpanElement => el !== undefined)
    if (targets.length === 0) return
    animate(
      targets,
      { opacity: [0, 1], y: [12, 0] },
      { delay: stagger(0.03), duration: 0.4, ease: 'easeOut' },
    )
  }

  onMount(() => {
    if (motionReduced()) return

    for (const el of spans) {
      if (el) el.style.opacity = '0'
    }

    if (props.onView) {
      if (!root) return
      inView(root, () => reveal(), { amount: 0.3 })
      return
    }

    reveal()
  })

  return (
    <span class={cn(props.class)} ref={root}>
      <For each={units()}>
        {(unit, index) =>
          isWhitespace(unit) ? (
            unit
          ) : (
            <span
              class="inline-block will-change-transform"
              ref={(el) => {
                spans[index()] = el
              }}
            >
              {unit}
            </span>
          )
        }
      </For>
    </span>
  )
}
