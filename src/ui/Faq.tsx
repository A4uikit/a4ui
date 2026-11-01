// Faq — frequently asked questions as an accordion under a heading.
import type { JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { Accordion } from './Accordion'
import { SectionHeading } from './internal/sectionKit'

/** One question/answer pair rendered by {@link Faq}. */
export interface FaqItem {
  question: string
  answer: string
}

export interface FaqProps {
  title?: string
  subtitle?: string
  items: FaqItem[]
  /** Allow several answers open at once. Defaults to `false`. */
  multiple?: boolean
  /** Anchor id for in-page navigation. */
  id?: string
  class?: string
}

/**
 * Frequently-asked-questions section: an optional heading over an
 * {@link Accordion} of questions on a glass panel; each answer expands in place.
 *
 * @example
 * ```tsx
 * <Faq
 *   title="Questions"
 *   items={[{ question: 'Can I cancel anytime?', answer: 'Yes, from your account settings.' }]}
 * />
 * ```
 */
export function Faq(props: FaqProps): JSX.Element {
  return (
    <section
      id={props.id}
      class={cn('mx-auto flex w-full max-w-3xl flex-col gap-10 px-5 py-20', props.class)}
    >
      <SectionHeading title={props.title} subtitle={props.subtitle} />
      <div class="card rounded-xl px-5 sm:px-6 [&_button]:py-4 [&_button]:text-left [&_button]:text-base">
        <Accordion
          multiple={props.multiple}
          class="[&>*:last-child]:border-b-0"
          items={props.items.map((item, index) => ({
            value: `faq-${index}`,
            title: item.question,
            content: item.answer,
          }))}
        />
      </div>
    </section>
  )
}
