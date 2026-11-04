import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

// Right-to-left support. These check meaning, not presence: where things sit on
// screen, which key moves where, and what direction a portaled overlay renders
// in. They use geometry assertions on purpose; committed visual snapshots need
// system Chrome, which is not available everywhere the suite runs.

test.describe('rtl', () => {
  // eslint-disable-next-line no-empty-pattern -- Playwright needs the fixtures slot to reach testInfo
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'RTL geometry is checked on the desktop project')
  })

  const rtlSwitch = (page: Page) => page.getByTestId('rtl-toggle').getByText('RTL', { exact: true })

  async function open(page: Page, id: string, rtl: boolean) {
    await page.goto(`/#/${id}`)
    await page.getByTestId('demo').waitFor()
    if (rtl) await rtlSwitch(page).click()
    return page.getByTestId('demo')
  }

  const box = async (loc: Locator) => {
    const b = await loc.boundingBox()
    if (!b) throw new Error('element has no bounding box')
    return b
  }

  /** Direction a portaled element actually renders in. */
  const directionOf = (loc: Locator) =>
    loc.evaluate((el) => ({
      attr: el.closest('[dir]')?.getAttribute('dir') ?? null,
      computed: getComputedStyle(el).direction,
    }))

  test('LTR default is unchanged: a portaled popover is ltr and html carries no dir', async ({ page }) => {
    await open(page, 'popover', false)
    await page.getByRole('button', { name: 'Open popover' }).first().click()
    const panel = page.getByRole('dialog')
    await expect(panel).toBeVisible()
    const dir = await directionOf(panel)
    // The docs wrap each demo in a provider that defaults to ltr, and it stamps
    // that onto the portal; nothing flips and <html> itself is untouched.
    expect(dir).toEqual({ attr: 'ltr', computed: 'ltr' })
    expect(await page.evaluate(() => document.documentElement.hasAttribute('dir'))).toBe(false)
  })

  test('DateField: the panel lines up with the trigger start edge in both directions', async ({ page }) => {
    for (const rtl of [false, true]) {
      const demo = await open(page, 'date-field', rtl)
      const trigger = demo.locator('button').first()
      const t = await box(trigger)
      await trigger.click()
      const panel = page.locator('[data-a4-floating]').first()
      await expect(panel).toBeVisible()
      const p = await box(panel)
      if (rtl) expect(Math.abs(p.x + p.width - (t.x + t.width))).toBeLessThanOrEqual(1)
      else expect(Math.abs(p.x - t.x)).toBeLessThanOrEqual(1)
      await page.keyboard.press('Escape')
    }
  })

  test('Table: header text follows the direction instead of centering', async ({ page }) => {
    for (const [rtl, side] of [
      [false, 'left'],
      [true, 'right'],
    ] as const) {
      const demo = await open(page, 'table', rtl)
      const cell = demo.locator('th').first()
      const offsets = await cell.evaluate((th) => {
        const range = document.createRange()
        range.selectNodeContents(th)
        const text = range.getBoundingClientRect()
        const cellBox = th.getBoundingClientRect()
        return { left: text.left - cellBox.left, right: cellBox.right - text.right }
      })
      // Hugging one side: the padding only, while the other side has the slack.
      expect(offsets[side]).toBeLessThanOrEqual(16)
      expect(offsets[side === 'left' ? 'right' : 'left']).toBeGreaterThan(offsets[side])
    }
  })

  test('InputGroup: the leading icon is on the left in LTR and on the right in RTL', async ({ page }) => {
    const demo = await open(page, 'input-group', false)
    const input = demo.getByRole('textbox', { name: 'Search' })
    const icon = demo.locator('svg').first()
    expect((await box(icon)).x).toBeLessThan((await box(input)).x)

    await rtlSwitch(page).click()
    const inputBox = await box(input)
    expect((await box(icon)).x).toBeGreaterThan(inputBox.x + inputBox.width / 2)
  })

  test('Sidebar sits on the opposite side under RTL', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    const demo = await open(page, 'sidebar', false)
    const aside = demo.locator('aside[data-sidebar="root"]')
    await aside.waitFor()
    const frame = await box(demo)
    const ltr = await box(aside)
    expect(ltr.x - frame.x).toBeLessThan(4)

    await rtlSwitch(page).click()
    await expect.poll(async () => (await box(aside)).x).toBeGreaterThan(frame.x + frame.width / 2)
    const rtl = await box(aside)
    expect(frame.x + frame.width - (rtl.x + rtl.width)).toBeLessThan(4)
  })

  test('Drawer side="start" slides from the right edge under RTL', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await open(page, 'drawer', false)
    await page.locator('main select').first().selectOption('start')
    await rtlSwitch(page).click()
    await page.getByRole('button', { name: 'Open panel' }).click()
    const panel = page.getByRole('dialog', { name: 'Customer detail' })
    await expect(panel).toHaveAttribute('data-side', 'start')
    // Geometry once the slide-in settles: flush with the right edge.
    await expect
      .poll(async () => {
        const b = await box(panel)
        return Math.round(b.x + b.width)
      })
      .toBe(1280)
    expect((await directionOf(panel)).computed).toBe('rtl')
  })

  test('Drawer side="start" stays on the left in LTR', async ({ page }) => {
    await open(page, 'drawer', false)
    await page.locator('main select').first().selectOption('start')
    await page.getByRole('button', { name: 'Open panel' }).click()
    const panel = page.getByRole('dialog', { name: 'Customer detail' })
    await expect.poll(async () => (await box(panel)).x).toBe(0)
  })

  test('Tabs: ArrowLeft moves forward under RTL, ArrowRight under LTR', async ({ page }) => {
    await open(page, 'direction-provider', false) // control default: rtl
    const general = page.getByRole('tab', { name: 'General' })
    const security = page.getByRole('tab', { name: 'Security' })
    // RTL: the first tab is on the right, so ArrowLeft goes to the next one.
    expect((await box(general)).x).toBeGreaterThan((await box(security)).x)
    await general.focus()
    await page.keyboard.press('ArrowLeft')
    await expect(security).toBeFocused()

    await page.locator('main select').first().selectOption('ltr')
    const general2 = page.getByRole('tab', { name: 'General' })
    await general2.focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('tab', { name: 'Security' })).toBeFocused()
  })

  test('Menubar: ArrowLeft moves to the next menu under RTL', async ({ page }) => {
    const demo = await open(page, 'menubar', true)
    const bar = demo.getByRole('menubar')
    const triggers = bar.getByRole('menuitem')
    await triggers.first().focus()
    await page.keyboard.press('ArrowLeft')
    await expect(triggers.nth(1)).toBeFocused()
    expect((await box(triggers.nth(1))).x).toBeLessThan((await box(triggers.first())).x)
  })

  test('Menubar: ArrowRight still moves to the next menu in LTR', async ({ page }) => {
    const demo = await open(page, 'menubar', false)
    const triggers = demo.getByRole('menubar').getByRole('menuitem')
    await triggers.first().focus()
    await page.keyboard.press('ArrowRight')
    await expect(triggers.nth(1)).toBeFocused()
  })

  test('Slider: keys follow the visual direction', async ({ page }) => {
    const demo = await open(page, 'slider', true)
    const thumb = demo.getByRole('slider').first()
    await thumb.focus()
    const before = Number(await thumb.getAttribute('aria-valuenow'))
    await page.keyboard.press('ArrowLeft')
    // RTL: the maximum is on the left, so ArrowLeft increases the value.
    await expect.poll(async () => Number(await thumb.getAttribute('aria-valuenow'))).toBeGreaterThan(before)
  })

  test('portaled overlays render RTL: Dropdown and Modal', async ({ page }) => {
    const demo = await open(page, 'direction-provider', false)

    await demo.getByRole('button', { name: 'Actions' }).click()
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()
    expect(await directionOf(menu)).toEqual({ attr: 'rtl', computed: 'rtl' })
    await page.keyboard.press('Escape')

    await demo.getByRole('button', { name: 'Open modal' }).click()
    const modal = page.getByRole('dialog', { name: 'Modal' })
    await expect(modal).toBeVisible()
    expect(await directionOf(modal)).toEqual({ attr: 'rtl', computed: 'rtl' })
  })

  test('a Popover opened on a docs page in RTL renders RTL', async ({ page }) => {
    await open(page, 'popover', true)
    await page.getByRole('button', { name: 'Open popover' }).first().click()
    const panel = page.getByRole('dialog')
    await expect(panel).toBeVisible()
    expect(await directionOf(panel)).toEqual({ attr: 'rtl', computed: 'rtl' })
  })

  test('portaled overlays follow the provider back to LTR', async ({ page }) => {
    const demo = await open(page, 'direction-provider', false)
    await page.locator('main select').first().selectOption('ltr')
    await demo.getByRole('button', { name: 'Actions' }).click()
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()
    expect(await directionOf(menu)).toEqual({ attr: 'ltr', computed: 'ltr' })
  })

  test('Toast viewport moves to the other bottom corner under RTL', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    const demo = await open(page, 'toast', false)
    await demo.getByRole('button', { name: 'Success' }).click()
    const toast = page.locator('.toast-item').first()
    await expect(toast).toBeVisible()
    await expect.poll(async () => (await box(toast)).x).toBeGreaterThan(640)

    await page.reload()
    await page.getByTestId('demo').waitFor()
    await rtlSwitch(page).click()
    await page.getByTestId('demo').getByRole('button', { name: 'Success' }).click()
    const toast2 = page.locator('.toast-item').first()
    await expect(toast2).toBeVisible()
    await expect.poll(async () => (await box(toast2)).x).toBeLessThan(100)
  })

  test('directional chevrons mirror: Pagination "next" points left under RTL', async ({ page }) => {
    const demo = await open(page, 'pagination', false)
    const next = demo.getByRole('button', { name: /next/i }).locator('svg')
    const matrix = () => next.evaluate((el) => getComputedStyle(el).transform)
    expect(await matrix()).toBe('none')
    await rtlSwitch(page).click()
    // matrix(a, ...) with a = -1 means mirrored on the x axis.
    await expect.poll(matrix).toMatch(/^matrix\(-1,/)
  })

  for (const mode of ['light', 'dark'] as const) {
    test(`DirectionProvider page has no WCAG A/AA violations in RTL (${mode})`, async ({ page }) => {
      await page.addInitScript((m) => localStorage.setItem('a4ui-theme', m), mode)
      await page.goto('/#/direction-provider')
      await page.getByTestId('demo').waitFor()
      await expect(page.getByTestId('demo').getByRole('tab', { name: 'General' })).toBeVisible()
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
      expect(
        violations.map((v) => `${v.id} x${v.nodes.length}: ${String(v.nodes[0]?.target?.join(' '))}`),
      ).toEqual([])
    })
  }
})
