// Shared hover/selection state for two views of the same collection (e.g. a
// map and a list) so interacting with one highlights the other.
import { createSignal } from 'solid-js'

export interface LinkedSelection<Id> {
  hoveredId: () => Id | undefined
  selectedId: () => Id | undefined
  setHovered: (id: Id | undefined) => void
  setSelected: (id: Id | undefined) => void
  isHovered: (id: Id) => boolean
  isSelected: (id: Id) => boolean
  /** Convenience props to spread onto an element for a given id (onPointerEnter/Leave + onClick). */
  itemProps: (id: Id) => { onPointerEnter: () => void; onPointerLeave: () => void; onClick: () => void }
}

/**
 * Shared hovered/selected state for two synchronized views of the same
 * collection (a map and a list, a chart and a table, …): hover a list row to
 * highlight the map pin, and vice versa.
 *
 * @example
 * ```tsx
 * const selection = createLinkedSelection<string>()
 * return (
 *   <For each={items}>
 *     {(item) => <ListRow class={selection.isSelected(item.id) ? 'active' : ''} {...selection.itemProps(item.id)} />}
 *   </For>
 * )
 * ```
 */
export function createLinkedSelection<Id = string>(initialSelected?: Id): LinkedSelection<Id> {
  const [hoveredId, setHoveredId] = createSignal<Id | undefined>(undefined)
  const [selectedId, setSelectedId] = createSignal<Id | undefined>(initialSelected)

  function setHovered(id: Id | undefined) {
    setHoveredId(() => id)
  }

  function setSelected(id: Id | undefined) {
    setSelectedId(() => id)
  }

  function isHovered(id: Id): boolean {
    return hoveredId() === id
  }

  function isSelected(id: Id): boolean {
    return selectedId() === id
  }

  function itemProps(id: Id) {
    return {
      onPointerEnter: () => setHovered(id),
      onPointerLeave: () => setHovered(undefined),
      onClick: () => setSelected(id),
    }
  }

  return { hoveredId, selectedId, setHovered, setSelected, isHovered, isSelected, itemProps }
}
