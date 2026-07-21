// LikeButton — a like/favorite/save-later toggle driven by the `icon` prop
// (heart/star/bookmark) instead of three near-identical components. On
// becoming pressed the icon fills, morphs to the accent color, springs a
// scale pop (Motion's `spring`), and bursts a handful of tiny icon copies
// outward (staggered via `stagger`) before fading. Only `transform`/`opacity`
// are animated, matching this file's Motion helpers (see ../lib/motion.ts).
import { Bookmark, Heart, Star, type LucideProps } from 'lucide-solid'
import type { Component, JSX } from 'solid-js'
import { createEffect, createMemo, createSignal, For, onCleanup, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { cn } from '../lib/cn'
import { animate, motionReduced, spring, stagger } from '../lib/motion'

/** Which icon a {@link LikeButton} renders — picks the semantic use (like/favorite/save). */
export type LikeButtonIcon = 'heart' | 'star' | 'bookmark'

const ICONS: Record<LikeButtonIcon, Component<LucideProps>> = {
  heart: Heart,
  star: Star,
  bookmark: Bookmark,
}

const BURST_COUNT = 5
const BURST_RADIUS_PX = 18
const BURST_STAGGER_S = 0.03
const BURST_DURATION_S = 0.5

interface BurstParticle {
  id: number
  angle: number
}

export interface LikeButtonProps {
  /** Controlled pressed state. When set, wins over internal state — pair with `onChange`. */
  pressed?: boolean
  /** Initial pressed state for uncontrolled use. @default false */
  defaultPressed?: boolean
  onChange?: (pressed: boolean) => void
  /** Which icon to render. @default 'heart' */
  icon?: LikeButtonIcon
  /** Count shown next to the icon (e.g. total likes). */
  count?: number
  /** Show `count`. @default false */
  showCount?: boolean
  /** Class applied to the icon/count when pressed. @default 'text-primary' */
  activeClass?: string
  class?: string
  'aria-label'?: string
}

/**
 * Like/favorite/save-later toggle button. One component covers all three via
 * `icon` ('heart' | 'star' | 'bookmark') rather than three near-identical
 * toggles. On becoming pressed the icon fills, morphs to `activeClass`,
 * springs a scale pop, and bursts a handful of tiny icon copies outward —
 * skipped under reduced motion, which just flips the filled/unfilled state
 * instantly. Works controlled (`pressed` + `onChange`) or uncontrolled
 * (`defaultPressed`).
 *
 * @example
 * ```tsx
 * <LikeButton defaultPressed count={128} showCount aria-label="Like this post" />
 * ```
 */
export function LikeButton(props: LikeButtonProps): JSX.Element {
  const [internalPressed, setInternalPressed] = createSignal(props.defaultPressed ?? false)
  const pressed = createMemo(() => props.pressed ?? internalPressed())
  const Icon = createMemo(() => ICONS[props.icon ?? 'heart'])

  const [particles, setParticles] = createSignal<BurstParticle[]>([])
  const particleEls = new Map<number, HTMLSpanElement>()
  let particleId = 0
  let iconEl: SVGSVGElement | undefined
  let countEl: HTMLSpanElement | undefined
  let popControls: ReturnType<typeof animate> | undefined
  let disposed = false

  onCleanup(() => {
    disposed = true
    popControls?.stop()
  })

  // Fade + slide the count in whenever it changes (not on initial mount), skipped under reduced motion.
  let hasMountedCount = false
  createEffect(() => {
    void props.count
    if (hasMountedCount && countEl && !motionReduced()) {
      animate(countEl, { opacity: [0, 1], y: [-6, 0] }, { duration: 0.22, ease: 'easeOut' })
    }
    hasMountedCount = true
  })

  const playPop = (): void => {
    if (!iconEl) return
    popControls?.stop()
    const el = iconEl
    popControls = animate(el, { scale: 1.3 }, { type: spring, stiffness: 600, damping: 10 })
    popControls.finished
      .then(() => {
        if (disposed) return
        popControls = animate(el, { scale: 1 }, { type: spring, stiffness: 500, damping: 14 })
      })
      .catch(() => {})
  }

  const spawnBurst = (): void => {
    const delayFor = stagger(BURST_STAGGER_S)
    const next: BurstParticle[] = Array.from({ length: BURST_COUNT }, (_, index) => ({
      id: particleId++,
      angle: (360 / BURST_COUNT) * index,
    }))
    setParticles((current) => [...current, ...next])

    queueMicrotask(() => {
      if (disposed) return
      const finished = next.map((particle, index) => {
        const el = particleEls.get(particle.id)
        if (!el) return Promise.resolve()
        const radians = (particle.angle * Math.PI) / 180
        const dx = Math.cos(radians) * BURST_RADIUS_PX
        const dy = Math.sin(radians) * BURST_RADIUS_PX
        const controls = animate(
          el,
          {
            transform: [
              'translate(-50%, -50%) scale(0.9)',
              `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.3)`,
            ],
            opacity: [1, 0],
          },
          { duration: BURST_DURATION_S, delay: delayFor(index, next.length), ease: 'easeOut' },
        )
        return controls.finished
      })

      Promise.allSettled(finished).then(() => {
        for (const particle of next) particleEls.delete(particle.id)
        if (disposed) return
        setParticles((current) => current.filter((p) => !next.some((n) => n.id === p.id)))
      })
    })
  }

  const handleClick = (): void => {
    const next = !pressed()
    if (props.pressed === undefined) setInternalPressed(next)
    props.onChange?.(next)

    if (!next || motionReduced()) return
    playPop()
    spawnBurst()
  }

  return (
    <button
      type="button"
      aria-pressed={pressed()}
      aria-label={props['aria-label']}
      class={cn(
        'inline-flex items-center gap-1.5 rounded-md text-muted-foreground transition-colors hover:text-foreground',
        pressed() && (props.activeClass ?? 'text-primary'),
        props.class,
      )}
      onClick={handleClick}
    >
      <span class="relative inline-flex h-5 w-5 items-center justify-center">
        <Dynamic
          component={Icon()}
          ref={(el: SVGSVGElement) => {
            iconEl = el
          }}
          class={cn('h-5 w-5 will-change-transform', pressed() && 'fill-current')}
        />
        <span class="pointer-events-none absolute inset-0" aria-hidden="true">
          <For each={particles()}>
            {(particle) => (
              <span
                ref={(el) => particleEls.set(particle.id, el)}
                class="absolute left-1/2 top-1/2 h-2.5 w-2.5 will-change-transform"
                style={{ transform: 'translate(-50%, -50%)' }}
              >
                <Dynamic
                  component={Icon()}
                  class={cn('h-2.5 w-2.5 fill-current', props.activeClass ?? 'text-primary')}
                />
              </span>
            )}
          </For>
        </span>
      </span>
      <Show when={props.showCount}>
        <span ref={countEl} class="tabular-nums will-change-transform">
          {props.count}
        </span>
      </Show>
    </button>
  )
}
