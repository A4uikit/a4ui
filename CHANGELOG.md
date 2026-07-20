# Changelog

All notable changes to `@a4ui/core` are documented here. This project adheres to
[Semantic Versioning](https://semver.org/) (pre-1.0: `minor` may include behavior
changes, `patch` for fixes).

## [Unreleased]

## [0.23.0] — 2026-07-20

### Added

- **Commerce components** (`@a4ui/core/commerce`):
  - **`PriceBlock`** — a richer price than `PriceTag`: struck compare-at with a
    savings badge, a coupon chip with the after-coupon price, and an optional
    financing estimate (standard amortization when APR > 0).
  - **`FacetSidebar`** — a faceted-filter panel: collapsible checkbox sections,
    a min/max price range, removable active-filter chips, a result count, and
    clear-all. Fully controlled.
  - **`ConditionScale`** — a graded-condition meter with a marker, resolved tier
    label, and endpoint labels (`role="meter"`).
- **Data / display components** (`@a4ui/core`):
  - **`SpecSheet`** — a grouped key/value specification table (1 or 2 columns).
  - **`RatingsSummary`** — a compact social-proof grid of aggregate ratings.
  - **`LogoWall`** — an "as seen in" logo grid, grayscale with color-on-hover.
- **`AnnouncementBar`** (`@a4ui/core`) — a full-bleed promo bar, optionally
  dismissible, with a copyable coupon-code pill.
- **Spatial Glass guide** — a canonical recipe for the A4ui look
  (`SPATIAL-GLASS.md`), rendered as a docs guide, embedded in `llms.txt`, and
  shipped as a Claude Code skill/plugin.

### Docs

- New example pages: **Boutique** (a faceted catalog with switchable
  product-card styles and a cart drawer) and **Showpiece** (a product detail
  page with a gallery lightbox, `PriceBlock`, `ConditionScale`, and `SpecSheet`).

## [0.22.0] — 2026-07-20

### Added

- **`Aurora` pointer glow** — Aurora now renders a soft glow that follows the
  cursor across the backdrop (and lights up any `.glow-edge` cards' cursor
  tracking), via the shared `bindPointerFx`. On by default; `pointerGlow={false}`
  to disable. Reduced-motion aware. Brings the "space theme" cursor-light to any
  page using Aurora — no `SpaceBackground` needed.

## [0.21.0] — 2026-07-20

### Added

- **`Aurora`** — an ambient backdrop of soft, blurred color blobs tinted with the
  theme tokens, so glass surfaces read as glass as content scrolls over it. The
  lightweight, no-starfield alternative to `SpaceBackground`/`ThemedScenery`;
  `intensity` + optional reduced-motion-aware `animated` drift.

### Changed

- Light-theme glass (`.card`) is a touch more transparent (`--card`/0.72 →
  /0.6) so the frosted blur reads over a backdrop (e.g. `Aurora`) on light
  themes. Text stays legible; dark themes unchanged.

## [0.20.0] — 2026-07-20

### Added

- **`Configurator`** — a data-driven "pick options → live preview + running
  total" builder (`select` / `counter` / `text` groups, controlled state,
  optional `preview` render-prop and `action` CTA). Distilled from the templates'
  engraving customizer and charcuterie board builder.

## [0.19.0] — 2026-07-20

### Added

- **`<Button href>`** — a Button with `href` (plus `target`/`rel`) now renders as
  an `<a>` link, keeping the variant look, focus ring, and ripple. For router
  links and `tel:`/`mailto:` CTAs — no more hand-rolled anchors that mirror
  Button's classes.

### Fixed

- **`Carousel`** dots now have a 24×24px hit area (a11y `target-size`) around the
  small visual dot, and expose `aria-current` on the active dot.

## [0.18.0] — 2026-07-20

Components distilled from repeated patterns while building the templates repo.

### Added

- **`Section`** — centered content container with a max width (`size`), vertical
  rhythm (`py`), and an optional `id` anchor. The layout wrapper every page repeats.
- **`PricingTable`** — tiered pricing cards with a highlighted "Popular" tier and
  an optional monthly/annual toggle (controlled or uncontrolled).
- **`BeforeAfter`** — draggable before/after image comparison slider (clip-path,
  keyboard-accessible, reduced-motion aware, engine-free).
