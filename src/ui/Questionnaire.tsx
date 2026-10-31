// Multi-step, data-driven questionnaire: one question per step.
import type { JSX } from 'solid-js'
import { createEffect, createSignal, createUniqueId, For, on, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Button } from './Button'
import { Progress } from './Progress'
import { Textarea } from './Textarea'

/** A selectable choice of a `single` / `multiple` {@link QuestionnaireQuestion}. */
export interface QuestionnaireOption {
  value: string
  label: string
  description?: string
}

/** One step of a {@link Questionnaire}. */
export interface QuestionnaireQuestion {
  /** Key of the answer in the submitted object. Must be unique. */
  id: string
  title: string
  description?: string
  /** `single` = pick one, `multiple` = pick any, `text` = free text. */
  type: 'single' | 'multiple' | 'text'
  /** Choices; required for `single` and `multiple`. */
  options?: QuestionnaireOption[]
  /** Required questions block "Next" until answered and cannot be skipped. */
  required?: boolean
  /** Placeholder of the `text` field. */
  placeholder?: string
}

/** Answers keyed by question id. Unanswered / skipped questions have no key. */
export type QuestionnaireAnswers = Record<string, string | string[]>

/** Overridable UI strings (i18n). `stepOf` accepts `{current}` and `{total}`. */
export interface QuestionnaireLabels {
  next: string
  previous: string
  skip: string
  submit: string
  required: string
  stepOf: string
  thanks: string
  thanksDescription: string
}

const DEFAULT_LABELS: QuestionnaireLabels = {
  next: 'Next',
  previous: 'Previous',
  skip: 'Skip',
  submit: 'Submit',
  required: 'This question is required.',
  stepOf: '{current} of {total}',
  thanks: 'Thanks!',
  thanksDescription: 'Your answers have been submitted.',
}

export interface QuestionnaireProps {
  questions: QuestionnaireQuestion[]
  /** Called once with the answers when the last step is submitted. */
  onSubmit: (answers: QuestionnaireAnswers) => void
  /** Called with the full answers object after every change. */
  onChange?: (answers: QuestionnaireAnswers) => void
  /** Answers to start from (read once on mount). */
  initialAnswers?: QuestionnaireAnswers
  labels?: Partial<QuestionnaireLabels>
  /** Replaces the default "Thanks" panel shown after submit. */
  summary?: (answers: QuestionnaireAnswers) => JSX.Element
  class?: string
}

function isAnswered(value: string | string[] | undefined): boolean {
  if (value === undefined) return false
  return Array.isArray(value) ? value.length > 0 : value.trim() !== ''
}

/**
 * Multi-step questionnaire / survey, driven by a `questions` array: one question
 * per step with a progress indicator, required validation (inline error linked
 * via `aria-describedby`), Previous / Skip / Next / Submit, and a final panel.
 *
 * Keyboard: digits `1`-`9` pick the matching option on choice steps, `Enter`
 * advances (in the free-text field use `Ctrl`/`Cmd` + `Enter`, since `Enter`
 * inserts a newline there). Focus moves to the step heading on every step change.
 * Step transitions are CSS animations, neutralised under `prefers-reduced-motion`.
 *
 * @example
 * ```tsx
 * <Questionnaire
 *   questions={[
 *     { id: 'role', title: 'Your role?', type: 'single', required: true,
 *       options: [{ value: 'dev', label: 'Developer' }, { value: 'pm', label: 'Manager' }] },
 *     { id: 'notes', title: 'Anything else?', type: 'text' },
 *   ]}
 *   onSubmit={(answers) => save(answers)}
 * />
 * ```
 */
