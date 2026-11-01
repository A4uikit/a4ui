// Where overlays mount, and which document/window they live in.
//
// Every a4ui overlay (Modal, Popover, Tooltip, menus, date/time pickers,
// Lightbox, Tour...) portals into `document.body` by default. An app that
// renders a page into a same-origin iframe (a visual editor canvas) needs those
// overlays inside the iframe instead, and needs their listeners, positioning and
// scroll lock to use the iframe's document and window rather than the parent's.
// A `PortalMountProvider` around that subtree does both. Without a provider
// nothing changes.
import type { JSX } from 'solid-js'
import { createContext, useContext } from 'solid-js'

const PortalMountContext = createContext<() => Node | undefined>(() => undefined)

/** Props for {@link PortalMountProvider}. */
export interface PortalMountProviderProps {
  /** Node overlays portal into, e.g. `iframe.contentDocument.body`. */
  mount: Node
  children: JSX.Element
}

/**
 * Makes every a4ui overlay rendered inside it portal into `mount` instead of
 * `document.body`, and makes their document/window listeners, viewport
 * measurements and scroll lock use `mount.ownerDocument` and its window.
 *
 * Use it to render a4ui into a same-origin iframe from the parent app.
 *
 * @example
 * ```tsx
 * <Portal mount={iframe.contentDocument!.body}>
 *   <PortalMountProvider mount={iframe.contentDocument!.body}>
 *     <Page />
 *   </PortalMountProvider>
 * </Portal>
 * ```
 */
export function PortalMountProvider(props: PortalMountProviderProps): JSX.Element {
  // The context holds an accessor on purpose, so consumers read `props.mount` lazily (and reactively).
  const mount = () => props.mount
  return <PortalMountContext.Provider value={mount}>{props.children}</PortalMountContext.Provider>
}

/**
 * The portal mount from the nearest {@link PortalMountProvider}, or `undefined`
 * (which means `document.body`) when there is none. Call it during component
 * setup; read the returned accessor where the mount is needed.
 */
export function usePortalMount(): () => Node | undefined {
  return useContext(PortalMountContext)
}

/** Document and window an overlay should use, resolved from the portal mount. */
export interface OverlayEnvironment {
  /** The mount's `ownerDocument`, or the global `document`. */
  doc: () => Document
  /** The mount document's `defaultView`, or the global `window`. */
  win: () => Window
}

/**
 * Accessors for the document and window that belong to the current portal
 * mount. Call during component setup; call `doc()`/`win()` only in the browser
 * (in `onMount`, effects or event handlers).
 */
export function useOverlayEnvironment(): OverlayEnvironment {
  const mount = usePortalMount()
  const doc = (): Document => {
    const node = mount()
    if (!node) return document
    // A Document's ownerDocument is null; any other node has one.
    return node.ownerDocument ?? (node as Document)
  }
  const win = (): Window => doc().defaultView ?? window
  return { doc, win }
}
