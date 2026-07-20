// StickyReveal — a tall scroll region whose inner content pins in place
// (`position: sticky`) while a subtle fade/rise reveal plays as the section
// scrolls through the viewport. Built for a pinned hero/feature moment, not
// for scrollytelling with multiple discrete steps (see ScrollProgress-style
// primitives for that). Listener is bound in onMount (client-only, SSR-safe)
// and rAF-throttled; skipped entirely under reduced motion.
import type { JSX } from 'solid-js'
import { createSignal, onCleanup, onMount } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface StickyRevealProps {
  children: JSX.Element
  /** Total scroll distance of the section (the taller it is, the longer the pin). CSS length, e.g. '200vh'. @default '180vh' */
  height?: string
  class?: string
}

// Reveal ramps in over the first 40% of scroll progress through the section,
// then holds fully visible, then fades back out over the last 15% so the
// content doesn't just vanish when the pin releases.
const REVEAL_END = 0.4
const FADE_OUT_START = 0.85

/**
 * A pinned hero/feature section: the outer element reserves `height` of
 * scroll distance while the inner content sticks to the viewport and fades +
 * rises in as the user scrolls through it. Needs real scroll room above/below
 * to see the effect — drop it inside a page with enough surrounding content
 * (or bump `height`) rather than in a short isolated container.
 *
 * @example
 * ```tsx
 * <StickyReveal height="200vh">
 *   <Card class="p-10 text-center">
 *     <h2 class="text-3xl font-bold">Pinned moment</h2>
 *   </Card>
 * </StickyReveal>
 * ```
 */
export function StickyReveal(props: StickyRevealProps): JSX.Element {
  const reduced = motionReduced()
  const [progress, setProgress] = createSignal(reduced ? 1 : 0)

  let outerEl: HTMLDivElement | undefined
  let rafId: number | null = null

  const measure = () => {
    rafId = null
    if (!outerEl) return
    const rect = outerEl.getBoundingClientRect()
    const viewportH = window.innerHeight || 1
    const total = rect.height - viewportH
    if (total <= 0) {
      setProgress(1)
      return
    }
    const raw = -rect.top / total
    setProgress(Math.min(1, Math.max(0, raw)))
  }

  const onScroll = () => {
    if (rafId !== null) return
    rafId = requestAnimationFrame(measure)
  }

  onMount(() => {
    if (reduced) return
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    onCleanup(() => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    })
  })

  const visibility = () => {
    const p = progress()
    const rampIn = Math.min(1, p / REVEAL_END)
    const rampOut = p <= FADE_OUT_START ? 1 : Math.max(0, 1 - (p - FADE_OUT_START) / (1 - FADE_OUT_START))
    return Math.min(rampIn, rampOut)
  }

  const innerStyle = (): JSX.CSSProperties => {
    if (reduced) return { opacity: 1, transform: 'none' }
    const v = visibility()
    return {
      opacity: v,
      transform: `translateY(${(1 - v) * 24}px)`,
    }
  }

  return (
    <div ref={outerEl} class={cn('relative', props.class)} style={{ height: props.height ?? '180vh' }}>
      <div class="sticky top-0 flex h-screen items-center justify-center">
        <div style={innerStyle()}>{props.children}</div>
      </div>
    </div>
  )
}
