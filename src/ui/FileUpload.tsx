// Advanced file uploader: a drop zone plus a list of files with per-file
// progress, error/retry, preview thumbnail, and remove. Purely presentational
// and controlled — the consumer owns `files` and the actual upload; this
// component only emits `onAdd`/`onRemove`/`onRetry` events.
import { Check, File as FileIcon, X } from 'lucide-solid'
import { For, type JSX, Show, createSignal } from 'solid-js'

import { cn } from '../lib/cn'
import { Button } from './Button'
import { Progress } from './Progress'

/** A single file entry rendered by {@link FileUpload}. The consumer owns this state. */
export interface UploadFile {
  id: string
  name: string
  /** File size in bytes. */
  size: number
  /** Upload progress, 0-100. */
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  /** Optional preview/thumbnail URL (e.g. an object URL for an image). */
  url?: string
  /** Error message when `status === 'error'`. */
  error?: string
}

export interface FileUploadProps {
  files: UploadFile[]
  /** Called with the newly chosen File[] (from drop or the file dialog). */
  onAdd: (files: File[]) => void
  onRemove?: (id: string) => void
  onRetry?: (id: string) => void
  /** `accept` attribute for the hidden input, e.g. ".png,.jpg,application/pdf". */
  accept?: string
  /** Allow choosing/dropping more than one file at a time. Default: `true`. */
  multiple?: boolean
  /** Helper text shown inside the drop zone. */
  hint?: string
  disabled?: boolean
  class?: string
}

/** Format a byte count as a short human-readable string, e.g. `1.4 MB`. */
function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '0 B'
  if (n < 1024) return `${n} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = n / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(1)} ${units[unit]}`
}

/**
 * Advanced, controlled file uploader: a click-or-drag drop zone plus a list of
 * files showing per-file progress, error/retry, a preview thumbnail, and a
 * remove action. This component owns no file state — the consumer supplies
 * `files` and performs the actual upload, updating `files` as progress comes in.
 *
 * @example
 * ```tsx
 * const [files, setFiles] = createSignal<UploadFile[]>([])
 *
 * <FileUpload
 *   files={files()}
 *   accept="image/*"
 *   onAdd={(added) => {
 *     const entries = added.map((f) => ({ id: crypto.randomUUID(), name: f.name, size: f.size, progress: 0, status: 'pending' as const }))
 *     setFiles((prev) => [...prev, ...entries])
 *     entries.forEach((entry, i) => upload(added[i], entry.id, setFiles))
 *   }}
 *   onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
 *   onRetry={(id) => retryUpload(id, setFiles)}
 * />
 * ```
 */
export function FileUpload(props: FileUploadProps): JSX.Element {
  const [dragOver, setDragOver] = createSignal(false)
  let input: HTMLInputElement | undefined

  const emit = (list: FileList | null | undefined) => {
    if (props.disabled || !list) return
    const files = Array.from(list)
    if (files.length) props.onAdd(files)
  }

  return (
    <div class={cn('flex flex-col gap-4', props.class)}>
      <button
        type="button"
        disabled={props.disabled}
        onClick={() => !props.disabled && input?.click()}
        onDragOver={(e) => {
          if (props.disabled) return
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setDragOver(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          emit(e.dataTransfer?.files)
        }}
        class="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input p-6 text-center transition-colors"
        classList={{
          'border-primary bg-primary/5': dragOver(),
          'hover:border-primary hover:bg-primary/5': !dragOver() && !props.disabled,
          'cursor-not-allowed opacity-60': props.disabled,
        }}
      >
        <FileIcon class="h-8 w-8 text-muted-foreground" />
        <p class="text-sm font-medium text-foreground">
          {props.hint ?? 'Drag files here or click to browse'}
        </p>
        <input
          ref={input}
          type="file"
          class="hidden"
          accept={props.accept}
          multiple={props.multiple ?? true}
          disabled={props.disabled}
          onChange={(e) => {
            emit(e.currentTarget.files)
            e.currentTarget.value = '' // allow re-selecting the same file
          }}
        />
      </button>

      <Show when={props.files.length > 0}>
        <ul class="flex flex-col gap-2">
          <For each={props.files}>
            {(file) => (
              <li class="flex items-center gap-3 rounded-lg border border-border bg-glass p-3">
                <Show
                  when={file.url}
                  fallback={
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted">
                      <FileIcon class="h-5 w-5 text-muted-foreground" />
                    </div>
                  }
                >
                  <img src={file.url} alt="" class="h-10 w-10 shrink-0 rounded object-cover" />
                </Show>

                <div class="flex min-w-0 flex-1 flex-col gap-1">
                  <div class="flex items-baseline gap-2">
                    <span class="truncate text-sm font-medium text-foreground">{file.name}</span>
                    <span class="shrink-0 text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                  </div>

                  <Show when={file.status === 'uploading'}>
                    <Progress value={file.progress} />
                  </Show>

                  <Show when={file.status === 'error'}>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-destructive">{file.error ?? 'Upload failed'}</span>
                      <Show when={props.onRetry}>
                        <Button
                          variant="outline"
                          class="h-6 px-2 py-0 text-xs"
                          onClick={() => props.onRetry?.(file.id)}
                        >
                          Retry
                        </Button>
                      </Show>
                    </div>
                  </Show>
                </div>

                <Show when={file.status === 'done'}>
                  <Check class="h-5 w-5 shrink-0 text-primary" aria-label="Upload complete" />
                </Show>

                <Show when={props.onRemove}>
                  <button
                    type="button"
                    aria-label="Remove file"
                    onClick={() => props.onRemove?.(file.id)}
                    class="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </Show>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  )
}
