// BarChart — a simple vertical bar chart built from plain flex `div`s (no
// SVG, no charting library). Bar heights are percentages of the tallest
// value so the whole chart reflows with its container, and height changes
// animate via `transition-all`. Colors come from theme tokens only.
import { createMemo, For, Show, type JSX } from 'solid-js'

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
} from './shared'

export interface BarDatum {
  label: string
  /** Value for `mode="single"` (required there). */
  value?: number
  /** Per-series values keyed by `ChartSeries.key`, for `stacked` / `grouped`. */
  values?: Record<string, number>
}

export type BarChartMode = 'single' | 'stacked' | 'grouped'

export interface BarChartProps {
  data: BarDatum[]
  /** Height of the plot area in px. Default 160. */
  height?: number
  /** Fill color token. Default 'primary'. */
  tone?: 'primary' | 'accent'
  /**
   * `single` (default) draws one bar per datum from `value`; `stacked` and
   * `grouped` draw one segment / bar per entry of `series` from `values`.
   */
  mode?: BarChartMode
  /** Series definitions, required for `stacked` / `grouped`. */
  series?: ChartSeries[]
  /** Hover / keyboard tooltip in the multi-series modes. Default true. */
  showTooltip?: boolean
  /** Show a toggleable legend in the multi-series modes. Default true. */
  showLegend?: boolean
  class?: string
}

const VIEW_W = 400

/**
 * Vertical bar chart rendered with flexbox: each bar's height is `value /
 * max` of the plot area, filled with a theme token, with its label truncated
 * beneath it and its raw value available via a native tooltip.
 *
 * @example
 * ```tsx
 * <BarChart data={[{ label: 'Mon', value: 12 }, { label: 'Tue', value: 30 }]} tone="accent" />
 * ```
 */
export function BarChart(props: BarChartProps): JSX.Element {
  return (
    <Show when={(props.mode ?? 'single') !== 'single'} fallback={<SingleBars {...props} />}>
      <MultiBars {...props} />
    </Show>
  )
}

function SingleBars(props: BarChartProps): JSX.Element {
  const value = (d: BarDatum): number => {
    if (d.value === undefined)
      throw new Error(`BarChart datum "${d.label}" needs a numeric "value" in single mode`)
    return d.value
  }
  const height = () => props.height ?? 160
  const tone = () => props.tone ?? 'primary'
  const max = () => Math.max(...props.data.map(value), 0) || 1
  const barClass = () => (tone() === 'accent' ? 'bg-accent' : 'bg-primary')

  return (
    <div class={cn('flex w-full items-end gap-2', props.class)} style={{ height: `${height()}px` }}>
      <For each={props.data}>
        {(datum) => (
          <div class="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
            <div
              title={`${datum.label}: ${value(datum)}`}
              class={cn('w-full rounded-t transition-all', barClass())}
              style={{ height: `${Math.max((value(datum) / max()) * 100, 0)}%` }}
            />
            <span class="w-full truncate text-center text-xs text-muted-foreground">{datum.label}</span>
          </div>
        )}
      </For>
    </div>
  )
}

