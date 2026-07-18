// Empty-state placeholder: a centered vertical stack for "nothing here yet"
// surfaces (empty lists, no search results, first-run views). The icon sits in a
// muted circle; everything uses semantic tokens so it stays theme-agnostic in
// both dark and light themes.
import { Inbox } from 'lucide-solid'
import { Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

export interface EmptyProps {
  /** Bold headline describing the empty state. */
  title: string
  /** Optional supporting line under the title. */
  description?: string
  /** Optional custom icon; falls back to a lucide-solid `Inbox`. */
  icon?: JSX.Element
  /** Optional action slot (e.g. a Button) rendered below the text. */
  action?: JSX.Element
  class?: string
}

/**
 * Empty-state placeholder — a centered icon, title, optional description, and an
 * optional action slot — for lists, search results, or first-run views that have
 * nothing to show yet. Falls back to an `Inbox` icon when none is provided.
 *
 * @example
 * ```tsx
 * <Empty
 *   title="No projects yet"
 *   description="Create your first project to get started."
 *   action={<Button>New project</Button>}
 * />
 * ```
 */
export function Empty(props: EmptyProps): JSX.Element {
  return (
    <div class={cn('flex flex-col items-center py-12 text-center', props.class)}>
      <div class="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Show when={props.icon} fallback={<Inbox class="h-6 w-6" />}>
          {props.icon}
        </Show>
      </div>
      <p class="mt-4 font-semibold text-foreground">{props.title}</p>
      <Show when={props.description}>
        <p class="mt-1 max-w-sm text-sm text-muted-foreground">{props.description}</p>
      </Show>
      <Show when={props.action}>
        <div class="mt-4">{props.action}</div>
      </Show>
    </div>
  )
}
