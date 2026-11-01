// PieChart — SVG pie (solid wedges, no charting library). Shares its arc math
// with DonutChart / RadialBarChart (`sliceAngles`, `arcPath`). Each wedge
// exposes `data-value` and `data-angle` (degrees) so proportions are testable.
import { createMemo, For, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import {
  ChartLegend,
  ChartTooltip,
  FOCUS_CLASS,
  arcPath,
  createChartNav,
  createHiddenSet,
  polar,
  seriesColor,
  sliceAngles,
  type ChartColor,
} from './shared'

export interface PieDatum {
  label: string
  value: number
  /** Token name; defaults to cycling `chart-1..5`. */
  color?: ChartColor
}

export interface PieChartProps {
  data: PieDatum[]
  /** SVG width/height in px. Default 200. */
  size?: number
  /** Hover / keyboard tooltip. Default true. */
  showTooltip?: boolean
  /** Toggleable legend. Default true. */
  showLegend?: boolean
  class?: string
}

/**
 * Pie chart whose wedge angles are proportional to the values. Left / Right
 * arrows move between wedges and show the tooltip; legend entries toggle
 * wedges (the rest re-share the circle).
 *
 * @example
 * ```tsx
 * <PieChart data={[{ label: 'Direct', value: 42 }, { label: 'Social', value: 28, color: 'accent' }]} />
 * ```
 */
export function PieChart(props: PieChartProps): JSX.Element {
  const size = () => props.size ?? 200
  const r = () => size() / 2 - 4
  const { hidden, toggle } = createHiddenSet()
  const colorOf = (i: number) => seriesColor(props.data[i].color, i)
  const visible = () => props.data.map((d, i) => ({ d, i })).filter((x) => !hidden().has(x.d.label))
  const total = () => visible().reduce((s, x) => s + x.d.value, 0)

  const slices = createMemo(() => {
    const vis = visible()
    return sliceAngles(vis.map((x) => x.d.value)).map((a) => ({
      ...a,
      datum: vis[a.index].d,
      orig: vis[a.index].i,
    }))
  })
  const nav = createChartNav(() => slices().length)
  const active = () => {
    const i = nav.active()
    return i === null ? undefined : slices()[i]
  }

  const summary = () => {
    const sum = props.data.reduce((s, x) => s + x.value, 0) || 1
    return `Pie chart. ${props.data
      .map((d) => `${d.label} ${d.value} (${Math.round((d.value / sum) * 100)}%)`)
      .join(', ')}`
  }

  const tipPos = () => {
    const s = active()
    if (!s) return { left: '50%', top: '0', anchor: 0.5 }
    const p = polar(size() / 2, size() / 2, r() * 0.6, s.start + s.angle / 2)
    return { left: `${(p.x / size()) * 100}%`, top: `${(p.y / size()) * 100}%`, anchor: p.x / size() }
  }

  return (
    <div class={cn('inline-block', props.class)}>
      <div
        class={cn('relative', FOCUS_CLASS)}
        style={{ width: `${size()}px`, height: `${size()}px` }}
        tabindex="0"
        role="img"
        aria-label={summary()}
        data-chart="pie"
        onKeyDown={nav.onKeyDown}
        onFocus={nav.onFocus}
        onBlur={nav.onBlur}
        onPointerLeave={() => nav.setActive(null)}
      >
        <svg width={size()} height={size()} viewBox={`0 0 ${size()} ${size()}`} aria-hidden="true">
          <For each={slices()}>
            {(s, i) => (
              <path
                data-slice
                data-label={s.datum.label}
                data-value={s.value}
                data-angle={s.angle}
                d={arcPath(size() / 2, size() / 2, r(), 0, s.start, s.angle)}
                fill={colorOf(s.orig)}
                stroke="hsl(var(--background))"
                stroke-width={1.5}
                opacity={nav.active() === null || nav.active() === i() ? 1 : 0.6}
                onPointerEnter={() => nav.setActive(i())}
              />
            )}
          </For>
        </svg>
        <Show when={(props.showTooltip ?? true) && active()}>
          {(s) => (
            <ChartTooltip
              title={s().datum.label}
              left={tipPos().left}
              top={tipPos().top}
              anchor={tipPos().anchor}
              rows={[
                { label: 'Value', value: s().value, color: colorOf(s().orig) },
                {
                  label: 'Share',
                  value: `${Math.round((s().value / (total() || 1)) * 100)}%`,
                  color: colorOf(s().orig),
                },
              ]}
            />
          )}
        </Show>
      </div>
      <Show when={props.showLegend ?? true}>
        <ChartLegend
          class="mt-2"
          hidden={hidden()}
          onToggle={toggle}
          items={props.data.map((d, i) => ({ key: d.label, label: d.label, color: colorOf(i) }))}
        />
      </Show>
    </div>
  )
}
