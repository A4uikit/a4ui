// Combined date + time picker: a DateField and a TimeField side by side that
// read/write a single "YYYY-MM-DD HH:MM" string (local, no timezone shift). Each
// half keeps its own popover; this just splits the value on the way in and joins
// it on the way out, so either part can be filled independently.
import type { JSX } from 'solid-js'
import { createMemo } from 'solid-js'

import { cn } from '../lib/cn'
import { DateField } from './DateField'
import { TimeField } from './TimeField'

export interface DateTimeFieldProps {
  /** Selected moment as `YYYY-MM-DD HH:MM` (local), or `''` for none. */
  value: string
  /** Called with the combined `YYYY-MM-DD HH:MM` (either part may be missing). */
  onChange: (value: string) => void
  /** 12-hour time display with AM/PM. @default false */
  hour12?: boolean
  /** Minute increment for the time options. @default 5 */
  minuteStep?: number
  /** Placeholder for the date half. */
  dateLabel?: string
  /** Placeholder for the time half. */
  timeLabel?: string
  disabled?: boolean
  class?: string
}

const DATE_RE = /\d{4}-\d{2}-\d{2}/
const TIME_RE = /\d{2}:\d{2}/

const join = (date: string, time: string): string => [date, time].filter(Boolean).join(' ')

/**
 * Date + time picker built from {@link DateField} and {@link TimeField}. Speaks a
 * single `YYYY-MM-DD HH:MM` string; the two halves fill in independently.
 *
 * @example
 * ```tsx
 * const [when, setWhen] = createSignal('2026-07-15 09:30')
 * <DateTimeField value={when()} onChange={setWhen} hour12 />
 * ```
 */
export function DateTimeField(props: DateTimeFieldProps): JSX.Element {
  const datePart = createMemo(() => DATE_RE.exec(props.value)?.[0] ?? '')
  const timePart = createMemo(() => TIME_RE.exec(props.value)?.[0] ?? '')

  return (
    <div class={cn('flex flex-wrap items-start gap-2', props.class)}>
      <DateField
        value={datePart()}
        onChange={(d) => props.onChange(join(d, timePart()))}
        label={props.dateLabel ?? 'Select date'}
        disabled={props.disabled}
        class="min-w-40 flex-1"
      />
      <TimeField
        value={timePart()}
        onChange={(t) => props.onChange(join(datePart(), t))}
        hour12={props.hour12}
        minuteStep={props.minuteStep}
        label={props.timeLabel ?? 'Select time'}
        disabled={props.disabled}
        class="min-w-32"
      />
    </div>
  )
}
