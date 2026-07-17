// Inline status banner on Kobalte's Alert primitive. The tone is carried by the
// border/background tint and a colored icon; the TEXT stays foreground/muted so
// it keeps WCAG-AA contrast in both dark and light themes (tone `-600` text was
// too dim on the dark surface).
import { Alert as KAlert } from '@kobalte/core/alert'
import { CircleCheck, CircleX, Info, TriangleAlert } from 'lucide-solid'
import type { Component, JSX, ParentProps } from 'solid-js'
import { Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { cn } from '../lib/cn'

/** Semantic tone of an {@link Alert}; drives the border/background tint and icon. */
export type AlertTone = 'info' | 'success' | 'warning' | 'danger'

const TONE: Record<AlertTone, { wrap: string; icon: string; Icon: Component<{ class?: string }> }> = {
  info: { wrap: 'border-sky-500/30 bg-sky-500/10', icon: 'text-sky-500', Icon: Info },
  success: { wrap: 'border-emerald-500/30 bg-emerald-500/10', icon: 'text-emerald-500', Icon: CircleCheck },
  warning: { wrap: 'border-amber-500/30 bg-amber-500/10', icon: 'text-amber-500', Icon: TriangleAlert },
  danger: { wrap: 'border-rose-500/30 bg-rose-500/10', icon: 'text-rose-500', Icon: CircleX },
}

interface AlertProps extends ParentProps {
  /** Visual/semantic tone. Defaults to `'info'`. */
  tone?: AlertTone
  /** Optional bold heading shown above the body text. */
  title?: string
  class?: string
}

/**
 * Inline status banner (not a toast/dialog) built on Kobalte's `Alert` primitive,
 * for surfacing info/success/warning/danger messages inline in the page.
 *
 * @example
 * ```tsx
 * <Alert tone="warning" title="Heads up">
 *   Your session will expire in 5 minutes.
 * </Alert>
 * ```
 */
export function Alert(props: AlertProps): JSX.Element {
  const tone = () => TONE[props.tone ?? 'info']
  return (
    <KAlert class={cn('flex gap-3 rounded-lg border p-3 text-sm text-foreground', tone().wrap, props.class)}>
      <Dynamic component={tone().Icon} class={cn('mt-0.5 h-4 w-4 shrink-0', tone().icon)} />
      <div class="flex-1">
        <Show when={props.title}>
          <p class="font-semibold">{props.title}</p>
        </Show>
        <div class="text-muted-foreground">{props.children}</div>
      </div>
    </KAlert>
  )
}
