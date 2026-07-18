# Changelog

All notable changes to `@a4ui/core` are documented here. This project adheres to
[Semantic Versioning](https://semver.org/) (pre-1.0: `minor` may include behavior
changes, `patch` for fixes).

## [Unreleased]

## [0.10.0] — 2026-07-18

### Added

- **Charts** in a new subpath entry **`@a4ui/core/charts`** — `Sparkline`,
  `BarChart`, and `DonutChart`, all native SVG (no chart-library dependency) and
  theme-tinted (they recolor with the palette).
- **`FileUpload`** — a drag-and-drop uploader with a per-file list: progress bar
  while uploading, done state, error + retry, image preview, and remove. Controlled
  (the consumer owns the list and the actual upload).
- **`MultiSelect`** — a searchable multi-select dropdown with removable chips.
- An **Admin** example template that dogfoods the charts, `MultiSelect`, and `Stat`.

## [0.9.0] — 2026-07-18

### Added

- **Commerce components** in a new subpath entry **`@a4ui/core/commerce`** (keeps
  the base package lean): `PriceTag`, `QuantityStepper`, `ProductCard`,
  `ProductGrid`, `CartLine`, `CartSummary`, and `FilterGroup`.
- **Form / Field primitives**: `FormField`, `FormLabel`, `FormControl`,
  `FormDescription`, `FormError` — a label/control/description/error share one
  auto-generated id for accessibility (pairs with any schema validator).
- **`DateRangePicker`** — start/end selection on one calendar with a highlighted
  band (built on the shared `CalendarCore`).
- Two example templates that dogfood the above: **Storefront** (faceted filters +
  product grid) and **Checkout** (cart lines + shipping form + order summary).

## [0.8.1] — 2026-07-18

### Added

- **`TimeField`** (hour/minute picker, 12/24h) and **`DateTimeField`** (date + time).
- Date pickers now have **fast navigation**: click the month or year in the header
  to jump to a month/year picker, and double chevrons step a whole year. `Calendar`
  and `DateField` share a new internal `CalendarCore`.
- Docs sidebar is now **collapsible accordions** by category (a "Components"
  section with per-category sub-accordions + a "Get started" section), so the long
  list no longer buries the categories.
- `scripts/test-package.mjs` (`npm run test:package`) — installs the packed
  tarball into a clean project and checks the entry points resolve. `prepublishOnly`
  now runs `validate` (typecheck + lint + unit + build).
- `engines.node >= 20`; `exports` gained `default` conditions and `./package.json`.

### Fixed

- **`Progress`** fill ignored `max` — a bare fill div filled the whole track, so
  every bar read 100% (visible in the Analytics example). Same fix as `Meter`.
- **Mobile phantom scroll**: the page cross-fade left the outgoing (lazy) page
  mounted, stacking its height below the new page — navigating from the tall Home
  to a short doc produced a huge empty scroll region. Removed the transition.
- The **Examples** nav button was hidden on mobile; it's now reachable.
- Example pages use real (free) images (`Product`, `Profile`, `Members`); the
  `Profile` cover banner was also trimmed.

### Changed

- README rewritten: 75+ component count, a per-category table, an honest
  comparison, and Tailwind shown as optional (styles work without it).
- `COMPONENT-ROADMAP.md` rewritten as Stable / Beta / Planned (it wrongly listed
  shipped components as "missing"). `AGENTS.md` updated with the recent additions.

## [0.8.0] — 2026-07-18

### Added

- **Web Components build** (`@a4ui/core/elements`) — a curated set of
  presentational components registered as framework-agnostic custom elements
  (`<a4-button>`, `<a4-badge>`, `<a4-alert>`, `<a4-spinner>`, `<a4-avatar>`,
  `<a4-progress>`, `<a4-meter>`, `<a4-ring-progress>`, `<a4-stat>`, `<a4-kbd>`,
  `<a4-separator>`, `<a4-rating>`, `<a4-countdown>`, `<a4-clock>`). The bundle is
  self-contained (Solid compiled in) and ships a precompiled `elements.css`, so
  it works in **React/Next.js, Vue, or plain HTML** with no Solid toolchain.
- **`Sortable`** — a generic drag-to-reorder list (pointer-based, touch-friendly;
  grip handle, floating clone, dashed placeholder).
- **`Clock`** — a live clock with digital and analog variants, optional seconds,
  12/24-hour, and IANA time zone.
