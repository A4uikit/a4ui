// Slippy tile map from scratch — no leaflet/mapbox-gl. Standard Web Mercator
// (EPSG:3857) tile math: latLngToWorldPixel/worldPixelToLatLng convert between
// lat/lng and "world pixel" space at a given integer zoom (world size =
// 256 * 2^zoom px). The visible tile range is derived from the container size
// and the world-pixel position of the top-left corner; each tile renders as an
// absolutely-positioned <img>, repositioned (not reloaded) as the user pans.
import { Minus, Plus, MapPin } from 'lucide-solid'
import { createEffect, createMemo, createSignal, For, onCleanup, onMount, untrack, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'
import { Button } from './Button'

export interface MapMarker {
  lat: number
  lng: number
  label?: string
  id?: string
}

export interface InteractiveMapProps {
  /** Initial view center. Also acts as a recenter trigger: passing a new
   * `{ lat, lng }` after mount pans the view there (e.g. a "use my
   * location" button) without fighting the user's own drag/zoom in between.
   * @default { lat: 0, lng: 0 } */
  center?: { lat: number; lng: number }
  /** Initial integer zoom level, clamped to `[2, 18]`. Synced the same way
   * as `center` when it changes after mount. @default 3 */
  zoom?: number
  /** Pins rendered on top of the tiles, projected to their pixel position. */
  markers?: MapMarker[]
  /** Tile URL template with `{z}`/`{x}`/`{y}` placeholders.
   * @default 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' */
  tileUrl?: string
  /** Height of the map, in px. @default 400 */
  height?: number
  /** Fires with the lat/lng under the pointer on a click (drags don't count). */
  onClick?: (coord: { lat: number; lng: number }) => void
  class?: string
}

const TILE_SIZE = 256
const MIN_ZOOM = 2
const MAX_ZOOM = 18
const MAX_LAT = 85.05112878 // Web Mercator's latitude limit (where the projection would reach infinity)
const DEFAULT_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const DRAG_THRESHOLD_PX = 4 // pointer movement below this still counts as a click, not a pan

interface WorldPixel {
  x: number
  y: number
}

interface TileDescriptor {
  id: string
  left: number
  top: number
  src: string
}

interface MarkerPosition {
  marker: MapMarker
  x: number
  y: number
}

function clampZoom(z: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z)))
}

function clampLat(lat: number): number {
  return Math.min(MAX_LAT, Math.max(-MAX_LAT, lat))
}

function wrapLng(lng: number): number {
  return ((((lng + 180) % 360) + 360) % 360) - 180
}

/**
 * Projects a lat/lng to "world pixel" space at an integer zoom (the pixel
 * grid the size of the whole rendered world map, `256 * 2^zoom` square).
 *
 * @example
 * ```ts
 * latLngToWorldPixel(0, 0, 0) // → { x: 128, y: 128 } (center of a single 256px tile)
 * ```
 */
function latLngToWorldPixel(lat: number, lng: number, zoom: number): WorldPixel {
  const scale = TILE_SIZE * 2 ** zoom
  const x = ((wrapLng(lng) + 180) / 360) * scale
  const sinLat = Math.sin((clampLat(lat) * Math.PI) / 180)
  const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale
  return { x, y }
}

/** Inverse of {@link latLngToWorldPixel}: world pixel + zoom → lat/lng. */
function worldPixelToLatLng(x: number, y: number, zoom: number): { lat: number; lng: number } {
  const scale = TILE_SIZE * 2 ** zoom
  const lng = (x / scale) * 360 - 180
  const n = Math.PI - (2 * Math.PI * y) / scale
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
  return { lat: clampLat(lat), lng: wrapLng(lng) }
}

function buildTileUrl(template: string, z: number, x: number, y: number): string {
  return template.replace(/\{z\}/g, String(z)).replace(/\{x\}/g, String(x)).replace(/\{y\}/g, String(y))
}

/**
 * A slippy tile map built directly on Web Mercator math — no map SDK. Pan by
 * dragging, zoom with the +/- buttons or the wheel (zoom keeps the point
 * under the cursor fixed), place `markers`, and get the lat/lng of a click
 * via `onClick`. Recomputes its tile grid on resize (`ResizeObserver`).
 *
 * @example
 * ```tsx
 * <InteractiveMap
 *   center={{ lat: 48.8584, lng: 2.2945 }}
 *   zoom={13}
 *   markers={[{ lat: 48.8584, lng: 2.2945, label: 'Eiffel Tower' }]}
 *   onClick={(coord) => console.log('clicked', coord)}
 * />
 * ```
 */
