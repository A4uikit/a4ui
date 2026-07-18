import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// Automated accessibility gate: a WCAG 2 A/AA scan on the default theme, plus a
// color-contrast pass across every built-in theme × light/dark — so a new or
// edited palette can't ship a token combo that fails contrast unnoticed.
//
// Desktop only (the palettes/DOM are identical across viewports; running once
// keeps the suite fast).

const THEMES = ['space', 'dino', 'doctor', 'scientist', 'soccer', 'snow', 'christmas'] as const
const MODES = ['dark', 'light'] as const

// Pages that between them render most token combinations (buttons of every
// variant, badge tones, form inputs + muted labels, cards, headings, tables).
const GENERAL_PAGES = ['', 'button', 'input', 'alert', 'table', 'select']
const CONTRAST_PAGES = ['', 'button', 'badge']

function summarize(violations: { id: string; nodes: { target: unknown[] }[] }[]): string {
  return violations
    .map((v) => `${v.id} ×${v.nodes.length} — e.g. ${String(v.nodes[0]?.target?.join(' '))}`)
    .join('\n')
}

test.describe('a11y', () => {
  // eslint-disable-next-line no-empty-pattern -- Playwright needs the fixtures slot to reach testInfo
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'a11y scan runs on desktop only')
  })

  // Full WCAG 2 A/AA scan on the default (Space) theme.
  for (const id of GENERAL_PAGES) {
    test(`no WCAG A/AA violations: /${id || 'home'}`, async ({ page }) => {
      await page.goto(`/#/${id}`)
      await page.locator('h1').first().waitFor()
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
      expect(violations, summarize(violations)).toEqual([])
    })
  }

  // Color-contrast across every theme × light/dark.
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`contrast: ${theme} / ${mode}`, async ({ page }) => {
        // Seed both persistence keys before the app boots (they're independent).
        await page.addInitScript(
          ([t, m]) => {
            localStorage.setItem('a4ui-theme-name', t)
            localStorage.setItem('a4ui-theme', m)
          },
          [theme, mode] as [string, string],
        )
        const failures: string[] = []
        for (const id of CONTRAST_PAGES) {
          await page.goto(`/#/${id}`)
          await page.locator('h1').first().waitFor()
          const { violations } = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze()
          if (violations.length) failures.push(`[/${id || 'home'}]\n${summarize(violations)}`)
        }
        expect(failures, failures.join('\n\n')).toEqual([])
      })
    }
  }
})
