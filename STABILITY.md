# Stability & API policy

`@a4ui/core` is pre-1.0 (`0.x`). This document says plainly what that means for
you as a consumer: what's safe to build on today, what may still shift, and
what the road to `1.0` looks like. It's a companion to
**[CHANGELOG.md](./CHANGELOG.md)**, not a replacement for it — always read the
changelog before bumping a minor.

## 1. Versioning policy (pre-1.0)

A4ui follows [Semantic Versioning](https://semver.org/) with the standard
pre-1.0 relaxation:

| Bump        | Example         | May contain                                                                                                                |
| ----------- | --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **`patch`** | `0.13.1→0.13.2` | Bug fixes only. Safe to auto-update.                                                                                       |
| **`minor`** | `0.13.x→0.14.0` | New features **or breaking changes** — renamed props, removed exports, changed default behavior. Read the changelog first. |
| **`major`** | —               | Not used yet. Reserved for `1.0.0` and beyond.                                                                             |

While the package is `0.x`, **`minor` is the breaking-change boundary**, not
`major`. This is the same rule already stated in
[AGENTS.md](./AGENTS.md#workflow--how-to-push--release) and at the top of
[CHANGELOG.md](./CHANGELOG.md) — this document just spells out the
consequences for the public API surface.

## 2. Stability tiers

Every export falls into one of three tiers. The tier is about **how likely the
shape is to change**, not about quality — an Experimental component can be
fully tested and production-usable; it's just not API-frozen yet.

| Tier             | Meaning                                                                                                               | Change policy                                                                                                                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stable**       | Long-standing, widely used, API considered settled.                                                                   | Breaking changes only on a `minor`, and only with a changelog entry + (when practical) a deprecation window (see §4).                                                                                                  |
| **Experimental** | Newer surface, still being shaped by real usage.                                                                      | Props, behavior, or exports **may change in any `minor`** without a deprecation period. Usable in production, but pin your version and read the changelog before upgrading.                                            |
| **Internal**     | Not part of the public API. Not re-exported from `@a4ui/core` (or its subpaths), even if reachable via a deep import. | **Unsupported.** No stability guarantee, no changelog entries, can change or disappear in a `patch`. Deep-importing `@a4ui/core/dist/...` or the `src/ui/internal/*` / `src/lib/*` internals is done at your own risk. |

If you only ever `import { X } from '@a4ui/core'` (or a documented subpath —
`/commerce`, `/charts`, `/elements`, `/preset`) you are always consuming
Stable or Experimental surface, never Internal.

## 3. Current surface, by tier

This groups the real exports in `src/index.ts` (and the subpath barrels) —
see that file for the exhaustive list.

### Stable

| Group                  | Examples                                                                                                                                                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Form primitives        | `Input`, `Select`, `Checkbox`, `Switch`, `RadioGroup`, `Textarea`, `NumberInput`, `Slider`, `Toggle`, `ToggleGroup`, `SegmentedControl`                                                                                                                  |
| Core structural        | `Button`, `Card`/`CardHeader`/`CardTitle`/`CardContent`, `Badge`, `Separator`, `Avatar`, `Spinner`, `Progress`, `Meter`                                                                                                                                  |
| Overlays               | `Modal`, `Drawer`, `Popover`, `Tooltip`, `HoverCard`, `AlertDialog`, `ContextMenu`                                                                                                                                                                       |
| Navigation & structure | `Tabs`, `Breadcrumb`, `Pagination`, `Table` (+ subcomponents)                                                                                                                                                                                            |
| Feedback               | `Alert`, `Toast`/`Toaster`, `Skeleton`, `Empty`, `Result`                                                                                                                                                                                                |
| Layout                 | `AppShell`, `SpaceBackground`, `NavGroup`, `ThemeToggle`, `EffectsToggle`                                                                                                                                                                                |
| Theme runtime          | `initTheme`, `selectTheme`, `applyThemeDefinition`, `themes`, the bundled palettes (`space`, `dino`, `doctor`, `scientist`, `soccer`, `snow`, `christmas`), `themeToCss`, `themeToJson`, `TOKEN_ORDER`, `useTheme`/`toggleTheme`/`setTheme`/`applyTheme` |
| Styling                | The Tailwind **`preset`** (`@a4ui/core/preset`), `styles.css`, `full.css`                                                                                                                                                                                |
| Framework helpers      | `cn`, `useMediaQuery`, `prefersReducedMotion`, `motionReduced`                                                                                                                                                                                           |

These have been in the package the longest, are exercised by the full docs +
Playwright suite, and are the ones covered by the "freeze the Stable surface"
goal in §5.

### Experimental

May change shape (props, return values, even removal/renaming) in **any**
`minor` release, without a deprecation cycle:

| Group                                                    | Examples                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Motion components** (newest category, added `0.13.0`+) | `ScrambleText`, `TextReveal`, `Typewriter`, `GradientText`, `HoldToConfirm`, `LoadingDots`, `FillText`, `Curtain`, `Parallax`, `ScrollProgress`, `Ripple`, `Magnetic`, `TiltCard`, `Spotlight`, `NotificationStack`, `MultiStateBadge`, `NowPlaying`, `Expandable`, the `flyToCart` helper |
| Motion imperative API (re-exported from `motion.dev`)    | `animate`, `inView`, `scroll`, `stagger`, `spring`, `animateIn`, `revealOnScroll`, `createCountUp`                                                                                                                                                                                         |
| **`@a4ui/core/commerce`** subpath                        | `ProductCard`, `ProductGrid`, `PriceTag`, `QuantityStepper`, `CartLine`, `CartSummary`, `FilterGroup`, `createCart`                                                                                                                                                                        |
| **`@a4ui/core/charts`** subpath                          | `Sparkline`, `BarChart`, `DonutChart`                                                                                                                                                                                                                                                      |
| **`@a4ui/core/elements`** (Web Components)               | The whole `<a4-*>` custom-element bundle — the underlying Solid components are Stable/Experimental per the table above, but the _elements bridge itself_ (attribute/prop mapping, event naming, bundling) is newer and still settling                                                      |
| Recently-added standalone components                     | `Sortable`, `Clock`, `CalendarHeatmap`, `Comment`, `ColorPicker`, `Tour`, `Command`, `NotificationCenter`, `Cascader`, `TreeSelect`, `Mentions`, `SpeedDial`, `BottomNavigation`, `Marquee`, `DataGrid`, `Section`, `PricingTable`, `BeforeAfter`, `ActionBar`, `Configurator`             |

If you depend on anything in this tier, expect to read the changelog on every
`minor` bump that touches it.

### Internal — not part of the public API

| Group                                                         | Examples                                                                                                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared imperative internals                                   | `src/ui/internal/CalendarCore.tsx` (backs `Calendar`/`DateField`, not exported)                                                                         |
| `src/lib/*` internals not re-exported from `src/index.ts`     | anything in `lib/` you can only reach by deep-importing the file directly                                                                               |
| Scenery internals                                             | `SnowScenery`/`ChristmasBackground` internals, `ThemedScenery`'s imperative DOM/canvas building blocks not exposed as props                             |
| Anything under `dist/` not listed in a documented entry point | e.g. reaching into compiled chunk files instead of `@a4ui/core`, `@a4ui/core/commerce`, `@a4ui/core/charts`, `@a4ui/core/elements`, `@a4ui/core/preset` |

**Importing an internal path is unsupported.** It can be renamed, inlined, or
deleted in a `patch` release with no changelog entry, because it was never
part of the contract.

## 4. Deprecation policy

When something in the **Stable** tier needs to change shape:

1. The old API keeps working for **at least one `minor` release**, emitting a
   `console.warn` (or a clearly marked "deprecated" note in its JSDoc/`.d.ts`
   `@example` and the docs entry) pointing at the replacement.
2. The changelog gets a `### Deprecated` entry naming the old and new API.
3. The old API is only actually **removed on a subsequent `minor`** — never on
   a `patch`.

**Experimental** exports don't get this courtesy by default — they can change
or disappear in the same `minor` with just a changelog note, precisely because
they're marked Experimental. If a deprecation window is practical we'll still
give one, but it isn't guaranteed the way it is for Stable.

## 5. Road to 1.0

`1.0` means: **the Stable surface stops changing shape.** Not "feature
complete" — stable. Remaining work:

- [ ] Freeze the Stable surface (§3) — no more breaking prop/behavior changes
      to that list without going through the full deprecation cycle.
- [ ] Resolve every current Experimental entry: promote it to Stable (API has
      settled, used in production, no open shape questions) or intentionally
      drop/rework it before it can accrue more consumers.
- [x] Add real SSR/React consumer tests to CI — `examples/solidstart-ssr`
      (exercises the `solid` condition + server render) and
      `examples/react-webcomponents` build in the CI `examples` matrix. _(Astro
      still pending.)_
- [x] Start a migration guide — **[MIGRATION.md](./MIGRATION.md)** covers the
      `0.x` line (mostly additive; the Motion-engine change in 0.11.0 is the only
      one needing action). The `0.x` → `1.0` breaking pass gets appended there.
- [x] Audit the published npm files — `scripts/test-package.mjs` packs, installs
      and verifies the tarball (dist files + `exports` keys + version) on every
      `validate`/publish; `files` was tightened to just what the `solid`
      condition needs.
- [x] Establish visual-regression baselines — `playwright.visual.config.ts` +
      `tests/_visual.spec.ts` screenshot static-primitive demos, compared in the
      `Visual regression` workflow. _(Baselines seed on the first Linux
      `workflow_dispatch` run.)_

## 6. How to depend on A4ui today

- **Pin a minor** (e.g. `"@a4ui/core": "0.13.1"` or `~0.13.0`, not `^0.13.0`)
  — a `minor` bump can break you.
- **Read [CHANGELOG.md](./CHANGELOG.md) before bumping a minor**, especially
  for anything you use from the Experimental tier.
- **Avoid deep imports.** Only import from `@a4ui/core`, `@a4ui/core/commerce`,
  `@a4ui/core/charts`, `@a4ui/core/elements`, `@a4ui/core/preset`,
  `@a4ui/core/styles.css`, and `@a4ui/core/full.css`. Anything else is
  Internal (§3) and unsupported.
- If you need a component's stability tier confirmed, check this document
  first, then the export's JSDoc in the shipped `.d.ts`.
