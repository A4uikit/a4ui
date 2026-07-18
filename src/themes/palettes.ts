// A4ui themes — a "theme" is pure data: the 15 color tokens for dark + light.
// Everything else (motion, glass, fonts, radius, data colors) is theme-agnostic
// and lives in tokens.css / the Tailwind preset, so a theme only ever recolors.
//
// Values are HSL channels ("H S% L%") — the same format the tokens use and what
// `hsl(var(--x))` in the preset expects. Primary/accent lightness is kept low
// enough that white foreground text clears WCAG AA on the solid surfaces.
//
// `space` is the flagship default and matches tokens.css verbatim; applying it
// is a no-op relative to the shipped defaults. New themes override on top.

/** The 15 recolorable tokens, each an "H S% L%" channel string. */
export interface Palette {
  background: string
  foreground: string
  card: string
  'card-foreground': string
  muted: string
  'muted-foreground': string
  border: string
  input: string
  primary: string
  'primary-foreground': string
  accent: string
  'accent-foreground': string
  ring: string
  destructive: string
  'destructive-foreground': string
}

/** A named theme: a label plus a dark and a light palette. */
export interface ThemeDefinition {
  /** URL/storage-safe slug, e.g. `space`. */
  name: string
  /** Human label for the picker, e.g. `Space`. */
  label: string
  /** One-line flavour text. */
  description: string
  /** Emoji shown in the theme picker. */
  icon: string
  dark: Palette
  light: Palette
}

// The token order used when serializing a palette to CSS/JSON.
export const TOKEN_ORDER: (keyof Palette)[] = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'muted',
  'muted-foreground',
  'border',
  'input',
  'primary',
  'primary-foreground',
  'accent',
  'accent-foreground',
  'ring',
  'destructive',
  'destructive-foreground',
]

// --- Flagship: Space (matches tokens.css exactly) ---------------------------
export const space: ThemeDefinition = {
  name: 'space',
  label: 'Space',
  description: 'The signature spatial-glass look: deep night sky and electric blue.',
  icon: '🚀',
  dark: {
    background: '222 47% 7%',
    foreground: '213 31% 91%',
    card: '222 40% 11%',
    'card-foreground': '213 31% 91%',
    muted: '217 33% 17%',
    'muted-foreground': '215 25% 75%',
    border: '217 30% 22%',
    input: '217 30% 22%',
    primary: '217 91% 52%',
    'primary-foreground': '0 0% 100%',
    accent: '199 89% 55%',
    'accent-foreground': '0 0% 100%',
    ring: '217 91% 52%',
    destructive: '0 72% 55%',
    'destructive-foreground': '0 0% 100%',
  },
  light: {
    background: '214 32% 95%',
    foreground: '222 47% 11%',
    card: '0 0% 100%',
    'card-foreground': '222 47% 11%',
    muted: '214 30% 92%',
    'muted-foreground': '215 22% 38%',
    border: '214 24% 84%',
    input: '214 32% 91%',
    primary: '217 91% 52%',
    'primary-foreground': '0 0% 100%',
    accent: '199 89% 48%',
    'accent-foreground': '0 0% 100%',
    ring: '217 91% 52%',
    destructive: '0 72% 51%',
    'destructive-foreground': '0 0% 100%',
  },
}

// --- Dino: jurassic jungle — leaf green + amber -----------------------------
export const dino: ThemeDefinition = {
  name: 'dino',
  label: 'Dino',
  description: 'Jurassic jungle: mossy greens with a warm amber accent.',
  icon: '🦖',
  dark: {
    background: '160 30% 8%',
    foreground: '140 18% 90%',
    card: '160 28% 12%',
    'card-foreground': '140 18% 90%',
    muted: '160 20% 18%',
    'muted-foreground': '140 14% 74%',
    border: '160 20% 24%',
    input: '160 20% 24%',
    primary: '140 60% 40%',
    'primary-foreground': '0 0% 100%',
    accent: '35 90% 52%',
    'accent-foreground': '40 45% 12%',
    ring: '140 60% 40%',
    destructive: '0 72% 55%',
    'destructive-foreground': '0 0% 100%',
  },
  light: {
    background: '90 32% 94%',
    foreground: '160 32% 13%',
    card: '80 30% 99%',
    'card-foreground': '160 32% 13%',
    muted: '90 24% 88%',
    'muted-foreground': '160 18% 34%',
    border: '90 22% 79%',
    input: '90 24% 88%',
    primary: '140 55% 32%',
    'primary-foreground': '0 0% 100%',
    accent: '35 90% 44%',
    'accent-foreground': '0 0% 100%',
    ring: '140 55% 32%',
    destructive: '0 72% 48%',
    'destructive-foreground': '0 0% 100%',
  },
}

