// Card + 4 sub-parts (no CardFooter/CardDescription — add if needed).
import type { JSX, ParentProps } from 'solid-js'
import { splitProps } from 'solid-js'

import { cn } from '../lib/cn'

interface DivProps extends ParentProps {
  class?: string
}

interface CardProps extends DivProps {
  /** Frosted "space glass" surface (`.card`) instead of the opaque default. */
  glass?: boolean
  /**
   * Cursor-following edge glow (only meaningful with `glass`). Defaults to ON
   * for glass cards so the look is uniform; pass `glow={false}` to opt out.
   */
  glow?: boolean
}

/**
 * Container surface for grouping related content, with an optional frosted
 * "space glass" look. Compose with {@link CardHeader}, {@link CardTitle}, and
 * {@link CardContent}.
 *
 * @example
 * ```tsx
 * <Card glass>
 *   <CardHeader>
 *     <CardTitle>Usage</CardTitle>
 *   </CardHeader>
 *   <CardContent>1,204 requests today</CardContent>
 * </Card>
 * ```
 */
export function Card(props: CardProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'children', 'glass', 'glow'])
  // Glow defaults to the card's glass state when not explicitly set.
  const showGlow = () => (local.glow ?? local.glass) === true
  return (
    <div
      class={cn(
        local.glass
          ? 'card rounded-xl text-card-foreground'
          : 'rounded-xl border border-border bg-card text-card-foreground shadow-sm',
        showGlow() && 'glow-edge',
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </div>
  )
}

/** Header region of a {@link Card}; typically wraps a {@link CardTitle}. */
export function CardHeader(props: DivProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <div class={cn('flex flex-col space-y-1.5 p-6', local.class)} {...rest}>
      {local.children}
    </div>
  )
}

/** Heading text (rendered as an `<h2>`) for a {@link Card}. */
export function CardTitle(props: DivProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <h2 class={cn('text-lg font-semibold leading-none tracking-tight', local.class)} {...rest}>
      {local.children}
    </h2>
  )
}

/** Main body region of a {@link Card}, below the header. */
export function CardContent(props: DivProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <div class={cn('p-6 pt-0', local.class)} {...rest}>
      {local.children}
    </div>
  )
}
