// Multi-select dropdown — searchable options with removable chips on the
// trigger. Popover mechanics (portaled, fixed-position, outside-click/Escape/
// scroll/resize close) are copied verbatim from DateField.tsx: no Kobalte
// primitive covers a chip-trigger multi-select, so this is hand-rolled in
// plain Solid + theme tokens.
import { Check, ChevronDown, X } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { For, Show, createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { Portal } from 'solid-js/web'

import { cn } from '../lib/cn'

/** One selectable option: a stable `value` and its display `label`. */
export interface MultiSelectOption {
  value: string
  label: string
}

export interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  /** Show a search box in the dropdown. Default `true`. */
  searchable?: boolean
  disabled?: boolean
  class?: string
}

/**
 * Multi-select dropdown: the trigger shows selected options as removable
 * chips, and the portaled popover lists (optionally search-filtered) options
 * to toggle. Picking an option keeps the popover open so several values can
 * be chosen in a row; the popover closes on outside click, Escape, scroll, or
 * resize.
 *
 * @example
 * ```tsx
 * const [tags, setTags] = createSignal<string[]>([])
 * <MultiSelect
 *   options={[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]}
 *   value={tags()}
 *   onChange={setTags}
 *   placeholder="Select tags…"
 * />
 * ```
 */
export function MultiSelect(props: MultiSelectProps): JSX.Element {
  const [open, setOpen] = createSignal(false)
  const [query, setQuery] = createSignal('')

  let rootRef: HTMLDivElement | undefined
  let btnRef: HTMLButtonElement | undefined
  let popRef: HTMLDivElement | undefined
  let searchRef: HTMLInputElement | undefined

  // Portaled popovers escape the trigger's stacking context (e.g. a glass
  // card's backdrop-filter), so they can't be `absolute`-positioned relative
  // to it — place them with `fixed` at the trigger's measured viewport rect,
  // same as DateField.
  const [pos, setPos] = createSignal({ top: 0, left: 0, width: 224 })
  const MIN_W = 224 // min-w-56

  const place = () => {
    if (!btnRef) return
    const r = btnRef.getBoundingClientRect()
    const width = Math.max(r.width, MIN_W)
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8))
    setPos({ top: r.bottom + 4, left, width })
  }

  const openPopover = () => {
    if (props.disabled) return
    place()
    setOpen(true)
    setQuery('')
  }

  const close = () => setOpen(false)

  const onDocPointer = (ev: MouseEvent) => {
    const t = ev.target as Node
    // Ignore clicks on the trigger (rootRef) AND the portaled popover (popRef).
    if (rootRef && !rootRef.contains(t) && popRef && !popRef.contains(t)) close()
  }
  const onKey = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') close()
  }

  // Wire/tear-down the global listeners strictly around the open state. Scroll/
  // resize close the popover (its fixed position would otherwise drift).
  const toggleListeners = (isOpen: boolean) => {
    if (isOpen) {
      document.addEventListener('mousedown', onDocPointer)
      document.addEventListener('keydown', onKey)
      window.addEventListener('scroll', close, true)
      window.addEventListener('resize', close)
    } else {
      document.removeEventListener('mousedown', onDocPointer)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }
  // Reactively attach when open flips; always clean up on unmount.
  createEffect(() => toggleListeners(open()))
  onCleanup(() => toggleListeners(false))

  // Autofocus the search box once the popover mounts.
  createEffect(() => {
    if (open() && (props.searchable ?? true)) {
      searchRef?.focus()
    }
  })

  const selectedOptions = createMemo(() => props.options.filter((o) => props.value.includes(o.value)))

  const filteredOptions = createMemo(() => {
    const q = query().trim().toLowerCase()
    if (!q) return props.options
    return props.options.filter((o) => o.label.toLowerCase().includes(q))
  })

  const toggleValue = (value: string) => {
    const next = props.value.includes(value)
      ? props.value.filter((v) => v !== value)
      : [...props.value, value]
    props.onChange(next)
  }

  const removeValue = (ev: MouseEvent, value: string) => {
    ev.stopPropagation()
    props.onChange(props.value.filter((v) => v !== value))
  }

  return (
    <div ref={rootRef} class={cn('relative', props.class)}>
      <button
        ref={btnRef}
        type="button"
        disabled={props.disabled}
        aria-haspopup="listbox"
        aria-expanded={open()}
        onClick={() => (open() ? close() : openPopover())}
        class="flex min-h-9 h-auto w-full flex-wrap items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-left text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span class="flex flex-1 flex-wrap items-center gap-1">
          <Show
            when={selectedOptions().length > 0}
            fallback={<span class="text-muted-foreground">{props.placeholder ?? 'Select…'}</span>}
          >
            <For each={selectedOptions()}>
              {(opt) => (
                <span class="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
                  {opt.label}
                  <button
                    type="button"
                    aria-label={`Remove ${opt.label}`}
                    onClick={(ev) => removeValue(ev, opt.value)}
                    class="rounded-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus:ring-2 focus:ring-ring/30"
                  >
                    <X class="h-3 w-3" />
                  </button>
                </span>
              )}
            </For>
          </Show>
        </span>
        <ChevronDown class="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      <Show when={open()}>
        <Portal>
          <div
            ref={popRef}
            style={{
              position: 'fixed',
              top: `${pos().top}px`,
              left: `${pos().left}px`,
              width: `${pos().width}px`,
            }}
            class="z-50 min-w-56 rounded-lg border border-border bg-card p-1 text-card-foreground shadow-lg"
          >
            <Show when={props.searchable ?? true}>
              <input
                ref={searchRef}
                type="text"
                value={query()}
                onInput={(ev) => setQuery(ev.currentTarget.value)}
                placeholder="Search…"
                class="mb-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </Show>
            <ul role="listbox" aria-multiselectable="true" class="max-h-60 overflow-y-auto">
              <For
                each={filteredOptions()}
                fallback={<li class="px-2 py-1.5 text-sm text-muted-foreground">No options</li>}
              >
                {(opt) => {
                  const isSelected = () => props.value.includes(opt.value)
                  return (
                    <li role="none">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected()}
                        aria-pressed={isSelected()}
                        onClick={() => toggleValue(opt.value)}
                        class={cn(
                          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-muted focus:bg-muted',
                          isSelected() && 'bg-primary/10',
                        )}
                      >
                        <span
                          class={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-input',
                            isSelected() && 'border-primary bg-primary text-primary-foreground',
                          )}
                        >
                          <Show when={isSelected()}>
                            <Check class="h-3 w-3" />
                          </Show>
                        </span>
                        <span class="truncate">{opt.label}</span>
                      </button>
                    </li>
                  )
                }}
              </For>
            </ul>
          </div>
        </Portal>
      </Show>
    </div>
  )
}
