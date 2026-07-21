// Carousel3D — a 3D coverflow/arc carousel. A `perspective` + `preserve-3d`
// stage holds absolutely-positioned slides that are repositioned ONLY via
// `transform` (translate/rotateY/scale) + `opacity` — never width/height/
// top/left — so every pose change stays compositor-only. Transform changes
// are driven by a Motion spring when the active slide changes. Falls back to
// a flat opacity crossfade (no 3D) under reduced motion.
import { ChevronLeft, ChevronRight } from 'lucide-solid'
import { createEffect, createMemo, createSignal, For, on, onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { animate, motionReduced } from '../lib/motion'

/** Layout curve for a {@link Carousel3D}. Defaults to `'coverflow'`. */
export type Carousel3DVariant = 'coverflow' | 'arc'

export interface Carousel3DProps {
  /** Slides shown around the active one, arranged by distance from it. */
  slides: JSX.Element[]
  /** Layout curve. @default 'coverflow' */
  variant?: Carousel3DVariant
  /** Controlled active index. */
  active?: number
  /** Initial active index when uncontrolled. @default 0 */
  defaultActive?: number
  /** Fires with the new index whenever the active slide changes. */
  onChange?: (index: number) => void
  class?: string
}

interface SlidePose {
  x: number
  y: number
  z: number
  rotateY: number
  scale: number
  opacity: number
}

// Base position (before the per-offset pose) centers each slide in the stage;
// the transform's x always starts at `-50%` and adds pixel offsets on top.
const FLAT_TRANSFORM = 'translate3d(-50%, 0, 0)'

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value))

function coverflowPose(offset: number): SlidePose {
  const spacing = 130
  const depth = 160
  const angle = 55
  return {
    x: offset * spacing,
    y: 0,
    z: -Math.abs(offset) * depth,
    rotateY: clamp(-offset * angle, -45, 45),
    scale: offset === 0 ? 1 : 0.82,
    opacity: clamp(1 - Math.abs(offset) * 0.35, 0, 1),
  }
}

function arcPose(offset: number): SlidePose {
  const spacing = 110
  const angle = 14
  const dip = 16
  return {
    x: offset * spacing,
    y: offset ** 2 * dip,
    z: -Math.abs(offset) * 70,
    rotateY: clamp(offset * angle, -50, 50),
    scale: clamp(1 - Math.abs(offset) * 0.16, 0.55, 1),
    opacity: clamp(1 - Math.abs(offset) * 0.3, 0, 1),
  }
}

function poseFor(variant: Carousel3DVariant, offset: number): SlidePose {
  return variant === 'arc' ? arcPose(offset) : coverflowPose(offset)
}

function poseTransform(pose: SlidePose): string {
  return `translate3d(calc(-50% + ${pose.x}px), ${pose.y}px, ${pose.z}px) rotateY(${pose.rotateY}deg) scale(${pose.scale})`
}

/**
 * A 3D carousel that arranges slides around the active one on a coverflow or
 * shallow arc curve — `perspective` + `preserve-3d`, each slide positioned
 * purely by `transform`/`opacity` (Motion spring) so it stays
 * compositor-only. Supports controlled/uncontrolled `active`, prev/next
 * buttons, dot indicators, arrow-key navigation, and pointer-drag swiping.
 * Falls back to a flat opacity crossfade (no 3D transforms) under reduced
 * motion.
 *
 * @example
 * ```tsx
 * <Carousel3D
 *   variant="coverflow"
 *   slides={[
 *     <div class="grid h-full place-items-center rounded-xl border border-border bg-card p-6 text-center">Trail A — Ridge Loop</div>,
 *     <div class="grid h-full place-items-center rounded-xl border border-border bg-card p-6 text-center">Trail B — Falls Overlook</div>,
 *     <div class="grid h-full place-items-center rounded-xl border border-border bg-card p-6 text-center">Trail C — Summit Pass</div>,
 *   ]}
 * />
 * ```
 */
