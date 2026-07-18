// Compact custom date picker — Kobalte 0.13.x ships no DatePicker, so this is a
// small hand-rolled month-grid calendar in plain Solid + theme tokens (works in
// light/dark). No new deps: outside-click is a document listener wired on open
// and torn down via onCleanup; the popover is absolutely positioned under the
// trigger. Value/onChange speak `YYYY-MM-DD` (local, never toISOString which
// shifts by timezone).
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { For, Show, createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { Portal } from 'solid-js/web'

import { cn } from '../lib/cn'

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

/** Human-readable trigger label, e.g. `15 Mar 2026`. */
function displayLabel(value: string, months: string[]): string | null {
  const d = parse(value)
  if (!d) return null
  return `${d.getDate()} ${months[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

interface DateFieldProps {
  /** Selected date as `YYYY-MM-DD` (local, no timezone shift), or `''` for none. */
  value: string
  /** Called with the newly picked date as `YYYY-MM-DD`. */
  onChange: (value: string) => void
  /** Placeholder shown on the trigger when `value` is empty. */
  label?: string
  disabled?: boolean
  class?: string
  /** Full month names, January … December order (12 entries). */
  months?: string[]
  /** Weekday headers, Monday-first (7 entries). */
  weekdays?: string[]
}

/**
 * Compact hand-rolled month-grid date picker (no Kobalte primitive covers this yet).
 * Trigger button opens a portaled popover calendar; closes on outside click, Escape,
 * scroll, or resize. Speaks plain `YYYY-MM-DD` strings, never `Date`/`toISOString`.
 *
 * @example
 * ```tsx
 * const [date, setDate] = createSignal('2026-07-14')
 * <DateField value={date()} onChange={setDate} label="Due date" />
 * ```
 */
export function DateField(props: DateFieldProps): JSX.Element {
  const [open, setOpen] = createSignal(false)
  // Month currently shown in the grid — seeded ONCE from the value (or today).
  // Intentional untracked read: the popover mounts fresh per use and the user
  // navigates months manually, so it need not track later value changes.
  // eslint-disable-next-line solid/reactivity
  const initial = parse(props.value) ?? new Date()
  const [viewYear, setViewYear] = createSignal(initial.getFullYear())
  const [viewMonth, setViewMonth] = createSignal(initial.getMonth())

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
    const seed = parse(props.value) ?? new Date()
    setViewYear(seed.getFullYear())
    setViewMonth(seed.getMonth())
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

  // 6×7 grid of dates starting on the Monday on/before the 1st of the month.
  const cells = createMemo(() => {
    const first = new Date(viewYear(), viewMonth(), 1)
    // Monday-first offset: JS getDay() is 0=Sun..6=Sat.
    const offset = (first.getDay() + 6) % 7
    const start = new Date(viewYear(), viewMonth(), 1 - offset)
    const out: Date[] = []
    for (let i = 0; i < 42; i++) {
      out.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
    }
    return out
  })

  const selected = createMemo(() => parse(props.value))
  const today = new Date()

  const pick = (d: Date) => {
    props.onChange(fmt(d))
    close()
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
        <span class={displayLabel(props.value, props.months ?? MONTHS) ? '' : 'text-muted-foreground'}>
          {displayLabel(props.value, props.months ?? MONTHS) ?? props.label ?? 'Select date'}
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
            <div class="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Previous month"
                class="rounded-md p-1 text-foreground transition-colors hover:bg-muted"
              >
                <ChevronLeft class="h-4 w-4" />
              </button>
              <span class="text-sm font-medium capitalize text-foreground">
                {(props.months ?? MONTHS)[viewMonth()]} {viewYear()}
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

            <div class="mb-1 grid grid-cols-7 gap-0.5 text-center text-[11px] font-medium text-muted-foreground">
              <For each={props.weekdays ?? WEEKDAYS}>{(w) => <span>{w}</span>}</For>
            </div>

            <div class="grid grid-cols-7 gap-0.5">
              <For each={cells()}>
                {(d) => {
                  const inMonth = d.getMonth() === viewMonth()
                  const isSel = () => {
                    const s = selected()
                    return s ? sameDay(s, d) : false
                  }
                  const isToday = sameDay(today, d)
                  return (
                    <button
                      type="button"
                      onClick={() => pick(d)}
                      class={cn(
                        'flex h-8 items-center justify-center rounded-md text-sm transition-colors',
                        isSel() ? 'bg-primary font-semibold text-primary-foreground' : 'hover:bg-muted',
                        !isSel() && !inMonth && 'text-muted-foreground/50',
                        !isSel() && inMonth && 'text-foreground',
                        !isSel() && isToday && 'ring-1 ring-inset ring-ring',
                      )}
                    >
                      {d.getDate()}
                    </button>
                  )
                }}
              </For>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}
