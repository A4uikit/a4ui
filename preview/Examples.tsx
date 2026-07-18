// Examples section: a gallery of full-page templates, and the single-example
// view that renders one under the live theme (so switching themes reskins it).
import { For, Show, Suspense, type JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { Button, Card } from '../src'
import { EXAMPLES } from './examples/registry'

export function ExamplesGallery(props: { onOpen: (id: string) => void }): JSX.Element {
  return (
    <div class="mx-auto max-w-5xl py-8">
      <header class="mb-8 text-center">
        <h1 class="text-3xl font-bold tracking-tight">Examples</h1>
        <p class="mx-auto mt-2 max-w-xl text-muted-foreground">
          Full-page templates built with A4ui. The same page reskins under every theme — switch the theme in
          the top bar and watch them all restyle.
        </p>
      </header>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <For each={EXAMPLES}>
          {(ex) => (
            <button type="button" class="text-left" onClick={() => props.onOpen(ex.id)}>
              <Card glass class="h-full p-5 transition hover:-translate-y-0.5">
                <h3 class="font-semibold">{ex.title}</h3>
                <p class="mt-1 text-sm text-muted-foreground">{ex.blurb}</p>
                <span class="mt-3 inline-block text-sm text-primary">Open →</span>
              </Card>
            </button>
          )}
        </For>
      </div>
    </div>
  )
}

export function ExampleView(props: { id: string; onBack: () => void }): JSX.Element {
  const entry = () => EXAMPLES.find((e) => e.id === props.id)
  return (
    <div>
      <div class="mb-2">
        <Button variant="ghost" onClick={props.onBack}>
          ← All examples
        </Button>
      </div>
      <Show
        when={entry()}
        fallback={<p class="py-24 text-center text-muted-foreground">Example not found.</p>}
      >
        {(e) => (
          <Suspense fallback={<div class="py-24 text-center text-muted-foreground">Loading…</div>}>
            <Dynamic component={e().component} />
          </Suspense>
        )}
      </Show>
    </div>
  )
}
