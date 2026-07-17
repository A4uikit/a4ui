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
4. `npm run typecheck && npm run build && npm test` must stay green.

## Releasing to npm

Publishing is automated via **OIDC trusted publishing** — no tokens or 2FA prompts.

```bash
npm version patch    # or minor / major — bumps package.json + tags vX.Y.Z
git push && git push --tags
gh release create vX.Y.Z --generate-notes
```

Creating the GitHub Release triggers `.github/workflows/publish.yml`, which runs
`npm publish --provenance --access public` via OIDC.

## Links

- npm — https://www.npmjs.com/package/@a4ui/core
- Docs — https://a4uikit.github.io/a4ui/
- Repo — https://github.com/A4uikit/a4ui
