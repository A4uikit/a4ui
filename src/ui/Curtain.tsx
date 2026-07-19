// Curtain — a controlled, full-screen cover→uncover transition primitive for
// page/route transitions. It collapses motion.dev's "curtains" example family
// (fade, sliding doors, blinds, shutter, iris) into one component driven by a
// single `show` boolean: `true` plays the "cover" animation (the curtain
// closes over the screen), `false` plays "uncover" (the curtain opens,
// revealing whatever's behind it). Swap your route content while covered —
// `onCovered` fires the instant the screen is fully masked, `onRevealed`
// once it's fully open again.
import { createEffect, createSignal, For, Index, on, onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { animate, motionReduced, stagger } from '../lib/motion'

export type CurtainVariant = 'fade' | 'doors' | 'blinds' | 'iris' | 'shutter'

export interface CurtainProps {
  /** true = cover the screen; false = uncover (reveal content). */
  show: boolean
  /** Which wipe style. @default 'fade' */
  variant?: CurtainVariant
  /** Overlay color (CSS color / var). @default 'hsl(var(--background))' */
  color?: string
  /** Seconds for one direction. @default 0.6 */
  duration?: number
  /** Called once the screen is fully covered (show went true→covered). */
  onCovered?: () => void
  /** Called once fully uncovered (show went false→revealed). */
  onRevealed?: () => void
  class?: string
}

interface CurtainControls {
  finished: Promise<unknown>
  stop: () => void
}

type CurtainPhase = 'covered' | 'uncovered' | 'covering' | 'uncovering'

const STRIP_COUNT = 8
const STRIP_INDICES = Array.from({ length: STRIP_COUNT }, (_, i) => i)

function combine(controls: CurtainControls[]): CurtainControls {
  return {
    finished: Promise.all(controls.map((c) => c.finished)),
    stop: () => {
      for (const c of controls) c.stop()
    },
  }
}

/**
 * A controlled full-screen curtain for page/route transitions. Set `show` to
 * `true` to cover the viewport, `false` to uncover it, and swap your route
 * content while covered. `variant` picks the wipe style — fade, sliding
 * doors, blinds, shutter (vertical blinds), or an iris/circle wipe —
 * `onCovered` / `onRevealed` fire once each transition finishes so you can
 * swap content at exactly the right moment. Skips the animation (and still
 * fires the callback on the next microtask) under reduced motion.
 *
 * @example
 * ```tsx
 * const [covered, setCovered] = createSignal(false)
 * const goTo = (path: string) => setCovered(true)
 * return (
 *   <>
 *     <Curtain
 *       show={covered()}
 *       variant="iris"
 *       onCovered={() => { loadRoute(); setCovered(false) }}
 *     />
 *     <Router />
 *   </>
 * )
 * ```
 */
export function Curtain(props: CurtainProps): JSX.Element {
  // eslint-disable-next-line solid/reactivity -- initial seed only; reactivity handled in the createEffect below
  const [phase, setPhase] = createSignal<CurtainPhase>(props.show ? 'covered' : 'uncovered')

  let controls: CurtainControls | undefined
  let panelA: HTMLDivElement | undefined
  let panelB: HTMLDivElement | undefined
  const strips: (HTMLDivElement | undefined)[] = []

  const color = () => props.color ?? 'hsl(var(--background))'

  function applyFinalState(variant: CurtainVariant, show: boolean): void {
    switch (variant) {
      case 'fade':
        if (panelA) panelA.style.opacity = show ? '1' : '0'
        break
      case 'doors':
        if (panelA) panelA.style.transform = show ? 'translateX(0%)' : 'translateX(-100%)'
        if (panelB) panelB.style.transform = show ? 'translateX(0%)' : 'translateX(100%)'
        break
      case 'blinds':
        for (const el of strips) if (el) el.style.transform = show ? 'scaleY(1)' : 'scaleY(0)'
        break
      case 'shutter':
        for (const el of strips) if (el) el.style.transform = show ? 'scaleX(1)' : 'scaleX(0)'
        break
      case 'iris':
        if (panelA) panelA.style.clipPath = show ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)'
        break
    }
  }

  function play(variant: CurtainVariant, show: boolean, duration: number): CurtainControls | undefined {
    const ease = 'easeInOut' as const

    switch (variant) {
      case 'fade': {
        if (!panelA) return undefined
        return animate(panelA, { opacity: show ? [0, 1] : [1, 0] }, { duration, ease })
      }
      case 'doors': {
        if (!panelA || !panelB) return undefined
        const left = animate(panelA, { x: show ? ['-100%', '0%'] : ['0%', '-100%'] }, { duration, ease })
        const right = animate(panelB, { x: show ? ['100%', '0%'] : ['0%', '100%'] }, { duration, ease })
        return combine([left, right])
      }
      case 'blinds': {
        const els = strips.filter((el): el is HTMLDivElement => el !== undefined)
        if (els.length === 0) return undefined
        return animate(els, { scaleY: show ? [0, 1] : [1, 0] }, { duration, delay: stagger(0.05), ease })
      }
      case 'shutter': {
        const els = strips.filter((el): el is HTMLDivElement => el !== undefined)
        if (els.length === 0) return undefined
        return animate(els, { scaleX: show ? [0, 1] : [1, 0] }, { duration, delay: stagger(0.05), ease })
      }
      case 'iris': {
        if (!panelA) return undefined
        return animate(
          panelA,
          {
            clipPath: show
              ? ['circle(0% at 50% 50%)', 'circle(150% at 50% 50%)']
              : ['circle(150% at 50% 50%)', 'circle(0% at 50% 50%)'],
          },
          { duration, ease },
        )
      }
      default:
        return undefined
    }
  }

  // Initial paint: the panels' inline styles already sit in the "uncovered"
  // pose, so we only need to snap them to "covered" when show starts true. No
  // animation on mount — that would flash the curtain in from its covered pose.
  onMount(() => {
    if (props.show) applyFinalState(props.variant ?? 'fade', true)
  })

  // Animate ONLY when `show` actually toggles (defer skips the mount run; variant
  // and duration are read untracked so switching variant while idle never plays).
  createEffect(
    on(
      () => props.show,
      (show) => {
        const variant = props.variant ?? 'fade'
        const duration = props.duration ?? 0.6

        controls?.stop()
        controls = undefined
        setPhase(show ? 'covering' : 'uncovering')

        const settle = () => {
          setPhase(show ? 'covered' : 'uncovered')
          if (show) props.onCovered?.()
          else props.onRevealed?.()
        }

        if (motionReduced()) {
          applyFinalState(variant, show)
          queueMicrotask(settle)
          return
        }

        const played = play(variant, show, duration)
        if (!played) {
          queueMicrotask(settle)
          return
        }

        controls = played
        played.finished.then(settle).catch(() => {})
      },
      { defer: true },
    ),
  )

  onCleanup(() => controls?.stop())

  return (
    <div
      class={cn('pointer-events-none fixed inset-0 z-[9999]', props.class)}
      aria-hidden="true"
      data-curtain-variant={props.variant ?? 'fade'}
      data-curtain-state={phase()}
    >
      {(props.variant ?? 'fade') === 'fade' && (
        <div
          class="absolute inset-0"
          style={{ position: 'absolute', opacity: 0, background: color() }}
          ref={(el) => {
            panelA = el
          }}
        />
      )}

      {(props.variant ?? 'fade') === 'doors' && (
        <>
          <div
            class="absolute inset-y-0 left-0 w-1/2"
            style={{ position: 'absolute', transform: 'translateX(-100%)', background: color() }}
            ref={(el) => {
              panelA = el
            }}
          />
          <div
            class="absolute inset-y-0 right-0 w-1/2"
            style={{ position: 'absolute', transform: 'translateX(100%)', background: color() }}
            ref={(el) => {
              panelB = el
            }}
          />
        </>
      )}

      {(props.variant ?? 'fade') === 'blinds' && (
        <Index each={STRIP_INDICES}>
          {(_, index) => (
            <div
              class="absolute left-0 h-[12.5%] w-full origin-top"
              style={{
                position: 'absolute',
                top: `${index * 12.5}%`,
                transform: 'scaleY(0)',
                background: color(),
              }}
              ref={(el) => {
                strips[index] = el
              }}
            />
          )}
        </Index>
      )}

      {(props.variant ?? 'fade') === 'shutter' && (
        <For each={STRIP_INDICES}>
          {(_, index) => (
            <div
              class="absolute top-0 h-full w-[12.5%] origin-left"
              style={{
                position: 'absolute',
                left: `${index() * 12.5}%`,
                transform: 'scaleX(0)',
                background: color(),
              }}
              ref={(el) => {
                strips[index()] = el
              }}
            />
          )}
        </For>
      )}

      {(props.variant ?? 'fade') === 'iris' && (
        <div
          class="absolute inset-0"
          style={{ position: 'absolute', 'clip-path': 'circle(0% at 50% 50%)', background: color() }}
          ref={(el) => {
            panelA = el
          }}
        />
      )}
    </div>
  )
}
