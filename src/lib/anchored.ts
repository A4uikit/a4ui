// Keeping a portaled popover glued to the trigger it belongs to.
//
// DateField, TimeField, DateRangePicker and MultiSelect all render their panel
// in a <Portal> so it escapes the stacking context of whatever card it sits in.
// At <body> it cannot be positioned relative to the trigger, so each one places
// it with `position: fixed` at the trigger's viewport rect — which is correct
// until the page scrolls and the rect goes stale.
//
// All four handled that by CLOSING on any captured scroll, and that made them
// unusable on a scrolling page: clicking a trigger below the fold scrolls it
// into view, the scroll event arrives right after the panel opens, and the
// panel shuts in the same gesture. Reported as a date picker that simply did
// not respond to clicks; measured in a browser as open-then-closed within
// 300 ms, with `mousedown` followed by `scroll:document`.
//
// A fixed panel does not need to disappear when the page moves — it needs to
// move with it. This re-places it, and closes only when the trigger has
// actually left the viewport, where following it would leave a panel hovering
// over unrelated content.

/** Vertical slack, in px, before a trigger counts as gone. Half a row: enough
 * not to close while a sticky header slides over the trigger's top edge. */
const OFF_SCREEN_SLACK = 16

export interface AnchorReflowOptions {
  /** The trigger the panel is anchored to. */
  anchor: () => HTMLElement | undefined
  /** Re-reads the anchor's rect and repositions the panel. */
  place: () => void
  /** Called only when the anchor is no longer on screen. */
  close: () => void
}

/**
 * The scroll/resize handler an anchored popover should register, instead of
 * `close`.
 *
 * Registering it for `scroll` still needs capture (`true`): the scroll may come
 * from any ancestor container, and scroll events do not bubble to `window`.
 */
export function createAnchorReflow(options: AnchorReflowOptions): () => void {
  return () => {
    const el = options.anchor()
    if (!el) {
      options.close()
      return
    }
    const rect = el.getBoundingClientRect()
    const gone =
      rect.bottom < -OFF_SCREEN_SLACK ||
      rect.top > window.innerHeight + OFF_SCREEN_SLACK ||
      rect.right < 0 ||
      rect.left > window.innerWidth
    if (gone) options.close()
    else options.place()
  }
}

/**
 * Viewport `left` for a fixed panel aligned with its trigger's inline-start edge,
 * kept 8px inside the viewport. Under `dir="rtl"` that is the trigger's right
 * edge, so the panel extends leftwards. The direction is read from the trigger,
 * which also works for a `dir` set by a provider or an ancestor element.
 */
export function anchoredLeft(anchor: HTMLElement, panelWidth: number): number {
  const rect = anchor.getBoundingClientRect()
  const rtl = getComputedStyle(anchor).direction === 'rtl'
  const start = rtl ? rect.right - panelWidth : rect.left
  return Math.max(8, Math.min(start, window.innerWidth - panelWidth - 8))
}
