// Navigation trail on Kobalte's Breadcrumbs primitive. Last item is current.
import { Breadcrumbs as KBreadcrumbs } from '@kobalte/core/breadcrumbs'
import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { cn } from '../lib/cn'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  class?: string
}

export function Breadcrumb(props: BreadcrumbProps): JSX.Element {
  return (
    <KBreadcrumbs class={cn('text-sm', props.class)}>
      <ol class="flex items-center gap-2 text-muted-foreground">
        <For each={props.items}>
          {(item, index) => {
            const isLast = () => index() === props.items.length - 1
            return (
              <li class="flex items-center gap-2">
                <Show
                  when={item.href && !isLast()}
                  fallback={
                    <span class={isLast() ? 'font-medium text-foreground' : undefined}>
                      {item.label}
                    </span>
                  }
                >
                  <KBreadcrumbs.Link href={item.href} class="transition-colors hover:text-foreground">
                    {item.label}
                  </KBreadcrumbs.Link>
                </Show>
                <Show when={!isLast()}>
                  <KBreadcrumbs.Separator class="text-muted-foreground/60" />
                </Show>
              </li>
            )
          }}
        </For>
      </ol>
    </KBreadcrumbs>
  )
}
