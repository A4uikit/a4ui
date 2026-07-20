// ChatThread — layout shell for AI/conversation UIs: a centered, scrollable
// reading column that stacks chat messages. Purely a container: it has no
// idea what a "message" looks like, so any element can be stacked inside it.
import { createEffect, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface ChatThreadProps {
  children: JSX.Element
  /** Max width of the reading column, in px. Defaults to `768`. */
  maxWidth?: number
  /** Auto-scroll to the newest message on mount and whenever children change. Defaults to `true`. */
  stickToBottom?: boolean
  class?: string
}

/**
 * Scrollable, centered reading column that stacks chat messages. Layout-only:
 * it renders whatever is passed as `children`, so pair it with your own
 * message bubbles/components.
 *
 * @example
 * ```tsx
 * <ChatThread maxWidth={640}>
 *   <div>Hi! Ask me anything about your itinerary.</div>
 *   <div>What's the weather like in Rivertown this weekend?</div>
 *   <div>Sunny and mild, 18–22°C, light breeze on Saturday.</div>
 * </ChatThread>
 * ```
 */
export function ChatThread(props: ChatThreadProps): JSX.Element {
  let scrollEl: HTMLDivElement | undefined

  const scrollToBottom = () => {
    if (!scrollEl) return
    scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: motionReduced() ? 'auto' : 'smooth' })
  }

  onMount(() => {
    if (props.stickToBottom ?? true) scrollToBottom()
  })

  createEffect(() => {
    // Track children so newly appended messages pull the thread down.
    void props.children
    if (props.stickToBottom ?? true) queueMicrotask(scrollToBottom)
  })

  return (
    <div
      ref={scrollEl}
      class={cn('mx-auto flex w-full flex-col gap-4 overflow-y-auto', props.class)}
      style={{ 'max-width': `${props.maxWidth ?? 768}px` }}
    >
      {props.children}
    </div>
  )
}
