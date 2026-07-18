// A4ui theme runtime — pick one of the built-in themes (or your own) and apply
// its palette by injecting a single <style id="a4ui-theme"> element that
// overrides the token variables for both dark and `[data-theme='light']`.
//
// This is separate from the light/dark *mode* switch in ./lib/theme (which flips
// `data-theme` and owns `setTheme`/`applyTheme` for the scheme). A theme recolors
// the palette underneath either mode; the two compose (pick a theme, then toggle
// light/dark within it). Named `selectTheme`/`applyThemeDefinition` to avoid
// clashing with the light/dark API.
import { createSignal } from 'solid-js'

import { space, TOKEN_ORDER, themes, type Palette, type ThemeDefinition } from './palettes'

export type { Palette, ThemeDefinition } from './palettes'
export { themes, space, dino, doctor, scientist, soccer, snow, christmas, TOKEN_ORDER } from './palettes'

// Distinct from the light/dark mode key ('a4ui-theme' in ./lib/theme) — the two
// persist independently, so picking a palette and toggling light/dark don't
// clobber each other.
const STORAGE_KEY = 'a4ui-theme-name'
const STYLE_ID = 'a4ui-theme'

const byName = (name: string): ThemeDefinition | undefined => themes.find((t) => t.name === name)

/** Serialize one palette to `--token: value;` declaration lines. */
function paletteDecls(palette: Palette): string {
  return TOKEN_ORDER.map((k) => `  --${k}: ${palette[k]};`).join('\n')
}

/**
 * Render a theme to the CSS you'd paste into your own stylesheet: a `:root`
 * block (dark) plus a `:root[data-theme='light']` block. Same output the docs
 * Theme Builder exports.
 */
export function themeToCss(theme: ThemeDefinition): string {
  return (
    `:root {\n${paletteDecls(theme.dark)}\n}\n\n` +
    `:root[data-theme='light'] {\n${paletteDecls(theme.light)}\n}`
  )
}

/** Render a theme's tokens to a `{ dark, light }` JSON object. */
export function themeToJson(theme: ThemeDefinition): { dark: Palette; light: Palette } {
  return { dark: theme.dark, light: theme.light }
}

const [activeTheme, setActiveThemeSignal] = createSignal<ThemeDefinition>(space)

/** Reactive accessor for the currently applied theme. */
export { activeTheme }

/**
 * Apply a theme's palette globally by injecting/replacing the
 * `<style id="a4ui-theme">` element. No-op during SSR. Does not persist or update
 * the reactive signal — use {@link selectTheme} for the full, persisted version.
 */
export function applyThemeDefinition(theme: ThemeDefinition): void {
  if (typeof document === 'undefined') return
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = STYLE_ID
    document.head.appendChild(el)
  }
  el.textContent = themeToCss(theme)
}

/**
 * Select the active theme by definition or name: applies it, updates the
 * reactive {@link activeTheme} signal, and persists the choice to localStorage.
 * Unknown names are ignored.
 */
export function selectTheme(theme: ThemeDefinition | string): void {
  const def = typeof theme === 'string' ? byName(theme) : theme
  if (!def) return
  applyThemeDefinition(def)
  setActiveThemeSignal(def)
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, def.name)
    } catch {
      /* private mode / storage disabled — ignore */
    }
  }
}

/**
 * Restore the persisted theme (or fall back to Space) and apply it. Call once at
 * startup. No-op during SSR.
 */
export function initTheme(): void {
  if (typeof document === 'undefined') return
  let name: string | null = null
  if (typeof localStorage !== 'undefined') {
    try {
      name = localStorage.getItem(STORAGE_KEY)
    } catch {
      name = null
    }
  }
  selectTheme((name && byName(name)) || space)
}
