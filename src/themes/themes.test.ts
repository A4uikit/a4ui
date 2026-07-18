import { describe, expect, it } from 'vitest'

import { space, themes, themeToCss, themeToJson, TOKEN_ORDER } from './index'

describe('themes', () => {
  it('every theme defines all tokens for dark and light', () => {
    for (const theme of themes) {
      for (const mode of ['dark', 'light'] as const) {
        for (const token of TOKEN_ORDER) {
          const value = theme[mode][token]
          expect(value, `${theme.name}.${mode}.${token}`).toMatch(
            /^\d+(?:\.\d+)?\s+\d+(?:\.\d+)?%\s+\d+(?:\.\d+)?%$/,
          )
        }
      }
    }
  })

  it('has unique, slug-safe names and a Space default', () => {
    const names = themes.map((t) => t.name)
    expect(new Set(names).size).toBe(names.length)
    for (const n of names) expect(n).toMatch(/^[a-z][a-z0-9-]*$/)
    expect(themes[0]).toBe(space)
  })

  it('themeToCss emits :root (dark) and [data-theme=light] blocks with every token', () => {
    const css = themeToCss(space)
    expect(css).toMatch(/^:root \{/)
    expect(css).toContain(":root[data-theme='light'] {")
    for (const token of TOKEN_ORDER) {
      expect(css).toContain(`--${token}: ${space.dark[token]};`)
      expect(css).toContain(`--${token}: ${space.light[token]};`)
    }
  })

  it('themeToJson returns the dark and light palettes verbatim', () => {
    expect(themeToJson(space)).toEqual({ dark: space.dark, light: space.light })
  })
})
