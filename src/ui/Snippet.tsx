// Single inline code block with a copy button, for a one-liner or short
// excerpt embedded in prose. Lighter than CodeTabs (which is a card with tabs
// for several samples) — Snippet is just one block, no chrome besides the
// copy affordance and an optional language tag.
import { Check, Copy } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createSignal, Show } from 'solid-js'

import { cn } from '../lib/cn'

const COPIED_TIMEOUT_MS = 1500

export interface SnippetProps {
  /** Source text to display and copy. */
  code: string
  /** Optional language tag shown as a small badge, e.g. `'tsx'`. Informational only, no highlighting. */
  language?: string
  class?: string
}

/**
 * Single inline code block (mono, bordered, scrollable) with a copy button
 * that morphs into a checkmark for 1.5s after copying. For one code sample —
 * use {@link CodeTabs} instead when you need several tabs/languages.
 *
 * @example
 * ```tsx
 * <Snippet language="bash" code="pnpm add @a4ui/core" />
 * ```
 */
export function Snippet(props: SnippetProps): JSX.Element {
  const [copied, setCopied] = createSignal(false)

  const copy = () => {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(props.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), COPIED_TIMEOUT_MS)
    })
  }

  return (
    <div class={cn('relative rounded-lg border border-border bg-muted px-3 py-2', props.class)}>
      <Show when={props.language}>
        <span class="absolute right-9 top-2 rounded bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {props.language}
        </span>
      </Show>
      <button
        type="button"
        aria-label={copied() ? 'Copied' : 'Copy to clipboard'}
        class="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
        onClick={copy}
      >
        <Show when={copied()} fallback={<Copy class="h-3.5 w-3.5" />}>
          <Check class="h-3.5 w-3.5" />
        </Show>
      </button>
      <pre class="overflow-x-auto whitespace-pre pr-8 font-mono text-sm text-foreground">
        <code>{props.code}</code>
      </pre>
    </div>
  )
}
