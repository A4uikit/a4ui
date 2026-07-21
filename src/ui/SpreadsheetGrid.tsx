// Excel-like editable grid: header row + row-number gutter, keyboard navigation,
// rectangular range selection, and TSV copy/paste. Fixed rows×cols for v1 (no
// add-row); for huge grids, virtualize with @tanstack/solid-virtual instead.
import type { JSX } from 'solid-js'
import { createMemo, createSignal, For } from 'solid-js'

import { cn } from '../lib/cn'

export interface SpreadsheetGridProps {
  /** Number of rows in the grid (fixed for the component's lifetime). */
  rows: number
  /** Number of columns in the grid (fixed for the component's lifetime). */
  cols: number
  /** Initial cell values, seeded once on mount (missing cells default to `''`). */
  data?: string[][]
  /** Called with the full `rows×cols` matrix after any edit or paste. */
  onChange?: (data: string[][]) => void
  /** Column header labels; defaults to `A, B, C, …, Z, AA, AB, …`. */
  columnHeaders?: string[]
  class?: string
}

interface CellPos {
  r: number
  c: number
}

/** Converts a zero-based column index to a spreadsheet-style letter label. */
function colLabel(index: number): string {
  let n = index
  let label = ''
  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label
    n = Math.floor(n / 26) - 1
  }
  return label
}

function seedData(props: SpreadsheetGridProps): string[][] {
  const grid: string[][] = []
  for (let r = 0; r < props.rows; r++) {
    const row: string[] = []
    for (let c = 0; c < props.cols; c++) row.push(props.data?.[r]?.[c] ?? '')
    grid.push(row)
  }
  return grid
}

function cloneData(data: string[][]): string[][] {
  return data.map((row) => [...row])
}

/**
 * Excel-like editable grid. Arrow keys move the active cell; typing or Enter
 * opens an inline editor that commits on Enter/blur and cancels on Escape.
 * Shift+click / Shift+arrow extend a rectangular selection (Ctrl/Cmd+C copies
 * it as TSV, Ctrl/Cmd+V pastes TSV starting at the active cell).
 *
 * @example
 * ```tsx
 * const [sheet, setSheet] = createSignal<string[][]>([])
 * <SpreadsheetGrid rows={10} cols={6} onChange={setSheet} />
 * ```
 */
