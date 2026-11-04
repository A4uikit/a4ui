// Hero — the opening section of a landing page: headline, supporting text, up
// to two calls-to-action, and an optional image, on a plain, aurora or photo
// background.
import type { JSX } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Button } from './Button'
import { SectionHeading, type SectionLink } from './internal/sectionKit'

/** Arrangement of a {@link Hero}: text centered, or text beside the image. */
export type HeroLayout = 'center' | 'split'
/** Backdrop of a {@link Hero}. `'image'` uses `image` as a full-bleed photo. */
export type HeroBackground = 'none' | 'aurora' | 'image'

export interface HeroProps {
  /** Small label above the title, e.g. a category or announcement. */
  eyebrow?: string
  /** Main headline, rendered as the page `<h1>`. */
  title: string
  /** Supporting paragraph under the title. */
  subtitle?: string
  /** Main call-to-action (filled button). */
  primary?: SectionLink
  /** Secondary call-to-action (outline button). */
  secondary?: SectionLink
  /** Image URL. Shown beside the text in `split` layout, under it in `center`, or behind it with `background="image"`. */
  image?: string
  /** Alt text of `image`. Defaults to empty (decorative). */
  imageAlt?: string
  /** Defaults to `'center'`. */
  layout?: HeroLayout
  /** Defaults to `'aurora'`. */
  background?: HeroBackground
  /** Anchor id for in-page navigation. */
  id?: string
  class?: string
}

/**
 * Opening section of a landing page: eyebrow, headline, subtitle and up to two
 * call-to-action links, with an optional image. `layout="split"` puts the image
 * beside the text on wide screens (stacked on phones); `background` picks a
 * theme-tinted aurora glow, a full-bleed photo with a legibility scrim, or
 * nothing.
 *
 * @example
 * ```tsx
 * <Hero
 *   eyebrow="New"
 *   title="Ship your site this week"
 *   subtitle="Everything you need to launch, nothing you don't."
 *   primary={{ label: 'Get started', href: '/signup' }}
 *   secondary={{ label: 'See pricing', href: '#pricing' }}
 * />
 * ```
 */
export function Hero(props: HeroProps): JSX.Element {
  const layout = () => props.layout ?? 'center'
  const background = () => props.background ?? 'aurora'
  const photoBackdrop = () => background() === 'image' && props.image !== undefined
  const showInlineImage = () => props.image !== undefined && !photoBackdrop()

  const actions = (
    <Show when={props.primary || props.secondary}>
      <div class={cn('flex flex-wrap gap-3', layout() === 'center' && 'justify-center')}>
        <Show when={props.primary}>
          {(link) => (
            <Button href={link().href} ripple class="px-5 py-2.5 text-base">
              {link().label}
            </Button>
          )}
        </Show>
        <Show when={props.secondary}>
          {(link) => (
            <Button href={link().href} variant="outline" class="px-5 py-2.5 text-base">
              {link().label}
            </Button>
          )}
        </Show>
      </div>
    </Show>
  )

  return (
    <section
      id={props.id}
      class={cn('relative isolate overflow-hidden', photoBackdrop() && 'text-white', props.class)}
    >
      <Show when={background() === 'aurora'}>
        <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
          <div class="aurora-drift absolute -start-[10%] -top-[30%] h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl" />
          <div class="aurora-drift absolute -end-[10%] top-[10%] h-[24rem] w-[24rem] rounded-full bg-accent/25 blur-3xl [animation-delay:-9s]" />
        </div>
      </Show>
      <Show when={photoBackdrop()}>
        <img
          src={props.image}
          alt={props.imageAlt ?? ''}
          class="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          class="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/55 to-black/75"
        />
      </Show>

      <div
        class={cn(
          'mx-auto grid w-full max-w-6xl gap-10 px-5 py-20 sm:py-28',
          layout() === 'split' && showInlineImage() && 'items-center md:grid-cols-2',
        )}
      >
        <div
          class={cn(
            'flex flex-col gap-8',
            layout() === 'center' ? 'items-center text-center' : 'items-start',
          )}
        >
          <SectionHeading
            level={1}
            align={layout() === 'center' ? 'center' : 'left'}
            eyebrow={props.eyebrow}
            title={props.title}
            subtitle={props.subtitle}
            class={cn(
              layout() === 'center' && 'max-w-3xl',
              photoBackdrop() && '[&_h1]:text-white [&_p]:text-white/85',
            )}
          />
          {actions}
        </div>
        <Show when={showInlineImage()}>
          <img
            src={props.image}
            alt={props.imageAlt ?? ''}
            class={cn(
              'card w-full rounded-2xl object-cover shadow-xl',
              layout() === 'center' ? 'mx-auto aspect-[16/9] max-w-4xl' : 'aspect-[4/3]',
            )}
          />
        </Show>
      </div>
    </section>
  )
}
