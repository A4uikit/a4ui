// Shared direction context. `DirectionProvider` (src/ui/DirectionProvider.tsx)
// provides it; overlays that render through a portal read it to stamp `dir`
// on their container, because a portal mounts outside the provider's wrapper
// element and so does not inherit its `dir` attribute.
import { type Accessor, createContext, createEffect, useContext } from 'solid-js'

/** Text direction supported by {@link DirectionProvider}. */
export type Direction = 'ltr' | 'rtl'

/** Accessor of the nearest provider's direction, or `undefined` outside one. */
export const DirectionContext = createContext<Accessor<Direction>>()

/**
 * Maps a physical horizontal arrow key to the key that means the same thing in
 * reading order: under `rtl`, ArrowLeft moves forward and ArrowRight back, so
 * handlers written for LTR can run on the swapped key. Other keys pass through.
 */
export function readingKey(key: string, dir: Direction): string {
  if (dir !== 'rtl') return key
  if (key === 'ArrowLeft') return 'ArrowRight'
  if (key === 'ArrowRight') return 'ArrowLeft'
  return key
}

/**
 * `ref` for a portal container (Solid `Portal` or any Kobalte `*.Portal`).
 * Copies the nearest `DirectionProvider`'s direction onto the container so the
 * overlay renders in the same direction as the tree that opened it. Outside a
 * provider it does nothing, so the overlay inherits from `<body>` as before.
 */
export function portalDir(el: Element): void {
  const dir = useContext(DirectionContext)
  if (!dir) return
  createEffect(() => el.setAttribute('dir', dir()))
}
