import { readFileSync } from 'node:fs'

import { expect, test } from '@playwright/test'

// The landing page: it must use the width of the screen, report numbers that
// match the docs registry, and host components that actually work. Viewports
// are set per test, so these run on the desktop project only.
test.describe('home page', () => {
  // eslint-disable-next-line no-empty-pattern -- Playwright needs the fixtures slot to reach testInfo
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'home tests set their own viewport')
  })

  for (const [width, minRatio] of [
    [1280, 0.95],
    [1920, 0.95],
    [2560, 0.7],
  ]) {
    test(`content fills the screen at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto('/')
      const showcase = page.getByTestId('home-showcase')
      await expect(showcase).toBeVisible()
      const box = (await showcase.boundingBox())!
      expect(box.width / width).toBeGreaterThan(minRatio)
      // Hero copy and live panel sit side by side, not stacked in a centered column.
      const heading = (await page.getByRole('heading', { level: 1, name: 'A4ui' }).boundingBox())!
      const panel = (await page.getByTestId('home-hero-panel').boundingBox())!
      expect(panel.x).toBeGreaterThan(heading.x + heading.width)
      expect(panel.y).toBeLessThan(heading.y + heading.height)
    })
  }

  for (const width of [375, 768, 1280]) {
    test(`no horizontal page overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto('/')
      await expect(page.getByTestId('home-showcase')).toBeVisible()
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }

  test('the component count matches the docs registry', async ({ page }) => {
    const registry = readFileSync(new URL('../preview/registry.tsx', import.meta.url), 'utf8')
    const groups = [...registry.matchAll(/id: '[^']+',\s*title: '[^']*',\s*group: '([^']*)',/g)].map(
      (m) => m[1],
    )
    const expected = groups.filter((g) => g !== 'Get started' && g !== 'Guides').length
    expect(expected).toBeGreaterThan(200)

    await page.goto('/')
    const tile = page.getByTestId('home-stats').locator('div', { hasText: /^Components$/ })
    await expect(tile.locator('xpath=preceding-sibling::div')).toHaveText(String(expected))
  })

  test('every category card links to a doc page that exists', async ({ page }) => {
    await page.goto('/')
    const hrefs = await page
      .getByRole('heading', { level: 2, name: "What's included" })
      .locator('xpath=../..')
      .getByRole('link')
      .evaluateAll((links) => links.map((l) => l.getAttribute('href')!))
    expect(hrefs).toHaveLength(11)
    const registry = readFileSync(new URL('../preview/registry.tsx', import.meta.url), 'utf8')
    for (const href of hrefs) {
      expect(registry, href).toContain(`id: '${href.replace('#/', '')}',`)
    }
  })

  test('the live panels work: theme buttons recolor the page, tabs switch, KPIs read sensibly', async ({
    page,
  }) => {
    await page.goto('/')
    const showcase = page.getByTestId('home-showcase')
    const primary = () =>
      page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim())
    const before = await primary()
    const dino = showcase.getByRole('button', { name: 'Dino' })
    await expect(dino).toHaveAttribute('aria-pressed', 'false')
    await dino.click()
    await expect(dino).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(primary).not.toBe(before)

    await expect(showcase.getByText('Storage')).toBeVisible()
    await showcase.getByRole('tab', { name: 'Team' }).click()
    await expect(showcase.getByText('4 members')).toBeVisible()
    await expect(showcase.getByText('Storage')).toBeHidden()

    await expect(page.getByTestId('home-hero-panel')).toContainText('+12.4%')
  })
})
