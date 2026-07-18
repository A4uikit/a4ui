// Sortable + filterable data table built on the Table + Pagination primitives.
// Fully client-side and self-contained: the grid owns its own filter, sort, and
// page signals and derives the visible rows with a single createMemo pipeline
// (filter → sort → paginate). For huge datasets, prefer a server-driven table.
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createMemo, createSignal, For } from 'solid-js'

import { cn } from '../lib/cn'
import { Input } from './Input'
import { Pagination } from './Pagination'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from './Table'

/** A single column definition for {@link DataGrid}. */
export interface DataGridColumn {
  /** Row property this column reads (also used as the sort key). */
  key: string
  /** Column heading text. */
  header: string
  /** When true, the header becomes a button that cycles asc → desc → none. */
  sortable?: boolean
  /** Custom cell renderer; falls back to `String(row[key])` when omitted. */
  render?: (row: Record<string, unknown>) => JSX.Element
}

/** Props for {@link DataGrid}. */
export interface DataGridProps {
  columns: DataGridColumn[]
  rows: Record<string, unknown>[]
  /** Rows per page. Defaults to 10. */
  pageSize?: number
  /** Show the global text filter above the table. Defaults to true. */
  filterable?: boolean
  class?: string
}

type SortDir = 'asc' | 'desc'
type SortState = { key: string; dir: SortDir } | null

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a ?? '').localeCompare(String(b ?? ''))
}

/**
 * Sortable + filterable table. Provide `columns` and `rows`; the grid handles
 * global text filtering, per-column sorting (click a sortable header to cycle
 * ascending → descending → unsorted), and pagination on its own.
 *
 * @example
 * ```tsx
 * <DataGrid
 *   columns={[
 *     { key: 'name', header: 'Name', sortable: true },
 *     { key: 'age', header: 'Age', sortable: true },
 *   ]}
 *   rows={[{ name: 'Alfredo', age: 30 }, { name: 'Sonora', age: 12 }]}
 *   pageSize={25}
 * />
 * ```
 */
export function DataGrid(props: DataGridProps): JSX.Element {
  const [query, setQuery] = createSignal('')
  const [sort, setSort] = createSignal<SortState>(null)
  const [page, setPage] = createSignal(1)

  const pageSize = () => props.pageSize ?? 10
  const filterable = () => props.filterable ?? true

  function cycleSort(key: string) {
    setPage(1)
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
  }

  const filtered = createMemo(() => {
    const q = query().trim().toLowerCase()
    if (!q) return props.rows
    return props.rows.filter((row) =>
      Object.values(row).some((v) =>
        String(v ?? '')
          .toLowerCase()
          .includes(q),
      ),
    )
  })

  const sorted = createMemo(() => {
    const s = sort()
    if (!s) return filtered()
    const factor = s.dir === 'asc' ? 1 : -1
    return [...filtered()].sort((a, b) => compareValues(a[s.key], b[s.key]) * factor)
  })

  const totalPages = createMemo(() => Math.max(1, Math.ceil(sorted().length / pageSize())))

  const paged = createMemo(() => {
    const current = Math.min(page(), totalPages())
    const start = (current - 1) * pageSize()
    return sorted().slice(start, start + pageSize())
  })

  function ariaSort(col: DataGridColumn): JSX.AriaAttributes['aria-sort'] {
    if (!col.sortable) return undefined
    const s = sort()
    if (!s || s.key !== col.key) return 'none'
    return s.dir === 'asc' ? 'ascending' : 'descending'
  }

  function SortIcon(colProps: { col: DataGridColumn }) {
    const s = sort()
    if (!s || s.key !== colProps.col.key) return <ChevronsUpDown class="h-4 w-4 opacity-60" />
    return <>{s.dir === 'asc' ? <ChevronUp class="h-4 w-4" /> : <ChevronDown class="h-4 w-4" />}</>
  }

  return (
    <div class={cn('flex w-full flex-col rounded-lg border border-border bg-background', props.class)}>
      {filterable() && (
        <div class="p-3">
          <Input
            value={query()}
            onInput={(v) => {
              setQuery(v)
              setPage(1)
            }}
            placeholder="Filter…"
            aria-label="Filter rows"
          />
        </div>
      )}
      <Table>
        <TableHead>
          <TableRow>
            <For each={props.columns}>
              {(col) => (
                <TableHeadCell aria-sort={ariaSort(col)}>
                  {col.sortable ? (
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-foreground"
                      onClick={() => cycleSort(col.key)}
                    >
                      {col.header}
                      <SortIcon col={col} />
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHeadCell>
              )}
            </For>
          </TableRow>
        </TableHead>
        <TableBody>
          <For each={paged()}>
            {(row) => (
              <TableRow>
                <For each={props.columns}>
                  {(col) => <TableCell>{col.render?.(row) ?? String(row[col.key] ?? '')}</TableCell>}
                </For>
              </TableRow>
            )}
          </For>
        </TableBody>
      </Table>
      <Pagination
        page={Math.min(page(), totalPages())}
        totalPages={totalPages()}
        onChange={setPage}
        summary={`${sorted().length} rows`}
      />
    </div>
  )
}
