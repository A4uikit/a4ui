// Spotlight-the-hovered-one container: hovering/focusing one item keeps it
// sharp/full-opacity while the rest blur + dim. Purely visual — pointer/focus
// driven, never traps focus or hijacks keyboard. Only `opacity` and `filter`
// (blur) are animated so the effect stays a compositor-only transition (no
// layout props ever transition).
import { createSignal, For, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface FocusBlurGroupProps<T> {
  /** The full data set to render. */
  items: T[]
  /** Row renderer. */
  children: (item: T, index: number) => JSX.Element
  /** Blur (px) applied to non-focused items. @default 2 */
  blur?: number
  /** Opacity (0..1) applied to non-focused items. @default 0.5 */
  dim?: number
  /** Applied to the container — use it for layout (e.g. `flex gap-6`). */
  class?: string
}

/**
 * Container that spotlights whichever item is hovered or keyboard-focused:
 * that item stays sharp and fully opaque while its siblings blur and dim.
 * Only `opacity`/`filter` transition — never a layout property — and under
 * `motionReduced()` the blur is skipped (dim-only, no transition) since blur
 * motion reads as motion-sickness-adjacent.
 *
 * @example
 * ```tsx
 * <FocusBlurGroup items={navLinks} class="flex gap-6">
 *   {(link) => (
 *     <a href={link.href} class="text-sm font-medium text-foreground">
 *       {link.label}
 *     </a>
 *   )}
 * </FocusBlurGroup>
 * ```
 */
export function FocusBlurGroup<T>(props: FocusBlurGroupProps<T>): JSX.Element {
  const [hovered, setHovered] = createSignal<number | null>(null)

  return (
    <div class={cn(props.class)} onPointerLeave={() => setHovered(null)} onFocusOut={() => setHovered(null)}>
      <For each={props.items}>
        {(item, index) => {
          const isFocused = () => hovered() === null || hovered() === index()
          const reduced = motionReduced()

          return (
            <div
              onPointerEnter={() => setHovered(index())}
              onFocusIn={() => setHovered(index())}
              style={{
                opacity: isFocused() ? 1 : (props.dim ?? 0.5),
                filter: reduced || isFocused() ? 'none' : `blur(${props.blur ?? 2}px)`,
                transition: reduced ? 'none' : 'opacity 200ms ease, filter 200ms ease',
              }}
            >
              {props.children(item, index())}
            </div>
          )
        }}
      </For>
    </div>
  )
}
