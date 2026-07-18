# Changelog

All notable changes to `@a4ui/core` are documented here. This project adheres to
[Semantic Versioning](https://semver.org/) (pre-1.0: `minor` may include behavior
changes, `patch` for fixes).

## [Unreleased]

### Added

- `ThemedScenery` now carries the same live effects as `SpaceBackground` on every
  theme — cursor glow, magnetic buttons (`.magnetic`), card edge-glow
  (`.glow-edge`), a gently breathing nebula, and motif glyphs that streak across
  ambiently and launch on a background click. The shared pointer effects were
  factored into `bindPointerFx` (used by both backdrops).

## [0.4.0] — 2026-07-17

### Added

- **Themes** — swappable color palettes (all 15 tokens × dark/light) as pure data.
  Five built-ins: `space` (default), `dino`, `doctor`, `scientist`, `soccer`.
  New API: `selectTheme(name | def)`, `initTheme()` (restores the saved theme from
  `localStorage`), `applyThemeDefinition`, `activeTheme`, `themeToCss`/`themeToJson`,
  and the `ThemeDefinition`/`Palette` types. Distinct from the light/dark
  `setTheme`/`toggleTheme` mode switch — a theme recolors underneath either mode.
- The `SpaceBackground` starfield (nebula, aurora, planets, glow, constellations)
  now tints from the active theme's `--primary`/`--accent`/`--destructive` tokens,
  so switching themes recolors the whole backdrop.
- `ThemedScenery` — a lightweight, token-tinted backdrop for non-`space` themes
  (themed nebula + a field of slowly floating motif glyphs). Each theme carries a
  small optional `motifs` array (e.g. dino 🦕🌿🦴, soccer ⚽🥅), so a distinct
  scene per theme costs almost nothing instead of bundling a bespoke background.
- ESLint (flat config) + Prettier + a Vitest unit-test suite for the helpers.
- An automated accessibility gate (`@axe-core/playwright`): a WCAG 2 A/AA scan
  plus a color-contrast pass across every theme × light/dark (`npm run test:a11y`).
- Continuous integration (`ci.yml`) running typecheck, lint, unit tests, build,
  and the Playwright E2E suite on every push/PR.
- `CONTRIBUTING.md`, this changelog, and issue/PR templates.

### Fixed

- Every built-in theme now clears WCAG AA text contrast on solid surfaces
  (primary/accent/destructive buttons and badges) in both light and dark — the
  green/teal/red tokens were darkened and the warm accents use dark foreground
  text. The default `destructive` was nudged darker for the same reason.
- Fixed a `localStorage` key clash: the theme (palette) and the light/dark mode
  were both stored under `a4ui-theme` and overwrote each other; the palette now
  uses `a4ui-theme-name`, so the two persist independently.
- The docs `Select` example carries an `aria-label` (accessible name).
- `AppShell` page transitions no longer deadlock with lazy (suspending) routes —
  dropping the `outin` mode fixed the content column occasionally staying blank
  when navigating between views.
- `theme`/`effects` no longer access the DOM at module load, so importing the
  package no longer throws in a non-browser (SSR) context. (The components
  themselves are still client-rendered — see the README "Server rendering" note.)

## [0.3.0] — 2026-07-17

### Added

- JSDoc with `@example` on every public export, shipped in the `.d.ts`.
- `llms.txt` (machine-readable component guide) + a "Using with AI agents" README section.

### Changed

- Darkened the primary color (blue L60 → L52) so white-on-primary meets WCAG AA
  contrast. Docs site now scores 100/100/100/100 on Lighthouse.

## [0.2.0] — 2026-07-17

### Added

- i18n override props: `Pagination.labels`, `DateField.months`/`weekdays`,
  `Modal`/`Drawer` `closeLabel`, `ThemeToggle`/`EffectsToggle` `label`.

### Changed

- Default user-facing strings are now English (were Spanish).

## [0.1.0] — 2026-07-16

- Initial release: ~40 components (Kobalte behavior + Tailwind glass preset +
  motion), the generic `AppShell` + `SpaceBackground`, `VirtualList`, motion
  helpers, and the `@a4ui/core/preset` + `@a4ui/core/styles.css` entry points.

[unreleased]: https://github.com/A4uikit/a4ui/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/A4uikit/a4ui/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/A4uikit/a4ui/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/A4uikit/a4ui/releases/tag/v0.1.0
