// Generic accessible accordion on Kobalte's Accordion primitive.
import { Accordion as KAccordion } from '@kobalte/core/accordion'
import type { JSX } from 'solid-js'
import { For } from 'solid-js'

/** A single collapsible section rendered by {@link Accordion}. */
export interface AccordionItem {
  /** Unique identifier for the item; used to track expanded state. */
  value: string
  /** Text shown in the trigger row. */
  title: string
  /** Content revealed when the item is expanded. */
  content: JSX.Element
}

interface AccordionProps {
  items: AccordionItem[]
  /** Allow more than one item to be expanded at the same time. Defaults to `false` (single-open). */
  multiple?: boolean
  class?: string
}

/**
 * Accessible, collapsible list of sections built on Kobalte's `Accordion` primitive.
 * Each entry in `items` renders as a header/trigger row plus a content panel.
 *
 * @example
 * ```tsx
 * <Accordion
 *   items={[
 *     { value: 'a', title: 'What is A4ui?', content: <p>A SolidJS design system.</p> },
 *     { value: 'b', title: 'How do I install it?', content: <p>npm install a4ui</p> },
 *   ]}
 * />
 * ```
 */
export function Accordion(props: AccordionProps): JSX.Element {
  return (
    <KAccordion multiple={props.multiple ?? false} class={props.class}>
      <For each={props.items}>
        {(item) => (
          <KAccordion.Item value={item.value} class="border-b border-border">
            <KAccordion.Header>
              <KAccordion.Trigger class="flex w-full items-center justify-between py-3 text-sm font-medium text-foreground [&[data-expanded]>svg]:rotate-90">
                {item.title}
                <svg
                  class="h-3.5 w-3.5 shrink-0 transition-transform duration-200"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M7 5l6 5-6 5" />
                </svg>
              </KAccordion.Trigger>
            </KAccordion.Header>
            <KAccordion.Content class="pb-3 text-sm text-muted-foreground">
              {item.content}
            </KAccordion.Content>
          </KAccordion.Item>
        )}
      </For>
    </KAccordion>
  )
}
