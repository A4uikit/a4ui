// StatusTracker — a status-page style history bar built from plain flex
// `div`s (no SVG, no charting library). Each segment is a thin rounded bar
// colored by its status, with a native tooltip carrying the label. `ok`/
// `degraded` reuse the same success/warning tones as `Alert`/`Badge`
// (`emerald-500`/`amber-500` — the repo has no dedicated CSS token for
// them); `down` uses the `--destructive` semantic token.
import { For, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

export interface StatusSegment {
  status: 'ok' | 'degraded' | 'down'
  label?: string
}

export interface StatusTrackerProps {
  segments: StatusSegment[]
  class?: string
}

const STATUS_CLASSES: Record<StatusSegment['status'], string> = {
  ok: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  down: 'bg-destructive',
}

const STATUS_LABEL: Record<StatusSegment['status'], string> = {
  ok: 'Operational',
  degraded: 'Degraded',
  down: 'Down',
}

/** Share of `segments` that are `'ok'`, formatted as e.g. `"98.7% uptime"`; `undefined` when empty. */
function uptimeSummary(segments: StatusSegment[]): string | undefined {
  if (segments.length === 0) return undefined
  const ok = segments.filter((s) => s.status === 'ok').length
  return `${((ok / segments.length) * 100).toFixed(1)}% uptime`
}

/**
 * Status-page style history bar: a row of thin rounded segments colored by
 * `status` (ok/degraded/down), each with a native hover tooltip showing its
 * label and status, plus a summary uptime line above.
 *
 * @example
 * ```tsx
 * <StatusTracker
 *   segments={[
 *     { status: 'ok', label: 'Jul 1' },
 *     { status: 'degraded', label: 'Jul 2' },
 *     { status: 'ok', label: 'Jul 3' },
 *     { status: 'down', label: 'Jul 4' },
 *   ]}
 * />
 * ```
 */
export function StatusTracker(props: StatusTrackerProps): JSX.Element {
  const summary = () => uptimeSummary(props.segments)

  return (
    <div class={cn('flex w-full flex-col gap-1.5', props.class)}>
      <Show when={summary()}>
        <span class="text-xs text-muted-foreground">{summary()}</span>
      </Show>
      <div class="flex w-full items-stretch gap-1">
        <For each={props.segments}>
          {(segment) => (
            <div
              title={
                segment.label
                  ? `${segment.label}: ${STATUS_LABEL[segment.status]}`
                  : STATUS_LABEL[segment.status]
              }
              class={cn('h-6 flex-1 rounded-sm transition-colors', STATUS_CLASSES[segment.status])}
            />
          )}
        </For>
      </div>
    </div>
  )
}
