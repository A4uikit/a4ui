// Multi-line text field with @mention autocomplete over a native <textarea>.
import type { JSX } from 'solid-js'
import { For, Show, createSignal } from 'solid-js'

import { cn } from '../lib/cn'

export interface MentionOption {
  value: string
  label: string
}

export interface MentionsProps {
  value: string
  /** Called with the new string value on every input (not the raw DOM event). */
  onChange: (value: string) => void
  /** Options offered while typing an `@mention`. */
  options: MentionOption[]
  placeholder?: string
  class?: string
}

const TEXTAREA_BASE =
  'w-full min-h-[80px] resize-y rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50'

/** Match an active `@query` immediately before the caret. */
const MENTION_RE = /@(\w*)$/

/**
 * Controlled multi-line text field that shows an autocomplete dropdown while
 * the user types an `@mention`. On each input, the text before the caret is
 * checked for a trailing `@query`; matching {@link MentionOption}s (by `label`
 * or `value`, case-insensitive) are offered in a panel. Selecting one replaces
 * the `@query` with `@{label} `. Arrow keys move the highlight, Enter accepts,
 * Escape dismisses.
 *
 * @example
 * ```tsx
 * const [body, setBody] = createSignal('')
 * <Mentions
 *   value={body()}
 *   onChange={setBody}
 *   options={[
 *     { value: 'ada', label: 'Ada Lovelace' },
 *     { value: 'alan', label: 'Alan Turing' },
 *   ]}
 *   placeholder="Write a note, use @ to mention someone"
 * />
 * ```
 */
export function Mentions(props: MentionsProps): JSX.Element {
  let ref: HTMLTextAreaElement | undefined
  const [open, setOpen] = createSignal(false)
  const [query, setQuery] = createSignal('')
  const [caret, setCaret] = createSignal(0)
  const [highlighted, setHighlighted] = createSignal(0)

  const filtered = (): MentionOption[] => {
    const q = query().toLowerCase()
    return props.options.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q))
  }

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  const sync = (el: HTMLTextAreaElement) => {
    const pos = el.selectionStart ?? el.value.length
    setCaret(pos)
    const before = el.value.slice(0, pos)
    const match = before.match(MENTION_RE)
    if (match) {
      setQuery(match[1])
      setOpen(true)
      setHighlighted(0)
    } else {
      close()
    }
  }

  const select = (option: MentionOption) => {
    const el = ref
    const full = props.value
    const pos = el ? (el.selectionStart ?? caret()) : caret()
    const before = full.slice(0, pos)
    const after = full.slice(pos)
    const start = before.lastIndexOf('@')
    if (start === -1) {
      close()
      return
    }
    const insert = `@${option.label} `
    const next = full.slice(0, start) + insert + after
    props.onChange(next)
    close()
    if (el) {
      const nextCaret = start + insert.length
      queueMicrotask(() => {
        el.focus()
        el.setSelectionRange(nextCaret, nextCaret)
        setCaret(nextCaret)
      })
    }
  }

  const onKeyDown = (ev: KeyboardEvent) => {
    if (!open()) return
    const items = filtered()
    if (items.length === 0) return
    switch (ev.key) {
      case 'ArrowDown':
        ev.preventDefault()
        setHighlighted((i) => (i + 1) % items.length)
        break
      case 'ArrowUp':
        ev.preventDefault()
        setHighlighted((i) => (i - 1 + items.length) % items.length)
        break
      case 'Enter':
        ev.preventDefault()
        select(items[Math.min(highlighted(), items.length - 1)])
        break
      case 'Escape':
        ev.preventDefault()
        close()
        break
    }
  }

  return (
    <div class={cn('relative', props.class)}>
      <textarea
        ref={ref}
        class={TEXTAREA_BASE}
        value={props.value}
        placeholder={props.placeholder}
        onInput={(ev) => {
          props.onChange(ev.currentTarget.value)
          sync(ev.currentTarget)
        }}
        onClick={(ev) => sync(ev.currentTarget)}
        onKeyUp={(ev) => sync(ev.currentTarget)}
        onKeyDown={onKeyDown}
        onBlur={() => close()}
      />
      <Show when={open() && filtered().length > 0}>
        <div class="absolute z-50 mt-1 max-h-48 w-56 overflow-y-auto rounded-md border border-border bg-card p-1 shadow-md">
          <For each={filtered()}>
            {(option, i) => (
              <button
                type="button"
                class={cn(
                  'w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted',
                  i() === highlighted() && 'bg-muted',
                )}
                onMouseDown={(ev) => {
                  ev.preventDefault()
                  select(option)
                }}
                onMouseEnter={() => setHighlighted(i())}
              >
                {option.label}
              </button>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
