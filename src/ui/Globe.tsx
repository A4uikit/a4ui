// A dotted 3D globe rendered on a single <canvas> with plain Canvas 2D — no
// three.js, no WebGL. The sphere's dots come from a Fibonacci sphere
// (deterministic, evenly distributed — no Math.random so the dot field is
// stable across renders/SSR hydration). Each frame: rotate every point around
// the Y axis, project orthographically (drop z), keep only front-facing
// points (z > 0), and scale alpha/size by depth for a cheap "3D" read.
// Markers/arcs project through the same pipeline so they stay glued to the
// sphere as it spins. Colors are read from the live theme tokens via
// getComputedStyle (canvas can't consume `hsl(var(--x))` directly). Follows
// SpaceBackground's onMount/onCleanup idiom: bind listeners into a cleanups
// array, cancel the rAF, tear everything down on unmount.
import { createEffect, onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface GlobeMarker {
  lat: number
  lng: number
  label?: string
}

export interface GlobeArc {
  /** [lat, lng] */
  from: [number, number]
  /** [lat, lng] */
  to: [number, number]
}

export interface GlobeProps {
  markers?: GlobeMarker[]
  arcs?: GlobeArc[]
  /** Canvas size in CSS px (square). @default 400 */
  size?: number
  /** Spin automatically. @default true (ignored under reduced motion). */
  autoRotate?: boolean
  class?: string
}

interface Vec3 {
  x: number
  y: number
  z: number
}

interface Projected {
  x: number
  y: number
  z: number
  front: boolean
}

const DOT_COUNT = 900
const ROTATE_SPEED = 0.12 // rad/s
const DRAG_SPEED = 0.012 // rad per px of pointer movement

// Fibonacci sphere: evenly-spaced points on a unit sphere, fully deterministic
// (no RNG) so the dot field is stable across renders and reproducible in tests.
function fibonacciSphere(count: number): Vec3[] {
  const points: Vec3[] = []
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2 // 1..-1
    const radius = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = goldenAngle * i
    points.push({ x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius })
  }
  return points
}

const SPHERE_POINTS = fibonacciSphere(DOT_COUNT)

function latLngToVec3(lat: number, lng: number): Vec3 {
  const latRad = (lat * Math.PI) / 180
  const lngRad = (lng * Math.PI) / 180
  return {
    x: Math.cos(latRad) * Math.sin(lngRad),
    y: Math.sin(latRad),
    z: Math.cos(latRad) * Math.cos(lngRad),
  }
}

// Rotate around the Y axis and project orthographically to a `radius`-sized
// disc centered at (cx, cy). z stays in [-1, 1] (front-facing when > 0).
function project(p: Vec3, angle: number, radius: number, cx: number, cy: number): Projected {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const x = p.x * cos + p.z * sin
  const z = -p.x * sin + p.z * cos
  const y = p.y
  return { x: cx + x * radius, y: cy - y * radius, z, front: z > 0 }
}

function resolveColor(canvas: HTMLCanvasElement, token: string, fallback: string): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  return raw ? `hsl(${raw})` : fallback
}

/**
 * A dotted 3D globe drawn on `<canvas>` with plain Canvas 2D (no three.js,
 * no WebGL): dots come from a deterministic Fibonacci-sphere distribution,
 * rotate around the Y axis, and project orthographically with depth-scaled
 * alpha/size. `markers` render as brighter glowing dots (title = label);
 * `arcs` draw as outward-bulging curves between two front-facing markers,
 * with a small traveling highlight. Auto-rotates unless `autoRotate={false}`;
 * drag with the pointer to spin manually. Renders a single static frame
 * under `motionReduced()` (no auto-rotation; drag still works).
 *
 * @example
 * ```tsx
 * <Globe
 *   size={360}
 *   markers={[
 *     { lat: 40.7, lng: -74.0, label: 'New York' },
 *     { lat: 35.7, lng: 139.7, label: 'Tokyo' },
 *   ]}
 *   arcs={[{ from: [40.7, -74.0], to: [35.7, 139.7] }]}
 * />
 * ```
 */
