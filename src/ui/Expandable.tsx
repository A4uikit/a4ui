// Shared-element transition: a compact `trigger` (a card) morphs into an
// expanded overlay panel and back, using a FLIP animation. We animate the
// panel's position and SIZE (top/left/width/height) rather than a transform
// scale, so its content never stretches. Covers the motion.dev "family dialog"
// (size="dialog") and "app store layout" (size="full") patterns with one API.
import { createSignal, Show, onCleanup, onMount, type JSX } from 'solid-js'
import { Portal } from 'solid-js/web'

import { cn } from '../lib/cn'
import { animate, motionReduced } from '../lib/motion'

type Rect = { top: number; left: number; width: number; height: number }

export interface ExpandableProps {
  /** Collapsed content — the card users click to expand. */
  trigger: JSX.Element
  /** Expanded panel content. */
  children: JSX.Element
  /** `dialog` = centered panel capped at `maxWidth`; `full` = near-fullscreen. @default 'dialog' */
  size?: 'dialog' | 'full'
  /** Max width (px) of the expanded panel when `size='dialog'`. @default 640 */
  maxWidth?: number
  /** Notified when the panel opens/closes. */
  onOpenChange?: (open: boolean) => void
  /** Class for the inline trigger wrapper. */
  class?: string
  /** Class for the expanded panel surface. */
  panelClass?: string
}

const PAD = 24

/**
 * Expands a card into an overlay panel with a shared-element (FLIP) transition —
 * the card appears to grow into the dialog and shrink back on close. Animates
 * position + size (never scale) so content stays crisp. Falls back to a plain
 * show/hide under reduced motion. Close with the ✕, a backdrop click, or Escape.
 *
 * @example
 * ```tsx
 * <Expandable
 *   trigger={<Card class="cursor-pointer">Tap to expand</Card>}
 *   size="dialog"
 * >
 *   <div class="p-6">Full details here…</div>
 * </Expandable>
 * ```
 */
export function Expandable(props: ExpandableProps): JSX.Element {
  const [open, setOpen] = createSignal(false)
  let triggerEl: HTMLDivElement | undefined
  let panelEl: HTMLDivElement | undefined
  let backdropEl: HTMLDivElement | undefined
  let originRect: Rect | undefined
  let controls: ReturnType<typeof animate> | undefined

  const rectOf = (el: Element): Rect => {
    const r = el.getBoundingClientRect()
    return { top: r.top, left: r.left, width: r.width, height: r.height }
  }

  // The panel's resting position/size, computed (not scaled) so text stays sharp.
  const finalRect = (el: HTMLDivElement): Rect => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    if (props.size === 'full') {
      const width = vw - PAD * 2
      const height = vh - PAD * 2
      return { left: PAD, top: PAD, width, height }
    }
    const width = Math.min(props.maxWidth ?? 640, vw - PAD * 2)
    // Measure the natural height at the target width.
    el.style.width = `${width}px`
    el.style.height = 'auto'
    el.style.maxHeight = `${vh - PAD * 2}px`
    const natH = el.getBoundingClientRect().height
    const height = Math.min(natH, vh - PAD * 2)
    return { left: (vw - width) / 2, top: (vh - height) / 2, width, height }
  }

  const place = (el: HTMLDivElement, r: Rect) => {
    el.style.top = `${r.top}px`
    el.style.left = `${r.left}px`
    el.style.width = `${r.width}px`
    el.style.height = `${r.height}px`
  }

  const doOpen = () => {
    if (open() || !triggerEl) return
    originRect = rectOf(triggerEl)
    setOpen(true)
    props.onOpenChange?.(true)
  }

  // Runs once the portalled panel is in the DOM: FLIP from the card to the panel.
  const runOpenFlip = () => {
    const el = panelEl
    if (!el) return
    const final = finalRect(el)
    if (motionReduced() || !originRect) {
      place(el, final)
      el.style.overflow = 'auto'
      el.style.opacity = '1'
      return
    }
    place(el, originRect) // first
    el.style.opacity = '1'
    void el.offsetWidth // force reflow
    controls?.stop()
    controls = animate(
      el,
      {
        top: [originRect.top, final.top],
        left: [originRect.left, final.left],
        width: [originRect.width, final.width],
        height: [originRect.height, final.height],
      },
      { type: 'spring', stiffness: 280, damping: 32 },
    )
    if (backdropEl) animate(backdropEl, { opacity: [0, 1] }, { duration: 0.25, ease: 'easeOut' })
    controls.finished
      .then(() => {
        el.style.overflow = 'auto'
      })
      .catch(() => {})
  }

  const doClose = () => {
    if (!open()) return
    const el = panelEl
    const back = triggerEl ? rectOf(triggerEl) : originRect
    if (!el || !back || motionReduced()) {
      finishClose()
      return
    }
    controls?.stop()
    el.style.overflow = 'hidden'
    place(el, rectOf(el)) // pin current
    void el.offsetWidth
    controls = animate(
      el,
      { top: back.top, left: back.left, width: back.width, height: back.height, opacity: [1, 0.35] },
      { duration: 0.3, ease: 'easeInOut' },
    )
    if (backdropEl) animate(backdropEl, { opacity: [1, 0] }, { duration: 0.25, ease: 'easeIn' })
    controls.finished.then(finishClose).catch(finishClose)
  }

  const finishClose = () => {
    setOpen(false)
    props.onOpenChange?.(false)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') doClose()
  }

  onMount(() => document.addEventListener('keydown', onKeyDown))
  onCleanup(() => {
    document.removeEventListener('keydown', onKeyDown)
    controls?.stop()
  })

  return (
    <>
      <div
        ref={triggerEl}
        role="button"
        tabindex={0}
        class={cn('cursor-pointer', props.class)}
        onClick={doOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            doOpen()
          }
        }}
      >
        {props.trigger}
      </div>

      <Show when={open()}>
        <Portal>
          <div
            ref={backdropEl}
            aria-hidden="true"
            onClick={doClose}
            class="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
            style={{ opacity: motionReduced() ? '1' : '0' }}
          />
          <div
            ref={(el) => {
              panelEl = el
              // Measure/FLIP after layout settles.
              requestAnimationFrame(runOpenFlip)
            }}
            role="dialog"
            aria-modal="true"
            class={cn(
              'card fixed z-[9999] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl',
              props.panelClass,
            )}
            style={{ opacity: '0', margin: '0' }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={doClose}
              class="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg
                viewBox="0 0 24 24"
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            {props.children}
          </div>
        </Portal>
      </Show>
    </>
  )
}
