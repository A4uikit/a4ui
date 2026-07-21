import type { JSX } from 'solid-js'
import { createEffect, createSignal, For, splitProps } from 'solid-js'

import { cn } from '../lib/cn'

const BOX_BASE =
  'h-11 w-10 rounded-md border border-border bg-card text-center text-lg font-medium text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50'

export interface OtpInputProps {
  /** Number of single-character boxes. @default 6 */
  length?: number
  /** Controlled value; when provided, the group renders it and the parent owns state. */
  value?: string
  /** Called with the full joined value on every box change (both typing and deletion). */
  onInput?: (value: string) => void
  /** Called once with the full value when every box is filled. */
  onComplete?: (value: string) => void
  /** Restrict input to digits and switch the mobile keyboard to numeric. */
  numeric?: boolean
  class?: string
  'aria-label'?: string
}

/**
 * Segmented one-time-passcode input: one `<input maxlength=1>` per character.
 * Typing advances focus to the next box, Backspace on an empty box moves back
 * and clears the previous one, arrow keys move focus, and pasting a string
 * distributes its characters across boxes starting at the focused index.
 * Works controlled (pass `value`) or uncontrolled.
 *
 * @example
 * ```tsx
 * const [code, setCode] = createSignal('')
 * <OtpInput length={6} value={code()} onInput={setCode} numeric onComplete={verify} />
 * ```
 */
export function OtpInput(props: OtpInputProps): JSX.Element {
  const [local] = splitProps(props, [
    'length',
    'value',
    'onInput',
    'onComplete',
    'numeric',
    'class',
    'aria-label',
  ])
  const length = () => local.length ?? 6

  const toChars = (v: string) => {
    const chars = v.slice(0, length()).split('')
    return Array.from({ length: length() }, (_, i) => chars[i] ?? '')
  }

  const [chars, setChars] = createSignal<string[]>(toChars(local.value ?? ''))
  const inputs: (HTMLInputElement | undefined)[] = []

  createEffect(() => {
    if (local.value !== undefined) setChars(toChars(local.value))
  })

  const emit = (next: string[]) => {
    setChars(next)
    const joined = next.join('')
    local.onInput?.(joined)
    if (next.every((c) => c !== '')) local.onComplete?.(joined)
  }

  const isValidChar = (c: string) => (local.numeric ? /^[0-9]$/.test(c) : c.length === 1)

  const handleInput = (index: number, raw: string) => {
    // Take the last typed character in case the box already held one.
    const typed = raw.slice(-1)
    if (typed === '') {
      const next = [...chars()]
      next[index] = ''
      emit(next)
      return
    }
    if (!isValidChar(typed)) {
      // Revert the DOM to the last known-good value for this box.
      const el = inputs[index]
      if (el) el.value = chars()[index] ?? ''
      return
    }
    const next = [...chars()]
    next[index] = typed
    emit(next)
    if (index < length() - 1) inputs[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, ev: KeyboardEvent) => {
    if (ev.key === 'Backspace') {
      if (chars()[index] === '' && index > 0) {
        ev.preventDefault()
        const next = [...chars()]
        next[index - 1] = ''
        emit(next)
        inputs[index - 1]?.focus()
      }
      return
    }
    if (ev.key === 'ArrowLeft' && index > 0) {
      ev.preventDefault()
      inputs[index - 1]?.focus()
      return
    }
    if (ev.key === 'ArrowRight' && index < length() - 1) {
      ev.preventDefault()
      inputs[index + 1]?.focus()
    }
  }

  const handlePaste = (index: number, ev: ClipboardEvent) => {
    ev.preventDefault()
    const pasted = ev.clipboardData?.getData('text') ?? ''
    const valid = pasted.split('').filter(isValidChar)
    if (valid.length === 0) return
    const next = [...chars()]
    let last = index
    for (let i = 0; i < valid.length && index + i < length(); i++) {
      next[index + i] = valid[i]
      last = index + i
    }
    emit(next)
    inputs[Math.min(last + 1, length() - 1)]?.focus()
  }

  return (
    <div
      role="group"
      aria-label={local['aria-label'] ?? 'One-time passcode'}
      class={cn('flex gap-2', local.class)}
    >
      <For each={chars()}>
        {(char, index) => (
          <input
            ref={(el) => (inputs[index()] = el)}
            class={BOX_BASE}
            type="text"
            inputMode={local.numeric ? 'numeric' : 'text'}
            maxlength={1}
            autocomplete="one-time-code"
            value={char}
            onInput={(ev) => handleInput(index(), ev.currentTarget.value)}
            onKeyDown={(ev) => handleKeyDown(index(), ev)}
            onPaste={(ev) => handlePaste(index(), ev)}
            aria-label={`Digit ${index() + 1} of ${length()}`}
          />
        )}
      </For>
    </div>
  )
}
