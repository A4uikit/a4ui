// BlockEditor — block-primitives shell for a Notion-style editor: a
// reorderable, deletable stack of blocks plus a slash-style "add block" menu.
// It does not know how to render or edit block content (that's the caller's
// job via `EditorBlock.content`) — it only owns ordering, removal, and
// insertion UI. Built entirely from existing primitives: Sortable (drag
// handle + reorder) and SlashMenu (filterable insert picker).
import { createSignal, Show, type JSX } from 'solid-js'
import { Plus, Trash2 } from 'lucide-solid'

import { cn } from '../lib/cn'
import { Button } from './Button'
import { Sortable } from './Sortable'
import { SlashMenu } from './SlashMenu'

/** A single block in a {@link BlockEditor}. Content is supplied by the caller. */
export interface EditorBlock {
  id: string
  type: string
  content: JSX.Element
}

/** An option offered by the "add block" menu. */
export interface BlockTypeOption {
  value: string
  label: string
  description?: string
  icon?: JSX.Element
}

export interface BlockEditorProps {
  blocks: EditorBlock[]
  /** Called on reorder and on delete, with the new array. */
  onChange: (blocks: EditorBlock[]) => void
  /** Block types offered by the "add" menu. */
  blockTypes?: BlockTypeOption[]
  /** Called when the user picks a type from the add menu; the caller creates + inserts the block. */
  onAddBlock?: (type: string) => void
  class?: string
}

/**
 * Reorderable, deletable stack of content blocks with a slash-style insert
 * menu — the block-primitives layer of a Notion-style editor, not a
 * rich-text engine. Reordering and the drag handle come from {@link Sortable};
 * the "add block" picker reuses {@link SlashMenu} filtered by a local search
 * input.
 *
 * @example
 * ```tsx
 * <BlockEditor
 *   blocks={blocks()}
 *   onChange={setBlocks}
 *   blockTypes={[{ value: 'text', label: 'Text' }]}
 *   onAddBlock={(type) => setBlocks([...blocks(), { id: crypto.randomUUID(), type, content: <p>New</p> }])}
 * />
 * ```
 */
export function BlockEditor(props: BlockEditorProps): JSX.Element {
  const [menuOpen, setMenuOpen] = createSignal(false)
  const [query, setQuery] = createSignal('')

  const closeMenu = () => {
    setMenuOpen(false)
    setQuery('')
  }

  const handleDelete = (id: string) => {
    props.onChange(props.blocks.filter((block) => block.id !== id))
  }

  const handleSelect = (type: string) => {
    props.onAddBlock?.(type)
    closeMenu()
  }

  return (
    <div class={cn('flex flex-col gap-3', props.class)}>
      <Show
        when={props.blocks.length}
        fallback={
          <div class="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No blocks yet
          </div>
        }
      >
        <Sortable
          items={props.blocks}
          itemKey={(block) => block.id}
          onReorder={(items) => props.onChange(items)}
        >
          {(block) => (
            <div class="group/block flex w-full items-center justify-between gap-2">
              <div class="min-w-0 flex-1">{block.content}</div>
              <button
                type="button"
                onClick={() => handleDelete(block.id)}
                class="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring group-hover/block:opacity-100"
                aria-label="Delete block"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          )}
        </Sortable>
      </Show>

      <div
        onKeyDown={(e) => {
          if (e.key === 'Escape') closeMenu()
        }}
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen()}
        >
          <Plus class="mr-1 h-4 w-4" />
          Add block
        </Button>

        <Show when={menuOpen()}>
          <div class="mt-2 flex flex-col gap-2">
            <input
              type="text"
              autofocus
              value={query()}
              onInput={(e) => setQuery(e.currentTarget.value)}
              placeholder="Search block types..."
              class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Filter block types"
            />
            <SlashMenu items={props.blockTypes ?? []} query={query()} onSelect={handleSelect} />
          </div>
        </Show>
      </div>
    </div>
  )
}
