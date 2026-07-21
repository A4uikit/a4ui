// Collapsible JSON tree with type-tinted primitive values.
import { ChevronRight } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createMemo, createSignal, For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Input } from './Input'

export interface JsonViewerProps {
  /** The value to render — object, array, or a primitive at the root. */
  data: unknown
  /** Expand every object/array node on first render. Defaults to `false`. */
  defaultExpanded?: boolean
  class?: string
}

type Entry = { key: string; value: unknown }

function isExpandable(value: unknown): value is Record<string, unknown> | unknown[] {
  return typeof value === 'object' && value !== null
}

function entriesOf(value: Record<string, unknown> | unknown[]): Entry[] {
  return Array.isArray(value)
    ? value.map((v, i) => ({ key: String(i), value: v }))
    : Object.entries(value).map(([key, v]) => ({ key, value: v }))
}

function summaryOf(value: Record<string, unknown> | unknown[]): string {
  const count = entriesOf(value).length
  return Array.isArray(value) ? `[${count}]` : `{${count}}`
}

/** Collects every expandable node's path so `defaultExpanded` can seed them all. */
function collectPaths(value: unknown, path: string, acc: Set<string>): void {
  if (!isExpandable(value)) return
  acc.add(path)
  for (const { key, value: child } of entriesOf(value)) collectPaths(child, `${path}.${key}`, acc)
}

function valueClass(value: unknown): string {
  if (value === null) return 'text-muted-foreground'
  switch (typeof value) {
    case 'string':
      return 'text-accent'
    case 'number':
      return 'text-primary'
    case 'boolean':
      return 'text-secondary-foreground'
    default:
      return 'text-foreground'
  }
}

function formatPrimitive(value: unknown): string {
  return typeof value === 'string' ? `"${value}"` : String(value)
}

function matches(entry: Entry, query: string): boolean {
  if (entry.key.toLowerCase().includes(query)) return true
  if (isExpandable(entry.value)) return entriesOf(entry.value).some((e) => matches(e, query))
  return formatPrimitive(entry.value).toLowerCase().includes(query)
}

/**
 * Collapsible, indented JSON tree. Objects/arrays are expandable nodes (chevron
 * + key + a `{…}` / `[…]` summary with child count); primitives render as
 * `key: value` with the value tinted by type. Expanded state is tracked
 * internally by path, seeded fully-open when `defaultExpanded` is set. An
 * optional search box highlights keys/values that match.
 *
 * @example
 * ```tsx
 * <JsonViewer
 *   defaultExpanded
 *   data={{ user: { id: 1, name: 'Ada', active: true, tags: ['admin', 'core'] } }}
 * />
 * ```
 */
export function JsonViewer(props: JsonViewerProps): JSX.Element {
  const [expanded, setExpanded] = createSignal<Set<string>>(seedExpanded())
  const [query, setQuery] = createSignal('')

  function seedExpanded(): Set<string> {
    if (!props.defaultExpanded) return new Set()
    const acc = new Set<string>()
    collectPaths(props.data, '$', acc)
    return acc
  }

  const toggle = (path: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })

  const normalizedQuery = createMemo(() => query().trim().toLowerCase())

  const highlight = (text: string): JSX.Element => {
    const q = normalizedQuery()
    if (!q) return <>{text}</>
    const i = text.toLowerCase().indexOf(q)
    if (i === -1) return <>{text}</>
    return (
      <>
        {text.slice(0, i)}
        <mark class="bg-accent/30 text-inherit">{text.slice(i, i + q.length)}</mark>
        {text.slice(i + q.length)}
      </>
    )
  }

  const Node = (nodeProps: { entry: Entry; path: string; depth: number }): JSX.Element => {
    const value = () => nodeProps.entry.value
    const path = () => nodeProps.path
    const q = normalizedQuery()
    const visible = createMemo(() => !q || matches(nodeProps.entry, q))

    return (
      <Show when={visible()}>
        <li style={{ 'padding-left': `${nodeProps.depth * 1}rem` }}>
          <Show
            when={isExpandable(value())}
            fallback={
              <div class="flex items-baseline gap-1 py-0.5">
                <span class="w-3.5 shrink-0" aria-hidden="true" />
                <span class="text-foreground">{highlight(nodeProps.entry.key)}:</span>
                <span class={valueClass(value())}>{highlight(formatPrimitive(value()))}</span>
              </div>
            }
          >
            {(() => {
              const container = value() as Record<string, unknown> | unknown[]
              const isOpen = () => expanded().has(path())
              return (
                <>
                  <div
                    class="flex items-baseline gap-1 py-0.5 cursor-pointer rounded hover:bg-muted"
                    onClick={() => toggle(path())}
                  >
                    <ChevronRight
                      class={cn(
                        'h-3.5 w-3.5 shrink-0 self-center transition-transform duration-150',
                        isOpen() && 'rotate-90',
                      )}
                      aria-hidden="true"
                    />
                    <span class="text-foreground">{highlight(nodeProps.entry.key)}:</span>
                    <span class="text-muted-foreground">{summaryOf(container)}</span>
                  </div>
                  <Show when={isOpen()}>
                    <ul>
                      <For each={entriesOf(container)}>
                        {(child) => (
                          <Node entry={child} path={`${path()}.${child.key}`} depth={nodeProps.depth + 1} />
                        )}
                      </For>
                    </ul>
                  </Show>
                </>
              )
            })()}
          </Show>
        </li>
      </Show>
    )
  }

  const rootEntries = createMemo<Entry[]>(() =>
    isExpandable(props.data) ? entriesOf(props.data) : [{ key: '$', value: props.data }],
  )

  return (
    <div class={cn('font-mono text-sm whitespace-pre', props.class)}>
      <Input
        value={query()}
        onInput={setQuery}
        placeholder="Search keys/values…"
        class="mb-2 font-sans text-sm"
        aria-label="Search JSON"
      />
      <ul>
        <For each={rootEntries()}>{(entry) => <Node entry={entry} path={`$.${entry.key}`} depth={0} />}</For>
      </ul>
    </div>
  )
}
