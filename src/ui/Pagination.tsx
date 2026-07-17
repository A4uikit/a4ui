// Prev/next pager with a "Page X of Y" label and an optional left-aligned
// summary slot (e.g. "1,234 registros · 1–50"). Client-side; the parent owns
// the page signal and slices its own data.
import { ChevronLeft, ChevronRight } from 'lucide-solid'
import type { JSX } from 'solid-js'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  summary?: JSX.Element
  labels?: {
    previous?: string
    next?: string
    page?: (page: number, total: number) => string
  }
}

export function Pagination(props: PaginationProps): JSX.Element {
  return (
    <div class="flex flex-col gap-3 border-t border-border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="text-[12px] text-muted-foreground">{props.summary}</div>
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-lg border border-input transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          disabled={props.page <= 1}
          aria-label={props.labels?.previous ?? 'Previous page'}
          onClick={() => props.onChange(props.page - 1)}
        >
          <ChevronLeft class="h-4 w-4" />
        </button>
        <span class="px-2 font-mono text-[12px] tabular-nums">
          {(props.labels?.page ?? ((p, t) => `Page ${p} of ${t}`))(props.page, props.totalPages)}
        </span>
        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-lg border border-input transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          disabled={props.page >= props.totalPages}
          aria-label={props.labels?.next ?? 'Next page'}
          onClick={() => props.onChange(props.page + 1)}
        >
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
