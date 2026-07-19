// Card + 4 sub-parts (no CardFooter/CardDescription — add if needed).
import type { JSX, ParentProps } from 'solid-js'
import { onCleanup, onMount, splitProps } from 'solid-js'

import { cn } from '../lib/cn'
import { attachSpotlight } from './Spotlight'
import { attachTilt } from './TiltCard'

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
  /**
   * 3D tilt toward the cursor on hover — the same primitive as `<TiltCard>`,
   * baked in ({@link attachTilt}). Engine-free and reduced-motion aware.
   */
  tilt?: boolean
  /**
   * Soft radial glow following the cursor inside the card — the same primitive
   * as `<Spotlight>`, baked in ({@link attachSpotlight}). Engine-free and
   * reduced-motion aware.
   */
  spotlight?: boolean
}

/**
 * Container surface for grouping related content, with an optional frosted
 * "space glass" look. Compose with {@link CardHeader}, {@link CardTitle}, and
 * {@link CardContent}.
 *
 * `tilt` and `spotlight` bake in the cursor interactions from the Motion
 * category — no wrapper components needed.
 *
 * @example
 * ```tsx
 * <Card glass tilt spotlight>
 *   <CardHeader>
 *     <CardTitle>Usage</CardTitle>
 *   </CardHeader>
 *   <CardContent>1,204 requests today</CardContent>
 * </Card>
 * ```
 */
export function Card(props: CardProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'children', 'glass', 'glow', 'tilt', 'spotlight'])
  // Glow defaults to the card's glass state when not explicitly set.
  const showGlow = () => (local.glow ?? local.glass) === true

  let el: HTMLDivElement | undefined
  onMount(() => {
    const cleanups = [
      local.tilt && el ? attachTilt(el, el) : null,
      local.spotlight && el ? attachSpotlight(el) : null,
    ].filter((f): f is () => void => f !== null)
    onCleanup(() => cleanups.forEach((f) => f()))
  })

  return (
    <div
      ref={el}
      class={cn(
        local.glass
          ? 'card rounded-xl text-card-foreground'
          : 'rounded-xl border border-border bg-card text-card-foreground shadow-sm',
        showGlow() && 'glow-edge',
        local.spotlight && 'relative overflow-hidden',
        local.tilt && 'will-change-transform',
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
