// Hierarchical, expandable tree view with per-node chevron toggles.
import { ChevronRight } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createSignal, For, Show } from 'solid-js'
import { cn } from '../lib/cn'

/** A single node in a {@link Tree}; nodes may nest via `children`. */
export interface TreeNode {
  /** Unique identifier; used to track expanded state. */
  id: string
  /** Text shown in the node's row. */
  label: string
  /** Optional icon rendered before the label. */
  icon?: JSX.Element
  /** Child nodes revealed when this node is expanded. */
  children?: TreeNode[]
}

export interface TreeProps {
  nodes: TreeNode[]
  /** Ids of nodes expanded on first render. */
  defaultExpanded?: string[]
  class?: string
}

/**
 * Accessible, indented tree view. Nodes with children render a chevron that
 * rotates when expanded; clicking a row toggles its subtree. Expanded state is
 * tracked internally, seeded from `defaultExpanded`.
 *
 * @example
 * ```tsx
 * <Tree
 *   defaultExpanded={['src']}
 *   nodes={[
 *     {
 *       id: 'src',
 *       label: 'src',
 *       children: [
 *         { id: 'index', label: 'index.ts' },
 *         { id: 'ui', label: 'ui', children: [{ id: 'tree', label: 'Tree.tsx' }] },
 *       ],
 *     },
 *   ]}
 * />
 * ```
 */
export function Tree(props: TreeProps): JSX.Element {
  const [expanded, setExpanded] = createSignal<Set<string>>(new Set(props.defaultExpanded ?? []))

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const Node = (nodeProps: { node: TreeNode; depth: number }): JSX.Element => {
    const hasChildren = () => (nodeProps.node.children?.length ?? 0) > 0
    const isExpanded = () => expanded().has(nodeProps.node.id)

    return (
      <li role="treeitem" aria-expanded={hasChildren() ? isExpanded() : undefined}>
        <div
          class="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-foreground hover:bg-muted cursor-pointer"
          style={{ 'padding-left': `${nodeProps.depth * 1 + 0.5}rem` }}
          onClick={() => hasChildren() && toggle(nodeProps.node.id)}
        >
          <Show when={hasChildren()} fallback={<span class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}>
            <ChevronRight
              class={cn(
                'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
                isExpanded() && 'rotate-90',
              )}
              aria-hidden="true"
            />
          </Show>
          <Show when={nodeProps.node.icon}>
            <span class="shrink-0">{nodeProps.node.icon}</span>
          </Show>
          <span class="truncate">{nodeProps.node.label}</span>
        </div>
        <Show when={hasChildren() && isExpanded()}>
          <ul role="group">
            <For each={nodeProps.node.children}>
              {(child) => <Node node={child} depth={nodeProps.depth + 1} />}
            </For>
          </ul>
        </Show>
      </li>
    )
  }

  return (
    <ul role="tree" class={cn('text-foreground', props.class)}>
      <For each={props.nodes}>{(node) => <Node node={node} depth={0} />}</For>
    </ul>
  )
}
