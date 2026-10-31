import { createSignal, Show } from 'solid-js'
import { render } from 'solid-js/web'
import { afterEach, describe, expect, it } from 'vitest'

import { Field, FieldDescription, FieldError, FieldLabel } from './Field'

// MutationObserver callbacks run as microtasks.
const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0))

describe('Field', () => {
  let dispose: (() => void) | undefined
  afterEach(() => {
    dispose?.()
    document.body.innerHTML = ''
  })

  it('wires a control that is mounted after the Field itself', async () => {
    const [shown, setShown] = createSignal(false)
    const host = document.createElement('div')
    document.body.append(host)
    dispose = render(
      () => (
        <Field invalid>
          <FieldLabel>Email</FieldLabel>
          <Show when={shown()}>
            <input type="email" />
          </Show>
          <FieldDescription>Work address</FieldDescription>
          <FieldError>Required</FieldError>
        </Field>
      ),
      host,
    )
    expect(host.querySelector('input')).toBeNull()

    setShown(true)
    await flush()

    const input = host.querySelector('input')
    const label = host.querySelector('label')
    if (!input || !label) throw new Error('input or label did not render')
    expect(input.id).not.toBe('')
    expect(label.getAttribute('for')).toBe(input.id)
    expect(input.getAttribute('aria-invalid')).toBe('true')
    const describedBy = (input.getAttribute('aria-describedby') ?? '').split(' ')
    const description = Array.from(host.querySelectorAll('[id]')).find(
      (el) => el.textContent === 'Work address',
    )
    expect(description?.id).toBeTruthy()
    expect(describedBy).toContain(description?.id)
    expect(input.getAttribute('aria-errormessage')).toBeTruthy()
  })
})
