// A4ui — Spatial Glass Tailwind preset.
//
// Spread into a consumer's Tailwind config so the semantic color names resolve
// to the CSS variables shipped in `@a4ui/core/styles.css`, Tailwind alpha modifiers
// (`bg-primary/90`, `ring-emerald-500/30`, …) keep working, and the glass
// surface classes (.card / .bg-glass / .tile-glass / .glow-edge) are generated
// by Tailwind — so ALL surface styling decisions live here, not in a hand-rolled
// stylesheet. (The CSS variables, motion keyframes and starfield still ship as
// `@a4ui/core/styles.css` — vars and @keyframes can't be Tailwind utilities.)
//
//   import a4ui from '@a4ui/core/preset'
//   export default {
//     presets: [a4ui],
//     content: ['./src/**/*.{ts,tsx}', './node_modules/@a4ui/core/dist/**/*.js'],
//   }

// Explicit .js extension so the preset resolves under strict Node ESM (used by
// our elements-css build), not just bundlers.
import plugin from 'tailwindcss/plugin.js'

// Frosted "space glass" surfaces. addComponents so they tree-shake like any
// utility (emitted only when the class is found in scanned content — a4ui's own
// components use them, so scanning ./node_modules/@a4ui/core/dist covers it).
const glass = plugin(({ addComponents, addVariant }) => {
  // `light:` applies when an ancestor is in the light theme (`[data-theme='light']`),
  // mirroring how dark is the base and light is the override throughout A4ui. Used
  // for theme-aware tints (e.g. Badge tones) that need a lighter foreground on dark
  // and a darker one on light to keep WCAG AA in both.
  addVariant('light', "[data-theme='light'] &")
  addComponents({
    // ---- Primary glass surface ----
    '.card': {
      position: 'relative',
      background: 'hsl(var(--card) / 0.55)',
      backdropFilter: 'blur(8px) saturate(150%)',
      WebkitBackdropFilter: 'blur(8px) saturate(150%)',
      border: '1px solid hsl(var(--foreground) / 0.16)',
      borderRadius: 'var(--radius-xl, 1rem)',
      boxShadow: '0 1px 2px hsl(var(--shadow) / 0.05), 0 4px 12px hsl(var(--shadow) / 0.1)',
      transition: 'transform .25s cubic-bezier(.16,1,.3,1), box-shadow .25s ease, border-color .2s ease',
    },
    "[data-theme='light'] .card": {
      // A touch more transparent than fully opaque so the frosted blur reads on
      // light themes (over an Aurora/scenery backdrop) — text stays legible.
      background: 'hsl(var(--card) / 0.6)',
      border: '1px solid hsl(var(--border))',
    },

    // Cursor-following border glow (SpaceBackground updates --mx/--my on move).
    '.card.glow-edge::before': {
      content: "''",
      position: 'absolute',
      inset: '0',
      borderRadius: 'inherit',
      padding: '1px',
      background:
        'radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), hsl(var(--primary) / .9), hsl(var(--accent) / .25) 45%, transparent 70%)',
      WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      opacity: '0',
      transition: 'opacity .35s ease',
      pointerEvents: 'none',
    },
    '.card.glow-edge:hover::before': { opacity: '1' },
    '@media (prefers-reduced-motion: reduce)': {
      '.card.glow-edge::before': { display: 'none' },
    },
    // Light theme: the glow is faint on white — thicker + more vivid.
    "[data-theme='light'] .card.glow-edge::before": {
      padding: '1.5px',
      background:
        'radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), hsl(var(--primary) / 1), hsl(var(--accent) / 0.55) 42%, transparent 72%)',
    },

    // ---- Field focus/error "bloom" ----
    // Theme-aware glow for text fields: the colour comes from the theme's --ring
    // (focus) or --destructive (invalid), so each theme blooms in its own hue.
    // Applied via the `a4-field` class on inputs/triggers.
    '.a4-field': {
      transition: 'box-shadow .16s ease, border-color .16s ease',
    },
    '.a4-field:focus, .a4-field:focus-within': {
      outline: 'none',
      borderColor: 'hsl(var(--ring))',
      boxShadow: '0 0 0 3px hsl(var(--ring) / 0.22), 0 0 16px -2px hsl(var(--ring) / 0.55)',
    },
    '.a4-field[aria-invalid="true"], .a4-field[data-invalid]': {
      borderColor: 'hsl(var(--destructive))',
      boxShadow: '0 0 0 2px hsl(var(--destructive) / 0.18)',
    },
    '.a4-field[aria-invalid="true"]:focus, .a4-field[data-invalid]:focus': {
      outline: 'none',
      boxShadow: '0 0 0 3px hsl(var(--destructive) / 0.3), 0 0 16px -2px hsl(var(--destructive) / 0.6)',
    },
    // Light backgrounds swallow soft glows — bloom a touch stronger there.
    "[data-theme='light'] .a4-field:focus, [data-theme='light'] .a4-field:focus-within": {
      boxShadow: '0 0 0 3px hsl(var(--ring) / 0.3), 0 0 18px -2px hsl(var(--ring) / 0.65)',
    },

    // ---- Floating overlay glass (menus, modals, drawers, toasts) ----
    '.bg-glass': {
      background: 'hsl(var(--card) / 0.72)',
      backdropFilter: 'blur(14px) saturate(160%)',
      WebkitBackdropFilter: 'blur(14px) saturate(160%)',
      border: '1px solid hsl(var(--foreground) / 0.14)',
    },
    "[data-theme='light'] .bg-glass": {
      background: 'hsl(var(--card) / 0.85)',
      border: '1px solid hsl(var(--border))',
    },

    // ---- Nested tile inside an existing .card — tint only, no second blur ----
    '.tile-glass': {
      background: 'hsl(var(--foreground) / 0.055)',
      border: '1px solid hsl(var(--foreground) / 0.09)',
    },
    "[data-theme='light'] .tile-glass": {
      background: 'hsl(var(--foreground) / 0.035)',
      borderColor: 'hsl(var(--foreground) / 0.09)',
    },

    // ---- CALM MODE (html.calm — visual effects OFF, or ?calm=1): opaque
    //      surfaces, no blur. High-contrast / low-power / contrast-checkable. ----
    'html.calm .glow-edge::before': { display: 'none !important' },
    'html.calm .badge': {
      backgroundColor: 'hsl(var(--muted)) !important',
      color: 'hsl(var(--foreground)) !important',
      '--tw-ring-color': 'hsl(var(--border)) !important',
    },
    'html.calm .card, html.calm .bg-glass': {
      background: 'hsl(var(--card))',
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none',
    },
    'html.calm .tile-glass': {
      background: 'hsl(var(--muted))',
      borderColor: 'hsl(var(--border))',
    },

    // ---- Fallback when backdrop-filter isn't applied (old browsers, macOS
    //      "Reduce transparency"): make the glass opaque enough to read. ----
    '@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))': {
      '.card': { background: 'hsl(var(--card) / 0.92)' },
      "[data-theme='light'] .card": { background: 'hsl(var(--card) / 0.96)' },
      '.bg-glass': { background: 'hsl(var(--card) / 0.95)' },
      "[data-theme='light'] .bg-glass": { background: 'hsl(var(--card) / 0.97)' },
    },
    '@media (prefers-reduced-transparency: reduce)': {
      '.card': { background: 'hsl(var(--card) / 0.92)' },
      "[data-theme='light'] .card": { background: 'hsl(var(--card) / 0.96)' },
      '.bg-glass': { background: 'hsl(var(--card) / 0.95)' },
      "[data-theme='light'] .bg-glass": { background: 'hsl(var(--card) / 0.97)' },
    },
  })
})

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        ring: 'hsl(var(--ring) / <alpha-value>)',
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        'data-emit': 'hsl(var(--data-emit) / <alpha-value>)',
        'data-received': 'hsl(var(--data-received) / <alpha-value>)',
        'data-net': 'hsl(var(--data-net) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: { xl: '1rem' },
    },
  },
  plugins: [glass],
}