// --- Doctor: clinical teal + clean white ------------------------------------
export const doctor: ThemeDefinition = {
  name: 'doctor',
  label: 'Doctor',
  description: 'Clinical and calm: teal and clean blues on crisp white.',
  icon: '🩺',
  dark: {
    background: '205 40% 9%',
    foreground: '200 24% 92%',
    card: '205 36% 13%',
    'card-foreground': '200 24% 92%',
    muted: '205 25% 19%',
    'muted-foreground': '200 16% 74%',
    border: '205 22% 25%',
    input: '205 22% 25%',
    primary: '190 85% 38%',
    'primary-foreground': '0 0% 100%',
    accent: '210 90% 56%',
    'accent-foreground': '0 0% 100%',
    ring: '190 85% 38%',
    destructive: '0 72% 55%',
    'destructive-foreground': '0 0% 100%',
  },
  light: {
    background: '200 40% 97%',
    foreground: '205 45% 14%',
    card: '0 0% 100%',
    'card-foreground': '205 45% 14%',
    muted: '200 30% 92%',
    'muted-foreground': '205 20% 36%',
    border: '200 25% 84%',
    input: '200 30% 91%',
    primary: '190 90% 32%',
    'primary-foreground': '0 0% 100%',
    accent: '210 90% 46%',
    'accent-foreground': '0 0% 100%',
    ring: '190 90% 32%',
    destructive: '0 72% 48%',
    'destructive-foreground': '0 0% 100%',
  },
}

// --- Scientist: lab violet + cyan -------------------------------------------
export const scientist: ThemeDefinition = {
  name: 'scientist',
  label: 'Scientist',
  description: 'Lab-grade violet with a bright cyan reaction accent.',
  icon: '🔬',
  dark: {
    background: '250 30% 9%',
    foreground: '250 18% 92%',
    card: '250 28% 13%',
    'card-foreground': '250 18% 92%',
    muted: '250 20% 19%',
    'muted-foreground': '250 14% 74%',
    border: '250 18% 26%',
    input: '250 18% 26%',
    primary: '265 65% 52%',
    'primary-foreground': '0 0% 100%',
    accent: '180 80% 45%',
    'accent-foreground': '190 45% 10%',
    ring: '265 65% 52%',
    destructive: '0 72% 55%',
    'destructive-foreground': '0 0% 100%',
  },
  light: {
    background: '250 40% 97%',
    foreground: '255 42% 14%',
    card: '0 0% 100%',
    'card-foreground': '255 42% 14%',
    muted: '250 30% 93%',
    'muted-foreground': '255 18% 38%',
    border: '250 25% 85%',
    input: '250 30% 92%',
    primary: '265 62% 48%',
    'primary-foreground': '0 0% 100%',
    accent: '185 80% 34%',
    'accent-foreground': '0 0% 100%',
    ring: '265 62% 48%',
    destructive: '0 72% 48%',
    'destructive-foreground': '0 0% 100%',
  },
}

// --- Soccer: pitch grass + lime ---------------------------------------------
export const soccer: ThemeDefinition = {
  name: 'soccer',
  label: 'Soccer',
  description: 'Match-day pitch: vivid grass green and fresh lime.',
  icon: '⚽',
  dark: {
    background: '140 35% 8%',
    foreground: '120 14% 92%',
    card: '140 30% 12%',
    'card-foreground': '120 14% 92%',
    muted: '140 22% 18%',
    'muted-foreground': '120 12% 74%',
    border: '140 20% 24%',
    input: '140 20% 24%',
    primary: '142 72% 38%',
    'primary-foreground': '0 0% 100%',
    accent: '90 70% 48%',
    'accent-foreground': '100 45% 10%',
    ring: '142 72% 38%',
    destructive: '0 72% 55%',
    'destructive-foreground': '0 0% 100%',
  },
  light: {
    background: '120 40% 96%',
    foreground: '140 40% 12%',
    card: '0 0% 100%',
    'card-foreground': '140 40% 12%',
    muted: '120 28% 90%',
    'muted-foreground': '140 18% 34%',
    border: '120 22% 81%',
    input: '120 28% 90%',
    primary: '142 68% 32%',
    'primary-foreground': '0 0% 100%',
    accent: '90 60% 36%',
    'accent-foreground': '0 0% 100%',
    ring: '142 68% 32%',
    destructive: '0 72% 48%',
    'destructive-foreground': '0 0% 100%',
  },
}

/** All built-in themes, in picker order. Space is the default. */
export const themes: ThemeDefinition[] = [space, dino, doctor, scientist, soccer]
