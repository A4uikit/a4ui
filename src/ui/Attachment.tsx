// Attachment — a file/image chip for chat UIs, built on the `Item` row primitive.
// Adds an upload lifecycle (idle / uploading / processing / error / done), a
// progress bar and a horizontally scrolling group.
import { splitProps, type JSX, type ParentProps, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle, type ItemSize } from './Item'
import { ScrollArea } from './ScrollArea'

export type AttachmentState = 'idle' | 'uploading' | 'processing' | 'error' | 'done'
export type AttachmentOrientation = 'horizontal' | 'vertical'

interface AttachmentProps extends ParentProps {
  /** Lifecycle state. `uploading`/`processing` set `aria-busy`; `error` uses destructive tokens. @default 'idle' */
  state?: AttachmentState
  /** Density, forwarded to `Item`. @default 'default' */
  size?: ItemSize
  /** Lay media and text side by side, or stacked. @default 'horizontal' */
  orientation?: AttachmentOrientation
  /**
   * Upload progress, 0–100. Only used while `state="uploading"`; when omitted
   * the bar is indeterminate (no `aria-valuenow`).
   */
  progress?: number
  /** Accessible name of the progress bar. @default 'Uploading' / 'Processing' */
  progressLabel?: string
  class?: string
}

export type { AttachmentProps }

const clamp = (n: number): number => Math.min(100, Math.max(0, n))

/**
 * A file or image attachment: `AttachmentMedia`, an `AttachmentContent` with
 * title/description and trailing `AttachmentActions`. Group several in an
 * `AttachmentGroup` (horizontal scroll-snap row).
 *
 * @example
 * ```tsx
 * <Attachment state="uploading" progress={42}>
 *   <AttachmentMedia><FileText /></AttachmentMedia>
 *   <AttachmentContent>
 *     <AttachmentTitle>roadmap.pdf</AttachmentTitle>
 *     <AttachmentDescription>42% of 2.4 MB</AttachmentDescription>
 *   </AttachmentContent>
 *   <AttachmentActions>
 *     <AttachmentAction label="Cancel upload"><X /></AttachmentAction>
 *   </AttachmentActions>
 * </Attachment>
 * ```
 */
export function Attachment(props: AttachmentProps): JSX.Element {
  const [local] = splitProps(props, [
    'state',
    'size',
    'orientation',
    'progress',
    'progressLabel',
    'class',
    'children',
  ])
  const state = (): AttachmentState => local.state ?? 'idle'
  const busy = (): boolean => state() === 'uploading' || state() === 'processing'
  const determinate = (): boolean => state() === 'uploading' && local.progress !== undefined
  return (
    <div
      data-slot="attachment"
      data-state={state()}
      data-orientation={local.orientation ?? 'horizontal'}
      aria-busy={busy() ? 'true' : undefined}
      class={cn(
        'relative w-full overflow-hidden rounded-lg border bg-card/60 text-card-foreground',
        state() === 'error'
          ? 'border-destructive/50 bg-destructive/10 text-destructive [&_[data-slot=item-description]]:text-destructive/80'
          : 'border-border',
        local.class,
      )}
    >
      <Item
        size={local.size}
        class={cn(
          'flex-nowrap border-0',
          local.orientation === 'vertical' && 'flex-col items-start',
          state() === 'processing' && 'animate-pulse',
        )}
      >
        {local.children}
      </Item>
      <Show when={busy()}>
        <div
          role="progressbar"
          aria-label={local.progressLabel ?? (state() === 'uploading' ? 'Uploading' : 'Processing')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={determinate() ? Math.round(clamp(local.progress ?? 0)) : undefined}
          class="absolute inset-x-0 bottom-0 h-1 bg-muted"
        >
          <div
            class={cn(
              'h-full bg-primary transition-[width] duration-200',
              !determinate() && 'w-1/3 animate-pulse',
            )}
            style={determinate() ? { width: `${clamp(local.progress ?? 0)}%` } : undefined}
          />
        </div>
      </Show>
    </div>
  )
}

interface SlotProps extends ParentProps {
  class?: string
}

/** Leading visual: an icon tile (`icon`, default) or an image thumbnail (`image`). */
export function AttachmentMedia(props: SlotProps & { variant?: 'icon' | 'image' }): JSX.Element {
  return (
    <ItemMedia variant={props.variant ?? 'icon'} class={props.class}>
      {props.children}
    </ItemMedia>
  )
}

/** The text column. */
export function AttachmentContent(props: SlotProps): JSX.Element {
  return <ItemContent class={props.class}>{props.children}</ItemContent>
}

/** File name; truncates on one line. */
export function AttachmentTitle(props: SlotProps): JSX.Element {
  return <ItemTitle class={cn('block truncate', props.class)}>{props.children}</ItemTitle>
}

/** Secondary line: size, status or error message. */
export function AttachmentDescription(props: SlotProps): JSX.Element {
  return <ItemDescription class={cn('line-clamp-1 text-xs', props.class)}>{props.children}</ItemDescription>
}

/** Trailing controls. */
export function AttachmentActions(props: SlotProps): JSX.Element {
  return <ItemActions class={cn('gap-1', props.class)}>{props.children}</ItemActions>
}

interface AttachmentActionProps extends ParentProps {
  /** Accessible name (required: the button only holds an icon). */
  label: string
  onClick?: (event: MouseEvent) => void
  disabled?: boolean
  class?: string
}

export type { AttachmentActionProps }

/** Icon button inside `AttachmentActions`. */
export function AttachmentAction(props: AttachmentActionProps): JSX.Element {
  return (
    <button
      type="button"
      aria-label={props.label}
      disabled={props.disabled}
      onClick={(e) => props.onClick?.(e)}
      class={cn(
        'grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&>svg]:h-4 [&>svg]:w-4',
        props.class,
      )}
    >
      {props.children}
    </button>
  )
}

/** Horizontal scroll-snap row of attachments. */
export function AttachmentGroup(props: SlotProps & { label?: string }): JSX.Element {
  return (
    <ScrollArea
      orientation="horizontal"
      label={props.label ?? 'Attachments'}
      class={cn('w-full snap-x snap-mandatory rounded-lg', props.class)}
    >
      <div
        data-slot="attachment-group"
        class="flex w-max gap-2 p-1 [&>[data-slot=attachment]]:w-64 [&>[data-slot=attachment]]:shrink-0 [&>[data-slot=attachment]]:snap-start"
      >
        {props.children}
      </div>
    </ScrollArea>
  )
}
