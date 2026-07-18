// One-off interaction/visual probes. Run:
//   npx playwright test --config playwright.shots.config.ts _probe
import { expect, test } from '@playwright/test'

test.describe('probe', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'desktop only')

  test('sortable reorders rows by dragging the grip', async ({ page }) => {
    await page.goto('/#/sortable')
    const rows = page.locator('[data-sortable-item]')
    await expect(rows.first()).toContainText('Design review')

    const grip = page.getByRole('button', { name: 'Drag to reorder' }).first()
    const gb = (await grip.boundingBox())!
    const thirdBox = (await rows.nth(2).boundingBox())!

    await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2)
    await page.mouse.down()
    await page.mouse.move(gb.x + gb.width / 2, gb.y + 20, { steps: 3 })
    // Drag down past the third row's midpoint so row 1 lands lower in the list.
    await page.mouse.move(gb.x + gb.width / 2, thirdBox.y + thirdBox.height / 2 + 4, { steps: 8 })
    await page.mouse.up()

    // "Design review" should no longer be first.
    await expect(rows.first()).not.toContainText('Design review')
    console.log('SORTABLE_FIRST', (await rows.first().innerText()).replace(/\s+/g, ' ').trim())
  })
})
