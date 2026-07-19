// The classic "add to basket" fly animation: a ghost of the product image
// arcs from a source element (button/card) to a target element (the cart
// icon), then the target bumps to acknowledge the drop. Pure JS/DOM (a
// throwaway ghost node driven by Motion's `animate`), so it works from any
// click handler without touching component state. Reduced motion skips the
// flight entirely but still fires `onArrive` so cart counts stay correct.
import { animate, motionReduced } from './motion'

export interface FlyToCartOptions {
  /** Image URL to fly; if omitted, the source element is cloned. */
  image?: string
  /** Flight duration in seconds. @default 0.6 */
  duration?: number
  /** Called when the flight finishes (e.g. to increment the cart count). */
  onArrive?: () => void
}

/**
 * Animate a small ghost from `source` to `target` (e.g. product → cart icon),
 * then a bump on the target. No-op under reduced motion (still calls onArrive).
 *
 * @example
 * ```ts
 * function onAddToCart(e: MouseEvent) {
 *   const button = e.currentTarget as HTMLElement
 *   const cartIcon = document.getElementById('cart-icon')!
 *   flyToCart(button, cartIcon, {
 *     image: product.thumbnailUrl,
 *     onArrive: () => setCartCount((n) => n + 1),
 *   })
 * }
 * ```
 */
export function flyToCart(source: Element, target: Element, opts?: FlyToCartOptions): void {
  if (typeof document === 'undefined') {
    opts?.onArrive?.()
    return
  }

  if (motionReduced()) {
    opts?.onArrive?.()
    return
  }

  try {
    const sourceRect = source.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()

    const size = 48
    const sourceCenterX = sourceRect.left + sourceRect.width / 2
    const sourceCenterY = sourceRect.top + sourceRect.height / 2
    const targetCenterX = targetRect.left + targetRect.width / 2
    const targetCenterY = targetRect.top + targetRect.height / 2

    const dx = targetCenterX - sourceCenterX
    const dy = targetCenterY - sourceCenterY

    const ghost: HTMLElement = opts?.image ? document.createElement('img') : document.createElement('div')
    if (opts?.image) (ghost as HTMLImageElement).src = opts.image

    ghost.style.position = 'fixed'
    ghost.style.left = `${sourceCenterX - size / 2}px`
    ghost.style.top = `${sourceCenterY - size / 2}px`
    ghost.style.width = `${size}px`
    ghost.style.height = `${size}px`
    ghost.style.borderRadius = '9999px'
    ghost.style.objectFit = 'cover'
    ghost.style.pointerEvents = 'none'
    ghost.style.zIndex = '9999'
    if (!opts?.image) ghost.style.background = 'var(--a4-primary, #6366f1)'

    document.body.appendChild(ghost)

    const duration = opts?.duration ?? 0.6

    const controls = animate(
      ghost,
      { x: [0, dx], y: [0, dy], scale: [1, 0.3], opacity: [1, 0.5] },
      { duration, ease: 'easeInOut' },
    )

    controls.finished
      .catch(() => {
        /* stopped early — still clean up and settle below */
      })
      .then(() => {
        ghost.remove()
        opts?.onArrive?.()
        try {
          animate(target, { scale: [1, 1.25, 1] }, { duration: 0.3, ease: 'easeOut' })
        } catch {
          /* target no longer animatable — ignore */
        }
      })
      .catch(() => {
        /* onArrive threw — nothing more we can do here */
      })
  } catch {
    // Rect reads / DOM writes can fail (detached nodes, hostile environments) —
    // bail gracefully rather than throwing out of an event handler.
    opts?.onArrive?.()
  }
}
