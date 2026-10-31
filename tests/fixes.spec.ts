import { expect, test } from '@playwright/test'

// Regression tests for the "fixes" lane: Aurora pointer glow (#84) and palette
// API (#109), Modal size + scrolling body (#91), MultiSelect inside a scrolling
// Modal (#92). Desktop only: pointer-driven.
test.describe('fixes', () => {
  // eslint-disable-next-line no-empty-pattern -- Playwright needs the fixtures slot to reach testInfo
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'fixes tests run on desktop only')
  })

  test('Aurora glow moves with transform, left/top stay constant (#84)', async ({ page }) => {
    await page.goto('/#/aurora')
    const glow = page.locator('[data-testid="aurora-glow-demo"] #cursorGlow')
    await expect(glow).toBeAttached()
    const transform = () => glow.evaluate((el) => (el as HTMLElement).style.transform)
    await page.mouse.move(300, 300)
    await page.mouse.move(520, 380)
    await expect.poll(transform).toContain('translate3d(520px, 380px')
    const before = await glow.evaluate((el) => {
      const s = (el as HTMLElement).style
      return { left: s.left, top: s.top, willChange: s.willChange }
    })
    expect(before.willChange).toBe('transform')
    await page.mouse.move(700, 450)
    await expect.poll(transform).toContain('translate3d(700px, 450px')
    const after = await glow.evaluate((el) => {
      const s = (el as HTMLElement).style
      return { left: s.left, top: s.top }
    })
    expect(after.left).toBe(before.left)
    expect(after.top).toBe(before.top)
  })

  test('Aurora glow coalesces many pointermoves into one style write per frame (#84)', async ({ page }) => {
    await page.goto('/#/aurora')
    const glow = page.locator('[data-testid="aurora-glow-demo"] #cursorGlow')
    await expect(glow).toBeAttached()
    await page.mouse.move(300, 300) // first move: sets opacity once
    await page.waitForTimeout(100)
    const result = await glow.evaluate(async (el) => {
      const raf = () => new Promise<void>((r) => requestAnimationFrame(() => r()))
      let writes = 0
      const mo = new MutationObserver((records) => {
        writes += records.length
      })
      mo.observe(el, { attributes: true, attributeFilter: ['style'] })
      await raf()
      // 60 moves inside a single task must collapse to one frame write.
      for (let i = 1; i <= 60; i++) {
        document.dispatchEvent(
          new PointerEvent('pointermove', { clientX: 100 + i, clientY: 200 + i, bubbles: true }),
        )
      }
      await raf()
      await raf()
      return { writes, transform: (el as HTMLElement).style.transform }
    })
    expect(result.writes).toBe(1)
    expect(result.transform).toContain('translate3d(160px, 260px')
  })

  test('Aurora colors prop recolors the blobs; default stays token-driven (#109)', async ({ page }) => {
    await page.goto('/#/aurora')
    const demo = page.locator('[data-testid="aurora-palette-demo"]')
    const blobs = demo.locator('.rounded-full.blur-3xl')
    await expect(blobs).toHaveCount(3)
    const bg = () => blobs.first().evaluate((el) => getComputedStyle(el).backgroundImage)
    const inline = () => blobs.first().evaluate((el) => (el as HTMLElement).getAttribute('style') ?? '')

    // sunset is the demo's initial palette (custom CSS colors).
    const sunset = await bg()
    expect(await inline()).toContain('color-mix')
    expect(await inline()).not.toContain('--primary')

    await page.getByRole('button', { name: 'tokens' }).click()
    await expect.poll(inline).toContain('var(--primary)')
    const tokens = await bg()
    expect(tokens).not.toBe(sunset)

    await page.getByRole('button', { name: 'ocean' }).click()
    await expect.poll(inline).toContain('color-mix')
    expect(await bg()).not.toBe(sunset)
    expect(await bg()).not.toBe(tokens)
  })

  test('Aurora glowColor/glowOpacity configure the glow gradient (#109)', async ({ page }) => {
    await page.goto('/#/aurora')
    const style = await page
      .locator('[data-testid="aurora-palette-demo"] #cursorGlow')
      .evaluate((el) => (el as HTMLElement).getAttribute('style') ?? '')
    expect(style).toContain('color-mix(in srgb, rgb(255, 106, 61) 20%')
  })

  test('Modal size changes the dialog width (#91)', async ({ page }) => {
    const width = async (size: string) => {
      await page.goto('/#/modal')
      await page.getByLabel('size').selectOption(size)
      await page.getByRole('button', { name: 'Open modal' }).click()
      const dialog = page.locator('.modal-content')
      await expect(dialog).toBeVisible()
      await page.waitForTimeout(400)
      const box = await dialog.boundingBox()
      if (!box) throw new Error('dialog has no bounding box')
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
      return box.width
    }
    const sm = await width('sm')
    const md = await width('md')
    const lg = await width('lg')
    expect(sm).toBeCloseTo(384, 0)
    expect(md).toBeCloseTo(512, 0)
    expect(lg).toBeCloseTo(672, 0)
  })

  test('Modal body scrolls when content is taller than the viewport; header stays visible (#91)', async ({
    page,
  }) => {
    await page.goto('/#/modal')
    await page.getByRole('button', { name: 'Open tall modal' }).click()
    const dialog = page.locator('.modal-content')
    await expect(dialog).toBeVisible()
    await page.waitForTimeout(400)
    const body = dialog.locator('[data-modal-body]')
    const m = await body.evaluate((el) => ({ sh: el.scrollHeight, ch: el.clientHeight }))
    expect(m.sh).toBeGreaterThan(m.ch)
    const box = await dialog.boundingBox()
    if (!box) throw new Error('dialog has no bounding box')
    expect(box.height).toBeLessThanOrEqual(page.viewportSize()!.height)

    await body.evaluate((el) => (el.scrollTop = el.scrollHeight))
    await expect(dialog.getByText('Pick references')).toBeInViewport()
    const confirm = page.getByTestId('tall-confirm')
    await expect(confirm).toBeInViewport()
    await confirm.click()
    await expect(dialog).toBeHidden()
  })

  test('MultiSelect inside a scrolling Modal: scroll the body, pick two options (#92)', async ({ page }) => {
    await page.goto('/#/modal')
    await page.getByRole('button', { name: 'Open settings modal' }).click()
    const dialog = page.locator('.modal-content')
    await expect(dialog).toBeVisible()
    await page.waitForTimeout(400)
    const body = dialog.locator('[data-modal-body]')
    expect(await body.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true)

    await dialog.getByRole('button', { name: /Pick tags/ }).click()
    const listbox = page.locator('ul[role="listbox"]')
    await expect(listbox).toBeVisible()
    // scroll the dialog's own body while the popover is open
    await body.evaluate((el) => (el.scrollTop = 40))
    await expect(listbox).toBeVisible()
    await page.locator('[role="option"]', { hasText: 'Alpha' }).click()
    await expect(listbox).toBeVisible()
    await page.locator('[role="option"]', { hasText: 'Beta' }).click()
    await expect(page.getByTestId('ms-count')).toHaveText('2 selected')
  })

  test('DateField inside a Modal: a day in the portaled calendar can be picked', async ({ page }) => {
    await page.goto('/#/modal')
    await page.getByRole('button', { name: 'Open settings modal' }).click()
    const dialog = page.locator('.modal-content')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: /Due date/ }).click()
    const day = page
      .locator('[data-a4-floating]')
      .getByRole('button', { name: /^15\b|\b15$/ })
      .first()
    await expect(day).toBeVisible()
    await day.click()
    // The pick must land (value set) and must not dismiss the dialog.
    await expect(page.getByTestId('due-value')).toHaveText(/^\d{4}-\d{2}-15$/)
    await expect(dialog).toBeVisible()
  })
})
