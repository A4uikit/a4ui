// Full-bleed promo bar. Optionally dismissible (local signal, closes for the
// session only — no persistence) and optionally carries a copyable coupon
// code pill. Kept dependency-free: clipboard access is feature-detected, not
// polyfilled, so it degrades to "show the code, copy button is a no-op" on
// browsers/contexts without `navigator.clipboard`.
import type { JSX } from 'solid-js'
import { createSignal, Show } from 'solid-js'
import { Check, Copy, X } from 'lucide-solid'

import { cn } from '../lib/cn'

/** Background tone of an {@link AnnouncementBar}. */
export type AnnouncementTone = 'primary' | 'accent' | 'neutral'

const TONE: Record<AnnouncementTone, string> = {
  primary: 'bg-primary text-primary-foreground',
  accent: 'bg-accent text-accent-foreground',
  neutral: 'bg-muted text-foreground',
}

export interface AnnouncementBarProps {
  /** Message content. */
  children: JSX.Element
  /** Background tone. Defaults to `'primary'`. */
  tone?: AnnouncementTone
  /** Show a dismiss (X) button. Defaults to `false`. */
  dismissible?: boolean
  /** Optional coupon code rendered as a copyable pill. */
  couponCode?: string
  /** Make the whole message a link. */
  href?: string
  /** Called after the bar is dismissed. */
  onDismiss?: () => void
  class?: string
}

/**
 * A full-width promo/notice bar, meant to sit above or below the page header.
 * Supports an optional dismiss button, an optional link wrapping the message,
 * and an optional copyable coupon-code pill.
 *
 * @example
 * ```tsx
 * <AnnouncementBar
 *   tone="accent"
 *   dismissible
 *   couponCode="SAVE20"
 *   href="/sale"
 * >
 *   Summer sale is live — 20% off everything
 * </AnnouncementBar>
 * ```
 */
export function AnnouncementBar(props: AnnouncementBarProps): JSX.Element {
  const [dismissed, setDismissed] = createSignal(false)
  const [copied, setCopied] = createSignal(false)

  const copyCode = async () => {
    const code = props.couponCode
    if (!code || !navigator.clipboard) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const dismiss = () => {
    setDismissed(true)
    props.onDismiss?.()
  }

  return (
    <Show when={!dismissed()}>
      <div
        role="region"
        aria-label="Announcement"
        class={cn(
          'relative w-full rounded-none px-4 py-2 text-center text-sm',
          TONE[props.tone ?? 'primary'],
          props.dismissible && 'pr-10',
          props.class,
        )}
      >
        <Show when={props.href} fallback={<span>{props.children}</span>}>
          <a
            href={props.href}
            class="underline-offset-2 transition-colors hover:underline motion-reduce:transition-none"
          >
            {props.children}
          </a>
        </Show>

        <Show when={props.couponCode}>
          {(code) => (
            <span class="ml-2 inline-flex items-center gap-1 rounded-md bg-black/10 px-2 py-0.5 font-mono">
              {code()}
              <button
                type="button"
                aria-label={copied() ? 'Coupon code copied' : 'Copy coupon code'}
                onClick={copyCode}
                class="inline-flex items-center gap-1 transition-opacity hover:opacity-80 motion-reduce:transition-none"
              >
                <Show when={copied()} fallback={<Copy class="h-3 w-3" />}>
                  <Check class="h-3 w-3" />
                  Copied
                </Show>
              </button>
            </span>
          )}
        </Show>

        <Show when={props.dismissible}>
          <button
            type="button"
            aria-label="Dismiss announcement"
            onClick={dismiss}
            class="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 transition-opacity hover:opacity-80 motion-reduce:transition-none"
          >
            <X class="h-4 w-4" />
          </button>
        </Show>
      </div>
    </Show>
  )
}
