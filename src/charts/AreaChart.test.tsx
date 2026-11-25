import { render } from 'solid-js/web'
import { afterEach, describe, expect, it } from 'vitest'

import { AreaChart } from './AreaChart'

describe('AreaChart extras', () => {
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

  it('shows the empty state instead of a broken chart', () => {
    dispose = render(
      () => <AreaChart data={[]} series={[{ key: 'a', label: 'A' }]} empty="Sin datos" />,
      host(),
    )
    expect(document.querySelector('[data-chart-empty]')?.textContent).toBe('Sin datos')
    expect(document.querySelector('svg')).toBeNull()
  })

  it('uses ariaLabel and thins x labels with a display format', () => {
    const data = Array.from({ length: 10 }, (_, i) => ({ label: `2025-0${i}`, values: { a: i } }))
    dispose = render(
      () => (
        <AreaChart
          data={data}
          series={[{ key: 'a', label: 'A' }]}
          ariaLabel="Ingresos"
          maxXLabels={5}
          xLabelFormat={(l) => l.slice(2)}
          valueFormat={(v) => `$${v}`}
        />
      ),
      host(),
    )
    expect(document.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('Ingresos')
    const labels = [...document.querySelectorAll('[data-x-label]')].map((e) => e.textContent)
    expect(labels).toEqual(['25-00', '25-02', '25-04', '25-06', '25-08', '25-09'])
  })
})
