// Scroll container with thin, token-colored scrollbars. Native scrolling (no JS
// thumb): wheel, touch, keyboard and screen readers behave as the platform does.
// Scrollbar styling is Tailwind arbitrary variants (Firefox `scrollbar-*`
// properties + WebKit pseudo-elements), so there is no component CSS file.
import { splitProps, type JSX, type ParentProps } from 'solid-js'

import { cn } from '../lib/cn'

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both'

interface ScrollAreaProps extends ParentProps {
  /** Which axis scrolls. @default 'vertical' */
  orientation?: ScrollAreaOrientation
  /**
   * Accessible name. When set, the area is exposed as a labelled `region`.
   * Recommended whenever the content is more than decoration.
   */
  label?: string
  /** Receives the scrolling element (to read or set `scrollTop`, observe, …). */
  ref?: (el: HTMLDivElement) => void
  class?: string
  style?: JSX.CSSProperties
}

export type { ScrollAreaProps }

const AXIS: Record<ScrollAreaOrientation, string> = {
  vertical: 'overflow-y-auto overflow-x-hidden',
  horizontal: 'overflow-x-auto overflow-y-hidden',
  both: 'overflow-auto',
}

/**
 * Scrollable container with thin scrollbars tinted from the theme tokens. Give it
 * a bounded size (`class="h-64"`, `max-h-…`, or a flex parent) — it scrolls
 * whatever overflows. It is keyboard-focusable so the content can be scrolled
 * with the arrow keys.
 *
 * @example
 * ```tsx
 * <ScrollArea class="h-64 rounded-xl border border-border" label="Release notes">
 *   <div class="p-4">…long content…</div>
 * </ScrollArea>
 * ```
 */
export function ScrollArea(props: ScrollAreaProps): JSX.Element {
  const [local] = splitProps(props, ['orientation', 'label', 'ref', 'class', 'style', 'children'])
  return (
    <div
      ref={(el) => local.ref?.(el)}
      // A scrollable region must be reachable by keyboard (axe: scrollable-region-focusable).
      tabIndex={0}
      role={local.label ? 'region' : undefined}
      aria-label={local.label}
      data-orientation={local.orientation ?? 'vertical'}
      style={local.style}
      class={cn(
        'relative overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-ring',
        '[scrollbar-color:hsl(var(--muted-foreground)/0.35)_transparent] [scrollbar-width:thin]',
        '[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent',
        '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/35',
        'hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/55',
        AXIS[local.orientation ?? 'vertical'],
        local.class,
      )}
    >
      {local.children}
    </div>
  )
}
