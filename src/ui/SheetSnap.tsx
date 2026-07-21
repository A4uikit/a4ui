// Bottom sheet with drag-to-resize snap points (mobile filter/detail panels,
// map bottom sheets). Kobalte's Dialog (used by Drawer/Modal) has no notion of
// intermediate heights, so this rolls its own portal + backdrop + focus/Escape/
// body-scroll-lock (mirroring Drawer.tsx's overlay idiom) and its own raw
// pointerdown/move/up + pointer-capture drag loop (there's no shared drag
// primitive in the repo to reuse). The sheet's height is fixed to the tallest
// snap point; the *visible* portion is controlled by translating it down in
// pixels, snapped to one of `snapPoints` (fractions of `window.innerHeight`).
import { createEffect, createSignal, onCleanup, onMount, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { animate, motionReduced } from '../lib/motion'
import { Portal } from './Portal'

export interface SheetSnapProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Fractions of viewport height, ascending, e.g. `[0.4, 0.9]`. @default [0.5, 0.9] */
  snapPoints?: number[]
  /** Index into `snapPoints` to open at. @default 0 */
  defaultSnap?: number
  children: JSX.Element
  class?: string
}

const DEFAULT_SNAPS = [0.5, 0.9]
const SPRING_STIFFNESS = 380
const SPRING_DAMPING = 38
/** Drag past the lowest snap point by this many px (with no help from velocity) dismisses. */
const DISMISS_DISTANCE_PX = 100
/** px/ms; a flick faster than this biases the resolved snap by one level, or dismisses near the bottom. */
const FLICK_VELOCITY = 0.5

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)

/**
 * A draggable bottom sheet that rests at one of several height "snap points"
 * (fractions of viewport height) instead of just open/closed. Drag the handle
 * to resize with the finger; releasing snaps to the nearest point, biased by
 * flick velocity (a fast swipe jumps a level), and a hard downward flick/drag
 * past the lowest point dismisses. Falls back to an instant show/hide at
 * `defaultSnap` — no drag physics — under reduced motion.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = createSignal(false)
 * <SheetSnap open={open()} onOpenChange={setOpen} snapPoints={[0.4, 0.9]}>
 *   <p>Sheet content…</p>
 * </SheetSnap>
 * ```
 */
