// WorldMap — a lightweight, self-contained SVG "map": a dotted-grid backdrop
// (no coastlines, no geojson/asset) with connection arcs projected from
// lat/lng via simple equirectangular mapping. Each arc bulges upward and
// carries a traveling primary→accent gradient segment, reusing
// AnimatedBeam's "moving gradient stops along a quadratic curve" technique.
// Arcs render static (no travel) under reduced motion.
import { createUniqueId, For, onCleanup, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { animate, motionReduced } from '../lib/motion'

export interface WorldMapPoint {
  lat: number
  lng: number
  label?: string
}

export interface WorldMapConnection {
  from: WorldMapPoint
  to: WorldMapPoint
}

export interface WorldMapProps {
  /** Arcs to draw between projected points. @default [] */
  connections?: WorldMapConnection[]
  class?: string
}

const WIDTH = 800
const HEIGHT = 400
/** Px spacing between backdrop grid dots. */
const GRID_GAP = 16

interface Point {
  x: number
  y: number
}

/** Equirectangular projection: lat/lng -> SVG coordinates in the WIDTH x HEIGHT viewBox. */
function project(point: WorldMapPoint): Point {
  return {
    x: ((point.lng + 180) / 360) * WIDTH,
    y: ((90 - point.lat) / 180) * HEIGHT,
  }
}

/** Point at parameter `t` (0..1) along a quadratic Bezier curve. */
function pointAt(start: Point, control: Point, end: Point, t: number): Point {
  const it = 1 - t
  return {
    x: it * it * start.x + 2 * it * t * control.x + t * t * end.x,
    y: it * it * start.y + 2 * it * t * control.y + t * t * end.y,
  }
}

/** Centers of an evenly spaced dot grid covering the WIDTH x HEIGHT viewBox. */
function gridDots(): Point[] {
  const dots: Point[] = []
  for (let y = GRID_GAP / 2; y < HEIGHT; y += GRID_GAP) {
    for (let x = GRID_GAP / 2; x < WIDTH; x += GRID_GAP) {
      dots.push({ x, y })
    }
  }
  return dots
}

interface ConnectionArcProps {
  connection: WorldMapConnection
}

/** One arc: a faint static base stroke plus (unless reduced motion) a traveling gradient segment. */
function ConnectionArc(props: ConnectionArcProps): JSX.Element {
  const gradientId = `world-map-beam-${createUniqueId()}`
  const start = project(props.connection.from)
  const end = project(props.connection.to)
  const mx = (start.x + end.x) / 2
  const my = (start.y + end.y) / 2
  // Bulge upward (smaller y) regardless of endpoint order.
  const bulge = Math.max(20, Math.hypot(end.x - start.x, end.y - start.y) * 0.25)
  const control = { x: mx, y: my - bulge }
  const d = `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`
  const reduced = motionReduced()

  let gradientEl: SVGLinearGradientElement | undefined

  if (!reduced) {
    const segment = 0.2
    const controls = animate(0, 1, {
      duration: 3,
      repeat: Infinity,
      ease: 'linear',
      onUpdate: (p: number) => {
        const from = pointAt(start, control, end, Math.max(0, p - segment))
        const to = pointAt(start, control, end, p)
        gradientEl?.setAttribute('x1', String(from.x))
        gradientEl?.setAttribute('y1', String(from.y))
        gradientEl?.setAttribute('x2', String(to.x))
        gradientEl?.setAttribute('y2', String(to.y))
      },
    })
    onCleanup(() => controls.stop())
  }

  return (
    <>
      <path d={d} stroke="hsl(var(--muted-foreground))" stroke-width="1" stroke-opacity="0.3" fill="none" />
      {!reduced && (
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
          <path d={d} stroke={`url(#${gradientId})`} stroke-width="1.5" stroke-linecap="round" fill="none" />
        </>
      )}
      <circle
        cx={start.x}
        cy={start.y}
        r="2.5"
        fill="hsl(var(--primary))"
        class={reduced ? undefined : 'animate-pulse'}
      />
      <circle
        cx={end.x}
        cy={end.y}
        r="2.5"
        fill="hsl(var(--primary))"
        class={reduced ? undefined : 'animate-pulse'}
      />
    </>
  )
}

/**
 * A decorative, dependency-free SVG "world map": an evenly spaced dotted-grid
 * backdrop (a stylized map, not accurate coastlines) with connection arcs
 * projected from lat/lng via equirectangular mapping. Each arc bulges upward
 * and carries a traveling primary→accent gradient segment (reusing
 * {@link AnimatedBeam}'s technique); arcs render static under reduced motion.
 * Responsive — scales to its container via the 2:1 `viewBox`.
 *
 * @example
 * ```tsx
 * <WorldMap
 *   class="w-full"
 *   connections={[
 *     { from: { lat: 40.7128, lng: -74.006, label: 'New York' }, to: { lat: 51.5074, lng: -0.1278, label: 'London' } },
 *     { from: { lat: 51.5074, lng: -0.1278 }, to: { lat: 35.6762, lng: 139.6503, label: 'Tokyo' } },
 *     { from: { lat: 40.7128, lng: -74.006 }, to: { lat: -23.5505, lng: -46.6333, label: 'São Paulo' } },
 *   ]}
 * />
 * ```
 */
export function WorldMap(props: WorldMapProps): JSX.Element {
  const connections = () => props.connections ?? []
  const label = () =>
    connections()
      .map(
        (c) =>
          `${c.from.label ?? `${c.from.lat},${c.from.lng}`} to ${c.to.label ?? `${c.to.lat},${c.to.lng}`}`,
      )
      .join('; ')

  return (
    <svg
      role={connections().length > 0 ? 'img' : undefined}
      aria-label={connections().length > 0 ? `World map with connections: ${label()}` : undefined}
      aria-hidden={connections().length > 0 ? undefined : 'true'}
      class={cn('w-full', props.class)}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      fill="none"
    >
      <For each={gridDots()}>
        {(dot) => (
          <circle cx={dot.x} cy={dot.y} r="0.8" fill="hsl(var(--muted-foreground))" fill-opacity="0.25" />
        )}
      </For>
      <For each={connections()}>{(connection) => <ConnectionArc connection={connection} />}</For>
    </svg>
  )
}
