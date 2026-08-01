import { defineConfig } from '@playwright/test'

// E2E tests for the docs site (the component glossary). They drive the running
// preview server and assert every component doc renders + key interactions work,
// so a change to any component is caught if it breaks its live example.
//
// Uses the system Chrome (channel: 'chrome') — no browser download needed.
// Run: `npm test`  ·  headed/interactive: `npm run test:ui`
// The port is overridable because 5173 is Vite's default across every project
// on a machine: a stale dev server from something else answers on it, the
// suite "reuses" it, and every test fails against the wrong app.
const PORT = process.env.A4UI_PREVIEW_PORT ?? '5173'
const BASE_URL = `http://localhost:${PORT}`

// System Chrome by default (that is what CI has and what the visual snapshots
// were taken with). Set A4UI_TEST_CHANNEL=chromium to fall back to
// Playwright's own bundled build on a machine without Chrome installed —
// useful for logic tests, but do not update visual snapshots from it.
const CHANNEL = process.env.A4UI_TEST_CHANNEL ?? 'chrome'

export default defineConfig({
  testDir: './tests',
  // Screenshot/probe harnesses (tests/_*.spec.ts) are run on demand, not in CI.
  testIgnore: ['**/_*.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['line'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    ...(CHANNEL === 'chromium' ? {} : { channel: CHANNEL }),
    trace: 'on-first-retry',
  },
  // Reuse the dev server if it's already up; otherwise start it.
  webServer: {
    command: `npm run preview -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
})
