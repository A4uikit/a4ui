// Full-month calendar view — a hand-rolled 6×7 month grid in plain Solid + theme
// tokens (works in light/dark), sharing DateField's calendar approach but always
// visible (no popover) and speaking `Date` rather than `YYYY-MM-DD` strings. The
// displayed month is its own signal so prev/next navigation is independent of the
// selected value. Sunday-first weekday order.
import { ChevronLeft, ChevronRight } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { For, createMemo, createSignal } from 'solid-js'

import { cn } from '../lib/cn'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export interface CalendarProps {
  /** Currently selected day. */
  value?: Date
  /** Called with the newly picked day. */
  onChange?: (date: Date) => void
  class?: string
}

/**
 * Full-month calendar: a header with the month/year and prev/next navigation, a
 * row of weekday labels, and a 6×7 grid of day buttons. Days outside the shown
 * month are muted; the selected day is filled and "today" gets a ring. Clicking a
 * day calls `onChange`. Theme-agnostic (semantic tokens only), always visible.
 *
 * @example
 * ```tsx
 * const [date, setDate] = createSignal(new Date())
 * <Calendar value={date()} onChange={setDate} />
 * ```
 */
export function Calendar(props: CalendarProps): JSX.Element {
  // Month currently shown in the grid — seeded ONCE from the value (or today).
  // The user navigates months manually, so it need not track later value changes.
  // eslint-disable-next-line solid/reactivity
  const initial = props.value ?? new Date()
  const [viewYear, setViewYear] = createSignal(initial.getFullYear())
  const [viewMonth, setViewMonth] = createSignal(initial.getMonth())

  const prevMonth = () => {
    const m = viewMonth()
    if (m === 0) {
      setViewMonth(11)
      setViewYear(viewYear() - 1)
    } else {
      setViewMonth(m - 1)
    }
  }
  const nextMonth = () => {
    const m = viewMonth()
    if (m === 11) {
      setViewMonth(0)
      setViewYear(viewYear() + 1)
    } else {
      setViewMonth(m + 1)
    }
  }

  // 6×7 grid of dates starting on the Sunday on/before the 1st of the month,
  // split into 6 weeks of 7 days for <For>.
  const weeks = createMemo(() => {
    const offset = new Date(viewYear(), viewMonth(), 1).getDay() // 0=Sun..6=Sat
    const start = new Date(viewYear(), viewMonth(), 1 - offset)
    const rows: Date[][] = []
    for (let w = 0; w < 6; w++) {
      const row: Date[] = []
      for (let d = 0; d < 7; d++) {
        const i = w * 7 + d
        row.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
      }
      rows.push(row)
    }
    return rows
  })

  const today = new Date()

  return (
    <div class={cn('w-72 select-none', props.class)}>
      <div class="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Previous month"
          class="rounded-md p-1 text-foreground transition-colors hover:bg-muted"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>
        <span class="text-sm font-medium text-foreground">
          {MONTHS[viewMonth()]} {viewYear()}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Next month"
          class="rounded-md p-1 text-foreground transition-colors hover:bg-muted"
        >
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>

      <div class="mb-1 grid grid-cols-7 gap-0.5 text-center text-xs text-muted-foreground">
        <For each={WEEKDAYS}>{(w) => <span>{w}</span>}</For>
      </div>

      <div role="grid" class="grid grid-cols-7 gap-0.5">
        <For each={weeks()}>
          {(week) => (
            <For each={week}>
              {(d) => {
                const inMonth = d.getMonth() === viewMonth()
                const isSel = () => {
                  const s = props.value
                  return s ? sameDay(s, d) : false
                }
                const isToday = sameDay(today, d)
                const label = `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
                return (
                  <button
                    type="button"
                    role="gridcell"
                    aria-label={label}
                    aria-selected={isSel()}
                    onClick={() => props.onChange?.(d)}
                    class={cn(
                      'flex h-8 items-center justify-center rounded-md text-sm transition-colors',
                      isSel() ? 'bg-primary font-semibold text-primary-foreground' : 'hover:bg-muted',
                      !isSel() && !inMonth && 'text-muted-foreground/50',
                      !isSel() && inMonth && 'text-foreground',
                      !isSel() && isToday && 'ring-1 ring-primary',
                    )}
                  >
                    {d.getDate()}
                  </button>
                )
              }}
            </For>
          )}
        </For>
      </div>
    </div>
  )
}
