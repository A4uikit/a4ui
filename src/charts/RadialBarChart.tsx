// RadialBarChart — concentric progress rings, one per datum (no charting
// library). The first datum is the outermost ring; each ring sweeps
// `value / max` of a full turn from 12 o'clock. Rings expose `data-value` and
// `data-angle` (degrees).
import { createMemo, For, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import {
  ChartLegend,
  ChartTooltip,
  FOCUS_CLASS,
  arcPath,
  createChartNav,
  createHiddenSet,
  seriesColor,
  type ChartColor,
} from './shared'

export interface RadialBarDatum {
  label: string
  value: number
  /** Token name; defaults to cycling `chart-1..5`. */
  color?: ChartColor
}

export interface RadialBarChartProps {
  data: RadialBarDatum[]
  /** Value that fills a whole ring. Default: the largest value. */
  max?: number
  /** SVG width/height in px. Default 220. */
  size?: number
  /** Ring thickness in px. Default 14. */
  thickness?: number
  /** Hover / keyboard tooltip. Default true. */
  showTooltip?: boolean
  /** Toggleable legend. Default true. */
  showLegend?: boolean
  class?: string
}

/**
 * Radial bar chart: one concentric ring per datum, each filled to `value /
 * max`. Arrow keys move between rings and show the tooltip; legend entries
 * toggle rings.
 *
 * @example
 * ```tsx
 * <RadialBarChart max={100} data={[{ label: 'Move', value: 72 }, { label: 'Stand', value: 40, color: 'accent' }]} />
 * ```
 */
export function RadialBarChart(props: RadialBarChartProps): JSX.Element {
  const size = () => props.size ?? 220
  const thickness = () => props.thickness ?? 14
  const gap = 4
  const { hidden, toggle } = createHiddenSet()
  const colorOf = (i: number) => seriesColor(props.data[i].color, i)
  const visible = () => props.data.map((d, i) => ({ d, i })).filter((x) => !hidden().has(x.d.label))
  const max = () => props.max ?? (Math.max(...props.data.map((d) => d.value), 0) || 1)

  const rings = createMemo(() =>
    visible().map((x, n) => {
      const outer = size() / 2 - 2 - n * (thickness() + gap)
      const angle = Math.min(Math.max(x.d.value / max(), 0), 1) * 360
      return { datum: x.d, orig: x.i, outer, inner: outer - thickness(), angle }
    }),
  )
  const nav = createChartNav(() => rings().length)
  const active = () => {
    const i = nav.active()
    return i === null ? undefined : rings()[i]
  }

  const summary = () =>
    `Radial bar chart. ${props.data.map((d) => `${d.label} ${d.value} of ${max()}`).join(', ')}`

  return (
    <div class={cn('inline-block', props.class)}>
      <div
        class={cn('relative', FOCUS_CLASS)}
        style={{ width: `${size()}px`, height: `${size()}px` }}
        tabindex="0"
        role="img"
        aria-label={summary()}
        data-chart="radial-bar"
        onKeyDown={nav.onKeyDown}
        onFocus={nav.onFocus}
        onBlur={nav.onBlur}
        onPointerLeave={() => nav.setActive(null)}
      >
        <svg width={size()} height={size()} viewBox={`0 0 ${size()} ${size()}`} aria-hidden="true">
          <For each={rings()}>
            {(ring, i) => (
              <g
                onPointerEnter={() => nav.setActive(i())}
                opacity={nav.active() === null || nav.active() === i() ? 1 : 0.6}
              >
                <path
                  d={arcPath(size() / 2, size() / 2, ring.outer, ring.inner, 0, 360)}
                  fill="hsl(var(--muted))"
                  fill-rule="evenodd"
                />
                <Show when={ring.angle > 0}>
                  <path
                    data-ring
                    data-label={ring.datum.label}
                    data-value={ring.datum.value}
                    data-angle={ring.angle}
                    d={arcPath(size() / 2, size() / 2, ring.outer, ring.inner, 0, ring.angle)}
                    fill={colorOf(ring.orig)}
                    fill-rule="evenodd"
                  />
                </Show>
              </g>
            )}
          </For>
        </svg>
        <Show when={(props.showTooltip ?? true) && active()}>
          {(ring) => (
            <ChartTooltip
              title={ring().datum.label}
              left="50%"
              top="0"
              rows={[
                { label: 'Value', value: ring().datum.value, color: colorOf(ring().orig) },
                { label: 'Of', value: max(), color: colorOf(ring().orig) },
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
