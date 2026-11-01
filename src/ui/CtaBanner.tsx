// CtaBanner — a closing call-to-action band: headline, one line of support and
// one or two buttons on a tinted glass panel.
import type { JSX } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Button } from './Button'
import { SectionHeading, type SectionLink } from './internal/sectionKit'

export interface CtaBannerProps {
  title: string
  subtitle?: string
  /** Main call-to-action (filled button). */
  primary: SectionLink
  /** Secondary call-to-action (outline button). */
  secondary?: SectionLink
  /** Anchor id for in-page navigation. */
  id?: string
  class?: string
}

/**
 * Call-to-action band that closes a page or splits long ones: a headline, an
 * optional line of support and one or two buttons on a glass panel tinted with
 * the theme's primary color.
 *
 * @example
 * ```tsx
 * <CtaBanner
 *   title="Ready to launch?"
 *   subtitle="Start free, upgrade when you grow."
 *   primary={{ label: 'Create account', href: '/signup' }}
 * />
 * ```
 */
export function CtaBanner(props: CtaBannerProps): JSX.Element {
  return (
    <section id={props.id} class={cn('mx-auto w-full max-w-6xl px-5 py-16', props.class)}>
      <div class="card glow-edge relative isolate overflow-hidden rounded-2xl px-6 py-14 sm:px-12">
        <div
          aria-hidden="true"
          class="absolute inset-0 -z-10 bg-gradient-to-br from-primary/25 via-transparent to-accent/20"
        />
        <div class="flex flex-col items-center gap-8 text-center">
          <SectionHeading title={props.title} subtitle={props.subtitle} />
          <div class="flex flex-wrap justify-center gap-3">
            <Button href={props.primary.href} ripple class="px-5 py-2.5 text-base">
              {props.primary.label}
            </Button>
            <Show when={props.secondary}>
              {(link) => (
                <Button href={link().href} variant="outline" class="px-5 py-2.5 text-base">
                  {link().label}
                </Button>
              )}
            </Show>
          </div>
        </div>
      </div>
    </section>
  )
}
