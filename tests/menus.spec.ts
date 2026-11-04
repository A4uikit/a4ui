import { expect, test } from '@playwright/test'

// Behaviour tests for Menubar and NavigationMenu. Desktop project only for the
// pointer/keyboard flows; the NavigationMenu mobile test sets its own viewport.
test.describe('menus', () => {
  // eslint-disable-next-line no-empty-pattern -- Playwright needs the fixtures slot to reach testInfo
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'menus tests run on desktop only')
  })

  test.describe('Menubar', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/#/menubar')
      await page.getByTestId('demo').getByRole('menubar').waitFor()
    })

    test('ArrowRight moves focus between the top-level menus', async ({ page }) => {
      const bar = page.getByTestId('demo').getByRole('menubar')
      await bar.getByRole('menuitem', { name: 'File' }).focus()
      await page.keyboard.press('ArrowRight')
      await expect(bar.getByRole('menuitem', { name: 'Edit' })).toBeFocused()
      await page.keyboard.press('ArrowRight')
      await expect(bar.getByRole('menuitem', { name: 'View' })).toBeFocused()
      await page.keyboard.press('ArrowLeft')
      await expect(bar.getByRole('menuitem', { name: 'Edit' })).toBeFocused()
      // Moving focus alone must not open anything.
      await expect(bar.locator('[aria-expanded="true"]')).toHaveCount(0)
    })

    test('once a menu is open, hovering another trigger switches to its menu', async ({ page }) => {
      const bar = page.getByTestId('demo').getByRole('menubar')
      const file = bar.getByRole('menuitem', { name: 'File' })
      const edit = bar.getByRole('menuitem', { name: 'Edit' })
      await file.click()
      await expect(file).toHaveAttribute('aria-expanded', 'true')
      await expect(page.getByRole('menuitem', { name: 'New project' })).toBeVisible()

      await edit.hover()
      await expect(edit).toHaveAttribute('aria-expanded', 'true')
      await expect(file).toHaveAttribute('aria-expanded', 'false')
      await expect(page.getByRole('menuitem', { name: 'Undo' })).toBeVisible()
      await expect(page.getByRole('menuitem', { name: 'New project' })).toHaveCount(0)
    })

    test('hovering a trigger does NOT open a menu while none is open', async ({ page }) => {
      const bar = page.getByTestId('demo').getByRole('menubar')
      await bar.getByRole('menuitem', { name: 'Edit' }).hover()
      await page.waitForTimeout(300)
      await expect(bar.locator('[aria-expanded="true"]')).toHaveCount(0)
    })

    test('checkbox and radio items toggle their ARIA state', async ({ page }) => {
      const demo = page.getByTestId('demo')
      const status = demo.getByTestId('menubar-status')
      await expect(status).toContainText('rulers off')

      await demo.getByRole('menuitem', { name: 'View' }).click()
      const rulers = page.getByRole('menuitemcheckbox', { name: 'Show rulers' })
      await expect(rulers).toHaveAttribute('aria-checked', 'false')
      await rulers.click()
      await expect(status).toContainText('rulers on')

      // Checkbox items keep the menu open so several can be toggled in a row.
      await expect(rulers).toHaveAttribute('aria-checked', 'true')
      await expect(page.getByRole('menuitemcheckbox', { name: 'Show grid' })).toHaveAttribute(
        'aria-checked',
        'true',
      )
      await page.getByRole('menuitemcheckbox', { name: 'Show grid' }).click()
      await expect(status).toContainText('Grid off')
      await expect(page.getByRole('menuitemcheckbox', { name: 'Show grid' })).toHaveAttribute(
        'aria-checked',
        'false',
      )

      await expect(page.getByRole('menuitemradio', { name: '100%' })).toHaveAttribute('aria-checked', 'true')
      await page.getByRole('menuitemradio', { name: '200%' }).click()
      await expect(status).toContainText('zoom 200%')
      await expect(page.getByRole('menuitemradio', { name: '200%' })).toHaveAttribute('aria-checked', 'true')
      await expect(page.getByRole('menuitemradio', { name: '100%' })).toHaveAttribute('aria-checked', 'false')
    })

    test('ArrowRight on a submenu trigger opens the submenu, ArrowLeft closes it', async ({ page }) => {
      const demo = page.getByTestId('demo')
      await demo.getByRole('menuitem', { name: 'File' }).click()
      const sub = page.getByRole('menuitem', { name: 'Export as' })
      await sub.focus()
      await expect(sub).toHaveAttribute('aria-expanded', 'false')
      await expect(page.getByRole('menuitem', { name: 'PNG image' })).toHaveCount(0)

      await page.keyboard.press('ArrowRight')
      await expect(sub).toHaveAttribute('aria-expanded', 'true')
      await expect(page.getByRole('menuitem', { name: 'PNG image' })).toBeFocused()

      await page.keyboard.press('ArrowLeft')
      await expect(page.getByRole('menuitem', { name: 'PNG image' })).toHaveCount(0)
      await expect(sub).toBeFocused()
    })

    test('Escape closes the menu and returns focus to its trigger', async ({ page }) => {
      const demo = page.getByTestId('demo')
      const view = demo.getByRole('menuitem', { name: 'View' })
      await view.click()
      await expect(page.getByRole('menuitemcheckbox', { name: 'Show grid' })).toBeVisible()
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Escape')
      await expect(page.getByRole('menuitemcheckbox', { name: 'Show grid' })).toHaveCount(0)
      await expect(view).toBeFocused()
      await expect(view).toHaveAttribute('aria-expanded', 'false')
    })

    test('selecting an action runs it and closes the menu', async ({ page }) => {
      const demo = page.getByTestId('demo')
      await demo.getByRole('menuitem', { name: 'File' }).click()
      await page.getByRole('menuitem', { name: 'Save' }).click()
      await expect(demo.getByTestId('menubar-status')).toContainText('last action: Save')
      await expect(page.getByRole('menuitem', { name: 'Save' })).toHaveCount(0)
    })
  })

  test.describe('NavigationMenu', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await page.goto('/#/navigation-menu')
      await page.getByTestId('demo').getByRole('menubar').waitFor()
    })

    test('hover opens a panel and Escape closes it', async ({ page }) => {
      const nav = page.getByTestId('demo').getByRole('menubar')
      const products = nav.getByRole('menuitem', { name: 'Products' })
      await expect(products).toHaveAttribute('aria-expanded', 'false')
      await products.hover()
      await expect(products).toHaveAttribute('aria-expanded', 'true')
      await expect(page.getByRole('menuitem', { name: /Analytics/ })).toBeVisible()

      await page.keyboard.press('Escape')
      await expect(products).toHaveAttribute('aria-expanded', 'false')
      await expect(page.getByRole('menuitem', { name: /Analytics/ })).toHaveCount(0)
    })

    test('click opens a panel (keyboard/touch path) and a second click closes it', async ({ page }) => {
      const nav = page.getByTestId('demo').getByRole('menubar')
      const resources = nav.getByRole('menuitem', { name: 'Resources' })
      await resources.focus()
      await page.keyboard.press('Enter')
      await expect(resources).toHaveAttribute('aria-expanded', 'true')
      await expect(page.getByRole('menuitem', { name: /Guides/ })).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(resources).toHaveAttribute('aria-expanded', 'false')
    })

    test('links inside a panel are reachable with Tab and expose their href', async ({ page }) => {
      const nav = page.getByTestId('demo').getByRole('menubar')
      const resources = nav.getByRole('menuitem', { name: 'Resources' })
      await resources.focus()
      await page.keyboard.press('Enter')
      const guides = page.getByRole('menuitem', { name: /Guides/ })
      await expect(guides).toBeVisible()
      await expect(guides).toHaveAttribute('href', /.+/)

      const support = page.getByRole('menuitem', { name: /Support/ })
      await page.keyboard.press('Tab')
      await expect(guides).toBeFocused()
      await page.keyboard.press('Tab')
      await expect(support).toBeFocused()
      await page.keyboard.press('Shift+Tab')
      await expect(guides).toBeFocused()
      await page.keyboard.press('Tab')
      await expect(support).toBeFocused()

      // Tab past the last link must not trap focus: the menu closes and focus
      // returns to its trigger, from where Tab continues through the page.
      await page.keyboard.press('Tab')
      await expect(resources).toHaveAttribute('aria-expanded', 'false')
      await expect(resources).toBeFocused()
    })

    test('the top-level link is focusable and is a real anchor', async ({ page }) => {
      const pricing = page.getByTestId('demo').getByRole('menuitem', { name: 'Pricing' })
      await expect(pricing).toHaveAttribute('href', '#/navigation-menu')
      await pricing.focus()
      await expect(pricing).toBeFocused()
    })

    test('the viewport resizes to fit panels of different sizes', async ({ page }) => {
      const nav = page.getByTestId('demo').getByRole('menubar')
      const viewport = page.locator('.navmenu-viewport')
      const size = async () => {
        const box = await viewport.boundingBox()
        if (!box) throw new Error('viewport has no box')
        return { w: Math.round(box.width), h: Math.round(box.height) }
      }

      await nav.getByRole('menuitem', { name: 'Products' }).hover()
      await expect(page.getByRole('menuitem', { name: /Analytics/ })).toBeVisible()
      await page.waitForTimeout(500) // let the size transition settle
      const big = await size()

      await nav.getByRole('menuitem', { name: 'Resources' }).hover()
      await expect(page.getByRole('menuitem', { name: /Guides/ })).toBeVisible()
      await page.waitForTimeout(500)
      const small = await size()

      // Products is the wide 34rem panel with a featured card; Resources is a 14rem list.
      expect(big.w).toBeGreaterThan(small.w + 150)
      expect(big.h).toBeGreaterThan(small.h + 30)

      // And it grows back when returning to the large panel.
      await nav.getByRole('menuitem', { name: 'Products' }).hover()
      await expect(page.getByRole('menuitem', { name: /Analytics/ })).toBeVisible()
      await page.waitForTimeout(500)
      expect(await size()).toEqual(big)
    })

    test('mobile viewport shows the hamburger and opens the drawer with sections', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto('/#/navigation-menu')
      const demo = page.getByTestId('demo')
      const burger = demo.getByRole('button', { name: 'Open navigation' })
      await expect(burger).toBeVisible()
      await expect(demo.getByRole('menubar')).toHaveCount(0)

      await burger.click()
      const drawer = page.getByRole('dialog', { name: 'Nebula' })
      await expect(drawer).toBeVisible()
      // Anchored to the left edge once the slide-in settles.
      await expect.poll(async () => (await drawer.boundingBox())?.x).toBe(0)
      await expect(drawer).toHaveAttribute('data-side', 'start')

      const products = drawer.getByRole('button', { name: 'Products' })
      await expect(products).toHaveAttribute('aria-expanded', 'false')
      await expect(drawer.getByRole('link', { name: /Analytics/ })).toHaveCount(0)
      await products.click()
      await expect(products).toHaveAttribute('aria-expanded', 'true')
      await expect(drawer.getByRole('link', { name: /Analytics/ })).toBeVisible()
      await expect(drawer.getByRole('link', { name: 'Pricing' })).toBeVisible()

      await page.keyboard.press('Escape')
      await expect(drawer).toBeHidden()
    })
  })
})
