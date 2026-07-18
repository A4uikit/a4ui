// Screenshot harness (not part of the normal suite — run explicitly by path):
//   npx playwright test _shots --project=desktop
// Captures the live "Example" demo card for a given set of component ids into
// tests/__shots__/ so they can be eyeballed for visual regressions. The id list
// comes from SHOTS (comma-separated) or defaults to the full registry.
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { expect, test } from '@playwright/test'

const registry = readFileSync(path.resolve('preview/registry.tsx'), 'utf8')
const ALL_IDS = [...registry.matchAll(/id: '([^']+)',\s*title:/g)].map((m) => m[1])
const IDS = process.env.SHOTS ? process.env.SHOTS.split(',').map((s) => s.trim()) : ALL_IDS

test.describe('shots', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'desktop only')
  for (const id of IDS) {
    test(`shot: ${id}`, async ({ page }) => {
      await page.goto(`/#/${id}`)
      // The live demo lives in the Card immediately after the "Example" heading.
      const card = page.locator('h2:text-is("Example")').locator('xpath=following-sibling::div[1]')
      await expect(card).toBeVisible()
      // Give runtime demos (Countdown ticking, images loading) a beat to settle.
      await page.waitForTimeout(1200)
      await card.screenshot({ path: path.resolve(`tests/__shots__/${id}.png`) })
    })
  }
})
