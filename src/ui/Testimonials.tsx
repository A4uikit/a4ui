// Testimonials — customer quotes as a grid of cards or a scrolling marquee.
import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Avatar } from './Avatar'
import { Card } from './Card'
import { initials, SectionHeading } from './internal/sectionKit'
import { Marquee } from './Marquee'

/** One quote rendered by {@link Testimonials}. */
export interface TestimonialItem {
  quote: string
  /** Who said it. */
  name: string
  /** Job title and/or company, e.g. `"CTO, Northwind"`. */
  role?: string
  /** Avatar image URL. Falls back to the name's initials. */
  avatar?: string
}

/** Arrangement of {@link Testimonials}. */
export type TestimonialsLayout = 'grid' | 'marquee'

export interface TestimonialsProps {
  title?: string
  subtitle?: string
  items: TestimonialItem[]
  /** `'grid'` (default) or a horizontally scrolling `'marquee'` (still under reduced motion). */
  layout?: TestimonialsLayout
  /** Anchor id for in-page navigation. */
  id?: string
  class?: string
}

function Quote(props: { item: TestimonialItem; class?: string }): JSX.Element {
  return (
    <Card glass class={cn('flex h-full flex-col justify-between gap-6 p-6', props.class)}>
      <blockquote class="text-pretty text-base leading-relaxed text-foreground">
        <p>“{props.item.quote}”</p>
      </blockquote>
      <figcaption class="flex items-center gap-3">
        <Avatar src={props.item.avatar} alt="" fallback={initials(props.item.name)} class="h-10 w-10" />
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-foreground">{props.item.name}</p>
          <Show when={props.item.role}>
            <p class="truncate text-xs text-muted-foreground">{props.item.role}</p>
          </Show>
        </div>
      </figcaption>
    </Card>
  )
}

/**
 * Social-proof section of customer quotes, each with the person's name, role
 * and avatar (initials when no image). Lay them out as a responsive grid of
 * glass cards, or as a marquee that scrolls sideways and pauses on hover.
 *
 * @example
 * ```tsx
 * <Testimonials
 *   title="Loved by small teams"
 *   items={[{ quote: 'We launched in two days.', name: 'Ana Ruiz', role: 'Founder, Brisa' }]}
 * />
 * ```
 */
export function Testimonials(props: TestimonialsProps): JSX.Element {
  return (
    <section id={props.id} class={cn('mx-auto flex w-full max-w-6xl flex-col gap-12 py-20', props.class)}>
      <SectionHeading title={props.title} subtitle={props.subtitle} class="px-5" />
      <Show
        when={props.layout === 'marquee'}
        fallback={
          <ul class="grid gap-6 px-5 sm:grid-cols-2 lg:grid-cols-3">
            <For each={props.items}>
              {(item) => (
                <li>
                  <figure class="h-full">
                    <Quote item={item} />
                  </figure>
                </li>
              )}
            </For>
          </ul>
        }
      >
        <Marquee
          speed={Math.max(20, props.items.length * 8)}
          class="[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        >
          <For each={props.items}>
            {(item) => (
              <figure class="mx-3 w-[18rem] shrink-0 sm:w-[22rem]">
                <Quote item={item} />
              </figure>
            )}
          </For>
        </Marquee>
      </Show>
    </section>
  )
}
