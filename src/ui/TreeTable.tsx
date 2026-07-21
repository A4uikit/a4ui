// Hierarchical data table: rows can nest via `children`, expand/collapse lives
// in the first column (chevron + depth indentation), all other columns render
// like a plain DataGrid column. Built on the Table primitives + Tree's toggle idiom.
import { ChevronRight } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createSignal, For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from './Table'

/** A column definition for {@link TreeTable}. */
export interface TreeTableColumn<T> {
  /** Row data property this column reads when `cell` is omitted. */
  key: string
  /** Column heading content. */
  header: JSX.Element
  /** Custom cell renderer; falls back to `String(row[key])` when omitted. */
  cell?: (row: T) => JSX.Element
  /** Right-align the column (numbers, totals). */
  align?: 'left' | 'right'
}

/** A single node in a {@link TreeTable}; nodes may nest via `children`. */
export interface TreeTableRow<T> {
  /** Unique identifier; used to track expanded state. */
  id: string
  /** Row payload passed to each column's `cell` renderer. */
  data: T
  /** Child rows revealed when this row is expanded. */
  children?: TreeTableRow<T>[]
}

export interface TreeTableProps<T> {
  columns: TreeTableColumn<T>[]
  rows: TreeTableRow<T>[]
  /** Expand every row with children on first render. Defaults to false. */
  defaultExpanded?: boolean
  class?: string
}

function collectIds<T>(rows: TreeTableRow<T>[], out: Set<string>): void {
  for (const row of rows) {
    if (row.children?.length) {
      out.add(row.id)
      collectIds(row.children, out)
    }
  }
}

/**
 * Hierarchical table: rows may carry `children`, revealed by clicking the
 * chevron in the first column. Depth is shown via indentation; expanded state
 * is tracked internally, seeded fully expanded when `defaultExpanded` is set.
 *
 * @example
 * ```tsx
 * <TreeTable
 *   defaultExpanded
 *   columns={[
 *     { key: 'name', header: 'Name' },
 *     { key: 'size', header: 'Size', align: 'right', cell: (row) => `${row.size} KB` },
 *   ]}
 *   rows={[
 *     {
 *       id: 'src',
 *       data: { name: 'src', size: 0 },
 *       children: [{ id: 'index', data: { name: 'index.ts', size: 2 } }],
 *     },
 *   ]}
 * />
 * ```
 */
export function TreeTable<T>(props: TreeTableProps<T>): JSX.Element {
  const [expanded, setExpanded] = createSignal<Set<string>>(
    props.defaultExpanded ? seedExpanded(props.rows) : new Set<string>(),
  )

  function seedExpanded(rows: TreeTableRow<T>[]): Set<string> {
    const ids = new Set<string>()
    collectIds(rows, ids)
    return ids
  }

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const Rows = (rowsProps: { rows: TreeTableRow<T>[]; depth: number }): JSX.Element => (
    <For each={rowsProps.rows}>
      {(row) => {
        const hasChildren = () => (row.children?.length ?? 0) > 0
        const isExpanded = () => expanded().has(row.id)

        return (
          <>
            <TableRow>
              <For each={props.columns}>
                {(col, colIndex) => (
                  <TableCell class={cn(col.align === 'right' && 'text-right tabular-nums')}>
                    <Show
                      when={colIndex() === 0}
                      fallback={
                        col.cell
                          ? col.cell(row.data)
                          : String((row.data as Record<string, unknown>)[col.key] ?? '')
                      }
                    >
                      <div
                        class="flex items-center gap-1.5"
                        style={{ 'padding-left': `${rowsProps.depth * 1}rem` }}
                      >
                        <Show
                          when={hasChildren()}
                          fallback={<span class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                        >
                          <button
                            type="button"
                            class="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                            aria-expanded={isExpanded()}
                            aria-label={isExpanded() ? 'Collapse row' : 'Expand row'}
                            onClick={() => toggle(row.id)}
                          >
                            <ChevronRight
                              class={cn(
                                'h-3.5 w-3.5 transition-transform duration-200',
                                isExpanded() && 'rotate-90',
                              )}
                              aria-hidden="true"
                            />
                          </button>
                        </Show>
                        <span>
                          {col.cell
                            ? col.cell(row.data)
                            : String((row.data as Record<string, unknown>)[col.key] ?? '')}
                        </span>
                      </div>
                    </Show>
                  </TableCell>
                )}
              </For>
            </TableRow>
            <Show when={hasChildren() && isExpanded()}>
              <Rows rows={row.children ?? []} depth={rowsProps.depth + 1} />
            </Show>
          </>
        )
      }}
    </For>
  )

  return (
    <Table class={props.class}>
      <TableHead>
        <TableRow>
          <For each={props.columns}>
            {(col) => (
              <TableHeadCell class={cn(col.align === 'right' && 'text-right')}>{col.header}</TableHeadCell>
            )}
          </For>
        </TableRow>
      </TableHead>
      <TableBody>
        <Rows rows={props.rows} depth={0} />
      </TableBody>
    </Table>
  )
}
