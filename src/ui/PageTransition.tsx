// Keyed cross-fade / slide transition for route or view swaps: change `key`
// and the outgoing content fades (and optionally slides) out, then the new
// `children` fades in. Driven purely by the `key` prop — no routing library
// involved. Uses Motion's `animate` (opacity + `y`, transform/opacity only)
// like `animateIn` in lib/motion.ts, and swaps instantly under reduced motion.
import { createEffect, createSignal, onCleanup, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { animate, motionReduced } from '../lib/motion'

/** Transition style for {@link PageTransition}. `slide` adds a small vertical shift. */
export type PageTransitionMode = 'fade' | 'slide'

export interface PageTransitionProps {
  /** Change this value (e.g. a route or view id) to trigger a transition. */
  key: string | number
  children: JSX.Element
  /** `fade` = opacity only; `slide` = opacity + small vertical shift. @default 'fade' */
  mode?: PageTransitionMode
  class?: string
}

const SLIDE_Y = 12
const OUT_DURATION = 0.16
const IN_DURATION = 0.22

/**
 * Cross-fades (or slides) its `children` out and in whenever `key` changes —
 * for route/view transitions. Driven purely by the `key` prop; pair it with a
 * router's current path or any view-switch signal. Swaps instantly under
 * reduced motion.
 *
 * @example
 * ```tsx
 * <PageTransition key={activeTab()} mode="slide">
 *   <TabContent id={activeTab()} />
 * </PageTransition>
 * ```
 */
export function PageTransition(props: PageTransitionProps): JSX.Element {
  const [content, setContent] = createSignal(props.children)
  let wrapEl: HTMLDivElement | undefined
  let controls: ReturnType<typeof animate> | undefined
  let previousKey = props.key
  let mounted = false

  createEffect(() => {
    const nextKey = props.key
    const nextChildren = props.children

    if (!mounted) {
      mounted = true
      previousKey = nextKey
      return
    }

    if (nextKey === previousKey) {
      // Children changed without a key change: sync in place, no transition.
      setContent(() => nextChildren)
      return
    }
    previousKey = nextKey

    const el = wrapEl
    const y = (props.mode ?? 'fade') === 'slide' ? SLIDE_Y : 0

    controls?.stop()

    if (!el || motionReduced()) {
      setContent(() => nextChildren)
      return
    }

    controls = animate(el, { opacity: [1, 0], y: [0, -y] }, { duration: OUT_DURATION, ease: 'easeIn' })
    controls.finished
      .then(() => {
        setContent(() => nextChildren)
        controls = animate(el, { opacity: [0, 1], y: [y, 0] }, { duration: IN_DURATION, ease: 'easeOut' })
      })
      .catch(() => {})
  })

  onCleanup(() => controls?.stop())

  return (
    <div ref={wrapEl} class={cn(props.class)}>
      {content()}
    </div>
  )
}
