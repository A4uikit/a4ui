// Shared pieces of the page-section blocks (Hero, FeatureGrid, Testimonials,
// Faq, CtaBanner, ContactSection, TeamGrid, SiteNav, SiteFooter): the plain-data
// link type and the centered heading every section opens with.
import type { JSX } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../../lib/cn'

/** A plain link used by the page-section blocks: visible text plus a URL. */
export interface SectionLink {
  /** Visible text. */
  label: string
  /** Destination URL, in-page anchor (`#features`) or `mailto:`/`tel:` link. */
  href: string
}

interface SectionHeadingProps {
  eyebrow?: string
  title?: string
  subtitle?: string
  /** Heading level of `title`. Defaults to `2`. */
  level?: 1 | 2
  align?: 'center' | 'left'
  class?: string
}

/** Eyebrow + title + subtitle stack. Renders nothing when all three are empty. */
export function SectionHeading(props: SectionHeadingProps): JSX.Element {
  const center = () => (props.align ?? 'center') === 'center'
  return (
    <Show when={props.eyebrow || props.title || props.subtitle}>
      <div
        class={cn(
          'flex flex-col gap-3',
          center() && 'mx-auto max-w-2xl items-center text-center',
          props.class,
        )}
      >
        <Show when={props.eyebrow}>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{props.eyebrow}</p>
        </Show>
        <Show when={props.title}>
          <Show
            when={props.level === 1}
            fallback={
              <h2 class="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {props.title}
              </h2>
            }
          >
            <h1 class="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {props.title}
            </h1>
          </Show>
        </Show>
        <Show when={props.subtitle}>
          <p class="text-pretty text-base text-muted-foreground sm:text-lg">{props.subtitle}</p>
        </Show>
      </div>
    </Show>
  )
}

/** Up-to-two-letter initials for avatar fallbacks. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
