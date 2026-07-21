// Prose-embed highlight block for docs/guidance content. Distinct from Alert
// (a dismissible notification banner): Callout sits inline in a body of text —
// left accent border, tinted background, comfortable padding — and is never
// dismissed. Tone tokens are shared with Alert so info/success/warning/danger
// read identically across both components.
import { CircleCheck, CircleX, Info, TriangleAlert } from 'lucide-solid'
import type { Component, JSX } from 'solid-js'
import { Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { cn } from '../lib/cn'

/** Semantic tone of a {@link Callout}; drives the accent border, tint, and default icon. */
export type CalloutTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral'

const TONE: Record<CalloutTone, { wrap: string; icon: string; Icon: Component<{ class?: string }> }> = {
  info: { wrap: 'border-sky-500 bg-sky-500/10', icon: 'text-sky-500', Icon: Info },
  success: { wrap: 'border-emerald-500 bg-emerald-500/10', icon: 'text-emerald-500', Icon: CircleCheck },
  warning: { wrap: 'border-amber-500 bg-amber-500/10', icon: 'text-amber-500', Icon: TriangleAlert },
  danger: { wrap: 'border-rose-500 bg-rose-500/10', icon: 'text-rose-500', Icon: CircleX },
  neutral: { wrap: 'border-border bg-muted', icon: 'text-muted-foreground', Icon: Info },
}

export interface CalloutProps {
  /** Visual/semantic tone. Defaults to `'info'`. */
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral'
  /** Optional bold heading shown above the body. */
  title?: JSX.Element
  /** Overrides the tone's default icon. */
  icon?: JSX.Element
  children: JSX.Element
  class?: string
}

/**
 * Inline highlighted block for embedding guidance/notes inside prose (docs,
 * READMEs, long-form content) — a left accent border, a faint tone-tinted
 * background, and an icon. Unlike {@link Alert} it isn't a dismissible
 * notification; it's part of the content flow.
 *
 * @example
 * ```tsx
 * <Callout tone="warning" title="Before you continue">
 *   This action can't be undone once the migration starts.
 * </Callout>
 * ```
 */
export function Callout(props: CalloutProps): JSX.Element {
  const tone = () => TONE[props.tone ?? 'info']
  return (
    <div class={cn('flex gap-3 rounded-lg border-l-4 p-4 text-sm text-foreground', tone().wrap, props.class)}>
      <Show
        when={props.icon}
        fallback={<Dynamic component={tone().Icon} class={cn('mt-0.5 h-4 w-4 shrink-0', tone().icon)} />}
      >
        {props.icon}
      </Show>
      <div class="flex-1">
        <Show when={props.title}>
          <p class="font-semibold">{props.title}</p>
        </Show>
        <div class="text-muted-foreground">{props.children}</div>
      </div>
    </div>
  )
}
