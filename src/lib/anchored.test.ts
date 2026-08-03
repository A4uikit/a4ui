import { describe, expect, it, vi } from 'vitest'

import { createAnchorReflow } from './anchored'

/** A trigger whose viewport rect we control. */
function anchorAt(rect: Partial<DOMRect>): HTMLElement {
  const el = document.createElement('button')
  el.getBoundingClientRect = () =>
    ({
      top: 0,
      bottom: 24,
      left: 0,
      right: 100,
      width: 100,
      height: 24,
      x: 0,
      y: 0,
      toJSON: () => ({}),
      ...rect,
    }) as DOMRect
  return el
}

describe('createAnchorReflow', () => {
  it('repositions while the trigger is on screen — the case that made pickers unusable', () => {
    const place = vi.fn()
    const close = vi.fn()
    const reflow = createAnchorReflow({ anchor: () => anchorAt({ top: 300, bottom: 324 }), place, close })

    reflow()

    expect(place).toHaveBeenCalledTimes(1)
    expect(close).not.toHaveBeenCalled()
  })

  it('closes once the trigger has scrolled off the top', () => {
    const place = vi.fn()
    const close = vi.fn()
    const reflow = createAnchorReflow({ anchor: () => anchorAt({ top: -200, bottom: -176 }), place, close })

    reflow()

    expect(close).toHaveBeenCalledTimes(1)
    expect(place).not.toHaveBeenCalled()
  })

  it('closes once the trigger is below the fold', () => {
    const place = vi.fn()
    const close = vi.fn()
    const below = window.innerHeight + 400
    const reflow = createAnchorReflow({
      anchor: () => anchorAt({ top: below, bottom: below + 24 }),
      place,
      close,
    })

    reflow()

    expect(close).toHaveBeenCalledTimes(1)
  })

  it('tolerates a trigger straddling the top edge instead of closing on it', () => {
    const place = vi.fn()
    const close = vi.fn()
    // Half-hidden under a sticky header — still very much on screen.
    const reflow = createAnchorReflow({ anchor: () => anchorAt({ top: -8, bottom: 16 }), place, close })

    reflow()

    expect(place).toHaveBeenCalledTimes(1)
    expect(close).not.toHaveBeenCalled()
  })

  it('closes when the trigger is gone from the DOM rather than positioning against nothing', () => {
    const place = vi.fn()
    const close = vi.fn()
    const reflow = createAnchorReflow({ anchor: () => undefined, place, close })

    reflow()

    expect(close).toHaveBeenCalledTimes(1)
    expect(place).not.toHaveBeenCalled()
  })
})
