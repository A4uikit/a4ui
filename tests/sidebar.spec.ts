import { expect, test, type Locator, type Page } from '@playwright/test'

// Sidebar behaviour: collapse state + measured width, icon-rail accessibility and
// tooltips, aria-current, submenu keyboard operation and the mobile drawer.
test.describe('sidebar', () => {
  // eslint-disable-next-line no-empty-pattern -- Playwright needs the fixtures slot to reach testInfo
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'sidebar tests set their own viewport on the desktop project',
    )
  })

  const width = async (loc: Locator) => (await loc.boundingBox())?.width ?? -1

  async function open(page: Page) {
    await page.goto('/#/sidebar')
    const demo = page.getByTestId('demo')
    const aside = demo.locator('aside[data-sidebar="root"]')
    await aside.waitFor()
    return { demo, aside }
  }

  test('Trigger and Ctrl+B toggle the state and the measured width', async ({ page }) => {
    const { demo, aside } = await open(page)
    const trigger = demo.getByRole('button', { name: 'Toggle sidebar', exact: true })

    await expect(aside).toHaveAttribute('data-state', 'expanded')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect.poll(() => width(aside)).toBeGreaterThan(240)

    await trigger.click()
    await expect(aside).toHaveAttribute('data-state', 'collapsed')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    // Collapsed icon rail = --sidebar-w-collapsed (68px), clearly narrower than 248px.
    await expect.poll(() => width(aside)).toBeLessThan(80)
    await expect.poll(() => width(aside)).toBeGreaterThan(60)

    await page.keyboard.press('Control+b')
    await expect(aside).toHaveAttribute('data-state', 'expanded')
    await expect.poll(() => width(aside)).toBeGreaterThan(240)

    await page.keyboard.press('Control+b')
    await expect(aside).toHaveAttribute('data-state', 'collapsed')
    await expect.poll(() => width(aside)).toBeLessThan(80)
  })

  test('aria-controls points at the sidebar panel', async ({ page }) => {
    const { demo, aside } = await open(page)
    const trigger = demo.getByRole('button', { name: 'Toggle sidebar', exact: true })
    const id = await aside.getAttribute('id')
    expect(id).toBeTruthy()
    await expect(trigger).toHaveAttribute('aria-controls', id!)
  })

  test('icon-collapsed menu button keeps its name and shows a tooltip on hover and focus', async ({
    page,
  }) => {
    const { demo, aside } = await open(page)
    await page.keyboard.press('Control+b')
    await expect(aside).toHaveAttribute('data-state', 'collapsed')

    const inbox = aside.getByRole('button', { name: 'Inbox' })
    await expect(inbox).toBeVisible()
    // The label span is visually hidden, not removed: width collapses to the icon.
    await expect.poll(() => width(inbox)).toBeLessThan(60)

    await inbox.hover()
    const tip = page.getByRole('tooltip')
    await expect(tip).toBeVisible()
    await expect(tip).toHaveText('Inbox')

    await page.mouse.move(700, 600)
    await expect(tip).toBeHidden()

    await aside.getByRole('button', { name: 'Overview' }).focus()
    await page.keyboard.press('Tab')
    await expect(inbox).toBeFocused()
    await expect(page.getByRole('tooltip')).toHaveText('Inbox')

    // Expanded: no tooltip, label is plainly visible.
    await demo.getByRole('button', { name: 'Toggle sidebar', exact: true }).click()
    await expect(aside).toHaveAttribute('data-state', 'expanded')
    await aside.getByRole('button', { name: 'Overview' }).hover()
    await page.waitForTimeout(400)
    await expect(page.getByRole('tooltip')).toHaveCount(0)
  })

  test('the active item carries aria-current and follows clicks', async ({ page }) => {
    const { aside } = await open(page)
    const overview = aside.getByRole('button', { name: 'Overview' })
    const inbox = aside.getByRole('button', { name: 'Inbox' })
    await expect(overview).toHaveAttribute('aria-current', 'page')
    await expect(inbox).not.toHaveAttribute('aria-current', /.+/)

    await inbox.click()
    await expect(inbox).toHaveAttribute('aria-current', 'page')
    await expect(overview).not.toHaveAttribute('aria-current', /.+/)
    await expect(aside.locator('[aria-current="page"]')).toHaveCount(1)
  })

  test('submenu expands and collapses with the keyboard', async ({ page }) => {
    const { aside } = await open(page)
    const toggle = aside.getByRole('button', { name: 'Projects' })
    const child = aside.getByRole('button', { name: 'Nebula redesign' })

    // Starts open (defaultOpen).
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(child).toBeVisible()
    const controls = await toggle.getAttribute('aria-controls')
    expect(controls).toBeTruthy()
    await expect(aside.locator(`[id="${controls}"]`)).toBeVisible()

    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    // Collapsed content is hidden from sight and from the tab order.
    await expect(child).toBeHidden()

    await page.keyboard.press('Space')
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(child).toBeVisible()

    await page.keyboard.press('Tab')
    await expect(child).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(child).toHaveAttribute('aria-current', 'page')
  })

  test('collapsible="offcanvas" slides away to zero width and hides its content', async ({ page }) => {
    await page.goto('/#/sidebar')
    const demo = page.getByTestId('demo')
    await demo.locator('aside').waitFor()
    // Switch the live control to offcanvas.
    await page.getByRole('combobox', { name: /collapsible/i }).selectOption('offcanvas')
    const aside = demo.locator('aside[data-collapsible="offcanvas"]')
    await aside.waitFor()
    await page.keyboard.press('Control+b')
    await expect(aside).toHaveAttribute('data-state', 'collapsed')
    await expect.poll(() => width(aside)).toBeLessThan(2)
    await expect(aside.getByRole('button', { name: 'Overview' })).toBeHidden()
  })

  test('on a 390px viewport the sidebar opens as a dialog drawer (modal role)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/#/sidebar')
    const demo = page.getByTestId('demo')
    const trigger = demo.getByRole('button', { name: 'Toggle sidebar', exact: true })
    await trigger.waitFor()
    // No inline desktop panel at this size, and no dialog until opened.
    await expect(demo.locator('aside')).toHaveCount(0)
    await expect(page.getByRole('alertdialog')).toHaveCount(0)
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await trigger.click()
    const dialog = page.getByRole('alertdialog', { name: 'Orbit navigation' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Inbox' })).toBeVisible()
    // Left drawer, capped at the sidebar width.
    await expect.poll(() => width(dialog)).toBeLessThanOrEqual(250)
    await expect.poll(async () => (await dialog.boundingBox())?.x).toBe(0)

    await page.keyboard.press('Escape')
    await expect(page.getByRole('alertdialog')).toHaveCount(0)
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
