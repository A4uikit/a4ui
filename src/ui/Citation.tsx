// Citation — inline source-reference chip for AI answers that cite sources,
// plus a compact SourceList for the "Sources" block below the answer.
import { For, type JSX, Show } from 'solid-js'

import { cn } from '../lib/cn'

const CITATION_BASE =
  'citation inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground ' +
  'text-[0.65rem] leading-none align-super h-[1.1em] min-w-[1.1em] px-1 font-semibold'

export interface CitationProps {
  /** The source number shown in the chip, e.g. `1`. */
  index: number
  /** Links out to the source when present (opens in a new tab). */
  href?: string
  /** Shown as a native tooltip and used as the accessible name. */
  title?: string
  class?: string
}

/**
 * Small inline chip citing a numbered source, meant to sit inside a sentence
 * right after the claim it backs up.
 *
 * @example
 * ```tsx
 * <p>
 *   Glass surfaces use a translucent backdrop blur
 *   <Citation index={1} href="https://example.com/spec" title="Design spec" />.
 * </p>
 * ```
 */
export function Citation(props: CitationProps): JSX.Element {
  return (
    <Show
      when={props.href}
      fallback={
        <span class={cn(CITATION_BASE, props.class)} title={props.title}>
          {props.index}
        </span>
      }
    >
      <a
        href={props.href}
        target="_blank"
        rel="noreferrer"
        title={props.title}
        aria-label={props.title ?? `Source ${props.index}`}
        class={cn(CITATION_BASE, 'hover:bg-primary/15 hover:text-foreground', props.class)}
      >
        {props.index}
      </a>
    </Show>
  )
}

export interface SourceListProps {
  sources: { title: string; href?: string }[]
  class?: string
}

/**
 * Compact numbered "Sources" block matching the indices used by {@link Citation}.
 *
 * @example
 * ```tsx
 * <SourceList
 *   sources={[
 *     { title: 'Design spec', href: 'https://example.com/spec' },
 *     { title: 'Internal style guide' },
 *   ]}
 * />
 * ```
 */
export function SourceList(props: SourceListProps): JSX.Element {
  return (
    <ol class={cn('flex flex-col gap-1 text-sm text-muted-foreground', props.class)}>
      <For each={props.sources}>
        {(source, index) => (
          <li class="flex gap-2">
            <span class="text-muted-foreground/70">{index() + 1}.</span>
            <Show when={source.href} fallback={<span>{source.title}</span>}>
              <a
                href={source.href}
                target="_blank"
                rel="noreferrer"
                class="text-foreground underline decoration-border underline-offset-2 hover:text-primary"
              >
                {source.title}
              </a>
            </Show>
          </li>
        )}
      </For>
    </ol>
  )
}
