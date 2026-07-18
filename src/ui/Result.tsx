// Full-status result screen: a centered vertical stack for terminal states like
// success confirmations, errors, or HTTP 404/500 pages. A large status icon (or
// the big HTTP number) sits in a tinted circle above the title/description; the
// fixed semantic status colors mirror Alert (emerald/amber/rose) while the rest
// stays theme-agnostic via semantic tokens.
import { CircleCheck, CircleX, Compass, Info, ServerCrash, TriangleAlert } from 'lucide-solid'
import type { Component, JSX } from 'solid-js'
import { Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { cn } from '../lib/cn'

/** Semantic status of a {@link Result}; drives the icon, tint, and optional HTTP number. */
export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | '404' | '500'

export interface ResultProps {
  /** Result status; drives the icon and color. Defaults to `'info'`. */
  status?: ResultStatus
  /** Bold headline describing the outcome. */
  title: string
  /** Optional supporting line under the title. */
  description?: string
  /** Optional action slot (e.g. Buttons) rendered below the text. */
  actions?: JSX.Element
  class?: string
}

const STATUS: Record<
  ResultStatus,
  { Icon: Component<{ class?: string }>; icon: string; tint: string; code?: string }
> = {
  success: { Icon: CircleCheck, icon: 'text-emerald-500', tint: 'bg-emerald-500/10' },
  error: { Icon: CircleX, icon: 'text-destructive', tint: 'bg-destructive/10' },
  warning: { Icon: TriangleAlert, icon: 'text-amber-500', tint: 'bg-amber-500/10' },
  info: { Icon: Info, icon: 'text-primary', tint: 'bg-primary/10' },
  '404': { Icon: Compass, icon: 'text-muted-foreground', tint: 'bg-muted', code: '404' },
  '500': { Icon: ServerCrash, icon: 'text-destructive', tint: 'bg-destructive/10', code: '500' },
}

/**
 * Full-status result screen — a large status icon in a tinted circle, a title,
 * optional description, and an optional actions slot — for terminal states such
 * as success/error confirmations or HTTP 404/500 pages. For `'404'`/`'500'` the
 * big HTTP number is shown above the icon.
 *
 * @example
 * ```tsx
 * <Result
 *   status="success"
 *   title="Payment complete"
 *   description="A receipt has been sent to your email."
 *   actions={<Button>Back to dashboard</Button>}
 * />
 * ```
 */
export function Result(props: ResultProps): JSX.Element {
  const status = () => STATUS[props.status ?? 'info']
  return (
    <div class={cn('flex flex-col items-center py-12 text-center', props.class)}>
      <Show when={status().code}>
        <p class="text-5xl font-bold text-muted-foreground">{status().code}</p>
      </Show>
      <div class={cn('grid h-16 w-16 place-items-center rounded-full', status().tint)}>
        <Dynamic component={status().Icon} class={cn('h-8 w-8', status().icon)} />
      </div>
      <p class="mt-4 text-xl font-bold text-foreground">{props.title}</p>
      <Show when={props.description}>
        <p class="mt-2 max-w-md text-muted-foreground">{props.description}</p>
      </Show>
      <Show when={props.actions}>
        <div class="mt-6">{props.actions}</div>
      </Show>
    </div>
  )
}
