// LineChart — a multi-series SVG line chart (no charting library). Every
// series is scaled against the global min/max across *all* series so they
// stay comparable, then drawn as one polyline each, with an optional
// low-opacity area fill down to the baseline. Colors come from theme tokens
// only, so the chart recolors with the active palette automatically.
import { createSignal, For, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

export interface LineSeries {
  name?: string
  tone?: 'primary' | 'accent' | 'muted' | 'foreground'
  data: number[]
  area?: boolean
}

export interface LineChartProps {
  series: LineSeries[]
  labels?: string[]
  /** Height of the plot area in px. Default 200. */
  height?: number
  /** Render a small circle at each data point. Default false. */
  showDots?: boolean
  /** Show a crosshair + value tooltip on pointer hover. Default false. */
  showTooltip?: boolean
  class?: string
}

/** Logical SVG width; the element itself scales to its container via viewBox. */
const VIEW_W = 400
const PAD_Y = 4
const TONE_CYCLE: NonNullable<LineSeries['tone']>[] = ['primary', 'accent', 'muted']

function toneFor(series: LineSeries, index: number): NonNullable<LineSeries['tone']> {
  return series.tone ?? TONE_CYCLE[index % TONE_CYCLE.length]
}

function toneColor(tone: NonNullable<LineSeries['tone']>): string {
  return tone === 'foreground' ? 'hsl(var(--foreground))' : `hsl(var(--${tone}))`
}

function toneColorAlpha(tone: NonNullable<LineSeries['tone']>, alpha: number): string {
  const varName = tone === 'foreground' ? '--foreground' : `--${tone}`
  return `hsl(var(${varName}) / ${alpha})`
}

/** Point count used for the x-axis: the longest `data` array across all series. */
function pointCount(series: LineSeries[]): number {
  return Math.max(0, ...series.map((s) => s.data.length))
}

/** Global min/max across every series' values, so all series share one y-scale. */
function globalRange(series: LineSeries[]): { min: number; max: number } {
  const values = series.flatMap((s) => s.data)
  if (values.length === 0) return { min: 0, max: 1 }
  const min = Math.min(...values)
  const max = Math.max(...values)
  return min === max ? { min: min - 1, max: max + 1 } : { min, max }
}

function yFor(value: number, min: number, max: number, h: number): number {
  const span = max - min || 1
  const innerH = Math.max(h - PAD_Y * 2, 0)
  return PAD_Y + innerH - ((value - min) / span) * innerH
}

function xFor(index: number, count: number): number {
  if (count <= 1) return VIEW_W / 2
  return index * (VIEW_W / (count - 1))
}

function pointsFor(
  data: number[],
  count: number,
  min: number,
  max: number,
  h: number,
): { x: number; y: number }[] {
  return data.map((value, i) => ({ x: xFor(i, count), y: yFor(value, min, max, h) }))
}

/**
 * Multi-series SVG line chart scaled to fit its container (responsive
 * viewBox, `preserveAspectRatio="none"`), with a shared y-scale across all
 * series. Series with `area: true` also get a faint fill to the baseline.
 * Assumes equal-length `data` arrays across series; if lengths differ, the
 * x-axis is built from the longest one.
 *
 * @example
 * ```tsx
 * <LineChart
 *   series={[
 *     { name: 'Revenue', tone: 'primary', data: [4, 6, 5, 9, 8, 12], area: true },
 *     { name: 'Costs', tone: 'muted', data: [2, 3, 3, 4, 5, 6] },
 *   ]}
 *   labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
 *   showDots
 *   showTooltip
 * />
 * ```
 */
export function LineChart(props: LineChartProps): JSX.Element {
  const height = () => props.height ?? 200
  const count = () => pointCount(props.series)
  const range = () => globalRange(props.series)
  const namedSeries = () => props.series.filter((s) => s.name)

  const seriesPoints = () =>
    props.series.map((s) => pointsFor(s.data, count(), range().min, range().max, height()))

  const areaPath = (points: { x: number; y: number }[]): string => {
    if (points.length === 0) return ''
    const line = points.map((p) => `${p.x},${p.y}`).join(' L ')
    const first = points[0]
    const last = points[points.length - 1]
    return `M ${first.x},${height()} L ${line} L ${last.x},${height()} Z`
  }

  let svgRef: SVGSVGElement | undefined
  const [hoverIndex, setHoverIndex] = createSignal<number | null>(null)

  const handlePointerMove = (event: PointerEvent) => {
    if (!svgRef || count() === 0) return
    const rect = svgRef.getBoundingClientRect()
    const fraction = rect.width === 0 ? 0 : (event.clientX - rect.left) / rect.width
    const clamped = Math.min(1, Math.max(0, fraction))
    const idx = count() <= 1 ? 0 : Math.round(clamped * (count() - 1))
    setHoverIndex(idx)
  }

  const handlePointerLeave = () => setHoverIndex(null)

  const ariaLabel = () => {
    const names = namedSeries()
      .map((s) => s.name)
      .join(', ')
    const seriesLabel = names || `${props.series.length} series`
    return `Line chart with ${seriesLabel}, ${count()} data points each`
  }

  return (
    <div class={cn('w-full', props.class)}>
      <Show when={namedSeries().length >= 2}>
        <div class="mb-2 flex flex-wrap gap-x-3 gap-y-1">
          <For each={props.series}>
            {(s, i) => (
              <Show when={s.name}>
                <span class="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span
                    class="inline-block size-2 rounded-full"
                    style={{ 'background-color': toneColor(toneFor(s, i())) }}
                  />
                  {s.name}
                </span>
              </Show>
            )}
          </For>
        </div>
      </Show>

      <div class="relative w-full">
        <svg
          ref={svgRef}
          class="block w-full overflow-visible"
          viewBox={`0 0 ${VIEW_W} ${height()}`}
          preserveAspectRatio="none"
          height={height()}
          role="img"
          aria-label={ariaLabel()}
          onPointerMove={props.showTooltip ? handlePointerMove : undefined}
          onPointerLeave={props.showTooltip ? handlePointerLeave : undefined}
        >
          <For each={props.series}>
            {(s, i) => {
              const points = () => seriesPoints()[i()]
              const tone = () => toneFor(s, i())
              const polylinePoints = () =>
                points()
                  .map((p) => `${p.x},${p.y}`)
                  .join(' ')
              return (
                <>
                  <Show when={s.area}>
                    <path d={areaPath(points())} fill={toneColorAlpha(tone(), 0.15)} stroke="none" />
                  </Show>
                  <polyline
                    points={polylinePoints()}
                    fill="none"
                    stroke={toneColor(tone())}
                    stroke-width={2}
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    vector-effect="non-scaling-stroke"
                  />
                  <Show when={props.showDots}>
                    <For each={points()}>
                      {(p) => (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={2.5}
                          fill={toneColor(tone())}
                          vector-effect="non-scaling-stroke"
                        />
                      )}
                    </For>
                  </Show>
                </>
              )
            }}
          </For>

          <Show when={props.showTooltip && hoverIndex() !== null}>
            <line
              x1={xFor(hoverIndex() ?? 0, count())}
              x2={xFor(hoverIndex() ?? 0, count())}
              y1={0}
              y2={height()}
              stroke="hsl(var(--border))"
              stroke-width={1}
              vector-effect="non-scaling-stroke"
            />
          </Show>
        </svg>

        <Show when={props.showTooltip && hoverIndex() !== null}>
          <div
            class="pointer-events-none absolute top-0 z-10 -translate-y-1 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md"
            style={{
              left: `${((hoverIndex() ?? 0) / Math.max(count() - 1, 1)) * 100}%`,
              transform: `translateX(${
                (hoverIndex() ?? 0) / Math.max(count() - 1, 1) > 0.8 ? '-100%' : '-8px'
              }) translateY(-100%)`,
            }}
          >
            <Show when={props.labels?.[hoverIndex() ?? -1]}>
              <div class="mb-0.5 font-medium text-foreground">{props.labels?.[hoverIndex() ?? -1]}</div>
            </Show>
            <For each={props.series}>
              {(s, i) => (
                <Show when={s.data[hoverIndex() ?? -1] !== undefined}>
                  <div class="flex items-center gap-1.5">
                    <span
                      class="inline-block size-1.5 rounded-full"
                      style={{ 'background-color': toneColor(toneFor(s, i())) }}
                    />
                    <span>{s.name ?? `Series ${i() + 1}`}:</span>
                    <span class="font-medium text-foreground">{s.data[hoverIndex() ?? -1]}</span>
                  </div>
                </Show>
              )}
            </For>
          </div>
        </Show>
      </div>

      <Show when={props.labels && props.labels.length > 0}>
        <div class="mt-1 flex w-full text-xs text-muted-foreground">
          <For each={props.labels}>{(label) => <span class="flex-1 truncate text-center">{label}</span>}</For>
        </div>
      </Show>
    </div>
  )
}
