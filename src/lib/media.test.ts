import { describe, it, expect, vi } from 'vitest'
import { createRoot } from 'solid-js'

import { useMediaQuery } from './media'

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

describe('useMediaQuery', () => {
  it('returns an accessor reflecting a matching query', () => {
    mockMatchMedia(true)
    createRoot((dispose) => {
      const isDesktop = useMediaQuery('(min-width: 768px)')
      expect(typeof isDesktop).toBe('function')
      expect(isDesktop()).toBe(true)
      dispose()
    })
  })

  it('returns an accessor reflecting a non-matching query', () => {
    mockMatchMedia(false)
    createRoot((dispose) => {
      const isDesktop = useMediaQuery('(min-width: 768px)')
      expect(isDesktop()).toBe(false)
      dispose()
    })
  })
})
