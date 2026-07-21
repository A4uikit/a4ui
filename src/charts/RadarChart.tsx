// RadarChart — a native SVG spider/radar chart (no charting library). Axes
// are laid out clockwise starting at 12 o'clock, one spoke per dimension.
// A faint concentric polygon grid marks reference levels, and each series is
// drawn as a translucent-filled polygon connecting its normalized values.
// Colors come from theme tokens, either per-series `tone` or, when omitted,
// cycled across `--primary` / `--accent` by index.
import { For, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

export interface RadarSeries {
  name?: string
  tone?: 'primary' | 'accent'
  values: number[]
}

export interface RadarChartProps {
  axes: string[]
  series: RadarSeries[]
  /** Value that reaches the outer edge of the grid. Default: max across all series. */
  max?: number
  /** Overall SVG width/height in px (square). Default 240. */
  size?: number
  class?: string
}

// Explicit tone -> CSS custom property name.
const TONE_TOKENS: Record<'primary' | 'accent', string> = {
  primary: '--primary',
  accent: '--accent',
}

// Fallback rotation used when a series has no explicit `tone`.
const CYCLE_TOKENS = ['--primary', '--accent'] as const

/** Resolve the CSS custom property a series should stroke/fill with. */
function tokenFor(series: RadarSeries, index: number): string {
  if (series.tone) return TONE_TOKENS[series.tone]
  return CYCLE_TOKENS[index % CYCLE_TOKENS.length]
}

const RING_LEVELS = 4
const LABEL_OFFSET = 14
// Extra viewBox margin (all sides) so axis-label text isn't clipped.
const LABEL_PAD = 34

/** Angle (in degrees) of axis `index` of `count`, starting at 12 o'clock and running clockwise. */
function axisAngle(index: number, count: number): number {
  return -90 + (360 / count) * index
}

/** Convert a polar coordinate (center + radius + angle in degrees) to cartesian `{ x, y }`. */
function polarToPoint(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/** Build the `x,y ...` points attribute for a polygon at `radius` across all axes. */
function ringPoints(cx: number, cy: number, radius: number, axisCount: number): string {
  return Array.from({ length: axisCount }, (_, i) => {
    const p = polarToPoint(cx, cy, radius, axisAngle(i, axisCount))
    return `${p.x},${p.y}`
  }).join(' ')
}

/** Text anchor for a label sitting outside the vertex at `angleDeg`. */
function labelAnchor(angleDeg: number): 'start' | 'middle' | 'end' {
  const cos = Math.cos((angleDeg * Math.PI) / 180)
  if (cos > 0.1) return 'start'
  if (cos < -0.1) return 'end'
  return 'middle'
}

/** Dominant baseline for a label sitting outside the vertex at `angleDeg`. */
function labelBaseline(angleDeg: number): 'auto' | 'hanging' | 'middle' {
  const sin = Math.sin((angleDeg * Math.PI) / 180)
  if (sin < -0.3) return 'auto'
  if (sin > 0.3) return 'hanging'
  return 'middle'
}

/**
 * SVG spider/radar chart: a concentric polygon grid with one spoke per axis,
 * and one translucent-filled polygon per series connecting its values
 * (normalized by `max`, default the max value across all series). Series
 * colors come from each datum's `tone`, or cycle through `primary`/`accent`
 * by index when omitted. Shows a small legend when 2+ series have a `name`.
 *
 * @example
 * ```tsx
 * <RadarChart
 *   axes={['Speed', 'Power', 'Range', 'Defense', 'Utility']}
 *   series={[
 *     { name: 'Model A', tone: 'primary', values: [80, 60, 90, 40, 70] },
 *     { name: 'Model B', tone: 'accent', values: [50, 85, 60, 75, 55] },
 *   ]}
 * />
 * ```
 */
export function RadarChart(props: RadarChartProps): JSX.Element {
  const size = () => props.size ?? 240
  const center = () => size() / 2
  const outerRadius = () => Math.max(size() / 2 - LABEL_OFFSET * 2, 0)
  const axisCount = () => props.axes.length
  const max = () => props.max ?? Math.max(1, ...props.series.flatMap((s) => s.values))

  const rings = () =>
    Array.from({ length: RING_LEVELS }, (_, i) => {
      const level = i + 1
      return ringPoints(center(), center(), outerRadius() * (level / RING_LEVELS), axisCount())
    })

  const spokes = () =>
    props.axes.map((_, i) => polarToPoint(center(), center(), outerRadius(), axisAngle(i, axisCount())))

  const labels = () =>
    props.axes.map((label, i) => {
      const angle = axisAngle(i, axisCount())
      const point = polarToPoint(center(), center(), outerRadius() + LABEL_OFFSET, angle)
      return { label, x: point.x, y: point.y, anchor: labelAnchor(angle), baseline: labelBaseline(angle) }
    })

  const seriesPolygons = () => {
    const grandMax = max()
    return props.series.map((series, index) => {
      const points = series.values
        .map((value, i) => {
          const fraction = grandMax > 0 ? Math.max(value, 0) / grandMax : 0
          const p = polarToPoint(center(), center(), outerRadius() * fraction, axisAngle(i, axisCount()))
          return `${p.x},${p.y}`
        })
        .join(' ')
      return { series, index, points, token: tokenFor(series, index) }
    })
  }

  const namedSeries = () => props.series.filter((s) => s.name)
  const showLegend = () => namedSeries().length >= 2

  return (
    <div class={cn('inline-flex flex-col items-center gap-2', props.class)}>
      <svg
        width={size()}
        height={size()}
        // Pad the coordinate space so axis-label text near the left/right
        // vertices isn't clipped by the viewBox edge (the plot scales down a
        // touch to fit; the CSS footprint stays `size`).
        viewBox={`${-LABEL_PAD} ${-LABEL_PAD} ${size() + LABEL_PAD * 2} ${size() + LABEL_PAD * 2}`}
        role="img"
        aria-label={`Radar chart comparing ${props.series.length} series across ${axisCount()} axes: ${props.axes.join(', ')}`}
      >
        <For each={rings()}>
          {(points) => <polygon points={points} fill="none" stroke="hsl(var(--border))" stroke-width={1} />}
        </For>
        <For each={spokes()}>
          {(point) => (
            <line
              x1={center()}
              y1={center()}
              x2={point.x}
              y2={point.y}
              stroke="hsl(var(--border))"
              stroke-width={1}
            />
          )}
        </For>
        <For each={seriesPolygons()}>
          {({ series, points, token }) => (
            <polygon
              points={points}
              fill={`hsl(var(${token}) / 0.15)`}
              stroke={`hsl(var(${token}))`}
              stroke-width={2}
              stroke-linejoin="round"
            >
              <Show when={series.name}>
                <title>{series.name}</title>
              </Show>
            </polygon>
          )}
        </For>
        <For each={labels()}>
          {(item) => (
            <text
              x={item.x}
              y={item.y}
              text-anchor={item.anchor}
              dominant-baseline={item.baseline}
              class="text-xs fill-muted-foreground"
            >
              {item.label}
            </text>
          )}
        </For>
      </svg>
      <Show when={showLegend()}>
        <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <For each={seriesPolygons()}>
            {({ series, token }) => (
              <Show when={series.name}>
                <span class="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span
                    class="inline-block size-2 rounded-full"
                    style={{ 'background-color': `hsl(var(${token}))` }}
                  />
                  {series.name}
                </span>
              </Show>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
