// Compact multi-parameter search entry: a single rounded-full bar that
// compresses several fields (e.g. Where / When / Who) into clickable
// segments, ending in a round primary search button.
import type { JSX } from 'solid-js'
import { For } from 'solid-js'
import { Search } from 'lucide-solid'

import { cn } from '../lib/cn'

export interface PillField {
  /** Stable identifier passed back via {@link PillSearchProps.onFieldClick}. */
  key: string
  /** Small label shown above the value, e.g. `"Where"`. */
  label: string
  /** Current value shown below the label. Falls back to `placeholder` when unset. */
  value?: string
  /** Muted hint shown when `value` is unset. */
  placeholder?: string
}

export interface PillSearchProps {
  fields: PillField[]
  /** Called with the clicked field's `key`. */
  onFieldClick?: (key: string) => void
  /** Called when the round search button is pressed. */
  onSearch?: () => void
  class?: string
}

/**
 * Rounded-full search bar that packs several fields into segments with a
 * round primary search button — the classic "Where / When / Who" pattern
 * compressed into one compact control.
 *
 * @example
 * ```tsx
 * <PillSearch
 *   fields={[
 *     { key: 'where', label: 'Where', value: 'Lisbon' },
 *     { key: 'when', label: 'When', placeholder: 'Add dates' },
 *     { key: 'who', label: 'Who', placeholder: 'Add guests' },
 *   ]}
 *   onFieldClick={(key) => console.log('open', key)}
 *   onSearch={() => console.log('search')}
 * />
 * ```
 */
export function PillSearch(props: PillSearchProps): JSX.Element {
  return (
    <div
      class={cn(
        'inline-flex max-w-full items-center overflow-x-auto rounded-full border border-border bg-card shadow-sm',
        props.class,
      )}
    >
      <For each={props.fields}>
        {(field, index) => (
          <button
            type="button"
            aria-label={field.label}
            onClick={() => props.onFieldClick?.(field.key)}
            class={cn(
              'flex min-w-[6.5rem] shrink-0 flex-col items-start px-4 py-2 text-left transition-colors duration-150 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring',
              index() === 0 ? 'rounded-l-full' : 'border-l border-border',
            )}
          >
            <span class="text-xs font-medium text-muted-foreground">{field.label}</span>
            <span class={cn('text-sm', field.value ? 'text-foreground' : 'text-muted-foreground')}>
              {field.value ?? field.placeholder}
            </span>
          </button>
        )}
      </For>
      <div class="shrink-0 py-1.5 pl-1 pr-1.5">
        <button
          type="button"
          aria-label="Search"
          onClick={() => props.onSearch?.()}
          class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-[color,background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <Search class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
