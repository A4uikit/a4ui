import { expect, test, type Page } from '@playwright/test'

// Behaviour tests for the data-driven page sections (SiteNav, Hero, FeatureGrid,
// Testimonials, Faq, CtaBanner, ContactSection, SiteFooter, TeamGrid) and the
// "Business site" example that is built only from them. Viewport-specific
// checks set their own size, so these run on the desktop project only.
test.describe('page sections', () => {
  // eslint-disable-next-line no-empty-pattern -- Playwright needs the fixtures slot to reach testInfo
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'section tests set their own viewport')
  })

  const demo = (page: Page) => page.getByTestId('demo')

  test('SiteNav: inline links on desktop, a disclosure menu on phones', async ({ page }) => {
    await page.goto('/#/site-nav')
    const nav = demo(page).getByRole('navigation', { name: 'Main' })
    const menuButton = demo(page).getByRole('button', { name: 'Menu' })
    await expect(nav.getByRole('link', { name: 'Pricing' })).toBeVisible()
    await expect(menuButton).toBeHidden()

    await page.setViewportSize({ width: 375, height: 800 })
    await expect(nav.getByRole('link', { name: 'Pricing' })).toBeHidden()
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    const panel = page.locator(`[id="${await menuButton.getAttribute('aria-controls')}"]`)
    await expect(panel).toBeHidden()
    await menuButton.click()
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    await expect(panel.getByRole('link', { name: 'Pricing' })).toBeVisible()
    await expect(panel.getByRole('link', { name: 'Get started' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()

    await menuButton.click()
    await panel.getByRole('link', { name: 'FAQ' }).click()
    await expect(panel).toBeHidden()
  })

  test('Hero: one h1, CTAs are real links, layout and background controls apply', async ({ page }) => {
    await page.goto('/#/hero-section')
    const hero = demo(page)
    await expect(hero.getByRole('heading', { level: 1 })).toHaveText('Websites that bring customers in')
    await expect(hero.getByRole('link', { name: 'Get a quote' })).toHaveAttribute('href', '#/hero-section')
    await expect(hero.getByRole('link', { name: 'See our work' })).toHaveAttribute('href', '#/hero-section')

    // Center: the image sits under the text.
    const heading = hero.getByRole('heading', { level: 1 })
    const image = hero.locator('img')
    const headingBox = (await heading.boundingBox())!
    const imageBox = (await image.boundingBox())!
    expect(imageBox.y).toBeGreaterThan(headingBox.y + headingBox.height)

    // Split: the image sits beside the text on a wide screen.
    await page.getByLabel('layout').selectOption('split')
    await expect
      .poll(async () => (await image.boundingBox())!.x)
      .toBeGreaterThan((await heading.boundingBox())!.x + (await heading.boundingBox())!.width - 1)

    // Image background: the photo fills the section behind the text, text turns white.
    await page.getByLabel('background').selectOption('image')
    const section = hero.locator('section')
    const sectionBox = (await section.boundingBox())!
    const bgBox = (await hero.locator('img').first().boundingBox())!
    expect(Math.round(bgBox.width)).toBe(Math.round(sectionBox.width))
    expect(Math.round(bgBox.height)).toBe(Math.round(sectionBox.height))
    await expect(heading).toHaveCSS('color', 'rgb(255, 255, 255)')
  })

  test('FeatureGrid: columns control changes the number of cards per row', async ({ page }) => {
    await page.goto('/#/feature-grid')
    const cards = demo(page).getByRole('listitem')
    await expect(cards).toHaveCount(4)
    const tops = async () => await cards.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top))
    const perFirstRow = async () => {
      const ys = await tops()
      return ys.filter((y) => Math.abs(y - ys[0]) < 2).length
    }
    expect(await perFirstRow()).toBe(3)
    await page.getByLabel('columns').selectOption('4')
    await expect.poll(perFirstRow).toBe(4)
    await page.getByLabel('columns').selectOption('2')
    await expect.poll(perFirstRow).toBe(2)
  })

  test('Testimonials: initials fallback without an avatar; marquee duplicates the track', async ({
    page,
  }) => {
    await page.goto('/#/testimonials')
    const first = demo(page).getByRole('figure').filter({ hasText: 'Ana Ruiz' })
    await expect(first).toContainText('We doubled our bookings')
    await expect(first).toContainText('AR')

    await page.getByLabel('layout').selectOption('marquee')
    // Marquee renders the items twice (second copy aria-hidden) for a seamless loop.
    await expect(demo(page).getByText('Ana Ruiz', { exact: true })).toHaveCount(2)
    await expect(
      demo(page).locator('[aria-hidden="true"]').getByText('Ana Ruiz', { exact: true }),
    ).toHaveCount(1)
  })

  test('Faq: answers are collapsed until their question is opened', async ({ page }) => {
    await page.goto('/#/faq')
    const question = demo(page).getByRole('button', { name: 'Can I edit it myself?' })
    await expect(question).toHaveAttribute('aria-expanded', 'false')
    await expect(demo(page).getByText('Text and photos are editable without code.')).toBeHidden()
    await question.click()
    await expect(question).toHaveAttribute('aria-expanded', 'true')
    await expect(demo(page).getByText('Text and photos are editable without code.')).toBeVisible()
  })

  test('CtaBanner: both actions link out', async ({ page }) => {
    await page.goto('/#/cta-banner')
    await expect(demo(page).getByRole('heading', { level: 2 })).toHaveText('Ready to get more customers?')
    await expect(demo(page).getByRole('link', { name: 'Call us' })).toHaveAttribute(
      'href',
      'tel:+525512345678',
    )
  })

  test('ContactSection: labelled required fields, submit hands values to onSubmit', async ({ page }) => {
    await page.goto('/#/contact-section')
    const form = demo(page).locator('form')
    const name = form.getByLabel('Name')
    const email = form.getByLabel('Email')
    const phone = form.getByLabel('Phone')
    const message = form.getByLabel('Message')
    await expect(name).toHaveAttribute('required', '')
    await expect(email).toHaveAttribute('type', 'email')
    await expect(phone).toHaveAttribute('type', 'tel')
    await expect(phone).not.toHaveAttribute('required', '')

    // Empty submit is blocked by native validation: no toast.
    await form.getByRole('button', { name: 'Send message' }).click()
    await expect(page.getByText('Thanks, Rosa!')).toHaveCount(0)
    expect(await name.evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true)

    await name.fill('Rosa')
    await email.fill('rosa@example.com')
    await message.fill('I need a website.')
    await form.getByRole('button', { name: 'Send message' }).click()
    await expect(page.getByText('Thanks, Rosa!')).toBeVisible()

    // Contact details are real links.
    await expect(demo(page).getByRole('link', { name: 'hello@northwind.example' })).toHaveAttribute(
      'href',
      'mailto:hello@northwind.example',
    )
    await expect(demo(page).getByRole('link', { name: '+52 55 1234 5678' })).toHaveAttribute(
      'href',
      'tel:+525512345678',
    )
  })

  test('SiteFooter: link columns are labelled navs, social links have names', async ({ page }) => {
    await page.goto('/#/site-footer')
    const footer = demo(page).locator('footer')
    await expect(footer.getByRole('navigation', { name: 'Services' }).getByRole('link')).toHaveCount(2)
    for (const name of ['Instagram', 'Facebook', 'X', 'LinkedIn']) {
      const link = footer.getByRole('link', { name, exact: true })
      await expect(link).toBeVisible()
      // The glyph actually draws: a non-empty path inside a sized svg.
      const box = await link.locator('svg').boundingBox()
      expect(box?.width).toBeGreaterThan(10)
    }
    await expect(footer).toContainText(`© ${new Date().getFullYear()} Northwind`)
  })

  test('TeamGrid: one card per member with name and role', async ({ page }) => {
    await page.goto('/#/team-grid')
    const members = demo(page).getByRole('listitem')
    await expect(members).toHaveCount(3)
    await expect(members.nth(1)).toContainText('Luis Ortega')
    await expect(members.nth(1)).toContainText('Design lead')
    await expect(members.nth(1)).toContainText('LO')
  })

  for (const width of [375, 1280]) {
    test(`Business site example renders every block without horizontal overflow at ${width}px`, async ({
      page,
    }) => {
      const errors: string[] = []
      page.on('pageerror', (err) => errors.push(err.message))
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/#/examples/business-site')
      await expect(
        page.getByRole('heading', { level: 1, name: 'Websites that bring customers in' }),
      ).toBeVisible()
      for (const heading of [
        'Everything a small business needs',
        'What our clients say',
        'Meet the team',
        'Frequently asked questions',
        'Ready to get more customers?',
        'Get in touch',
      ]) {
        const h = page.getByRole('heading', { level: 2, name: heading })
        await h.scrollIntoViewIfNeeded()
        await expect(h).toBeVisible()
      }
      await expect(page.getByRole('link', { name: 'Choose', exact: true })).toHaveCount(3)
      await expect(page.locator('footer')).toContainText('Northwind Studio')

      // Measured on the example root, not the document: the docs chrome around
      // it is not under test. Nothing inside may stick out past its right edge
      // (the root no longer clips, so an overflowing child would show here).
      const overflowing = await page.getByTestId('business-site').evaluate((root) => {
        const edge = root.getBoundingClientRect().right
        return Array.from(root.querySelectorAll('*'))
          .filter((el) => !el.closest('[aria-hidden="true"]') && !el.closest('.overflow-hidden'))
          .filter((el) => el.getBoundingClientRect().right > edge + 1)
          .map((el) => `${el.tagName.toLowerCase()}.${el.getAttribute('class') ?? ''}`.slice(0, 120))
      })
      expect(overflowing, 'elements wider than the page').toEqual([])
      expect(errors).toEqual([])
    })
  }
})
