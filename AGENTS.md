# AGENTS.md

Conventions for humans and AI agents (Claude Code, Codex, Cursor, …) working on
this repo. Read this before making changes.

## What this is

**A4ui** (`@a4ui/core`) — a "Spatial Glass" design system & component library for
**SolidJS**: glassmorphism surfaces, an animated starfield backdrop, light/dark
themes, and ~60 components. Built on **Kobalte** (behavior / a11y), a **Tailwind
preset** (visual), and **Motion** (motion.dev, the `motion` package — JS animation).
Ships both as SolidJS components and as a **Web Components** bundle
(`@a4ui/core/elements` + `elements.css`) for React/Next.js/Vue/vanilla.

## Repo layout

- `src/` — the published library:
  - `src/ui/*` — ~60 components (Button, Card, DateField, Calendar, Combobox,
    DataGrid, Tree/TreeSelect/Cascader, ColorPicker, Comment, Tour,
    NotificationCenter, Command, Sortable, Clock, CalendarHeatmap, and more).
    **Motion components** (built on the `motion` engine, adapted from motion.dev
    examples, all tree-shakeable + reduced-motion aware): `ScrambleText`,
    `TextReveal`, `HoldToConfirm`, `LoadingDots`, `FillText`, `Curtain`, `Parallax`,
    `NotificationStack`, `MultiStateBadge`, `NowPlaying`, `Expandable` (shared-element
    FLIP), `Typewriter`, `Ripple`, `Magnetic`, `TiltCard`, `Spotlight`,
    `ScrollProgress`, `GradientText`, plus the `flyToCart` helper.
    `Calendar`/`DateField` share `src/ui/internal/CalendarCore.tsx` (day/month/year
    drill-down + year jumps). `src/layout/*` — `AppShell`, `SpaceBackground`, toggles.
    `src/lib/*` — helpers (`cn`, `theme`, `motion`, `effects`, `media`, `virtual`).
    `src/themes/*` — swappable color palettes (`palettes.ts` = the theme data;
    `index.ts` = `selectTheme`/`applyThemeDefinition`/`initTheme` runtime).
    `src/styles/*` — `tokens.css` (CSS vars + motion `@keyframes`) and `space.css`
    (starfield). `src/index.ts` — public entry (re-exports everything).
  - `src/elements.tsx` — Web Components bridge; `vite.elements.config.ts` +
    `scripts/build-elements-css.mjs` build a self-contained bundle (`elements.js` +
    `elements.css`) that registers `<a4-*>` custom elements for React/Next.js/Vue/vanilla.
  - `src/commerce/` — domain set shipped as the subpath entry `@a4ui/core/commerce`
    (its own `index.ts` barrel + a `commerce` entry in `vite.config.ts` + a
    `./commerce` export). New category sets (e.g. charts) follow the same pattern so
    the base package stays lean.
- `preset.js` — the Tailwind preset: semantic colors → CSS vars, fonts, radius, and
  the **glass surface plugin** (`.card` / `.bg-glass` / `.glow-edge` / calm mode).
  Shipped in the package.
- `preview/` — the **docs site** (dev-only, NOT published). Vite SPA with hash
  routing; **`preview/registry.tsx` is the single source of truth** for the docs.
- `tests/` — Playwright suite: `docs.spec.ts` (every doc renders + behaviors,
  desktop & mobile) and `_*.spec.ts` (screenshot QA harness via
  `playwright.shots.config.ts`). PNGs land in `tests/__shots__/` (gitignored);
  run `npm test` to compare or update visuals before release.
- `.github/workflows/` — `pages.yml` (deploy docs to GitHub Pages on push to `main`),
  `cloudflare-pages.yml` (mirror the docs to **Cloudflare Pages** `a4ui.pages.dev` —
  reachable on mobile carriers that block GitHub's Fastly IPs; builds with `--base=/`,
  needs the `CLOUDFLARE_API_TOKEN` secret), and `publish.yml` (publish to npm on
  GitHub Release, via **OIDC trusted publishing**).

## Commands

```bash
npm run build        # library build (ESM + .d.ts + styles.css)
npm run preview      # docs dev server        · preview:build for a static build
npm run typecheck    # tsc --noEmit
npm test             # Playwright suite (auto-starts/reuses the preview server)
```

## Conventions

- **Language:** prose/replies to users are in **Spanish**; all **code**, comments,
  and **commit messages** stay in **English**. Commits carry **NO AI attribution**
  — never add `Co-Authored-By:` or "Generated with …" trailers.
- **Commits:** atomic, in **English**, Conventional-Commits style
  (`feat:` `fix:` `docs:` `chore:` `ci:` `test:`).
- **CSS doctrine (blocked):** anything Tailwind can express → Tailwind utilities in
  JSX. Glass surfaces → the plugin in `preset.js`. CSS variables + motion
  `@keyframes` → `src/styles/tokens.css`. Starfield → `src/styles/space.css`.
  **Do NOT create per-component CSS files.**
- **`solid-js` is a peer dep** and external in the build — never bundle it (two
  copies break reactivity). Design deps are `dependencies` (external in the build).
- **AppShell gotcha:** it wraps `children` in a `<Transition>` that expects a
  SINGLE routed child. Pass one root element; mount global overlays (Toaster,
  modals) as siblings **outside** `AppShell`.

## Adding a component

1. `src/ui/<Name>.tsx` — thin styled wrapper (Kobalte for behavior where it fits),
   `cn(...)` for classes, tokens via Tailwind utilities.
2. Re-export it from `src/index.ts`.
3. Add a `DocEntry` to `preview/registry.tsx` (id = kebab-case; blurb + live demo +
   code; optional `controls`). The render test is auto-generated from the registry;
   add a behavior test to `tests/docs.spec.ts` if it's interactive.