- **`ActionBar`** — sticky action/emergency bar: a status slot + a prominent CTA
  (renders as `<a>` for `tel:`/links). For urgent-service pages.
- **`createCart`** (`@a4ui/core/commerce`) — a generic Solid signal cart store
  (`add`/`remove`/`setQty`/`clear`, reactive `count()`/`subtotal()`), so commerce
  pages stop hand-rolling one.

### Fixed

- `ProductCard` — the add-to-cart button now `stopPropagation`s, so a card wrapped
  in a link/router `<A>` adds to cart without also navigating.

## [0.17.0] — 2026-07-20

### Added

- **Motion baked into more components** (opt-in props, additive, all engine-free
  and reduced-motion aware — no `motion` dependency pulled):
  - **`<FloatingActionButton ripple>`** and a Material press ripple baked into
    the `SpeedDial` main button (same primitive as `<Button ripple>`).
  - **`<ProductCard tilt spotlight>`** — forwards the cursor tilt/glow to its
    underlying `Card`.
  - **`<Skeleton shimmer>`** — a token-tinted light band sweeps across the
    placeholder instead of the default pulse.
  - **`<Image blurUp>`** — reveals the thumbnail from blurred to sharp on load.
  - **`<Badge pulse>`** — a pinging dot for "live"/"recording"/"online" states.
  - **`<List stagger>`** — rows cascade in on mount, delayed per index.
  - **`<Carousel swipe>`** (default on) — drag/touch to swipe between slides;
    the track follows the pointer and snaps on release.
- **Animated height** baked into `Accordion` (open/close via Kobalte's measured
  content height) and `Collapse` (grid-rows CSS transition) — engine-free,
  reduced-motion aware.

## [0.16.0] — 2026-07-19

### Added

- **Motion baked into the primitives** (opt-in props, additive):
  - **`<Button ripple>`** — Material-style click ripple from the press position.
  - **`<Card tilt>`** — 3D hover tilt; **`<Card spotlight>`** — cursor-following
    glow. Combine freely with `glass`/`glow`.
  - The imperative primitives behind them are exported too: `spawnRipple`,
    `attachTilt`, `attachSpotlight` — attach the same flourishes to any element.
- A curated **hero showcase** at the hidden `#/hero` docs route (capture target
  for the README banner, `hero.png`).

### Changed

- `Ripple`, `TiltCard` re-implemented on the **Web Animations API / CSS**
  (previously Motion springs) so baking them into `Button`/`Card` adds zero
  bundle cost — the `motion` engine is no longer pulled by these three
  (`Spotlight` was already CSS-only). Same look; the tilt eases instead of
  springing. (Experimental tier, per [STABILITY.md](./STABILITY.md).)

## [0.15.0] — 2026-07-19

### Added

- **Motion components** — five more interaction/scroll animations, all
  tree-shakeable and reduced-motion aware: `Magnetic` (springs toward the
  cursor), `TiltCard` (3D tilt on hover), `Spotlight` (cursor-following glow,
  CSS-only), `ScrollProgress` (reading-progress bar tied to page scroll), and
  `GradientText` (animated multi-color gradient text).
- **Icons** are a documented feature (from 0.14.1): a4ui ships lucide-solid, so
  1500+ icons are ready to use, tree-shaken to only what you import.

### Docs

- The docs site gains a **Guides** section that renders the repo's long-form
  markdown (`INTEGRATIONS`, `STABILITY`, `MIGRATION`/Upgrading, `CHANGELOG`)
  directly — single-source, so the on-site guides never drift from the files.
- Removed `COMPONENT-ROADMAP.md`; **STABILITY.md** is now the single source for
  component maturity.

## [0.14.1] — 2026-07-19

### Docs

- **Icons** are now documented and promoted: a new _Icons_ page in the docs and an
  _Icons_ section in the README. A4ui already depends on **lucide-solid**, so its
  **1500+ icons** are ready to use with no extra install — and it's tree-shakeable
  (importing one icon ships only that icon). The install-footprint note is reframed
  to present lucide as a perk, not just a cost.
- Refresh the published README (analytics showcase image, `MIGRATION.md` link, and
  `npm create a4ui@latest` now that the scaffolder is published).
- Expanded the visual-regression baselines to more static primitives.

