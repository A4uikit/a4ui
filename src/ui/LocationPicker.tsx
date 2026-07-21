// A form field pairing a free-text label with an InteractiveMap: click (or
// drag-release) on the map to drop the pin, or use the browser's geolocation
// to jump straight to the user's position. Controlled (`value`/`onChange`) or
// uncontrolled (internal signal, seeded once from `value`).
import { Crosshair } from 'lucide-solid'
import { createSignal, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { Button } from './Button'
import { InteractiveMap, type MapMarker } from './InteractiveMap'

export interface LocationValue {
  lat: number
  lng: number
  label?: string
}

export interface LocationPickerProps {
  /** Controlled value. Omit to let the component manage its own state. */
  value?: LocationValue
  /** Fires with the full value whenever the label, the pin, or geolocation changes it. */
  onChange?: (v: LocationValue) => void
  class?: string
}

const MAP_ZOOM = 12
const MAP_HEIGHT = 240

/**
 * Text label + compact map field for picking a location: click or drag the
 * map to drop the pin (no geocoding — the label is a free-text tag the caller
 * attaches to the coordinates), or use the "use my location" button.
 *
 * @example
 * ```tsx
 * const [place, setPlace] = createSignal<LocationValue>({ lat: 48.8584, lng: 2.2945, label: 'Eiffel Tower' })
 * <LocationPicker value={place()} onChange={setPlace} />
 * ```
 */
export function LocationPicker(props: LocationPickerProps): JSX.Element {
  const [internal, setInternal] = createSignal<LocationValue>(props.value ?? { lat: 0, lng: 0 })

  // Controlled when `value` is passed (read fresh every time, like a normal
  // controlled input); falls back to internal state otherwise.
  const current = (): LocationValue => props.value ?? internal()

  const emit = (next: LocationValue): void => {
    setInternal(next)
    props.onChange?.(next)
  }

  const setCoord = (coord: { lat: number; lng: number }): void => {
    emit({ ...current(), lat: coord.lat, lng: coord.lng })
  }

  const setLabel = (label: string): void => {
    emit({ ...current(), label })
  }

  const useMyLocation = (): void => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => setCoord({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) => console.error('LocationPicker: geolocation failed', error),
    )
  }

  const pin = (): MapMarker[] => {
    const { lat, lng, label } = current()
    return [{ lat, lng, label: label || undefined, id: 'picked' }]
  }

  return (
    <div class={cn('flex flex-col gap-2', props.class)}>
      <div class="flex gap-2">
        <input
          type="text"
          value={current().label ?? ''}
          onInput={(event) => setLabel(event.currentTarget.value)}
          placeholder="Location label"
          class="h-9 flex-1 rounded-md border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        />
        <Button variant="outline" aria-label="Use my location" onClick={useMyLocation}>
          <Crosshair class="h-4 w-4" />
        </Button>
      </div>
      <InteractiveMap
        center={{ lat: current().lat, lng: current().lng }}
        zoom={MAP_ZOOM}
        height={MAP_HEIGHT}
        markers={pin()}
        onClick={setCoord}
      />
    </div>
  )
}
