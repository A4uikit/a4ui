// Persist the theme-settings drawer's per-token edits in the browser session, so
// an accidental refresh keeps the user's tweaks. The base theme (space/dino/…) is
// persisted separately by core's selectTheme/initTheme; these are the overrides
// layered on top. Switching base theme or hitting Reset clears them.
import { selectTheme, TOKEN_ORDER } from '../src'

const KEY = 'a4ui-theme-overrides'

function read(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || '{}') as Record<string, string>
  } catch {
    return {}
  }
}
function write(o: Record<string, string>): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(o))
  } catch {
    /* private mode / storage disabled — ignore */
  }
}

/** Apply one token override live and remember it for this browser session. */
export function setOverride(name: string, hsl: string): void {
  const o = read()
  o[name] = hsl
  write(o)
  document.documentElement.style.setProperty(`--${name}`, hsl)
}

/** Re-apply the saved overrides. Call once on boot, AFTER initTheme(). */
export function applyOverrides(): void {
  const o = read()
  for (const [k, v] of Object.entries(o)) document.documentElement.style.setProperty(`--${k}`, v)
}

/** Drop all overrides — back to the active theme's palette. */
export function clearOverrides(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  for (const t of TOKEN_ORDER) document.documentElement.style.removeProperty(`--${t}`)
}

/** Switch base theme and drop any custom edits (a fresh preset). */
export function chooseBaseTheme(name: string): void {
  clearOverrides()
  selectTheme(name)
}
