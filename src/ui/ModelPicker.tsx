// AI model picker — dropdown trigger (icon + name + chevron) over a menu of
// models (icon + name + description + badge), selected one checkmarked.
// Built on Kobalte's DropdownMenu (same primitive as Dropdown.tsx), using its
// RadioGroup/RadioItem for single-select keyboard navigation and a11y
// (role="menuitemradio", aria-checked) — Dropdown.tsx's own item API only
// supports a plain string label, not this richer per-option content.
import { DropdownMenu } from '@kobalte/core/dropdown-menu'
import { Check, ChevronDown } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { For, Show, createSignal, untrack } from 'solid-js'

import { cn } from '../lib/cn'

/** A single selectable model in a {@link ModelPicker} menu. */
export interface ModelOption {
  id: string
  name: string
  icon?: JSX.Element
  description?: string
  badge?: JSX.Element
}

export interface ModelPickerProps {
  models: ModelOption[]
  /** Controlled selected model id. Omit and use `defaultValue` for uncontrolled use. */
  value?: string
  /** Initial selected model id when uncontrolled. Ignored if `value` is passed. */
  defaultValue?: string
  onChange?: (id: string) => void
  class?: string
}

/**
 * Dropdown trigger showing the selected model's icon + name + a chevron; the
 * menu lists every model with icon, name, description, and optional badge,
 * checkmarking the current selection. Controlled via `value`/`onChange` or
 * uncontrolled via `defaultValue`, and fully keyboard-navigable (arrow keys,
 * typeahead, Escape) via Kobalte's `DropdownMenu`.
 *
 * @example
 * ```tsx
 * <ModelPicker
 *   models={[
 *     { id: 'sonnet', name: 'Claude Sonnet', description: 'Balanced speed and quality' },
 *     { id: 'opus', name: 'Claude Opus', description: 'Most capable', badge: <Badge tone="info">New</Badge> },
 *   ]}
 *   defaultValue="sonnet"
 *   onChange={(id) => console.log('selected', id)}
 * />
 * ```
 */
export function ModelPicker(props: ModelPickerProps): JSX.Element {
  // Initial value only: read once (untracked), by design — this seeds the
  // uncontrolled fallback and must not re-run when `models`/`defaultValue` change later.
  const [internal, setInternal] = createSignal(untrack(() => props.defaultValue ?? props.models[0]?.id))
  const selectedId = () => props.value ?? internal()
  const selectedModel = () => props.models.find((m) => m.id === selectedId())

  const handleChange = (id: string) => {
    if (props.value === undefined) setInternal(id)
    props.onChange?.(id)
  }

  return (
    <DropdownMenu preventScroll={false}>
      <DropdownMenu.Trigger
        class={cn(
          'inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors a4-field',
          props.class,
        )}
        aria-label="Select model"
      >
        <Show when={selectedModel()?.icon}>
          <span class="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground">
            {selectedModel()?.icon}
          </span>
        </Show>
        <span class="truncate font-medium">{selectedModel()?.name}</span>
        <ChevronDown class="h-4 w-4 shrink-0 text-muted-foreground" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content class="z-50 min-w-64 overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-sm">
          <DropdownMenu.RadioGroup value={selectedId()} onChange={handleChange}>
            <For each={props.models}>
              {(model) => (
                <DropdownMenu.RadioItem
                  value={model.id}
                  class="flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 outline-none hover:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <Show when={model.icon}>
                    <span class="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground">
                      {model.icon}
                    </span>
                  </Show>
                  <span class="flex min-w-0 flex-1 flex-col">
                    <DropdownMenu.ItemLabel class="truncate text-sm text-foreground">
                      {model.name}
                    </DropdownMenu.ItemLabel>
                    <Show when={model.description}>
                      <DropdownMenu.ItemDescription class="truncate text-xs text-muted-foreground">
                        {model.description}
                      </DropdownMenu.ItemDescription>
                    </Show>
                  </span>
                  <Show when={model.badge}>{model.badge}</Show>
                  <span class="flex h-4 w-4 shrink-0 items-center justify-center text-primary">
                    <Show when={model.id === selectedId()}>
                      <Check class="h-4 w-4" />
                    </Show>
                  </span>
                </DropdownMenu.RadioItem>
              )}
            </For>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  )
}
