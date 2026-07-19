// Visual-regression baselines for a set of STATIC primitives (no JS-driven
// motion, no starfield) — so the shots are deterministic. Run via the dedicated
// config: `npm run test:visual` (see playwright.visual.config.ts). Add more ids
// as components stabilise; avoid animated demos (Spinner, Stat count-up, Motion*).
import { expect, test } from '@playwright/test'

const IDS = [
  'badge',
  'alert',
  'avatar',
  'kbd',
  'separator',
  'progress',
  'empty',
  'card',
  'breadcrumb',
  'descriptions',
  'list',
  'pagination',
]

for (const id of IDS) {
  test(`visual: ${id}`, async ({ page }) => {
    await page.goto(`/#/${id}`)
    const demo = page.getByTestId('demo')
    await expect(demo).toBeVisible()
    await expect(demo).toHaveScreenshot(`${id}.png`)
  })
}
