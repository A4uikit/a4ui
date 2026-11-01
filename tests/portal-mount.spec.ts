import { expect, test, type FrameLocator, type Page } from '@playwright/test'

// PortalMountProvider: the docs demo renders a4ui into a same-origin iframe
// from the parent page, the way a visual editor renders its canvas. Every
// overlay opened in there must be portaled into the iframe (not the parent
// document), positioned against the iframe's viewport, and dismissed by the
// iframe's own Escape / outside clicks / scroll.
test.describe('PortalMountProvider (iframe canvas)', () => {
  // eslint-disable-next-line no-empty-pattern -- Playwright needs the fixtures slot to reach testInfo
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'one layout is enough for the iframe wiring')
  })

  async function openFrame(page: Page): Promise<FrameLocator> {
    await page.goto('/#/portal-mount')
    const frame = page.frameLocator('[data-testid="portal-mount-frame"]')
    await expect(frame.getByTestId('frame-content')).toBeVisible()
    return frame
  }

  /** Overlays that leak into the parent page would show up here. */
  async function expectNothingInParent(page: Page): Promise<void> {
    await expect(page.locator('body > [data-a4-floating]')).toHaveCount(0)
    await expect(page.locator('[role="dialog"], [role="alertdialog"]')).toHaveCount(0)
    await expect(page.getByRole('tooltip')).toHaveCount(0)
  }

  // Kobalte 0.13 checks targets with the parent realm's `instanceof Element`,
  // so its outside-click dismiss and Tab trapping do not work for nodes in the
  // frame (documented limitation). Escape and the close button do.
  test('Modal opens in the frame, focuses inside it, closes on Escape and on its close button', async ({
    page,
  }) => {
    const frame = await openFrame(page)
    const open = frame.getByRole('button', { name: 'Open modal' })
    // Modal currently renders role="alertdialog" (also outside a frame).
    const dialog = frame.locator('[role="dialog"], [role="alertdialog"]')

    await open.click()
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('portaled into the iframe body')
    await expectNothingInParent(page)
    expect(await dialog.evaluate((el) => el.contains(el.ownerDocument.activeElement))).toBe(true)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()

    await open.click()
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Close' }).click()
    await expect(dialog).toBeHidden()
  })

  test('Popover opens in the frame next to its trigger and closes on Escape', async ({ page }) => {
    const frame = await openFrame(page)
    const trigger = frame.getByText('Popover', { exact: true })
    await trigger.click()
    const content = frame.getByText('Popover content')
    await expect(content).toBeVisible()
    await expectNothingInParent(page)

    const t = await trigger.boundingBox()
    const c = await content.boundingBox()
    expect(t && c).toBeTruthy()
    // Placed just below the trigger in frame coordinates, not at the parent's origin.
    expect(c!.y).toBeGreaterThan(t!.y + t!.height - 2)
    expect(c!.y - (t!.y + t!.height)).toBeLessThan(40)

    await page.keyboard.press('Escape')
    await expect(content).toBeHidden()
  })

  test('Tooltip shows in the frame on hover', async ({ page }) => {
    const frame = await openFrame(page)
    await frame.getByText('Hover me').hover()
    await expect(frame.getByRole('tooltip')).toContainText('Tooltip content')
    await expectNothingInParent(page)
  })

  test('DateField calendar: in the frame, follows frame scroll, closes on outside click and Escape', async ({
    page,
  }) => {
    const frame = await openFrame(page)
    const trigger = frame.getByRole('button', { name: 'Date' })
    await trigger.click()
    const day = frame.getByRole('button', { name: '15', exact: true })
    await expect(day).toBeVisible()
    await expectNothingInParent(page)

    // Anchored under the trigger in the frame's coordinates.
    const t = await trigger.boundingBox()
    const before = await day.boundingBox()
    expect(before!.y).toBeGreaterThan(t!.y)

    // Scrolling the frame (not the parent) re-places the panel. A small scroll
    // keeps the trigger on screen, so the panel must follow it, not close.
    await frame.locator('html').evaluate((el) => el.ownerDocument.defaultView!.scrollBy(0, 30))
    await expect
      .poll(() => frame.locator('html').evaluate((el) => el.ownerDocument.defaultView!.scrollY))
      .toBe(30)
    await expect(day).toBeVisible()
    await expect.poll(async () => (await day.boundingBox())!.y).toBeCloseTo(before!.y - 30, 0)

    // Outside mousedown inside the frame closes it.
    await frame.getByText('Scroll inside the frame.').click()
    await expect(day).toBeHidden()

    await trigger.click()
    await expect(day).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(day).toBeHidden()
  })
})
