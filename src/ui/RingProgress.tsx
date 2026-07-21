// Circular (radial) progress ring rendered as an SVG with a centered label.
import type { JSX } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../lib/cn'

export interface RingProgressProps {
  value: number
  /** Outer diameter of the ring in px. @default 96 */
  size?: number
  /** Stroke width of the track and arc in px. @default 8 */
  thickness?: number
  /** Content centered over the ring. Defaults to the rounded percent. */
  label?: JSX.Element
  /** Accessible name for the `role="progressbar"` element. */
  'aria-label'?: string
  class?: string
}

/**
 * Circular progress indicator drawn with two concentric SVG circles: a muted
 * track and a primary arc whose length is derived from `value` (0–100). Use for
 * compact, radial completion feedback where a linear bar would be too wide.
 *
 * @example
 * ```tsx
 * <RingProgress value={72} />
 * <RingProgress value={40} size={128} thickness={12} label={<span>4/10</span>} />
 * ```
 */
export function RingProgress(props: RingProgressProps): JSX.Element {
  const size = () => props.size ?? 96
  const thickness = () => props.thickness ?? 8
  const clamped = () => Math.min(100, Math.max(0, props.value))
  const radius = () => (size() - thickness()) / 2
  const circumference = () => 2 * Math.PI * radius()
  const offset = () => circumference() * (1 - clamped() / 100)

  return (
    <div
      role="progressbar"
      aria-label={props['aria-label']}
      aria-valuenow={clamped()}
      aria-valuemin={0}
      aria-valuemax={100}
      class={cn('relative inline-flex items-center justify-center', props.class)}
      style={{ width: `${size()}px`, height: `${size()}px` }}
    >
      <svg width={size()} height={size()} viewBox={`0 0 ${size()} ${size()}`} class="-rotate-90">
        <circle
          cx={size() / 2}
          cy={size() / 2}
          r={radius()}
          fill="none"
          stroke="hsl(var(--muted))"
          stroke-width={thickness()}
        />
        <circle
          cx={size() / 2}
          cy={size() / 2}
          r={radius()}
          fill="none"
          stroke="hsl(var(--primary))"
          stroke-width={thickness()}
          stroke-linecap="round"
          stroke-dasharray={String(circumference())}
          stroke-dashoffset={String(offset())}
          class="transition-all"
        />
      </svg>
      <div class="absolute inset-0 flex items-center justify-center text-sm font-medium text-foreground">
        <Show when={props.label} fallback={`${Math.round(clamped())}%`}>
          {props.label}
        </Show>
      </div>
    </div>
  )
}
