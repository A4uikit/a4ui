// Booking-style time-slot picker: a compact scrollable list of bookable dates on
// the left (from the keys of `slotsByDate`), open 'HH:mm' slots for the selected
// date as a button grid on the right. Shares its time-slot idiom with
// EventScheduler (native `Date`, ISO/'HH:mm' strings, no date library) — this one
// lays slots out as buttons instead of a positioned grid. Plain Solid + theme
// tokens (works in light/dark).
import type { JSX } from 'solid-js'
import { createMemo, createSignal, For, Show } from 'solid-js'

import { cn } from '../lib/cn'

export interface AvailabilityPickerProps {
  /** Open slots per date, keyed by local ISO 'YYYY-MM-DD'; each value is a list of 'HH:mm' times. */
  slotsByDate: Record<string, string[]>
  /** Controlled selection; omit to manage selection internally. */
  value?: { date: string; time: string }
  onChange?: (selection: { date: string; time: string }) => void
  /** Label shown near the slots. @default the browser's Intl timezone */
  timezone?: string
  class?: string
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

/** Parse a `YYYY-MM-DD` key into a local `Date` at midnight, no timezone shifting. */
function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Format an 'HH:mm' 24h slot as a 12h label, e.g. '09:30' -> '9:30 AM'. */
function formatSlot(time: string): string {
  const [hh, mm] = time.split(':').map(Number)
  const period = hh < 12 ? 'AM' : 'PM'
  const h12 = hh % 12 === 0 ? 12 : hh % 12
  return `${h12}:${String(mm).padStart(2, '0')} ${period}`
}

/**
 * Booking-style availability picker: a scrollable list of bookable dates on the
 * left (built from the keys of `slotsByDate`) and a scrollable grid of open
 * 'HH:mm' slots for the selected date on the right, with a timezone label.
 * Controlled via `value`/`onChange`, or self-managed when `value` is omitted.
 * Fully keyboard accessible (native buttons, `aria-pressed` on the current pick).
 *
 * @example
 * ```tsx
 * const [selection, setSelection] = createSignal<{ date: string; time: string }>()
 * <AvailabilityPicker
 *   slotsByDate={{ '2026-07-22': ['09:00', '09:30', '14:00'], '2026-07-23': ['10:00'] }}
 *   value={selection()}
 *   onChange={setSelection}
 * />
 * ```
 */
export function AvailabilityPicker(props: AvailabilityPickerProps): JSX.Element {
  const dates = createMemo(() => Object.keys(props.slotsByDate).sort())

  const [internalValue, setInternalValue] = createSignal<{ date: string; time: string } | undefined>(
    undefined,
  )
  // eslint-disable-next-line solid/reactivity -- seed once; navigation from here is user-driven
  const [viewingDate, setViewingDate] = createSignal<string | undefined>(props.value?.date ?? dates()[0])

  const selection = () => props.value ?? internalValue()
  const activeDate = () => props.value?.date ?? viewingDate()
  const slots = createMemo(() => props.slotsByDate[activeDate() ?? ''] ?? [])
  const timezone = () => props.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone

  const pick = (date: string, time: string) => {
    setViewingDate(date)
    setInternalValue({ date, time })
    props.onChange?.({ date, time })
  }

  return (
    <div class={cn('flex overflow-hidden rounded-xl border border-border bg-card', props.class)}>
      {/* Date list */}
      <div class="flex w-32 shrink-0 flex-col gap-1 overflow-y-auto border-r border-border p-2">
        <For each={dates()} fallback={<p class="p-2 text-xs text-muted-foreground">No dates</p>}>
          {(dateKey) => {
            const d = parseDateKey(dateKey)
            const isActive = () => activeDate() === dateKey
            const count = () => props.slotsByDate[dateKey]?.length ?? 0
            return (
              <button
                type="button"
                aria-pressed={isActive()}
                disabled={count() === 0}
                onClick={() => setViewingDate(dateKey)}
                class={cn(
                  'flex flex-col items-start rounded-md px-2 py-1.5 text-left transition-colors',
                  isActive() ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted',
                  count() === 0 && !isActive() && 'text-muted-foreground/50',
                )}
              >
                <span class="text-[10px] uppercase opacity-80">{WEEKDAY_SHORT[d.getDay()]}</span>
                <span class="text-sm font-medium">
                  {MONTH_SHORT[d.getMonth()]} {d.getDate()}
                </span>
              </button>
            )
          }}
        </For>
      </div>

      {/* Slots */}
      <div class="flex flex-1 flex-col">
        <div class="flex items-center justify-between border-b border-border px-3 py-2">
          <span class="text-sm font-medium text-foreground">
            <Show when={activeDate()} fallback="Select a date">
              {(d) => {
                const date = parseDateKey(d())
                return `${WEEKDAY_SHORT[date.getDay()]}, ${MONTH_SHORT[date.getMonth()]} ${date.getDate()}`
              }}
            </Show>
          </span>
          <span class="text-xs text-muted-foreground">{timezone()}</span>
        </div>

        <div class="grid grid-cols-3 gap-2 overflow-y-auto p-3" style={{ 'max-height': '20rem' }}>
          <For
            each={slots()}
            fallback={<p class="col-span-3 text-sm text-muted-foreground">No open times</p>}
          >
            {(time) => {
              const isSelected = () => selection()?.date === activeDate() && selection()?.time === time
              return (
                <button
                  type="button"
                  aria-pressed={isSelected()}
                  onClick={() => pick(activeDate() ?? '', time)}
                  class={cn(
                    'rounded-md border px-2 py-1.5 text-sm transition-colors',
                    isSelected()
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-foreground hover:bg-muted',
                  )}
                >
                  {formatSlot(time)}
                </button>
              )
            }}
          </For>
        </div>
      </div>
    </div>
  )
}
