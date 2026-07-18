// KPI / stat card with two motion touches: a Motion (motion.dev) fade-up
// entrance (staggered via `delay`) and a createCountUp tween on the numeric
// value — both gated on reduced motion. This is the design system's showcase of
// the motion layer (Motion's `animate` + the count-up helper) in a real component.
import { Show, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { animateIn, createCountUp } from '../lib/motion'
import { Card, CardContent } from './Card'

/** Color scheme applied to a {@link Stat}'s icon badge. */
export type StatTone = 'primary' | 'success' | 'danger' | 'neutral'

const TONE_CLASSES: Record<StatTone, string> = {
  primary: 'bg-primary/15 text-primary',
  success: 'bg-emerald-500/15 text-emerald-600',
  danger: 'bg-rose-500/15 text-rose-600',
  neutral: 'bg-muted text-muted-foreground',
}

interface StatProps {
  label: string
  /** Numeric value — count-up tweens toward it on mount and on change. */
  value: number
  /** Format the (animating) number for display. Default: rounded integer. */
  format?: (n: number) => string
  icon?: JSX.Element
  tone?: StatTone
  /** Entrance stagger delay in seconds (for a row of stats). */
  delay?: number
  class?: string
}

/**
 * KPI / stat card showing a label, an animated count-up numeric value, and
 * an optional tone-colored icon badge. Combines a `solid-motionone` fade-up
 * entrance (use `delay` to stagger a row of stats) with the `createCountUp`
 * tween — both automatically disabled under `prefers-reduced-motion`.
 *
 * @example
 * ```tsx
 * <Stat label="Active users" value={activeUsers()} tone="success" icon={<UsersIcon />} />
 * ```
 */
export function Stat(props: StatProps): JSX.Element {
  const count = createCountUp(() => props.value)
  const display = () => (props.format ?? ((n) => String(Math.round(n))))(count())
  let ref: HTMLDivElement | undefined
  onMount(() => {
    if (ref) animateIn(ref, { delay: props.delay ?? 0 })
  })
  return (
    <div ref={ref}>
      <Card glass glow class={props.class}>
        <CardContent class="flex items-center gap-4 p-5">
          <Show when={props.icon}>
            <div
              class={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
                TONE_CLASSES[props.tone ?? 'neutral'],
              )}
            >
              {props.icon}
            </div>
          </Show>
          <div class="min-w-0">
            <p class="truncate text-sm text-muted-foreground">{props.label}</p>
            <p class="truncate text-xl font-semibold tabular-nums text-foreground">{display()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