export function Questionnaire(props: QuestionnaireProps): JSX.Element {
  const labels = () => ({ ...DEFAULT_LABELS, ...props.labels })
  const [answers, setAnswers] = createSignal<QuestionnaireAnswers>({ ...props.initialAnswers })
  const [index, setIndex] = createSignal(0)
  const [direction, setDirection] = createSignal<'forward' | 'back'>('forward')
  const [error, setError] = createSignal(false)
  const [submitted, setSubmitted] = createSignal(false)
  const uid = createUniqueId()
  let stepEl: HTMLDivElement | undefined

  const total = () => props.questions.length
  const question = () => props.questions[index()]
  const isLast = () => index() === total() - 1
  const errorId = () => `${uid}-error`
  const current = () => answers()[question().id]

  const setAnswer = (id: string, value: string | string[]) => {
    const next = { ...answers() }
    if (isAnswered(value)) next[id] = value
    else delete next[id]
    setAnswers(next)
    setError(false)
    props.onChange?.(next)
  }

  const selectOption = (q: QuestionnaireQuestion, value: string) => {
    if (q.type === 'single') {
      setAnswer(q.id, value)
      return
    }
    const picked = (answers()[q.id] as string[] | undefined) ?? []
    setAnswer(q.id, picked.includes(value) ? picked.filter((v) => v !== value) : [...picked, value])
  }

  const go = (to: number, dir: 'forward' | 'back') => {
    setDirection(dir)
    setError(false)
    setIndex(to)
  }

  const next = () => {
    if (question().required && !isAnswered(current())) {
      setError(true)
      queueMicrotask(() => stepEl?.querySelector<HTMLElement>('input, textarea')?.focus())
      return
    }
    if (isLast()) {
      setSubmitted(true)
      props.onSubmit(answers())
    } else go(index() + 1, 'forward')
  }
  const previous = () => {
    if (index() > 0) go(index() - 1, 'back')
  }
  const skip = () => {
    if (!question().required && !isLast()) go(index() + 1, 'forward')
  }

  // Announce the new step by moving focus to its heading (not on first render).
  createEffect(
    on(
      index,
      () => queueMicrotask(() => stepEl?.querySelector<HTMLElement>('[data-questionnaire-heading]')?.focus()),
      { defer: true },
    ),
  )

  const onKeyDown = (ev: KeyboardEvent) => {
    if (ev.altKey || submitted()) return
    const target = ev.target as HTMLElement
    const typing =
      target instanceof HTMLTextAreaElement || (target instanceof HTMLInputElement && target.type === 'text')
    const q = question()
    if (/^[1-9]$/.test(ev.key) && !ev.ctrlKey && !ev.metaKey && !typing && q.type !== 'text') {
      const option = q.options?.[Number(ev.key) - 1]
      if (!option) return
      ev.preventDefault()
      selectOption(q, option.value)
    } else if (ev.key === 'Enter' && !(target instanceof HTMLButtonElement)) {
      if (target instanceof HTMLTextAreaElement && !ev.ctrlKey && !ev.metaKey) return
      ev.preventDefault()
      next()
    }
  }

  return (
    <div class={cn('card flex w-full max-w-xl flex-col gap-5 p-5', props.class)} onKeyDown={onKeyDown}>
      <Show
        when={!submitted()}
        fallback={
          <div data-testid="questionnaire-done" class="flex flex-col gap-2">
            <Show
              when={props.summary}
              fallback={
                <>
                  <h2
                    ref={(el) => queueMicrotask(() => el.focus())}
                    tabindex="-1"
                    class="text-lg font-semibold text-foreground outline-none"
                  >
                    {labels().thanks}
                  </h2>
                  <p class="text-sm text-muted-foreground">{labels().thanksDescription}</p>
                </>
              }
            >
              {(summary) => summary()(answers())}
            </Show>
          </div>
        }
      >
        <Progress
          value={index() + 1}
          max={total()}
          label={labels()
            .stepOf.replace('{current}', String(index() + 1))
            .replace('{total}', String(total()))}
        />
        <div ref={stepEl}>
          <Show when={question()} keyed>
            {(q) => (
              <div
                class={cn(
                  'flex flex-col gap-4',
                  direction() === 'forward'
                    ? 'animate-[questionnaire-step-in_0.25s_ease-out]'
                    : 'animate-[questionnaire-step-in-back_0.25s_ease-out]',
                )}
              >
                <div class="flex flex-col gap-1">
                  <h2
                    tabindex="-1"
                    data-questionnaire-heading
                    class="text-lg font-semibold text-foreground outline-none"
                  >
                    {q.title}
                    <Show when={q.required}>
                      <span aria-hidden="true" class="text-destructive">
                        {' *'}
                      </span>
                    </Show>
                  </h2>
                  <Show when={q.description}>
                    <p class="text-sm text-muted-foreground">{q.description}</p>
                  </Show>
                </div>

                <Show
                  when={q.type === 'text'}
                  fallback={
                    <fieldset class="flex flex-col gap-2" aria-describedby={error() ? errorId() : undefined}>
                      <legend class="sr-only">{q.title}</legend>
                      <For each={q.options}>
                        {(option, i) => {
                          const checked = () => {
                            const a = answers()[q.id]
                            return Array.isArray(a) ? a.includes(option.value) : a === option.value
                          }
                          return (
                            <label
                              class={cn(
                                'flex cursor-pointer items-start gap-3 rounded-md border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                                checked() && 'border-primary bg-primary/10',
                              )}
                            >
                              <input
                                type={q.type === 'single' ? 'radio' : 'checkbox'}
                                name={`${uid}-${q.id}`}
                                value={option.value}
                                checked={checked()}
                                aria-invalid={error() || undefined}
                                class="mt-0.5 h-4 w-4 accent-primary"
                                onChange={() => selectOption(q, option.value)}
                              />
                              <span class="flex flex-1 flex-col">
                                <span class="font-medium">{option.label}</span>
                                <Show when={option.description}>
                                  <span class="text-muted-foreground">{option.description}</span>
                                </Show>
                              </span>
                              <Show when={i() < 9}>
                                <kbd
                                  aria-hidden="true"
                                  class="rounded border border-border px-1.5 text-xs text-muted-foreground"
                                >
                                  {i() + 1}
                                </kbd>
                              </Show>
                            </label>
                          )
                        }}
                      </For>
                    </fieldset>
                  }
                >
                  <Textarea
                    value={(current() as string | undefined) ?? ''}
                    onInput={(v) => setAnswer(q.id, v)}
                    aria-label={q.title}
                    placeholder={q.placeholder}
                    aria-invalid={error() || undefined}
                    aria-describedby={error() ? errorId() : undefined}
                  />
                </Show>

                <Show when={error()}>
                  <p id={errorId()} role="alert" class="text-sm text-destructive">
                    {labels().required}
                  </p>
                </Show>
              </div>
            )}
          </Show>
        </div>

        <div class="flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={previous} disabled={index() === 0}>
            {labels().previous}
          </Button>
          <div class="flex items-center gap-2">
            <Show when={!question().required && !isLast()}>
              <Button variant="outline" onClick={skip}>
                {labels().skip}
              </Button>
            </Show>
            <Button onClick={next}>{isLast() ? labels().submit : labels().next}</Button>
          </div>
        </div>
      </Show>
    </div>
  )
}