export function InteractiveMap(props: InteractiveMapProps): JSX.Element {
  let containerRef: HTMLDivElement | undefined

  const [size, setSize] = createSignal({ w: 0, h: 0 })
  const [zoom, setZoom] = createSignal(clampZoom(props.zoom ?? 3))
  const [center, setCenter] = createSignal(props.center ?? { lat: 0, lng: 0 })

  // `center`/`zoom` are initial values that also act as recenter triggers —
  // syncing only on a genuine value change (not every render) so they don't
  // fight the user's own drag/zoom between prop updates.
  let lastCenterProp = props.center
  createEffect(() => {
    const next = props.center
    const prevApplied = untrack(center)
    if (next && next !== lastCenterProp && (next.lat !== prevApplied.lat || next.lng !== prevApplied.lng)) {
      setCenter({ lat: next.lat, lng: next.lng })
    }
    lastCenterProp = next
  })

  let lastZoomProp = props.zoom
  createEffect(() => {
    const next = props.zoom
    if (next !== undefined && next !== lastZoomProp) setZoom(clampZoom(next))
    lastZoomProp = next
  })

  onMount(() => {
    if (!containerRef) return
    const measure = (): void => {
      if (!containerRef) return
      const rect = containerRef.getBoundingClientRect()
      setSize({ w: rect.width, h: rect.height })
    }
    measure()

    let observer: ResizeObserver | undefined
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure)
      observer.observe(containerRef)
    }
    onCleanup(() => observer?.disconnect())
  })

  // World-pixel position of the container's top-left corner — the origin
  // every tile/marker position is measured against.
  const topLeftPx = createMemo<WorldPixel>(() => {
    const c = latLngToWorldPixel(center().lat, center().lng, zoom())
    const { w, h } = size()
    return { x: c.x - w / 2, y: c.y - h / 2 }
  })

  const tiles = createMemo<TileDescriptor[]>(() => {
    const { w, h } = size()
    if (w <= 0 || h <= 0) return []
    const z = zoom()
    const numTiles = 2 ** z
    const tl = topLeftPx()
    const url = props.tileUrl ?? DEFAULT_TILE_URL

    const minX = Math.floor(tl.x / TILE_SIZE) - 1
    const maxX = Math.floor((tl.x + w) / TILE_SIZE) + 1
    const minY = Math.max(0, Math.floor(tl.y / TILE_SIZE) - 1)
    const maxY = Math.min(numTiles - 1, Math.floor((tl.y + h) / TILE_SIZE) + 1)

    const list: TileDescriptor[] = []
    for (let x = minX; x <= maxX; x++) {
      const wrappedX = ((x % numTiles) + numTiles) % numTiles
      for (let y = minY; y <= maxY; y++) {
        list.push({
          id: `${z}/${x}/${y}`,
          left: x * TILE_SIZE - tl.x,
          top: y * TILE_SIZE - tl.y,
          src: buildTileUrl(url, z, wrappedX, y),
        })
      }
    }
    return list
  })

  const markerPositions = createMemo<MarkerPosition[]>(() => {
    const tl = topLeftPx()
    const z = zoom()
    return (props.markers ?? []).map((marker) => {
      const px = latLngToWorldPixel(marker.lat, marker.lng, z)
      return { marker, x: px.x - tl.x, y: px.y - tl.y }
    })
  })

  const clientToLatLng = (clientX: number, clientY: number): { lat: number; lng: number } | null => {
    if (!containerRef) return null
    const rect = containerRef.getBoundingClientRect()
    const tl = topLeftPx()
    return worldPixelToLatLng(tl.x + (clientX - rect.left), tl.y + (clientY - rect.top), zoom())
  }

  // --- pan (pointer drag) ----------------------------------------------
  let removeDragListeners: (() => void) | null = null

  const handlePointerDown = (event: PointerEvent & { currentTarget: HTMLDivElement }): void => {
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)

    const drag = {
      startClientX: event.clientX,
      startClientY: event.clientY,
      startCenterPx: latLngToWorldPixel(center().lat, center().lng, zoom()),
      moved: false,
    }

    const handleMove = (moveEvent: PointerEvent): void => {
      const dx = moveEvent.clientX - drag.startClientX
      const dy = moveEvent.clientY - drag.startClientY
      if (!drag.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) drag.moved = true
      if (!drag.moved) return
      const z = zoom()
      setCenter(worldPixelToLatLng(drag.startCenterPx.x - dx, drag.startCenterPx.y - dy, z))
    }

    const release = (upEvent: PointerEvent): void => {
      removeDragListeners?.()
      if (!drag.moved) {
        const coord = clientToLatLng(upEvent.clientX, upEvent.clientY)
        if (coord) props.onClick?.(coord)
      }
    }

    target.addEventListener('pointermove', handleMove)
    target.addEventListener('pointerup', release)
    target.addEventListener('lostpointercapture', release)
    removeDragListeners = () => {
      target.removeEventListener('pointermove', handleMove)
      target.removeEventListener('pointerup', release)
      target.removeEventListener('lostpointercapture', release)
      removeDragListeners = null
    }
  }

  onCleanup(() => removeDragListeners?.())

  // --- zoom (wheel, keeping the point under the cursor fixed) ----------
  const handleWheel = (event: WheelEvent & { currentTarget: HTMLDivElement }): void => {
    event.preventDefault()
    const oldZoom = zoom()
    const newZoom = clampZoom(oldZoom + (event.deltaY < 0 ? 1 : -1))
    if (newZoom === oldZoom) return

    const rect = event.currentTarget.getBoundingClientRect()
    const px = event.clientX - rect.left
    const py = event.clientY - rect.top
    const tl = topLeftPx()
    const cursorLatLng = worldPixelToLatLng(tl.x + px, tl.y + py, oldZoom)
    const cursorAtNewZoom = latLngToWorldPixel(cursorLatLng.lat, cursorLatLng.lng, newZoom)
    const { w, h } = size()

    setZoom(newZoom)
    setCenter(worldPixelToLatLng(cursorAtNewZoom.x - px + w / 2, cursorAtNewZoom.y - py + h / 2, newZoom))
  }

  const zoomBy = (delta: number): void => {
    setZoom((z) => clampZoom(z + delta))
  }

  return (
    <div
      class={cn('relative overflow-hidden rounded-lg border border-border bg-muted', props.class)}
      style={{ height: `${props.height ?? 400}px` }}
    >
      <div
        ref={containerRef}
        class="absolute inset-0 touch-none cursor-grab select-none active:cursor-grabbing"
        role="application"
        aria-label="Interactive map"
        onPointerDown={handlePointerDown}
        onWheel={handleWheel}
      >
        <For each={tiles()}>
          {(tile) => (
            <img
              src={tile.src}
              alt=""
              draggable={false}
              class={cn(
                'absolute h-[256px] w-[256px] max-w-none select-none',
                !motionReduced() &&
                  'opacity-0 transition-opacity duration-150 [&.a4ui-tile-loaded]:opacity-100',
              )}
              style={{ left: `${tile.left}px`, top: `${tile.top}px` }}
              onLoad={(event) => event.currentTarget.classList.add('a4ui-tile-loaded')}
            />
          )}
        </For>
        <For each={markerPositions()}>
          {(mp) => (
            <div
              class="pointer-events-auto absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${mp.x}px`, top: `${mp.y}px` }}
              title={mp.marker.label}
            >
              <MapPin class="h-7 w-7 text-primary drop-shadow" aria-label={mp.marker.label ?? 'Marker'} />
            </div>
          )}
        </For>
      </div>

      <div class="absolute top-2 right-2 flex flex-col gap-1">
        <Button variant="secondary" class="h-8 w-8 p-0" aria-label="Zoom in" onClick={() => zoomBy(1)}>
          <Plus class="h-4 w-4" />
        </Button>
        <Button variant="secondary" class="h-8 w-8 p-0" aria-label="Zoom out" onClick={() => zoomBy(-1)}>
          <Minus class="h-4 w-4" />
        </Button>
      </div>

      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
        class="absolute bottom-0.5 left-1 rounded bg-card/70 px-1 text-[10px] text-muted-foreground backdrop-blur-sm hover:text-foreground"
      >
        © OpenStreetMap
      </a>
    </div>
  )
}
