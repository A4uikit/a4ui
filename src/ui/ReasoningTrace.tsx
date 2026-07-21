// ReasoningTrace — collapsible "thinking" panel for AI surfaces. Mirrors
// Collapse.tsx's header/panel idiom (grid-rows transition, chevron rotate)
// but owns its own open state (seeded from `defaultOpen`) and adds a
// streaming pulse indicator for in-flight reasoning.
import { Brain, ChevronDown } from 'lucide-solid'
import { type JSX, Show, createSignal } from 'solid-js'

import { cn } from '../lib/cn'

export interface ReasoningTraceProps {
  /** Reasoning body content; takes precedence over `text` when both are given. */
  children?: JSX.Element
  /** Plain-text reasoning body, rendered with preserved whitespace. */
  text?: string
  /** Header label. Defaults to `'Reasoning'`. */
  label?: JSX.Element
  /** Whether the panel starts expanded. Defaults to `false`. */
  defaultOpen?: boolean
  /** Show a pulsing dot in the header to indicate reasoning is still streaming. */
  streaming?: boolean
  class?: string
}

/**
 * Collapsible panel for surfacing a model's intermediate "thinking"/reasoning
 * trace. The header is a toggle button (brain icon + label + rotating
 * chevron, plus a pulsing dot while `streaming`); the body is a muted,
 * smaller-text block showing `text` or `children` with whitespace preserved.
 * Collapsed by default unless `defaultOpen`. Height/opacity transition,
 * instant under reduced motion.
 *
 * @example
 * ```tsx
 * <ReasoningTrace streaming text={reasoningSoFar()} />
 * ```
 */
export function ReasoningTrace(props: ReasoningTraceProps): JSX.Element {
  const [open, setOpen] = createSignal(props.defaultOpen ?? false)

  return (
    <div class={cn('rounded-xl border border-border bg-card', props.class)}>
      <button
        type="button"
        aria-expanded={open()}
        onClick={() => setOpen(!open())}
        class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
      >
        <Brain class="h-4 w-4 shrink-0" aria-hidden="true" />
        <span class="flex-1 text-left">{props.label ?? 'Reasoning'}</span>
        <Show when={props.streaming}>
          <span class="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75 motion-reduce:animate-none" />
            <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
          </span>
        </Show>
        <ChevronDown
          class={cn(
            'h-4 w-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none',
            open() && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>
      <div
        class={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
          open() ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div class="overflow-hidden">
          <div
            class={cn(
              'whitespace-pre-wrap px-3 pb-3 text-xs leading-relaxed text-muted-foreground transition-opacity duration-200 motion-reduce:transition-none',
              open() ? 'opacity-100' : 'opacity-0',
            )}
          >
            {props.children ?? props.text}
          </div>
        </div>
      </div>
    </div>
  )
}
