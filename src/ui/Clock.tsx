// Live clock that renders the current time as either a digital readout or an
// analog dial. A single setInterval (started in onMount, cleared in
// onCleanup) ticks a `Date` signal once per second; both variants derive their
// hour/minute/second parts from that same signal, using `Intl.DateTimeFormat`
// when a specific `timeZone` is requested.
import { createSignal, onCleanup, onMount, Show, For, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

export interface ClockProps {
  /** 'digital' (default) or 'analog'. */
  variant?: 'digital' | 'analog'
  /** Show the seconds hand / seconds digits. @default true */
  seconds?: boolean
  /** 12-hour clock with AM/PM instead of 24-hour. @default false */
  hour12?: boolean
  /** IANA time zone (e.g. 'America/Hermosillo'); defaults to the local zone. */
  timeZone?: string
  /** Diameter in px for the analog face. @default 160 */
  size?: number
  class?: string
}

const pad = (n: number): string => String(n).padStart(2, '0')

interface TimeParts {
  hours: number
  minutes: number
  seconds: number
}

/**
 * Read h/m/s out of a Date, in `timeZone` if given, else the local zone.
 * Always returns 24h parts — AM/PM and the 12h clamp are derived by the
 * caller, so display formatting stays consistent whether or not a timeZone
 * is set.
 */
function partsOf(date: Date, timeZone: string | undefined): TimeParts {
  if (!timeZone) {
    return { hours: date.getHours(), minutes: date.getMinutes(), seconds: date.getSeconds() }
  }
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date)
  const get = (type: string) => Number(formatted.find((p) => p.type === type)?.value ?? 0)
  return { hours: get('hour') % 24, minutes: get('minute'), seconds: get('second') }
}

/** Digital HH:MM(:SS) readout, zero-padded, with an optional AM/PM suffix. */
function DigitalClock(props: {
  parts: TimeParts
  seconds: boolean
  hour12: boolean
  class?: string
}): JSX.Element {
  const display = () => {
    const { hours, minutes, seconds } = props.parts
    let h = hours
    let suffix = ''
    if (props.hour12) {
      suffix = h >= 12 ? 'PM' : 'AM'
      h = h % 12
      if (h === 0) h = 12
    }
    const time = props.seconds ? `${pad(h)}:${pad(minutes)}:${pad(seconds)}` : `${pad(h)}:${pad(minutes)}`
    return { time, suffix }
  }

  return (
    <div class={cn('flex flex-col items-center justify-center', props.class)}>
      <span class="flex items-baseline gap-2 tabular-nums text-4xl font-bold tracking-tight text-foreground">
        <span>{display().time}</span>
        <Show when={props.hour12}>
          <span class="text-base font-normal text-muted-foreground">{display().suffix}</span>
        </Show>
      </span>
    </div>
  )
}

/** Analog dial: face circle, 12 hour ticks, hour/minute/(second) hands, hub. */
function AnalogClock(props: {
  parts: TimeParts
  seconds: boolean
  size: number
  class?: string
}): JSX.Element {
  const size = () => props.size
  const cx = () => size() / 2
  const cy = () => size() / 2
  const radius = () => size() / 2

  const hourDeg = () => (props.parts.hours % 12) * 30 + props.parts.minutes * 0.5
  const minuteDeg = () => props.parts.minutes * 6 + props.parts.seconds * 0.1
  const secondDeg = () => props.parts.seconds * 6

  const ticks = Array.from({ length: 12 }, (_, i) => i)

  const handPoints = (lengthRatio: number) => {
    const r = radius() * lengthRatio
    return `${cx()},${cy()} ${cx()},${cy() - r}`
  }

  return (
    <svg
      width={size()}
      height={size()}
      viewBox={`0 0 ${size()} ${size()}`}
      class={cn('inline-block', props.class)}
      role="img"
      aria-label="Analog clock"
    >
      <circle cx={cx()} cy={cy()} r={radius() - 2} fill="none" stroke="hsl(var(--border))" stroke-width={2} />
      <For each={ticks}>
        {(i) => {
          const angle = i * 30
          const outer = radius() - 4
          const inner = radius() - (i % 3 === 0 ? 14 : 9)
          const x1 = cx() + outer * Math.sin((angle * Math.PI) / 180)
          const y1 = cy() - outer * Math.cos((angle * Math.PI) / 180)
          const x2 = cx() + inner * Math.sin((angle * Math.PI) / 180)
          const y2 = cy() - inner * Math.cos((angle * Math.PI) / 180)
          return (
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="hsl(var(--muted-foreground))"
              stroke-width={i % 3 === 0 ? 2 : 1}
              stroke-linecap="round"
            />
          )
        }}
      </For>
      {/* Hands rotate via CSS transform. In CSS, rotate() takes only an angle,
          so the pivot is set with transform-origin: center + transform-box:
          view-box (which resolves 'center' against the SVG viewBox = the dial
          center). The SVG-attribute form rotate(angle cx cy) would not work here. */}
      <polyline
        points={handPoints(0.45)}
        stroke="hsl(var(--foreground))"
        stroke-width={4}
        stroke-linecap="round"
        style={{
          transform: `rotate(${hourDeg()}deg)`,
          'transform-origin': 'center',
          'transform-box': 'view-box',
        }}
      />
      <polyline
        points={handPoints(0.65)}
        stroke="hsl(var(--foreground))"
        stroke-width={3}
        stroke-linecap="round"
        style={{
          transform: `rotate(${minuteDeg()}deg)`,
          'transform-origin': 'center',
          'transform-box': 'view-box',
        }}
      />
      <Show when={props.seconds}>
        <polyline
          points={handPoints(0.75)}
          stroke="hsl(var(--primary))"
          stroke-width={1.5}
          stroke-linecap="round"
          style={{
            transform: `rotate(${secondDeg()}deg)`,
            'transform-origin': 'center',
            'transform-box': 'view-box',
          }}
        />
      </Show>
      <circle cx={cx()} cy={cy()} r={3.5} fill="hsl(var(--primary))" />
    </svg>
  )
}

/**
 * Live, self-updating clock. Ticks once per second from a single interval
 * (started in `onMount`, cleared in `onCleanup`) and renders either a digital
 * `HH:MM:SS` readout or an analog SVG dial. Pass `timeZone` to show a specific
 * IANA zone instead of the viewer's local time.
 *
 * @example
 * ```tsx
 * <Clock />
 * <Clock variant="analog" size={200} timeZone="America/Hermosillo" />
 * <Clock hour12 seconds={false} />
 * ```
 */
export function Clock(props: ClockProps): JSX.Element {
  const [now, setNow] = createSignal(new Date())

  onMount(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    onCleanup(() => clearInterval(id))
  })

  const variant = () => props.variant ?? 'digital'
  const showSeconds = () => props.seconds ?? true
  const hour12 = () => props.hour12 ?? false
  const size = () => props.size ?? 160
  const parts = () => partsOf(now(), props.timeZone)

  return (
    <Show
      when={variant() === 'analog'}
      fallback={
        <DigitalClock parts={parts()} seconds={showSeconds()} hour12={hour12()} class={props.class} />
      }
    >
      <AnalogClock parts={parts()} seconds={showSeconds()} size={size()} class={props.class} />
    </Show>
  )
}
