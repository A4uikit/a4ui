import { render } from 'solid-js/web'
import { afterEach, describe, expect, it } from 'vitest'

import { CalendarCore } from './CalendarCore'

describe('CalendarCore labels', () => {
  let dispose: (() => void) | undefined
  afterEach(() => {
    dispose?.()
    document.body.innerHTML = ''
  })
  const host = () => {
    const h = document.createElement('div')
    document.body.append(h)
    return h
  }
  const names = () =>
    [...document.querySelectorAll('button[aria-label]')].map((b) => b.getAttribute('aria-label'))

  it('defaults to English navigation names', () => {
    dispose = render(() => <CalendarCore onPick={() => {}} />, host())
    expect(names()).toEqual(['Previous year', 'Previous month', 'Next month', 'Next year'])
  })

  it('uses the given labels and falls back per key', () => {
    dispose = render(
      () => (
        <CalendarCore
          onPick={() => {}}
          labels={{ previousMonth: 'Mes anterior', nextMonth: 'Mes siguiente' }}
        />
      ),
      host(),
    )
    expect(names()).toEqual(['Previous year', 'Mes anterior', 'Mes siguiente', 'Next year'])
  })
})
