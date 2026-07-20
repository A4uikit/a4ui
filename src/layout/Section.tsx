// Section — a centered content container with a max width and vertical rhythm.
// The layout wrapper every page repeats: `mx-auto` + a max-width + horizontal
// padding + section padding, with an optional `id` anchor for in-page nav. No
// visuals of its own — put a full-bleed background on a parent and let Section
// hold the centered content.
import type { JSX, ParentProps } from 'solid-js'
import { splitProps } from 'solid-js'

import { cn } from '../lib/cn'

/** Max content width of a {@link Section}. Defaults to `'6xl'`. */
export type SectionWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full'
/** Vertical padding of a {@link Section}. Defaults to `'lg'`. */
export type SectionPad = 'none' | 'sm' | 'md' | 'lg'

const WIDTH: Record<SectionWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
}
const PAD: Record<SectionPad, string> = {
  none: 'py-0',
  sm: 'py-8',
  md: 'py-14',
  lg: 'py-20',
}

interface SectionProps extends ParentProps, JSX.HTMLAttributes<HTMLElement> {
  /** Max content width. Defaults to `'6xl'`. */
  size?: SectionWidth
  /** Vertical padding rhythm. Defaults to `'lg'`. */
  py?: SectionPad
  class?: string
}

/**
 * Centered content container with a max width and consistent vertical rhythm —
 * the layout wrapper repeated on every marketing/company page. Pass an `id` for
 * anchor-based in-page navigation. For a full-bleed colored band, wrap Section
 * in a parent that carries the background.
 *
 * @example
 * ```tsx
 * <Section id="services">
 *   <h2>Servicios</h2>
 * </Section>
 *
 * <div class="bg-muted/30">
 *   <Section size="4xl" py="md">…</Section>
 * </div>
 * ```
 */
export function Section(props: SectionProps): JSX.Element {
  const [local, rest] = splitProps(props, ['size', 'py', 'class', 'children'])
  return (
    <section
      class={cn('mx-auto w-full px-5', WIDTH[local.size ?? '6xl'], PAD[local.py ?? 'lg'], local.class)}
      {...rest}
    >
      {local.children}
    </section>
  )
}
