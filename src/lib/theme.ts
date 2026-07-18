// Light/dark theme handling. The dark "night" palette is the default (see
// styles.css / tokens.css); choosing light sets `data-theme="light"` on the
// root <html> element. The choice is persisted in localStorage so state
// survives reloads.
import { createSignal } from 'solid-js'

const STORAGE_KEY = 'a4ui-theme'

/** The two supported color schemes. `'dark'` (the "night" palette) is the default. */
export type Theme = 'dark' | 'light'

function isTheme(value: string | null): value is Theme {
  return value === 'dark' || value === 'light'
}

function localStorageSafe(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/**
 * Read the persisted theme choice from `localStorage`, defaulting to `'dark'`
 * when nothing is stored (or storage is unavailable).
 *
 * @example
 * ```ts
 * const initial = storedTheme() // 'dark' | 'light'
 * ```
 */
export function storedTheme(): Theme {
  const raw = localStorageSafe()?.getItem(STORAGE_KEY) ?? null
  return isTheme(raw) ? raw : 'dark'
}

/**
 * Reflect a theme onto `<html data-theme>` without touching storage or the
 * shared signal. Dark is the default (no attribute); light sets
 * `data-theme="light"`. Prefer {@link setTheme} unless you specifically need
 * to apply without persisting.
 *
 * @example
 * ```ts
 * applyTheme('light')
 * ```
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return // SSR-safe: no-op on the server
  const root = document.documentElement
  if (theme === 'light') {
    root.setAttribute('data-theme', 'light')
  } else {
    root.removeAttribute('data-theme')
  }
}

/**
 * Persist a theme choice to `localStorage` and apply it to `<html>`. Does not
 * update the shared `useTheme()` signal directly — {@link toggleTheme} does
 * that after calling this.
 *
 * @example
 * ```ts
 * setTheme('light')
 * ```
 */
export function setTheme(theme: Theme): void {
  localStorageSafe()?.setItem(STORAGE_KEY, theme)
  applyTheme(theme)
}

/**
 * The opposite of the given theme. Pure helper (no signal/storage side effects)
 * used by {@link toggleTheme}.
 *
 * @example
 * ```ts
 * toggled('dark') // 'light'
 * ```
 */
export function toggled(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark'
}

// Module-level signal so every consumer (ThemeToggle, anything reading the
// current theme) shares one source of truth, applied once at import time.
const initial = storedTheme()
applyTheme(initial)
const [theme, setThemeSignal] = createSignal<Theme>(initial)

/**
 * Reactive accessor for the current theme, shared module-wide so every
 * consumer (e.g. {@link ThemeToggle}, `SpaceBackground`) reads the same
 * source of truth.
 *
 * @example
 * ```ts
 * const theme = useTheme()
 * console.log(theme()) // 'dark' | 'light'
 * ```
 */
export function useTheme() {
  return theme
}

/** Flip the current theme (dark↔light), persisting and applying the new value. */
export function toggleTheme(): void {
  const next = toggled(theme())
  setTheme(next)
  setThemeSignal(next)
}
