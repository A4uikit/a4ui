// Highlight — renders text with every case-insensitive occurrence of a query
// wrapped in a <mark>. Design-system primitive: no business vocabulary, no
// hardcoded colors — the mark uses semantic tokens so it tracks the theme.
import { For, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

export interface HighlightProps {
  /** Full text to render. */
  text: string
  /** Substring to highlight; every case-insensitive occurrence is marked. */
  query: string
  class?: string
}

/** Escape regex metacharacters so an arbitrary query matches literally. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Highlights every case-insensitive occurrence of `query` within `text`.
 * When `query` is empty the text renders unchanged.
 *
 * @example
 * ```tsx
 * <Highlight text="Sonora Precision" query="prec" />
 * ```
 */
export function Highlight(props: HighlightProps): JSX.Element {
  const segments = (): { text: string; match: boolean }[] => {
    if (!props.query) return [{ text: props.text, match: false }]
    const re = new RegExp(`(${escapeRegExp(props.query)})`, 'gi')
    const q = props.query.toLowerCase()
    return props.text
      .split(re)
      .filter((part) => part !== '')
      .map((part) => ({ text: part, match: part.toLowerCase() === q }))
  }
  return (
    <span class={cn(props.class)}>
      <For each={segments()}>
        {(segment) =>
          segment.match ? (
            <mark class="rounded bg-primary/30 px-0.5 text-foreground">{segment.text}</mark>
          ) : (
            segment.text
          )
        }
      </For>
    </span>
  )
}
