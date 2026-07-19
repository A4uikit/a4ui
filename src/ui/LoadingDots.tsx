// Three dots bouncing in a staggered wave — a lightweight indeterminate
// loading indicator. The bounce is pure CSS (keyframes injected once into the
// document head) so there's no per-frame JS cost; reduced motion swaps the
// bounce for a gentle opacity pulse.
import type { JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface LoadingDotsProps {
  /** Dot diameter in px. @default 8 */
  size?: number
  /** Optional accessible label. @default 'Loading' */
  label?: string
  class?: string
}

const STYLE_ID = 'a4ui-loading-dots-style'

function ensureStyleInjected(): void {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
@keyframes a4-dot-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-60%); }
}
@keyframes a4-dot-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
`
  document.head.appendChild(style)
}

/**
 * Three dots bouncing in a staggered wave — an inline, indeterminate loading
 * indicator. Dots use `bg-current`, so color/size follow the ancestor's text
 * color; diameter is set via `size`. Falls back to a gentle opacity pulse
 * under reduced motion.
 *
 * @example
 * ```tsx
 * <LoadingDots label="Loading results" class="text-primary" />
 * ```
 */
export function LoadingDots(props: LoadingDotsProps): JSX.Element {
  ensureStyleInjected()

  const size = () => props.size ?? 8
  const animationName = () => (motionReduced() ? 'a4-dot-pulse' : 'a4-dot-bounce')

  const dotStyle = (delayMs: number): JSX.CSSProperties => ({
    width: `${size()}px`,
    height: `${size()}px`,
    'animation-name': animationName(),
    'animation-duration': '0.6s',
    'animation-iteration-count': 'infinite',
    'animation-timing-function': 'ease-in-out',
    'animation-delay': `${delayMs}ms`,
  })

  return (
    <span
      role="status"
      aria-label={props.label ?? 'Loading'}
      class={cn('inline-flex items-center gap-1 text-current', props.class)}
    >
      <span class="rounded-full bg-current" style={dotStyle(0)} />
      <span class="rounded-full bg-current" style={dotStyle(120)} />
      <span class="rounded-full bg-current" style={dotStyle(240)} />
    </span>
  )
}