- **`INTEGRATIONS.md`** — setup guides for Vite+Solid, SolidStart (with SSR
  notes), Astro, and the Web Components path for React/Next.js/Vue/vanilla.

### Fixed

- **`Countdown`** no longer freezes. A parent expression like
  `to={new Date(Date.now() + X)}` compiles to a getter Solid re-reads every tick,
  which pinned the remaining time at `X`; the target is now captured once. Digits
  also animate with an odometer-style roll.
- **`Meter`** fill now respects `max` — it derived its width from the raw value,
  so e.g. `value=38 max=50` read "76%" but filled only ~38%.
- **`Separator`** vertical variant is now visible: Kobalte renders an `<hr>` whose
  default margins/zero-height defeated `self-stretch`; it now resets those and
  fills its container height.
- **`CalendarHeatmap`** now shows month labels across the top and weekday labels
  (Mon/Wed/Fri) down the side.
- Docs `Image` demo uses a base-aware asset path, so it loads on the deployed
  subpath (`/a4ui/`) instead of 404-ing.
- `preset.js` imports `tailwindcss/plugin.js` with an explicit extension, so it
  resolves under strict Node ESM tooling (not just bundlers).

## [0.7.0] — 2026-07-18

### Added

- The **last four roadmap components**: `ColorPicker` (native picker + hex field +
  swatches), `Comment` (threaded replies), `CalendarHeatmap` (contribution-style
  activity grid), and `Portal` (render into a detached DOM node). The component
  roadmap is now essentially complete.

## [0.6.0] — 2026-07-18

### Added

- **6 more components** (all theme-agnostic, accessible, documented):
  `DataGrid` (sortable / filterable / paginated table), `TreeSelect`,
  `Cascader` (cascading columns), `Mentions` (@-autocomplete textarea),
  `Tour` (spotlight coachmarks), and `NotificationCenter` (bell + dismissible
  feed). That's ~34 of the roadmap's missing components now shipped.

## [0.5.0] — 2026-07-18

### Added

- **28 new components** (all theme-agnostic, accessible, documented):
  - Data & display: `Carousel`, `Timeline`, `List`, `Descriptions`, `AvatarGroup`,
    `Tree`, `Image` (lightbox), `Highlight`, `Countdown`, `RingProgress`, `Marquee`.
  - Inputs & forms: `Rating`, `TagInput`, `Transfer`, `Calendar`.
  - Navigation & actions: `Stepper`, `Anchor` (scroll-spy TOC), `BottomNavigation`,
    `Command` (⌘K palette), `FloatingActionButton`, `SpeedDial`, `BackToTop`.
  - Layout & feedback: `Splitter` (resizable panes), `Collapse`, `Affix`, `Result`,
    `Empty`, `Kbd`.
- **Two festive themes**: `snow` (falling snowflakes, a snow bank, a frosted cap
  on cards) and `christmas` (night sky, snow, a light garland, a pine tree, and
  Santa's sleigh crossing the sky). New bespoke scenery components `SnowScenery`
  and `ChristmasBackground`; palettes verified WCAG AA. There are now **7 themes**.

### Fixed

- `Checkbox` now uses `accent-primary`, so its check follows the active theme
  (it was a hardcoded browser blue).

### Changed

- Lighthouse report + badges now reflect the **live deployed site** (desktop):
  Performance **97**, Accessibility/Best-Practices/SEO **100**. (The earlier 100
  Performance was a localhost/lab run; over the real GitHub Pages CDN the TTFB
  adds ~120 ms.) The published report is measured against the live URL.

## [0.4.3] — 2026-07-18

### Changed

- README Lighthouse badges now link to the published Lighthouse report
  (`/lighthouse.html`) instead of the docs home. Scores re-verified at 100 across
  Performance / Accessibility / Best Practices / SEO after adding a `robots.txt`.
  (Docs-site changes — a themes tutorial page, live theme-settings persistence,
  the Lighthouse showcase, and GitHub/npm links — ship on the site, not the npm
  package.)

## [0.4.2] — 2026-07-18

### Fixed

- The card edge-glow (`.glow-edge`) was hardcoded cyan/blue, so it stayed blue on
  every theme once the effect was shared across themes. It now derives from the
  theme's `--primary`/`--accent`, so the glow matches the theme (green for dino,
  teal for doctor, etc.); space stays blue.

## [0.4.1] — 2026-07-18

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
