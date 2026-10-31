// Composable row primitive: media + title/description + actions, with optional
// header/footer. Plain HTML + Tailwind. `List` stays the data-driven shortcut;
// `Item` is the building block when a row needs custom structure (attachments,
// settings rows, sidebar entries, notification rows).
import { splitProps, type JSX, type ParentProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { cn } from '../lib/cn'

export type ItemVariant = 'default' | 'outline' | 'muted'
export type ItemSize = 'default' | 'sm' | 'xs'

interface ItemProps extends ParentProps {
  /** @default 'default' (transparent) */
  variant?: ItemVariant
  /** Padding + gap density. @default 'default' */
  size?: ItemSize
  /**
   * Render the row as a link. The whole row becomes the hit target and gets a
   * hover/focus state.
   */
  href?: string
  /** Render the row as a `<button>` with this click handler (when no `href`). */
  onClick?: JSX.EventHandlerUnion<HTMLElement, MouseEvent>
  /** Element to render when neither `href` nor `onClick` is set. @default 'div' */
  as?: 'div' | 'li' | 'article' | 'section'
  class?: string
}

export type { ItemProps }

const VARIANT: Record<ItemVariant, string> = {
  default: 'border border-transparent',
  outline: 'border border-border',
  muted: 'border border-transparent bg-muted/50',
}

const SIZE: Record<ItemSize, string> = {
  default: 'gap-4 p-4',
  sm: 'gap-3 px-3 py-2.5',
  xs: 'gap-2 px-2 py-1.5 text-sm',
}

/**
 * A row of content: optional `ItemMedia`, an `ItemContent` column with
 * `ItemTitle`/`ItemDescription`, and trailing `ItemActions`. `ItemHeader` and
 * `ItemFooter` span the full width above/below. Group rows with `ItemGroup`.
 *
 * @example
 * ```tsx
 * <Item variant="outline">
 *   <ItemMedia variant="icon"><Bell /></ItemMedia>
 *   <ItemContent>
 *     <ItemTitle>Weekly digest</ItemTitle>
 *     <ItemDescription>Every Monday at 9:00</ItemDescription>
 *   </ItemContent>
 *   <ItemActions><Switch checked /></ItemActions>
 * </Item>
 * ```
 */
export function Item(props: ItemProps): JSX.Element {
  const [local] = splitProps(props, ['variant', 'size', 'href', 'onClick', 'as', 'class', 'children'])
  const interactive = (): boolean => local.href !== undefined || local.onClick !== undefined
  const tag = (): string => (local.href !== undefined ? 'a' : local.onClick ? 'button' : (local.as ?? 'div'))
  return (
    <Dynamic
      component={tag()}
      href={local.href}
      type={tag() === 'button' ? 'button' : undefined}
      onClick={local.onClick}
      data-slot="item"
      data-variant={local.variant ?? 'default'}
      data-size={local.size ?? 'default'}
      class={cn(
        'group/item flex w-full flex-wrap items-center rounded-lg text-left text-foreground outline-none transition-colors',
        VARIANT[local.variant ?? 'default'],
        SIZE[local.size ?? 'default'],
        interactive() && 'cursor-pointer hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring',
        local.class,
      )}
    >
      {local.children}
    </Dynamic>
  )
}

interface SlotProps extends ParentProps {
  class?: string
}

/** Vertical stack of `Item`s. */
export function ItemGroup(props: SlotProps): JSX.Element {
  return (
    <div data-slot="item-group" class={cn('flex flex-col', props.class)}>
      {props.children}
    </div>
  )
}

/** Thin divider between `Item`s inside an `ItemGroup`. */
export function ItemSeparator(props: { class?: string }): JSX.Element {
  return <div role="separator" data-slot="item-separator" class={cn('mx-4 h-px bg-border', props.class)} />
}

export type ItemMediaVariant = 'default' | 'icon' | 'image'

const MEDIA: Record<ItemMediaVariant, string> = {
  default: '',
  icon: 'grid h-9 w-9 place-items-center rounded-md border border-border bg-muted text-muted-foreground [&>svg]:h-4 [&>svg]:w-4',
  image: 'h-10 w-10 overflow-hidden rounded-md [&>img]:h-full [&>img]:w-full [&>img]:object-cover',
}

/** Leading visual: an icon tile, an image thumbnail, or anything (`default`). */
export function ItemMedia(props: SlotProps & { variant?: ItemMediaVariant }): JSX.Element {
  return (
    <div
      data-slot="item-media"
      class={cn('flex shrink-0 items-center justify-center', MEDIA[props.variant ?? 'default'], props.class)}
    >
      {props.children}
    </div>
  )
}

/** The flexible text column (title + description). */
export function ItemContent(props: SlotProps): JSX.Element {
  return (
    <div data-slot="item-content" class={cn('flex min-w-0 flex-1 flex-col gap-0.5', props.class)}>
      {props.children}
    </div>
  )
}

export function ItemTitle(props: SlotProps): JSX.Element {
  return (
    <div
      data-slot="item-title"
      class={cn('flex items-center gap-2 text-sm font-medium leading-snug', props.class)}
    >
      {props.children}
    </div>
  )
}

/** Muted secondary text, clamped to two lines. */
export function ItemDescription(props: SlotProps): JSX.Element {
  return (
    <p data-slot="item-description" class={cn('line-clamp-2 text-sm text-muted-foreground', props.class)}>
      {props.children}
    </p>
  )
}

/** Trailing controls (buttons, a switch, a badge). */
export function ItemActions(props: SlotProps): JSX.Element {
  return (
    <div data-slot="item-actions" class={cn('flex shrink-0 items-center gap-2', props.class)}>
      {props.children}
    </div>
  )
}

/** Full-width row above the media/content line. */
export function ItemHeader(props: SlotProps): JSX.Element {
  return (
    <div
      data-slot="item-header"
      class={cn('flex basis-full items-center justify-between gap-2', props.class)}
    >
      {props.children}
    </div>
  )
}

/** Full-width row below the media/content line. */
export function ItemFooter(props: SlotProps): JSX.Element {
  return (
    <div
      data-slot="item-footer"
      class={cn('flex basis-full items-center justify-between gap-2', props.class)}
    >
      {props.children}
    </div>
  )
}
