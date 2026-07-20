// ActionBar — sticky action / emergency bar: a full-width strip that pins one
// prominent CTA to the viewport edge, with an optional status badge + short
// message beside it. Built for urgent-service verticals (towing, HVAC,
// locksmith, …) where the call-to-action — usually a `tel:` link — has to
// stay reachable through the whole page scroll. On narrow viewports the
// message drops out first so the badge + action never wrap or get pushed
// off-screen.
import { Show, splitProps, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { spawnRipple } from '../ui/Ripple'

/** Edge an {@link ActionBar} pins to when `sticky`. Defaults to `'top'`. */
export type ActionBarPosition = 'top' | 'bottom'

export interface ActionBarProps {
  /**
   * The prominent CTA. Rendered as `<a href>` when `href` is set (e.g.
   * `tel:+15551234567`), otherwise as a `<button type="button">` driven by
   * `onClick`.
   */
  action: { label: string; href?: string; onClick?: () => void }
  /** Optional left slot, e.g. a `<Badge pulse>24/7</Badge>`. */
  status?: JSX.Element
  /** Optional short text between `status` and the action. Hidden below `sm` so the action stays reachable. */
  message?: JSX.Element
  /** Pins the bar to the viewport edge (`position`) instead of scrolling with the page. Defaults to `true`. */
  sticky?: boolean
  /** Edge to pin to when `sticky`. Defaults to `'top'`. */
  position?: ActionBarPosition
  class?: string
}

const POSITION_CLASSES: Record<ActionBarPosition, string> = {
  top: 'top-0',
  bottom: 'bottom-0',
}

// Deliberately not the Button primitive: Button always renders a <button>,
// and this CTA needs to be a real <a href="tel:…"> for click-to-call. The
// classes mirror Button's shape/motion but use accent (not primary) so the
// CTA still pops against the bar's own bg-primary surface.
const ACTION_CLASSES =
  'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-accent px-4 py-2 text-sm font-semibold whitespace-nowrap text-accent-foreground transition-[background-color,transform] duration-150 hover:bg-accent/90 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-ring'

/**
 * Sticky action / emergency bar: a full-width strip that pins a single
 * prominent CTA to the viewport edge, with an optional status badge and
 * short message beside it. Built for urgent-service verticals (towing, HVAC,
 * locksmith, …) where the CTA — usually a `tel:` link — must stay reachable
 * through the whole scroll. The action gets a click ripple like `<Button
 * ripple>`; the message drops out on narrow viewports so the badge + action
 * never wrap.
 *
 * @example
 * ```tsx
 * <ActionBar
 *   status={<Badge pulse>24/7</Badge>}
 *   message="Stuck on the road? We're on our way."
 *   action={{ label: 'Call now', href: 'tel:+15551234567' }}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Bottom-pinned, plain onClick action instead of a tel: link.
 * <ActionBar
 *   position="bottom"
 *   message="Free quote in 2 minutes"
 *   action={{ label: 'Get a quote', onClick: openQuoteForm }}
 * />
 * ```
 */
export function ActionBar(props: ActionBarProps): JSX.Element {
  const [local] = splitProps(props, ['action', 'status', 'message', 'sticky', 'position', 'class'])

  const handlePointerDown: JSX.EventHandler<HTMLElement, PointerEvent> = (event) => {
    spawnRipple(event.currentTarget, event, { opacity: 0.35 })
  }

  return (
    <div
      class={cn(
        'z-40 flex w-full items-center justify-between gap-3 bg-primary px-4 py-3 text-primary-foreground',
        (local.sticky ?? true) && cn('sticky', POSITION_CLASSES[local.position ?? 'top']),
        local.class,
      )}
    >
      <div class="flex min-w-0 items-center gap-2 sm:gap-3">
        <Show when={local.status}>{local.status}</Show>
        <Show when={local.message}>
          <p class="hidden min-w-0 truncate text-sm sm:block sm:text-base">{local.message}</p>
        </Show>
      </div>
      <Show
        when={local.action.href}
        fallback={
          <button
            type="button"
            class={ACTION_CLASSES}
            onPointerDown={handlePointerDown}
            onClick={local.action.onClick}
          >
            {local.action.label}
          </button>
        }
      >
        {(href) => (
          <a
            href={href()}
            class={ACTION_CLASSES}
            onPointerDown={handlePointerDown}
            onClick={local.action.onClick}
          >
            {local.action.label}
          </a>
        )}
      </Show>
    </div>
  )
}
