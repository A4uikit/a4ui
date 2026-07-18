// Full-page screenshots of the example/template pages, for visual review across
// themes and viewports. Run e.g.:
//   THEME=christmas SHOT_PREFIX=exc- npx playwright test --config playwright.shots.config.ts _exshots --project=desktop
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { expect, test } from '@playwright/test'

const exReg = readFileSync(path.resolve('preview/examples/registry.ts'), 'utf8')
const EXAMPLE_IDS = [...exReg.matchAll(/id: '([^']+)'/g)].map((m) => m[1])

const THEME = process.env.THEME ?? 'space'
const PREFIX = process.env.SHOT_PREFIX ?? 'ex-'

test.describe('example shots', () => {
  test.beforeEach(async ({ page }) => {
    // Seed the palette before the app boots so the page renders in that theme.
    await page.addInitScript((theme) => {
      localStorage.setItem('a4ui-theme-name', theme)
    }, THEME)
  })

  for (const id of EXAMPLE_IDS) {
    test(`exshot: ${id}`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(e.message))
      await page.goto(`/#/examples/${id}`)
      await expect(page.getByRole('button', { name: '← All examples' })).toBeVisible()
      await page.waitForTimeout(1200)
      await page.screenshot({ path: path.resolve(`tests/__shots__/${PREFIX}${id}.png`), fullPage: true })
      expect(errors, `runtime errors on #/examples/${id}`).toEqual([])
    })
  }
})
