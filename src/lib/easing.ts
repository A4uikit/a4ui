// Shared motion vocabulary — named easing curves and spring presets, so every
// component transition can pull from one consistent set instead of hand-rolling
// cubic-beziers. `EASE` values are plain CSS `transition-timing-function`
// strings (drop into an inline style, a `transition-timing-function`, or a
// Tailwind `ease-[…]` arbitrary value). `SPRING` values are option objects for
// the `spring` helper re-exported from `@a4ui/core` (motion.dev).

/** Named cubic-bezier easing curves, as CSS `transition-timing-function` strings. */
export const EASE = {
  /** Gentle ease-out — the sensible default for entrances and most UI motion. */
  out: 'cubic-bezier(0.22, 1, 0.36, 1)',
  /** Balanced ease-in-out for reversible state toggles. */
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  /** Emphasized, decisive curve (fast start, long settle) for hero moments. */
  emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  /** No easing. */
  linear: 'linear',
} as const

/** A key of {@link EASE}. */
export type EaseName = keyof typeof EASE

/**
 * Spring option presets for the `spring` helper (motion.dev), re-exported from
 * `@a4ui/core`. Pass one straight through:
 *
 * @example
 * ```ts
 * import { animate, spring, SPRING } from '@a4ui/core'
 * animate(el, { y: 0 }, { type: spring, ...SPRING.snappy })
 * ```
 */
export const SPRING = {
  /** Soft, natural settle — good for panels and layout shifts. */
  gentle: { stiffness: 170, damping: 26 },
  /** Quick and tight, minimal overshoot — good for toggles and small controls. */
  snappy: { stiffness: 320, damping: 30 },
  /** Playful overshoot — good for playful accents. Use sparingly. */
  bouncy: { stiffness: 420, damping: 18 },
} as const

/** A key of {@link SPRING}. */
export type SpringName = keyof typeof SPRING
