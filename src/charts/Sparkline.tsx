// Sparkline — a tiny inline trend line rendered as a native SVG polyline (no
// charting library). Values are scaled to fill the viewBox (min -> bottom,
// max -> top, with a couple px of padding so the line never clips), stroked
// with a theme token so it recolors with the active palette. An optional
// faint area fill traces the same points down to the baseline.
import { Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

export interface SparklineProps {
  data: number[]
  /** SVG viewBox width in px. Default 120. */
  width?: number
  /** SVG viewBox height in px. Default 32. */
  height?: number
  /** Stroke color token. Default 'primary'. */
  tone?: 'primary' | 'accent' | 'destructive'
  /** Fill the area under the line faintly. Default false. */
  area?: boolean
  class?: string
}

const PAD = 2

/** Build the `x,y` point list for `data` scaled into `w`×`h` (with padding). */
function pointsFor(data: number[], w: number, h: number): { x: number; y: number }[] {
  if (data.length === 0) return []
  if (data.length === 1) {
    return [{ x: w / 2, y: h / 2 }]
  }
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const innerH = Math.max(h - PAD * 2, 0)
  const stepX = w / (data.length - 1)
  return data.map((value, i) => ({
    x: i * stepX,
    y: PAD + innerH - ((value - min) / span) * innerH,
  }))
}

/**
 * Minimal inline trend line: an SVG polyline scaled to fit `width`×`height`,
 * stroked with a theme token so it recolors with the active palette. Pass
 * `area` for a faint fill under the line.
 *
 * @example
 * ```tsx
 * <Sparkline data={[3, 5, 4, 8, 6, 9, 7]} tone="accent" area />
 * ```
 */
export function Sparkline(props: SparklineProps): JSX.Element {
  const width = () => props.width ?? 120
  const height = () => props.height ?? 32
  const tone = () => props.tone ?? 'primary'
  const points = () => pointsFor(props.data, width(), height())

  const polylinePoints = () =>
    points()
      .map((p) => `${p.x},${p.y}`)
      .join(' ')

  const areaPath = () => {
    const pts = points()
    if (pts.length === 0) return ''
    const line = pts.map((p) => `${p.x},${p.y}`).join(' L ')
    const first = pts[0]
    const last = pts[pts.length - 1]
    return `M ${first.x},${height()} L ${line} L ${last.x},${height()} Z`
  }

  return (
    <svg
      class={cn('overflow-visible', props.class)}
      width={width()}
      height={height()}
      viewBox={`0 0 ${width()} ${height()}`}
      preserveAspectRatio="none"
      role="img"
    >
      <Show when={points().length > 0}>
        <Show when={props.area}>
          <path d={areaPath()} fill={`hsl(var(--${tone()}) / 0.15)`} stroke="none" />
        </Show>
        <Show
          when={points().length > 1}
          fallback={<circle cx={points()[0]?.x} cy={points()[0]?.y} r={2} fill={`hsl(var(--${tone()}))`} />}
        >
          <polyline
            points={polylinePoints()}
            fill="none"
            stroke={`hsl(var(--${tone()}))`}
            stroke-width={2}
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </Show>
      </Show>
    </svg>
  )
}
