// GaugeChart — a native SVG radial gauge (no charting library). A single
// 270° arc (from -135° to +135°, leaving a 90° gap at the bottom) is drawn
// twice: a static background track and a value arc revealed proportionally
// to `value` within `[min, max]` via the classic stroke-dasharray/
// stroke-dashoffset trick (dash length == full path length, offset shifts
// how much of it is "on" from the arc's start). The value arc's color comes
// from `tone`, or from the highest `threshold` the value has reached. The
// sweep animates on mount and on value change (CSS transition on
// stroke-dashoffset), jumping instantly under `motionReduced()`.
import { createEffect, createSignal, on, onMount, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface GaugeThreshold {
  value: number
  tone: 'primary' | 'accent' | 'destructive' | 'muted'
}

export interface GaugeChartProps {
  value: number
  /** Value mapped to the arc's start (-135°). Default 0. */
  min?: number
  /** Value mapped to the arc's end (+135°). Default 100. */
  max?: number
  label?: JSX.Element
  unit?: string
  /** Overall SVG width/height in px (square). Default 160. */
  size?: number
  /** Value arc color when `thresholds` are omitted. Default 'primary'. */
  tone?: 'primary' | 'accent'
  /** Recolor the value arc once `value` reaches a threshold's `value` (highest match wins). */
  thresholds?: GaugeThreshold[]
  class?: string
}

// Explicit tone -> CSS custom property name.
const TONE_TOKENS: Record<GaugeThreshold['tone'], string> = {
  primary: '--primary',
  accent: '--accent',
  destructive: '--destructive',
  muted: '--muted',
}

const DEG_TO_RAD = Math.PI / 180
const START_ANGLE = -135
const END_ANGLE = 135
const SWEEP_ANGLE = END_ANGLE - START_ANGLE // 270°

/** Cartesian point on a circle of radius `r` centered at `(cx, cy)`, `angleDeg` measured clockwise from 12 o'clock. */
function pointOnArc(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const rad = angleDeg * DEG_TO_RAD
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
}

/** SVG path `d` for the fixed 270° arc (shared by the track and the value arc). */
function gaugeArcPath(cx: number, cy: number, r: number): string {
  const start = pointOnArc(cx, cy, r, START_ANGLE)
  const end = pointOnArc(cx, cy, r, END_ANGLE)
  return `M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y}`
}

/** Highest threshold whose `value` the gauge has reached, falling back to `tone` when none match. */
function resolveTone(value: number, tone: 'primary' | 'accent', thresholds?: GaugeThreshold[]): string {
  if (!thresholds || thresholds.length === 0) return TONE_TOKENS[tone]
  let resolved = TONE_TOKENS[tone]
  for (const threshold of [...thresholds].sort((a, b) => a.value - b.value)) {
    if (value >= threshold.value) resolved = TONE_TOKENS[threshold.tone]
  }
  return resolved
}

/**
 * SVG radial gauge: a 270° arc (from -135° to +135°) with a background track
 * and a value arc filled proportionally to `value` within `[min, max]`,
 * colored by `tone` or by the highest `threshold` reached. The center shows
 * the value plus optional `unit`/`label`. The sweep animates on mount and on
 * value change, jumping instantly under reduced motion.
 *
 * @example
 * ```tsx
 * <GaugeChart
 *   value={72}
 *   unit="%"
 *   label="CPU load"
 *   thresholds={[
 *     { value: 0, tone: 'primary' },
 *     { value: 60, tone: 'accent' },
 *     { value: 85, tone: 'destructive' },
 *   ]}
 * />
 * ```
 */
export function GaugeChart(props: GaugeChartProps): JSX.Element {
  const size = () => props.size ?? 160
  const min = () => props.min ?? 0
  const max = () => props.max ?? 100
  const tone = () => props.tone ?? 'primary'
  const thickness = () => size() / 8
  const center = () => size() / 2
  const radius = () => Math.max(size() / 2 - thickness() / 2, 0)
  const totalLength = () => radius() * (SWEEP_ANGLE * DEG_TO_RAD)
  const arcPath = () => gaugeArcPath(center(), center(), radius())

  const clampedValue = () => Math.min(Math.max(props.value, min()), max())
  const fraction = () => {
    const range = max() - min()
    return range > 0 ? (clampedValue() - min()) / range : 0
  }
  const strokeToken = () => resolveTone(clampedValue(), tone(), props.thresholds)

  // Drives the visible sweep; starts at 0 so the mount animation reveals the
  // arc from empty, then tracks `fraction()` (deferred, so mount handles the
  // initial reveal and this only reacts to later value changes).
  const [displayedFraction, setDisplayedFraction] = createSignal(0)

  onMount(() => {
    if (motionReduced()) {
      setDisplayedFraction(fraction())
      return
    }
    requestAnimationFrame(() => setDisplayedFraction(fraction()))
  })

  createEffect(on(fraction, (f) => setDisplayedFraction(f), { defer: true }))

  const dashOffset = () => totalLength() * (1 - displayedFraction())
  const transition = () => (motionReduced() ? 'none' : 'stroke-dashoffset 700ms ease-out')

  const displayValue = () => Math.round(clampedValue())
  const ariaLabel = () => `${displayValue()}${props.unit ?? ''}`

  return (
    <div
      class={cn('relative inline-flex items-center justify-center', props.class)}
      style={{ width: `${size()}px`, height: `${size()}px` }}
      role="meter"
      aria-valuenow={clampedValue()}
      aria-valuemin={min()}
      aria-valuemax={max()}
      aria-label={ariaLabel()}
    >
      <svg width={size()} height={size()} viewBox={`0 0 ${size()} ${size()}`} role="img" aria-hidden="true">
        <path
          d={arcPath()}
          fill="none"
          stroke="hsl(var(--muted))"
          stroke-width={thickness()}
          stroke-linecap="round"
        />
        <path
          d={arcPath()}
          fill="none"
          stroke={`hsl(var(${strokeToken()}))`}
          stroke-width={thickness()}
          stroke-linecap="round"
          stroke-dasharray={`${totalLength()} ${totalLength()}`}
          stroke-dashoffset={dashOffset()}
          style={{ transition: transition() }}
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-4 text-center">
        <span class="text-2xl font-semibold tabular-nums text-foreground">
          {displayValue()}
          <Show when={props.unit}>
            <span class="text-base font-medium">{props.unit}</span>
          </Show>
        </span>
        <Show when={props.label}>
          <span class="text-xs text-muted-foreground">{props.label}</span>
        </Show>
      </div>
    </div>
  )
}
