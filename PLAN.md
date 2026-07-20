# A4ui roadmap — component expansion

Working plan for growing `@a4ui/core` into the areas where it's currently thin,
without losing the "Spatial Glass" identity. Tracked on GitHub —
**[#36](https://github.com/A4uikit/a4ui/issues/36)** is the live index; each item
below is its own issue with a deliverables checklist. This file mirrors that so
the plan survives in the working tree.

## Phase 1 — highest demand / biggest gaps

- **[#26](https://github.com/A4uikit/a4ui/issues/26)** — conversation / AI chat UI
  kit (`ChatThread`, `Message`, `StreamingText`, `Citation`, `PromptComposer`,
  `ArtifactPanel`). No coverage today; most-requested surface.
- **[#27](https://github.com/A4uikit/a4ui/issues/27)** — refractive glass material
  - elevation depth system + `FloatingToolbar`. Raises the core differentiator.
- **[#28](https://github.com/A4uikit/a4ui/issues/28)** — view & page transitions +
  optimistic-update helpers + inline row pickers. Cross-cutting motion.

## Phase 2 — breadth

- **[#29](https://github.com/A4uikit/a4ui/issues/29)** — ambient mesh-gradient
  backdrop (Aurora variant) + `CodeTabs`.
- **[#30](https://github.com/A4uikit/a4ui/issues/30)** — `PillSearch` +
  `CategoryStrip` + map/list sync.
- **[#31](https://github.com/A4uikit/a4ui/issues/31)** — slash-menu block editor +
  multi-view `DataView` (table/board/gallery/calendar).
- **[#33](https://github.com/A4uikit/a4ui/issues/33)** — master-detail command
  surface (`MasterDetail`, `DetailPane`).

## Phase 3 — verticals & polish

- **[#32](https://github.com/A4uikit/a4ui/issues/32)** — scroll-scrubbed scenes +
  sticky reveals.
- **[#34](https://github.com/A4uikit/a4ui/issues/34)** — finance dashboard set
  (`BalanceCard`, `TransactionFeed`, `KpiBlock`, `MoneyActionButton`).
- **[#35](https://github.com/A4uikit/a4ui/issues/35)** — swipeable spaces +
  vertical navigation rail.

## Working method

Per issue: build behind the repo conventions (`src/index.ts` export +
`preview/registry.tsx` DocEntry with auto render test + behavior tests + WCAG AA),
one example page per cluster, ship in versioned releases. Update the checklists on
each issue (and #36) as items land.
