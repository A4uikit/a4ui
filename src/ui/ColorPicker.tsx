// The hex text field keeps a local buffer so half-typed values (e.g. "#3b8")
// don't get pushed upstream; only a full valid 6-digit hex calls onChange.
// Swatches use inline `background` on purpose — they render arbitrary user
// colors, which is the one legitimate place to bypass the theme tokens.
import type { JSX } from 'solid-js'
import { createEffect, createSignal, For } from 'solid-js'

import { cn } from '../lib/cn'

const HEX_RE = /^#[0-9a-fA-F]{6}$/

const DEFAULT_SWATCHES = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
]

export interface ColorPickerProps {
  /** Current color as a `#rrggbb` hex string. */
  value: string
  /** Called with a valid `#rrggbb` hex whenever the user picks a new color. */
  onChange: (hex: string) => void
  /** Preset colors shown as clickable swatches. Defaults to a small palette. */
  swatches?: string[]
  class?: string
}

/**
 * Controlled color picker: a native color well, a hex text field, and a row of
 * preset swatches. The text field validates against `#rrggbb` and only reports
 * complete, valid hex values while letting you type freely in between.
 *
 * @example
 * ```tsx
 * const [color, setColor] = createSignal('#3b82f6')
 * <ColorPicker value={color()} onChange={setColor} />
 * ```
 */
export function ColorPicker(props: ColorPickerProps): JSX.Element {
  const [text, setText] = createSignal(props.value)

  // Keep the text buffer in sync when the value changes from outside.
  createEffect(() => setText(props.value))

  const swatches = () => props.swatches ?? DEFAULT_SWATCHES

  const onHexInput = (value: string): void => {
    setText(value)
    if (HEX_RE.test(value)) props.onChange(value)
  }

  return (
    <div class={cn('flex flex-wrap items-center gap-3', props.class)}>
      <input
        type="color"
        aria-label="Pick a color"
        class="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent"
        value={props.value}
        onInput={(ev) => props.onChange(ev.currentTarget.value)}
      />
      <input
        class="rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
        value={text()}
        onInput={(ev) => onHexInput(ev.currentTarget.value)}
      />
      <div class="flex w-full flex-wrap items-center gap-2">
        <For each={swatches()}>
          {(hex) => (
            <button
              type="button"
              aria-label={hex}
              style={{ background: hex }}
              class={cn(
                'h-6 w-6 rounded-md border border-border transition-transform active:scale-90 focus:outline-none focus:ring-2 focus:ring-ring',
                hex === props.value && 'ring-2 ring-ring ring-offset-1 ring-offset-background',
              )}
              onClick={() => props.onChange(hex)}
            />
          )}
        </For>
      </div>
    </div>
  )
}
