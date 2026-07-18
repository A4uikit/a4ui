// One-off interaction probes. Run:
//   npx playwright test --config playwright.shots.config.ts _probe
import path from 'node:path'

import { expect, test } from '@playwright/test'

test('date range picker selects a range', async ({ page }) => {
  await page.goto('/#/date-range-picker')
  await page.getByRole('button', { name: 'Trip dates' }).click()
  // CalendarCore day grid is open — pick start (10) then end (20) in the shown month.
  await page.getByRole('gridcell', { name: '10', exact: true }).first().click()
  // After the first pick the popover stays open; capture the band forming.
  await page
    .getByRole('gridcell', { name: '18', exact: true })
    .first()
    .click({ trial: false })
    .catch(() => {})
  await page.screenshot({
    path: path.resolve('tests/__shots__/date-range-open.png'),
    clip: { x: 0, y: 0, width: 420, height: 420 },
  })
  const trigger = page.getByRole('button').filter({ hasText: '–' }).first()
  await expect(trigger).toBeVisible()
  console.log('RANGE_TRIGGER', (await trigger.innerText()).replace(/\s+/g, ' ').trim())
})
