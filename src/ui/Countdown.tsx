// Live countdown to a target Date, rendered as four Days/Hours/Mins/Secs cells.
// A single setInterval (started in onMount, cleared in onCleanup) ticks a signal
// once per second; remaining ms is clamped at 0 and `onComplete` fires exactly
// once when the target is reached. Each digit is an odometer-style roller: the
// column of 0–9 slides so the active digit sits in the viewport, so a decreasing
// countdown rolls the new number in from the top — like an old flip clock.
//
// Digit/cell slots use <Index> (keyed by position, not value) so they persist
// across ticks and the CSS transform transition actually animates instead of the
// node being torn down and recreated each second.
//
// The target instant is captured once (createMemo): a parent JSX expression like
// `to={new Date(Date.now() + X)}` compiles to a getter Solid re-evaluates on each
// access, which would otherwise pin "remaining" at X forever. Memoizing reads it
// a single time (and still updates if `to` is backed by a real signal).
import { createMemo, createSignal, Index, onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

export interface CountdownProps {
  /** Target moment the countdown runs toward. */
  to: Date
  /** Called once, the moment the countdown reaches zero. */
  onComplete?: () => void
  class?: string
}

const MS_PER_SECOND = 1000
const MS_PER_MINUTE = 60 * MS_PER_SECOND
const MS_PER_HOUR = 60 * MS_PER_MINUTE
const MS_PER_DAY = 24 * MS_PER_HOUR
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

const pad = (n: number): string => String(n).padStart(2, '0')

/** One odometer digit: a 0–9 column shifted so `char`'s row fills the viewport. */
function Digit(props: { char: string }): JSX.Element {
  const digit = () => (props.char >= '0' && props.char <= '9' ? Number(props.char) : 0)
  return (
    <span class="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-top">
      <span
        class="absolute inset-x-0 top-0 flex flex-col transition-transform duration-500 ease-out"
        style={{ transform: `translateY(${digit() * -10}%)` }}
      >
        <Index each={DIGITS}>
          {(d) => <span class="block h-[1em] text-center leading-none">{d()}</span>}
        </Index>
      </span>
    </span>
  )
}

/** Render a value string as a row of rolling digits (stable slots per position). */
function Rollers(props: { value: string }): JSX.Element {
  const chars = () => props.value.split('')
  return (
    <span class="flex text-2xl font-bold tabular-nums text-foreground">
      <Index each={chars()}>{(char) => <Digit char={char()} />}</Index>
    </span>
  )
}

/**
 * Live countdown to `props.to`, shown as four cells (Days / Hours / Mins /
 * Secs). Updates every second and calls `props.onComplete` once when it hits
 * zero. Each digit rolls like an old flip clock as it changes. Hours, minutes,
 * and seconds are zero-padded to two digits.
 *
 * @example
 * ```tsx
 * <Countdown to={new Date(Date.now() + 86_400_000)} onComplete={() => launch()} />
 * ```
 */
export function Countdown(props: CountdownProps): JSX.Element {
  // Read the target instant once (see file header on why this must be memoized).
  const target = createMemo(() => props.to.getTime())
  const remainingOf = () => Math.max(0, target() - Date.now())
  const [remaining, setRemaining] = createSignal(remainingOf())

  let completed = false
  const notifyIfDone = (ms: number) => {
    if (ms <= 0 && !completed) {
      completed = true
      props.onComplete?.()
    }
  }
  // eslint-disable-next-line solid/reactivity -- one-time check at setup for an already-elapsed target
  notifyIfDone(remaining())

  onMount(() => {
    const id = setInterval(() => {
      const ms = remainingOf()
      setRemaining(ms)
      notifyIfDone(ms)
    }, MS_PER_SECOND)
    onCleanup(() => clearInterval(id))
  })

  const days = () => Math.floor(remaining() / MS_PER_DAY)
  const hours = () => Math.floor((remaining() % MS_PER_DAY) / MS_PER_HOUR)
  const minutes = () => Math.floor((remaining() % MS_PER_HOUR) / MS_PER_MINUTE)
  const seconds = () => Math.floor((remaining() % MS_PER_MINUTE) / MS_PER_SECOND)

  const cells = (): { label: string; value: string }[] => [
    { label: 'Days', value: String(days()) },
    { label: 'Hours', value: pad(hours()) },
    { label: 'Mins', value: pad(minutes()) },
    { label: 'Secs', value: pad(seconds()) },
  ]

  return (
    <div class={cn('flex gap-4', props.class)}>
      <Index each={cells()}>
        {(cell) => (
          <div class="flex flex-col items-center">
            <Rollers value={cell().value} />
            <span class="text-[10px] uppercase tracking-wide text-muted-foreground">{cell().label}</span>
          </div>
        )}
      </Index>
    </div>
  )
}
