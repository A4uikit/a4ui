// Full faceted-filter panel: collapsible checkbox sections (via FilterGroup),
// a min/max price range, active-filter chips, a result count, and clear-all.
// Fully controlled — the caller owns `selected` and `price`; the only local
// state is each section's collapsed/expanded flag.
import { X } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createSignal, For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Button } from '../ui/Button'
import { Collapse } from '../ui/Collapse'
import { NumberInput } from '../ui/NumberInput'
import type { FacetOption } from './FilterGroup'
import { FilterGroup } from './FilterGroup'

export interface FacetSection {
  key: string
  title: string
  options: FacetOption[]
  /** Collapsible section. Defaults to true. */
  collapsible?: boolean
  /** Open by default. Defaults to true. */
  defaultOpen?: boolean
}

export interface FacetPrice {
  min: number
  max: number
  value: [number, number]
}

export interface FacetSidebarProps {
  sections: FacetSection[]
  /** Selected values per section key. */
  selected: Record<string, string[]>
  onChange: (key: string, values: string[]) => void
  /** Optional price range facet. */
  price?: FacetPrice
  onPriceChange?: (range: [number, number]) => void
  /** Result count shown in the header. */
  resultCount?: number
  onClearAll?: () => void
  class?: string
}

interface ActiveChip {
  sectionKey: string
  value: string
  label: string
}

/** One section's title row, collapsible or plain depending on `section.collapsible`. */
function FacetSectionPanel(props: {
  section: FacetSection
  selected: string[]
  onChange: (values: string[]) => void
}): JSX.Element {
  // eslint-disable-next-line solid/reactivity -- seed the open state once from defaultOpen; the user toggles from here
  const [open, setOpen] = createSignal(props.section.defaultOpen ?? true)

  return (
    <Show
      when={props.section.collapsible ?? true}
      fallback={
        <div class="space-y-2">
          <p class="text-sm font-semibold text-foreground">{props.section.title}</p>
          <FilterGroup
            title=""
            options={props.section.options}
            selected={props.selected}
            onChange={props.onChange}
          />
        </div>
      }
    >
      <Collapse open={open()} onOpenChange={setOpen} title={props.section.title}>
        <FilterGroup
          title=""
          options={props.section.options}
          selected={props.selected}
          onChange={props.onChange}
        />
      </Collapse>
    </Show>
  )
}

/**
 * Full faceted-filter sidebar panel: composes {@link FilterGroup} checkbox
 * sections (each optionally collapsible) with a min/max price range, a row of
 * removable active-filter chips, a result count, and a clear-all action.
 * Fully controlled — the caller owns `selected` and `price` state.
 *
 * @example
 * ```tsx
 * const [selected, setSelected] = createSignal<Record<string, string[]>>({ type: ['mug'] })
 * const [price, setPrice] = createSignal<[number, number]>([0, 100])
 * <FacetSidebar
 *   class="w-64"
 *   sections={[
 *     { key: 'type', title: 'Type', options: [{ value: 'mug', label: 'Mug', count: 4 }, { value: 'plate', label: 'Plate', count: 2 }] },
 *     { key: 'color', title: 'Color', options: [{ value: 'blue', label: 'Blue', count: 3 }, { value: 'green', label: 'Green', count: 1 }] },
 *   ]}
 *   selected={selected()}
 *   onChange={(key, values) => setSelected({ ...selected(), [key]: values })}
 *   price={{ min: 0, max: 100, value: price() }}
 *   onPriceChange={setPrice}
 *   resultCount={6}
 *   onClearAll={() => { setSelected({}); setPrice([0, 100]) }}
 * />
 * ```
 */
export function FacetSidebar(props: FacetSidebarProps): JSX.Element {
  const activeChips = (): ActiveChip[] => {
    const chips: ActiveChip[] = []
    for (const section of props.sections) {
      const values = props.selected[section.key] ?? []
      for (const value of values) {
        const option = section.options.find((candidate) => candidate.value === value)
        chips.push({ sectionKey: section.key, value, label: option?.label ?? value })
      }
    }
    return chips
  }

  const removeChip = (chip: ActiveChip): void => {
    const values = props.selected[chip.sectionKey] ?? []
    props.onChange(
      chip.sectionKey,
      values.filter((value) => value !== chip.value),
    )
  }

  const setMin = (raw: number): void => {
    if (!props.price || !props.onPriceChange) return
    const min = Math.min(raw, props.price.value[1])
    props.onPriceChange([min, props.price.value[1]])
  }

  const setMax = (raw: number): void => {
    if (!props.price || !props.onPriceChange) return
    const max = Math.max(raw, props.price.value[0])
    props.onPriceChange([props.price.value[0], max])
  }

  return (
    <div class={cn('space-y-5', props.class)}>
      <div class="flex items-center justify-between gap-2">
        <Show when={props.resultCount != null}>
          <p class="text-sm text-muted-foreground">{props.resultCount} results</p>
        </Show>
        <Show when={props.onClearAll}>
          <Button
            variant="ghost"
            class="ml-auto h-auto px-2 py-1 text-xs"
            onClick={() => props.onClearAll?.()}
          >
            Clear all
          </Button>
        </Show>
      </div>

      <Show when={activeChips().length > 0}>
        <div class="flex flex-wrap gap-2">
          <For each={activeChips()}>
            {(chip) => (
              <span class="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs">
                {chip.label}
                <button
                  type="button"
                  onClick={() => removeChip(chip)}
                  aria-label={`Remove ${chip.label}`}
                  class="text-muted-foreground hover:text-foreground"
                >
                  <X class="h-3 w-3" />
                </button>
              </span>
            )}
          </For>
        </div>
      </Show>

      <Show when={props.price}>
        {(price) => (
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-foreground">Price</p>
              <p class="text-xs text-muted-foreground">
                ${price().value[0]} – ${price().value[1]}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <NumberInput
                value={price().value[0]}
                onChange={setMin}
                min={price().min}
                max={price().value[1]}
                aria-label="Minimum price"
              />
              <span class="text-sm text-muted-foreground">–</span>
              <NumberInput
                value={price().value[1]}
                onChange={setMax}
                min={price().value[0]}
                max={price().max}
                aria-label="Maximum price"
              />
            </div>
          </div>
        )}
      </Show>

      <For each={props.sections}>
        {(section) => (
          <FacetSectionPanel
            section={section}
            selected={props.selected[section.key] ?? []}
            onChange={(values) => props.onChange(section.key, values)}
          />
        )}
      </For>
    </div>
  )
}
