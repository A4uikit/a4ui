// TimeMachineStack — Apple-style "time machine" depth stack: the active slide
// sits full-size at the front while the rest recede into the screen behind it
// (translated up, pushed back on Z, scaled down, dimmed), with a vertical
// scrubber of real buttons to jump to any index. Only `transform`/`opacity`
// are animated (Motion spring), so the stack stays compositor-only. Reduced
// motion collapses to a flat view of just the active slide.
import { createEffect, createSignal, For, onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { animate, motionReduced } from '../lib/motion'

// Depth-stack geometry, per unit of depth (slides behind the active one).
const DY = 26 // px recede upward per depth step
const DZ = 64 // px pushed back on z per depth step
const SCALE_STEP = 0.08
const MIN_SCALE = 0.7
const OPACITY_STEP = 0.18

export interface TimeMachineStackProps {
  /** Slide contents, one per stack position. */
  slides: JSX.Element[]
  /** Controlled active index. Omit to manage it internally. */
  active?: number
  /** Initial active index when uncontrolled. @default 0 */
  defaultActive?: number
  /** Fired whenever the active index changes, via click or keyboard. */
  onChange?: (index: number) => void
  class?: string
}

interface DepthTransform {
  y: number
  z: number
  scale: number
  opacity: number
  zIndex: number
  pointerEvents: 'auto' | 'none'
}

// depth = index - active. depth 0 is the active (front) slide; depth > 0
// slides recede behind it. depth < 0 are already-viewed slides — they fly
// forward, out of the stack, and vanish rather than reversing the recede math.
function depthTransform(index: number, active: number): DepthTransform {
  const depth = index - active
  if (depth >= 0) {
    return {
      y: -depth * DY,
      z: -depth * DZ,
      scale: Math.max(1 - depth * SCALE_STEP, MIN_SCALE),
      opacity: Math.max(1 - depth * OPACITY_STEP, 0),
      zIndex: -depth,
      pointerEvents: depth === 0 ? 'auto' : 'none',
    }
  }
  return { y: DY, z: DZ * 0.5, scale: 1.05, opacity: 0, zIndex: -depth, pointerEvents: 'none' }
}

/**
 * Apple-style "time machine" depth stack: the active slide is front and
 * full-size, and the rest recede into the screen behind it — each further
 * slide translated up, pushed back on Z, scaled down, and dimmed. A vertical
 * scrubber of real buttons (one per slide), pinned to the right edge, jumps
 * to any index; the stage handles ArrowUp/ArrowDown (and Left/Right) when
 * focused. Animates only `transform`/`opacity` (Motion spring); reduced
 * motion collapses to a flat view of just the active slide.
 *
 * @example
 * ```tsx
 * <TimeMachineStack
 *   defaultActive={0}
 *   slides={[
 *     <div class="flex h-full items-center justify-center p-6">Sunset over the bay</div>,
 *     <div class="flex h-full items-center justify-center p-6">Empty beach at dawn</div>,
 *     <div class="flex h-full items-center justify-center p-6">Fog through the pines</div>,
 *   ]}
 * />
 * ```
 */
export function TimeMachineStack(props: TimeMachineStackProps): JSX.Element {
  const [internalActive, setInternalActive] = createSignal(props.defaultActive ?? 0)
  const active = () => props.active ?? internalActive()

  const goTo = (index: number): void => {
    const clamped = Math.max(0, Math.min(props.slides.length - 1, index))
    if (props.active === undefined) setInternalActive(clamped)
    props.onChange?.(clamped)
  }

  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      goTo(active() + 1)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      goTo(active() - 1)
    }
  }

  const slideEls = new Map<number, HTMLElement>()
  const controls = new Map<number, ReturnType<typeof animate>>()

  const applyTransform = (index: number, animated: boolean): void => {
    const el = slideEls.get(index)
    if (!el) return

    if (motionReduced()) {
      // Flat: only the active slide is visible, no depth, no animation.
      const isActive = index === active()
      controls.get(index)?.stop()
      el.style.transform = 'none'
      el.style.opacity = isActive ? '1' : '0'
      el.style.zIndex = isActive ? '1' : '0'
      el.style.pointerEvents = isActive ? 'auto' : 'none'
      return
    }

    const t = depthTransform(index, active())
    el.style.zIndex = String(t.zIndex)
    el.style.pointerEvents = t.pointerEvents

    if (!animated) {
      el.style.transform = `translateY(${t.y}px) translateZ(${t.z}px) scale(${t.scale})`
      el.style.opacity = String(t.opacity)
      return
    }

    controls.get(index)?.stop()
    const anim = animate(
      el,
      { y: t.y, z: t.z, scale: t.scale, opacity: t.opacity },
      { type: 'spring', stiffness: 300, damping: 32 },
    )
    controls.set(index, anim)
  }

  const syncAll = (animated: boolean): void => {
    props.slides.forEach((_, index) => applyTransform(index, animated))
  }

  onMount(() => syncAll(false))
  createEffect(() => {
    active() // track active-index changes (controlled or internal)
    syncAll(true)
  })
  onCleanup(() => controls.forEach((c) => c.stop()))

  return (
    <div class={cn('relative flex h-80 w-full gap-4', props.class)}>
      <div
        role="group"
        aria-roledescription="time machine stack"
        tabindex="0"
        class="relative min-w-0 flex-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ perspective: '1200px' }}
        onKeyDown={onKeyDown}
      >
        <div class="relative h-full w-full" style={{ 'transform-style': 'preserve-3d' }}>
          <For each={props.slides}>
            {(slide, index) => (
              <div
                ref={(el) => {
                  slideEls.set(index(), el)
                  onCleanup(() => slideEls.delete(index()))
                }}
                aria-hidden={index() !== active()}
                class="absolute inset-0 origin-bottom overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-lg will-change-transform"
              >
                {slide}
              </div>
            )}
          </For>
        </div>
      </div>

      <div
        role="group"
        aria-label="Jump to slide"
        class="flex shrink-0 flex-col items-end justify-center gap-1.5"
      >
        <For each={props.slides}>
          {(_, index) => (
            <button
              type="button"
              aria-label={`Slide ${index() + 1} of ${props.slides.length}`}
              aria-current={index() === active() ? 'true' : undefined}
              onClick={() => goTo(index())}
              class={cn(
                'h-1.5 w-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                index() === active() ? 'bg-primary' : 'bg-muted hover:bg-muted-foreground/40',
              )}
            />
          )}
        </For>
      </div>
    </div>
  )
}
