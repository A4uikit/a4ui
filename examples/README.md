# Examples

Minimal consumer apps that smoke-test the integration paths documented in
[`INTEGRATIONS.md`](../INTEGRATIONS.md). They aren't published, aren't part of
the workspace build, and exist purely to catch "the docs lied" regressions —
e.g. an export condition that stops resolving, or a bundle that stops
typechecking in a consuming app.

All apps depend on the package via `"@a4ui/core": "file:../.."` — the local
`dist/` (and, for the `solid` export condition, `src/`) of this repo, not a
published npm version.

## Prerequisites

Build the root package first, so `dist/` exists:

```bash
npm run build   # from the repo root
```

Then, per example:

```bash
cd examples/<name>
npm install
npm run build
```

## Apps

- **`react-webcomponents/`** — Vite + React, consuming the framework‑agnostic
  Web Components bundle (`@a4ui/core/elements` + `@a4ui/core/elements.css`).
  This is the integration path for React, Next.js, Vue, and vanilla HTML.
- **`solidstart-ssr/`** — a SolidStart app importing native Solid components
  (`Button`, `Card`, `Badge`, `Stat`) directly. Exercises the package's
  `solid` export condition, which points SolidStart's compiler at `src/` so
  components compile — and server-render — for both server and client.
- **`astro-solid/`** — an Astro app rendering a native Solid component
  (`Button`) as a `client:only="solid-js"` island via `@astrojs/solid-js`.
  Exercises the Astro integration path documented in `INTEGRATIONS.md`.

## CI

CI builds the root package, then `npm install && npm run build` in each
example directory, to catch integration regressions before they reach a
release.
