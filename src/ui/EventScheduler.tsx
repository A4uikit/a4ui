// Time-grid calendar: day or week view of hour bands (startHour..endHour) with
// events absolutely positioned by their start/end minutes, split side-by-side on
// overlap. Shares its time-slot idiom with AvailabilityPicker (native `Date`,
// ISO/'HH:mm' strings, no date library) — this one draws a positioned grid
// instead of a button list. Plain Solid + theme tokens (works in light/dark).
import type { JSX } from 'solid-js'
import { createMemo, For, Show } from 'solid-js'

import { cn } from '../lib/cn'

/** A single scheduled event; `start`/`end` are local ISO datetimes ('YYYY-MM-DDTHH:mm'). */
export interface SchedulerEvent {
  id: string
  title: string
  start: string
  end: string
  tone?: 'primary' | 'accent'
}

export interface EventSchedulerProps {
  events: SchedulerEvent[]
  /** Day to show (day view) or the week containing it (week view). ISO 'YYYY-MM-DD'. @default today */
  date?: string
  /** @default 'day' */
  view?: 'day' | 'week'
  /** First hour band shown (0–23). @default 7 */
  startHour?: number
  /** Last hour band shown, exclusive (0–23). @default 21 */
  endHour?: number
  class?: string
}

const HOUR_PX = 56
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

const TONE_CLASSES: Record<'primary' | 'accent', string> = {
  primary: 'bg-primary text-primary-foreground',
  accent: 'bg-accent text-accent-foreground',
}

/** Local-time `YYYY-MM-DD` key for a Date. */
function isoKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parse a local ISO datetime ('YYYY-MM-DDTHH:mm') into a `Date`, no timezone shifting. */
function parseLocal(dt: string): Date {
  const [datePart, timePart = '00:00'] = dt.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const [hh, mm] = timePart.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm)
}

function minutesOfDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes()
}

/** 'HH:mm'-since-midnight minutes rendered as a 12h clock label, e.g. 570 -> '9:30 AM'. */
function fmtTime(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  const period = h < 12 ? 'AM' : 'PM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

interface PositionedEvent {
  event: SchedulerEvent
  startMin: number
  endMin: number
}

interface LaidOutEvent extends PositionedEvent {
  col: number
  colCount: number
}

/**
 * Greedy interval-graph coloring: overlapping events in a day column get
 * side-by-side sub-columns (like most calendar UIs). Non-overlapping events
 * each get the full column width.
 */
function layoutColumn(events: PositionedEvent[]): LaidOutEvent[] {
  const sorted = [...events].sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin)
  const results: LaidOutEvent[] = []
  let cluster: (PositionedEvent & { col: number })[] = []
  let colEnds: number[] = []
  let clusterMaxEnd = -Infinity

  const flush = () => {
    if (cluster.length === 0) return
    const colCount = Math.max(...cluster.map((e) => e.col)) + 1
    for (const e of cluster) results.push({ ...e, colCount })
    cluster = []
  }

  for (const ev of sorted) {
    if (ev.startMin >= clusterMaxEnd) {
      flush()
      colEnds = []
      clusterMaxEnd = -Infinity
    }
    let col = colEnds.findIndex((end) => end <= ev.startMin)
    if (col === -1) {
      col = colEnds.length
      colEnds.push(ev.endMin)
    } else {
      colEnds[col] = ev.endMin
    }
    clusterMaxEnd = Math.max(clusterMaxEnd, ev.endMin)
    cluster.push({ ...ev, col })
  }
  flush()
  return results
}

/**
 * Time-grid calendar: one column per visible day, hour bands from `startHour` to
 * `endHour`, events absolutely positioned by their start/end minutes and split
 * side-by-side when they overlap. Draws a "now" line through today's column
 * when it's in view. Read-only positioning (drag-to-create/resize is out of
 * scope). Scrolls vertically when the hour range is tall.
 *
 * @example
 * ```tsx
 * <EventScheduler
 *   view="week"
 *   date="2026-07-21"
 *   events={[
 *     { id: '1', title: 'Standup', start: '2026-07-21T09:00', end: '2026-07-21T09:30', tone: 'primary' },
 *     { id: '2', title: 'Design review', start: '2026-07-21T09:15', end: '2026-07-21T10:00', tone: 'accent' },
 *   ]}
 * />
 * ```
 */
