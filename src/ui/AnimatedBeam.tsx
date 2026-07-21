// AnimatedBeam — an absolutely-positioned SVG overlay that draws a curved
// line between two elements (`fromRef` → `toRef`) inside a positioned
// `containerRef`, with a faint static stroke under a traveling
// primary→accent gradient segment that loops along the path. Path geometry
// is recomputed on mount, on window resize, and via a ResizeObserver on the
// container. No travel (static stroke only) under reduced motion.
import { createEffect, createSignal, createUniqueId, onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { animate, motionReduced } from '../lib/motion'

export interface AnimatedBeamProps {
  containerRef: HTMLElement | undefined
  fromRef: HTMLElement | undefined
  toRef: HTMLElement | undefined
  /** Px the curve bows away from a straight line. @default 0 (straight) */
  curvature?: number
  /** Travel from `toRef` to `fromRef` instead of the default direction. */
  reverse?: boolean
  /** Seconds for one travel of the gradient segment. @default 3 */
  duration?: number
  class?: string
}

interface Point {
  x: number
  y: number
}

/**
 * Renders an animated SVG "beam" connecting two elements: a faint static
 * base stroke under a traveling gradient segment that loops from `fromRef`
 * to `toRef` (or the reverse, with `reverse`). Absolutely positioned over
 * `containerRef`, whose bounds establish the coordinate space both
 * endpoints are measured against. Static (no travel) under reduced motion.
 *
 * @example
 * ```tsx
 * let container: HTMLDivElement | undefined
 * let fromEl: HTMLDivElement | undefined
 * let toEl: HTMLDivElement | undefined
 *
 * <div ref={container} class="relative flex items-center justify-between p-8">
 *   <div ref={fromEl} class="size-10 rounded-full bg-card" />
 *   <div ref={toEl} class="size-10 rounded-full bg-card" />
 *   <AnimatedBeam containerRef={container} fromRef={fromEl} toRef={toEl} curvature={40} />
 * </div>
 * ```
 */
export function AnimatedBeam(props: AnimatedBeamProps): JSX.Element {
  const [pathD, setPathD] = createSignal('')
  const [size, setSize] = createSignal({ w: 0, h: 0 })
  const gradientId = `beam-gradient-${createUniqueId()}`

  let gradientEl: SVGLinearGradientElement | undefined
  let start: Point = { x: 0, y: 0 }
  let end: Point = { x: 0, y: 0 }
  let control: Point = { x: 0, y: 0 }

  const recompute = (): void => {
    const container = props.containerRef
    const from = props.fromRef
    const to = props.toRef
    if (!container || !from || !to) return

    const containerRect = container.getBoundingClientRect()
    const fromRect = from.getBoundingClientRect()
    const toRect = to.getBoundingClientRect()

    start = {
      x: fromRect.left - containerRect.left + fromRect.width / 2,
      y: fromRect.top - containerRect.top + fromRect.height / 2,
    }
    end = {
      x: toRect.left - containerRect.left + toRect.width / 2,
      y: toRect.top - containerRect.top + toRect.height / 2,
    }

    const curvature = props.curvature ?? 0
    const mx = (start.x + end.x) / 2
    const my = (start.y + end.y) / 2
    const dx = end.x - start.x
    const dy = end.y - start.y
    const length = Math.hypot(dx, dy) || 1
    control = {
      x: mx + (-dy / length) * curvature,
      y: my + (dx / length) * curvature,
    }

    setSize({ w: containerRect.width, h: containerRect.height })
    setPathD(`M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`)
  }

  /** Point at parameter `t` (0..1) along the quadratic curve. */
  const pointAt = (t: number): Point => {
    const it = 1 - t
    return {
      x: it * it * start.x + 2 * it * t * control.x + t * t * end.x,
      y: it * it * start.y + 2 * it * t * control.y + t * t * end.y,
    }
  }

  createEffect(() => {
    // Track the refs reactively — recompute picks up the initial mount and
    // any later change (e.g. a ref that resolves after this beam mounts).
    void props.containerRef
    void props.fromRef
    void props.toRef
    recompute()
  })

  onMount(() => {
    const handleResize = (): void => recompute()
    window.addEventListener('resize', handleResize)

    let resizeObserver: ResizeObserver | undefined
    if (props.containerRef && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => recompute())
      resizeObserver.observe(props.containerRef)
    }

    let controls: ReturnType<typeof animate> | undefined
    if (!motionReduced()) {
      const segment = 0.2
      controls = animate(0, 1, {
        duration: props.duration ?? 3,
        repeat: Infinity,
        ease: 'linear',
        onUpdate: (p: number) => {
          const t = props.reverse ? 1 - p : p
          const lead = props.reverse ? Math.min(1, t + segment) : t
          const trail = props.reverse ? t : Math.max(0, t - segment)
          const from = pointAt(trail)
          const to = pointAt(lead)
          gradientEl?.setAttribute('x1', String(from.x))
          gradientEl?.setAttribute('y1', String(from.y))
          gradientEl?.setAttribute('x2', String(to.x))
          gradientEl?.setAttribute('y2', String(to.y))
        },
      })
    }

    onCleanup(() => {
      window.removeEventListener('resize', handleResize)
      resizeObserver?.disconnect()
      controls?.stop()
    })
  })

  return (
    <svg
      aria-hidden="true"
      class={cn('pointer-events-none absolute inset-0', props.class)}
      width={size().w}
      height={size().h}
      viewBox={`0 0 ${size().w} ${size().h}`}
      fill="none"
    >
      <path d={pathD()} stroke="hsl(var(--border))" stroke-width="2" stroke-opacity="0.4" fill="none" />
      {!motionReduced() && (
        <>
          <defs>
            <linearGradient
              ref={(el) => {
                gradientEl = el
              }}
              id={gradientId}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stop-color="hsl(var(--primary))" stop-opacity="0" />
              <stop offset="50%" stop-color="hsl(var(--primary))" />
              <stop offset="50%" stop-color="hsl(var(--accent))" />
              <stop offset="100%" stop-color="hsl(var(--accent))" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path
            d={pathD()}
            stroke={`url(#${gradientId})`}
            stroke-width="2"
            stroke-linecap="round"
            fill="none"
          />
        </>
      )}
    </svg>
  )
}