## [0.14.0] — 2026-07-19

### Added

- **Motion components:** `Typewriter` (types a string — or cycles an array —
  char-by-char with a blinking caret; CSS-driven, no `motion` dep) and `Ripple`
  (Material-style click ripple you wrap around anything). Motion docs category:
  18 demos.
- **`NotificationStack` expand** (from 0.13.1) plus this release's components are
  classified in the new **[STABILITY.md](./STABILITY.md)** (Stable / Experimental
  / Internal tiers + a road-to-1.0 checklist).
- **`create-a4ui`** scaffolder (`npm create a4ui@latest`) — a separate,
  dependency-free package that scaffolds a Solid + Vite + A4ui app (with or
  without Tailwind).

### Changed

- **Packaging hardened:** `validate`/`prepublishOnly` now also run `format:check`
  and `test:package`, and `test:package` covers the `commerce`/`charts`/`full.css`
  subpaths + asserts `A4UI_VERSION` matches `package.json`. `A4UI_VERSION` is now
  auto-synced from `package.json` on `prebuild`. `files` publishes only the source
  the `solid` SSR condition needs (dropped `src/styles` + `src/elements.tsx`).
  Added `packageManager`.

### Fixed

- `test:package` had 3 latent bugs (broke on paths with spaces; imported the
  Tailwind `preset` which needs `tailwindcss`; executed the client-Solid barrel in
  bare Node) — it now resolves entries instead of executing them and runs green.

## [0.13.1] — 2026-07-19

### Fixed

- **`NotificationStack`** now expands: clicking the stack (or the "Show all N"
  control) opens every notification as a scrollable list, and "Show less"
  collapses it back to the peek stack. Previously it only rendered the collapsed
  stack, so the list could never be read in full.

### Docs

- The docs site paints an instant, zero-JS **skeleton** on cold load (previewing
  the layout instead of a blank screen), and shows **skeleton loading states**
  for the docs and examples pages while their chunk streams in — replacing the
  bare spinner. Improves perceived load on slow mobile connections.

## [0.13.0] — 2026-07-18

### Added

- **Motion components** — reusable animation primitives adapted from motion.dev
  examples, all tree-shakeable and reduced-motion aware (the `motion` engine is
  external, so importing one is the only thing that pulls it):
  - `ScrambleText` — text that decodes from random glyphs (on mount or hover).
  - `TextReveal` — reveal a line word/char-by-char with a staggered fade.
  - `HoldToConfirm` — press-and-hold button; a fill sweeps and only fires at 100%.
  - `LoadingDots` — three dots bouncing in a staggered wave (CSS-driven).
  - `FillText` — a highlight band sweeping through text, for loading states.
  - `Curtain` — full-screen page/route transition with seven variants
    (`fade` · `doors` · `blinds` · `shutter` · `iris` · `clip` · `pixels`).
  - `Parallax` — wraps children and drifts them at a fraction of scroll speed.
  - `NotificationStack` — stacked notifications that peek behind one another and
    re-flow as they're dismissed.
  - `MultiStateBadge` — status pill that morphs color and swaps its icon across
    `idle` · `loading` · `success` · `error`.
  - `NowPlaying` — compact media widget with a live equalizer.
  - `flyToCart(source, target, opts)` — the "fly to basket" helper: a ghost arcs
    from the product to the cart icon, which then bumps.
  - `Expandable` — shared-element (FLIP) transition: a card morphs into an
    overlay panel and back, animating position + size (never scale, so content
    stays crisp). `size="dialog"` (family-photo modal) or `size="full"`
    (App-Store card expand).
- **Motion** docs category gains eleven new demos for the above (16 total).
- **README** now documents **partial vs full mounting** and per-part **gzip
  weights** (tree-shaking, `motion` as an opt-in external), with a
  Lighthouse/Cloudflare performance note.

### Changed

- `SpeedDial` actions now fan out with a staggered spring entrance (reduced-motion
  aware) instead of a plain CSS fade.

### Fixed

- `gen-llms` no longer silently drops entries whose `blurb` Prettier wrapped onto
  its own line (`blurb:\n  '…'`) — the extractor now tolerates the newline. This
  recovered ~13 components (and the `Stagger` demo) that were missing from
  `llms.txt`; it now lists 116 entries.

