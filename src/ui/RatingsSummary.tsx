// RatingsSummary — a compact trust-band grid of aggregate ratings pulled
// from multiple review sources, each rendered as a small glass-neutral tile.
import { Star } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { cn } from '../lib/cn'

/** One aggregate rating rendered as a tile by {@link RatingsSummary}. */
export interface RatingSource {
  /** Platform / source name, e.g. `"Google"`. */
  name: string
  /** Headline score, e.g. `4.9` or `"A+"`. */
  score: string | number
  /** Denominator, e.g. `5`. Shown as `score/outOf` when provided and `score` is numeric. */
  outOf?: string | number
  /** Number of reviews/feedback backing the score. */
  count?: number
  /** Optional logo/icon node; falls back to `name` when omitted. */
  logo?: JSX.Element
  /** When set, the tile renders as a link to the source. */
  href?: string
}

export interface RatingsSummaryProps {
  /** Rating sources to render, in order, as a responsive grid. */
  sources: RatingSource[]
  /** Columns on desktop. Defaults to a responsive 4-column grid. */
  columns?: number
  class?: string
}

const DESKTOP_COLS: Record<number, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
}

/**
 * Compact social-proof grid of aggregate ratings across multiple sources —
 * a trust band for landing pages and checkout flows. Each source renders as
 * a small glass-neutral tile with its logo/name, headline score (optionally
 * `score/outOf`), a review count, and — when the score is numeric out of 5 —
 * a row of filled stars. Tiles with an `href` render as links that open in
 * a new tab.
 *
 * @example
 * ```tsx
 * <RatingsSummary
 *   sources={[
 *     { name: 'Google', score: 4.8, outOf: 5, count: 2140, href: 'https://example.com/reviews' },
 *     { name: 'Trustpilot', score: 4.6, outOf: 5, count: 980 },
 *     { name: 'Verified Buyers', score: 4.9, outOf: 5, count: 512 },
 *     { name: 'App Store', score: 'A+', count: 310 },
 *   ]}
 * />
 * ```
 */
export function RatingsSummary(props: RatingsSummaryProps): JSX.Element {
  const desktopCols = () => (props.columns !== undefined ? DESKTOP_COLS[props.columns] : undefined)

  return (
    <div class={cn('grid grid-cols-2 gap-3', desktopCols() ?? 'md:grid-cols-4', props.class)}>
      <For each={props.sources}>
        {(source) => {
          const numericScore = () => (typeof source.score === 'number' ? source.score : undefined)
          const tile = (
            <>
              <Show
                when={source.logo}
                fallback={<p class="text-sm font-medium text-muted-foreground">{source.name}</p>}
              >
                {(logo) => <div class="flex items-center justify-center text-muted-foreground">{logo()}</div>}
              </Show>
              <p class="mt-1 text-2xl font-bold text-foreground">
                <Show
                  when={numericScore() !== undefined && source.outOf !== undefined}
                  fallback={source.score}
                >
                  {source.score}/{source.outOf}
                </Show>
              </p>
              <Show when={numericScore() !== undefined && (numericScore() as number) <= 5}>
                <div class="mt-1 flex items-center justify-center gap-0.5" aria-hidden="true">
                  <For each={[0, 1, 2, 3, 4]}>
                    {(i) => (
                      <Star
                        class={cn(
                          'h-3.5 w-3.5',
                          i < Math.round(numericScore() as number)
                            ? 'fill-primary text-primary'
                            : 'fill-muted text-muted',
                        )}
                      />
                    )}
                  </For>
                </div>
              </Show>
              <Show when={source.count !== undefined}>
                <p class="mt-1 text-xs text-muted-foreground">{source.count?.toLocaleString()} reviews</p>
              </Show>
            </>
          )

          return (
            <Show
              when={source.href}
              fallback={<div class="rounded-xl border border-border bg-card/60 p-4 text-center">{tile}</div>}
            >
              {(href) => (
                <a
                  href={href()}
                  target="_blank"
                  rel="noreferrer"
                  class="rounded-xl border border-border bg-card/60 p-4 text-center transition hover:border-primary/50"
                >
                  {tile}
                </a>
              )}
            </Show>
          )
        }}
      </For>
    </div>
  )
}