function MultiBars(props: BarChartProps): JSX.Element {
  const height = () => props.height ?? 160
  const stacked = () => props.mode === 'stacked'
  const series = () => {
    if (!props.series || props.series.length === 0)
      throw new Error(`BarChart mode="${props.mode}" requires a non-empty "series" prop`)
    return props.series
  }
  const { hidden, toggle } = createHiddenSet()
  const nav = createChartNav(() => props.data.length)
  const visible = () => series().filter((s) => !hidden().has(s.key))
  const val = (d: BarDatum, key: string) => seriesValue(d.values, key, d.label)

  const colorOf = (key: string) => {
    const i = series().findIndex((s) => s.key === key)
    return seriesColor(series()[i].color, i)
  }

  const max = createMemo(() => {
    const vis = visible()
    const perCat = props.data.map((d) =>
      stacked()
        ? vis.reduce((sum, s) => sum + val(d, s.key), 0)
        : Math.max(0, ...vis.map((s) => val(d, s.key))),
    )
    return Math.max(...perCat, 0) || 1
  })

  const bars = createMemo(() => {
    const n = props.data.length
    const band = VIEW_W / Math.max(n, 1)
    const vis = visible()
    const m = vis.length
    const out: {
      cat: number
      key: string
      label: string
      value: number
      x: number
      y: number
      w: number
      h: number
      color: string
    }[] = []
    props.data.forEach((d, cat) => {
      if (stacked()) {
        const w = band * 0.6
        const x = cat * band + (band - w) / 2
        let acc = 0
        vis.forEach((s) => {
          const v = val(d, s.key)
          const h = (v / max()) * height()
          acc += h
          out.push({
            cat,
            key: s.key,
            label: s.label,
            value: v,
            x,
            y: height() - acc,
            w,
            h,
            color: colorOf(s.key),
          })
        })
      } else {
        const gap = 2
        const groupW = band * 0.8
        const w = m > 0 ? (groupW - gap * (m - 1)) / m : 0
        vis.forEach((s, k) => {
          const v = val(d, s.key)
          const h = (v / max()) * height()
          out.push({
            cat,
            key: s.key,
            label: s.label,
            value: v,
            x: cat * band + band * 0.1 + k * (w + gap),
            y: height() - h,
            w,
            h,
            color: colorOf(s.key),
          })
        })
      }
    })
    return out
  })

  const summary = () =>
    `${props.mode === 'stacked' ? 'Stacked' : 'Grouped'} bar chart. ` +
    props.data
      .map(
        (d) =>
          `${d.label}: ${series()
            .map((s) => `${s.label} ${val(d, s.key)}`)
            .join(', ')}`,
      )
      .join('; ')

  let svgRef: SVGSVGElement | undefined
  const onPointerMove = (e: PointerEvent) => {
    if (!svgRef || props.data.length === 0) return
    const rect = svgRef.getBoundingClientRect()
    const f = rect.width === 0 ? 0 : (e.clientX - rect.left) / rect.width
    nav.setActive(Math.min(props.data.length - 1, Math.max(0, Math.floor(f * props.data.length))))
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
          items={series().map((s, i) => ({ key: s.key, label: s.label, color: seriesColor(s.color, i) }))}
        />
      </Show>
      <div
        class={cn('relative w-full', FOCUS_CLASS)}
        tabindex="0"
        role="img"
        aria-label={summary()}
        data-chart="bar"
        data-mode={props.mode}
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
          <Show when={nav.active() !== null}>
            <rect
              x={(nav.active() ?? 0) * (VIEW_W / props.data.length)}
              y={0}
              width={VIEW_W / props.data.length}
              height={height()}
              fill="hsl(var(--muted) / 0.4)"
            />
          </Show>
          <For each={bars()}>
            {(b) => (
              <rect
                data-bar
                data-category={props.data[b.cat].label}
                data-series={b.key}
                data-value={b.value}
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                rx={1}
                fill={b.color}
              />
            )}
          </For>
        </svg>
        <Show when={props.showTooltip ?? true}>
          <Show when={activeDatum()}>
            {(d) => (
              <ChartTooltip
                title={d().label}
                left={`${(((nav.active() ?? 0) + 0.5) / props.data.length) * 100}%`}
                anchor={((nav.active() ?? 0) + 0.5) / props.data.length}
                rows={visible().map((s) => ({
                  label: s.label,
                  value: val(d(), s.key),
                  color: colorOf(s.key),
                }))}
              />
            )}
          </Show>
        </Show>
      </div>
      <div class="mt-1 flex w-full text-xs text-muted-foreground">
        <For each={props.data}>
          {(d) => <span class="min-w-0 flex-1 truncate text-center">{d.label}</span>}
        </For>
      </div>
    </div>
  )
}
