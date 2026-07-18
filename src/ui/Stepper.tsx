// Multi-step progress indicator: a row (or column) of numbered indicators
// connected by lines, tracking completed / active / upcoming states. Purely
// presentational and theme-agnostic — all colors come from semantic tokens.
import { Check } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { cn } from '../lib/cn'

/** A single step rendered by {@link Stepper}. */
export interface StepItem {
  /** Text shown beside the step indicator. */
  label: string
  /** Optional secondary line shown under the label. */
  description?: string
}

export interface StepperProps {
  /** Ordered list of steps to display. */
  steps: StepItem[]
  /** Index of the currently active step; steps before it are completed. */
  active: number
  /** When provided, indicators become clickable buttons reporting their index. */
  onStepClick?: (index: number) => void
  /** Layout direction. Defaults to `'horizontal'`. */
  orientation?: 'horizontal' | 'vertical'
  class?: string
}

/**
 * Multi-step progress indicator. Steps before `active` render as completed
 * (with a check), the `active` step is highlighted with a ring, and later
 * steps are dimmed. Pass `onStepClick` to let users jump between steps.
 *
 * @example
 * ```tsx
 * <Stepper
 *   active={1}
 *   steps={[
 *     { label: 'Account', description: 'Your details' },
 *     { label: 'Shipping' },
 *     { label: 'Payment' },
 *   ]}
 *   onStepClick={setActive}
 * />
 * ```
 */
export function Stepper(props: StepperProps): JSX.Element {
  const orientation = () => props.orientation ?? 'horizontal'

  return (
    <ol
      aria-label="Progress"
      class={cn('flex', orientation() === 'vertical' ? 'flex-col' : 'items-start', props.class)}
    >
      <For each={props.steps}>
        {(step, index) => {
          const isCompleted = () => index() < props.active
          const isActive = () => index() === props.active
          const isFirst = () => index() === 0
          const isVertical = () => orientation() === 'vertical'
          // The connector sits before this step and is "filled" when we've
          // reached (or passed) it — i.e. for completed and active steps.
          const connectorFilled = () => index() <= props.active

          const indicatorContent = () => (
            <Show when={isCompleted()} fallback={<span>{index() + 1}</span>}>
              <Check class="h-4 w-4" aria-hidden="true" />
            </Show>
          )

          const indicatorClass = () =>
            cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors',
              isCompleted() || isActive()
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
              isActive() && 'ring-2 ring-primary/40',
            )

          return (
            <li
              aria-current={isActive() ? 'step' : undefined}
              class={cn('flex', isVertical() ? 'flex-col' : 'flex-1 items-start last:flex-none')}
            >
              <div class={cn('flex', isVertical() ? 'flex-row' : 'w-full items-center')}>
                {/* Connector line before this step (skipped for the first). */}
                <Show when={!isFirst()}>
                  <span
                    aria-hidden="true"
                    class={cn(
                      connectorFilled() ? 'bg-primary' : 'bg-border',
                      isVertical() ? 'ml-4 -mt-1 mb-1 w-0.5 flex-1' : 'mx-2 h-0.5 flex-1',
                    )}
                  />
                </Show>

                <div class={cn('flex gap-3', isVertical() ? 'items-start' : 'flex-col items-center')}>
                  <Show
                    when={props.onStepClick}
                    fallback={<div class={indicatorClass()}>{indicatorContent()}</div>}
                  >
                    <button
                      type="button"
                      aria-label={step.label}
                      class={indicatorClass()}
                      onClick={() => props.onStepClick?.(index())}
                    >
                      {indicatorContent()}
                    </button>
                  </Show>

                  <div class={cn(isVertical() ? 'pt-1' : 'text-center')}>
                    <p
                      class={cn(
                        'text-sm font-medium',
                        isActive() || isCompleted() ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {step.label}
                    </p>
                    <Show when={step.description}>
                      <p class="text-xs text-muted-foreground">{step.description}</p>
                    </Show>
                  </div>
                </div>
              </div>
            </li>
          )
        }}
      </For>
    </ol>
  )
}
