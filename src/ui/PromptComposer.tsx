// The input area for a chat/AI UI: an auto-growing textarea in a glass card,
// removable attachment chips, and a bottom bar with an optional attach button
// and a Send button. Submits on Cmd/Ctrl+Enter or the Send click.
import { Paperclip, SendHorizontal, X } from 'lucide-solid'
import { createEffect, For, type JSX, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Button } from './Button'

export interface PromptComposerProps {
  value: string
  onInput: (value: string) => void
  onSubmit: (value: string) => void
  placeholder?: string
  disabled?: boolean
  /** Small helper text under the field, e.g. model name or a character count. */
  hint?: JSX.Element
  /** Attachment labels/filenames shown as removable chips above the input. */
  attachments?: string[]
  onRemoveAttachment?: (index: number) => void
  /** When set, shows a paperclip button that calls this on click. */
  onAttach?: () => void
  class?: string
}

/**
 * The input area for a chat/AI UI: an auto-growing textarea inside a glass
 * card, removable attachment chips, and a bottom bar with an optional attach
 * button and a Send button. Fully controlled — the parent owns `value`.
 * Submits on **Cmd/Ctrl+Enter** or the Send button click.
 *
 * @example
 * ```tsx
 * const [value, setValue] = createSignal('')
 * <PromptComposer
 *   value={value()}
 *   onInput={setValue}
 *   onSubmit={(v) => { sendMessage(v); setValue('') }}
 *   placeholder="Ask anything…"
 * />
 * ```
 */
export function PromptComposer(props: PromptComposerProps): JSX.Element {
  let textareaRef: HTMLTextAreaElement | undefined

  // Auto-grow: reset height then snap to scrollHeight, capped by max-h via CSS.
  createEffect(() => {
    void props.value
    if (!textareaRef) return
    textareaRef.style.height = 'auto'
    textareaRef.style.height = `${textareaRef.scrollHeight}px`
  })

  const canSubmit = (): boolean => !props.disabled && props.value.trim().length > 0

  const submit = (): void => {
    if (!canSubmit()) return
    props.onSubmit(props.value)
  }

  const handleKeyDown = (event: KeyboardEvent): void => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      submit()
    }
  }

  return (
    <div
      class={cn(
        'card w-full rounded-2xl border border-border bg-card p-3 text-card-foreground shadow-lg',
        props.class,
      )}
    >
      <Show when={(props.attachments?.length ?? 0) > 0}>
        <div class="mb-2 flex flex-wrap gap-1.5">
          <For each={props.attachments}>
            {(label, i) => (
              <span class="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground ring-1 ring-inset ring-border">
                <span class="max-w-[12rem] truncate">{label}</span>
                <button
                  type="button"
                  aria-label={`Remove attachment ${label}`}
                  onClick={() => props.onRemoveAttachment?.(i())}
                  class="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                >
                  <X class="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
            )}
          </For>
        </div>
      </Show>

      <textarea
        ref={textareaRef}
        aria-label="Message"
        value={props.value}
        placeholder={props.placeholder ?? 'Send a message…'}
        disabled={props.disabled}
        rows={1}
        onInput={(ev) => props.onInput(ev.currentTarget.value)}
        onKeyDown={handleKeyDown}
        class="a4-field max-h-64 min-h-[24px] w-full resize-none border-0 bg-transparent p-0 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
      />

      <Show when={props.hint}>
        <p class="mt-1 text-xs text-muted-foreground">{props.hint}</p>
      </Show>

      <div class="mt-2 flex items-center justify-between gap-2">
        <Show when={props.onAttach} fallback={<span />}>
          <Button
            type="button"
            variant="ghost"
            aria-label="Attach file"
            disabled={props.disabled}
            onClick={() => props.onAttach?.()}
            class="px-2"
          >
            <Paperclip class="h-4 w-4" aria-hidden="true" />
          </Button>
        </Show>

        <Button
          type="button"
          variant="primary"
          aria-label="Send message"
          disabled={!canSubmit()}
          onClick={submit}
          class="px-2"
        >
          <SendHorizontal class="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
