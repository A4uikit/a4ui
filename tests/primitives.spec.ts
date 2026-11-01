import { expect, test } from '@playwright/test'

// Behaviour tests for the layout/forms/actions primitives (ButtonGroup,
// AspectRatio, Label, NativeSelect, Prose). Desktop only.
test.describe('primitives', () => {
  // eslint-disable-next-line no-empty-pattern -- Playwright needs the fixtures slot to reach testInfo
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'primitive tests run on desktop only')
  })

  test('ButtonGroup: named group, only the outer corners are rounded', async ({ page }) => {
    await page.goto('/#/button-group')
    const group = page.getByTestId('demo').getByRole('group', { name: 'Text alignment' })
    await expect(group).toBeVisible()
    const radii = await group.getByRole('button').evaluateAll((els) =>
      els.map((el) => {
        const s = getComputedStyle(el)
        return [
          s.borderTopLeftRadius,
          s.borderTopRightRadius,
          s.borderBottomRightRadius,
          s.borderBottomLeftRadius,
        ].map(parseFloat)
      }),
    )
    expect(radii).toHaveLength(3)
    const [first, middle, last] = radii
    expect(first[0]).toBeGreaterThan(0)
    expect(first[3]).toBeGreaterThan(0)
    expect(first[1]).toBe(0)
    expect(first[2]).toBe(0)
    expect(middle).toEqual([0, 0, 0, 0])
    expect(last[1]).toBeGreaterThan(0)
    expect(last[2]).toBeGreaterThan(0)
    expect(last[0]).toBe(0)
    expect(last[3]).toBe(0)

    // Shared borders: neighbours overlap by one pixel, no gap.
    const boxes = await group
      .getByRole('button')
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect()))
    expect(boxes[1].left).toBeCloseTo(boxes[0].right - 1, 0)

    await group.getByRole('button', { name: 'Center' }).click()
    await expect(page.getByTestId('bg-last')).toHaveText('center')
  })

  test('ButtonGroup: a Dropdown trigger as the last child joins the group and opens', async ({ page }) => {
    await page.goto('/#/button-group')
    const group = page.getByTestId('demo').getByRole('group', { name: 'Publish actions' })
    const trigger = group.getByRole('button', { name: 'More publish options' })
    const radius = await trigger.evaluate((el) => {
      const s = getComputedStyle(el)
      return [parseFloat(s.borderTopLeftRadius), parseFloat(s.borderTopRightRadius)]
    })
    expect(radius[0]).toBe(0)
    expect(radius[1]).toBeGreaterThan(0)
    await trigger.click()
    await page.getByRole('menuitem', { name: 'Schedule' }).click()
    await expect(page.getByTestId('bg-last')).toHaveText('schedule')
  })

  test('ButtonGroup: vertical orientation stacks and rounds only top/bottom', async ({ page }) => {
    await page.goto('/#/button-group')
    await page.getByLabel('orientation').selectOption('vertical')
    const group = page.getByTestId('demo').getByRole('group', { name: 'Text alignment' })
    const boxes = await group
      .getByRole('button')
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect()))
    expect(boxes[1].top).toBeGreaterThan(boxes[0].top)
    expect(boxes[1].left).toBeCloseTo(boxes[0].left, 0)
    const topLeft = await group
      .getByRole('button')
      .evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius)))
    expect(topLeft[0]).toBeGreaterThan(0)
    expect(topLeft[1]).toBe(0)
  })

  test('AspectRatio: height equals width divided by the ratio', async ({ page }) => {
    await page.goto('/#/aspect-ratio')
    const box = page.getByTestId('ar-box')
    for (const [label, ratio] of [
      ['16/9', 16 / 9],
      ['1/1', 1],
      ['9/16', 9 / 16],
    ] as const) {
      await page.getByLabel('ratio').selectOption(label)
      const { width, height } = await box.evaluate((el) => {
        const r = el.getBoundingClientRect()
        return { width: r.width, height: r.height }
      })
      expect(width).toBeGreaterThan(100)
      expect(Math.abs(height - width / ratio)).toBeLessThan(1.5)
    }
  })

  test('Label: clicking it focuses its control', async ({ page }) => {
    await page.goto('/#/label')
    const demo = page.getByTestId('demo')
    const input = demo.locator('#label-demo-name')
    await expect(input).not.toBeFocused()
    await demo.locator('label[for="label-demo-name"]').click()
    await expect(input).toBeFocused()
    // The asterisk is decorative: aria-hidden.
    await expect(demo.locator('label[for="label-demo-name"] [aria-hidden="true"]')).toHaveText('*')
  })

  test('NativeSelect: choosing an option changes the value and fires onChange', async ({ page }) => {
    await page.goto('/#/native-select')
    const demo = page.getByTestId('demo')
    const select = demo.getByRole('combobox', { name: 'Plan' })
    await expect(select).toHaveValue('pro')
    await expect(page.getByTestId('ns-value')).toHaveText('pro')
    await select.selectOption('enterprise')
    await expect(select).toHaveValue('enterprise')
    await expect(page.getByTestId('ns-value')).toHaveText('enterprise')
    // Optgroups are real <optgroup> elements.
    expect(await select.locator('optgroup').count()).toBe(2)
  })

  test('NativeSelect: invalid and disabled states reach the element', async ({ page }) => {
    await page.goto('/#/native-select')
    const select = page.getByTestId('demo').getByRole('combobox', { name: 'Plan' })
    await page.getByText('invalid', { exact: true }).click()
    await expect(select).toHaveAttribute('aria-invalid', 'true')
    await page.getByText('disabled', { exact: true }).click()
    await expect(select).toBeDisabled()
  })

  test('Prose: headings are larger than body text and links are styled', async ({ page }) => {
    await page.goto('/#/prose')
    const prose = page.getByTestId('prose-demo')
    const size = (sel: string): Promise<number> =>
      prose
        .locator(sel)
        .first()
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    const h2 = await size('h2')
    const p = await size('p:not(.lead)')
    const lead = await size('p.lead')
    expect(h2).toBeGreaterThan(p)
    expect(lead).toBeGreaterThan(p)

    const link = await prose
      .locator('a')
      .first()
      .evaluate((el) => {
        const s = getComputedStyle(el)
        return {
          decoration: s.textDecorationLine,
          color: s.color,
          parent: getComputedStyle(el.parentElement!).color,
        }
      })
    expect(link.decoration).toBe('underline')
    expect(link.color).not.toBe(link.parent)

    const pre = await prose.locator('pre').evaluate((el) => {
      const s = getComputedStyle(el)
      return { bg: s.backgroundColor, overflowX: s.overflowX }
    })
    expect(pre.bg).not.toBe('rgba(0, 0, 0, 0)')
    expect(pre.overflowX).toBe('auto')
  })

  test('Prose: size changes the heading scale', async ({ page }) => {
    await page.goto('/#/prose')
    const h2 = page.getByTestId('prose-demo').locator('h2')
    const base = await h2.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    await page.getByLabel('size').selectOption('lg')
    await expect
      .poll(() => h2.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)))
      .toBeGreaterThan(base)
  })
})
