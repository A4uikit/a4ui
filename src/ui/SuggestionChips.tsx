// Wrapping row of dismissible/selectable pill chips (e.g. AI follow-up
// suggestions). Plain buttons in a flex-wrap row — no Kobalte primitive
// covers this shape, so it's hand-rolled like AnnouncementBar's tag chips.
import { X } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { cn } from '../lib/cn'

export interface SuggestionChipsProps {
  suggestions: string[]
  onSelect?: (s: string) => void
  onDismiss?: (s: string) => void
  class?: string
}

/**
 * Wrapping row of pill chips, e.g. AI-suggested follow-up prompts. Clicking a
 * chip calls `onSelect`; if `onDismiss` is passed, each chip also shows a
 * small "x" that removes it without triggering `onSelect`. The select and
 * dismiss controls are real sibling `<button>`s (not nested — a `<button>`
 * can't validly contain another interactive element), so both are reachable
 * and operable independently via Tab/Enter/Space with no extra ARIA wiring.
 *
 * @example
 * ```tsx
 * <SuggestionChips
 *   suggestions={['Summarize this', 'Explain like I\'m 5', 'Write tests']}
 *   onSelect={(s) => sendMessage(s)}
 *   onDismiss={(s) => setSuggestions((prev) => prev.filter((x) => x !== s))}
 * />
 * ```
 */
export function SuggestionChips(props: SuggestionChipsProps): JSX.Element {
  return (
    <div class={cn('flex flex-wrap gap-2', props.class)}>
      <For each={props.suggestions}>
        {(suggestion) => (
          <span class="inline-flex items-center gap-1 rounded-full border border-border pl-3 pr-1.5 py-1.5 text-sm text-foreground transition-colors hover:bg-muted">
            <button
              type="button"
              onClick={() => props.onSelect?.(suggestion)}
              class="outline-none focus-visible:ring-2 focus-visible:ring-ring/30 rounded-sm"
            >
              {suggestion}
            </button>
            <Show when={props.onDismiss}>
              <button
                type="button"
                aria-label={`Dismiss "${suggestion}"`}
                onClick={(ev) => {
                  ev.stopPropagation()
                  props.onDismiss?.(suggestion)
                }}
                class="rounded-full p-0.5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <X class="h-3 w-3" />
              </button>
            </Show>
          </span>
        )}
      </For>
    </div>
  )
}
