import { defineConfig } from '@playwright/test'

// E2E tests for the docs site (the component glossary). They drive the running
// preview server and assert every component doc renders + key interactions work,
// so a change to any component is caught if it breaks its live example.
//
// Uses the system Chrome (channel: 'chrome') — no browser download needed.
// Run: `npm test`  ·  headed/interactive: `npm run test:ui`
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
    baseURL: 'http://localhost:5173',
    channel: 'chrome',
    trace: 'on-first-retry',
  },
  // Reuse the dev server if it's already up; otherwise start it.
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
})
