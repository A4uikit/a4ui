import type { JSX } from 'solid-js'
import { createEffect, createSignal, splitProps } from 'solid-js'

import { cn } from '../lib/cn'

const INPUT_BASE =
  'w-full rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50'

export interface MaskedInputProps {
  /** `#` = digit slot, `A` = letter slot, any other char is a literal, e.g. `'(###) ###-####'`. */
  mask: string
  /** Controlled raw value (just the entered #/A characters, no literals). */
  value?: string
  /** Called with `(raw, formatted)` on every accepted keystroke or paste. */
  onInput?: (raw: string, formatted: string) => void
  placeholder?: string
  class?: string
  'aria-label'?: string
}

const matchesSlot = (mask: string, i: number, char: string): boolean => {
  const slot = mask[i]
  if (slot === '#') return /[0-9]/.test(char)
  if (slot === 'A') return /[a-zA-Z]/.test(char)
  return false
}

const isLiteral = (mask: string, i: number): boolean => mask[i] !== '#' && mask[i] !== 'A'

/** Build the formatted string for a mask given only the raw slot characters. */
const format = (mask: string, raw: string): string => {
  let out = ''
  let r = 0
  for (let i = 0; i < mask.length && r < raw.length; i++) {
    if (isLiteral(mask, i)) {
      out += mask[i]
      continue
    }
    out += raw[r]
    r++
  }
  return out
}

/** Extract the raw #/A characters a formatted string carries, validating each against its slot. */
const extractRaw = (mask: string, formatted: string): string => {
  let raw = ''
  let m = 0
  for (const char of formatted) {
    while (m < mask.length && isLiteral(mask, m)) m++
    if (m >= mask.length) break
    if (matchesSlot(mask, m, char)) {
      raw += char
      m++
    }
  }
  return raw
}

/**
 * Format-as-you-type input over a real `<input>`. `mask` uses `#` for a digit
 * slot and `A` for a letter slot; any other character is a literal inserted
 * automatically as the user reaches it. Characters that don't fit the next
 * slot are rejected, and pasted text is normalized by re-extracting only its
 * valid #/A characters. Controlled (`value`) or uncontrolled.
 *
 * @example
 * ```tsx
 * const [phone, setPhone] = createSignal('')
 * <MaskedInput mask="(###) ###-####" value={phone()} onInput={setPhone} placeholder="(555) 123-4567" />
 * ```
 */
export function MaskedInput(props: MaskedInputProps): JSX.Element {
  const [local] = splitProps(props, ['mask', 'value', 'onInput', 'placeholder', 'class', 'aria-label'])

  const maxRaw = () => local.mask.split('').filter((c) => c === '#' || c === 'A').length

  const [raw, setRaw] = createSignal(extractRaw(local.mask, local.value ?? '').slice(0, maxRaw()))

  createEffect(() => {
    if (local.value !== undefined) setRaw(extractRaw(local.mask, local.value).slice(0, maxRaw()))
  })

  const emit = (nextRaw: string) => {
    setRaw(nextRaw)
    local.onInput?.(nextRaw, format(local.mask, nextRaw))
  }

  const handleInput = (ev: InputEvent & { currentTarget: HTMLInputElement }) => {
    const typedFormatted = ev.currentTarget.value
    // Re-derive raw from the full field value so pasted or IME text is
    // normalized the same way as single keystrokes.
    const nextRaw = extractRaw(local.mask, typedFormatted).slice(0, maxRaw())
    emit(nextRaw)
  }

  return (
    <input
      class={cn(INPUT_BASE, local.class)}
      type="text"
      inputMode="text"
      placeholder={local.placeholder ?? local.mask}
      value={format(local.mask, raw())}
      onInput={handleInput}
      aria-label={local['aria-label']}
    />
  )
}