export function Globe(props: GlobeProps): JSX.Element {
  let canvas!: HTMLCanvasElement
  const size = () => props.size ?? 400

  onMount(() => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cleanups: Array<() => void> = []
    const bind = (
      target: EventTarget,
      type: string,
      handler: EventListener,
      opts?: AddEventListenerOptions,
    ) => {
      target.addEventListener(type, handler, opts)
      cleanups.push(() => target.removeEventListener(type, handler, opts))
    }

    let angle = 0
    let dragging = false
    let lastX = 0
    let rafId = 0
    let lastTs = 0
    // Screen-space marker positions from the last draw, for hover hit-testing
    // (cheap: only a handful of markers, refreshed every frame anyway).
    let markerHits: Array<{ x: number; y: number; label: string }> = []

    const draw = (): void => {
      const dpr = window.devicePixelRatio || 1
      const cssSize = size()
      const radius = cssSize * 0.42
      const cx = cssSize / 2
      const cy = cssSize / 2

      if (canvas.width !== cssSize * dpr || canvas.height !== cssSize * dpr) {
        canvas.width = cssSize * dpr
        canvas.height = cssSize * dpr
        canvas.style.width = `${cssSize}px`
        canvas.style.height = `${cssSize}px`
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, cssSize, cssSize)

      const dotColor = resolveColor(canvas, '--foreground', '210 20% 90%')
      const markerColor = resolveColor(canvas, '--accent', '200 90% 60%')
      const arcColor = resolveColor(canvas, '--primary', '250 80% 65%')

      // Base sphere dots, back-to-front isn't needed (no overlap testing) —
      // just skip anything facing away from the viewer.
      for (const p of SPHERE_POINTS) {
        const proj = project(p, angle, radius, cx, cy)
        if (!proj.front) continue
        const depth = proj.z // 0..1
        ctx.beginPath()
        ctx.fillStyle = dotColor
        ctx.globalAlpha = 0.15 + depth * 0.55
        ctx.arc(proj.x, proj.y, 0.6 + depth * 1.2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // Arcs: only drawn when both endpoints are currently front-facing.
      const arcs = props.arcs ?? []
      for (const arc of arcs) {
        const from = project(latLngToVec3(arc.from[0], arc.from[1]), angle, radius, cx, cy)
        const to = project(latLngToVec3(arc.to[0], arc.to[1]), angle, radius, cx, cy)
        if (!from.front || !to.front) continue

        const mx = (from.x + to.x) / 2
        const my = (from.y + to.y) / 2
        // Bulge outward from the sphere center, proportional to the chord length.
        const dx = mx - cx
        const dy = my - cy
        const dist = Math.hypot(dx, dy) || 1
        const chord = Math.hypot(to.x - from.x, to.y - from.y)
        const bulge = chord * 0.35
        const ctrlX = mx + (dx / dist) * bulge
        const ctrlY = my + (dy / dist) * bulge

        ctx.beginPath()
        ctx.strokeStyle = arcColor
        ctx.globalAlpha = 0.55
        ctx.lineWidth = 1.4
        ctx.moveTo(from.x, from.y)
        ctx.quadraticCurveTo(ctrlX, ctrlY, to.x, to.y)
        ctx.stroke()
        ctx.globalAlpha = 1

        // Traveling highlight: a bright dot eased along the same quadratic,
        // looping with the wall clock so it doesn't need its own rAF state.
        if (!motionReduced()) {
          const t = (performance.now() / 1600) % 1
          const it = 1 - t
          const hx = it * it * from.x + 2 * it * t * ctrlX + t * t * to.x
          const hy = it * it * from.y + 2 * it * t * ctrlY + t * t * to.y
          ctx.beginPath()
          ctx.fillStyle = markerColor
          ctx.arc(hx, hy, 2.4, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Markers: brighter glowing dots, only when front-facing.
      const markers = props.markers ?? []
      const hits: typeof markerHits = []
      for (const marker of markers) {
        const proj = project(latLngToVec3(marker.lat, marker.lng), angle, radius, cx, cy)
        if (!proj.front) continue
        ctx.beginPath()
        ctx.fillStyle = markerColor
        ctx.shadowColor = markerColor
        ctx.shadowBlur = 8
        ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        if (marker.label) hits.push({ x: proj.x, y: proj.y, label: marker.label })
      }
      markerHits = hits
    }

    const tick = (ts: number): void => {
      const dt = lastTs ? (ts - lastTs) / 1000 : 0
      lastTs = ts
      if (!dragging && !motionReduced() && props.autoRotate !== false) {
        angle += ROTATE_SPEED * dt
      }
      draw()
      // Keep animating while auto-rotating, or to refresh the traveling arc
      // highlight — both are no-ops under reduced motion (frozen frame).
      if (!motionReduced()) rafId = requestAnimationFrame(tick)
    }

    if (motionReduced()) {
      draw() // single static frame
    } else {
      rafId = requestAnimationFrame(tick)
    }

    // Pointer drag to spin manually — works even under reduced motion.
    const onPointerDown = (e: PointerEvent): void => {
      dragging = true
      lastX = e.clientX
      canvas.setPointerCapture(e.pointerId)
    }
    const onPointerMove = (e: PointerEvent): void => {
      if (!dragging) {
        // Hover hit-test against the last drawn marker positions → native tooltip.
        const rect = canvas.getBoundingClientRect()
        const px = e.clientX - rect.left
        const py = e.clientY - rect.top
        const hit = markerHits.find((m) => Math.hypot(m.x - px, m.y - py) <= 6)
        canvas.title = hit?.label ?? ''
        return
      }
      const dx = e.clientX - lastX
      lastX = e.clientX
      angle += dx * DRAG_SPEED
      if (motionReduced()) draw() // rAF loop is off; redraw explicitly per move
    }
    const onPointerUp = (e: PointerEvent): void => {
      dragging = false
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId)
    }
    bind(canvas, 'pointerdown', onPointerDown as EventListener)
    bind(canvas, 'pointermove', onPointerMove as EventListener)
    bind(canvas, 'pointerup', onPointerUp as EventListener)
    bind(canvas, 'pointercancel', onPointerUp as EventListener)

    // Re-render (static frame) if props change while reduced motion holds the
    // loop frozen — otherwise the rAF loop already picks up prop changes.
    createEffect(() => {
      // Track reactive deps: size + reference identity of markers/arcs.
      void size()
      void props.markers
      void props.arcs
      void props.autoRotate
      if (motionReduced()) draw()
    })

    onCleanup(() => {
      if (rafId) cancelAnimationFrame(rafId)
      cleanups.forEach((fn) => fn())
    })
  })

  return (
    <canvas
      ref={canvas}
      class={cn('touch-none rounded-full select-none', props.class)}
      width={size()}
      height={size()}
      role="img"
      aria-label="Interactive globe"
    />
  )
}
