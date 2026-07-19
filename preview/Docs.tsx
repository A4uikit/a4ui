// Renders one doc entry: heading + blurb, a live demo (with optional prop
// controls), and the usage code. Controls are backed by a store; changing one
// re-renders the demo and, when `code` is a function, the code block too.
import { For, Show, type JSX } from 'solid-js'
import { createStore } from 'solid-js/store'

import { Card, Input, NumberInput, Select, Switch } from '../src'
import { CodeBlock } from './CodeBlock'
import { DOCS, type Control, type DocEntry } from './registry'

// The input widget for a non-boolean control (booleans use a Switch directly).
function fieldInput(c: Control, value: () => unknown, onChange: (v: unknown) => void): JSX.Element {
  switch (c.type) {
    case 'select':
      return (
        <Select value={value() as string} onChange={onChange}>
          <For each={c.options}>{(o) => <option value={o}>{o}</option>}</For>
        </Select>
      )
    case 'text':
      return <Input value={value() as string} onInput={onChange} />
    case 'number':
      return <NumberInput value={value() as number} onChange={onChange} min={c.min} max={c.max} />
    default:
      return null
  }
}

function ControlField(props: {
  ctrl: Control
  value: () => unknown
  onChange: (v: unknown) => void
}): JSX.Element {
  return (
    <Show
      when={props.ctrl.type !== 'boolean'}
      fallback={
        <Switch checked={props.value() as boolean} onChange={props.onChange} label={props.ctrl.label} />
      }
    >
      <label class="flex min-w-[150px] flex-col gap-1 text-xs">
        <span class="font-medium text-muted-foreground">{props.ctrl.label}</span>
        {fieldInput(props.ctrl, props.value, props.onChange)}
      </label>
    </Show>
  )
}

// Keyed per entry (remounts on id change) so the control store resets.
function ControlledDemo(props: { entry: DocEntry }): JSX.Element {
  // eslint-disable-next-line solid/reactivity -- keyed per entry (remounts on id change), so reading controls once at setup is intentional
  const entries = Object.entries(props.entry.controls ?? {})
  const [values, setValues] = createStore<Record<string, unknown>>(
    Object.fromEntries(entries.map(([k, c]) => [k, c.default])),
  )
  const code = () =>
    typeof props.entry.code === 'function' ? props.entry.code(values as never) : props.entry.code
  return (
    <>
      <section class="space-y-3">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Example</h2>
        <Card glass class="p-6">
          <div data-testid="demo" class="flex flex-wrap items-start gap-4">
            {props.entry.demo(values as never)}
          </div>
        </Card>
        <Show when={entries.length}>
          <div class="rounded-lg border border-border bg-card/40 p-4">
            <p class="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Controls
            </p>
            <div class="flex flex-wrap items-end gap-4">
              <For each={entries}>
                {([key, ctrl]) => (
                  <ControlField ctrl={ctrl} value={() => values[key]} onChange={(v) => setValues(key, v)} />
                )}
              </For>
            </div>
          </div>
        </Show>
      </section>

      <section class="space-y-3">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Code</h2>
        <CodeBlock code={code()} />
      </section>
    </>
  )
}

export function DocContent(props: { id: string }): JSX.Element {
  const entry = () => DOCS.find((d) => d.id === props.id) ?? DOCS[0]
  return (
    <article class="mx-auto max-w-3xl space-y-8 pb-24">
      <header>
        <p class="text-xs font-semibold uppercase tracking-wide text-primary">{entry().group}</p>
        <h1 class="mt-1 text-3xl font-bold tracking-tight">{entry().title}</h1>
        <p class="mt-2 break-words text-muted-foreground">{entry().blurb}</p>
      </header>
      <Show when={entry()} keyed>
        {(e) => (e.guide ? e.demo({}) : <ControlledDemo entry={e} />)}
      </Show>
    </article>
  )
}
