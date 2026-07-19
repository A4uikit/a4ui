// A status pill that smoothly morphs between idle/loading/success/error: the
// background/text color tweens via CSS `transition-colors` while the icon and
// label cross-fade, and each state change gets a spring "pop" via Motion
// (motion.dev's "multi-state badge" pattern) — skipped under reduced motion.
import { createEffect, on, Switch, Match, type JSX } from 'solid-js'
import { Loader2, Check, X } from 'lucide-solid'

import { cn } from '../lib/cn'
import { motionReduced, animate } from '../lib/motion'

/** The lifecycle state a {@link MultiStateBadge} can be in. */
export type BadgeState = 'idle' | 'loading' | 'success' | 'error'

export interface MultiStateBadgeProps {
  /** Current lifecycle state; drives color, icon, and label. */
  state: BadgeState
  /** Override the per-state text. Defaults: idle→'Ready', loading→'Working…', success→'Done', error→'Failed'. */
  labels?: Partial<Record<BadgeState, string>>
  class?: string
}

const DEFAULT_LABELS: Record<BadgeState, string> = {
  idle: 'Ready',
  loading: 'Working…',
  success: 'Done',
  error: 'Failed',
}

const STATE_CLASSES: Record<BadgeState, string> = {
  idle: 'bg-muted text-muted-foreground',
  loading: 'bg-primary/15 text-primary',
  success: 'bg-green-500/15 text-green-600',
  error: 'bg-destructive/15 text-destructive',
}

/**
 * Status badge that animates between `idle` → `loading` → `success` → `error`,
 * morphing its color and swapping its icon/label on each transition. Colors
 * tween via a CSS `transition-colors` class; the pill also gets a spring
 * "pop" and the icon/label cross-fade via Motion's `animate`, both skipped
 * when {@link motionReduced} is true.
 *
 * @example
 * ```tsx
 * <MultiStateBadge state={saveState()} labels={{ error: 'Save failed' }} />
 * ```
 */
export function MultiStateBadge(props: MultiStateBadgeProps): JSX.Element {
  let rootEl: HTMLSpanElement | undefined
  let contentEl: HTMLSpanElement | undefined

  const label = () => props.labels?.[props.state] ?? DEFAULT_LABELS[props.state]

  createEffect(
    on(
      () => props.state,
      () => {
        if (motionReduced()) return
        if (rootEl) animate(rootEl, { scale: [0.9, 1] }, { type: 'spring', stiffness: 500, damping: 20 })
        if (contentEl) animate(contentEl, { opacity: [0, 1] }, { duration: 0.2, ease: 'easeOut' })
      },
      { defer: true },
    ),
  )

  return (
    <span
      ref={rootEl}
      role="status"
      aria-live="polite"
      class={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors',
        STATE_CLASSES[props.state],
        props.class,
      )}
    >
      <span ref={contentEl} class="inline-flex items-center gap-1.5">
        <Switch>
          <Match when={props.state === 'loading'}>
            <Loader2 class="h-3.5 w-3.5 animate-spin" />
          </Match>
          <Match when={props.state === 'success'}>
            <Check class="h-3.5 w-3.5" />
          </Match>
          <Match when={props.state === 'error'}>
            <X class="h-3.5 w-3.5" />
          </Match>
        </Switch>
        <span>{label()}</span>
      </span>
    </span>
  )
}
