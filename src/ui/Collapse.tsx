// Single controlled collapsible region with a toggle header.
import { ChevronDown } from 'lucide-solid'
import type { JSX, ParentProps } from 'solid-js'
import { Show } from 'solid-js'
import { cn } from '../lib/cn'

interface CollapseProps extends ParentProps {
  /** Whether the panel is currently expanded. */
  open: boolean
  /** Called with the next open state when the header is toggled. */
  onOpenChange: (open: boolean) => void
  /** Text shown in the header button. */
  title: string
  class?: string
}

/**
 * A single controlled collapsible region: a header button that toggles a panel
 * of arbitrary children. State is owned by the caller via `open`/`onOpenChange`.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = createSignal(false)
 * <Collapse open={open()} onOpenChange={setOpen} title="Details">
 *   <p>Hidden content revealed on toggle.</p>
 * </Collapse>
 * ```
 */
export function Collapse(props: CollapseProps): JSX.Element {
  return (
    <div class={cn(props.class)}>
      <button
        type="button"
        aria-expanded={props.open}
        onClick={() => props.onOpenChange(!props.open)}
        class="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
      >
        {props.title}
        <ChevronDown
          class={cn('h-4 w-4 shrink-0 transition-transform duration-200', props.open && 'rotate-180')}
        />
      </button>
      <Show when={props.open}>
        <div class="px-3 py-2 text-sm text-muted-foreground">{props.children}</div>
      </Show>
    </div>
  )
}
