// Controlled tag editor: the tag array is owned by the parent (value/onChange);
// only the in-progress input text is local state. Enter/comma commit a tag,
// Backspace on an empty input pops the last one — same keyboard idiom users
// expect from chip inputs elsewhere.
import type { JSX } from 'solid-js'
import { For, createSignal } from 'solid-js'
import { X } from 'lucide-solid'

import { cn } from '../lib/cn'

export interface TagInputProps {
  /** Current tags (controlled). */
  value: string[]
  /** Called with the next tag array whenever tags are added or removed. */
  onChange: (tags: string[]) => void
  placeholder?: string
  class?: string
}

/**
 * Bordered field that turns free text into removable chips. Press Enter or comma
 * to add the trimmed input as a tag (empty and duplicate values are ignored),
 * click a chip's `×` to remove it, or press Backspace on an empty input to drop
 * the last tag. Theme-agnostic — colors come from semantic tokens.
 *
 * @example
 * ```tsx
 * const [tags, setTags] = createSignal<string[]>(['solid', 'ui'])
 * <TagInput value={tags()} onChange={setTags} placeholder="Add tag…" />
 * ```
 */
export function TagInput(props: TagInputProps): JSX.Element {
  const [text, setText] = createSignal('')

  const addTag = () => {
    const tag = text().trim()
    if (tag && !props.value.includes(tag)) props.onChange([...props.value, tag])
    setText('')
  }

  const removeTag = (tag: string) => {
    props.onChange(props.value.filter((t) => t !== tag))
  }

  const onKeyDown = (ev: KeyboardEvent) => {
    if (ev.key === 'Enter' || ev.key === ',') {
      ev.preventDefault()
      addTag()
    } else if (ev.key === 'Backspace' && text() === '' && props.value.length > 0) {
      removeTag(props.value[props.value.length - 1])
    }
  }

  return (
    <div
      class={cn(
        'flex flex-wrap items-center gap-1 rounded-md border border-input bg-background px-2 py-1.5',
        props.class,
      )}
    >
      <For each={props.value}>
        {(tag) => (
          <span class="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs text-foreground">
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => removeTag(tag)}
              class="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <X class="size-3" />
            </button>
          </span>
        )}
      </For>
      <input
        class="flex-1 border-0 bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        value={text()}
        placeholder={props.placeholder}
        onInput={(ev) => setText(ev.currentTarget.value)}
        onKeyDown={onKeyDown}
      />
    </div>
  )
}
