// Star rating input. Filled/empty stars are driven by the current value (or a
// transient hover preview); interactive mode renders each star as a keyboard-
// accessible button, readonly mode renders a plain, labelled row of icons.
import { Star } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createSignal, For, Show } from 'solid-js'

import { cn } from '../lib/cn'

export interface RatingProps {
  /** Currently selected rating, from 0 to `max`. */
  value: number
  /** Called with the new rating when a star is clicked or set via keyboard. */
  onChange?: (value: number) => void
  /** Number of stars to render. Default: 5. */
  max?: number
  /** Render a non-interactive, display-only rating. Default: false. */
  readonly?: boolean
  class?: string
}

/**
 * Star rating control. In interactive mode each star is a button: click or use
 * the Left/Right arrow keys to set the rating, and hovering previews it. In
 * `readonly` mode it renders as a static, labelled row of stars.
 *
 * @example
 * ```tsx
 * <Rating value={rating()} onChange={setRating} max={5} />
 * ```
 */
export function Rating(props: RatingProps): JSX.Element {
  const [hover, setHover] = createSignal(0)
  const max = () => props.max ?? 5
  const stars = () => Array.from({ length: max() }, (_, i) => i + 1)

  // The value used to paint stars: hover preview takes precedence when active.
  const active = () => (hover() > 0 ? hover() : props.value)

  const set = (n: number) => {
    if (props.readonly) return
    props.onChange?.(n)
  }

  const starClass = (index: number) =>
    cn(
      'h-5 w-5 transition-colors',
      index <= active() ? 'fill-primary text-primary' : 'fill-transparent text-muted-foreground',
    )

  return (
    <Show
      when={!props.readonly}
      fallback={
        <div
          class={cn('inline-flex items-center gap-1', props.class)}
          role="img"
          aria-label={`Rating ${props.value} of ${max()}`}
        >
          <For each={stars()}>{(n) => <Star class={starClass(n)} aria-hidden="true" />}</For>
        </div>
      }
    >
      <div
        class={cn('inline-flex items-center gap-1', props.class)}
        role="radiogroup"
        onMouseLeave={() => setHover(0)}
      >
        <For each={stars()}>
          {(n) => (
            <button
              type="button"
              role="radio"
              aria-checked={props.value === n}
              aria-label={`Rate ${n} of ${max()}`}
              class="rounded outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(0)}
              onClick={() => set(n)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                  e.preventDefault()
                  set(Math.min(props.value + 1, max()))
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                  e.preventDefault()
                  set(Math.max(props.value - 1, 0))
                }
              }}
            >
              <Star class={starClass(n)} aria-hidden="true" />
            </button>
          )}
        </For>
      </div>
    </Show>
  )
}
