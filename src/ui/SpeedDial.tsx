// Floating action button that fans a stack of actions upward when open.
import { Plus } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createSignal, For, Show } from 'solid-js'

import { cn } from '../lib/cn'

/** A single action in a {@link SpeedDial} — an icon button with an accessible label. */
export interface SpeedDialAction {
  icon: JSX.Element
  label: string
  onClick: () => void
}

export interface SpeedDialProps {
  actions: SpeedDialAction[]
  /** Icon for the main FAB. Defaults to a `Plus` that rotates to an ✕ when open. */
  icon?: JSX.Element
  class?: string
}

/**
 * A fixed floating action button (FAB) pinned to the bottom-right. Clicking the
 * main circular button toggles an open state; while open, `actions` fan out
 * upward as a vertical stack of smaller circular buttons. Selecting an action
 * runs its `onClick` and closes the dial. Theme-agnostic — colors come from
 * semantic tokens only.
 *
 * @example
 * ```tsx
 * <SpeedDial actions={[
 *   { icon: <Share class="h-5 w-5" />, label: 'Share', onClick: () => share() },
 *   { icon: <Copy class="h-5 w-5" />, label: 'Copy', onClick: () => copy() },
 * ]} />
 * ```
 */
export function SpeedDial(props: SpeedDialProps): JSX.Element {
  const [open, setOpen] = createSignal(false)

  return (
    <div class={cn('fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3', props.class)}>
      <Show when={open()}>
        <div class="flex flex-col items-center gap-3">
          <For each={props.actions}>
            {(action) => (
              <button
                type="button"
                aria-label={action.label}
                title={action.label}
                onClick={() => {
                  action.onClick()
                  setOpen(false)
                }}
                class="flex h-11 w-11 translate-y-0 items-center justify-center rounded-full border border-border bg-card text-foreground opacity-100 shadow transition-[opacity,transform] duration-150 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {action.icon}
              </button>
            )}
          </For>
        </div>
      </Show>
      <button
        type="button"
        aria-label={open() ? 'Close actions' : 'Open actions'}
        aria-expanded={open()}
        onClick={() => setOpen((v) => !v)}
        class="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-150 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <span class={cn('inline-flex transition-transform duration-150', open() && 'rotate-45')}>
          {props.icon ?? <Plus class="h-6 w-6" />}
        </span>
      </button>
    </div>
  )
}
