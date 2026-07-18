// Smoke test for the built Web Components bundle. Run:
//   npx playwright test _wcsmoke --project=desktop
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { test } from '@playwright/test'

test.describe('wc-smoke', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'desktop only')

  test('custom elements render styled in a plain HTML page', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push('console: ' + m.text())
    })
    const url = pathToFileURL(path.resolve('tests/__shots__/wc-smoke.html')).href
    await page.goto(url)
    await page.waitForTimeout(1500)
    const diag = await page.evaluate(() => ({
      defined: !!customElements.get('a4-button'),
      buttonInner: document.querySelector('a4-button')?.innerHTML?.slice(0, 120) ?? '(none)',
      hasNativeButton: !!document.querySelector('a4-button button'),
    }))
    console.log('WC_DIAG', JSON.stringify(diag))
    console.log('WC_ERRORS', JSON.stringify(errors.slice(0, 5)))
    await page.screenshot({ path: path.resolve('tests/__shots__/wc-smoke.png'), fullPage: true })
  })
})
