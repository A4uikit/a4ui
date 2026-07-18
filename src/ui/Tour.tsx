// Guided product tour / coachmarks. Spotlights one target element at a time by
// drawing a highlight box over its bounding rect and dimming everything else
// with the classic huge-spreading box-shadow trick (a single element casts a
// 9999px shadow over the whole viewport, leaving only the target lit). A tooltip
// Card floats near the target with Back/Next controls. Rendered through a
// `Portal` into the body so it escapes any overflow/stacking context. All DOM
// reads are guarded — a missing target just centers the tooltip and skips the
// highlight.
import type { JSX } from 'solid-js'
import { createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { Portal } from 'solid-js/web'

import { cn } from '../lib/cn'
import { Button } from './Button'

/** A single stop in a {@link Tour}. */
export interface TourStep {
  /** CSS selector for the element to highlight. */
  target: string
  title: string
  description?: string
}

export interface TourProps {
  steps: TourStep[]
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called after the last step's "Done" (in addition to `onOpenChange(false)`). */
  onFinish?: () => void
}

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

/**
 * Guided coachmark tour: walks the user through a sequence of on-page targets,
 * spotlighting each one and explaining it in a floating tooltip. Theme-agnostic —
 * the dimmer uses `--background` so it adapts to light/dark automatically.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = createSignal(false)
 * <Tour
 *   open={open()}
 *   onOpenChange={setOpen}
 *   onFinish={() => markTourSeen()}
 *   steps={[
 *     { target: '#new-btn', title: 'Create', description: 'Start a new record here.' },
 *     { target: '#search', title: 'Search', description: 'Find anything fast.' },
 *   ]}
 * />
 * ```
 */
export function Tour(props: TourProps): JSX.Element {
  const [index, setIndex] = createSignal(0)
  const [rect, setRect] = createSignal<Rect | null>(null)

  const step = () => props.steps[index()]
  const isLast = () => index() >= props.steps.length - 1
  const isFirst = () => index() === 0

  // Reset to the first step every time the tour is (re)opened.
  createEffect(() => {
    if (props.open) setIndex(0)
  })

  const measure = () => {
    const current = step()
    if (!props.open || !current) {
      setRect(null)
      return
    }
    const el = document.querySelector(current.target)
    const box = el?.getBoundingClientRect()
    setRect(box ? { top: box.top, left: box.left, width: box.width, height: box.height } : null)
  }

  // Recompute on step change / open toggle.
  createEffect(() => {
    // Touch reactive deps so this reruns when they change.
    void index()
    void props.open
    measure()
  })

  onMount(() => {
    const onReflow = () => measure()
    window.addEventListener('resize', onReflow)
    window.addEventListener('scroll', onReflow, true)
    onCleanup(() => {
      window.removeEventListener('resize', onReflow)
      window.removeEventListener('scroll', onReflow, true)
    })
  })

  const finish = () => {
    props.onOpenChange(false)
    props.onFinish?.()
  }

  const next = () => {
    if (isLast()) finish()
    else setIndex((i) => i + 1)
  }

  const back = () => {
    if (!isFirst()) setIndex((i) => i - 1)
  }

  // Position the tooltip just below the target (falling back to above if the
  // target sits low in the viewport), or dead-center when there's no target.
  const tooltipStyle = (): JSX.CSSProperties => {
    const box = rect()
    if (!box) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }
    const gap = 12
    const below = box.top + box.height + gap
    const placeBelow = below < window.innerHeight - 160
    return {
      position: 'fixed',
      top: placeBelow ? `${below}px` : `${box.top - gap}px`,
      left: `${Math.max(gap, box.left)}px`,
      transform: placeBelow ? undefined : 'translateY(-100%)',
    }
  }

  return (
    <Show when={props.open && step()}>
      <Portal>
        {/* Spotlight highlight: only rendered when the target was found. The huge
            spreading box-shadow dims the rest of the viewport. */}
        <Show
          when={rect()}
          fallback={
            <div
              class="fixed inset-0 z-[100]"
              style={{ 'background-color': 'hsl(var(--background) / 0.7)' }}
              aria-hidden="true"
            />
          }
        >
          {(box) => (
            <div
              class="pointer-events-none fixed z-[100] rounded-lg ring-2 ring-primary"
              style={{
                top: `${box().top - 4}px`,
                left: `${box().left - 4}px`,
                width: `${box().width + 8}px`,
                height: `${box().height + 8}px`,
                'box-shadow': '0 0 0 9999px hsl(var(--background) / 0.7)',
              }}
              aria-hidden="true"
            />
          )}
        </Show>

        {/* Tooltip card */}
        <div
          role="dialog"
          aria-label={step()?.title}
          class="bg-glass z-[101] max-w-xs rounded-lg border border-border p-4 text-card-foreground shadow-2xl"
          style={tooltipStyle()}
        >
          <p class="font-semibold leading-none tracking-tight">{step()?.title}</p>
          <Show when={step()?.description}>
            <p class="mt-2 text-sm text-muted-foreground">{step()?.description}</p>
          </Show>
          <div class="mt-4 flex items-center justify-between gap-3">
            <span class="text-xs text-muted-foreground tabular-nums">
              {index() + 1} / {props.steps.length}
            </span>
            <div class="flex items-center gap-2">
              <Show when={!isFirst()}>
                <Button variant="ghost" class={cn('px-2.5 py-1.5')} onClick={back}>
                  Back
                </Button>
              </Show>
              <Button class="px-2.5 py-1.5" onClick={next}>
                {isLast() ? 'Done' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  )
}
