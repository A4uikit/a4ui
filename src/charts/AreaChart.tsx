// AreaChart — multi-series SVG area chart (no charting library). Series either
// overlap or stack; each area is filled with an SVG linearGradient built from
// the series' theme token, with a solid line on top. Hover or arrow keys show
// a tooltip with every series' value at that x.
import { createMemo, createUniqueId, For, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import {
  ChartLegend,
  ChartTooltip,
  FOCUS_CLASS,
  createChartNav,
  createHiddenSet,
  seriesColor,
  seriesValue,
  type ChartSeries,
  ChartXLabels,
} from './shared'

export interface AreaDatum {
  label: string
  /** Per-series values keyed by `ChartSeries.key`. */
  values: Record<string, number>
}

export interface AreaChartProps {
  data: AreaDatum[]
  series: ChartSeries[]
  /** `overlap` (default) draws each series from the baseline; `stacked` accumulates them. */
  mode?: 'overlap' | 'stacked'
  /** Height of the plot area in px. Default 200. */
  height?: number
  /** Hover / keyboard tooltip. Default true. */
  showTooltip?: boolean
  /** Toggleable legend. Default true. */
  showLegend?: boolean
  class?: string
}

const VIEW_W = 400

/**
 * Multi-series area chart with gradient fills. Each series is tinted by a
 * theme token (`color`), overlapping or stacked. The chart is focusable:
 * Left / Right arrows (Home / End) move between points and show the tooltip.
 *
 * @example
 * ```tsx
 * <AreaChart
 *   mode="stacked"
 *   series={[{ key: 'web', label: 'Web' }, { key: 'app', label: 'App', color: 'accent' }]}
 *   data={[
 *     { label: 'Jan', values: { web: 4, app: 2 } },
 *     { label: 'Feb', values: { web: 6, app: 3 } },
 *   ]}
 * />
 * ```
 */
export function AreaChart(props: AreaChartProps): JSX.Element {
  const uid = createUniqueId()
  const height = () => props.height ?? 200
  const stacked = () => props.mode === 'stacked'
  const { hidden, toggle } = createHiddenSet()
  const nav = createChartNav(() => props.data.length)
  const val = (d: AreaDatum, key: string) => seriesValue(d.values, key, d.label)
  const colorOf = (key: string) => {
    const i = props.series.findIndex((s) => s.key === key)
    return seriesColor(props.series[i].color, i)
  }
  const visible = () => props.series.filter((s) => !hidden().has(s.key))
  const xFor = (i: number) => (props.data.length <= 1 ? VIEW_W / 2 : (i / (props.data.length - 1)) * VIEW_W)

  const max = createMemo(() => {
    const vis = visible()
    const tops = props.data.map((d) =>
      stacked() ? vis.reduce((s, x) => s + val(d, x.key), 0) : Math.max(0, ...vis.map((x) => val(d, x.key))),
    )
    return Math.max(...tops, 0) || 1
  })

  const layers = createMemo(() => {
    const acc = props.data.map(() => 0)
    return visible().map((s) => {
      const base = stacked() ? [...acc] : acc.map(() => 0)
      const top = props.data.map((d, i) => base[i] + val(d, s.key))
      if (stacked()) top.forEach((t, i) => (acc[i] = t))
      const y = (v: number) => height() - (v / max()) * height()
      const upper = top.map((t, i) => `${xFor(i)},${y(t)}`)
      const lower = base.map((b, i) => `${xFor(i)},${y(b)}`).reverse()
      return {
        key: s.key,
        color: colorOf(s.key),
        line: `M ${upper.join(' L ')}`,
        area: `M ${upper.join(' L ')} L ${lower.join(' L ')} Z`,
      }
    })
  })

  const summary = () =>
    `${stacked() ? 'Stacked area' : 'Area'} chart. ` +
    props.data
      .map((d) => `${d.label}: ${props.series.map((s) => `${s.label} ${val(d, s.key)}`).join(', ')}`)
      .join('; ')

  let svgRef: SVGSVGElement | undefined
  const onPointerMove = (e: PointerEvent) => {
    if (!svgRef || props.data.length === 0) return
    const rect = svgRef.getBoundingClientRect()
    const f = rect.width === 0 ? 0 : (e.clientX - rect.left) / rect.width
    nav.setActive(
      props.data.length <= 1 ? 0 : Math.round(Math.min(1, Math.max(0, f)) * (props.data.length - 1)),
    )
  }
  const frac = () => {
    const i = nav.active() ?? 0
    return props.data.length <= 1 ? 0.5 : i / (props.data.length - 1)
  }
  const activeDatum = () => {
    const i = nav.active()
    return i === null ? undefined : props.data[i]
  }

  return (
    <div class={cn('w-full', props.class)}>
      <Show when={props.showLegend ?? true}>
        <ChartLegend
          class="mb-2"
          hidden={hidden()}
          onToggle={toggle}
          items={props.series.map((s, i) => ({ key: s.key, label: s.label, color: seriesColor(s.color, i) }))}
        />
      </Show>
      <div
        class={cn('relative w-full', FOCUS_CLASS)}
        tabindex="0"
        role="img"
        aria-label={summary()}
        data-chart="area"
        data-mode={props.mode ?? 'overlap'}
        onKeyDown={nav.onKeyDown}
        onFocus={nav.onFocus}
        onBlur={nav.onBlur}
      >
        <svg
          ref={svgRef}
          class="block w-full overflow-visible"
          viewBox={`0 0 ${VIEW_W} ${height()}`}
          preserveAspectRatio="none"
          height={height()}
          aria-hidden="true"
          onPointerMove={onPointerMove}
          onPointerLeave={() => nav.setActive(null)}
        >
          <defs>
            <For each={props.series}>
              {(s, i) => (
                <linearGradient id={`${uid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color={seriesColor(s.color, i())} stop-opacity="0.55" />
                  <stop offset="100%" stop-color={seriesColor(s.color, i())} stop-opacity="0.05" />
                </linearGradient>
              )}
            </For>
          </defs>
          <For each={layers()}>
            {(l) => (
              <g data-series={l.key}>
                <path d={l.area} fill={`url(#${uid}-${l.key})`} stroke="none" data-area />
                <path
                  d={l.line}
                  fill="none"
                  stroke={l.color}
                  stroke-width={2}
                  stroke-linejoin="round"
                  vector-effect="non-scaling-stroke"
                />
              </g>
            )}
          </For>
          <Show when={nav.active() !== null}>
            <line
              data-cursor
              x1={xFor(nav.active() ?? 0)}
              x2={xFor(nav.active() ?? 0)}
              y1={0}
              y2={height()}
              stroke="hsl(var(--border))"
              stroke-width={1}
              vector-effect="non-scaling-stroke"
            />
          </Show>
        </svg>
        <Show when={(props.showTooltip ?? true) && activeDatum()}>
          {(d) => (
            <ChartTooltip
              title={d().label}
              left={`${frac() * 100}%`}
              anchor={frac()}
              rows={visible().map((s) => ({ label: s.label, value: val(d(), s.key), color: colorOf(s.key) }))}
            />
          )}
        </Show>
      </div>
      <ChartXLabels labels={props.data.map((d) => d.label)} />
    </div>
  )
}
