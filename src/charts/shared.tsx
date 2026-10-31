// Shared building blocks for the multi-series charts: the series config type,
// a single token -> color helper, ChartTooltip, ChartLegend, keyboard / pointer
// category navigation, and the arc math used by DonutChart, PieChart and
// RadialBarChart. Colors always resolve to theme CSS variables.
import { createSignal, For, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

/** Token names a series can be tinted with. `chart-1..5` cycle the theme's data hues. */
export type ChartColor =
  'primary' | 'accent' | 'destructive' | 'muted' | 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5'

/** Describes one series of a multi-series chart. */
export interface ChartSeries {
  /** Key of the series' value inside each datum's `values` record. */
  key: string
  /** Human label shown in the legend and tooltip. */
  label: string
  /** Token name; defaults to cycling `chart-1..5` by index. */
  color?: ChartColor
}

const COLOR_VARS: Record<ChartColor, string> = {
  primary: '--primary',
  accent: '--accent',
  destructive: '--destructive',
  muted: '--muted-foreground',
  'chart-1': '--primary',
  'chart-2': '--accent',
  'chart-3': '--data-emit',
  'chart-4': '--data-received',
  'chart-5': '--data-net',
}

const COLOR_CYCLE: ChartColor[] = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5']

/** The CSS custom property (e.g. `--primary`) for a series color or index. */
export function colorVar(color: ChartColor | undefined, index: number): string {
  return COLOR_VARS[color ?? COLOR_CYCLE[index % COLOR_CYCLE.length]]
}

/** `hsl(var(--token) / alpha)` for a series color. */
export function seriesColor(color: ChartColor | undefined, index: number, alpha?: number): string {
  const v = colorVar(color, index)
  return alpha === undefined ? `hsl(var(${v}))` : `hsl(var(${v}) / ${alpha})`
}

/** Value lookup that fails loudly when a datum lacks a declared series key. */
export function seriesValue(values: Record<string, number> | undefined, key: string, label: string): number {
  const v = values?.[key]
  if (v === undefined) throw new Error(`Chart datum "${label}" has no value for series "${key}"`)
  return v
}

export interface ChartTooltipRow {
  label: string
  value: string | number
  color: string
}

export interface ChartTooltipProps {
  title?: string
  rows: ChartTooltipRow[]
  /** CSS `left` inside the (relative) chart wrapper, e.g. `42%`. */
  left: string
  /** CSS `top` inside the wrapper. Default `0`. */
  top?: string
  /** Horizontal anchor 0..1 used to keep the tooltip inside the chart. Default 0.5. */
  anchor?: number
}

/**
 * Floating tooltip listing every series value at the active x. Position it
 * inside a `relative` wrapper; it ignores pointer events and is announced
 * politely to assistive tech.
 *
 * @example
 * ```tsx
 * <ChartTooltip title="Mon" left="20%" rows={[{ label: 'Sales', value: 12, color: 'hsl(var(--primary))' }]} />
 * ```
 */
export function ChartTooltip(props: ChartTooltipProps): JSX.Element {
  const shift = () => {
    const a = props.anchor ?? 0.5
    return a > 0.8 ? '-100%' : a < 0.2 ? '0%' : '-50%'
  }
  return (
    <div
      data-chart-tooltip
      aria-live="polite"
      class="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md"
      style={{ left: props.left, top: props.top ?? '0', transform: `translate(${shift()}, -100%)` }}
    >
      <Show when={props.title}>
        <div class="mb-0.5 font-medium text-foreground">{props.title}</div>
      </Show>
      <For each={props.rows}>
        {(row) => (
          <div class="flex items-center gap-1.5" data-chart-tooltip-row>
            <span class="inline-block size-1.5 rounded-full" style={{ 'background-color': row.color }} />
            <span>{row.label}:</span>
            <span class="font-medium text-foreground">{row.value}</span>
          </div>
        )}
      </For>
    </div>
  )
}

export interface ChartLegendItem {
  key: string
  label: string
  color: string
}

export interface ChartLegendProps {
  items: ChartLegendItem[]
  /** Keys currently hidden. */
  hidden?: ReadonlySet<string>
  /** When set, items become toggle buttons. */
  onToggle?: (key: string) => void
  class?: string
}

/**
 * Legend with colored swatches. With `onToggle` each entry is a toggle button
 * (`aria-pressed`) that hides / shows its series.
 *
 * @example
 * ```tsx
 * <ChartLegend items={[{ key: 'a', label: 'Sales', color: 'hsl(var(--primary))' }]} onToggle={toggle} />
 * ```
 */
export function ChartLegend(props: ChartLegendProps): JSX.Element {
  return (
    <ul class={cn('flex flex-wrap gap-x-3 gap-y-1', props.class)} data-chart-legend>
      <For each={props.items}>
        {(item) => {
          const off = () => props.hidden?.has(item.key) ?? false
          const inner = (
            <>
              <span
                class="inline-block size-2 rounded-full"
                style={{
                  'background-color': off() ? 'transparent' : item.color,
                  'box-shadow': `inset 0 0 0 1px ${item.color}`,
                }}
              />
              <span class={off() ? 'line-through opacity-60' : undefined}>{item.label}</span>
            </>
          )
          return (
            <li>
              <Show
                when={props.onToggle}
                fallback={
                  <span class="inline-flex items-center gap-1.5 text-xs text-muted-foreground">{inner}</span>
                }
              >
                <button
                  type="button"
                  aria-pressed={!off()}
                  data-series={item.key}
                  class="inline-flex items-center gap-1.5 rounded text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => props.onToggle?.(item.key)}
                >
                  {inner}
                </button>
              </Show>
            </li>
          )
        }}
      </For>
    </ul>
  )
}

/** Signal-backed set of hidden series keys with a toggle. */
export function createHiddenSet() {
  const [hidden, setHidden] = createSignal<ReadonlySet<string>>(new Set())
  const toggle = (key: string) =>
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  return { hidden, toggle }
}

/**
 * Pointer + keyboard navigation over `count` categories. Arrow keys / Home /
 * End move the active index, Escape clears it; keyboard focus (focus-visible)
 * activates the first one.
 */
export function createChartNav(count: () => number) {
  const [active, setActive] = createSignal<number | null>(null)
  const onKeyDown = (e: KeyboardEvent) => {
    const n = count()
    if (n === 0) return
    const cur = active()
    let next: number | null | undefined
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = cur === null ? 0 : Math.min(cur + 1, n - 1)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = cur === null ? n - 1 : Math.max(cur - 1, 0)
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = n - 1
    else if (e.key === 'Escape' && cur !== null) next = null
    if (next === undefined) return
    e.preventDefault()
    setActive(next)
  }
  const onFocus = (e: FocusEvent) => {
    if (active() === null && count() > 0 && (e.currentTarget as HTMLElement).matches(':focus-visible'))
      setActive(0)
  }
  const onBlur = () => setActive(null)
  return { active, setActive, onKeyDown, onFocus, onBlur }
}

/** Common focusable-wrapper classes (visible focus ring). */
export const FOCUS_CLASS = 'rounded outline-none focus-visible:ring-2 focus-visible:ring-ring'

export interface SliceAngle {
  index: number
  value: number
  /** Start angle in degrees, clockwise from 12 o'clock. */
  start: number
  /** Sweep in degrees; always `value / total * 360`. */
  angle: number
}

/** Proportional angles (degrees) for a list of values; shared by Donut, Pie and RadialBar. */
export function sliceAngles(values: number[]): SliceAngle[] {
  const total = values.reduce((s, v) => s + v, 0) || 1
  let start = 0
  return values.map((value, index) => {
    const angle = (value / total) * 360
    const out = { index, value, start, angle }
    start += angle
    return out
  })
}

/** Point on a circle, angle in degrees clockwise from 12 o'clock. */
export function polar(cx: number, cy: number, r: number, deg: number): { x: number; y: number } {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/** SVG path for a pie wedge (`inner` = 0) or ring segment; handles full circles. */
export function arcPath(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  start: number,
  angle: number,
): string {
  const f = (n: number) => +n.toFixed(3)
  if (angle >= 359.999) {
    const half = (r: number, rev: boolean) => {
      const a = polar(cx, cy, r, 0)
      const b = polar(cx, cy, r, 180)
      return `M ${f(a.x)} ${f(a.y)} A ${r} ${r} 0 1 ${rev ? 0 : 1} ${f(b.x)} ${f(b.y)} A ${r} ${r} 0 1 ${rev ? 0 : 1} ${f(a.x)} ${f(a.y)}`
    }
    return inner > 0 ? `${half(outer, false)} ${half(inner, true)} Z` : `${half(outer, false)} Z`
  }
  const end = start + angle
  const large = angle > 180 ? 1 : 0
  const o1 = polar(cx, cy, outer, start)
  const o2 = polar(cx, cy, outer, end)
  if (inner <= 0) {
    return `M ${f(cx)} ${f(cy)} L ${f(o1.x)} ${f(o1.y)} A ${outer} ${outer} 0 ${large} 1 ${f(o2.x)} ${f(o2.y)} Z`
  }
  const i1 = polar(cx, cy, inner, start)
  const i2 = polar(cx, cy, inner, end)
  return `M ${f(o1.x)} ${f(o1.y)} A ${outer} ${outer} 0 ${large} 1 ${f(o2.x)} ${f(o2.y)} L ${f(i2.x)} ${f(i2.y)} A ${inner} ${inner} 0 ${large} 0 ${f(i1.x)} ${f(i1.y)} Z`
}
