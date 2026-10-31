import { expect, test, type Locator } from '@playwright/test'

// Geometry / keyboard tests for the multi-series charts. Desktop only: the
// pointer logic is identical across viewports.
test.describe('multi-series charts', () => {
  // eslint-disable-next-line no-empty-pattern -- Playwright needs the fixtures slot to reach testInfo
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'chart tests run on desktop only')
  })

  interface Box {
    series: string
    category: string
    value: number
    x: number
    y: number
    w: number
    h: number
  }

  const bars = (scope: Locator): Promise<Box[]> =>
    scope.locator('rect[data-bar]').evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect()
        return {
          series: el.getAttribute('data-series') ?? '',
          category: el.getAttribute('data-category') ?? '',
          value: Number(el.getAttribute('data-value')),
          x: r.x,
          y: r.y,
          w: r.width,
          h: r.height,
        }
      }),
    )

  const byCategory = (boxes: Box[]): Map<string, Box[]> => {
    const m = new Map<string, Box[]>()
    for (const b of boxes) m.set(b.category, [...(m.get(b.category) ?? []), b])
    return m
  }

  test('BarChart single mode is unchanged (flex divs, no svg rects)', async ({ page }) => {
    await page.goto('/#/bar-chart')
    const demo = page.getByTestId('demo')
    await expect(demo.locator('div[title="Mon: 12"]')).toBeVisible()
    await expect(demo.locator('rect[data-bar]')).toHaveCount(0)
  })

  test('stacked bars: stack height equals the sum of its segments, in proportion to values', async ({
    page,
  }) => {
    await page.goto('/#/bar-chart')
    const chart = page.getByTestId('bar-stacked')
    await chart.locator('rect[data-bar]').first().waitFor()
    const cats = byCategory(await bars(chart))
    expect(cats.size).toBe(5)

    // pixels per unit, from the tallest segment
    const all = [...cats.values()].flat()
    const unit = all[0].h / all[0].value
    for (const [name, segs] of cats) {
      const sumH = segs.reduce((s, b) => s + b.h, 0)
      const top = Math.min(...segs.map((b) => b.y))
      const bottom = Math.max(...segs.map((b) => b.y + b.h))
      // contiguous stack: its outer extent is the sum of the segment heights
      expect(bottom - top, name).toBeCloseTo(sumH, 1)
      // and each segment is proportional to its value
      for (const b of segs) expect(b.h, `${name}/${b.series}`).toBeCloseTo(b.value * unit, 1)
      // segments share one column
      expect(new Set(segs.map((b) => Math.round(b.x))).size, name).toBe(1)
    }
    // Mon = 12 + 5
    const mon = cats.get('Mon') ?? []
    expect(mon.reduce((s, b) => s + b.h, 0)).toBeCloseTo(17 * unit, 1)
  })

  test('grouped bars: bars of one category sit side by side without overlapping', async ({ page }) => {
    await page.goto('/#/bar-chart')
    const chart = page.getByTestId('bar-grouped')
    await chart.locator('rect[data-bar]').first().waitFor()
    const cats = byCategory(await bars(chart))
    expect(cats.size).toBe(5)
    for (const [name, group] of cats) {
      expect(group.length, name).toBe(2)
      const sorted = [...group].sort((a, b) => a.x - b.x)
      expect(sorted[0].x + sorted[0].w, name).toBeLessThanOrEqual(sorted[1].x + 0.01)
      // all start on the same baseline, heights follow the values
      expect(sorted[0].y + sorted[0].h).toBeCloseTo(sorted[1].y + sorted[1].h, 1)
    }
    const mon = [...(cats.get('Mon') ?? [])].sort((a, b) => a.x - b.x)
    expect(mon[0].h / mon[1].h).toBeCloseTo(12 / 5, 1)
  })

  test('bar legend toggle hides a series and rescales', async ({ page }) => {
    await page.goto('/#/bar-chart')
    const chart = page.getByTestId('bar-grouped')
    await chart.locator('rect[data-bar]').first().waitFor()
    const before = await bars(chart.locator('svg'))
    const toggle = chart.getByRole('button', { name: 'App' })
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await expect(chart.locator('rect[data-series="app"]')).toHaveCount(0)
    await expect(chart.locator('rect[data-series="web"]')).toHaveCount(5)
    const after = await bars(chart.locator('svg'))
    // Mon web (12) keeps its value; the scale shrinks to the web max so it grows or stays
    const web = (xs: Box[]) => xs.find((b) => b.series === 'web' && b.category === 'Mon')
    expect((web(after)?.h ?? 0) / (web(before)?.h ?? 1)).toBeGreaterThanOrEqual(1)
    // bars widen once only one series remains
    expect(web(after)?.w ?? 0).toBeGreaterThan(web(before)?.w ?? 0)
  })

  test('bar chart: arrow keys move the tooltip and it shows every series value', async ({ page }) => {
    await page.goto('/#/bar-chart')
    const chart = page.getByTestId('bar-stacked').locator('[data-chart="bar"]')
    await chart.focus()
    await expect(chart).toBeFocused()
    await chart.press('Home')
    const tip = page.getByTestId('bar-stacked').locator('[data-chart-tooltip]')
    await expect(tip).toContainText('Mon')
    await expect(tip).toContainText('Web:12')
    await expect(tip).toContainText('App:5')
    const x0 = (await tip.boundingBox())?.x ?? 0
    await chart.press('ArrowRight')
    await expect(tip).toContainText('Tue')
    await expect(tip).toContainText('Web:19')
    await expect(tip).toContainText('App:8')
    const x1 = (await tip.boundingBox())?.x ?? 0
    expect(x1).toBeGreaterThan(x0)
    await chart.press('End')
    await expect(tip).toContainText('Fri')
    await expect(tip).toContainText('Web:16')
    await chart.press('Escape')
    await expect(tip).toHaveCount(0)
  })

  test('charts expose a role=img summary with the data', async ({ page }) => {
    await page.goto('/#/bar-chart')
    const chart = page.getByTestId('bar-stacked').locator('[role="img"]')
    await expect(chart).toHaveAttribute('tabindex', '0')
    const label = (await chart.getAttribute('aria-label')) ?? ''
    expect(label).toContain('Stacked bar chart')
    expect(label).toContain('Mon: Web 12, App 5')
  })

  test('AreaChart: stacked layers sit above each other, gradient fills, keyboard tooltip', async ({
    page,
  }) => {
    await page.goto('/#/area-chart')
    const demo = page.getByTestId('area-demo')
    const chart = demo.locator('[data-chart="area"]')
    await chart.waitFor()
    // gradient defs exist per series and the fill references them
    await expect(demo.locator('linearGradient')).toHaveCount(3)
    const fill = await demo.locator('path[data-area]').first().getAttribute('fill')
    expect(fill).toMatch(/^url\(#.+\)$/)
    // stacked: the last series' top edge is above the first's
    const tops = await demo
      .locator('g[data-series]')
      .evaluateAll((gs) =>
        gs.map((g) => g.querySelector('path[data-area]')?.getBoundingClientRect().top ?? NaN),
      )
    expect(tops[2]).toBeLessThan(tops[0])

    await chart.focus()
    await chart.press('Home')
    const tip = demo.locator('[data-chart-tooltip]')
    await expect(tip).toContainText('Jan')
    await expect(tip).toContainText('Orbit:12')
    await expect(tip).toContainText('Nebula:8')
    await expect(tip).toContainText('Pulsar:4')
    await chart.press('ArrowRight')
    await expect(tip).toContainText('Feb')
    await expect(tip).toContainText('Orbit:16')
    await expect(tip).toContainText('Pulsar:6')

    // legend toggle removes a layer
    await demo.getByRole('button', { name: 'Nebula' }).click()
    await expect(demo.locator('g[data-series="nebula"]')).toHaveCount(0)
    await expect(demo.locator('g[data-series]')).toHaveCount(2)
  })

  test('PieChart: slice angles are proportional to values and match the path geometry', async ({ page }) => {
    await page.goto('/#/pie-chart')
    const demo = page.getByTestId('demo')
    const slices = demo.locator('path[data-slice]')
    await expect(slices).toHaveCount(4)
    const info = await slices.evaluateAll((els) =>
      els.map((el) => {
        const d = el.getAttribute('d') ?? ''
        const n = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)
        // M cx cy L x1 y1 A r r rot large sweep x2 y2 Z
        const [cx, cy, x1, y1, , , , , , x2, y2] = n
        const ang = (x: number, y: number) => (Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90
        let sweep = (ang(x2, y2) - ang(x1, y1) + 720) % 360
        if (sweep === 0) sweep = 360
        return {
          value: Number(el.getAttribute('data-value')),
          angle: Number(el.getAttribute('data-angle')),
          sweep,
        }
      }),
    )
    const total = info.reduce((s, i) => s + i.value, 0)
    for (const i of info) {
      expect(i.angle).toBeCloseTo((i.value / total) * 360, 3)
      expect(i.sweep).toBeCloseTo(i.angle, 0)
    }
    expect(info.reduce((s, i) => s + i.angle, 0)).toBeCloseTo(360, 3)
  })

  test('PieChart: legend toggle hides a slice and the rest re-share the circle; arrows show the tooltip', async ({
    page,
  }) => {
    await page.goto('/#/pie-chart')
    const demo = page.getByTestId('demo')
    await demo.getByRole('button', { name: 'Direct' }).click()
    const slices = demo.locator('path[data-slice]')
    await expect(slices).toHaveCount(3)
    const angles = await slices.evaluateAll((els) => els.map((e) => Number(e.getAttribute('data-angle'))))
    expect(angles.reduce((s, a) => s + a, 0)).toBeCloseTo(360, 3)
    // Social 28 of remaining 58
    expect(angles[0]).toBeCloseTo((28 / 58) * 360, 2)

    const chart = demo.locator('[data-chart="pie"]')
    await chart.focus()
    await chart.press('Home')
    const tip = demo.locator('[data-chart-tooltip]')
    await expect(tip).toContainText('Social')
    await expect(tip).toContainText('Value:28')
    await chart.press('ArrowRight')
    await expect(tip).toContainText('Referral')
    await expect(tip).toContainText('Value:18')
  })

  test('RadialBarChart: ring sweep is value / max of a full turn', async ({ page }) => {
    await page.goto('/#/radial-bar-chart')
    const demo = page.getByTestId('demo')
    const rings = demo.locator('path[data-ring]')
    await expect(rings).toHaveCount(3)
    const data = await rings.evaluateAll((els) =>
      els.map((e) => ({
        value: Number(e.getAttribute('data-value')),
        angle: Number(e.getAttribute('data-angle')),
        w: e.getBoundingClientRect().width,
      })),
    )
    for (const r of data) expect(r.angle).toBeCloseTo((r.value / 100) * 360, 3)
    // outer rings are larger than inner ones
    expect(data[0].w).toBeGreaterThan(data[2].w)

    const chart = demo.locator('[data-chart="radial-bar"]')
    await chart.focus()
    await chart.press('Home')
    await chart.press('ArrowRight')
    await expect(demo.locator('[data-chart-tooltip]')).toContainText('Exercise')
    await expect(demo.locator('[data-chart-tooltip]')).toContainText('Value:52')
  })

  for (const id of ['area-chart', 'line-chart']) {
    test(`${id}: each x-axis label sits on its data point`, async ({ page }) => {
      await page.goto(`/#/${id}`)
      const demo = page.getByTestId('demo')
      const labels = demo.locator('[data-x-label]')
      await expect(labels.first()).toBeVisible()
      const offsets = await labels.evaluateAll((els) => {
        const row = els[0].parentElement
        if (!row) throw new Error('x-label row not found')
        const r = row.getBoundingClientRect()
        return els.map((el, i) => {
          const b = el.getBoundingClientRect()
          // Anchor: left edge for the first label, right edge for the last, centre otherwise.
          const at = i === 0 ? b.left : i === els.length - 1 ? b.right : b.left + b.width / 2
          return { actual: at - r.left, expected: (i / (els.length - 1)) * r.width }
        })
      })
      expect(offsets.length).toBeGreaterThan(2)
      for (const o of offsets) expect(Math.abs(o.actual - o.expected)).toBeLessThanOrEqual(1)
      // The plot spans the same width as the label row, so points are at the same fractions.
      const [svgW, rowW] = await demo.evaluate((d) => [
        d.querySelector('svg')?.getBoundingClientRect().width ?? -1,
        d.querySelector('[data-x-label]')?.parentElement?.getBoundingClientRect().width ?? -2,
      ])
      expect(Math.abs(svgW - rowW)).toBeLessThanOrEqual(1)
    })
  }
})
