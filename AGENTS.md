# AGENTS.md

Conventions for humans and AI agents (Claude Code, Codex, Cursor, …) working on
this repo. Read this before making changes.

## What this is

**A4ui** (`@a4ui/core`) — a "Spatial Glass" design system & component library for
**SolidJS**: glassmorphism surfaces, an animated starfield backdrop, light/dark
themes, and ~40 components. Built on **Kobalte** (behavior / a11y), a **Tailwind
preset** (visual), and **solid-transition-group + solid-motionone** (motion).

## Repo layout

- `src/` — the published library:
  - `src/ui/*` — components. `src/layout/*` — `AppShell`, `SpaceBackground`, toggles.
    `src/lib/*` — helpers (`cn`, `theme`, `motion`, `effects`, `media`, `virtual`).
    `src/themes/*` — swappable color palettes (`palettes.ts` = the theme data;
    `index.ts` = `selectTheme`/`applyThemeDefinition`/`initTheme` runtime).
    `src/styles/*` — `tokens.css` (CSS vars + motion `@keyframes`) and `space.css`
    (starfield). `src/index.ts` — public entry (re-exports everything).
- `preset.js` — the Tailwind preset: semantic colors → CSS vars, fonts, radius, and
  the **glass surface plugin** (`.card` / `.bg-glass` / `.glow-edge` / calm mode).
  Shipped in the package.
- `preview/` — the **docs site** (dev-only, NOT published). Vite SPA with hash
  routing; **`preview/registry.tsx` is the single source of truth** for the docs.
- `tests/` — Playwright suite (`docs.spec.ts`): every doc renders + key behaviors,
  on desktop **and** mobile.
- `.github/workflows/` — `pages.yml` (deploy docs to GitHub Pages on push to `main`)
  and `publish.yml` (publish to npm on GitHub Release, via **OIDC trusted publishing**).

## Commands

```bash
npm run build        # library build (ESM + .d.ts + styles.css)
npm run preview      # docs dev server        · preview:build for a static build
npm run typecheck    # tsc --noEmit
npm test             # Playwright suite (auto-starts/reuses the preview server)
```

## Conventions

- **Commits:** atomic, in **English**, Conventional-Commits style
  (`feat:` `fix:` `docs:` `chore:` `ci:` `test:`). **No AI attribution** — never
  add `Co-Authored-By:` or "Generated with …" trailers.
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
4. `npm run typecheck && npm run build && npm test` must stay green.

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
- Docs — https://a4uikit.github.io/a4ui/
- Repo — https://github.com/A4uikit/a4ui
