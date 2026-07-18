import { describe, it, expect } from 'vitest'

import { cn } from './cn'

describe('cn', () => {
  it('joins multiple class lists', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('resolves conflicting Tailwind utilities left-to-right (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-sm text-red-500', 'text-lg')).toBe('text-red-500 text-lg')
  })

  it('flattens conditionals, arrays and objects', () => {
    const off = false
    expect(cn('a', off && 'b', ['c', 'd'], { e: true, f: false })).toBe('a c d e')
  })
})
