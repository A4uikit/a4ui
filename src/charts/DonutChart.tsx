// DonutChart — a native SVG donut/ring chart (no charting library). Each
// segment is a `<circle>` stroked with `stroke-dasharray`/`stroke-dashoffset`
// to draw an arc proportional to `value / total`; the whole group is rotated
// so the first segment starts at 12 o'clock and segments run clockwise in
// order. Colors come from theme tokens, either per-segment `tone` or, when
// omitted, cycled across the `--data-*` series tokens by index.
import { For, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

export type DonutTone = 'primary' | 'accent' | 'destructive' | 'emit' | 'received' | 'net'

export interface DonutSegment {
  label: string
  value: number
  tone?: DonutTone
}

export interface DonutChartProps {
  data: DonutSegment[]
  /** Overall SVG width/height in px. Default 160. */
  size?: number
  /** Ring stroke width in px. Default 20. */
  thickness?: number
  /** Show the summed total in the center. Default true. */
  showTotal?: boolean
  class?: string
}

// Explicit tone -> CSS custom property name.
const TONE_TOKENS: Record<DonutTone, string> = {
  primary: '--primary',
  accent: '--accent',
  destructive: '--destructive',
  emit: '--data-emit',
  received: '--data-received',
  net: '--data-net',
}

// Fallback rotation used when a segment has no explicit `tone`.
const CYCLE_TOKENS = ['--data-emit', '--data-received', '--data-net'] as const

/** Resolve the CSS custom property a segment should stroke with. */
function tokenFor(segment: DonutSegment, index: number): string {
  if (segment.tone) return TONE_TOKENS[segment.tone]
  return CYCLE_TOKENS[index % CYCLE_TOKENS.length]
}

/**
 * SVG donut chart: one arc per segment, sized by `value / total` of the
 * circle's circumference, starting at 12 o'clock and running clockwise.
 * Segment colors come from each datum's `tone`, or cycle through the
 * `--data-*` series tokens by index when omitted.
 *
 * @example
 * ```tsx
 * <DonutChart
 *   data={[
 *     { label: 'Sent', value: 62, tone: 'emit' },
 *     { label: 'Received', value: 38, tone: 'received' },
 *   ]}
 * />
 * ```
 */
export function DonutChart(props: DonutChartProps): JSX.Element {
  const size = () => props.size ?? 160
  const thickness = () => props.thickness ?? 20
  const showTotal = () => props.showTotal ?? true
  const center = () => size() / 2
  const radius = () => Math.max(size() / 2 - thickness() / 2, 0)
  const circumference = () => 2 * Math.PI * radius()
  const total = () => props.data.reduce((sum, d) => sum + d.value, 0)

  const arcs = () => {
    const grandTotal = total() || 1
    let cumulative = 0
    return props.data.map((segment, index) => {
      const fraction = segment.value / grandTotal
      const arcLength = fraction * circumference()
      const offset = cumulative
      cumulative += arcLength
      return { segment, index, arcLength, offset }
    })
  }

  return (
    <div
      class={cn('relative inline-flex items-center justify-center', props.class)}
      style={{ width: `${size()}px`, height: `${size()}px` }}
    >
      <svg width={size()} height={size()} viewBox={`0 0 ${size()} ${size()}`} role="img">
        <g transform={`rotate(-90 ${center()} ${center()})`}>
          <circle
            cx={center()}
            cy={center()}
            r={radius()}
            fill="none"
            stroke="hsl(var(--muted))"
            stroke-width={thickness()}
          />
          <For each={arcs()}>
            {(arc) => (
              <circle
                cx={center()}
                cy={center()}
                r={radius()}
                fill="none"
                stroke={`hsl(var(${tokenFor(arc.segment, arc.index)}))`}
                stroke-width={thickness()}
                stroke-linecap="butt"
                stroke-dasharray={`${arc.arcLength} ${Math.max(circumference() - arc.arcLength, 0)}`}
                stroke-dashoffset={-arc.offset}
              >
                <title>{`${arc.segment.label}: ${arc.segment.value}`}</title>
              </circle>
            )}
          </For>
        </g>
      </svg>
      <Show when={showTotal()}>
        <div class="absolute inset-0 flex items-center justify-center text-lg font-semibold tabular-nums text-foreground">
          {total()}
        </div>
      </Show>
    </div>
  )
}
