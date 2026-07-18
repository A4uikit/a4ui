// One-off probes. Run: npx playwright test --config playwright.shots.config.ts _probe
import path from 'node:path'

import { test } from '@playwright/test'

async function shotField(page: import('@playwright/test').Page, name: string) {
  const field = page.getByPlaceholder('Full name')
  await field.scrollIntoViewIfNeeded()
  await field.focus()
  await page.waitForTimeout(350)
  const b = (await field.boundingBox())!
  await page.screenshot({
    path: path.resolve(`tests/__shots__/${name}.png`),
    clip: { x: Math.max(0, b.x - 24), y: Math.max(0, b.y - 24), width: b.width + 48, height: b.height + 48 },
  })
}

test('input focus bloom per theme', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 })
  await page.goto('/#/input')
  await page.waitForTimeout(300)
  await shotField(page, 'bloom-space')

  await page.getByRole('button', { name: 'Choose theme' }).click()
  await page.getByRole('menuitem', { name: /Dino/ }).click()
  await page.waitForTimeout(300)
  await shotField(page, 'bloom-dino')
})
