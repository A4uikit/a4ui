// Horizontally-scrollable strip of icon+label category filters, with an
// active-underline indicator — e.g. a storefront category nav (All, Fresh,
// Bakery, Dairy, …). Scrollbar is hidden; Left/Right arrows move selection.
import type { JSX } from 'solid-js'
import { For } from 'solid-js'

import { cn } from '../lib/cn'

/** A single selectable category: value, label, and optional leading icon. */
export interface CategoryItem {
  value: string
  label: string
  icon?: JSX.Element
}

export interface CategoryStripProps {
  items: CategoryItem[]
  value: string
  onChange: (value: string) => void
  class?: string
}

/**
 * Horizontally-scrollable row of icon-over-label category tabs with a
 * bottom-underline indicator on the active item. Left/Right arrow keys move
 * the selection between items.
 *
 * @example
 * ```tsx
 * <CategoryStrip items={categories} value={category()} onChange={setCategory} />
 * ```
 */
export function CategoryStrip(props: CategoryStripProps): JSX.Element {
  const activeIndex = () => props.items.findIndex((item) => item.value === props.value)

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const count = props.items.length
    if (count === 0) return
    const current = activeIndex()
    const delta = event.key === 'ArrowRight' ? 1 : -1
    const next = ((current === -1 ? 0 : current) + delta + count) % count
    props.onChange(props.items[next].value)
  }

  return (
    <div
      role="tablist"
      class={cn(
        'flex gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        props.class,
      )}
      onKeyDown={onKeyDown}
    >
      <For each={props.items}>
        {(item) => {
          const isActive = () => item.value === props.value
          return (
            <button
              type="button"
              role="tab"
              aria-selected={isActive()}
              class={cn(
                'flex shrink-0 flex-col items-center gap-1 border-b-2 px-1 pb-2 text-xs font-medium transition-colors',
                isActive()
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
              onClick={() => props.onChange(item.value)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          )
        }}
      </For>
    </div>
  )
}
