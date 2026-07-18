// Shared month-grid calendar panel used by both Calendar (always visible) and
// DateField (inside a popover). Speaks `Date`. Beyond the day grid it adds fast
// navigation: single chevrons step the month, double chevrons jump a year, and
// the month/year in the header drill down into a month picker and a paged
// year grid — so reaching a distant date is a couple of clicks, not dozens of
// month steps. Plain Solid + theme tokens (works in light/dark).
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createMemo, createSignal, For, Show } from 'solid-js'

import { cn } from '../../lib/cn'

const MONTHS_FULL = [
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
const WEEKDAYS_SUN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const YEARS_PER_PAGE = 12

export interface CalendarCoreProps {
  /** Currently selected day (for highlight); undefined = none. */
  selected?: Date
  /** Called with the newly picked day. */
  onPick: (date: Date) => void
  /** 0 = Sunday-first, 1 = Monday-first. @default 0 */
  weekStart?: 0 | 1
  /** Full month names, January…December order (12). */
  months?: string[]
  /** Weekday headers in DISPLAY order, matching `weekStart` (7). */
  weekdays?: string[]
  /** Month first shown (its year/month seed the view). @default today */
  initialView?: Date
  class?: string
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/**
 * The interactive calendar body: a header (year/month jumps + drill-down) and a
 * grid that switches between day, month, and year views. Stateless about
 * open/closed — the caller decides where it lives.
 */
export function CalendarCore(props: CalendarCoreProps): JSX.Element {
  const months = () => props.months ?? MONTHS_FULL
  const weekdays = () => props.weekdays ?? WEEKDAYS_SUN
  const weekStart = () => props.weekStart ?? 0

  // eslint-disable-next-line solid/reactivity -- seed the view once; the user navigates from here
  const seed = props.initialView ?? props.selected ?? new Date()
  const [viewYear, setViewYear] = createSignal(seed.getFullYear())
  const [viewMonth, setViewMonth] = createSignal(seed.getMonth())
  const [mode, setMode] = createSignal<'days' | 'months' | 'years'>('days')
  // Start of the 12-year window shown in the year view.
  const [yearBase, setYearBase] = createSignal(seed.getFullYear() - (seed.getFullYear() % YEARS_PER_PAGE))

  const stepMonth = (delta: number) => {
    let m = viewMonth() + delta
    let y = viewYear()
    while (m < 0) {
      m += 12
      y -= 1
    }
    while (m > 11) {
      m -= 12
      y += 1
    }
    setViewMonth(m)
    setViewYear(y)
  }
  const stepYear = (delta: number) => setViewYear(viewYear() + delta)

  // 6×7 grid of dates starting on the first `weekStart` day on/before the 1st.
  const cells = createMemo(() => {
    const first = new Date(viewYear(), viewMonth(), 1)
    const offset = (first.getDay() - weekStart() + 7) % 7
    const start = new Date(viewYear(), viewMonth(), 1 - offset)
    const out: Date[] = []
    for (let i = 0; i < 42; i++) {
      out.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
    }
    return out
  })

  const years = createMemo(() => {
    const base = yearBase()
    return Array.from({ length: YEARS_PER_PAGE }, (_, i) => base + i)
  })

  const today = new Date()

  const navBtn = 'grid h-7 w-7 place-items-center rounded-md text-foreground transition-colors hover:bg-muted'
  const headerLabel =
    'rounded-md px-2 py-1 text-sm font-medium capitalize text-foreground transition-colors hover:bg-muted'

  const openYears = () => {
    setYearBase(viewYear() - (viewYear() % YEARS_PER_PAGE))
    setMode('years')
  }

  return (
    <div class={cn('w-full select-none', props.class)}>
      {/* Header */}
      <Show
        when={mode() === 'days'}
        fallback={
          <div class="mb-2 flex items-center justify-between">
            <button
              type="button"
              class={navBtn}
              aria-label="Previous"
              onClick={() => (mode() === 'months' ? stepYear(-1) : setYearBase(yearBase() - YEARS_PER_PAGE))}
            >
              <ChevronLeft class="h-4 w-4" />
            </button>
            <button type="button" class={headerLabel} onClick={() => setMode('days')}>
              <Show when={mode() === 'months'} fallback={`${years()[0]} – ${years()[YEARS_PER_PAGE - 1]}`}>
                {viewYear()}
              </Show>
            </button>
            <button
              type="button"
              class={navBtn}
              aria-label="Next"
              onClick={() => (mode() === 'months' ? stepYear(1) : setYearBase(yearBase() + YEARS_PER_PAGE))}
            >
              <ChevronRight class="h-4 w-4" />
            </button>
          </div>
        }
      >
        <div class="mb-2 flex items-center justify-between gap-1">
          <div class="flex items-center">
            <button type="button" class={navBtn} aria-label="Previous year" onClick={() => stepYear(-1)}>
              <ChevronsLeft class="h-4 w-4" />
            </button>
            <button type="button" class={navBtn} aria-label="Previous month" onClick={() => stepMonth(-1)}>
              <ChevronLeft class="h-4 w-4" />
            </button>
          </div>
          <div class="flex items-center gap-0.5">
            <button type="button" class={headerLabel} onClick={() => setMode('months')}>
              {months()[viewMonth()]}
            </button>
            <button type="button" class={headerLabel} onClick={openYears}>
              {viewYear()}
            </button>
          </div>
          <div class="flex items-center">
            <button type="button" class={navBtn} aria-label="Next month" onClick={() => stepMonth(1)}>
              <ChevronRight class="h-4 w-4" />
            </button>
            <button type="button" class={navBtn} aria-label="Next year" onClick={() => stepYear(1)}>
              <ChevronsRight class="h-4 w-4" />
            </button>
          </div>
        </div>
      </Show>

      {/* Body */}
      <Show when={mode() === 'days'}>
        <div class="mb-1 grid grid-cols-7 gap-0.5 text-center text-[11px] font-medium text-muted-foreground">
          <For each={weekdays()}>{(w) => <span>{w}</span>}</For>
        </div>
        <div role="grid" class="grid grid-cols-7 gap-0.5">
          <For each={cells()}>
            {(d) => {
              const inMonth = d.getMonth() === viewMonth()
              const isSel = () => (props.selected ? sameDay(props.selected, d) : false)
              const isToday = sameDay(today, d)
              const title = `${months()[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
              return (
                <button
                  type="button"
                  role="gridcell"
                  title={title}
                  aria-selected={isSel()}
                  onClick={() => props.onPick(d)}
                  class={cn(
                    'flex h-8 items-center justify-center rounded-md text-sm transition-colors',
                    isSel() ? 'bg-primary font-semibold text-primary-foreground' : 'hover:bg-muted',
                    !isSel() && !inMonth && 'text-muted-foreground/50',
                    !isSel() && inMonth && 'text-foreground',
                    !isSel() && isToday && 'ring-1 ring-inset ring-primary',
                  )}
                >
                  {d.getDate()}
                </button>
              )
            }}
          </For>
        </div>
      </Show>

      <Show when={mode() === 'months'}>
        <div class="grid grid-cols-3 gap-1">
          <For each={months()}>
            {(name, i) => {
              const isCurrent = () => i() === viewMonth()
              return (
                <button
                  type="button"
                  onClick={() => {
                    setViewMonth(i())
                    setMode('days')
                  }}
                  class={cn(
                    'rounded-md py-2 text-sm capitalize transition-colors',
                    isCurrent()
                      ? 'bg-primary font-semibold text-primary-foreground'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  {name.slice(0, 3)}
                </button>
              )
            }}
          </For>
        </div>
      </Show>

      <Show when={mode() === 'years'}>
        <div class="grid grid-cols-3 gap-1">
          <For each={years()}>
            {(y) => {
              const isCurrent = () => y === viewYear()
              return (
                <button
                  type="button"
                  onClick={() => {
                    setViewYear(y)
                    setMode('months')
                  }}
                  class={cn(
                    'rounded-md py-2 text-sm transition-colors',
                    isCurrent()
                      ? 'bg-primary font-semibold text-primary-foreground'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  {y}
                </button>
              )
            }}
          </For>
        </div>
      </Show>
    </div>
  )
}