export function Carousel3D(props: Carousel3DProps): JSX.Element {
  const [uncontrolled, setUncontrolled] = createSignal(props.defaultActive ?? 0)
  const count = (): number => props.slides.length
  const clampIndex = (i: number): number => clamp(i, 0, Math.max(0, count() - 1))
  const isControlled = (): boolean => props.active !== undefined
  const active = createMemo((): number =>
    clampIndex(isControlled() ? (props.active as number) : uncontrolled()),
  )
  const variant = (): Carousel3DVariant => props.variant ?? 'coverflow'

  const setActive = (index: number): void => {
    const next = clampIndex(index)
    if (next === active()) return
    if (!isControlled()) setUncontrolled(next)
    props.onChange?.(next)
  }
  const prev = (): void => setActive(active() - 1)
  const next = (): void => setActive(active() + 1)

  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      next()
    }
  }

  // --- pose application (static snap on mount, Motion spring on change) ----
  let stage: HTMLDivElement | undefined
  const controls = new Map<number, ReturnType<typeof animate>>()

  const stopAll = (): void => {
    controls.forEach((c) => c.stop())
    controls.clear()
  }

  const items = (): HTMLElement[] =>
    stage ? Array.from(stage.querySelectorAll<HTMLElement>('[data-carousel3d-item]')) : []

  function applyStatic(): void {
    const a = active()
    const v = variant()
    const reduced = motionReduced()
    items().forEach((el, i) => {
      el.style.zIndex = String(-Math.abs(i - a))
      if (reduced) {
        el.style.transform = FLAT_TRANSFORM
        el.style.opacity = i === a ? '1' : '0'
        return
      }
      const pose = poseFor(v, i - a)
      el.style.transform = poseTransform(pose)
      el.style.opacity = String(pose.opacity)
    })
  }

  function applyAnimated(): void {
    if (!stage) return
    const a = active()
    const v = variant()
    const reduced = motionReduced()
    stopAll()
    items().forEach((el, i) => {
      el.style.zIndex = String(-Math.abs(i - a))
      if (reduced) {
        el.style.transform = FLAT_TRANSFORM
        controls.set(i, animate(el, { opacity: i === a ? 1 : 0 }, { duration: 0.25, ease: 'easeOut' }))
        return
      }
      const pose = poseFor(v, i - a)
      controls.set(
        i,
        animate(
          el,
          {
            x: pose.x,
            y: pose.y,
            z: pose.z,
            rotateY: pose.rotateY,
            scale: pose.scale,
            opacity: pose.opacity,
          },
          { type: 'spring', stiffness: 300, damping: 32 },
        ),
      )
    })
  }

  onMount(applyStatic)

  // Re-pose (animated) whenever the active slide, variant, slide count, or
  // reduced-motion state changes. `defer: true` skips the initial run — the
  // onMount `applyStatic` above already seeds the correct pose with no
  // animation, so a slide never flashes in from an untransformed position.
  createEffect(on([active, variant, count, motionReduced], () => applyAnimated(), { defer: true }))

  onCleanup(stopAll)

  // --- pointer drag: horizontal movement past a threshold advances one slide
  // per threshold crossed, so a long drag can page through several slides. --
  // Capture is DEFERRED until the pointer actually moves past a small
  // threshold. Capturing on pointerdown (the old behaviour) retargeted the
  // pointer to the stage and swallowed the `click` on the chevron buttons and
  // any interactive slide content. A plain click no longer starts a drag, so
  // those clicks work again.
  let startX = 0
  let pointerId: number | null = null
  let captured = false
  const CAPTURE_THRESHOLD = 8
  const DRAG_THRESHOLD = 60

  const onPointerDown = (e: PointerEvent): void => {
    if (count() < 2) return
    startX = e.clientX
    pointerId = e.pointerId
    captured = false
  }
  const onPointerMove = (e: PointerEvent): void => {
    if (pointerId === null) return
    const dx = e.clientX - startX
    if (!captured) {
      if (Math.abs(dx) < CAPTURE_THRESHOLD) return
      captured = true
      ;(e.currentTarget as HTMLElement).setPointerCapture(pointerId)
    }
    if (dx <= -DRAG_THRESHOLD) {
      next()
      startX = e.clientX
    } else if (dx >= DRAG_THRESHOLD) {
      prev()
      startX = e.clientX
    }
  }
  const endDrag = (e: PointerEvent): void => {
    if (pointerId !== null && captured) {
      try {
        ;(e.currentTarget as HTMLElement).releasePointerCapture(pointerId)
      } catch {
        /* already released */
      }
    }
    pointerId = null
    captured = false
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      tabindex="0"
      class={cn(
        'flex w-full flex-col gap-4 outline-none focus-visible:ring-2 focus-visible:ring-primary',
        props.class,
      )}
      onKeyDown={onKeyDown}
    >
      <div
        class={cn(
          'relative h-80 select-none',
          count() > 1 && 'touch-pan-y cursor-grab active:cursor-grabbing',
        )}
        style={{ perspective: '1200px' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div ref={stage} class="relative h-full w-full" style={{ 'transform-style': 'preserve-3d' }}>
          <For each={props.slides}>
            {(slide, i) => (
              <div
                data-carousel3d-item
                class="absolute left-1/2 top-0 h-full w-64 will-change-transform"
                aria-hidden={i() !== active()}
              >
                {slide}
              </div>
            )}
          </For>
        </div>

        <button
          type="button"
          aria-label="Previous slide"
          disabled={count() === 0 || active() === 0}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={prev}
          class="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft class="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          disabled={count() === 0 || active() === count() - 1}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={next}
          class="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight class="h-5 w-5" />
        </button>
      </div>

      <div class="flex items-center justify-center gap-1">
        <For each={props.slides}>
          {(_, i) => (
            // 24×24 hit target (a11y target-size) around a small visual dot.
            <button
              type="button"
              aria-label={`Go to slide ${i() + 1}`}
              aria-current={active() === i() ? 'true' : undefined}
              onClick={() => setActive(i())}
              class="grid h-6 w-6 place-items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                class={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  active() === i() ? 'bg-primary' : 'bg-muted',
                )}
              />
            </button>
          )}
        </For>
      </div>
    </div>
  )
}
