// Types for `@a4ui/core/preset` — the Spatial Glass Tailwind preset.
// Requires Tailwind CSS v3 (`tailwindcss@^3.4.0`): v4 removed `presets:`.
import type { Config } from 'tailwindcss'

/**
 * Tailwind v3 preset: semantic color names bound to the A4ui CSS variables, the
 * glass surface classes (`.card`, `.bg-glass`, `.tile-glass`, `.glow-edge`) and
 * the `light:` variant.
 *
 * @example
 * ```ts
 * import type { Config } from 'tailwindcss'
 * import a4ui from '@a4ui/core/preset'
 *
 * export default {
 *   presets: [a4ui],
 *   content: ['./src/**\/*.{ts,tsx}', './node_modules/@a4ui/core/dist/**\/*.js'],
 * } satisfies Config
 * ```
 */
declare const preset: Partial<Config>

export default preset