export function SpreadsheetGrid(props: SpreadsheetGridProps): JSX.Element {
  const [data, setData] = createSignal<string[][]>(seedData(props))
  const [active, setActive] = createSignal<CellPos>({ r: 0, c: 0 })
  const [anchor, setAnchor] = createSignal<CellPos>({ r: 0, c: 0 })
  const [editing, setEditing] = createSignal<CellPos | null>(null)
  const [editValue, setEditValue] = createSignal('')
  let containerRef: HTMLDivElement | undefined

  const headers = createMemo(
    () => props.columnHeaders ?? Array.from({ length: props.cols }, (_, i) => colLabel(i)),
  )
  const rowIndices = createMemo(() => Array.from({ length: props.rows }, (_, i) => i))
  const colIndices = createMemo(() => Array.from({ length: props.cols }, (_, i) => i))

  const bounds = createMemo(() => {
    const a = anchor()
    const b = active()
    return {
      minR: Math.min(a.r, b.r),
      maxR: Math.max(a.r, b.r),
      minC: Math.min(a.c, b.c),
      maxC: Math.max(a.c, b.c),
    }
  })

  function inSelection(r: number, c: number): boolean {
    const b = bounds()
    return r >= b.minR && r <= b.maxR && c >= b.minC && c <= b.maxC
  }

  function isActive(r: number, c: number): boolean {
    const a = active()
    return a.r === r && a.c === c
  }

  function isAnchor(r: number, c: number): boolean {
    const a = anchor()
    return a.r === r && a.c === c
  }

  function isEditing(r: number, c: number): boolean {
    const e = editing()
    return e !== null && e.r === r && e.c === c
  }

  function commitCell(r: number, c: number, value: string) {
    const next = cloneData(data())
    next[r][c] = value
    setData(next)
    props.onChange?.(next)
  }

  function startEdit(r: number, c: number, initial?: string) {
    setEditing({ r, c })
    setEditValue(initial ?? data()[r][c])
  }

  function commitEdit() {
    const e = editing()
    if (!e) return
    commitCell(e.r, e.c, editValue())
    setEditing(null)
  }

  function cancelEdit() {
    setEditing(null)
  }

  function moveActive(dr: number, dc: number, extend: boolean) {
    const cur = active()
    const r = Math.min(Math.max(cur.r + dr, 0), props.rows - 1)
    const c = Math.min(Math.max(cur.c + dc, 0), props.cols - 1)
    setActive({ r, c })
    if (!extend) setAnchor({ r, c })
  }

  function selectCell(r: number, c: number, extend: boolean) {
    setActive({ r, c })
    if (!extend) setAnchor({ r, c })
  }

  function copySelection() {
    const b = bounds()
    const tsv = data()
      .slice(b.minR, b.maxR + 1)
      .map((row) => row.slice(b.minC, b.maxC + 1).join('\t'))
      .join('\n')
    void navigator.clipboard.writeText(tsv)
  }

  function pasteAtActive() {
    void navigator.clipboard.readText().then((text) => {
      const lines = text.replace(/\r/g, '').split('\n')
      while (lines.length > 1 && lines[lines.length - 1] === '') lines.pop()
      const grid = lines.map((line) => line.split('\t'))
      const start = active()
      const next = cloneData(data())
      grid.forEach((line, ri) => {
        line.forEach((value, ci) => {
          const r = start.r + ri
          const c = start.c + ci
          if (r < props.rows && c < props.cols) next[r][c] = value
        })
      })
      setData(next)
      props.onChange?.(next)
    })
  }

  function handleKeyDown(ev: KeyboardEvent) {
    if (editing()) {
      if (ev.key === 'Enter') {
        ev.preventDefault()
        commitEdit()
        moveActive(1, 0, false)
        containerRef?.focus()
      } else if (ev.key === 'Escape') {
        ev.preventDefault()
        cancelEdit()
        containerRef?.focus()
      }
      return
    }

    const mod = ev.ctrlKey || ev.metaKey
    if (mod && ev.key.toLowerCase() === 'c') {
      ev.preventDefault()
      copySelection()
      return
    }
    if (mod && ev.key.toLowerCase() === 'v') {
      ev.preventDefault()
      pasteAtActive()
      return
    }

    switch (ev.key) {
      case 'ArrowUp':
        ev.preventDefault()
        moveActive(-1, 0, ev.shiftKey)
        break
      case 'ArrowDown':
        ev.preventDefault()
        moveActive(1, 0, ev.shiftKey)
        break
      case 'ArrowLeft':
        ev.preventDefault()
        moveActive(0, -1, ev.shiftKey)
        break
      case 'ArrowRight':
        ev.preventDefault()
        moveActive(0, 1, ev.shiftKey)
        break
      case 'Tab':
        ev.preventDefault()
        moveActive(0, ev.shiftKey ? -1 : 1, false)
        break
      case 'Enter':
        ev.preventDefault()
        startEdit(active().r, active().c)
        break
      default:
        if (ev.key.length === 1 && !mod && !ev.altKey) {
          startEdit(active().r, active().c, ev.key)
        }
    }
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="grid"
      aria-rowcount={props.rows}
      aria-colcount={props.cols}
      class={cn(
        'inline-block select-none overflow-auto rounded-md border border-border bg-card text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary',
        props.class,
      )}
      onKeyDown={handleKeyDown}
    >
      <div class="grid" style={{ 'grid-template-columns': `48px repeat(${props.cols}, minmax(80px, 1fr))` }}>
        <div class="border-b border-r border-border bg-muted" />
        <For each={headers()}>
          {(h) => (
            <div
              role="columnheader"
              class="border-b border-r border-border bg-muted px-2 py-1 text-center text-xs font-semibold text-muted-foreground"
            >
              {h}
            </div>
          )}
        </For>
        <For each={rowIndices()}>
          {(r) => (
            <>
              <div
                role="rowheader"
                class="border-b border-r border-border bg-muted px-2 py-1 text-center text-xs text-muted-foreground"
              >
                {r + 1}
              </div>
              <For each={colIndices()}>
                {(c) => (
                  <div
                    role="gridcell"
                    aria-selected={isActive(r, c)}
                    class={cn(
                      'relative h-8 border-b border-r border-border px-2 py-1 text-sm cursor-cell',
                      inSelection(r, c) && 'bg-primary/10',
                      isActive(r, c) && 'ring-2 ring-inset ring-primary',
                      isAnchor(r, c) && !isActive(r, c) && 'border-primary',
                    )}
                    onClick={(ev) => selectCell(r, c, ev.shiftKey)}
                    onDblClick={() => startEdit(r, c)}
                  >
                    {isEditing(r, c) ? (
                      <input
                        ref={(el) => {
                          el.focus()
                          el.select()
                        }}
                        class="absolute inset-0 h-full w-full border-none bg-transparent px-2 py-1 text-sm text-foreground outline-none"
                        value={editValue()}
                        onInput={(ev) => setEditValue(ev.currentTarget.value)}
                        onBlur={() => commitEdit()}
                      />
                    ) : (
                      <span class="block truncate">{data()[r][c]}</span>
                    )}
                  </div>
                )}
              </For>
            </>
          )}
        </For>
      </div>
    </div>
  )
}
