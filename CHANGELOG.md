# Changelog

All notable changes to `@a4ui/core` are documented here. This project adheres to
[Semantic Versioning](https://semver.org/) (pre-1.0: `minor` may include behavior
changes, `patch` for fixes).

## [Unreleased]

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
- ESLint (flat config) + Prettier + a Vitest unit-test suite for the helpers.
- Continuous integration (`ci.yml`) running typecheck, lint, unit tests, build,
  and the Playwright E2E suite on every push/PR.
- `CONTRIBUTING.md`, this changelog, and issue/PR templates.

### Fixed

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
