// Application menubar (File / Edit / View …) on Kobalte's Menubar primitive:
// roving focus across the top-level triggers, hover-to-switch once a menu is
// open, checkbox/radio items and nested submenus. Styled with the same glass
// overlay surface as the other menus.
import { Menubar as KMenubar } from '@kobalte/core/menubar'
import { Check, ChevronRight, Circle } from 'lucide-solid'
import type { JSX, ParentProps } from 'solid-js'
import { For, Show, splitProps } from 'solid-js'

import { cn } from '../lib/cn'
import { Kbd } from './Kbd'

const CONTENT =
  'bg-glass z-50 min-w-[12rem] overflow-hidden rounded-xl p-1 text-sm text-foreground shadow-xl outline-none'
const ITEM =
  'relative flex cursor-pointer select-none items-center gap-2 rounded-md py-1.5 pl-8 pr-2 outline-none transition-colors data-[highlighted]:bg-muted data-[expanded]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus-visible:ring-2 focus-visible:ring-ring'

interface ClassProps extends ParentProps {
  class?: string
}

/** Props of {@link Menubar}. */
export interface MenubarProps extends ClassProps {
  /** Accessible name of the menubar. @default 'Application menu' */
  label?: string
}

/**
 * Horizontal bar of top-level menus. Arrow Left/Right moves between the
 * triggers; once one menu is open, hovering another trigger switches to it.
 *
 * @example
 * ```tsx
 * <Menubar>
 *   <MenubarMenu label="File">
 *     <MenubarItem shortcut={['⌘', 'N']}>New project</MenubarItem>
 *     <MenubarSeparator />
 *     <MenubarItem>Quit</MenubarItem>
 *   </MenubarMenu>
 * </Menubar>
 * ```
 */
export function Menubar(props: MenubarProps): JSX.Element {
  return (
    <KMenubar
      aria-label={props.label ?? 'Application menu'}
      class={cn(
        'inline-flex items-center gap-0.5 rounded-xl border border-border bg-card/60 p-1',
        props.class,
      )}
    >
      {props.children}
    </KMenubar>
  )
}

/** Props of {@link MenubarMenu}. */
export interface MenubarMenuProps extends ClassProps {
  /** Text of the top-level trigger. */
  label: string
  /** Extra classes for the popover content. */
  contentClass?: string
}

/** One top-level menu: a trigger button plus its popover of items. */
export function MenubarMenu(props: MenubarMenuProps): JSX.Element {
  return (
    <KMenubar.Menu>
      <KMenubar.Trigger
        class={cn(
          'rounded-lg px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted data-[expanded]:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
          props.class,
        )}
      >
        {props.label}
      </KMenubar.Trigger>
      <KMenubar.Portal>
        <KMenubar.Content class={cn(CONTENT, props.contentClass)}>{props.children}</KMenubar.Content>
      </KMenubar.Portal>
    </KMenubar.Menu>
  )
}

/** Props of {@link MenubarItem}. */
export interface MenubarItemProps extends ClassProps {
  disabled?: boolean
  /** Called when the item is chosen (click, Enter or Space). */
  onSelect?: () => void
  /** Keys shown right-aligned as keycaps, e.g. `['⌘', 'N']`. */
  shortcut?: string[]
  /** Styles the item as destructive (e.g. "Delete"). */
  destructive?: boolean
}

function Shortcut(props: { keys?: string[] }): JSX.Element {
  return (
    <Show when={props.keys?.length}>
      <span class="ml-auto flex gap-0.5 pl-6" aria-hidden="true">
        <For each={props.keys}>{(k) => <Kbd class="min-w-[1.25rem] px-1 py-0 text-[11px]">{k}</Kbd>}</For>
      </span>
    </Show>
  )
}

/** A plain action row, with an optional keyboard-shortcut hint. */
export function MenubarItem(props: MenubarItemProps): JSX.Element {
  return (
    <KMenubar.Item
      class={cn(ITEM, props.destructive && 'text-destructive', props.class)}
      disabled={props.disabled}
      onSelect={() => props.onSelect?.()}
    >
      {props.children}
      <Shortcut keys={props.shortcut} />
    </KMenubar.Item>
  )
}

/** Props of {@link MenubarCheckboxItem}. */
export interface MenubarCheckboxItemProps extends ClassProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  shortcut?: string[]
}

/** A toggle row exposing `role="menuitemcheckbox"` / `aria-checked`. */
export function MenubarCheckboxItem(props: MenubarCheckboxItemProps): JSX.Element {
  return (
    <KMenubar.CheckboxItem
      class={cn(ITEM, props.class)}
      checked={props.checked}
      onChange={(v) => props.onChange?.(v)}
      disabled={props.disabled}
    >
      <KMenubar.ItemIndicator class="absolute left-2 inline-flex items-center">
        <Check class="h-3.5 w-3.5" />
      </KMenubar.ItemIndicator>
      {props.children}
      <Shortcut keys={props.shortcut} />
    </KMenubar.CheckboxItem>
  )
}

/** Props of {@link MenubarRadioGroup}. */
export interface MenubarRadioGroupProps extends ParentProps {
  value?: string
  onChange?: (value: string) => void
}

/** Groups {@link MenubarRadioItem}s so exactly one is selected. */
export function MenubarRadioGroup(props: MenubarRadioGroupProps): JSX.Element {
  return (
    <KMenubar.RadioGroup value={props.value} onChange={(v) => props.onChange?.(v)}>
      {props.children}
    </KMenubar.RadioGroup>
  )
}

/** Props of {@link MenubarRadioItem}. */
export interface MenubarRadioItemProps extends ClassProps {
  value: string
  disabled?: boolean
}

/** A single-choice row inside a {@link MenubarRadioGroup} (`role="menuitemradio"`). */
export function MenubarRadioItem(props: MenubarRadioItemProps): JSX.Element {
  return (
    <KMenubar.RadioItem class={cn(ITEM, props.class)} value={props.value} disabled={props.disabled}>
      <KMenubar.ItemIndicator class="absolute left-2 inline-flex items-center">
        <Circle class="h-2 w-2 fill-current" />
      </KMenubar.ItemIndicator>
      {props.children}
    </KMenubar.RadioItem>
  )
}

/** Props of {@link MenubarSub}. */
export interface MenubarSubProps extends ClassProps {
  /** Text of the submenu trigger row. */
  label: string
}

/** A nested submenu: opens with ArrowRight / hover, closes with ArrowLeft. */
export function MenubarSub(props: MenubarSubProps): JSX.Element {
  return (
    <KMenubar.Sub overlap gutter={4} shift={-5}>
      <KMenubar.SubTrigger class={cn(ITEM, props.class)}>
        {props.label}
        <ChevronRight class="ml-auto h-3.5 w-3.5 text-muted-foreground" />
      </KMenubar.SubTrigger>
      <KMenubar.Portal>
        <KMenubar.SubContent class={CONTENT}>{props.children}</KMenubar.SubContent>
      </KMenubar.Portal>
    </KMenubar.Sub>
  )
}

/** Thin divider between groups of items. */
export function MenubarSeparator(props: { class?: string }): JSX.Element {
  return <KMenubar.Separator class={cn('-mx-1 my-1 h-px border-0 bg-border', props.class)} />
}

/** Non-interactive section heading inside a menu. */
export function MenubarLabel(props: ClassProps): JSX.Element {
  const [local] = splitProps(props, ['class', 'children'])
  return (
    <div class={cn('px-2 py-1.5 pl-8 text-xs font-semibold text-muted-foreground', local.class)}>
      {local.children}
    </div>
  )
}
