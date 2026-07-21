// CardSpread — a stack of cards that fans out into one of several layouts.
// Rest state is a tight near-centered stack; opening (controlled via `open`,
// or on hover when uncontrolled) spreads the cards per `layout`. Only
// `transform`/`opacity` are animated (Motion spring), never layout properties,
// so the fan stays compositor-only. Reduced motion renders the spread layout
// statically (no transition, no hover animation).
import { createEffect, createSignal, For, on, onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { animate, motionReduced } from '../lib/motion'

/** Fan shape applied when a {@link CardSpread} opens. Defaults to `'arc'`. */
export type CardSpreadLayout = 'arc' | 'long-arc' | 'linear' | 'corner' | 'cascade' | 'scatter' | 'wheel'

export interface CardSpreadProps {
  /** Card contents; each entry becomes one card in the stack. */
  items: JSX.Element[]
  /** Fan shape. @default 'arc' */
  layout?: CardSpreadLayout
  /** Controlled open state. Omit to spread on hover instead. */
  open?: boolean
  /** Strength knob: degrees for arced/wheel layouts, px for linear/corner/cascade/scatter. Per-layout default applies when omitted. */
  spread?: number
  class?: string
  'aria-label'?: string
}

interface CardTransform {
  x: number
  y: number
  rotate: number
  origin: string
}

const DEFAULT_SPREAD: Record<CardSpreadLayout, number> = {
  arc: 10,
  'long-arc': 6,
  linear: 56,
  corner: 12,
  cascade: 18,
  scatter: 14,
  wheel: 16,
}

// Deterministic pseudo-random offset in [-1, 1] from an index — no Math.random.
function pseudoRandom(i: number): number {
  const s = Math.sin(i * 12.9898) * 43758.5453
  return (s - Math.floor(s)) * 2 - 1
}

function restTransform(i: number): CardTransform {
  // Tight near-centered stack: a hair of offset/rotation per card so the
  // pile still reads as separate cards.
  return { x: i * 1.5, y: -i * 1, rotate: (i % 2 === 0 ? 1 : -1) * 1.5, origin: 'bottom center' }
}

function openTransform(layout: CardSpreadLayout, i: number, n: number, spread: number): CardTransform {
  const mid = (n - 1) / 2
  const d = i - mid

  switch (layout) {
    case 'arc': {
      const gap = 44
      return { x: d * gap, y: Math.abs(d) ** 2 * 6, rotate: d * spread, origin: 'bottom center' }
    }
    case 'long-arc': {
      const gap = 68
      return { x: d * gap, y: Math.abs(d) ** 2 * 4, rotate: d * spread, origin: 'bottom center' }
    }
    case 'linear':
      return { x: d * spread, y: 0, rotate: 0, origin: 'bottom center' }
    case 'corner':
      return { x: i * (spread * 0.6), y: -i * (spread * 0.15), rotate: i * spread, origin: 'bottom left' }
    case 'cascade':
      return {
        x: i * spread,
        y: i * (spread * 0.55),
        rotate: (i % 2 === 0 ? 1 : -1) * 3,
        origin: 'bottom center',
      }
    case 'scatter': {
      const r = pseudoRandom(i)
      const r2 = pseudoRandom(i + 100)
      return { x: r * spread * 3, y: r2 * spread * 1.5, rotate: r * spread, origin: 'center center' }
    }
    case 'wheel':
      return { x: d * 18, y: Math.abs(d) * 10, rotate: d * spread, origin: 'bottom center' }
  }
}

function transformString(t: CardTransform): string {
  return `translate(${t.x}px, ${t.y}px) rotate(${t.rotate}deg)`
}

/**
 * A stack of cards that fans out into an arc, line, corner, cascade, scatter,
 * or wheel shape. At rest the cards sit in a near-centered pile; opening
 * (controlled via `open`, or on hover when uncontrolled) spreads them.
 * Animates only `transform`/`opacity` (Motion spring) so the fan stays
 * compositor-only, and falls back to a static fanned layout under reduced
 * motion.
 *
 * @example
 * ```tsx
 * <CardSpread
 *   layout="arc"
 *   aria-label="Trip itinerary cards"
 *   items={[
 *     <div class="p-4">Day 1 — Arrival</div>,
 *     <div class="p-4">Day 2 — Old Town</div>,
 *     <div class="p-4">Day 3 — Coast drive</div>,
 *   ]}
 * />
 * ```
 */
export function CardSpread(props: CardSpreadProps): JSX.Element {
  const cardRefs: (HTMLElement | undefined)[] = []
  const controls: (ReturnType<typeof animate> | undefined)[] = []
  const [hovered, setHovered] = createSignal(false)

  const layout = () => props.layout ?? 'arc'
  const spread = () => props.spread ?? DEFAULT_SPREAD[layout()]
  const isOpen = () => (props.open !== undefined ? props.open : hovered())

  // Reduced motion always renders the fanned layout, statically, regardless
  // of open/hover state — so `open`/`hover` never trigger visible motion.
  const applyTransforms = (animated: boolean) => {
    const n = props.items.length
    const reduced = motionReduced()
    const open = reduced ? true : isOpen()

    cardRefs.forEach((card, i) => {
      if (!card) return
      const t = open ? openTransform(layout(), i, n, spread()) : restTransform(i)
      card.style.transformOrigin = t.origin
      card.style.zIndex = String(open ? i : n - i)

      controls[i]?.stop()
      if (reduced || !animated) {
        card.style.transform = transformString(t)
        return
      }
      controls[i] = animate(
        card,
        { x: t.x, y: t.y, rotate: t.rotate },
        { type: 'spring', stiffness: 260, damping: 24 },
      )
    })
  }

  // Initial paint only: snap to the correct state (no animation) so a controlled
  // `open` or a reduced-motion preference doesn't flash the closed stack first.
  // Deliberately untracked (onMount, not createEffect) — it must run exactly
  // once, otherwise it would re-fire on every hover/open change and snap the
  // cards straight to their target, leaving the animated effect below nothing
  // to spring from.
  onMount(() => applyTransforms(false))
  // Subsequent changes to open/hover/layout/spread animate in.
  createEffect(
    on([() => props.open, hovered, layout, spread, () => props.items.length], () => applyTransforms(true), {
      defer: true,
    }),
  )
  onCleanup(() => controls.forEach((c) => c?.stop()))

  const handleEnter = () => {
    if (props.open === undefined && !motionReduced()) setHovered(true)
  }
  const handleLeave = () => {
    if (props.open === undefined && !motionReduced()) setHovered(false)
  }

  return (
    <div
      role="group"
      aria-label={props['aria-label']}
      class={cn('relative inline-block h-56 w-40', props.class)}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      <For each={props.items}>
        {(item, i) => (
          <div
            ref={(el) => (cardRefs[i()] = el)}
            class="absolute inset-x-0 top-0 h-56 w-40 rounded-xl border border-border bg-card text-card-foreground shadow-sm will-change-transform"
            style={{ transform: transformString(restTransform(i())) }}
          >
            {item}
          </div>
        )}
      </For>
    </div>
  )
}
