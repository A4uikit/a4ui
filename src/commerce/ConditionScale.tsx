// Horizontal grading meter for a graded score (e.g. a pre-owned item's
// condition), with a positioned marker, the resolved tier label, and
// endpoint labels under the track.
import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { cn } from '../lib/cn'

export interface ConditionTier {
  /** Minimum score (inclusive) at which this tier applies. */
  min: number
  label: string
}

export interface ConditionScaleProps {
  /** Current score. */
  value: number
  /** Top of the scale. Defaults to 10. */
  max?: number
  /** Bottom of the scale. Defaults to 1. */
  min?: number
  /** Tier labels, highest `min` first or any order — component sorts. Defaults to a sensible New→Poor scale. */
  tiers?: ConditionTier[]
  /** Show numeric value (e.g. "8.5 / 10"). Defaults to true. */
  showValue?: boolean
  class?: string
}

const DEFAULT_TIERS: ConditionTier[] = [
  { min: 10, label: 'Brand New' },
  { min: 9, label: 'Excellent' },
  { min: 7, label: 'Very Good' },
  { min: 5, label: 'Good' },
  { min: 1, label: 'Fair' },
]

/**
 * Horizontal grading meter (e.g. a pre-owned item's 1–10 condition score)
 * with a marker at the current value, the resolved tier label, and endpoint
 * labels under the track.
 *
 * @example
 * ```tsx
 * <ConditionScale value={8} />
 * ```
 *
 * @example
 * ```tsx
 * <ConditionScale
 *   value={62}
 *   min={0}
 *   max={100}
 *   tiers={[
 *     { min: 90, label: 'Like New' },
 *     { min: 70, label: 'Lightly Used' },
 *     { min: 40, label: 'Worn' },
 *     { min: 0, label: 'Heavily Worn' },
 *   ]}
 * />
 * ```
 */
export function ConditionScale(props: ConditionScaleProps): JSX.Element {
  const min = () => props.min ?? 1
  const max = () => props.max ?? 10
  const tiers = () => (props.tiers ?? DEFAULT_TIERS).slice().sort((a, b) => a.min - b.min)

  const percent = () => {
    const range = max() - min()
    if (range <= 0) return 0
    return Math.max(0, Math.min(100, ((props.value - min()) / range) * 100))
  }

  const resolvedTier = () => {
    const sorted = tiers()
    let current = sorted[0]
    for (const tier of sorted) {
      if (tier.min <= props.value) current = tier
    }
    return current
  }

  return (
    <div class={cn('flex flex-col gap-2', props.class)}>
      <div class="flex items-end justify-between gap-2">
        <span class="font-semibold text-foreground">{resolvedTier()?.label}</span>
        <Show when={props.showValue ?? true}>
          <span class="text-sm text-muted-foreground">
            {props.value} / {max()}
          </span>
        </Show>
      </div>
      <div
        class="relative mt-2 h-2 w-full rounded-full bg-muted"
        role="meter"
        aria-valuemin={min()}
        aria-valuemax={max()}
        aria-valuenow={props.value}
        aria-label={resolvedTier()?.label ?? 'Condition'}
      >
        <div
          class="absolute h-2 rounded-full bg-gradient-to-r from-primary/40 to-primary"
          style={{ width: `${percent()}%` }}
        />
        <div
          class="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-background bg-primary shadow"
          style={{ left: `${percent()}%` }}
        />
      </div>
      <div class="flex items-center justify-between text-xs text-muted-foreground">
        <For each={[tiers()[0], tiers()[tiers().length - 1]]}>{(tier) => <span>{tier?.label}</span>}</For>
      </div>
    </div>
  )
}
