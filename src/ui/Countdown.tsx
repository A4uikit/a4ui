// Live countdown to a target Date, rendered as four Days/Hours/Mins/Secs cells.
// A single setInterval (started in onMount, cleared in onCleanup) ticks a signal
// once per second; remaining ms is clamped at 0 and `onComplete` fires exactly
// once when the target is reached. Purely runtime, theme-agnostic display.
import { createSignal, onCleanup, onMount, type JSX, For } from 'solid-js'

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

const pad = (n: number): string => String(n).padStart(2, '0')

/**
 * Live countdown to `props.to`, shown as four cells (Days / Hours / Mins /
 * Secs). Updates every second and calls `props.onComplete` once when it hits
 * zero. Hours, minutes, and seconds are zero-padded to two digits.
 *
 * @example
 * ```tsx
 * <Countdown to={new Date(Date.now() + 86_400_000)} onComplete={() => launch()} />
 * ```
 */
export function Countdown(props: CountdownProps): JSX.Element {
  const remainingOf = (target: Date) => Math.max(0, target.getTime() - Date.now())
  const [remaining, setRemaining] = createSignal(remainingOf(props.to))

  let completed = false
  const notifyIfDone = (ms: number) => {
    if (ms <= 0 && !completed) {
      completed = true
      props.onComplete?.()
    }
  }
  notifyIfDone(remaining())

  onMount(() => {
    const id = setInterval(() => {
      const ms = remainingOf(props.to)
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
      <For each={cells()}>
        {(cell) => (
          <div class="flex flex-col items-center">
            <span class="text-2xl font-bold tabular-nums text-foreground">{cell.value}</span>
            <span class="text-[10px] uppercase tracking-wide text-muted-foreground">{cell.label}</span>
          </div>
        )}
      </For>
    </div>
  )
}