export function EventScheduler(props: EventSchedulerProps): JSX.Element {
  const startHour = () => props.startHour ?? 7
  const endHour = () => props.endHour ?? 21
  const hours = createMemo(() => {
    const out: number[] = []
    for (let h = startHour(); h < endHour(); h++) out.push(h)
    return out
  })
  const gridHeight = () => (endHour() - startHour()) * HOUR_PX
  const rangeStart = () => startHour() * 60
  const rangeEnd = () => endHour() * 60
  const pxFor = (min: number) => ((min - rangeStart()) / (rangeEnd() - rangeStart())) * gridHeight()

  const baseDate = createMemo(() => (props.date ? parseLocal(props.date) : new Date()))

  const days = createMemo(() => {
    const base = baseDate()
    if ((props.view ?? 'day') === 'day') {
      return [new Date(base.getFullYear(), base.getMonth(), base.getDate())]
    }
    const sunday = new Date(base.getFullYear(), base.getMonth(), base.getDate() - base.getDay())
    return Array.from(
      { length: 7 },
      (_, i) => new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i),
    )
  })

  const eventsByDay = createMemo(() => {
    const map = new Map<string, PositionedEvent[]>()
    for (const event of props.events) {
      const start = parseLocal(event.start)
      const end = parseLocal(event.end)
      const key = isoKey(start)
      const startMin = minutesOfDay(start)
      const list = map.get(key) ?? []
      list.push({ event, startMin, endMin: Math.max(minutesOfDay(end), startMin + 15) })
      map.set(key, list)
    }
    return map
  })

  const today = new Date()
  const nowMin = today.getHours() * 60 + today.getMinutes()

  return (
    <div class={cn('flex flex-col overflow-hidden rounded-xl border border-border bg-card', props.class)}>
      {/* Header row: gutter + one label per visible day */}
      <div class="flex border-b border-border">
        <div class="w-14 shrink-0" />
        <For each={days()}>
          {(day) => (
            <div class="flex-1 border-l border-border py-2 text-center">
              <div class="text-xs text-muted-foreground">{DAY_LABELS[day.getDay()]}</div>
              <div
                class={cn(
                  'mx-auto mt-0.5 grid h-6 w-6 place-items-center rounded-full text-sm text-foreground',
                  isoKey(day) === isoKey(today) && 'bg-primary font-semibold text-primary-foreground',
                )}
              >
                {day.getDate()}
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Body: scrolls vertically; gutter of hour labels + day columns */}
      <div
        role="group"
        aria-label="Schedule grid"
        tabIndex={0}
        class="flex overflow-y-auto outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        style={{ 'max-height': '32rem' }}
      >
        <div class="w-14 shrink-0" style={{ height: `${gridHeight()}px` }}>
          <For each={hours()}>
            {(h) => (
              <div
                class="relative text-right text-xs text-muted-foreground"
                style={{ height: `${HOUR_PX}px` }}
              >
                <span class="absolute -top-2 right-2">{fmtTime(h * 60)}</span>
              </div>
            )}
          </For>
        </div>

        <For each={days()}>
          {(day) => {
            const laidOut = createMemo(() => layoutColumn(eventsByDay().get(isoKey(day)) ?? []))
            const isToday = isoKey(day) === isoKey(today)
            return (
              <div class="relative flex-1 border-l border-border" style={{ height: `${gridHeight()}px` }}>
                {/* Hour gridlines */}
                <For each={hours()}>
                  {(h) => (
                    <div
                      class="absolute inset-x-0 border-t border-border"
                      style={{ top: `${pxFor(h * 60)}px` }}
                    />
                  )}
                </For>

                {/* "Now" line, today's column only */}
                <Show when={isToday && nowMin >= rangeStart() && nowMin <= rangeEnd()}>
                  <div class="absolute inset-x-0 z-20 h-px bg-accent" style={{ top: `${pxFor(nowMin)}px` }}>
                    <span class="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-accent" />
                  </div>
                </Show>

                {/* Events */}
                <For each={laidOut()}>
                  {(item) => {
                    const clampedStart = Math.max(item.startMin, rangeStart())
                    const clampedEnd = Math.min(item.endMin, rangeEnd())
                    const top = pxFor(clampedStart)
                    const height = Math.max(pxFor(clampedEnd) - top, 18)
                    const widthPct = 100 / item.colCount
                    return (
                      <Show when={clampedEnd > rangeStart() && clampedStart < rangeEnd()}>
                        <div
                          class={cn(
                            'absolute z-10 overflow-hidden rounded-md px-1.5 py-1 text-left text-xs shadow-sm',
                            TONE_CLASSES[item.event.tone ?? 'primary'],
                          )}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            left: `${item.col * widthPct}%`,
                            width: `calc(${widthPct}% - 2px)`,
                          }}
                          title={`${item.event.title} · ${fmtTime(item.startMin)}–${fmtTime(item.endMin)}`}
                        >
                          <div class="truncate font-medium">{item.event.title}</div>
                          <div class="truncate opacity-80">{fmtTime(item.startMin)}</div>
                        </div>
                      </Show>
                    )
                  }}
                </For>
              </div>
            )
          }}
        </For>
      </div>
    </div>
  )
}
