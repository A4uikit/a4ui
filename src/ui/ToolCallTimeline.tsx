// ToolCallTimeline — vertical timeline (à la Timeline.tsx's connector line +
// dot idiom) where each node is an AI tool call, with a Collapse-style
// details panel for args/result.
import { Check, Loader2, X } from 'lucide-solid'
import { type JSX, For, Show, createSignal } from 'solid-js'

import { cn } from '../lib/cn'

/** Status of a single tool call rendered by {@link ToolCallTimeline}. */
export type ToolCallStatus = 'pending' | 'success' | 'error'

/** A single tool invocation rendered by {@link ToolCallTimeline}. */
export interface ToolCall {
  /** Tool/function name, rendered in mono. */
  name: string
  status: ToolCallStatus
  /** Arguments passed to the call. Shown in a collapsible details area when present. */
  args?: JSX.Element | string
  /** Result returned by the call. Shown in a collapsible details area when present. */
  result?: JSX.Element | string
}

export interface ToolCallTimelineProps {
  calls: ToolCall[]
  class?: string
}

/**
 * Vertical timeline of AI tool calls: a connector line runs down the left with
 * a status node per call (spinner while `pending`, check when `success`, x when
 * `error`), the tool name in mono, and — when `args`/`result` are given — a
 * collapsible details panel underneath.
 *
 * @example
 * ```tsx
 * <ToolCallTimeline
 *   calls={[
 *     { name: 'search_docs', status: 'success', args: 'query: "refunds"', result: '3 matches' },
 *     { name: 'update_ticket', status: 'pending' },
 *   ]}
 * />
 * ```
 */
export function ToolCallTimeline(props: ToolCallTimelineProps): JSX.Element {
  return (
    <ol class={cn('relative flex flex-col gap-4', props.class)}>
      <For each={props.calls}>
        {(call, index) => (
          <li class="relative flex gap-3 pl-1">
            <Show when={index() < props.calls.length - 1}>
              <span
                aria-hidden="true"
                class="absolute left-[calc(0.5rem+2px)] top-6 -bottom-4 w-px -translate-x-1/2 bg-border"
              />
            </Show>
            <StatusNode status={call.status} />
            <div class="min-w-0 flex-1 pb-0.5">
              <p class="pt-0.5 font-mono text-sm text-foreground">{call.name}</p>
              <Show when={call.args !== undefined || call.result !== undefined}>
                <ToolCallDetails args={call.args} result={call.result} />
              </Show>
            </div>
          </li>
        )}
      </For>
    </ol>
  )
}

const STATUS_TONE: Record<ToolCallStatus, string> = {
  pending: 'border-border bg-muted text-muted-foreground',
  success: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-500',
  error: 'border-destructive/30 bg-destructive/15 text-destructive',
}

function StatusNode(props: { status: ToolCallStatus }): JSX.Element {
  return (
    <span
      aria-hidden="true"
      class={cn(
        'relative z-[1] mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
        STATUS_TONE[props.status],
      )}
    >
      <Show when={props.status === 'pending'}>
        <Loader2 class="h-3 w-3 animate-spin motion-reduce:animate-none" />
      </Show>
      <Show when={props.status === 'success'}>
        <Check class="h-3 w-3" />
      </Show>
      <Show when={props.status === 'error'}>
        <X class="h-3 w-3" />
      </Show>
    </span>
  )
}

// Reuses Collapse.tsx's grid-rows transition idiom for the args/result panel.
function ToolCallDetails(props: { args?: JSX.Element | string; result?: JSX.Element | string }): JSX.Element {
  const [open, setOpen] = createSignal(false)

  return (
    <div class="mt-1">
      <button
        type="button"
        aria-expanded={open()}
        onClick={() => setOpen(!open())}
        class="text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        {open() ? 'Hide details' : 'Show details'}
      </button>
      <div
        class={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
          open() ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div class="overflow-hidden">
          <div class="mt-1.5 space-y-1.5 rounded-lg border border-border bg-muted/40 p-2 text-xs text-muted-foreground">
            <Show when={props.args !== undefined}>
              <div>
                <p class="font-medium text-foreground/80">Args</p>
                <p class="whitespace-pre-wrap font-mono">{props.args}</p>
              </div>
            </Show>
            <Show when={props.result !== undefined}>
              <div>
                <p class="font-medium text-foreground/80">Result</p>
                <p class="whitespace-pre-wrap font-mono">{props.result}</p>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </div>
  )
}
