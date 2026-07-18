// Renders children into a detached DOM node (default: <body>), escaping overflow
// and stacking-context traps. A thin wrapper over Solid's own Portal so it's
// available alongside the rest of the library.
import type { JSX } from 'solid-js'
import { Portal as SolidPortal } from 'solid-js/web'

/** Props for {@link Portal}. */
export interface PortalProps {
  /** Where to mount. Defaults to `document.body`. */
  mount?: Node
  /** Use a Shadow DOM root for the portal container. */
  useShadow?: boolean
  children: JSX.Element
}

/**
 * Renders its children into a different place in the DOM (by default
 * `document.body`), so overlays aren't clipped by an ancestor's `overflow` or
 * transformed stacking context. Built on Solid's `Portal`.
 *
 * @example
 * ```tsx
 * <Portal>
 *   <div class="fixed inset-0 grid place-items-center">Floating layer</div>
 * </Portal>
 * ```
 */
export function Portal(props: PortalProps): JSX.Element {
  return (
    <SolidPortal mount={props.mount} useShadow={props.useShadow}>
      {props.children}
    </SolidPortal>
  )
}
