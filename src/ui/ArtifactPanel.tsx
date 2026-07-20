// Inline (non-portalled) right-side panel for AI-generated output — code,
// preview, or doc — shown alongside a chat. Unlike `Drawer` (a portalled
// overlay on Kobalte's Dialog), the caller places this directly in a flex row
// next to the main content: it reserves no space when closed (width collapses
// to 0) and reveals by animating its own width, so the chat pane reflows next
// to it instead of being covered. We collapse to width 0 rather than toggling
// `display: none` because a `display` toggle jumps instantly — animating width
// is what makes it slide.
import { X } from 'lucide-solid'
import type { JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface ArtifactPanelProps {
  open: boolean
  onClose?: () => void
  title?: string
  /** Panel width in px when open. @default 420 */
  width?: number
  children: JSX.Element
  class?: string
}

/**
 * Right-side split panel that holds generated output (code, preview, doc) next
 * to a chat — for AI UIs that keep the artifact and the conversation visible at
 * once. Inline, not an overlay: place it as the last child of a flex row next
 * to the main content. Slides open/closed by animating width (and a matching
 * fade/slide on its content), reduced-motion aware via `motionReduced()`.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = createSignal(false)
 * <div class="flex h-full">
 *   <main class="min-w-0 flex-1">…chat…</main>
 *   <ArtifactPanel open={open()} onClose={() => setOpen(false)} title="script.py">
 *     <pre class="p-4 text-sm">…generated code…</pre>
 *   </ArtifactPanel>
 * </div>
 * ```
 */
export function ArtifactPanel(props: ArtifactPanelProps): JSX.Element {
  const width = () => props.width ?? 420
  const reduced = () => motionReduced()

  return (
    <div
      role="complementary"
      aria-label={props.title ?? 'Artifact'}
      aria-hidden={!props.open}
      class={cn(
        'card h-full shrink-0 overflow-hidden border-border bg-glass',
        props.open ? 'border-l' : 'border-0',
        reduced() ? undefined : 'transition-[width] duration-300 ease-in-out',
        props.class,
      )}
      style={{ width: `${props.open ? width() : 0}px` }}
    >
      {/* Fixed-width inner wrapper: the content never reflows/wraps while the
          outer element's width animates between 0 and `width()`. */}
      <div
        class={cn(
          'flex h-full flex-col',
          reduced() ? undefined : 'transition-[opacity,transform] duration-300 ease-in-out',
        )}
        style={{
          width: `${width()}px`,
          opacity: props.open ? 1 : 0,
          transform: props.open ? 'translateX(0)' : 'translateX(16px)',
        }}
      >
        <div class="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/90 px-5 py-4 backdrop-blur">
          <span class="truncate text-[16px] font-bold leading-tight">{props.title ?? 'Artifact'}</span>
          <button
            type="button"
            onClick={() => props.onClose?.()}
            class="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto">{props.children}</div>
      </div>
    </div>
  )
}
