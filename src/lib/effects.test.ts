import { describe, it, expect, beforeEach } from 'vitest'

import { isCalm, setEffects, useEffects } from './effects'

describe('effects', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('setEffects(false) enters calm mode: isCalm() true, html.calm added, persisted as "0"', () => {
    setEffects(false)
    expect(isCalm()).toBe(true)
    expect(document.documentElement.classList.contains('calm')).toBe(true)
    expect(localStorage.getItem('a4ui-effects')).toBe('0')
  })

  it('setEffects(true) exits calm mode: isCalm() false, html.calm removed, persisted as "1"', () => {
    setEffects(true)
    expect(isCalm()).toBe(false)
    expect(document.documentElement.classList.contains('calm')).toBe(false)
    expect(localStorage.getItem('a4ui-effects')).toBe('1')
  })

  it('useEffects() is a reactive accessor tracking the switch', () => {
    const effectsOn = useEffects()
    setEffects(true)
    expect(effectsOn()).toBe(true)
    setEffects(false)
    expect(effectsOn()).toBe(false)
  })
})