export function SheetSnap(props: SheetSnapProps): JSX.Element {
  const snaps = () => (props.snapPoints?.length ? props.snapPoints : DEFAULT_SNAPS)
  const defaultIndex = () => clamp(props.defaultSnap ?? 0, 0, snaps().length - 1)

  const [mounted, setMounted] = createSignal(false)
  const [translateY, setTranslateY] = createSignal(0)

  let previouslyFocused: HTMLElement | null = null
  let previousBodyOverflow = ''

  // Plain (non-reactive) geometry — recomputed on open and on resize, read
  // fresh inside the `translateY()`-dependent style expression below.
  let maxHeightPx = 0
  let translateYs: number[] = []
  let snapIndex = 0

  let controls: ReturnType<typeof animate> | undefined
  let dragging = false
  let dragStartClientY = 0
  let dragStartTranslate = 0
  let lastClientY = 0
  let lastTime = 0
  let velocity = 0 // px/ms, positive = moving down (toward closed)

  const computeGeometry = () => {
    const vh = window.innerHeight
    const pixelHeights = snaps().map((f) => f * vh)
    maxHeightPx = Math.max(...pixelHeights)
    translateYs = pixelHeights.map((h) => maxHeightPx - h)
  }

  const lockScroll = () => {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  const unlockScroll = () => {
    document.body.style.overflow = previousBodyOverflow
  }

  const animateTo = (target: number, onDone?: () => void) => {
    controls?.stop()
    if (motionReduced()) {
      setTranslateY(target)
      onDone?.()
      return
    }
    controls = animate(translateY(), target, {
      type: 'spring',
      stiffness: SPRING_STIFFNESS,
      damping: SPRING_DAMPING,
      onUpdate: (v: number) => setTranslateY(v),
    })
    controls.finished.then(() => onDone?.()).catch(() => {})
  }

  // Mount/unmount + enter/exit animation, driven off the controlled `open` prop.
  createEffect(() => {
    if (props.open) {
      if (mounted()) return
      computeGeometry()
      snapIndex = defaultIndex()
      previouslyFocused = document.activeElement as HTMLElement | null
      setTranslateY(motionReduced() ? translateYs[snapIndex] : maxHeightPx)
      setMounted(true)
      lockScroll()
    } else if (mounted()) {
      animateTo(maxHeightPx, () => {
        setMounted(false)
        unlockScroll()
        previouslyFocused?.focus()
      })
    }
  })

  const resolveDragEnd = () => {
    const current = translateY()
    const mostClosedY = translateYs[0]

    const draggedPastLowest = current - mostClosedY
    const fastDownwardNearBottom =
      velocity > FLICK_VELOCITY && current >= mostClosedY - DISMISS_DISTANCE_PX / 2
    if (draggedPastLowest > DISMISS_DISTANCE_PX || fastDownwardNearBottom) {
      props.onOpenChange(false)
      return
    }

    let nearest = 0
    let bestDist = Infinity
    translateYs.forEach((t, i) => {
      const d = Math.abs(current - t)
      if (d < bestDist) {
        bestDist = d
        nearest = i
      }
    })

    let target = nearest
    if (velocity > FLICK_VELOCITY) target = Math.max(nearest - 1, 0)
    else if (velocity < -FLICK_VELOCITY) target = Math.min(nearest + 1, translateYs.length - 1)

    snapIndex = target
    animateTo(translateYs[target])
  }

  const onHandlePointerDown = (e: PointerEvent) => {
    if (motionReduced()) return
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    controls?.stop()
    dragging = true
    dragStartClientY = e.clientY
    dragStartTranslate = translateY()
    lastClientY = e.clientY
    lastTime = performance.now()
    velocity = 0
  }

  const onHandlePointerMove = (e: PointerEvent) => {
    if (!dragging) return
    const next = Math.max(dragStartTranslate + (e.clientY - dragStartClientY), 0)
    setTranslateY(next)

    const now = performance.now()
    const dt = now - lastTime
    if (dt > 0) velocity = (e.clientY - lastClientY) / dt
    lastClientY = e.clientY
    lastTime = now
  }

  const onHandlePointerUp = (e: PointerEvent) => {
    if (!dragging) return
    dragging = false
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    resolveDragEnd()
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.open) props.onOpenChange(false)
  }
  const onResize = () => {
    if (!mounted()) return
    computeGeometry()
    setTranslateY(translateYs[clamp(snapIndex, 0, translateYs.length - 1)])
  }

  onMount(() => {
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
  })
  onCleanup(() => {
    document.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('resize', onResize)
    controls?.stop()
    if (mounted()) unlockScroll()
  })

  return (
    <Show when={mounted()}>
      <Portal>
        <div
          aria-hidden="true"
          onClick={() => props.onOpenChange(false)}
          class="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-[2px]"
        />
        <div
          ref={(el) => {
            requestAnimationFrame(() => {
              el.focus()
              animateTo(translateYs[snapIndex])
            })
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Bottom sheet"
          tabindex={-1}
          class={cn(
            'fixed inset-x-0 bottom-0 z-[9999] flex flex-col overflow-hidden rounded-t-2xl border border-border bg-glass shadow-2xl outline-none',
            props.class,
          )}
          style={{
            height: `${maxHeightPx}px`,
            transform: `translateY(${translateY()}px)`,
          }}
        >
          <div
            role="button"
            tabindex={0}
            aria-label="Drag handle"
            onPointerDown={onHandlePointerDown}
            onPointerMove={onHandlePointerMove}
            onPointerUp={onHandlePointerUp}
            onPointerCancel={onHandlePointerUp}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault()
                snapIndex = Math.min(snapIndex + 1, translateYs.length - 1)
                animateTo(translateYs[snapIndex])
              } else if (e.key === 'ArrowDown') {
                e.preventDefault()
                snapIndex = Math.max(snapIndex - 1, 0)
                animateTo(translateYs[snapIndex])
              }
            }}
            class="flex shrink-0 touch-none items-center justify-center py-3 outline-none"
          >
            <div class="h-1.5 w-10 rounded-full bg-muted-foreground/40" />
          </div>
          <div class="flex-1 overflow-y-auto overscroll-contain px-4 pb-4">{props.children}</div>
        </div>
      </Portal>
    </Show>
  )
}
