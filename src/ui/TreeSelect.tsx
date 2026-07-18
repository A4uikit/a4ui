// Select-styled trigger that opens a tree popover; leaf clicks pick a value.
import { ChevronDown, ChevronRight } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createSignal, For, onCleanup, onMount, Show } from 'solid-js'
import { cn } from '../lib/cn'
import { type TreeNode } from './Tree'

export interface TreeSelectProps {
  /** Hierarchical options; the same shape consumed by {@link Tree}. */
  nodes: TreeNode[]
  /** Id of the currently selected leaf node. */
  value?: string
  /** Fired when a leaf is picked, with its id and the node itself. */
  onChange: (value: string, node: TreeNode) => void
  /** Text shown when no value is selected. */
  placeholder?: string
  class?: string
}

/** Depth-first search for the node whose `id` matches `value`. */
function findNode(nodes: TreeNode[], value: string): TreeNode | undefined {
  for (const node of nodes) {
    if (node.id === value) return node
    if (node.children) {
      const found = findNode(node.children, value)
      if (found) return found
    }
  }
  return undefined
}

/**
 * A dropdown that pairs a {@link Select}-styled trigger with a {@link Tree} in a
 * popover panel. Clicking a branch toggles its subtree; clicking a leaf calls
 * `onChange` and closes the panel. The trigger shows the selected leaf's label
 * (found by walking `nodes`) or a muted `placeholder`. Closes on outside click.
 *
 * @example
 * ```tsx
 * const [dept, setDept] = createSignal<string>()
 * <TreeSelect
 *   placeholder="Pick a team"
 *   value={dept()}
 *   onChange={(id) => setDept(id)}
 *   nodes={[
 *     {
 *       id: 'eng',
 *       label: 'Engineering',
 *       children: [
 *         { id: 'fe', label: 'Frontend' },
 *         { id: 'be', label: 'Backend' },
 *       ],
 *     },
 *   ]}
 * />
 * ```
 */
export function TreeSelect(props: TreeSelectProps): JSX.Element {
  const [open, setOpen] = createSignal(false)
  const [expanded, setExpanded] = createSignal<Set<string>>(new Set())
  let root!: HTMLDivElement

  const selected = () => (props.value ? findNode(props.nodes, props.value) : undefined)

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const select = (node: TreeNode) => {
    props.onChange(node.id, node)
    setOpen(false)
  }

  const onDocClick = (ev: MouseEvent) => {
    if (root && !root.contains(ev.target as Node)) setOpen(false)
  }
  onMount(() => document.addEventListener('click', onDocClick))
  onCleanup(() => document.removeEventListener('click', onDocClick))

  const Node = (nodeProps: { node: TreeNode; depth: number }): JSX.Element => {
    const hasChildren = () => (nodeProps.node.children?.length ?? 0) > 0
    const isExpanded = () => expanded().has(nodeProps.node.id)
    const isSelected = () => props.value === nodeProps.node.id

    return (
      <li
        role="treeitem"
        aria-expanded={hasChildren() ? isExpanded() : undefined}
        aria-selected={!hasChildren() ? isSelected() : undefined}
      >
        <div
          class={cn(
            'flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-foreground hover:bg-muted cursor-pointer',
            isSelected() && 'bg-accent text-accent-foreground',
          )}
          style={{ 'padding-left': `${nodeProps.depth * 1 + 0.5}rem` }}
          onClick={() => (hasChildren() ? toggle(nodeProps.node.id) : select(nodeProps.node))}
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
    <div ref={root} class={cn('relative', props.class)}>
      <button
        type="button"
        aria-haspopup="tree"
        aria-expanded={open()}
        onClick={() => setOpen((v) => !v)}
        class="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors a4-field"
      >
        <Show when={selected()} fallback={<span class="text-muted-foreground">{props.placeholder}</span>}>
          <span class="truncate">{selected()!.label}</span>
        </Show>
        <ChevronDown class="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
      </button>
      <Show when={open()}>
        <div class="z-50 mt-1 w-full rounded-md border border-border bg-card p-2 shadow-md absolute">
          <ul role="tree" class="text-foreground">
            <For each={props.nodes}>{(node) => <Node node={node} depth={0} />}</For>
          </ul>
        </div>
      </Show>
    </div>
  )
}
