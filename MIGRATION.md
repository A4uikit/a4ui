# Migration guide

Upgrade notes for `@a4ui/core`, newest first. See **[CHANGELOG.md](./CHANGELOG.md)**
for the full per-release detail and **[STABILITY.md](./STABILITY.md)** for the
versioning policy.

**Pre-1.0 rule:** while `0.x`, a **minor** (`0.x.0`) may include breaking changes
and a **patch** (`0.x.y`) is fixes only. In practice the `0.x` line has been
**mostly additive** — new components and entry points, not renamed/removed public
API. Only the entries below need any action; every other release is safe to bump
straight through. Read this before jumping more than one minor.

---

## → 0.14.0

Additive. New `Typewriter` / `Ripple` components. No consumer action. (An
`npm create a4ui` scaffolder now lives in the repo; until it's published to npm,
keep using `npx degit A4uikit/a4ui/starter my-app`.)

## → 0.12.0

Additive. **No action required**, but two new options are worth adopting:

- **No-Tailwind apps:** you can now import **`@a4ui/core/full.css`** (tokens **+**
  every utility precompiled) instead of `@a4ui/core/styles.css` + the Tailwind
  preset. `styles.css` alone is tokens/keyframes only — if your components looked
  unstyled without Tailwind before, this is the fix.
- **SSR (SolidStart / `vite-plugin-solid`):** the package ships a `solid` export
  condition, so components server-render then hydrate. Wrap the imperative
  backdrops (`SpaceBackground`, `ThemedScenery`, `SnowScenery`,
  `ChristmasBackground`) in SolidStart's `clientOnly()`.

## → 0.11.0 — animation engine change

The JS animation engine moved from Motion One v10 (`solid-motionone`) to
**[Motion](https://motion.dev) v12** (the `motion` package).

- **If you only use components** (`<Stat>`, etc.): **no action** — the public API
  is unchanged.
- **If you imported animation helpers** from `@a4ui/core`: the re-exported
  imperative API is now Motion v12 — **`animate`, `inView`, `scroll`, `stagger`,
  `spring`** (plus `animateIn` / `revealOnScroll`). The signatures match
  motion.dev; update any call sites that assumed the Motion One v10 shape.
- `motion` is a dependency now (external in the main build — only bundled when you
  import an animated component). `solid-motionone` and `solid-transition-group`
  were removed; if you depended on them **transitively through A4ui**, add them to
  your own `package.json`.

## → 0.1.0 – 0.10.x

Additive growth (new components/categories, theme runtime, Web Components bundle,
subpath entries `@a4ui/core/commerce` and `@a4ui/core/charts`). Nothing to migrate
— see the CHANGELOG for what landed where.

---

## Toward 1.0

`1.0` will freeze the **Stable** surface (see [STABILITY.md](./STABILITY.md)) and
resolve every **Experimental** item (Motion components, `commerce`/`charts`,
`elements`) — promoting or reworking them. Any breaking rename/removal from that
pass will be listed here with a before/after, so a `0.x` → `1.0` jump is a single
document.
