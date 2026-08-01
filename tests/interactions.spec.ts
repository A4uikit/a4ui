import { expect, test } from '@playwright/test'

// Interaction regression tests for the newer interactive components — behaviour
// the render/smoke sweeps don't exercise (pointer/keyboard flows). Desktop only:
// the pointer-capture / focus logic is identical across viewports and the touch
// emulation adds flakiness.
test.describe('component interactions', () => {
  // eslint-disable-next-line no-empty-pattern -- Playwright needs the fixtures slot to reach testInfo
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'interaction tests run on desktop only')
  })

  test('Carousel3D: chevrons and dots change the active slide', async ({ page }) => {
    await page.goto('/#/carousel-3d')
    // The page renders several carousels (main demo + Variations); scope to the
    // main demo so the "Next slide" / dot locators are unambiguous.
    const demo = page.getByTestId('demo')
    await demo.locator('button[aria-label="Go to slide 1"]').waitFor()
    await expect(demo.locator('button[aria-label="Go to slide 1"]')).toHaveAttribute('aria-current', 'true')

    await demo.getByRole('button', { name: 'Next slide' }).click()
    await expect(demo.locator('button[aria-label="Go to slide 2"]')).toHaveAttribute('aria-current', 'true')

    await demo.getByRole('button', { name: 'Previous slide' }).click()
    await expect(demo.locator('button[aria-label="Go to slide 1"]')).toHaveAttribute('aria-current', 'true')

    await demo.getByRole('button', { name: 'Go to slide 3' }).click()
    await expect(demo.locator('button[aria-label="Go to slide 3"]')).toHaveAttribute('aria-current', 'true')
  })

  test('InteractiveMap: panning repositions the tiles instead of rebuilding them', async ({ page }) => {
    // REGRESSION. `<For>` keys by reference, and the tile memo used to return
    // fresh descriptor objects on every recompute, so each pointer move tore
    // the whole grid out of the DOM and rebuilt it. Combined with the tile
    // fade-in — which resets to opacity-0 on a fresh element and only clears
    // on `load` — the map strobed while being dragged. Measured before the
    // fix on a 20-tile map: one ~500 ms drag inserted 340 elements and removed
    // 344.
    //
    // Positions are already covered elsewhere and stayed correct throughout,
    // which is exactly why nothing caught this; what this asserts is the
    // ELEMENTS' survival.
    await page.goto('/#/interactive-map')
    const map = page.getByTestId('demo').locator('[role="application"]').first()
    await map.locator('img').first().waitFor()

    await page.waitForTimeout(500)

    await map.evaluate((el) => {
      const w = window as unknown as { __churn: { added: number; removed: number } }
      w.__churn = { added: 0, removed: 0 }
      new MutationObserver((records) => {
        for (const record of records) {
          record.addedNodes.forEach((n) => {
            if (n.nodeName === 'IMG') w.__churn.added++
          })
          record.removedNodes.forEach((n) => {
            if (n.nodeName === 'IMG') w.__churn.removed++
          })
        }
      }).observe(el, { childList: true, subtree: true })
    })

    const box = await map.boundingBox()
    if (!box) throw new Error('InteractiveMap has no bounding box')
    const startX = box.x + box.width / 2
    const startY = box.y + box.height / 2

    // A short drag: small enough that the visible tile set barely changes, so
    // almost every tile should survive it.
    await page.mouse.move(startX, startY)
    await page.mouse.down()
    for (let step = 1; step <= 12; step++) {
      await page.mouse.move(startX - step * 3, startY - step * 2)
    }
    await page.mouse.up()
    await page.waitForTimeout(300)

    const churn = await page.evaluate(
      () => (window as unknown as { __churn: { added: number; removed: number } }).__churn,
    )
    const tileCount = await map.locator('img').count()

    expect(tileCount).toBeGreaterThan(0)
    // A drag this small may pull in a row or column of genuinely new tiles;
    // what must not happen is the grid being rebuilt per pointer move, which
    // scales with the number of moves rather than with the tiles gained.
    expect(churn.added).toBeLessThan(tileCount)
    expect(churn.removed).toBeLessThan(tileCount)
  })

  test('OtpInput: typing fills consecutive boxes', async ({ page }) => {
    await page.goto('/#/otp-input')
    const boxes = page.getByTestId('demo').locator('input')
    await boxes.first().click()
    await page.keyboard.type('123')
    await expect(boxes.nth(0)).toHaveValue('1')
    await expect(boxes.nth(1)).toHaveValue('2')
    await expect(boxes.nth(2)).toHaveValue('3')
  })

  test('SheetSnap: the trigger opens a modal sheet', async ({ page }) => {
    await page.goto('/#/sheet-snap')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await page.getByTestId('demo').getByRole('button', { name: 'Open sheet' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('QueryBuilder: "+ Rule" adds a rule row', async ({ page }) => {
    await page.goto('/#/query-builder')
    const demo = page.getByTestId('demo')
    const before = await demo.locator('select').count()
    await demo.getByRole('button', { name: /Rule/ }).first().click()
    await expect(async () => {
      expect(await demo.locator('select').count()).toBeGreaterThan(before)
    }).toPass()
  })

  test('Kanban: renders columns with their cards', async ({ page }) => {
    await page.goto('/#/kanban')
    const demo = page.getByTestId('demo')
    await expect(demo.getByText('To do')).toBeVisible()
    await expect(demo.getByText('In progress')).toBeVisible()
    await expect(demo.getByText('Draft the spec')).toBeVisible()
  })

  test('SpreadsheetGrid: keyboard edit commits a cell value', async ({ page }) => {
    await page.goto('/#/spreadsheet-grid')
    const demo = page.getByTestId('demo')
    await demo.locator('[role="gridcell"]').first().dblclick()
    const input = demo.locator('input').first()
    await input.fill('Zebra')
    await input.press('Enter')
    await expect(demo.getByText('Zebra')).toBeVisible()
  })

  test('CouponField: a valid code applies a discount', async ({ page }) => {
    await page.goto('/#/coupon-field')
    const demo = page.getByTestId('demo')
    await demo.getByRole('textbox').fill('SAVE10')
    await demo.getByRole('button', { name: /apply/i }).click()
    await expect(demo.getByText(/\$10/)).toBeVisible()
  })

  test('Lightbox: a thumbnail opens the viewer and Escape closes it', async ({ page }) => {
    await page.goto('/#/lightbox')
    await page.getByTestId('demo').locator('img').first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })
})
