// Full-screen image viewer: a responsive thumbnail grid that opens (via
// Portal, dark backdrop) into an overlay with the active image, prev/next
// navigation, a close button, an alt-text caption, and a thumbnail strip —
// same overlay idiom as Modal (backdrop click / Escape closes, body scroll
// locks while open), just built directly on Portal instead of Kobalte's
// Dialog so index/open state can be driven by the caller.
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createEffect, createMemo, createSignal, For, onCleanup, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'
import { Portal } from './Portal'

/** One image in a {@link Lightbox}. */
export interface LightboxImage {
  src: string
  alt?: string
  /** Smaller image used in the thumbnail grid/strip; falls back to `src`. */
  thumb?: string
}

export interface LightboxProps {
  images: LightboxImage[]
  /** Controlled overlay open state. When set, wins over internal state — pair with `onOpenChange`. */
  open?: boolean
  /** Controlled active image index (clamped to the images array). When set, wins over internal state — pair with `onIndexChange`. */
  index?: number
  onOpenChange?: (open: boolean) => void
  onIndexChange?: (index: number) => void
  /** Show the thumbnail strip at the bottom of the overlay. @default true */
  showThumbnails?: boolean
  class?: string
}

/**
 * Responsive thumbnail grid (`thumb || src`) that opens into a full-screen
 * viewer on click: the active image centered, prev/next chevrons, a close
 * button, an alt-text caption, a zoom toggle, and (by default) a thumbnail
 * strip with the active image highlighted. Navigate with the arrow keys or
 * Escape, click the backdrop to close. Works controlled
 * (`open`/`index` + `onOpenChange`/`onIndexChange`) or uncontrolled. Body
 * scroll locks while open, like `Modal`; the zoom transition is skipped
 * under `prefers-reduced-motion` but stays fully functional.
 *
 * @example
 * ```tsx
 * <Lightbox
 *   images={[
 *     { src: '/photos/1-full.jpg', thumb: '/photos/1-thumb.jpg', alt: 'Sunset over the bay' },
 *     { src: '/photos/2-full.jpg', thumb: '/photos/2-thumb.jpg', alt: 'Mountain trail' },
 *   ]}
 * />
 * ```
 */
