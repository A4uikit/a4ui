// GanttChart — a read-only project schedule chart built from plain flex/grid
// `div`s (no SVG, no date library). Each task is a row with its name in a
// fixed-width left column and a bar positioned on a proportional time axis
// (left%/width% derived from the task's start/end within the overall date
// range), mirroring BarChart's percentage-of-max layout idiom. Dependency
// arrows are drawn as right-angle elbow connectors using bordered divs so
// the whole chart stays in the same box-model coordinate space as the bars.
import { createMemo, For, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

const DAY_MS = 24 * 60 * 60 * 1000
/** Header height (`h-8`) in px — the coordinate origin for row overlays. */
const HEADER_HEIGHT = 32
/** Per-task row height (`h-10`) in px. */
const ROW_HEIGHT = 40
/** Candidate tick spacings (days); the smallest that keeps ticks readable wins. */
const TICK_STEP_DAYS = [1, 2, 3, 7, 14, 30, 60, 90, 180]

/** A single bar rendered by {@link GanttChart}. */
export interface GanttTask {
  id: string
  name: string
  /** ISO date, `'YYYY-MM-DD'`. */
  start: string
  /** ISO date, `'YYYY-MM-DD'`. */
  end: string
  /** Ids of tasks that must finish before this one starts; drawn as elbow connectors. */
  dependencies?: string[]
  /** Bar color. Defaults to `'primary'`. */
  tone?: 'primary' | 'accent'
}

export interface GanttChartProps {
  tasks: GanttTask[]
  class?: string
}

interface Tick {
  label: string
  percent: number
}

interface Connector {
  id: string
  /** Elbow's vertical run: x of the dependency's end, from its row to the dependent's row. */
  xFrom: number
  yFrom: number
  xTo: number
  yTo: number
  arrowRight: boolean
}

function pickStepDays(totalDays: number): number {
  const target = totalDays / 8
  return TICK_STEP_DAYS.find((step) => step >= target) ?? TICK_STEP_DAYS[TICK_STEP_DAYS.length - 1]
}

function formatTick(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/**
 * Read-only Gantt chart: a header row of date ticks over a proportional time
 * axis, one row per task with a colored bar spanning `start`–`end`, elbow
 * connectors for `dependencies`, and a "today" marker when today falls
 * within the overall range. Horizontal scroll kicks in when the range is
 * wide relative to the container.
 *
 * @example
 * ```tsx
 * <GanttChart
 *   tasks={[
 *     { id: 'design', name: 'Design', start: '2026-01-05', end: '2026-01-16', tone: 'accent' },
 *     { id: 'build', name: 'Build', start: '2026-01-19', end: '2026-02-06', dependencies: ['design'] },
 *     { id: 'launch', name: 'Launch', start: '2026-02-09', end: '2026-02-10', dependencies: ['build'] },
 *   ]}
 * />
 * ```
 */
export function GanttChart(props: GanttChartProps): JSX.Element {
  const range = createMemo(() => {
    if (props.tasks.length === 0) return null
    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY
    for (const task of props.tasks) {
      const start = new Date(task.start).getTime()
      const end = new Date(task.end).getTime()
      if (start < min) min = start
      if (end > max) max = end
    }
    // Guard a zero-width range (single task, start === end) so percentages stay finite.
    const totalMs = Math.max(max - min, DAY_MS)
    return { min, max: min + totalMs, totalMs }
  })

  const percentFor = (isoOrTime: string | number): number => {
    const r = range()
    if (!r) return 0
    const time = typeof isoOrTime === 'string' ? new Date(isoOrTime).getTime() : isoOrTime
    return Math.min(100, Math.max(0, ((time - r.min) / r.totalMs) * 100))
  }

  const ticks = createMemo<Tick[]>(() => {
    const r = range()
    if (!r) return []
    const totalDays = Math.max(1, Math.round(r.totalMs / DAY_MS))
    const step = pickStepDays(totalDays)
    const out: Tick[] = []
    for (let d = 0; d <= totalDays; d += step) {
      out.push({ label: formatTick(new Date(r.min + d * DAY_MS)), percent: (d / totalDays) * 100 })
    }
    return out
  })

  const todayPercent = createMemo<number | null>(() => {
    const r = range()
    if (!r) return null
    const now = new Date()
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    if (today < r.min || today > r.max) return null
    return percentFor(today)
  })

  const rowIndex = createMemo(() => {
    const map = new Map<string, number>()
    props.tasks.forEach((task, i) => map.set(task.id, i))
    return map
  })

  const connectors = createMemo<Connector[]>(() => {
    const byId = new Map(props.tasks.map((t) => [t.id, t]))
    const index = rowIndex()
    const out: Connector[] = []
    for (const task of props.tasks) {
      for (const depId of task.dependencies ?? []) {
        const dep = byId.get(depId)
        if (!dep || dep.id === task.id) continue
        const iDep = index.get(dep.id)
        const iTask = index.get(task.id)
        if (iDep === undefined || iTask === undefined) continue
        const xFrom = percentFor(dep.end)
        const xTo = percentFor(task.start)
        out.push({
          id: `${dep.id}->${task.id}`,
          xFrom,
          yFrom: iDep * ROW_HEIGHT + ROW_HEIGHT / 2,
          xTo,
          yTo: iTask * ROW_HEIGHT + ROW_HEIGHT / 2,
          arrowRight: xTo >= xFrom,
        })
      }
    }
    return out
  })

  return (
    <div
      role="group"
      aria-label="Gantt chart"
      tabIndex={0}
      class={cn(
        'overflow-x-auto rounded-lg border border-border bg-card outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
        props.class,
      )}
    >
      <Show
        when={props.tasks.length > 0}
        fallback={<p class="p-4 text-sm text-muted-foreground">No tasks to display.</p>}
      >
        <div class="flex min-w-[640px]">
          {/* Names column */}
          <div class="w-40 shrink-0 border-r border-border">
            <div class="flex h-8 items-center px-3 text-xs font-medium text-muted-foreground">Task</div>
            <For each={props.tasks}>
              {(task, i) => (
                <div
                  class={cn(
                    'flex h-10 items-center border-t border-border px-3',
                    i() % 2 === 1 && 'bg-muted',
                  )}
                >
                  <span class="truncate text-sm text-foreground" title={task.name}>
                    {task.name}
                  </span>
                </div>
              )}
            </For>
          </div>

          {/* Chart column: header ticks, rows, connectors and the today marker all
              share this box as their coordinate space (percent for x, px for y). */}
          <div class="relative flex-1">
            {/* Vertical gridlines, one per tick, spanning the whole chart column. */}
            <div class="pointer-events-none absolute inset-0">
              <For each={ticks()}>
                {(tick) => (
                  <div
                    class="absolute inset-y-0 border-l border-border/40"
                    style={{ left: `${tick.percent}%` }}
                  />
                )}
              </For>
            </div>

            <div class="relative h-8">
              <For each={ticks()}>
                {(tick) => (
                  <span
                    class="absolute top-1/2 -translate-y-1/2 whitespace-nowrap pl-1 text-[11px] text-muted-foreground"
                    style={{ left: `${tick.percent}%` }}
                  >
                    {tick.label}
                  </span>
                )}
              </For>
            </div>

            <For each={props.tasks}>
              {(task, i) => {
                const left = () => percentFor(task.start)
                const width = () => Math.max(percentFor(task.end) - left(), 1)
                return (
                  <div class={cn('relative h-10 border-t border-border', i() % 2 === 1 && 'bg-muted')}>
                    <div
                      title={`${task.name}: ${task.start} → ${task.end}`}
                      class={cn(
                        'absolute inset-y-2 rounded',
                        task.tone === 'accent' ? 'bg-accent' : 'bg-primary',
                      )}
                      style={{ left: `${left()}%`, width: `${width()}%` }}
                    />
                  </div>
                )
              }}
            </For>

            {/* Dependency connectors: elbow (vertical run at the predecessor's end,
                horizontal run into the dependent's start) as bordered divs. */}
            <div
              class="pointer-events-none absolute inset-x-0 bottom-0"
              style={{ top: `${HEADER_HEIGHT}px` }}
            >
              <For each={connectors()}>
                {(c) => (
                  <>
                    <div
                      class="absolute border-l border-border"
                      style={{
                        left: `${c.xFrom}%`,
                        top: `${Math.min(c.yFrom, c.yTo)}px`,
                        height: `${Math.abs(c.yTo - c.yFrom)}px`,
                      }}
                    />
                    <div
                      class="absolute border-t border-border"
                      style={{
                        top: `${c.yTo}px`,
                        left: `${Math.min(c.xFrom, c.xTo)}%`,
                        width: `${Math.abs(c.xTo - c.xFrom)}%`,
                      }}
                    />
                    <div
                      class={cn(
                        'absolute h-0 w-0 border-y-4 border-y-transparent',
                        c.arrowRight ? 'border-l-8 border-l-border' : 'border-r-8 border-r-border',
                      )}
                      style={{
                        top: `${c.yTo - 4}px`,
                        left: c.arrowRight ? `calc(${c.xTo}% - 8px)` : `${c.xTo}%`,
                      }}
                    />
                  </>
                )}
              </For>
            </div>

            {/* "Today" marker, spanning the header + every row. */}
            <Show when={todayPercent() !== null}>
              <div
                class="pointer-events-none absolute inset-y-0 border-l border-primary"
                style={{ left: `${todayPercent()}%` }}
                title="Today"
              />
            </Show>
          </div>
        </div>
      </Show>
    </div>
  )
}
