// Read-only unified-diff / line-diff renderer. Reuses the CodeTabs monospace
// idiom (rounded border, bg-card, font-mono text-sm) and the Alert/Badge tone
// tokens: `emerald` for added (their `success` tone) and the `destructive`
// CSS-var token for removed. No syntax highlighting.
import { type JSX, Show } from 'solid-js'
import { createMemo, For } from 'solid-js'

import { cn } from '../lib/cn'

/** A single rendered row of a diff. */
export interface DiffLine {
  type: 'add' | 'remove' | 'context'
  content: string
  /** Line number in the old file. Present for `'remove'` and `'context'` rows. */
  oldNum?: number
  /** Line number in the new file. Present for `'add'` and `'context'` rows. */
  newNum?: number
}

export interface DiffViewerProps {
  /** Unified diff text (as produced by `git diff`/`diff -u`). Ignored if `lines` is set. */
  diff?: string
  /** Pre-parsed diff rows. Takes precedence over `diff`. */
  lines?: DiffLine[]
  /** Header label. If omitted, inferred from the `+++`/`---` headers of `diff`, when present. */
  filename?: string
  class?: string
}

const MARKER: Record<DiffLine['type'], string> = { add: '+', remove: '-', context: ' ' }

const ROW_BG: Record<DiffLine['type'], string> = {
  add: 'bg-emerald-500/10',
  remove: 'bg-destructive/10',
  context: '',
}

const MARKER_TONE: Record<DiffLine['type'], string> = {
  add: 'text-emerald-500',
  remove: 'text-destructive',
  context: 'text-muted-foreground',
}

const CONTENT_TONE: Record<DiffLine['type'], string> = {
  add: 'text-foreground',
  remove: 'text-foreground',
  context: 'text-muted-foreground',
}

const HUNK_HEADER = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/

/** Parses a unified diff string into rows plus an optional inferred filename. */
function parseUnifiedDiff(diff: string): { lines: DiffLine[]; filename?: string } {
  const rawLines = diff.split('\n')
  // Drop the trailing empty element produced when `diff` ends with a newline.
  if (rawLines.length > 0 && rawLines[rawLines.length - 1] === '') rawLines.pop()

  const lines: DiffLine[] = []
  let filename: string | undefined
  let oldNum = 0
  let newNum = 0

  for (const raw of rawLines) {
    if (raw.startsWith('+++ ') || raw.startsWith('--- ')) {
      const path = raw.slice(4).trim()
      if (raw.startsWith('+++ ') && path !== '/dev/null') filename = path.replace(/^[ab]\//, '')
      continue
    }
    const hunkMatch = HUNK_HEADER.exec(raw)
    if (hunkMatch) {
      oldNum = Number(hunkMatch[1])
      newNum = Number(hunkMatch[2])
      continue
    }
    if (raw.startsWith('\\')) continue // "\ No newline at end of file"

    if (raw.startsWith('+')) {
      lines.push({ type: 'add', content: raw.slice(1), newNum: newNum++ })
    } else if (raw.startsWith('-')) {
      lines.push({ type: 'remove', content: raw.slice(1), oldNum: oldNum++ })
    } else {
      lines.push({
        type: 'context',
        content: raw.startsWith(' ') ? raw.slice(1) : raw,
        oldNum: oldNum++,
        newNum: newNum++,
      })
    }
  }

  return { lines, filename }
}

/**
 * Read-only diff block: renders added/removed/context lines with a line-number
 * gutter and a +/-/space marker. Accepts either a raw unified-diff string
 * (parsed internally) or pre-parsed {@link DiffLine} rows.
 *
 * @example
 * ```tsx
 * <DiffViewer
 *   filename="src/lib/cn.ts"
 *   diff={`@@ -1,3 +1,3 @@\n-export const cn = (a) => a\n+export const cn = (a, b) => a + b\n context line`}
 * />
 * ```
 */
export function DiffViewer(props: DiffViewerProps): JSX.Element {
  const parsed = createMemo(() =>
    props.lines ? { lines: props.lines, filename: undefined } : parseUnifiedDiff(props.diff ?? ''),
  )

  const rows = () => parsed().lines
  const displayFilename = () => props.filename ?? parsed().filename

  const counts = createMemo(() => {
    let added = 0
    let removed = 0
    for (const line of rows()) {
      if (line.type === 'add') added++
      else if (line.type === 'remove') removed++
    }
    return { added, removed }
  })

  const ariaLabel = () => {
    const { added, removed } = counts()
    const name = displayFilename()
    return `Diff${name ? ` for ${name}` : ''}: ${added} added, ${removed} removed`
  }

  return (
    <div
      role="figure"
      aria-label={ariaLabel()}
      class={cn('overflow-hidden rounded-lg border border-border bg-card', props.class)}
    >
      <Show when={displayFilename()}>
        <div class="border-b border-border px-4 py-2 text-sm font-medium text-foreground">
          {displayFilename()}
        </div>
      </Show>
      <div class="overflow-x-auto">
        <div class="min-w-max font-mono text-sm">
          <For each={rows()}>
            {(line) => (
              <div class={cn('flex', ROW_BG[line.type])}>
                <span class="w-12 shrink-0 select-none py-0.5 pr-2 text-right tabular-nums text-xs text-muted-foreground">
                  {line.oldNum ?? ''}
                </span>
                <span class="w-12 shrink-0 select-none py-0.5 pr-2 text-right tabular-nums text-xs text-muted-foreground">
                  {line.newNum ?? ''}
                </span>
                <span class={cn('w-5 shrink-0 select-none py-0.5 text-center', MARKER_TONE[line.type])}>
                  {MARKER[line.type]}
                </span>
                <span class={cn('flex-1 whitespace-pre py-0.5 pr-4', CONTENT_TONE[line.type])}>
                  {line.content}
                </span>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}
