// One dataset, three switchable presentations: table (reuses Table), board
// (rows grouped into columns, Kanban-style), and gallery (a card grid). The
// view switcher reuses SegmentedControl; board/gallery cards fall back to a
// simple key/value list when no `card` renderer is given.
import type { JSX } from 'solid-js'
import { createMemo, createSignal, For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Badge } from './Badge'
import type { SegmentedOption } from './SegmentedControl'
import { SegmentedControl } from './SegmentedControl'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from './Table'

/** A single table column for {@link DataView}'s table presentation. */
export interface DataViewColumn<T> {
  /** Row property this column reads. */
  key: string
  /** Column heading text. */
  header: string
  /** Custom cell renderer; falls back to `String(row[key])` when omitted. */
  cell?: (row: T) => JSX.Element
}

/** Presentation mode offered by {@link DataView}. */
export type DataViewMode = 'table' | 'board' | 'gallery'

/** Props for {@link DataView}. */
export interface DataViewProps<T> {
  data: T[]
  /** Table columns; also used as the source of truth in board/gallery fallbacks. */
  columns: DataViewColumn<T>[]
  /** Stable row identifier, used as a DOM hook for tests/a11y. */
  getId: (row: T) => string
  /** For board view: group rows into columns by this key. If omitted, board mode is not offered. */
  groupBy?: (row: T) => string
  /** Card renderer for board + gallery. Falls back to a simple key/value list. */
  card?: (row: T) => JSX.Element
  /** Which views to offer (in order). Default: `['table', 'gallery']` plus `'board'` when `groupBy` is set. */
  views?: DataViewMode[]
  /** Controlled current view. Uncontrolled (internal signal) when omitted. */
  view?: DataViewMode
  onViewChange?: (view: DataViewMode) => void
  class?: string
}

const MODE_LABELS: Record<DataViewMode, string> = {
  table: 'Table',
  board: 'Board',
  gallery: 'Gallery',
}

function defaultModes<T>(props: DataViewProps<T>): DataViewMode[] {
  if (props.views) return props.views
  return props.groupBy ? ['table', 'board', 'gallery'] : ['table', 'gallery']
}

/** Key/value fallback used for board + gallery cards when no `card` renderer is given. */
function FallbackCard<T>(props: { row: T }): JSX.Element {
  const entries = () => Object.entries(props.row as Record<string, unknown>)
  return (
    <dl class="flex flex-col gap-1 text-sm">
      <For each={entries()}>
        {([key, value]) => (
          <div class="flex items-center justify-between gap-3">
            <dt class="text-muted-foreground">{key}</dt>
            <dd class="truncate font-medium text-foreground">{String(value)}</dd>
          </div>
        )}
      </For>
    </dl>
  )
}

/**
 * One dataset, switchable between table, board (grouped columns), and
 * gallery (card grid) presentations. Generic over the row type — pass
 * `columns` for the table, an optional `groupBy` to enable the board view,
 * and an optional `card` renderer reused by board + gallery.
 *
 * @example
 * ```tsx
 * <DataView
 *   data={tasks}
 *   getId={(t) => t.id}
 *   columns={[
 *     { key: 'title', header: 'Title' },
 *     { key: 'status', header: 'Status' },
 *   ]}
 *   groupBy={(t) => t.status}
 *   card={(t) => <span class="font-medium">{t.title}</span>}
 * />
 * ```
 */
export function DataView<T>(props: DataViewProps<T>): JSX.Element {
  const modes = createMemo<DataViewMode[]>(() => defaultModes(props))

  const [internalView, setInternalView] = createSignal<DataViewMode>(props.view ?? modes()[0] ?? 'table')

  const view = createMemo(() => props.view ?? internalView())

  const setView = (next: DataViewMode) => {
    if (props.view === undefined) setInternalView(next)
    props.onViewChange?.(next)
  }

  const options = createMemo<SegmentedOption[]>(() =>
    modes().map((mode) => ({ value: mode, label: MODE_LABELS[mode] })),
  )

  const groups = createMemo(() => {
    const groupBy = props.groupBy
    if (!groupBy) return []
    const byKey = new Map<string, T[]>()
    for (const row of props.data) {
      const key = groupBy(row)
      const bucket = byKey.get(key)
      if (bucket) bucket.push(row)
      else byKey.set(key, [row])
    }
    return Array.from(byKey.entries()).map(([key, rows]) => ({ key, rows }))
  })

  return (
    <div class={cn('flex w-full flex-col gap-4', props.class)}>
      <div class="flex items-center justify-end">
        <SegmentedControl
          value={view()}
          onChange={(next) => setView(next as DataViewMode)}
          options={options()}
        />
      </div>

      <Show when={view() === 'table'}>
        <Table>
          <TableHead>
            <TableRow>
              <For each={props.columns}>{(column) => <TableHeadCell>{column.header}</TableHeadCell>}</For>
            </TableRow>
          </TableHead>
          <TableBody>
            <For each={props.data}>
              {(row) => (
                <TableRow data-row-id={props.getId(row)}>
                  <For each={props.columns}>
                    {(column) => (
                      <TableCell>
                        {column.cell?.(row) ?? String((row as Record<string, unknown>)[column.key])}
                      </TableCell>
                    )}
                  </For>
                </TableRow>
              )}
            </For>
          </TableBody>
        </Table>
      </Show>

      <Show when={view() === 'board' && props.groupBy}>
        <div class="flex gap-4 overflow-x-auto">
          <For each={groups()}>
            {(group) => (
              <div class="flex min-w-64 flex-col gap-3 rounded-xl border border-border bg-card p-3 text-card-foreground">
                <div class="flex items-center justify-between gap-2 text-sm font-semibold">
                  <span class="truncate">{group.key}</span>
                  <Badge tone="neutral">{group.rows.length}</Badge>
                </div>
                <div class="flex flex-col gap-2">
                  <For each={group.rows}>
                    {(row) => (
                      <div
                        data-row-id={props.getId(row)}
                        class="rounded-lg border border-border bg-background p-3"
                      >
                        {props.card?.(row) ?? <FallbackCard row={row} />}
                      </div>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>

      <Show when={view() === 'gallery'}>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <For each={props.data}>
            {(row) => (
              <div data-row-id={props.getId(row)} class="card rounded-xl bg-card p-4 text-card-foreground">
                {props.card?.(row) ?? <FallbackCard row={row} />}
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
