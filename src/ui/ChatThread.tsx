// ChatThread — layout shell for AI/conversation UIs: a centered, scrollable
// reading column that stacks chat messages. It has no idea what a "message"
// looks like, but it owns the scroll behaviour of a conversation: it follows
// new output only while the reader is at the bottom, keeps the view steady when
// older messages are prepended, and offers a "Jump to latest" button.
import { ArrowDown } from 'lucide-solid'
import { createSignal, onCleanup, onMount, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

/** Imperative handle handed out through {@link ChatThreadProps.apiRef}. */
export interface ChatThreadApi {
  /** Scroll the element carrying `data-message-id={id}` to the top of the view. Throws if there is none. */
  scrollToMessage: (id: string, options?: { behavior?: ScrollBehavior }) => void
  /** Scroll to the newest content and re-pin the thread to the bottom. */
  scrollToEnd: (options?: { behavior?: ScrollBehavior }) => void
}

export interface ChatThreadProps {
  children: JSX.Element
  /** Max width of the reading column, in px. Defaults to `768`. */
  maxWidth?: number
  /**
   * Follow new content (appended messages and streamed text) to the bottom,
   * but only while the reader is already at the bottom. Defaults to `true`.
   */
  stickToBottom?: boolean
  /** Receives the imperative API once on mount. */
  apiRef?: (api: ChatThreadApi) => void
  /** Label of the button shown when new content arrives off-screen. Defaults to `'Jump to latest'`. */
  jumpLabel?: string
  class?: string
}

/** Within this many px of the end counts as "at the bottom". */
const PIN_THRESHOLD = 24

/**
 * Scrollable, centered reading column that stacks chat messages. Give message
 * elements a `data-message-id` (`<Message id="…">` does) to target them with
 * `apiRef`'s `scrollToMessage`.
 *
 * - Appended or streamed content scrolls into view only while the reader is
 *   pinned to the bottom; otherwise the view stays put and a **Jump to latest**
 *   button appears.
 * - Prepending older messages keeps the visible messages where they were.
 *
 * @example
 * ```tsx
 * let api!: ChatThreadApi
 * <ChatThread maxWidth={640} apiRef={(a) => (api = a)} class="h-96">
 *   <Message id="m1" role="user">What changed in v2?</Message>
 *   <Message id="m2" role="assistant">Three things…</Message>
 * </ChatThread>
 * // later: api.scrollToMessage('m1')
 * ```
 */
export function ChatThread(props: ChatThreadProps): JSX.Element {
  let scrollEl!: HTMLDivElement
  const [showJump, setShowJump] = createSignal(false)
  let pinned = true
  // Snapshot taken after every change, to detect prepends and measure deltas.
  let lastScrollHeight = 0
  let lastFirst: Element | null = null

  const behavior = (b?: ScrollBehavior): ScrollBehavior => b ?? (motionReduced() ? 'auto' : 'smooth')
  const distanceFromEnd = (): number => scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight
  const firstMessage = (): Element | null => scrollEl.firstElementChild
  const snapshot = (): void => {
    lastScrollHeight = scrollEl.scrollHeight
    lastFirst = firstMessage()
  }

  const scrollToEnd = (options?: { behavior?: ScrollBehavior }): void => {
    pinned = true
    setShowJump(false)
    scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: behavior(options?.behavior) })
  }

  const scrollToMessage = (id: string, options?: { behavior?: ScrollBehavior }): void => {
    const target = scrollEl.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(id)}"]`)
    if (!target) throw new Error(`ChatThread.scrollToMessage: no element with data-message-id="${id}"`)
    const top = target.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top + scrollEl.scrollTop
    scrollEl.scrollTo({ top: Math.max(0, top - 8), behavior: behavior(options?.behavior) })
  }

  const onScroll = (): void => {
    pinned = distanceFromEnd() <= PIN_THRESHOLD
    if (pinned) setShowJump(false)
  }

  const onContentChange = (): void => {
    const first = firstMessage()
    const prepended = lastFirst !== null && first !== lastFirst && scrollEl.contains(lastFirst)
    if (prepended) {
      // Older messages were inserted above: shift by the height they added so
      // what the reader was looking at does not move.
      scrollEl.scrollTop += scrollEl.scrollHeight - lastScrollHeight
    } else if (scrollEl.scrollHeight !== lastScrollHeight) {
      if (pinned && (props.stickToBottom ?? true)) {
        scrollEl.scrollTop = scrollEl.scrollHeight
      } else if (!pinned) {
        setShowJump(true)
      }
    }
    snapshot()
  }

  onMount(() => {
    props.apiRef?.({ scrollToMessage, scrollToEnd })
    if (props.stickToBottom ?? true) scrollEl.scrollTop = scrollEl.scrollHeight
    pinned = distanceFromEnd() <= PIN_THRESHOLD
    snapshot()
    const observer = new MutationObserver(onContentChange)
    observer.observe(scrollEl, { childList: true, subtree: true, characterData: true })
    onCleanup(() => observer.disconnect())
  })

  return (
    <div
      ref={scrollEl}
      onScroll={onScroll}
      tabIndex={0}
      // Scroll anchoring would double-apply the prepend correction above.
      class={cn(
        'mx-auto flex w-full flex-col gap-4 overflow-y-auto outline-none [overflow-anchor:none] focus-visible:ring-2 focus-visible:ring-ring',
        props.class,
      )}
      style={{ 'max-width': `${props.maxWidth ?? 768}px` }}
    >
      {props.children}
      <Show when={showJump()}>
        {/* Zero-height sticky row so the button floats over the bottom edge without adding scroll height. */}
        <div
          data-slot="chat-jump"
          class="pointer-events-none sticky bottom-3 -mt-4 flex h-0 shrink-0 justify-center"
        >
          <button
            type="button"
            onClick={() => scrollToEnd()}
            class="pointer-events-auto absolute bottom-0 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-card-foreground shadow-lg transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowDown class="h-3.5 w-3.5" aria-hidden="true" />
            {props.jumpLabel ?? 'Jump to latest'}
          </button>
        </div>
      </Show>
    </div>
  )
}
