// Compact custom time picker — no Kobalte primitive covers this yet, so this is
// a small hand-rolled hour/minute (/ AM-PM) column picker in plain Solid + theme
// tokens (works in light/dark). Reuses DateField's popover machinery verbatim:
// a trigger button opens a portaled popover positioned `fixed` at the trigger's
// viewport rect, closing on outside mousedown, Escape, scroll, or resize.
import { Clock } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { For, Show, createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { Portal } from 'solid-js/web'

import { cn } from '../lib/cn'

type AmPm = 'AM' | 'PM'

const HOURS24 = Array.from({ length: 24 }, (_, i) => i)
const HOURS12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

/** Zero-pad a non-negative integer to 2 digits. */
function pad(n: number): string {
  return `${n}`.padStart(2, '0')
}

/** Parse canonical "HH:MM" (24h) into `{h, m}`; null if malformed or out of range. */
function parse(value: string): { h: number; m: number } | null {
  const mm = /^(\d{2}):(\d{2})$/.exec(value)
  if (!mm) return null
  const h = Number(mm[1])
  const m = Number(mm[2])
  if (h < 0 || h > 23 || m < 0 || m > 59) return null
  return { h, m }
}

/** Format an `{h, m}` pair as canonical "HH:MM" (24h, zero-padded). */
function format(h: number, m: number): string {
  return `${pad(h)}:${pad(m)}`
}

/** Convert a 24h hour to `{h12, ampm}` (12 stands for both 12AM and 12PM). */
function to12(h24: number): { h12: number; ampm: AmPm } {
  const ampm: AmPm = h24 < 12 ? 'AM' : 'PM'
  let h12 = h24 % 12
  if (h12 === 0) h12 = 12
  return { h12, ampm }
}

/** Convert a 12h hour + AM/PM back to a 24h hour. */
function to24(h12: number, ampm: AmPm): number {
  if (ampm === 'AM') return h12 === 12 ? 0 : h12
  return h12 === 12 ? 12 : h12 + 12
}

/** Human-readable trigger label, e.g. `15:05` or `3:05 PM`. */
function displayLabel(value: string, hour12: boolean): string | null {
  const p = parse(value)
  if (!p) return null
  if (hour12) {
    const { h12, ampm } = to12(p.h)
    return `${h12}:${pad(p.m)} ${ampm}`
  }
  return format(p.h, p.m)
}

export interface TimeFieldProps {
  /** Selected time as canonical 24h "HH:MM" (e.g. "15:05"), or "" for none. */
  value: string
  /** Called with the newly picked time as "HH:MM" (24h). */
  onChange: (value: string) => void
  /** 12-hour display with AM/PM instead of 24-hour. @default false */
  hour12?: boolean
  /** Minute increment for the options list. @default 5 */
  minuteStep?: number
  /** Placeholder shown on the trigger when value is empty. */
  label?: string
  disabled?: boolean
  class?: string
}

/**
 * Compact hand-rolled hour/minute (/ AM-PM) column picker (no Kobalte primitive
 * covers this yet). Trigger button opens a portaled popover; closes on outside
 * click, Escape, scroll, or resize. Speaks plain 24h `HH:MM` strings.
 *
 * @example
 * ```tsx
 * const [time, setTime] = createSignal('15:05')
 * <TimeField value={time()} onChange={setTime} label="Start time" hour12 />
 * ```
 */
export function TimeField(props: TimeFieldProps): JSX.Element {
  const [open, setOpen] = createSignal(false)
  // Working selection shown/highlighted in the popover columns — 24h internally
  // regardless of display mode. Seeded on open (see openPopover), not here.
  const [workH, setWorkH] = createSignal(0)
  const [workM, setWorkM] = createSignal(0)

  let rootRef: HTMLDivElement | undefined
  let btnRef: HTMLButtonElement | undefined
  let popRef: HTMLDivElement | undefined
  // The picker is rendered in a <Portal> (so it escapes the glass card's
  // backdrop-filter stacking context, which otherwise traps it behind later
  // content). Being at <body>, it can't use `absolute` positioning relative to
  // the trigger — position it with `fixed` at the trigger's viewport rect.
  const [pos, setPos] = createSignal({ top: 0, left: 0 })
  const popWidth = () => (props.hour12 ? 224 : 176) // w-56 / w-44

  const place = () => {
    if (!btnRef) return
    const r = btnRef.getBoundingClientRect()
    const w = popWidth()
    const left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8))
    setPos({ top: r.bottom + 4, left })
  }

  const openPopover = () => {
    if (props.disabled) return
    const seed = parse(props.value)
    if (seed) {
      setWorkH(seed.h)
      setWorkM(seed.m)
    } else {
      const step = props.minuteStep ?? 5
      const now = new Date()
      let h = now.getHours()
      let m = Math.round(now.getMinutes() / step) * step
      if (m >= 60) {
        m -= 60
        h = (h + 1) % 24
      }
      setWorkH(h)
      setWorkM(m)
    }
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

  const minuteOptions = createMemo(() => {
    const step = props.minuteStep ?? 5
    const out: number[] = []
    for (let m = 0; m < 60; m += step) out.push(m)
    return out
  })

  // Pick an hour: `value` is a 24h hour when hour12 is off, else the 12h label
  // (1..12) which is combined with the current AM/PM to resolve the 24h hour.
  const pickHour = (value: number) => {
    const h24 = props.hour12 ? to24(value, to12(workH()).ampm) : value
    setWorkH(h24)
    props.onChange(format(h24, workM()))
  }

  const pickMinute = (m: number) => {
    setWorkM(m)
    props.onChange(format(workH(), m))
  }

  const pickAmPm = (ampm: AmPm) => {
    const h24 = to24(to12(workH()).h12, ampm)
    setWorkH(h24)
    props.onChange(format(h24, workM()))
  }

  const optionClass = (selected: boolean) =>
    cn(
      'rounded-md px-2 py-1 text-left text-sm transition-colors',
      selected ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted',
    )

  return (
    <div ref={rootRef} class={cn('relative', props.class)}>
      <button
        ref={btnRef}
        type="button"
        disabled={props.disabled}
        onClick={() => (open() ? close() : openPopover())}
        class="flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-left text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span class={displayLabel(props.value, props.hour12 ?? false) ? '' : 'text-muted-foreground'}>
          {displayLabel(props.value, props.hour12 ?? false) ?? props.label ?? 'Select time'}
        </span>
        <Clock class="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      <Show when={open()}>
        <Portal>
          <div
            ref={popRef}
            style={{ position: 'fixed', top: `${pos().top}px`, left: `${pos().left}px` }}
            class={cn(
              'z-50 flex gap-1 divide-x divide-border rounded-lg border border-border bg-card p-2 text-card-foreground shadow-lg',
              props.hour12 ? 'w-56' : 'w-44',
            )}
          >
            <div
              class="flex max-h-56 flex-1 flex-col gap-0.5 overflow-y-auto pr-1"
              role="listbox"
              aria-label="Hour"
            >
              <For each={props.hour12 ? HOURS12 : HOURS24}>
                {(h) => {
                  const isSel = () => (props.hour12 ? to12(workH()).h12 === h : workH() === h)
                  return (
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSel()}
                      onClick={() => pickHour(h)}
                      class={optionClass(isSel())}
                    >
                      {props.hour12 ? h : pad(h)}
                    </button>
                  )
                }}
              </For>
            </div>

            <div
              class="flex max-h-56 flex-1 flex-col gap-0.5 overflow-y-auto px-1"
              role="listbox"
              aria-label="Minute"
            >
              <For each={minuteOptions()}>
                {(m) => {
                  const isSel = () => workM() === m
                  return (
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSel()}
                      onClick={() => pickMinute(m)}
                      class={optionClass(isSel())}
                    >
                      {pad(m)}
                    </button>
                  )
                }}
              </For>
            </div>

            <Show when={props.hour12}>
              <div
                class="flex max-h-56 flex-1 flex-col gap-0.5 overflow-y-auto pl-1"
                role="listbox"
                aria-label="AM or PM"
              >
                <For each={['AM', 'PM'] as const}>
                  {(ampm) => {
                    const isSel = () => to12(workH()).ampm === ampm
                    return (
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSel()}
                        onClick={() => pickAmPm(ampm)}
                        class={optionClass(isSel())}
                      >
                        {ampm}
                      </button>
                    )
                  }}
                </For>
              </div>
            </Show>
          </div>
        </Portal>
      </Show>
    </div>
  )
}