4. Update the docs that list components: `README.md` (category table + the "75+"/
   category counts), `AGENTS.md` (the `src/ui/*` list above), `CHANGELOG.md`
   (an entry), and `STABILITY.md` (classify it Stable/Experimental).
5. Consider wrapping leaf/primitive components as Web Components (register in
   `src/elements.tsx` + note them in `INTEGRATIONS.md`) and include them in at
   least one example page.
6. `npm run validate && npm test` must stay green.

## Keeping things in sync — what each change touches

**One source of truth cascades.** Editing `preview/registry.tsx` (the docs SSOT)
automatically updates the docs site, the auto-generated render tests, and
`llms.txt` (via `scripts/gen-llms.mjs`, run by `preview`/`preview:build`) — don't
hand-edit `llms.txt`. `A4UI_VERSION` auto-syncs from `package.json` on `prebuild`
(`scripts/sync-version.mjs`) — don't hand-edit it. The docs site auto-deploys on
push (GitHub Pages + Cloudflare Pages `a4ui.pages.dev`).

By change type, update:

- **Component** → see the checklist above.
- **Exports / packaging** (`package.json` `exports`/`files`) → also
  `scripts/test-package.mjs` (`REQUIRED_DIST_FILES` / `REQUIRED_EXPORT_KEYS`) and
  the README bundle-size table. Run `npm run test:package`.
- **A public integration path** (SSR, Web Components, subpaths) → `INTEGRATIONS.md`
  and, if it's a build-time claim, the `examples/*` consumer apps (CI builds them).
- **Release** → bump `package.json` `version` (source auto-syncs), move the
  `CHANGELOG.md` `Unreleased` items under the new version, then cut a GitHub
  Release (fires `publish.yml`). `prepublishOnly` runs `validate` (typecheck ·
  lint · format:check · unit · build · test:package) as the gate.

## Adding a theme — the recipe

A **theme** is pure data (the 15 color tokens × dark/light) — no CSS file, no
scenery required. `space` is the flagship default and matches `tokens.css`.
Follow this checklist so nothing gets forgotten (each step is a bug we've hit):

1. **Define it.** Add a `ThemeDefinition` to `src/themes/palettes.ts` (`name`,
   `label`, `icon`, `description`, `dark`, `light`, optional `motifs`) and push it
   into the `themes` array. Re-export from `src/themes/index.ts` (and from
   `src/index.ts` if it should be a top-level named export).
2. **Pass WCAG AA contrast — the easy one to forget.** Every solid surface must
   clear 4.5:1 against its foreground, in BOTH modes:
   - `primary`/`primary-foreground`, `accent`/`accent-foreground`,
     `destructive`/`destructive-foreground`, and text tokens on their surfaces.
   - White text needs a low-lightness surface: greens/teals fail around L38–40 —
     push them to ~L30–32. Blues/violets pass higher (~L52).
   - **Bright warm accents (amber, lime): use a _dark_ `accent-foreground`** rather
     than darkening the accent into mud.
   - Verify with `npm run test:a11y` (axe scans every theme × light/dark). Don't
     eyeball it — that's how the green/teal themes shipped failing.
3. **Add `motifs`** (6–8 emoji) for the backdrop. The docs auto-render
   `ThemedScenery` (token-tinted nebula + floating/flying motifs + cursor glow +
   magnetic + edge-glow) for any non-`space` theme via `AppShell`'s `background`
   slot. `space` keeps its bespoke `SpaceBackground`. No per-theme effect code.
4. **Run the gates:** `npm run typecheck && npm run lint && npm test` (the theme
   auto-appears in the picker, the unit test in `src/themes/themes.test.ts`
   validates token format, and `test:a11y` checks contrast).

### Invariant — never hardcode a color

Any color in a **shared** component, the **preset**, or `ThemedScenery` MUST be
`hsl(var(--token) / …)`, never a literal hue. A hardcoded hue looks fine on space
(blue) but stays blue on every other theme — this is exactly how the `.glow-edge`
edge-glow shipped blue on all themes. Hardcoded hues are only OK inside
`SpaceBackground`/`space.css` (space-only scenery).

## Workflow — how to push & release

Two separate flows. **Pushing code ≠ publishing a version.**

**1. Everyday changes** — push to `main`; the docs site redeploys automatically.

```bash
# make changes, then:
git add -A
git commit -m "type: short description"   # atomic, English, Conventional Commits, NO AI attribution
git push origin main                       # → GitHub Actions redeploys the docs (pages.yml)
```

Keep `npm run typecheck` / `npm run build` / `npm test` green before pushing.

**2. Publishing a new npm version** — cut a release; CI publishes via OIDC (no token).

```bash
npm version patch     # 0.1.1 → 0.1.2  (fix) · minor = feature · major = breaking
git push && git push --tags
gh release create vX.Y.Z --generate-notes
```

`npm version` bumps `package.json` + creates the `vX.Y.Z` tag. Creating the GitHub
Release triggers `.github/workflows/publish.yml`, which runs
`npm publish --provenance --access public` via **OIDC trusted publishing** — no
tokens, no passkey, no 2FA prompt.

> Semver (pre-1.0): `patch` for fixes, `minor` for features **or** behavior
> changes, `major` once the API stabilizes.

> If history was force-pushed on another machine, re-sync your clone with
> `git fetch origin && git reset --hard origin/main` (a plain `git pull` will fail).

## Links

- npm — https://www.npmjs.com/package/@a4ui/core
- Docs — https://a4ui.pages.dev/
- Repo — https://github.com/A4uikit/a4ui
