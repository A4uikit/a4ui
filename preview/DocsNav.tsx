// Docs component list, grouped by category (generated from the registry). Just
// the list — the parent positions it (desktop aside / mobile Drawer).
import { For, Show, type JSX } from 'solid-js'

import { DOC_GROUPS, DOCS } from './registry'

export function DocsNav(props: { selected: string; onSelect: (id: string) => void }): JSX.Element {
  return (
    <div class="space-y-4">
      <For each={DOC_GROUPS}>
        {(group) => {
          const items = DOCS.filter((d) => d.group === group)
          return (
            <Show when={items.length}>
              <div>
                <p class="px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {group}
                </p>
                <ul class="mt-1 space-y-0.5">
                  <For each={items}>
                    {(d) => (
                      <li>
                        <button
                          type="button"
                          onClick={() => props.onSelect(d.id)}
                          class="w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors"
                          classList={{
                            'bg-primary/15 font-medium text-foreground': props.selected === d.id,
                            'text-muted-foreground hover:bg-muted hover:text-foreground':
                              props.selected !== d.id,
                          }}
                        >
                          {d.title}
                        </button>
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            </Show>
          )
        }}
      </For>
    </div>
  )
}
