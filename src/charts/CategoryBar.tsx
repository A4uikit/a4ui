// CategoryBar — a single horizontal segmented bar built from plain flex
// `div`s (no SVG, no charting library). Each segment's width is its share of
// the total (via CSS `flex-grow`), segments join seamlessly inside a
// rounded track, an optional caret marks a value along the total (pure-CSS
// border triangle), and cumulative boundary labels sit beneath. `success`/
// `warning` tones reuse `Alert`/`Badge`'s `emerald-500`/`amber-500` (the repo
// has no dedicated CSS token for them); `primary`/`accent`/`destructive` are
// the shared semantic tokens.
import { createMemo, For, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

export type CategoryBarTone = 'primary' | 'accent' | 'success' | 'warning' | 'destructive'

export interface CategoryBarProps {
  values: number[]
  /** A value along the cumulative total to mark with a caret above the bar. */
  marker?: number
  /** Per-segment color tokens; cycles the default order below when omitted or shorter than `values`. */
  tones?: CategoryBarTone[]
  class?: string
}

const DEFAULT_TONES: CategoryBarTone[] = ['primary', 'accent', 'success', 'warning', 'destructive']

const TONE_CLASSES: Record<CategoryBarTone, string> = {
  primary: 'bg-primary',
  accent: 'bg-accent',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  destructive: 'bg-destructive',
}

/** Cumulative running sum of `values`, one boundary per entry (same length as `values`). */
function cumulativeBounds(values: number[]): number[] {
  let running = 0
  return values.map((v) => (running += v))
}

/**
 * Single segmented bar: each `values[i]` sets a segment's flex-grow share of
 * the total, colored by `tones[i]` (cycling a sensible default), joined
 * seamlessly inside one rounded track. An optional `marker` renders a caret
 * above the bar at that value's position along the total, and cumulative
 * boundary labels sit beneath (muted, tabular-nums).
 *
 * @example
 * ```tsx
 * <CategoryBar values={[40, 25, 20, 15]} marker={62} />
 * ```
 */
export function CategoryBar(props: CategoryBarProps): JSX.Element {
  const total = createMemo(() => props.values.reduce((sum, v) => sum + v, 0) || 1)
  const bounds = createMemo(() => cumulativeBounds(props.values))
  const tones = () => (props.tones && props.tones.length > 0 ? props.tones : DEFAULT_TONES)
  const markerPct = createMemo(() =>
    props.marker == null ? undefined : Math.min(Math.max((props.marker / total()) * 100, 0), 100),
  )

  return (
    <div class={cn('w-full', props.class)}>
      <div class="relative">
        <Show when={markerPct() !== undefined}>
          <div
            class="absolute -top-1.5 h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-foreground"
            style={{ left: `${markerPct()}%` }}
            aria-hidden="true"
          />
        </Show>
        <div class="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <For each={props.values}>
            {(value, i) => (
              <div
                class={cn('h-full', TONE_CLASSES[tones()[i() % tones().length] ?? 'primary'])}
                style={{ flex: `${Math.max(value, 0)} 0 0%` }}
              />
            )}
          </For>
        </div>
      </div>
      <div class="relative mt-1 h-4 w-full text-xs tabular-nums text-muted-foreground">
        <For each={bounds()}>
          {(bound) => (
            <span
              class="absolute -translate-x-1/2 whitespace-nowrap"
              style={{ left: `${Math.min(Math.max((bound / total()) * 100, 0), 100)}%` }}
            >
              {bound}
            </span>
          )}
        </For>
      </div>
    </div>
  )
}
