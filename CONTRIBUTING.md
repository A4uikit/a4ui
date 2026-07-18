# Contributing to A4ui

Thanks for helping improve A4ui! This is a SolidJS design system published as
[`@a4ui/core`](https://www.npmjs.com/package/@a4ui/core).

## Setup

```bash
npm install
npm run preview      # docs site with live examples (http://localhost:5173)
```

## Everyday checks

```bash
npm run typecheck
npm run lint         # ESLint (run `npm run format` to auto-format)
npm run test:unit    # Vitest — helper unit tests
npm test             # Playwright — docs render + behavior (desktop + mobile)
npm run build        # library build (ESM + .d.ts + styles.css)
```

CI runs all of these on every push/PR — keep them green.

## Conventions

- **Commits:** atomic, in **English**, [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:` `fix:` `docs:` `chore:` `ci:` `test:`). No AI attribution trailers.
- **CSS doctrine:** utilities in JSX for layout/spacing/color; glass surfaces in the
  `preset.js` plugin; CSS vars + motion keyframes in `src/styles/tokens.css`; starfield
  in `src/styles/space.css`. No per-component CSS files.
- **`solid-js` is a peer dependency** and external in the build — never bundle it.

See **[AGENTS.md](./AGENTS.md)** for the full repo layout and workflow.

## Adding a component

1. Create `src/ui/<Name>.tsx` (thin styled wrapper; Kobalte for behavior where it fits).
   Add a JSDoc block with an `@example` on the export.
2. Re-export it from `src/index.ts`.
3. Add a `DocEntry` to `preview/registry.tsx` (id = kebab-case; blurb + live demo + code;
   optional `controls`). Its render test is auto-generated; add a behavior test to
   `tests/docs.spec.ts` if it's interactive.
4. Make sure `npm run typecheck && npm run lint && npm test && npm run build` pass.

## Releasing (maintainers)

```bash
npm version patch     # or minor / major
git push && git push --tags
gh release create vX.Y.Z --generate-notes
```

Creating the GitHub Release publishes to npm automatically via OIDC (no tokens).
