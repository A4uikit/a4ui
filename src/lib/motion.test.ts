import { describe, it, expect } from 'vitest'
import { createRoot } from 'solid-js'

import { prefersReducedMotion, createCountUp } from './motion'
import { setEffects } from './effects'

describe('motion', () => {
  it('prefersReducedMotion() returns a boolean', () => {
    expect(typeof prefersReducedMotion()).toBe('boolean')
  })

  it('createCountUp jumps straight to the target under reduced motion (calm mode)', async () => {
    setEffects(false) // calm mode => motionReduced() is true => count-up snaps to target

    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const value = createCountUp(() => 100, 600)
        // The createEffect runs synchronously at creation; under reduced motion
        // it sets the value straight to the target with no rAF loop.
        queueMicrotask(() => {
          expect(value()).toBe(100)
          dispose()
          resolve()
        })
      })
    })
  })
})
