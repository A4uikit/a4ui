// Docs navigation, generated from the registry. Collapsible accordions (native
// <details>, so it's accessible and keeps state with no JS): a "Get started"
// section for the non-component pages, and a "Components" section whose
// sub-categories (Forms, Data, Overlays…) each collapse on their own — so the
// long list doesn't drown the categories. Only the section holding the current
// selection starts open.
import { ChevronRight } from 'lucide-solid'
import { For, Show, type JSX } from 'solid-js'

import { DOC_GROUPS, DOCS } from './registry'

const GET_STARTED = 'Get started'
const MOTION = 'Motion'
const GUIDES = 'Guides'

function Item(props: { id: string; title: string; selected: string; onSelect: (id: string) => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => props.onSelect(props.id)}
        class="w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors"
        classList={{
          'bg-primary/15 font-medium text-foreground': props.selected === props.id,
          'text-muted-foreground hover:bg-muted hover:text-foreground': props.selected !== props.id,
        }}
      >
        {props.title}
      </button>
    </li>
  )
}

function Section(props: { title: string; open: boolean; children: JSX.Element; level?: 'top' | 'sub' }) {
  const summary = () =>
    props.level === 'sub'
      ? 'text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'
      : 'text-xs font-bold uppercase tracking-wide text-foreground'
  return (
    <details class="group" open={props.open}>
      <summary
        class={`flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted [&::-webkit-details-marker]:hidden ${summary()}`}
      >
        <span>{props.title}</span>
        <ChevronRight class="h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-90" />
      </summary>
      <div class="mt-0.5 pb-1">{props.children}</div>
    </details>
  )
}

export function DocsNav(props: { selected: string; onSelect: (id: string) => void }): JSX.Element {
  const getStarted = () => DOCS.filter((d) => d.group === GET_STARTED)
  const motionDocs = () => DOCS.filter((d) => d.group === MOTION)
  const guideDocs = () => DOCS.filter((d) => d.group === GUIDES)
  // Components = every group except the top-level sections.
  const componentGroups = () => DOC_GROUPS.filter((g) => g !== GET_STARTED && g !== MOTION && g !== GUIDES)
  const groupHasSelected = (group: string) => DOCS.some((d) => d.group === group && d.id === props.selected)
  const selectionIsComponent = () => componentGroups().some((g) => groupHasSelected(g))

  return (
    <div class="space-y-2">
      <Show when={getStarted().length}>
        <Section title={GET_STARTED} open={groupHasSelected(GET_STARTED)}>
          <ul class="space-y-0.5">
            <For each={getStarted()}>
              {(d) => <Item id={d.id} title={d.title} selected={props.selected} onSelect={props.onSelect} />}
            </For>
          </ul>
        </Section>
      </Show>

      <Section title="Components" open={selectionIsComponent() || props.selected === ''}>
        <div class="space-y-1 border-l border-border/60 pl-2">
          <For each={componentGroups()}>
            {(group) => {
              const items = DOCS.filter((d) => d.group === group)
              return (
                <Show when={items.length}>
                  <Section title={group} level="sub" open={groupHasSelected(group)}>
                    <ul class="space-y-0.5">
                      <For each={items}>
                        {(d) => (
                          <Item
                            id={d.id}
                            title={d.title}
                            selected={props.selected}
                            onSelect={props.onSelect}
                          />
                        )}
                      </For>
                    </ul>
                  </Section>
                </Show>
              )
            }}
          </For>
        </div>
      </Section>

      <Show when={motionDocs().length}>
        <Section title={MOTION} open={groupHasSelected(MOTION)}>
          <ul class="space-y-0.5">
            <For each={motionDocs()}>
              {(d) => <Item id={d.id} title={d.title} selected={props.selected} onSelect={props.onSelect} />}
            </For>
          </ul>
        </Section>
      </Show>

      <Show when={guideDocs().length}>
        <Section title={GUIDES} open={groupHasSelected(GUIDES)}>
          <ul class="space-y-0.5">
            <For each={guideDocs()}>
              {(d) => <Item id={d.id} title={d.title} selected={props.selected} onSelect={props.onSelect} />}
            </For>
          </ul>
        </Section>
      </Show>
    </div>
  )
}
