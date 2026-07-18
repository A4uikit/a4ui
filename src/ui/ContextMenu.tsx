// Right-click menu on Kobalte's ContextMenu primitive. `children` is the target.
import { ContextMenu as KContextMenu } from '@kobalte/core/context-menu'
import type { JSX, ParentProps } from 'solid-js'
import { For } from 'solid-js'

import { cn } from '../lib/cn'

/** A single actionable row rendered by {@link ContextMenu}. */
export interface ContextMenuItem {
  label: string
  /** Called when the item is chosen (click or keyboard activation). */
  onSelect: () => void
  /** Styles the label as a destructive action (e.g. "Delete"). */
  destructive?: boolean
  disabled?: boolean
}

interface ContextMenuProps extends ParentProps {
  items: ContextMenuItem[]
  class?: string
}

/**
 * Right-click (or long-press) menu built on Kobalte's `ContextMenu`
 * primitive. `children` is the element that acts as the trigger/target area.
 *
 * @example
 * ```tsx
 * <ContextMenu items={[{ label: 'Rename', onSelect: rename }, { label: 'Delete', onSelect: remove, destructive: true }]}>
 *   <div class="rounded border p-4">Right-click me</div>
 * </ContextMenu>
 * ```
 */
export function ContextMenu(props: ContextMenuProps): JSX.Element {
  return (
    <KContextMenu>
      <KContextMenu.Trigger class={cn('inline-flex', props.class)}>{props.children}</KContextMenu.Trigger>
      <KContextMenu.Portal>
        <KContextMenu.Content class="z-50 min-w-[10rem] overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-sm">
          <For each={props.items}>
            {(item) => (
              <KContextMenu.Item
                class={cn(
                  'cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                  item.destructive && 'text-destructive',
                )}
                disabled={item.disabled}
                onSelect={item.onSelect}
              >
                {item.label}
              </KContextMenu.Item>
            )}
          </For>
        </KContextMenu.Content>
      </KContextMenu.Portal>
    </KContextMenu>
  )
}
