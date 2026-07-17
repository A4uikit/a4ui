// Accessible dropdown menu on Kobalte's DropdownMenu primitive.
import { DropdownMenu } from '@kobalte/core/dropdown-menu'
import type { JSX, ParentProps } from 'solid-js'
import { For } from 'solid-js'

import { cn } from '../lib/cn'

/** A single selectable row in a {@link Dropdown} menu. */
export interface DropdownItem {
  label: string
  onSelect: () => void
  /** Styles the label in the destructive color (e.g. "Delete"). */
  destructive?: boolean
  disabled?: boolean
}

interface DropdownProps extends ParentProps {
  items: DropdownItem[]
  class?: string
  /** Accessible name for the trigger. Pass this instead of nesting a `<button>`
      inside — the Trigger IS the button, so its children must be non-interactive. */
  label?: string
}

/**
 * Accessible dropdown/context menu on Kobalte's `DropdownMenu` primitive.
 * `props.children` is the trigger's (non-interactive) content — the Trigger
 * itself renders as the button, so don't nest another `<button>` inside it.
 * Unlike a Dialog, it does not lock page scroll while open.
 *
 * @example
 * ```tsx
 * <Dropdown label="Row actions" items={[
 *   { label: 'Edit', onSelect: () => edit(row) },
 *   { label: 'Delete', destructive: true, onSelect: () => remove(row) },
 * ]}>
 *   <MoreVertical class="h-4 w-4" />
 * </Dropdown>
 * ```
 */
export function Dropdown(props: DropdownProps): JSX.Element {
  return (
    // preventScroll defaults to true in Kobalte's menu — that locks page scroll
    // (body overflow:hidden + scrollbar-width compensation) while the menu is
    // open, which is wrong for a small contextual menu (it closes on scroll
    // anyway). Dialogs (Modal/Drawer) keep the lock; a dropdown shouldn't.
    <DropdownMenu preventScroll={false}>
      <DropdownMenu.Trigger class={cn('inline-flex', props.class)} aria-label={props.label}>
        {props.children}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content class="z-50 min-w-[10rem] overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-sm">
          <For each={props.items}>
            {(item) => (
              <DropdownMenu.Item
                class={cn(
                  'cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                  item.destructive && 'text-destructive',
                )}
                disabled={item.disabled}
                onSelect={item.onSelect}
              >
                {item.label}
              </DropdownMenu.Item>
            )}
          </For>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  )
}
