import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// Behaviour tests for the Questionnaire (desktop only: keyboard-driven flows).
test.describe('Questionnaire', () => {
  // eslint-disable-next-line no-empty-pattern -- Playwright needs the fixtures slot to reach testInfo
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'interaction tests run on desktop only')
  })

  async function open(page: Page) {
    await page.goto('/#/questionnaire')
    const demo = page.getByTestId('demo')
    await demo.getByRole('heading', { name: /What best describes your role/ }).waitFor()
    return demo
  }

  test('a required step blocks Next and shows a linked error', async ({ page }) => {
    const demo = await open(page)
    await expect(demo.getByText('1 of 3')).toBeVisible()
    await demo.getByRole('button', { name: 'Next', exact: true }).click()

    const error = demo.getByRole('alert')
    await expect(error).toHaveText('This question is required.')
    await expect(demo.getByText('1 of 3')).toBeVisible()
    // The error is linked to the group and focus lands on the first control.
    const errorId = await error.getAttribute('id')
    await expect(demo.getByRole('group')).toHaveAttribute('aria-describedby', errorId!)
    await expect(demo.getByRole('radio').first()).toBeFocused()
    // A required step has no Skip button.
    await expect(demo.getByRole('button', { name: 'Skip' })).toHaveCount(0)

    // Answering clears the error and unblocks Next.
    await demo.getByRole('radio', { name: /Designer/ }).check()
    await expect(error).toHaveCount(0)
    await demo.getByRole('button', { name: 'Next', exact: true }).click()
    await expect(demo.getByText('2 of 3')).toBeVisible()
  })

  test('digit keys select options; the step heading receives focus on step change', async ({ page }) => {
    const demo = await open(page)
    await demo.getByRole('heading', { name: /What best describes/ }).focus()
    await page.keyboard.press('2')
    await expect(demo.getByRole('radio', { name: /Designer/ })).toBeChecked()
    await page.keyboard.press('3')
    await expect(demo.getByRole('radio', { name: /Product manager/ })).toBeChecked()
    await expect(demo.getByRole('radio', { name: /Designer/ })).not.toBeChecked()

    await page.keyboard.press('Enter')
    await expect(demo.getByText('2 of 3')).toBeVisible()
    await expect(demo.getByRole('heading', { name: /Which tools/ })).toBeFocused()

    // Multiple choice toggles.
    await page.keyboard.press('1')
    await page.keyboard.press('3')
    await expect(demo.getByRole('checkbox', { name: /Code editor/ })).toBeChecked()
    await expect(demo.getByRole('checkbox', { name: /Team chat/ })).toBeChecked()
    await page.keyboard.press('1')
    await expect(demo.getByRole('checkbox', { name: /Code editor/ })).not.toBeChecked()
  })

  test('digits are typed, not intercepted, inside the text field', async ({ page }) => {
    const demo = await open(page)
    await demo.getByRole('radio', { name: /Developer/ }).check()
    await demo.getByRole('button', { name: 'Next', exact: true }).click()
    await demo.getByRole('button', { name: 'Next', exact: true }).click()
    await expect(demo.getByText('3 of 3')).toBeVisible()
    const field = demo.getByRole('textbox', { name: /Anything we should improve/ })
    await field.focus()
    await page.keyboard.type('v2 is 1 step better')
    await expect(field).toHaveValue('v2 is 1 step better')
  })

  test('Skip moves forward and leaves the answer empty; Previous keeps earlier answers', async ({ page }) => {
    const demo = await open(page)
    await demo.getByRole('radio', { name: /Developer/ }).check()
    await demo.getByRole('button', { name: 'Next', exact: true }).click()
    await expect(demo.getByText('2 of 3')).toBeVisible()

    await demo.getByRole('button', { name: 'Skip' }).click()
    await expect(demo.getByText('3 of 3')).toBeVisible()
    await expect(demo.getByRole('textbox')).toHaveValue('')

    await demo.getByRole('button', { name: 'Previous' }).click()
    await expect(demo.getByText('2 of 3')).toBeVisible()
    await expect(demo.getByRole('checkbox', { name: /Code editor/ })).not.toBeChecked()
    await demo.getByRole('button', { name: 'Previous' }).click()
    await expect(demo.getByText('1 of 3')).toBeVisible()
    await expect(demo.getByRole('radio', { name: /Developer/ })).toBeChecked()
  })

  test('Submit calls onSubmit with the exact answers object and shows the thanks panel', async ({ page }) => {
    const demo = await open(page)
    await demo.getByRole('radio', { name: /Product manager/ }).check()
    await demo.getByRole('button', { name: 'Next', exact: true }).click()
    await demo.getByRole('checkbox', { name: /Kanban board/ }).check()
    await demo.getByRole('checkbox', { name: /Team chat/ }).check()
    await demo.getByRole('button', { name: 'Next', exact: true }).click()
    await expect(demo.getByRole('button', { name: 'Next', exact: true })).toHaveCount(0)
    await demo.getByRole('textbox').fill('More shortcuts')
    await demo.getByRole('button', { name: 'Submit' }).click()

    await expect(demo.getByTestId('questionnaire-result')).toHaveText(
      JSON.stringify({ role: 'pm', tools: ['board', 'chat'], feedback: 'More shortcuts' }),
    )
    await expect(demo.getByRole('heading', { name: 'Thanks!' })).toBeVisible()
  })

  test('skipped questions are absent from the submitted answers', async ({ page }) => {
    const demo = await open(page)
    await demo.getByRole('heading', { name: /What best describes/ }).focus()
    await page.keyboard.press('1')
    await demo.getByRole('button', { name: 'Next', exact: true }).click()
    await demo.getByRole('button', { name: 'Skip' }).click()
    await demo.getByRole('button', { name: 'Submit' }).click()
    await expect(demo.getByTestId('questionnaire-result')).toHaveText(JSON.stringify({ role: 'dev' }))
  })

  for (const theme of ['dark', 'light']) {
    test(`axe: no WCAG A/AA violations in ${theme} theme (choice step, error, text step)`, async ({
      page,
    }) => {
      await page.goto('/#/questionnaire')
      await page.evaluate((t) => {
        document.documentElement.dataset.theme = t
      }, theme)
      const demo = page.getByTestId('demo')
      await demo.getByRole('heading', { name: /What best describes/ }).waitFor()
      const scan = async () => {
        const { violations } = await new AxeBuilder({ page }).include('[data-testid="demo"]').analyze()
        expect(violations.map((v) => v.id)).toEqual([])
      }
      await scan()
      await demo.getByRole('button', { name: 'Next', exact: true }).click()
      await expect(demo.getByRole('alert')).toBeVisible()
      await scan()
      await demo.getByRole('radio').first().check()
      await demo.getByRole('button', { name: 'Next', exact: true }).click()
      await demo.getByRole('button', { name: 'Next', exact: true }).click()
      await expect(demo.getByRole('textbox')).toBeVisible()
      await scan()
    })
  }
})
