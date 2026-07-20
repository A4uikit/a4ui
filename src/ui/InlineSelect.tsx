// InlineSelect — click-to-edit select. Shows the current value as plain text
// until clicked, then swaps to a `Select` for picking a new value; committing
// (or blurring/Escape) returns it to text. For status/priority-style editing
// inline in rows/tables.
import type { JSX } from 'solid-js'
import { createEffect, createSignal, For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Select } from './Select'

export interface InlineSelectOption {
  value: string
  label: string
}

export interface InlineSelectProps {
  value: string
  options: InlineSelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  class?: string
}

/**
 * Edit-in-place select: renders the current value as a clickable chip until
 * clicked, then swaps to a `Select` for picking a new value. Committing a
 * choice returns it to text; blurring away or pressing Escape cancels back
 * to the previous value. Built for status/priority-style editing inline in
 * rows/tables.
 *
 * @example
 * ```tsx
 * <InlineSelect
 *   value={status()}
 *   options={[
 *     { value: 'todo', label: 'To do' },
 *     { value: 'doing', label: 'In progress' },
 *     { value: 'done', label: 'Done' },
 *   ]}
 *   onChange={setStatus}
 * />
 * ```
 */
export function InlineSelect(props: InlineSelectProps): JSX.Element {
  const [editing, setEditing] = createSignal(false)
  let wrapperEl: HTMLDivElement | undefined

  const selectedLabel = () =>
    props.options.find((option) => option.value === props.value)?.label ?? props.placeholder ?? ''

  const cancel = () => setEditing(false)

  const commit = (value: string) => {
    props.onChange(value)
    setEditing(false)
  }

  // Focus the <select> as soon as it mounts, so a click straight into edit
  // mode is immediately usable from the keyboard (and blur-to-cancel below
  // has something to blur from).
  createEffect(() => {
    if (editing()) wrapperEl?.querySelector('select')?.focus()
  })

  return (
    <div
      ref={wrapperEl}
      class={cn('inline-flex', props.class)}
      onFocusOut={() => {
        // Defer: swapping the trigger button for the <select> fires a transient
        // focusout (relatedTarget is momentarily null) before the effect below
        // moves focus onto the <select>. Re-check on the next tick so we only
        // cancel when focus has genuinely left the wrapper.
        setTimeout(() => {
          if (wrapperEl && !wrapperEl.contains(document.activeElement)) cancel()
        }, 0)
      }}
      onKeyDown={(ev) => {
        if (ev.key === 'Escape') cancel()
      }}
    >
      <Show
        when={editing()}
        fallback={
          <button
            type="button"
            class="rounded px-1.5 py-0.5 text-left hover:bg-muted"
            aria-label={`Edit — ${selectedLabel()}`}
            onClick={() => setEditing(true)}
          >
            {selectedLabel()}
          </button>
        }
      >
        <Select value={props.value} onChange={commit}>
          <For each={props.options}>{(option) => <option value={option.value}>{option.label}</option>}</For>
        </Select>
      </Show>
    </div>
  )
}
