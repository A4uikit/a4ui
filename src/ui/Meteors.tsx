// Meteors — Aceternity-style decorative meteor shower: thin diagonal streaks
// that fall down-left and fade, looping with per-meteor stagger. Pure CSS
// keyframes (injected once into the document head, like LoadingDots) so the
// motion costs nothing in JS; each meteor's position/delay/duration is derived
// deterministically from its index (no Math.random, so the layout is
// reproducible across renders and safe under SSR).
import { For, type JSX, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface MeteorsProps {
  /** Number of meteor streaks to render. @default 20 */
  count?: number
  class?: string
}

const STYLE_ID = 'a4ui-meteors-style'

function ensureStyleInjected(): void {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
@keyframes a4-meteor-fall {
  0% { transform: rotate(215deg) translateX(0); opacity: 1; }
  70% { opacity: 1; }
  100% { transform: rotate(215deg) translateX(-500px); opacity: 0; }
}
`
  document.head.appendChild(style)
}

/**
 * Deterministic pseudo-random value in [0, 1) derived from an index via a
 * sine-based hash. Used to vary each meteor's position/timing without
 * `Math.random`, so the layout is identical across renders (and SSR-safe).
 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Decorative full-cover meteor shower: thin diagonal streaks that fall
 * down-left and fade, looping with staggered delays and varied start
 * positions/durations. Purely visual — absolute, `pointer-events-none`,
 * `aria-hidden` — so it layers behind/inside a `relative overflow-hidden`
 * container without affecting layout or a11y. Under {@link motionReduced} it
 * swaps the falling streaks for a handful of static, faint dots.
 *
 * @example
 * ```tsx
 * <div class="relative overflow-hidden rounded-2xl border border-border p-8">
 *   <Meteors count={20} />
 *   <p class="relative">Content sits above the meteors.</p>
 * </div>
 * ```
 */
export function Meteors(props: MeteorsProps): JSX.Element {
  ensureStyleInjected()

  const count = () => props.count ?? 20
  const meteors = () => Array.from({ length: count() })
  const staticDots = () => Array.from({ length: Math.min(6, count()) })

  return (
    <div class={cn('pointer-events-none absolute inset-0 overflow-hidden', props.class)} aria-hidden="true">
      <Show
        when={!motionReduced()}
        fallback={
          <For each={staticDots()}>
            {(_, i) => (
              <span
                class="absolute h-0.5 w-0.5 rounded-full bg-foreground/30"
                style={{
                  top: `${pseudoRandom(i() * 2 + 1) * 100}%`,
                  left: `${pseudoRandom(i() * 2 + 2) * 100}%`,
                }}
              />
            )}
          </For>
        }
      >
        <For each={meteors()}>
          {(_, i) => {
            const left = pseudoRandom(i() * 2 + 1) * 100
            const delay = pseudoRandom(i() * 2 + 2) * 8
            const duration = 2 + pseudoRandom(i() * 3 + 5) * 5

            return (
              <span
                class={cn(
                  'absolute top-0 h-0.5 w-0.5 rotate-[215deg] rounded-full bg-foreground',
                  "before:absolute before:top-1/2 before:h-px before:w-12 before:-translate-y-1/2 before:bg-gradient-to-r before:from-foreground/60 before:to-transparent before:content-['']",
                )}
                style={{
                  left: `${left}%`,
                  animation: `a4-meteor-fall ${duration}s linear infinite`,
                  'animation-delay': `${delay}s`,
                }}
              />
            )
          }}
        </For>
      </Show>
    </div>
  )
}
