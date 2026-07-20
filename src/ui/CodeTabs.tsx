// Tabbed code blocks with a per-tab copy button, for embedding several code
// samples/languages (docs, marketing) in a single card. Plain monospace —
// no syntax highlighting.
import { Check, Copy } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createSignal, For, Show } from 'solid-js'

import { cn } from '../lib/cn'

/** A single tab's content: label, source code, and optional language tag. */
export interface CodeTab {
  label: string
  code: string
  /** Language tag, e.g. `'tsx'`. Not used for highlighting; informational only. */
  lang?: string
}

export interface CodeTabsProps {
  tabs: CodeTab[]
  class?: string
}

const COPIED_TIMEOUT_MS = 1500

/**
 * Card of tabbed code blocks with a copy button for the active tab, for
 * showing several code samples or language variants side by side.
 *
 * @example
 * ```tsx
 * <CodeTabs
 *   tabs={[
 *     { label: 'npm', code: 'npm install @a4ui/core' },
 *     { label: 'pnpm', code: 'pnpm add @a4ui/core' },
 *   ]}
 * />
 * ```
 */
export function CodeTabs(props: CodeTabsProps): JSX.Element {
  const [activeIndex, setActiveIndex] = createSignal(0)
  const [copied, setCopied] = createSignal(false)

  const active = () => props.tabs[activeIndex()]

  const copy = () => {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(active().code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), COPIED_TIMEOUT_MS)
    })
  }

  return (
    <div class={cn('overflow-hidden rounded-lg border border-border bg-card', props.class)}>
      <div class="flex items-center justify-between border-b border-border pr-2">
        <div class="flex" role="tablist">
          <For each={props.tabs}>
            {(tab, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeIndex() === index()}
                class={cn(
                  'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                  activeIndex() === index()
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
                onClick={() => setActiveIndex(index())}
              >
                {tab.label}
              </button>
            )}
          </For>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={copy}
        >
          <Show
            when={copied()}
            fallback={
              <>
                <Copy class="h-3.5 w-3.5" />
                Copy
              </>
            }
          >
            <Check class="h-3.5 w-3.5" />
            Copied
          </Show>
        </button>
      </div>
      <pre class="overflow-x-auto p-4 text-sm font-mono text-foreground">
        <code>{active().code}</code>
      </pre>
    </div>
  )
}
