// Anchor — a table-of-contents nav with scroll-spy. An IntersectionObserver
// (bound in onMount, client-only, so it's SSR-safe) tracks which section is in
// view and highlights the matching link; clicks smooth-scroll to the target.
import type { JSX } from 'solid-js'
import { createSignal, For, onCleanup, onMount } from 'solid-js'

import { cn } from '../lib/cn'

export interface AnchorItem {
  /** The `id` of the section element this link points to. */
  id: string
  /** Text shown for the link. */
  label: string
}

export interface AnchorProps {
  /** Ordered list of sections to build the table of contents from. */
  items: AnchorItem[]
  class?: string
}

/**
 * A vertical table-of-contents nav with scroll-spy. Each item links to a page
 * section by `id`; the link whose section is topmost in the viewport is marked
 * active. Clicking a link smooth-scrolls to its section.
 *
 * @example
 * ```tsx
 * <Anchor
 *   items={[
 *     { id: 'intro', label: 'Introduction' },
 *     { id: 'usage', label: 'Usage' },
 *   ]}
 * />
 * ```
 */
export function Anchor(props: AnchorProps): JSX.Element {
  const [activeId, setActiveId] = createSignal<string>()

  onMount(() => {
    // Track which observed sections are currently intersecting, then pick the
    // one nearest the top of the document as the active anchor.
    const visible = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id
          if (entry.isIntersecting) visible.set(id, entry.boundingClientRect.top)
          else visible.delete(id)
        }
        let topId: string | undefined
        let topOffset = Infinity
        for (const [id, offset] of visible) {
          if (offset < topOffset) {
            topOffset = offset
            topId = id
          }
        }
        if (topId) setActiveId(topId)
      },
      { rootMargin: '0px 0px -70% 0px' },
    )

    for (const item of props.items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }

    onCleanup(() => observer.disconnect())
  })

  const onClick = (e: MouseEvent, id: string) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setActiveId(id)
  }

  return (
    <nav class={cn('flex flex-col gap-0.5', props.class)}>
      <For each={props.items}>
        {(item) => (
          <a
            href={'#' + item.id}
            onClick={(e) => onClick(e, item.id)}
            aria-current={activeId() === item.id ? 'true' : undefined}
            class={cn(
              'block rounded px-3 py-1.5 text-sm transition-colors',
              activeId() === item.id
                ? 'border-l-2 border-primary font-medium text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
          </a>
        )}
      </For>
    </nav>
  )
}
