// BorderBeam — a small gradient light segment that travels continuously
// around the border of its `position: relative` parent, tracing the box's
// own edge via CSS `offset-path: rect(...)` with `offset-distance` animated
// 0% → 100%. Pure CSS: no JS animation engine, no ResizeObserver — the
// browser resolves the rect()'s `auto` edges against the element's own box,
// so the path always matches the parent's current size however it resizes.
// The traveling element is a thin bar (not a full square) so it hugs the
// edge by itself, without needing a border-only mask trick. Reduced motion
// swaps the moving beam for a static, non-animated edge glow.
import { type JSX, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface BorderBeamProps {
  /** Length of the traveling gradient segment, in px. @default 60 */
  size?: number
  /** Full trip duration around the border, in seconds. @default 6 */
  duration?: number
  /** Animation start offset, in seconds. @default 0 */
  delay?: number
  class?: string
}

const KEYFRAMES_ID = 'a4ui-border-beam-keyframes'
const KEYFRAMES = '@keyframes border-beam-travel { to { offset-distance: 100%; } }'

// Injected once, lazily, the first time a <BorderBeam> renders. The repo's
// CSS doctrine keeps shared @keyframes in src/styles/tokens.css, but this
// component ships standalone (tree-shakeable, no required stylesheet import)
// so it carries its own single small <style> tag instead — de-duped by id,
// so multiple instances on a page still only inject it once.
function ensureKeyframes(): void {
  if (typeof document === 'undefined' || document.getElementById(KEYFRAMES_ID)) return
  const style = document.createElement('style')
  style.id = KEYFRAMES_ID
  style.textContent = KEYFRAMES
  document.head.appendChild(style)
}

/**
 * Decorative light segment that travels continuously around the border of
 * its parent. The parent must be `position: relative` (or similar) — this
 * renders an absolutely-positioned, `pointer-events-none` layer (`inset-0`,
 * `rounded-[inherit]`) tracking the parent's own box. Purely cosmetic
 * (`aria-hidden`); under reduced motion the moving beam is replaced with a
 * static edge glow instead of animating.
 *
 * @example
 * ```tsx
 * <div class="relative overflow-hidden rounded-2xl border border-border p-6">
 *   <BorderBeam />
 *   <p>Card content</p>
 * </div>
 * ```
 */
export function BorderBeam(props: BorderBeamProps): JSX.Element {
  const size = () => props.size ?? 60
  const duration = () => props.duration ?? 6
  const delay = () => props.delay ?? 0

  if (!motionReduced()) ensureKeyframes()

  return (
    <Show
      when={!motionReduced()}
      fallback={
        <span
          aria-hidden="true"
          class={cn(
            'pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.35)]',
            props.class,
          )}
        />
      }
    >
      <span
        aria-hidden="true"
        class={cn('pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]', props.class)}
      >
        <span
          class="absolute top-0 left-0 h-[3px] rounded-full"
          style={{
            width: `${size()}px`,
            'offset-path': `rect(0 auto auto 0 round ${size()}px)`,
            'offset-distance': '0%',
            background:
              'linear-gradient(to right, transparent, hsl(var(--primary)), hsl(var(--accent)), transparent)',
            animation: `border-beam-travel ${duration()}s linear infinite`,
            'animation-delay': `${delay()}s`,
          }}
        />
      </span>
    </Show>
  )
}
