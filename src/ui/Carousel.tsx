// Single-slide carousel: a translateX track that slides horizontally between
// slides with a CSS transition, arrow + dot controls, keyboard navigation, and
// optional hover-pausing autoplay (gated on prefers-reduced-motion via the
// shared `motionReduced` helper).
import { ChevronLeft, ChevronRight } from 'lucide-solid'
import { For, createSignal, onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface CarouselProps {
  /** Slides to page through, one visible at a time. */
  slides: JSX.Element[]
  /** Auto-advance interval in ms. Omit to disable autoplay (also skipped under reduced motion / hover). */
  autoplayMs?: number
  /**
   * Drag/touch to swipe between slides (in addition to arrows, dots, and arrow
   * keys). The track follows the pointer and snaps on release — pure CSS, no
   * engine. @default true
   */
  swipe?: boolean
  class?: string
}

/**
 * Horizontally-sliding carousel that shows one slide at a time inside a rounded,
 * overflow-hidden viewport. Includes wrapping prev/next arrow buttons, a row of
 * dot indicators, Left/Right arrow-key navigation when focused, and optional
 * autoplay that pauses on hover and is disabled under `prefers-reduced-motion`.
 *
 * @example
 * ```tsx
 * <Carousel
 *   autoplayMs={4000}
 *   slides={[<img src="/a.jpg" />, <img src="/b.jpg" />, <img src="/c.jpg" />]}
 * />
 * ```
 */
export function Carousel(props: CarouselProps): JSX.Element {
  const [index, setIndex] = createSignal(0)
  const count = (): number => props.slides.length

  const go = (to: number): void => {
    const n = count()
    if (n === 0) return
    setIndex(((to % n) + n) % n)
  }
  const prev = (): void => go(index() - 1)
  const next = (): void => go(index() + 1)

  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      next()
    }
  }

  // --- drag/touch swipe (engine-free; the track follows the pointer, then the
  // CSS transition snaps to the resolved slide on release) -------------------
  const swipeOn = (): boolean => props.swipe !== false
  let viewport: HTMLDivElement | undefined
  const [dragging, setDragging] = createSignal(false)
  const [dragPx, setDragPx] = createSignal(0)
  let startX = 0

  const onPointerDown = (e: PointerEvent): void => {
    if (!swipeOn() || count() < 2) return
    startX = e.clientX
    setDragging(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent): void => {
    if (dragging()) setDragPx(e.clientX - startX)
  }
  const endDrag = (): void => {
    if (!dragging()) return
    const width = viewport?.clientWidth ?? 1
    const dx = dragPx()
    const threshold = Math.max(48, width * 0.2)
    if (dx <= -threshold) next()
    else if (dx >= threshold) prev()
    setDragPx(0)
    setDragging(false)
  }

  // --- autoplay (paused on hover, skipped under reduced motion) --------------
  const [paused, setPaused] = createSignal(false)
  onMount(() => {
    if (props.autoplayMs === undefined || motionReduced()) return
    const timer = setInterval(() => {
      if (!paused()) next()
    }, props.autoplayMs)
    onCleanup(() => clearInterval(timer))
  })

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      tabindex="0"
      class={cn(
        'flex flex-col gap-3 outline-none focus-visible:ring-2 focus-visible:ring-primary',
        props.class,
      )}
      onKeyDown={onKeyDown}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div
        ref={viewport}
        class="relative overflow-hidden rounded-xl border border-border bg-card text-foreground"
      >
        <div
          class={cn(
            'flex',
            swipeOn() && count() > 1 && 'touch-pan-y cursor-grab active:cursor-grabbing',
            !dragging() && 'transition-transform duration-500 ease-out',
          )}
          style={{ transform: `translateX(calc(-${index() * 100}% + ${dragPx()}px))` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <For each={props.slides}>{(slide) => <div class="w-full shrink-0">{slide}</div>}</For>
        </div>

        <button
          type="button"
          aria-label="Previous slide"
          onClick={prev}
          class="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-opacity hover:opacity-90"
        >
          <ChevronLeft class="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={next}
          class="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-opacity hover:opacity-90"
        >
          <ChevronRight class="h-5 w-5" />
        </button>
      </div>

      <div class="flex items-center justify-center gap-2">
        <For each={props.slides}>
          {(_, i) => (
            <button
              type="button"
              aria-label={`Go to slide ${i() + 1}`}
              onClick={() => go(i())}
              class={cn(
                'h-2 w-2 rounded-full transition-colors',
                index() === i() ? 'bg-primary' : 'bg-muted',
              )}
            />
          )}
        </For>
      </div>
    </div>
  )
}