export function Lightbox(props: LightboxProps): JSX.Element {
  const [internalOpen, setInternalOpen] = createSignal(false)
  const open = createMemo(() => props.open ?? internalOpen())

  const [internalIndex, setInternalIndex] = createSignal(0)
  const rawIndex = createMemo(() => props.index ?? internalIndex())

  const lastIndex = createMemo(() => Math.max(0, props.images.length - 1))
  const clampIndex = (i: number): number => Math.min(Math.max(i, 0), lastIndex())
  const index = createMemo(() => clampIndex(rawIndex()))
  const current = createMemo(() => props.images[index()])

  const setOpen = (next: boolean): void => {
    setInternalOpen(next)
    props.onOpenChange?.(next)
  }
  const setIndex = (next: number): void => {
    const clamped = clampIndex(next)
    setInternalIndex(clamped)
    props.onIndexChange?.(clamped)
  }

  const openAt = (i: number): void => {
    setIndex(i)
    setOpen(true)
  }
  const close = (): void => setOpen(false)
  const prev = (): void => setIndex(index() - 1)
  const next = (): void => setIndex(index() + 1)
  const showThumbnails = (): boolean => props.showThumbnails !== false

  // Zoom toggle for the active image; reset whenever the image or open state changes.
  const [zoomed, setZoomed] = createSignal(false)
  createEffect(() => {
    index()
    open()
    setZoomed(false)
  })

  // Lock body scroll while the overlay is open — same idiom as Modal's Dialog.
  createEffect(() => {
    if (!open() || typeof document === 'undefined') return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    onCleanup(() => {
      document.body.style.overflow = previousOverflow
    })
  })

  // Escape closes, ArrowLeft/ArrowRight navigate, while the overlay is open.
  createEffect(() => {
    if (!open() || typeof window === 'undefined') return
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    onCleanup(() => window.removeEventListener('keydown', onKeyDown))
  })

  return (
    <div class={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4', props.class)}>
      <For each={props.images}>
        {(image, i) => (
          <button
            type="button"
            class="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={image.alt ?? `Open image ${i() + 1}`}
            onClick={() => openAt(i())}
          >
            <img
              src={image.thumb ?? image.src}
              alt={image.alt ?? ''}
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        )}
      </For>

      <Show when={open() && current()}>
        <Portal>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={current()?.alt ?? 'Image viewer'}
            tabindex="-1"
            class="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm outline-none"
            onClick={close}
            ref={(el) => {
              queueMicrotask(() => el.focus())
            }}
          >
            <div class="flex items-center justify-end p-4" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                aria-label="Close"
                onClick={close}
                class="grid h-10 w-10 place-items-center rounded-lg bg-card/80 text-foreground transition hover:bg-muted"
              >
                <X class="h-5 w-5" />
              </button>
            </div>

            <div class="relative flex flex-1 items-center justify-center px-4">
              <Show when={props.images.length > 1}>
                <button
                  type="button"
                  aria-label="Previous image"
                  disabled={index() === 0}
                  onClick={(e) => {
                    e.stopPropagation()
                    prev()
                  }}
                  class="absolute left-2 z-10 grid h-10 w-10 place-items-center rounded-full bg-card/80 text-foreground transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40 sm:left-4"
                >
                  <ChevronLeft class="h-6 w-6" />
                </button>
              </Show>

              <img
                src={current()?.src}
                alt={current()?.alt ?? ''}
                onClick={(e) => {
                  e.stopPropagation()
                  setZoomed((z) => !z)
                }}
                class={cn(
                  'max-h-[calc(100vh-10rem)] max-w-[92vw] rounded-lg object-contain',
                  !motionReduced() && 'transition-transform duration-300 ease-out',
                  zoomed() ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in',
                )}
              />

              <Show when={props.images.length > 1}>
                <button
                  type="button"
                  aria-label="Next image"
                  disabled={index() === lastIndex()}
                  onClick={(e) => {
                    e.stopPropagation()
                    next()
                  }}
                  class="absolute right-2 z-10 grid h-10 w-10 place-items-center rounded-full bg-card/80 text-foreground transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40 sm:right-4"
                >
                  <ChevronRight class="h-6 w-6" />
                </button>
              </Show>
            </div>

            <div class="flex flex-col items-center gap-3 p-4" onClick={(e) => e.stopPropagation()}>
              <div class="flex items-center gap-3">
                <Show when={current()?.alt}>
                  <p class="text-center text-sm text-muted-foreground">{current()?.alt}</p>
                </Show>
                <button
                  type="button"
                  aria-label={zoomed() ? 'Zoom out' : 'Zoom in'}
                  aria-pressed={zoomed()}
                  onClick={() => setZoomed((z) => !z)}
                  class={cn(
                    'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground',
                    zoomed() && 'bg-muted text-foreground',
                  )}
                >
                  <ZoomIn class="h-4 w-4" />
                </button>
              </div>

              <Show when={showThumbnails() && props.images.length > 1}>
                <div class="flex max-w-full gap-2 overflow-x-auto py-1">
                  <For each={props.images}>
                    {(image, i) => (
                      <button
                        type="button"
                        aria-label={image.alt ?? `Go to image ${i() + 1}`}
                        aria-current={index() === i() ? 'true' : undefined}
                        onClick={() => setIndex(i())}
                        class={cn(
                          'h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition',
                          index() === i()
                            ? 'border-primary'
                            : 'border-transparent opacity-60 hover:opacity-100',
                        )}
                      >
                        <img src={image.thumb ?? image.src} alt="" class="h-full w-full object-cover" />
                      </button>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}
