import { expect, test } from '@playwright/test'

// Behaviour tests for Field and InputGroup. Desktop only (focus/pointer logic
// is viewport-independent).
test.describe('forms: Field and InputGroup', () => {
  // eslint-disable-next-line no-empty-pattern -- Playwright needs the fixtures slot to reach testInfo
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'form tests run on desktop only')
  })

  test('Field: clicking the label focuses its control', async ({ page }) => {
    await page.goto('/#/field')
    const demo = page.getByTestId('demo')
    const input = demo.getByPlaceholder('Ada Orbit')
    await expect(input).not.toBeFocused()
    await demo.locator('label', { hasText: 'Full name' }).click()
    await expect(input).toBeFocused()
  })

  test('Field: aria-describedby lists description and error ids, in that order', async ({ page }) => {
    await page.goto('/#/field')
    const demo = page.getByTestId('demo')
    const pw = demo.locator('input[type="password"]')
    const described = (await pw.getAttribute('aria-describedby'))!.split(' ')
    expect(described).toHaveLength(2)
    await expect(demo.locator(`[id="${described[0]}"]`)).toHaveText('Used to sign in.')
    const error = demo.locator(`[id="${described[1]}"]`)
    await expect(error).toHaveAttribute('role', 'alert')
    await expect(error).toContainText('At least 8 characters')
    await expect(pw).toHaveAttribute('aria-errormessage', described[1]!)
  })

  test('Field: invalid sets aria-invalid on the control only for the invalid field', async ({ page }) => {
    await page.goto('/#/field')
    const demo = page.getByTestId('demo')
    await expect(demo.locator('input[type="password"]')).toHaveAttribute('aria-invalid', 'true')
    await expect(demo.locator('[data-slot="field"][data-invalid]')).toHaveCount(1)
    await expect(demo.getByPlaceholder('Ada Orbit')).not.toHaveAttribute('aria-invalid', 'true')
  })

  test('FieldError: renders a list for several messages', async ({ page }) => {
    await page.goto('/#/field')
    const items = page.getByTestId('demo').locator('[data-slot="field-error"] li')
    await expect(items).toHaveText(['At least 8 characters', 'Include a number'])
  })

  test('InputGroup: clicking an addon focuses the input', async ({ page }) => {
    await page.goto('/#/input-group')
    const demo = page.getByTestId('demo')
    const group = demo.locator('[data-slot="input-group"]').first()
    const input = group.locator('input')
    await expect(input).not.toBeFocused()
    await group.locator('[data-slot="input-group-addon"]').first().click()
    await expect(input).toBeFocused()
  })

  test('InputGroup: password reveal button toggles the input type', async ({ page }) => {
    await page.goto('/#/input-group')
    const demo = page.getByTestId('demo')
    const input = demo.locator('input[aria-label="Password"]')
    await expect(input).toHaveAttribute('type', 'password')
    await demo.getByRole('button', { name: 'Show password' }).click()
    await expect(input).toHaveAttribute('type', 'text')
    await demo.getByRole('button', { name: 'Hide password' }).click()
    await expect(input).toHaveAttribute('type', 'password')
  })

  test('InputGroup: the group, not the inner input, shows the focus ring', async ({ page }) => {
    await page.goto('/#/input-group')
    const demo = page.getByTestId('demo')
    const group = demo.locator('[data-slot="input-group"]').first()
    const input = group.locator('input')
    const shadow = (el: typeof group): Promise<string> => el.evaluate((n) => getComputedStyle(n).boxShadow)
    const before = await shadow(group)
    await input.focus()
    await expect.poll(() => shadow(group)).not.toBe(before)
    // The ring animates in (box-shadow transition): wait for the settled value.
    await expect.poll(() => shadow(group)).toMatch(/[1-9]\d*px/)
    expect(await shadow(input)).not.toMatch(/[1-9]\d*px/)
  })

  test('InputGroup: block-end addon sits below the textarea', async ({ page }) => {
    await page.goto('/#/input-group')
    const group = page.getByTestId('demo').locator('[data-slot="input-group"]').last()
    const area = await group.locator('textarea').boundingBox()
    const addon = await group.locator('[data-align="block-end"]').boundingBox()
    expect(addon!.y).toBeGreaterThanOrEqual(area!.y + area!.height - 1)
  })
})
