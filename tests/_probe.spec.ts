// One-off probes. Run: npx playwright test --config playwright.shots.config.ts _probe
import path from 'node:path'

import { test } from '@playwright/test'

test('storefront cards align + cart badge shows on add', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 900 })
  await page.goto('/#/examples/storefront')
  await page.waitForTimeout(1000)
  // Add an item so the cart bubble appears.
  await page.getByRole('button', { name: 'Add to cart' }).first().click()
  await page.waitForTimeout(300)
  await page.screenshot({
    path: path.resolve('tests/__shots__/storefront-fixed.png'),
    clip: { x: 0, y: 0, width: 1100, height: 560 },
  })
})

test('date field day cell is named by its number (15)', async ({ page }) => {
  await page.goto('/#/date-field')
  await page.getByRole('button', { name: 'Due date' }).click()
  const day15 = page.getByRole('button', { name: '15', exact: true })
  const count = await day15.count()
  console.log('DAY15_COUNT', count, 'names:', JSON.stringify(await day15.allInnerTexts()))
})
