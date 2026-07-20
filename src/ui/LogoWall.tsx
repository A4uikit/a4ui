import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { cn } from '../lib/cn'

export interface LogoItem {
  src: string
  alt: string
  href?: string
}

export interface LogoWallProps {
  logos: LogoItem[]
  /** Grayscale until hover. Defaults to true. */
  grayscale?: boolean
  /** Columns on desktop. Defaults to a responsive auto-fit. */
  columns?: number
  class?: string
}

// Static Tailwind class lookups — dynamic `grid-cols-${n}` strings aren't
// picked up by the JIT scanner, so the desktop/mobile column counts must be
// literal class names known at build time.
const DESKTOP_COLS: Record<number, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  7: 'md:grid-cols-7',
  8: 'md:grid-cols-8',
}

const MOBILE_COLS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-3',
  5: 'grid-cols-3',
  6: 'grid-cols-3',
  7: 'grid-cols-3',
  8: 'grid-cols-3',
}

/**
 * "As seen in" grid of press/partner logos, grayscale by default with a
 * color-on-hover reveal. Each logo can optionally link out; sits neutral
 * on any background.
 *
 * @example
 * ```tsx
 * <LogoWall
 *   logos={[
 *     { src: 'https://picsum.photos/seed/techdaily/160/48', alt: 'TechDaily' },
 *     { src: 'https://picsum.photos/seed/stylemag/160/48', alt: 'StyleMag', href: 'https://stylemag.example' },
 *     { src: 'https://picsum.photos/seed/marketwire/160/48', alt: 'MarketWire' },
 *   ]}
 * />
 * ```
 */
export function LogoWall(props: LogoWallProps): JSX.Element {
  const grayscale = () => props.grayscale !== false
  const gridCols = () =>
    props.columns !== undefined
      ? cn(MOBILE_COLS[props.columns] ?? 'grid-cols-2', DESKTOP_COLS[props.columns] ?? 'md:grid-cols-6')
      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'

  return (
    <div class={cn('grid items-center gap-6 md:gap-8', gridCols(), props.class)}>
      <For each={props.logos}>
        {(logo) => {
          const img = (
            <img
              src={logo.src}
              alt={logo.alt}
              loading="lazy"
              class={cn(
                'mx-auto max-h-10 w-auto object-contain opacity-70 transition duration-300',
                grayscale() && 'grayscale hover:grayscale-0 hover:opacity-100',
                !grayscale() && 'hover:opacity-100',
              )}
            />
          )
          return (
            <Show when={logo.href} fallback={img}>
              <a href={logo.href} target="_blank" rel="noreferrer" aria-label={logo.alt}>
                {img}
              </a>
            </Show>
          )
        }}
      </For>
    </div>
  )
}
