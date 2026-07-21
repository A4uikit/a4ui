// Card-shaped step list for onboarding/setup flows. Completion state is
// controlled by the caller (`steps[].done`) but each step also tracks its own
// expanded/collapsed description locally, following the Collapse idiom.
import { Check } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createSignal, For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Button } from './Button'
import { RingProgress } from './RingProgress'

/** A single step in an {@link OnboardingChecklist}. */
export interface OnboardingStep {
  /** Stable identifier, used as the toggle key and `For` item key. */
  id: string
  title: JSX.Element
  /** Optional detail shown when the step is expanded. */
  description?: JSX.Element
  /** Whether the step is complete. */
  done?: boolean
  /** Optional call-to-action rendered alongside the description. */
  action?: { label: string; onClick: () => void }
}

export interface OnboardingChecklistProps {
  steps: OnboardingStep[]
  /** Called with the step id and its next `done` state when the indicator is toggled. */
  onToggle?: (id: string, done: boolean) => void
  /** Heading shown above the progress summary. Defaults to `'Getting started'`. */
  title?: JSX.Element
  class?: string
}

/**
 * Card-shaped onboarding/setup checklist: a header with a completion ring and
 * "{done} of {total} complete" summary, followed by expandable steps. Each
 * step has a clickable check indicator (toggles `done` via `onToggle`), a
 * title, and an optional description + CTA revealed on expand. Completion is
 * controlled by the caller; expansion is local UI state (one step open at a time).
 *
 * @example
 * ```tsx
 * const [steps, setSteps] = createSignal<OnboardingStep[]>([
 *   { id: 'profile', title: 'Complete your profile', done: true },
 *   {
 *     id: 'invite',
 *     title: 'Invite a teammate',
 *     description: 'Collaborate faster by adding at least one teammate.',
 *     action: { label: 'Invite', onClick: () => openInviteDialog() },
 *   },
 * ])
 * <OnboardingChecklist
 *   steps={steps()}
 *   onToggle={(id, done) =>
 *     setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, done } : s)))
 *   }
 * />
 * ```
 */
export function OnboardingChecklist(props: OnboardingChecklistProps): JSX.Element {
  const [expanded, setExpanded] = createSignal<string | null>(null)

  const total = () => props.steps.length
  const done = () => props.steps.filter((step) => step.done).length
  const percent = () => (total() === 0 ? 0 : (done() / total()) * 100)

  const toggleDone = (step: OnboardingStep): void => {
    props.onToggle?.(step.id, !step.done)
  }

  const toggleExpanded = (id: string): void => {
    setExpanded((prev) => (prev === id ? null : id))
  }

  return (
    <div class={cn('rounded-xl border border-border bg-card text-card-foreground', props.class)}>
      <div class="flex items-center gap-4 border-b border-border p-4">
        <RingProgress
          value={percent()}
          size={56}
          thickness={6}
          aria-label={`${done()} of ${total()} steps complete`}
          label={
            <span class="text-xs">
              {done()}/{total()}
            </span>
          }
        />
        <div>
          <p class="font-semibold text-foreground">{props.title ?? 'Getting started'}</p>
          <p class="text-sm text-muted-foreground">
            {done()} of {total()} complete
          </p>
        </div>
      </div>
      <ul role="list" class="divide-y divide-border">
        <For each={props.steps}>
          {(step) => {
            const isExpanded = () => expanded() === step.id
            const hasDetail = () => step.description !== undefined || step.action !== undefined
            return (
              <li class="p-4">
                <div class="flex items-start gap-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={!!step.done}
                    aria-label={step.done ? 'Mark step as not done' : 'Mark step as done'}
                    onClick={() => toggleDone(step)}
                    class={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                      step.done
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-input bg-background text-transparent hover:border-emerald-500/60',
                    )}
                  >
                    <Check class="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    class="min-w-0 flex-1 text-left"
                    aria-expanded={hasDetail() ? isExpanded() : undefined}
                    disabled={!hasDetail()}
                    onClick={() => hasDetail() && toggleExpanded(step.id)}
                  >
                    <span
                      class={cn(
                        'block text-sm font-medium',
                        step.done ? 'text-muted-foreground line-through' : 'text-foreground',
                      )}
                    >
                      {step.title}
                    </span>
                  </button>
                </div>
                <Show when={hasDetail()}>
                  <div
                    class={cn(
                      'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
                      isExpanded() ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                    )}
                  >
                    <div class="overflow-hidden">
                      <div class="mt-2 pl-8 text-sm text-muted-foreground">
                        <Show when={step.description}>{step.description}</Show>
                        <Show when={step.action}>
                          {(action) => (
                            <Button variant="outline" class="mt-2" onClick={() => action().onClick()}>
                              {action().label}
                            </Button>
                          )}
                        </Show>
                      </div>
                    </div>
                  </div>
                </Show>
              </li>
            )
          }}
        </For>
      </ul>
    </div>
  )
}
