// Segmented button row on Kobalte's ToggleGroup primitive, with a hand-rolled
// sliding thumb behind the pressed item (rather than a per-button background)
// so the selection appears to slide between segments; honors motionReduced()
// (see lib/motion.ts) for an instant jump instead of a slide.
import { ToggleGroup as KToggleGroup } from '@kobalte/core/toggle-group'
import type { JSX } from 'solid-js'
import { For, createEffect, createSignal, onCleanup, onMount } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

/** One option in a {@link ToggleGroup}: its `value` and visible `label`. */
export interface ToggleGroupOption {
  value: string
  label: string
}

interface ToggleGroupProps {
  /** Currently selected option's `value`, or `null` if none is selected. Controlled — pair with `onChange`. */
  value: string | null
  onChange: (value: string | null) => void
  /** Options to render, in order, as segmented buttons. */
  options: ToggleGroupOption[]
  class?: string
}

/**
 * Single-select segmented button row, built on Kobalte's ToggleGroup
 * primitive — for exclusive-choice controls like view mode or alignment.
 *
 * @example
 * ```tsx
 * const [align, setAlign] = createSignal<string | null>('left')
 * <ToggleGroup
 *   value={align()}
 *   onChange={setAlign}
 *   options={[
 *     { value: 'left', label: 'Left' },
 *     { value: 'center', label: 'Center' },
 *   ]}
 * />
 * ```
 */
export function ToggleGroup(props: ToggleGroupProps): JSX.Element {
  let containerEl!: HTMLDivElement
  const itemEls = new Map<string, HTMLElement>()
  const [thumb, setThumb] = createSignal<{ left: number; width: number } | null>(null)
  let hasPositionedOnce = false
  const [thumbSettled, setThumbSettled] = createSignal(false)

  function measure(): void {
    const value = props.value
    const el = value === null ? undefined : itemEls.get(value)
    if (!el) {
      setThumb(null)
      return
    }
    setThumb({ left: el.offsetLeft, width: el.offsetWidth })
  }

  createEffect(() => {
    // Track both the selected value and the option list so the thumb
    // recomputes if either changes.
    void props.value
    void props.options
    measure()
    if (!hasPositionedOnce) {
      hasPositionedOnce = true
      // Defer enabling the transition to the next frame so the thumb's
      // first placement doesn't animate in from left:0/width:0.
      requestAnimationFrame(() => setThumbSettled(true))
    }
  })

  onMount(() => {
    const observer = new ResizeObserver(() => measure())
    observer.observe(containerEl)
    onCleanup(() => observer.disconnect())
  })

  return (
    <KToggleGroup
      ref={containerEl}
      value={props.value}
      onChange={props.onChange}
      class={cn('relative inline-flex gap-1 rounded-md border border-border bg-card p-1', props.class)}
    >
      <span
        aria-hidden="true"
        class="absolute inset-y-1 rounded-sm bg-primary shadow-sm transition-[left,width] duration-200 ease-out"
        style={{
          left: `${thumb()?.left ?? 0}px`,
          width: `${thumb()?.width ?? 0}px`,
          opacity: thumb() ? '1' : '0',
          transition: thumbSettled() && !motionReduced() ? undefined : 'none',
        }}
      />
      <For each={props.options}>
        {(option) => (
          <KToggleGroup.Item
            ref={(el) => itemEls.set(option.value, el)}
            value={option.value}
            class="relative z-10 rounded-sm px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[pressed]:text-primary-foreground"
          >
            {option.label}
          </KToggleGroup.Item>
        )}
      </For>
    </KToggleGroup>
  )
}
