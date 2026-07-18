// Two-click range variant of DateField: same hand-rolled popover mechanism
// (portaled, fixed-positioned at the trigger's viewport rect, closing on
// outside click / Escape / scroll / resize), but driving `<CalendarCore>`'s
// `rangeStart`/`rangeEnd` highlight instead of a single `selected` day. Value/
// onChange speak plain `YYYY-MM-DD` strings (local, never `toISOString` which
// shifts by timezone).
import { CalendarDays } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createEffect, createMemo, createSignal, onCleanup, Show } from 'solid-js'
import { Portal } from 'solid-js/web'

import { cn } from '../lib/cn'
import { CalendarCore } from './internal/CalendarCore'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
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

/** Format a local Date as `YYYY-MM-DD` (zero-padded, no timezone shift). */
function fmt(d: Date): string {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parse `YYYY-MM-DD` into a local-midnight Date; null if malformed. */
function parse(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

/** Human-readable endpoint label, e.g. `15 Mar 2026`. */
function formatDay(d: Date, months: string[]): string {
  return `${d.getDate()} ${months[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`
}

export interface DateRange {
  /** 'YYYY-MM-DD' (local) or '' if unset. */
  start: string
  end: string
}

export interface DateRangePickerProps {
  value: DateRange
  onChange: (value: DateRange) => void
  /** Placeholder shown when nothing is selected. */
  label?: string
  disabled?: boolean
  months?: string[]
  weekdays?: string[]
  class?: string
}

/**
 * Compact hand-rolled range picker built on the same popover mechanism as
 * `DateField`, but tracking a start/end pair instead of a single day. The
 * first click begins a range, the second completes it (closing the popover);
 * clicking again once complete starts a fresh range.
 *
 * @example
 * ```tsx
 * const [range, setRange] = createSignal<DateRange>({ start: '2026-03-15', end: '' })
 * <DateRangePicker value={range()} onChange={setRange} label="Stay dates" />
 * ```
 */
export function DateRangePicker(props: DateRangePickerProps): JSX.Element {
  const [open, setOpen] = createSignal(false)

  let rootRef: HTMLDivElement | undefined
  let btnRef: HTMLButtonElement | undefined
  let popRef: HTMLDivElement | undefined
  // The calendar is rendered in a <Portal> (so it escapes the glass card's
  // backdrop-filter stacking context, which otherwise traps it behind later
  // content). Being at <body>, it can't use `absolute` positioning relative to
  // the trigger — position it with `fixed` at the trigger's viewport rect.
  const [pos, setPos] = createSignal({ top: 0, left: 0 })
  const POP_W = 288 // w-72

  const place = () => {
    if (!btnRef) return
    const r = btnRef.getBoundingClientRect()
    const left = Math.max(8, Math.min(r.left, window.innerWidth - POP_W - 8))
    setPos({ top: r.bottom + 4, left })
  }

  const openPopover = () => {
    if (props.disabled) return
    place()
    setOpen(true)
  }

  const close = () => setOpen(false)

  const onDocPointer = (ev: MouseEvent) => {
    const t = ev.target as Node
    // Ignore clicks on the trigger (rootRef) AND the portaled popover (popRef).
    if (rootRef && !rootRef.contains(t) && popRef && !popRef.contains(t)) close()
  }
  const onKey = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') close()
  }

  // Wire/tear-down the global listeners strictly around the open state. Scroll/
  // resize close the popover (its fixed position would otherwise drift).
  const toggleListeners = (isOpen: boolean) => {
    if (isOpen) {
      document.addEventListener('mousedown', onDocPointer)
      document.addEventListener('keydown', onKey)
      window.addEventListener('scroll', close, true)
      window.addEventListener('resize', close)
    } else {
      document.removeEventListener('mousedown', onDocPointer)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }
  // Reactively attach when open flips; always clean up on unmount.
  createEffect(() => toggleListeners(open()))
  onCleanup(() => toggleListeners(false))

  const startDate = createMemo(() => parse(props.value.start))
  const endDate = createMemo(() => parse(props.value.end))

  const triggerLabel = createMemo(() => {
    const months = props.months ?? MONTHS
    const s = startDate()
    const e = endDate()
    if (s && e) return `${formatDay(s, months)} – ${formatDay(e, months)}`
    if (s) return `${formatDay(s, months)} – …`
    return null
  })

  const handlePick = (d: Date) => {
    const { start, end } = props.value
    const startD = start ? parse(start) : null

    // Both endpoints set, or neither set: begin a fresh range and stay open.
    if ((start && end) || (!start && !end) || !startD) {
      props.onChange({ start: fmt(d), end: '' })
      return
    }

    // Start set, end empty: complete the range if picking on/after start,
    // otherwise restart from the newly picked (earlier) day.
    if (d >= startD) {
      props.onChange({ start, end: fmt(d) })
      close()
    } else {
      props.onChange({ start: fmt(d), end: '' })
    }
  }

  return (
    <div ref={rootRef} class={cn('relative', props.class)}>
      <button
        ref={btnRef}
        type="button"
        disabled={props.disabled}
        onClick={() => (open() ? close() : openPopover())}
        class="flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-left text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span class={triggerLabel() ? '' : 'text-muted-foreground'}>
          {triggerLabel() ?? props.label ?? 'Select range'}
        </span>
        <CalendarDays class="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      <Show when={open()}>
        <Portal>
          <div
            ref={popRef}
            style={{ position: 'fixed', top: `${pos().top}px`, left: `${pos().left}px` }}
            class="z-50 w-72 rounded-lg border border-border bg-card p-3 text-card-foreground shadow-lg"
          >
            <CalendarCore
              rangeStart={startDate() ?? undefined}
              rangeEnd={endDate() ?? undefined}
              initialView={startDate() ?? undefined}
              onPick={handlePick}
              weekStart={1}
              months={props.months}
              weekdays={props.weekdays ?? WEEKDAYS}
            />
          </div>
        </Portal>
      </Show>
    </div>
  )
}
