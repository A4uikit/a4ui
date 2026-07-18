import { describe, it, expect, beforeEach } from 'vitest'

import { toggled, storedTheme, applyTheme, setTheme } from './theme'

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('toggled() flips dark <-> light', () => {
    expect(toggled('dark')).toBe('light')
    expect(toggled('light')).toBe('dark')
  })

  it('storedTheme() defaults to dark when nothing is stored', () => {
    expect(storedTheme()).toBe('dark')
  })

  it('storedTheme() returns the persisted value', () => {
    localStorage.setItem('a4ui-theme', 'light')
    expect(storedTheme()).toBe('light')
  })

  it('applyTheme("light") sets data-theme, applyTheme("dark") removes it', () => {
    applyTheme('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    applyTheme('dark')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('setTheme() persists to localStorage and applies to <html>', () => {
    setTheme('light')
    expect(localStorage.getItem('a4ui-theme')).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    setTheme('dark')
    expect(localStorage.getItem('a4ui-theme')).toBe('dark')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })
})
