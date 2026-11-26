# A4ui roadmap — layout, forms and conversation expansion

Working plan for the next round of `@a4ui/core`. Tracked on GitHub —
**[#110](https://github.com/A4uikit/a4ui/issues/110)** is the live index; each item
below is its own issue with a deliverables checklist. This file mirrors that so the
plan survives in the working tree. The previous round (#26–#35, index #36) is done.

**Status at 0.39.1:** waves 0 to 3 are shipped, except TypeScript 7, blocked until
typescript-eslint supports it. Wave 4 (templates#24) is in review as
[templates#26](https://github.com/A4uikit/templates/pull/26).

## Wave 0 — security (serial)

- [#111](https://github.com/A4uikit/a4ui/pull/111) — dependency bump within current
  majors, `solid-js` peer floor `^1.9.16` (seroval advisories). Release as a patch.
- Templates bump from `@a4ui/core` 0.33 to the patched release.

## Wave 1 — base primitives (serial, small)

Pieces several later items build on, done first so the rest can run in parallel:

- `Drawer` `side` (left/top/bottom), `ScrollArea`, `Item` — part of
  [#102](https://github.com/A4uikit/a4ui/issues/102).

## Wave 2 — everything independent (parallel)

- [#99](https://github.com/A4uikit/a4ui/issues/99) — `Sidebar`
- [#100](https://github.com/A4uikit/a4ui/issues/100) +
  [#101](https://github.com/A4uikit/a4ui/issues/101) — `Field` + `InputGroup`
- [#102](https://github.com/A4uikit/a4ui/issues/102) (rest) — `ButtonGroup`,
  `AspectRatio`, `Label`, `NativeSelect`, `Prose`
- [#103](https://github.com/A4uikit/a4ui/issues/103) — chat extras (attachments,
  bubble variants, markers, history-aware scrolling)
- [#104](https://github.com/A4uikit/a4ui/issues/104) — `Questionnaire`
- [#105](https://github.com/A4uikit/a4ui/issues/105) — charts (stacked/grouped bars,
  area, pie, radial bar, shared tooltip + legend)
- [#106](https://github.com/A4uikit/a4ui/issues/106) +
  [#107](https://github.com/A4uikit/a4ui/issues/107) — `Menubar` + `NavigationMenu`
- Fixes: [#109](https://github.com/A4uikit/a4ui/issues/109) +
  [#84](https://github.com/A4uikit/a4ui/issues/84) (Aurora palette + glow repaint),
  [#91](https://github.com/A4uikit/a4ui/issues/91) (Modal size/scroll),
  [#92](https://github.com/A4uikit/a4ui/issues/92) (verify), [#80](https://github.com/A4uikit/a4ui/issues/80)
  (preset types)
- Dependency majors, one at a time inside the lane (shared lockfile): Vite 8,
  TypeScript 7, motion 14, ESLint 10, Vitest 5, jsdom 30, and the rest.

Integration is serial: one lane at a time onto `main`, full Playwright suite after
each (parallel suites produce false failures).

## Wave 3 — cross-cutting (serial)

- [#81](https://github.com/A4uikit/a4ui/issues/81) — Tailwind 4 support
- [#108](https://github.com/A4uikit/a4ui/issues/108) — right-to-left support

## Wave 4 — templates

- [A4uikit/templates#24](https://github.com/A4uikit/templates/issues/24) — dashboard,
  sidebar layouts, login/signup blocks (needs the wave 2 release).

## Still open from before

[#77](https://github.com/A4uikit/a4ui/issues/77) QA backlog,
[#82](https://github.com/A4uikit/a4ui/issues/82) draggable map marker,
[#83](https://github.com/A4uikit/a4ui/issues/83) E2E selectors.

## Working method

Per issue: build behind the repo conventions (`src/index.ts` export +
`preview/registry.tsx` DocEntry with auto render test + behavior tests + WCAG AA),
ship in versioned releases, update the checklists on each issue (and #110) as items
land.