## [0.12.0] — 2026-07-18

### Added

- **SSR support** — the package now ships a `solid` export condition (its source),
  so **SolidStart** (and any `vite-plugin-solid` app) compiles the components for
  the server: they **server-render**, then hydrate. Only the imperative
  starfield/scenery backdrops stay client-only (`clientOnly()`). Addresses the
  SSR goal of [#1](https://github.com/A4uikit/a4ui/issues/1). (`src` is now
  published for this; test files are excluded.)
- **`@a4ui/core/full.css`** — a fully precompiled stylesheet (tokens + every
  utility the components use) for consumers **not** using Tailwind: import it
  instead of `styles.css`, no Tailwind build required.
- A **starter template**: `npx degit A4uikit/a4ui/starter my-app` scaffolds a
  preconfigured Solid + Vite + Tailwind + A4ui app.

### Fixed

- Docs corrected: the main package needs the **Tailwind preset** (or the new
  `full.css`) to style components — `styles.css` alone ships only CSS variables +
  motion keyframes. (The README/llms previously implied `styles.css` was
  self-sufficient.)

## [0.11.1] — 2026-07-18

### Added

- **`revealOnScroll(el, opts)`** — a reveal-once-on-scroll helper (fade + slide,
  via Motion's `inView`), reduced-motion aware. Exported alongside `animateIn`
  and the re-exported Motion API.
- Docs: a **Motion** page (Get started) with a live staggered-spring demo that
  teaches `animate` / `stagger` / `animateIn` / `revealOnScroll`.
- Example motion: the **Storefront** product grid staggers in on load, and
  **Landing** sections reveal on scroll.

## [0.11.0] — 2026-07-18

### Changed

- **Migrated the JS animation engine to [Motion](https://motion.dev)** (the
  `motion` package, v12) from Motion One v10 (`solid-motionone`). `Stat`'s
  entrance and count-up now run on Motion's `animate`. Removed `solid-motionone`
  and the now-unused `solid-transition-group`; added `motion` as a dependency
  (external in the main build — only bundled when you use an animated component;
  the self-contained `elements` bundle includes it).

### Added

- Re-export Motion's imperative API from the package — **`animate`**, **`inView`**,
  **`scroll`**, **`stagger`**, **`spring`** — plus **`animateIn(el, opts)`**, a
  reduced-motion-aware fade/slide entrance helper. Build scroll-linked reveals,
  staggered lists, and springs with the same engine the library uses.

## [0.10.2] — 2026-07-18

### Added

- Theme-aware **focus bloom** on text fields — `Input`, `Textarea`, `Select`,
  `NumberInput`, `Combobox`, `TagInput`, `Mentions`, and the date/time pickers
  glow in the active theme's `--ring` colour on focus (and `--destructive` when
  invalid). New `.a4-field` preset class; the hue and intensity follow the theme.
- **`ProductCard`** gains a brand eyebrow, a category tag, and a diagonal corner
  ribbon (top-right) tinted by intent (`badgeTone`: sale → destructive, new →
  primary, featured → accent; inferred from the badge text when omitted). It now
  renders on a frosted glass surface with the edge glow.
- **`CartSummary`** now uses the glass surface too.

### Fixed

- Storefront example: the Category/Brand facets now actually **filter** the
  product grid (OR within a facet, AND across); counts derive from the data;
  brand + category show on each card; added an empty state.

### Changed

- Docs example pages widen consistently on large screens (app pages to
  `max-w-7xl`, matching the Examples gallery) so the layout doesn't feel narrow
  on widescreens. (Preview only — the library `AppShell` default is unchanged.)

## [0.10.1] — 2026-07-18

### Fixed

- Calendar day cells were `role="gridcell"` without a `role="row"` parent —
  invalid ARIA that some engines honored, shadowing the cell's button role and
  accessible name. They're now plain buttons (`aria-pressed` for the selected
  day). Affects `Calendar`, `DateField`, `DateRangePicker`.
- `ProductCard` pins "Add to cart" to the bottom (flex column), so cards with
  differing content height line up in a grid row instead of leaving an empty gap
  under the shorter ones.
- Storefront example: the cart count badge only shows when the cart is non-empty
  and uses a filled, higher-contrast bubble.

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
