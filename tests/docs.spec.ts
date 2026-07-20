import { readFileSync } from 'node:fs'
import path from 'node:path'

import { expect, test } from '@playwright/test'

// Derive the component list from the docs registry (single source of truth) so
// adding a component to registry.tsx automatically adds it to this suite. Match
// only DocEntry ids — the ones immediately followed by `title:` — so `id`s used
// inside demo data (e.g. Tree node ids) aren't picked up as doc pages.
const registry = readFileSync(path.resolve('preview/registry.tsx'), 'utf8')
const IDS = [...registry.matchAll(/id: '([^']+)',\s*title:/g)].map((m) => m[1])

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
      if (id.startsWith('guide-')) {
        // Guides render the repo markdown as prose — no Example/Code sections.
        await expect(page.locator('.a4-prose')).toBeVisible()
        await expect(page.locator('.a4-prose h2').first()).toBeVisible()
      } else {
        await expect(page.getByRole('heading', { name: 'Example', exact: true })).toBeVisible()
        // `exact` so a component whose title contains the word (e.g. "CodeTabs")
        // doesn't collide with the "Code" section heading.
        await expect(page.getByRole('heading', { name: 'Code', exact: true })).toBeVisible()
      }

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

  test('effects toggle switches calm mode', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'EffectsToggle is hidden on mobile (topbar space)')
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

  test('announcement bar dismisses', async ({ page }) => {
    await page.goto('/#/announcement-bar')
    const bar = page.getByRole('region', { name: 'Announcement' })
    await expect(bar).toBeVisible()
    await page.getByRole('button', { name: 'Dismiss announcement' }).click()
    await expect(bar).toHaveCount(0)
  })

  test('facet sidebar chips: remove one and clear all', async ({ page }) => {
    await page.goto('/#/facet-sidebar')
    const chips = page.getByRole('button', { name: /^Remove / })
    await expect(chips).toHaveCount(2)
    await page.getByRole('button', { name: 'Remove Mug' }).click()
    await expect(chips).toHaveCount(1)
    await page.getByRole('button', { name: 'Clear all' }).click()
    await expect(chips).toHaveCount(0)
  })

  test('prompt composer submits on cmd/ctrl+enter', async ({ page }) => {
    await page.goto('/#/prompt-composer')
    const box = page.locator('main textarea').first()
    await box.fill('Hello there')
    await expect(box).toHaveValue('Hello there')
    await box.press('ControlOrMeta+Enter')
    await expect(box).toHaveValue('')
  })

  test('inline select edits in place', async ({ page }) => {
    await page.goto('/#/inline-select')
    await page.getByRole('button', { name: /^Edit —/ }).click()
    await page.locator('main select').first().selectOption('done')
    await expect(page.getByRole('button', { name: /^Edit —/ })).toContainText('Done')
  })

  test('artifact panel toggles open', async ({ page }) => {
    await page.goto('/#/artifact-panel')
    const panel = page.locator('main [role="complementary"][aria-label="notes.md"]')
    await expect(panel).toHaveAttribute('aria-hidden', 'true')
    await page.getByRole('button', { name: 'Show artifact' }).click()
    await expect(panel).toHaveAttribute('aria-hidden', 'false')
  })

  test('code tabs switch the shown snippet', async ({ page }) => {
    await page.goto('/#/code-tabs')
    const demoPre = page.getByTestId('demo').locator('pre')
    await expect(demoPre).toContainText('npm install')
    await page.getByRole('tab', { name: 'pnpm', exact: true }).click()
    await expect(demoPre).toContainText('pnpm add')
  })

  test('category strip selects a category', async ({ page }) => {
    await page.goto('/#/category-strip')
    const bakery = page.getByRole('tab', { name: 'Bakery' })
    await bakery.click()
    await expect(bakery).toHaveAttribute('aria-selected', 'true')
  })

  test('master detail switches the detail pane', async ({ page }) => {
    await page.goto('/#/master-detail')
    await page.getByRole('option', { name: /Invoice #4021/ }).click()
    await expect(page.locator('main')).toContainText('Payment of $1,240.00 received')
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
    // `exact` so it doesn't also match the "NotificationCenter" sidebar item.
    const center = page.getByRole('button', { name: 'Center', exact: true })
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

  test('sortable reorders rows by dragging the grip', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'pointer-drag is exercised on desktop')
    await page.goto('/#/sortable')
    const rows = page.locator('[data-sortable-item]')
    await expect(rows.first()).toContainText('Design review')
    const grip = page.getByRole('button', { name: 'Drag to reorder' }).first()
    const gb = (await grip.boundingBox())!
    const third = (await rows.nth(2).boundingBox())!
    await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2)
    await page.mouse.down()
    await page.mouse.move(gb.x + gb.width / 2, gb.y + 20, { steps: 3 })
    await page.mouse.move(gb.x + gb.width / 2, third.y + third.height / 2 + 4, { steps: 8 })
    await page.mouse.up()
    await expect(rows.first()).not.toContainText('Design review')
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

  test('command palette searches and navigates', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Search components' }).click()
    await page.getByPlaceholder('Search components…').fill('modal')
    // Click the "Modal" result (scoped to the palette dialog) → navigates to its doc.
    await page.getByRole('dialog').getByText('Modal', { exact: true }).click()
    await expect(page).toHaveURL(/#\/modal$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Modal' })).toBeVisible()
  })

  test('theme selector recolors the palette and persists across reload', async ({ page }) => {
    await page.goto('/#/button')
    const primary = () =>
      page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim())
    const before = await primary()
    await page.getByRole('button', { name: 'Choose theme' }).click()
    await page.getByRole('menuitem', { name: /Dino/ }).click()
    await expect.poll(primary).not.toBe(before)
    const dino = await primary()
    // The choice survives a reload (persisted to localStorage).
    await page.reload()
    await expect.poll(primary).toBe(dino)
  })

  test('palette and light/dark mode persist independently (no key clash)', async ({ page }) => {
    await page.goto('/#/button')
    await page.getByRole('button', { name: 'Choose theme' }).click()
    await page.getByRole('menuitem', { name: /Doctor/ }).click()
    await page.getByRole('button', { name: 'Toggle theme' }).click() // dark → light
    await page.reload()
    // Both choices survive — they use different localStorage keys.
    await expect.poll(() => page.evaluate(() => localStorage.getItem('a4ui-theme-name'))).toBe('doctor')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    // Doctor's teal (hue 190) is applied, not reset to Space's blue (217).
    await expect
      .poll(() =>
        page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()),
      )
      .toMatch(/^190 /)
  })

  test('theme settings drawer edits a token live', async ({ page }) => {
    await page.goto('/#/button')
    await page.getByRole('button', { name: 'Theme settings' }).click()
    const panel = page.getByRole('dialog', { name: 'Theme settings' })
    await expect(panel).toBeVisible()
    const primary = () =>
      page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim())
    const before = await primary()
    // Moving a color picker recolors the whole site live (inline var on <html>).
    await panel.locator('input[aria-label="Primary"]').evaluate((el) => {
      ;(el as HTMLInputElement).value = '#e0219a'
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await expect.poll(primary).not.toBe(before)
  })

  test('theme edits persist across reload; reset returns to the selected preset', async ({ page }) => {
    await page.goto('/#/button')
    const primary = () =>
      page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim())
    const themePrimary = await primary()
    await page.getByRole('button', { name: 'Theme settings' }).click()
    await page.locator('input[aria-label="Primary"]').evaluate((el) => {
      ;(el as HTMLInputElement).value = '#e0219a'
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await expect.poll(primary).not.toBe(themePrimary)
    const edited = await primary()
    // An accidental refresh keeps the edit (sessionStorage).
    await page.reload()
    await expect.poll(primary).toBe(edited)
    // Reset → back to the currently selected preset, and it stays after reload.
    await page.getByRole('button', { name: 'Theme settings' }).click()
    await page.getByRole('button', { name: 'Reset to theme' }).click()
    await expect.poll(primary).toBe(themePrimary)
    await page.reload()
    await expect.poll(primary).toBe(themePrimary)
  })

  test('cursor glow follows the pointer on space and themed backdrops', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'pointer glow is hover-only')
    const glowOpacity = () =>
      page.evaluate(() => Number(getComputedStyle(document.querySelector('#cursorGlow')!).opacity))
    await page.goto('/#/button')
    await page.mouse.move(400, 300)
    await page.mouse.move(620, 420)
    await expect.poll(glowOpacity).toBeGreaterThan(0)
    // Switch to a themed backdrop — the same live glow works there too.
    await page.getByRole('button', { name: 'Choose theme' }).click()
    await page.getByRole('menuitem', { name: /Dino/ }).click()
    await expect(page.locator('#scenery #cursorGlow')).toBeAttached()
    await page.mouse.move(500, 350)
    await page.mouse.move(680, 500)
    await expect.poll(glowOpacity).toBeGreaterThan(0)
  })

  test('themed backdrop swaps with the theme', async ({ page }) => {
    await page.goto('/#/button')
    // A motif theme renders the lightweight ThemedScenery with floating glyphs.
    await page.getByRole('button', { name: 'Choose theme' }).click()
    await page.getByRole('menuitem', { name: /Dino/ }).click()
    await expect(page.locator('#scenery .motif').first()).toBeAttached()
    await expect(page.locator('#space')).toHaveCount(0)
    // Space falls back to its bespoke starfield backdrop.
    await page.getByRole('button', { name: 'Choose theme' }).click()
    await page.getByRole('menuitem', { name: /Space/ }).click()
    await expect(page.locator('#space')).toHaveCount(1)
    await expect(page.locator('#scenery')).toHaveCount(0)
  })
})

// --- Example/template pages render (derived from the examples registry) -------
const exReg = readFileSync(path.resolve('preview/examples/registry.ts'), 'utf8')
const EXAMPLE_IDS = [...exReg.matchAll(/id: '([^']+)'/g)].map((m) => m[1])

test.describe('examples', () => {
  test('gallery lists the templates', async ({ page }) => {
    await page.goto('/#/examples')
    await expect(page.getByRole('heading', { level: 1, name: 'Examples' })).toBeVisible()
    await expect(page.getByText('Open →').first()).toBeVisible()
  })

  for (const id of EXAMPLE_IDS) {
    test(`renders template: ${id}`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(e.message))
      await page.goto(`/#/examples/${id}`)
      await expect(page.getByRole('button', { name: '← All examples' })).toBeVisible()
      expect(errors, `runtime errors on #/examples/${id}`).toEqual([])
    })
  }
})
