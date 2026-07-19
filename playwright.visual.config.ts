// Visual-regression config — separate from the main e2e config so it never runs
// in the normal suite. It screenshots each demo's `[data-testid="demo"]` region
// (NOT the full page — the starfield backdrop is non-deterministic) with
// animations disabled, and compares against committed baselines.
//
// Baselines are OS-specific, so they must be generated on the CI runner (Linux):
//   run the "Visual regression" workflow with `update: true` once to seed them.
// Locally: `npm run test:visual` compares; add `-- --update-snapshots` to refresh.
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests',
  testMatch: '_visual.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    channel: 'chrome', // matches CI (browser-actions/setup-chrome); no bundled download
  },
  expect: {
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.02 },
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: 'desktop', use: { viewport: { width: 1280, height: 800 } } }],
})
