import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'

// Unit tests for the framework-agnostic helpers in src/lib. Runs under jsdom so
// document / localStorage / matchMedia stubs are available. Scoped to co-located
// *.test.ts(x) files under src so it never picks up the Playwright E2E suite in
// tests/ (those run via `npm test`).
export default defineConfig({
  plugins: [solid()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
