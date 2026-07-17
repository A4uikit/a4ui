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
      await expect(page.getByRole('heading', { name: 'Ejemplo' })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Código' })).toBeVisible()

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
    await page.getByRole('button', { name: 'Cambiar tema' }).click()
    await expect.poll(() => page.locator('html').getAttribute('data-theme')).not.toBe(before)
  })

  test('effects toggle switches calm mode', async ({ page }) => {
    await page.goto('/#/button')
    const had = await page.evaluate(() => document.documentElement.classList.contains('calm'))
    await page.getByRole('button', { name: 'Efectos visuales' }).click()
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
    await page.getByRole('button', { name: 'Acciones' }).click()
    await expect(page.getByRole('menuitem').first()).toBeVisible()
  })

  test('modal opens a dialog', async ({ page }) => {
    await page.goto('/#/modal')
    await page.getByRole('button', { name: 'Abrir modal' }).click()
    await expect(page.getByText('¿Deseas continuar con la operación?')).toBeVisible()
  })

  test('date field opens the calendar (portaled, visible on top)', async ({ page }) => {
    await page.goto('/#/date-field')
    await page.getByRole('button', { name: 'Fecha de entrega' }).click()
    // A day cell is only present when the (portaled) calendar renders on top.
    await expect(page.getByRole('button', { name: '15', exact: true })).toBeVisible()
  })

  test('pagination advances the page', async ({ page }) => {
    await page.goto('/#/pagination')
    await page.getByRole('button', { name: 'Página siguiente' }).click()
    await expect(page.getByText(/Página\s*2\s*de/)).toBeVisible()
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
    await page.locator('div.flex.flex-wrap.items-start').getByText('Haz clic derecho aquí').click({ button: 'right' })
    await expect(page.getByRole('menuitem', { name: 'Copiar' })).toBeVisible()
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
    const centro = page.getByRole('button', { name: 'Centro' })
    await expect(centro).not.toHaveAttribute('data-pressed', '')
    await centro.click()
    await expect(centro).toHaveAttribute('data-pressed', '')
  })

  test('segmented-control selects the clicked segment', async ({ page }) => {
    await page.goto('/#/segmented-control')
    const tarjetas = page.getByRole('radio', { name: 'Tarjetas' })
    await expect(tarjetas).not.toBeChecked()
    await page.getByText('Tarjetas', { exact: true }).click()
    await expect(tarjetas).toBeChecked()
  })

  test('input reflects typed text', async ({ page }) => {
    await page.goto('/#/input')
    const field = page.getByPlaceholder('Nombre completo')
    await field.fill('Luis Rivera')
    await expect(field).toHaveValue('Luis Rivera')
  })

  test('textarea reflects typed text', async ({ page }) => {
    await page.goto('/#/textarea')
    const field = page.getByPlaceholder('Escribe una nota…')
    await field.fill('Una nota de prueba')
    await expect(field).toHaveValue('Una nota de prueba')
  })

  test('select changes value', async ({ page }) => {
    await page.goto('/#/select')
    const select = page.locator('main select').first()
    await select.selectOption('pausado')
    await expect(select).toHaveValue('pausado')
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
    await page.getByText('Anual', { exact: true }).click()
    await expect(page.getByRole('radio', { name: 'Anual' })).toBeChecked()
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
    await page.getByRole('button', { name: 'Abrir panel' }).click()
    await expect(page.getByText(/Contenido del panel lateral/)).toBeVisible()
  })

  test('popover opens with content', async ({ page }) => {
    await page.goto('/#/popover')
    // The Kobalte trigger wraps the Button, so two buttons share the name.
    await page.getByRole('button', { name: 'Abrir popover' }).first().click()
    await expect(page.getByText('Panel flotante', { exact: true })).toBeVisible()
  })

  test('alert dialog opens with content', async ({ page }) => {
    await page.goto('/#/alert-dialog')
    await page.getByRole('button', { name: 'Eliminar cuenta' }).click()
    await expect(page.getByRole('alertdialog')).toContainText('Esta acción es permanente')
  })

  test('toast appears on trigger', async ({ page }) => {
    await page.goto('/#/toast')
    await page.getByRole('button', { name: 'Éxito' }).click()
    await expect(page.getByText('Guardado').first()).toBeVisible()
  })

  test('tooltip shows on hover', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'hover N/A on touch')
    await page.goto('/#/tooltip')
    await page.getByRole('button', { name: 'Pásame el cursor' }).first().hover()
    await expect(page.getByText('Soy un tooltip')).toBeVisible({ timeout: 3000 })
  })

  test('hover-card shows on hover', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'hover N/A on touch')
    await page.goto('/#/hover-card')
    await page.getByRole('button', { name: '@luis_rivera' }).first().hover()
    await expect(page.getByText('Luis Alfredo Rivera')).toBeVisible({ timeout: 3000 })
  })

  test('virtual-list reveals higher rows on scroll', async ({ page }) => {
    await page.goto('/#/virtual-list')
    await expect(page.getByText('Fila 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Fila 25', { exact: true })).toHaveCount(0)
    await page.getByText('Fila 1', { exact: true }).hover()
    await page.mouse.wheel(0, 800)
    await expect(page.getByText('Fila 25', { exact: true })).toBeVisible()
  })
})
