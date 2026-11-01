import { expect, test } from '@playwright/test'

// Conversation lane: ChatThread scrolling, Attachment, ChatMarker, MessageGroup.
test.describe('chat components', () => {
  // eslint-disable-next-line no-empty-pattern -- Playwright needs the fixtures slot to reach testInfo
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'chat tests run on desktop only')
  })

  const jump = (page: import('@playwright/test').Page) => page.getByRole('button', { name: 'Jump to latest' })
  const thread = (page: import('@playwright/test').Page) =>
    page.locator('[data-message-id="m15"]').locator('xpath=..')
  const fromEnd = (page: import('@playwright/test').Page) =>
    thread(page).evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight)

  // Visible inside the thread's own scrollport (the page itself may be scrolled elsewhere).
  const visibleInThread = (page: import('@playwright/test').Page, id: string) =>
    page.evaluate((mid) => {
      const el = document.querySelector(`[data-message-id="${mid}"]`) as HTMLElement
      const box = (el.parentElement as HTMLElement).getBoundingClientRect()
      const r = el.getBoundingClientRect()
      return r.top >= box.top - 1 && r.bottom <= box.bottom + 1
    }, id)

  test('ChatThread: prepending older messages keeps the visible message in place', async ({ page }) => {
    await page.goto('/#/chat-thread')
    await page.getByRole('button', { name: 'Load older' }).waitFor()
    await thread(page).evaluate((el) => {
      el.scrollTop = 40
    })
    const msg = page.locator('[data-message-id="m15"]')
    const offset = () =>
      msg.evaluate(
        (el) =>
          el.getBoundingClientRect().top - (el.parentElement as HTMLElement).getBoundingClientRect().top,
      )
    const before = await offset()
    for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Load older' }).click()
    await expect(page.locator('[data-message-id]')).toHaveCount(12 + 20)
    // 20 messages were added above; without compensation the offset would grow by ~1000px.
    expect(await thread(page).evaluate((el) => el.scrollTop)).toBeGreaterThan(500)
    expect(Math.abs((await offset()) - before)).toBeLessThanOrEqual(2)
  })

  test('ChatThread: scrolled up, appending does not jump; the jump button returns to the end', async ({
    page,
  }) => {
    await page.goto('/#/chat-thread')
    await page.getByRole('button', { name: 'Add message' }).waitFor()
    await thread(page).evaluate((el) => {
      el.scrollTop = 0
    })
    await expect(jump(page)).toHaveCount(0)
    await page.getByRole('button', { name: 'Add message' }).click()
    await expect(jump(page)).toBeVisible()
    expect(await thread(page).evaluate((el) => el.scrollTop)).toBeLessThanOrEqual(2)
    await jump(page).click()
    await expect.poll(() => fromEnd(page)).toBeLessThanOrEqual(2)
    await expect(jump(page)).toHaveCount(0)
  })

  test('ChatThread: pinned to the bottom follows an appended message', async ({ page }) => {
    await page.goto('/#/chat-thread')
    await page.getByRole('button', { name: 'Add message' }).waitFor()
    await expect.poll(() => fromEnd(page)).toBeLessThanOrEqual(2)
    await page.getByRole('button', { name: 'Add message' }).click()
    await expect.poll(() => visibleInThread(page, 'm22')).toBe(true)
    await expect(jump(page)).toHaveCount(0)
  })

  test('ChatThread: scrollToMessage brings the target into view', async ({ page }) => {
    await page.goto('/#/chat-thread')
    await page.getByRole('button', { name: 'Go to first' }).waitFor()
    expect(await visibleInThread(page, 'm10')).toBe(false)
    await page.getByRole('button', { name: 'Go to first' }).click()
    await expect.poll(() => visibleInThread(page, 'm10')).toBe(true)
  })

  test('Attachment: uploading exposes a progressbar with aria-valuenow and aria-busy', async ({ page }) => {
    await page.goto('/#/attachment')
    const demo = page.getByTestId('demo')
    await expect(demo.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42')
    await expect(demo.locator('[data-slot=attachment]')).toHaveAttribute('aria-busy', 'true')
    await expect(demo.getByRole('button', { name: 'Remove roadmap-q4.pdf' })).toBeVisible()
  })

  test('ChatMarker: separator renders its text between two lines', async ({ page }) => {
    await page.goto('/#/chat-marker')
    const marker = page.getByTestId('demo').locator('[data-variant=separator]').first()
    await expect(marker).toContainText('Yesterday')
    await expect(marker.locator('span[aria-hidden=true].h-px')).toHaveCount(2)
  })

  test('MessageGroup: the sender name appears once for three messages', async ({ page }) => {
    await page.goto('/#/message')
    const group = page.getByRole('group', { name: 'Messages from Nova' })
    await expect(group.getByText('Nova', { exact: true })).toHaveCount(1)
    await expect(group.getByText(/Aurora's Q3|down from|breakdown/)).toHaveCount(3)
  })
})
