import { readFileSync } from 'node:fs'
import path from 'node:path'

import { expect, test } from '@playwright/test'

// Derive the component list from the docs registry (single source of truth) so
// adding a component to registry.tsx automatically adds it to this suite.
const registry = readFileSync(path.resolve('preview/registry.tsx'), 'utf8')
const IDS = [...registry.matchAll(/id: '([^']+)'/g)].map((m) => m[1])

// --- Every doc page renders (heading + live example) with no runtime errors ---
test.describe('docs render', () => {
  for (const id of IDS) {
    test(`renders: ${id}`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(e.message))

      await page.goto(`/#/${id}`)

      // The doc title is the first h1 (a demo like PageHeader may render its own).
      await expect(page.locator('h1').first()).toBeVisible()
      await expect(page.locator('h1').first()).not.toBeEmpty()
      await expect(page.getByRole('heading', { name: 'Example' })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Code' })).toBeVisible()

      expect(errors, `runtime errors on #/${id}`).toEqual([])
    })
  }
})

// --- Key interactions actually change the UI state ---------------------------
test.describe('interactions', () => {
  test('switch toggles on/off', async ({ page }) => {
    await page.goto('/#/switch')
    const sw = page.locator('input[role="switch"]').first()
    const before = await sw.isChecked()
    await sw.click({ force: true })
    await expect(sw).toBeChecked({ checked: !before })
    await sw.click({ force: true })
    await expect(sw).toBeChecked({ checked: before })
  })

  test('theme toggle flips data-theme', async ({ page }) => {
    await page.goto('/#/button')
    const before = await page.locator('html').getAttribute('data-theme')
    await page.getByRole('button', { name: 'Toggle theme' }).click()
    await expect.poll(() => page.locator('html').getAttribute('data-theme')).not.toBe(before)
  })

  test('effects toggle switches calm mode', async ({ page }) => {
    await page.goto('/#/button')
    const had = await page.evaluate(() => document.documentElement.classList.contains('calm'))
    await page.getByRole('button', { name: 'Visual effects' }).click()
    await expect
      .poll(() => page.evaluate(() => document.documentElement.classList.contains('calm')))
      .toBe(!had)
  })

  test('tabs switch content', async ({ page }) => {
    await page.goto('/#/tabs')
    const tabs = page.getByRole('tab')
    await tabs.nth(1).click()
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
  })

  test('accordion expands a section', async ({ page }) => {
    await page.goto('/#/accordion')
    const trigger = page.locator('main [aria-expanded]').first()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  test('dropdown opens a menu', async ({ page }) => {
    await page.goto('/#/dropdown')
    await page.getByRole('button', { name: 'Actions' }).click()
    await expect(page.getByRole('menuitem').first()).toBeVisible()
  })

  test('modal opens a dialog', async ({ page }) => {
    await page.goto('/#/modal')
    await page.getByRole('button', { name: 'Open modal' }).click()
    await expect(page.getByText('Do you want to continue with this action?')).toBeVisible()
  })

  test('date field opens the calendar (portaled, visible on top)', async ({ page }) => {
    await page.goto('/#/date-field')
    await page.getByRole('button', { name: 'Due date' }).click()
    // A day cell is only present when the (portaled) calendar renders on top.
    await expect(page.getByRole('button', { name: '15', exact: true })).toBeVisible()
  })

  test('pagination advances the page', async ({ page }) => {
    await page.goto('/#/pagination')
    await page.getByRole('button', { name: 'Next page' }).click()
    await expect(page.getByText(/Page\s*2\s*of/)).toBeVisible()
  })

  test('button doc control updates the code block', async ({ page }) => {
    await page.goto('/#/button')
    // Toggle the `disabled` control; the code block should reflect it.
    await page.locator('input[role="switch"]').first().click({ force: true })
    await expect(page.locator('pre')).toContainText('disabled')
  })

  test('context menu opens on right-click', async ({ page }) => {
    await page.goto('/#/context-menu')
    // Scope to the live demo card (the code block also contains this text).
    await page
      .locator('div.flex.flex-wrap.items-start')
      .getByText('Right-click here')
      .click({ button: 'right' })
    await expect(page.getByRole('menuitem', { name: 'Copy' })).toBeVisible()
  })

  test('toggle flips aria-pressed', async ({ page }) => {
    await page.goto('/#/toggle')
    const toggle = page.getByRole('button', { name: 'B', exact: true })
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  })

  test('toggle-group presses the clicked segment', async ({ page }) => {
    await page.goto('/#/toggle-group')
    const center = page.getByRole('button', { name: 'Center' })
    await expect(center).not.toHaveAttribute('data-pressed', '')
    await center.click()
    await expect(center).toHaveAttribute('data-pressed', '')
  })

  test('segmented-control selects the clicked segment', async ({ page }) => {
    await page.goto('/#/segmented-control')
    const cards = page.getByRole('radio', { name: 'Cards' })
    await expect(cards).not.toBeChecked()
    await page.getByText('Cards', { exact: true }).click()
    await expect(cards).toBeChecked()
  })

  test('input reflects typed text', async ({ page }) => {
    await page.goto('/#/input')
    const field = page.getByPlaceholder('Full name')
    await field.fill('Luis Rivera')
    await expect(field).toHaveValue('Luis Rivera')
  })

  test('textarea reflects typed text', async ({ page }) => {
    await page.goto('/#/textarea')
    const field = page.getByPlaceholder('Write a note…')
    await field.fill('A test note')
    await expect(field).toHaveValue('A test note')
  })

  test('select changes value', async ({ page }) => {
    await page.goto('/#/select')
    const select = page.locator('main select').first()
    await select.selectOption('paused')
    await expect(select).toHaveValue('paused')
  })

  test('combobox opens and shows options', async ({ page }) => {
    await page.goto('/#/combobox')
    // Click the trigger button (sibling of the combobox input) to open the listbox.
    await page.locator("xpath=//input[@role='combobox']/following-sibling::button").click()
    await expect(page.getByRole('option', { name: 'Jalisco' })).toBeVisible()
  })

  test('checkbox becomes checked', async ({ page }) => {
    await page.goto('/#/checkbox')
    const box = page.getByRole('checkbox')
    await expect(box).not.toBeChecked()
    await box.click()
    await expect(box).toBeChecked()
  })

  test('radio-group selects the second option', async ({ page }) => {
    await page.goto('/#/radio-group')
    await page.getByText('Annual', { exact: true }).click()
    await expect(page.getByRole('radio', { name: 'Annual' })).toBeChecked()
  })

  test('slider increases on ArrowRight', async ({ page }) => {
    await page.goto('/#/slider')
    const slider = page.getByRole('slider').first()
    const before = Number(await slider.getAttribute('aria-valuenow'))
    await slider.focus()
    await page.keyboard.press('ArrowRight')
    await expect.poll(() => slider.getAttribute('aria-valuenow').then(Number)).toBeGreaterThan(before)
  })

  test('number-input increments', async ({ page }) => {
    await page.goto('/#/number-input')
    // Scope to the demo card — the controls panel renders its own NumberInputs.
    const demo = page.locator('div.flex.flex-wrap.items-start')
    const input = demo.getByRole('spinbutton')
    const before = Number(await input.inputValue())
    await demo.getByRole('button', { name: 'Increment' }).click()
    await expect.poll(() => input.inputValue().then(Number)).toBeGreaterThan(before)
  })

  test('drawer opens with content', async ({ page }) => {
    await page.goto('/#/drawer')
    await page.getByRole('button', { name: 'Open panel' }).click()
    await expect(page.getByText(/Side panel content/)).toBeVisible()
  })

  test('popover opens with content', async ({ page }) => {
    await page.goto('/#/popover')
    // The Kobalte trigger wraps the Button, so two buttons share the name.
    await page.getByRole('button', { name: 'Open popover' }).first().click()
    await expect(page.getByText('Floating panel', { exact: true })).toBeVisible()
  })

  test('alert dialog opens with content', async ({ page }) => {
    await page.goto('/#/alert-dialog')
    await page.getByRole('button', { name: 'Delete account' }).click()
    await expect(page.getByRole('alertdialog')).toContainText('This action is permanent')
  })

  test('toast appears on trigger', async ({ page }) => {
    await page.goto('/#/toast')
    await page.getByRole('button', { name: 'Success' }).click()
    await expect(page.getByText('Saved').first()).toBeVisible()
  })

  test('tooltip shows on hover', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'hover N/A on touch')
    await page.goto('/#/tooltip')
    await page.getByRole('button', { name: 'Hover me' }).first().hover()
    await expect(page.getByText("I'm a tooltip")).toBeVisible({ timeout: 3000 })
  })

  test('hover-card shows on hover', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'hover N/A on touch')
    await page.goto('/#/hover-card')
    await page.getByRole('button', { name: '@luis_rivera' }).first().hover()
    await expect(page.getByText('Luis Alfredo Rivera')).toBeVisible({ timeout: 3000 })
  })

  test('virtual-list reveals higher rows on scroll', async ({ page }) => {
    await page.goto('/#/virtual-list')
    await expect(page.getByText('Row 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Row 25', { exact: true })).toHaveCount(0)
    await page.getByText('Row 1', { exact: true }).hover()
    await page.mouse.wheel(0, 800)
    await expect(page.getByText('Row 25', { exact: true })).toBeVisible()
  })
})
