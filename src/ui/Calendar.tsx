// Full-month calendar view — an always-visible wrapper around the shared
// CalendarCore (which provides the day/month/year drill-down + year jumps).
// Sunday-first weekday order; speaks `Date` rather than YYYY-MM-DD strings.
import type { JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { CalendarCore } from './internal/CalendarCore'

export interface CalendarProps {
  /** Currently selected day. */
  value?: Date
  /** Called with the newly picked day. */
  onChange?: (date: Date) => void
  class?: string
}

/**
 * Full-month calendar: a header with month/year navigation and a 6×7 grid of
 * day buttons. Click the month or year in the header to jump straight to a month
 * or year picker; the double chevrons step a whole year at a time. The selected
 * day is filled and "today" gets a ring. Theme-agnostic, always visible.
 *
 * @example
 * ```tsx
 * const [date, setDate] = createSignal(new Date())
 * <Calendar value={date()} onChange={setDate} />
 * ```
 */
export function Calendar(props: CalendarProps): JSX.Element {
  return (
    <div class={cn('w-72', props.class)}>
      <CalendarCore
        selected={props.value}
        initialView={props.value}
        onPick={(d) => props.onChange?.(d)}
        weekStart={0}
      />
    </div>
  )
}
