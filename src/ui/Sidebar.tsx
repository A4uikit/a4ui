// Composable app sidebar. `SidebarProvider` owns the open state (controlled or
// uncontrolled, Ctrl/Cmd+B toggles it); `Sidebar` is the glass panel that collapses
// off-canvas or down to an icon rail; below `md` it renders inside the Drawer.
// Menu parts follow the Item/ItemGroup composition style. Geometry is plain
// Tailwind + the `--sidebar-w` / `--sidebar-w-collapsed` tokens; the width change is
// a CSS transition (reduced motion is neutralised globally in tokens.css).
import { Tooltip as KTooltip } from '@kobalte/core/tooltip'
import { ChevronRight, PanelLeft } from 'lucide-solid'
import {
  type Accessor,
  type JSX,
  type ParentProps,
  Show,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  onCleanup,
  onMount,
  splitProps,
  useContext,
} from 'solid-js'

import { cn } from '../lib/cn'
import { portalDir } from '../lib/direction'
import { useDirection } from './DirectionProvider'
import { useMediaQuery } from '../lib/media'
import { Drawer } from './Drawer'
import { ScrollArea } from './ScrollArea'

/**
 * Which edge the sidebar sits on. The layout is a flex row in DOM order, so the
 * edge follows the reading direction: `start` (alias `left`) is the leading
 * edge, `end` (alias `right`) the trailing one. Under `dir="rtl"` `start` is the
 * right-hand side.
 */
export type SidebarSide = 'start' | 'end' | 'left' | 'right'
const isStart = (side: SidebarSide): boolean => side === 'start' || side === 'left'
export type SidebarVariant = 'sidebar' | 'floating' | 'inset'
export type SidebarCollapsible = 'offcanvas' | 'icon' | 'none'

interface SidebarContextValue {
  /** Desktop expanded state. */
  open: Accessor<boolean>
  setOpen: (open: boolean) => void
  /** Flip the active state: the drawer on mobile, the desktop panel otherwise. */
  toggle: () => void
  /** True below the `md` breakpoint, where the sidebar renders inside a Drawer. */
  isMobile: Accessor<boolean>
  openMobile: Accessor<boolean>
  setOpenMobile: (open: boolean) => void
  /** @internal id of the sidebar panel, for `aria-controls`. */
  panelId: string
  /** @internal registered by `Sidebar` so `SidebarInset` / `SidebarRail` can adapt. */
  config: Accessor<{ side: SidebarSide; variant: SidebarVariant; collapsible: SidebarCollapsible }>
  setConfig: (c: { side: SidebarSide; variant: SidebarVariant; collapsible: SidebarCollapsible }) => void
}

const SidebarContext = createContext<SidebarContextValue>()

/** State of the nearest {@link SidebarProvider}. Throws outside one. */
export function useSidebar(): Omit<SidebarContextValue, 'panelId' | 'config' | 'setConfig'> {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used inside <SidebarProvider>')
  return ctx
}

function useSidebarInternal(): SidebarContextValue {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('Sidebar parts must be used inside <SidebarProvider>')
  return ctx
}

/** True when the icon rail is collapsed (labels hidden, tooltips on). */
const IconCollapsed = createContext<Accessor<boolean>>(() => false)

interface SidebarProviderProps extends ParentProps {
  /** Controlled desktop open state. */
  open?: boolean
  /** Called with the next desktop open state (controlled or not). */
  onOpenChange?: (open: boolean) => void
  /** Initial state when uncontrolled. @default true */
  defaultOpen?: boolean
  /** Key toggled with Ctrl/Cmd; `false` disables the shortcut. @default 'b' */
  shortcut?: string | false
  class?: string
}

/**
 * Owns the sidebar state and wraps `Sidebar` + `SidebarInset` in a flex row.
 * Give it a bounded height (the sidebar fills it). Ctrl/Cmd+B toggles the sidebar.
 *
 * @example
 * ```tsx
 * <SidebarProvider class="h-screen">
 *   <Sidebar collapsible="icon">…</Sidebar>
 *   <SidebarInset>…</SidebarInset>
 * </SidebarProvider>
 * ```
 */
export function SidebarProvider(props: SidebarProviderProps): JSX.Element {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const [internal, setInternal] = createSignal(props.defaultOpen ?? true)
  const [openMobile, setOpenMobile] = createSignal(false)
  const [config, setConfig] = createSignal<ReturnType<SidebarContextValue['config']>>({
    side: 'start',
    variant: 'sidebar',
    collapsible: 'offcanvas',
  })
  const open = () => (props.open !== undefined ? props.open : internal())
  const setOpen = (next: boolean) => {
    if (props.open === undefined) setInternal(next)
    props.onOpenChange?.(next)
  }
  const toggle = () => (isMobile() ? setOpenMobile(!openMobile()) : setOpen(!open()))

  onMount(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = props.shortcut === undefined ? 'b' : props.shortcut
      if (key === false || e.defaultPrevented) return
      if (e.key.toLowerCase() !== key.toLowerCase() || !(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey)
        return
      const t = e.target
      // Leave Ctrl+B alone inside text fields / rich editors.
      if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))
        return
      e.preventDefault()
      toggle()
    }
    window.addEventListener('keydown', onKey)
    onCleanup(() => window.removeEventListener('keydown', onKey))
  })

  const value: SidebarContextValue = {
    open,
    setOpen,
    toggle,
    isMobile,
    openMobile,
    setOpenMobile,
    panelId: `sidebar-${createUniqueId()}`,
    config,
    setConfig,
  }
  return (
    <SidebarContext.Provider value={value}>
      <div data-sidebar="provider" class={cn('flex h-full min-h-0 w-full', props.class)}>
        {props.children}
      </div>
    </SidebarContext.Provider>
  )
}

interface SidebarProps extends ParentProps {
  /** Which edge it sits on; follows `dir` (see {@link SidebarSide}). @default 'start' */
  side?: SidebarSide
  /** `sidebar` is flush, `floating` is a detached rounded panel, `inset` has no surface of its own (pair with `SidebarInset`). @default 'sidebar' */
  variant?: SidebarVariant
  /** `offcanvas` slides away, `icon` shrinks to an icon rail, `none` never collapses. @default 'offcanvas' */
  collapsible?: SidebarCollapsible
  /** Accessible name (and the drawer title on mobile). @default 'Navigation' */
  label?: string
  class?: string
}

/**
 * The sidebar panel. Collapses per `collapsible`; below `md` it opens as a
 * `Drawer` on the same `side` (toggled by `SidebarTrigger` / Ctrl+B).
 *
 * @example
 * ```tsx
 * <Sidebar collapsible="icon" variant="floating">
 *   <SidebarHeader>…</SidebarHeader>
 *   <SidebarContent>…</SidebarContent>
 * </Sidebar>
 * ```
 */
export function Sidebar(props: SidebarProps): JSX.Element {
  const ctx = useSidebarInternal()
  const side = () => props.side ?? 'start'
  const variant = () => props.variant ?? 'sidebar'
  const collapsible = () => props.collapsible ?? 'offcanvas'
  createEffect(() => ctx.setConfig({ side: side(), variant: variant(), collapsible: collapsible() }))

  const expanded = () => collapsible() === 'none' || ctx.open()
  const iconCollapsed = () => !ctx.isMobile() && collapsible() === 'icon' && !expanded()
  const offscreen = () => collapsible() === 'offcanvas' && !expanded()
  const label = () => props.label ?? 'Navigation'

  const surface = () => (
    <div
      data-sidebar="surface"
      class={cn(
        'relative flex h-full w-full min-w-0 flex-col',
        variant() === 'sidebar' &&
          cn('bg-glass', isStart(side()) ? 'border-e border-border' : 'border-s border-border'),
        variant() === 'floating' && 'rounded-xl border border-border bg-glass shadow-lg',
        props.class,
      )}
    >
      {props.children}
    </div>
  )

  return (
    <IconCollapsed.Provider value={iconCollapsed}>
      <Show
        when={!ctx.isMobile()}
        fallback={
          <Drawer
            open={ctx.openMobile()}
            onOpenChange={ctx.setOpenMobile}
            side={isStart(side()) ? 'start' : 'end'}
            title={label()}
            class="max-w-[var(--sidebar-w)] p-0"
          >
            <div id={ctx.panelId} data-sidebar="surface" class="flex min-h-0 flex-1 flex-col">
              {props.children}
            </div>
          </Drawer>
        }
      >
        <aside
          id={ctx.panelId}
          aria-label={label()}
          data-sidebar="root"
          data-state={expanded() ? 'expanded' : 'collapsed'}
          data-side={side()}
          data-variant={variant()}
          data-collapsible={collapsible()}
          data-icon-collapsed={iconCollapsed()}
          class={cn(
            'group/sidebar relative h-full shrink-0 transition-[width] duration-200 ease-out',
            expanded()
              ? 'w-[var(--sidebar-w)]'
              : collapsible() === 'icon'
                ? 'w-[var(--sidebar-w-collapsed)]'
                : 'w-0',
          )}
        >
          <div
            class={cn(
              'absolute inset-y-0 transition-[transform,visibility] duration-200 ease-out',
              isStart(side()) ? 'start-0' : 'end-0',
              variant() !== 'sidebar' && 'p-2',
              collapsible() === 'icon' ? 'w-full' : 'w-[var(--sidebar-w)]',
              offscreen() &&
                cn(
                  'invisible',
                  isStart(side())
                    ? '-translate-x-full rtl:translate-x-full'
                    : 'translate-x-full rtl:-translate-x-full',
                ),
            )}
          >
            {surface()}
          </div>
        </aside>
      </Show>
    </IconCollapsed.Provider>
  )
}

interface SidebarTriggerProps {
  /** Accessible name. @default 'Toggle sidebar' */
  label?: string
  class?: string
  /** Replaces the default panel icon. */
  children?: JSX.Element
}

/**
 * Button that toggles the sidebar (the drawer on mobile). Exposes
 * `aria-expanded` and `aria-controls` for the panel.
 */
export function SidebarTrigger(props: SidebarTriggerProps): JSX.Element {
  const ctx = useSidebarInternal()
  const expanded = () => (ctx.isMobile() ? ctx.openMobile() : ctx.open())
  return (
    <button
      type="button"
      data-sidebar="trigger"
      aria-label={props.label ?? 'Toggle sidebar'}
      aria-expanded={expanded()}
      aria-controls={ctx.panelId}
      onClick={() => ctx.toggle()}
      class={cn(
        'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        props.class,
      )}
    >
      {props.children ?? <PanelLeft class="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />}
    </button>
  )
}

/**
 * Thin hit area on the sidebar's inner edge that toggles it. Pointer-only
 * affordance (`tabindex=-1`); keyboard users have `SidebarTrigger` and Ctrl+B.
 * Place it as the last child of `Sidebar`.
 */
export function SidebarRail(props: { class?: string }): JSX.Element {
  const ctx = useSidebarInternal()
  const left = () => isStart(ctx.config().side)
  return (
    <button
      type="button"
      data-sidebar="rail"
      tabIndex={-1}
      aria-label="Toggle sidebar edge"
      title="Toggle sidebar"
      onClick={() => ctx.toggle()}
      class={cn(
        'absolute inset-y-0 z-10 hidden w-3 after:absolute after:inset-y-0 after:start-1/2 after:w-px after:bg-transparent after:transition-colors hover:after:bg-border md:block',
        left()
          ? '-end-1.5 cursor-w-resize rtl:cursor-e-resize'
          : '-start-1.5 cursor-e-resize rtl:cursor-w-resize',
        props.class,
      )}
    />
  )
}

/**
 * Main content wrapper. With `variant="inset"` it becomes a rounded glass panel
 * beside the sidebar; otherwise it is a plain scrolling region.
 *
 * @example
 * ```tsx
 * <SidebarInset><main>…</main></SidebarInset>
 * ```
 */
export function SidebarInset(props: ParentProps<{ class?: string }>): JSX.Element {
  const ctx = useSidebarInternal()
  const inset = () => ctx.config().variant === 'inset'
  return (
    <div
      data-sidebar="inset"
      class={cn(
        'relative min-w-0 flex-1 overflow-auto',
        inset() &&
          cn(
            'm-2 rounded-xl border border-border bg-glass shadow-sm',
            isStart(ctx.config().side) ? 'ms-0' : 'me-0',
          ),
        props.class,
      )}
    >
      {props.children}
    </div>
  )
}

/** Top slot (brand, switcher, search). */
export function SidebarHeader(props: ParentProps<{ class?: string }>): JSX.Element {
  return (
    <div data-sidebar="header" class={cn('flex flex-col gap-2 p-2', props.class)}>
      {props.children}
    </div>
  )
}

/** Bottom slot (account, settings). */
export function SidebarFooter(props: ParentProps<{ class?: string }>): JSX.Element {
  return (
    <div data-sidebar="footer" class={cn('flex flex-col gap-2 p-2', props.class)}>
      {props.children}
    </div>
  )
}

/** Scrolling middle region, built on `ScrollArea`. */
export function SidebarContent(props: ParentProps<{ class?: string }>): JSX.Element {
  return (
    <ScrollArea class={cn('flex min-h-0 flex-1 flex-col gap-2 p-2', props.class)}>
      {props.children}
    </ScrollArea>
  )
}

const GroupContext = createContext<{ id: string; register: () => void }>()

/** A labelled section of the sidebar. */
export function SidebarGroup(props: ParentProps<{ class?: string }>): JSX.Element {
  const id = `sidebar-group-${createUniqueId()}`
  const [hasLabel, setHasLabel] = createSignal(false)
  return (
    <GroupContext.Provider value={{ id, register: () => setHasLabel(true) }}>
      <div
        role="group"
        data-sidebar="group"
        aria-labelledby={hasLabel() ? id : undefined}
        class={cn('relative flex w-full min-w-0 flex-col gap-1', props.class)}
      >
        {props.children}
      </div>
    </GroupContext.Provider>
  )
}

/** Small uppercase heading of a group; hidden when the rail is icon-collapsed. */
export function SidebarGroupLabel(props: ParentProps<{ class?: string }>): JSX.Element {
  const group = useContext(GroupContext)
  onMount(() => group?.register())
  return (
    <div
      id={group?.id}
      data-sidebar="group-label"
      class={cn(
        'px-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground group-data-[icon-collapsed=true]/sidebar:hidden',
        props.class,
      )}
    >
      {props.children}
    </div>
  )
}

interface SidebarGroupActionProps extends ParentProps {
  /** Required accessible name (the action is usually just an icon). */
  label: string
  onClick?: (e: MouseEvent) => void
  class?: string
}

/** Icon button aligned to the right of the group label. */
export function SidebarGroupAction(props: SidebarGroupActionProps): JSX.Element {
  return (
    <button
      type="button"
      data-sidebar="group-action"
      aria-label={props.label}
      onClick={(e) => props.onClick?.(e)}
      class={cn(
        'absolute end-1 top-0 grid h-6 w-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-data-[icon-collapsed=true]/sidebar:hidden [&>svg]:h-4 [&>svg]:w-4',
        props.class,
      )}
    >
      {props.children}
    </button>
  )
}

/** Wrapper for a group's items. */
export function SidebarGroupContent(props: ParentProps<{ class?: string }>): JSX.Element {
  return (
    <div data-sidebar="group-content" class={cn('w-full text-sm', props.class)}>
      {props.children}
    </div>
  )
}

/** `<ul>` of menu items. */
export function SidebarMenu(props: ParentProps<{ class?: string }>): JSX.Element {
  return (
    <ul data-sidebar="menu" class={cn('flex w-full min-w-0 list-none flex-col gap-1', props.class)}>
      {props.children}
    </ul>
  )
}

/** `<li>` of a menu; anchors `SidebarMenuAction` and `SidebarMenuBadge`. */
export function SidebarMenuItem(props: ParentProps<{ class?: string }>): JSX.Element {
  return (
    <li data-sidebar="menu-item" class={cn('group/item relative', props.class)}>
      {props.children}
    </li>
  )
}

type MenuButtonSize = 'sm' | 'default' | 'lg'

interface SidebarMenuButtonProps extends ParentProps {
  /** Marks the current page: sets `aria-current="page"` and the highlight. */
  active?: boolean
  /** Renders a link. Otherwise a `<button>` (use `onClick`). */
  href?: string
  onClick?: (e: MouseEvent) => void
  /** Shown as a tooltip (beside the icon) only while the rail is icon-collapsed. */
  tooltip?: JSX.Element
  size?: MenuButtonSize
  class?: string
}

const SIZE: Record<MenuButtonSize, string> = {
  sm: 'h-7 text-xs',
  default: 'h-9 text-sm',
  lg: 'h-12 text-sm',
}

// Shared look of MenuButton, MenuSubTrigger. In the icon rail every direct text
// child is visually hidden (sr-only) so the accessible name survives, and the
// icon is centred.
const ITEM_BASE =
  'flex w-full min-w-0 items-center gap-2.5 rounded-lg px-2.5 text-start font-medium text-foreground/80 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-muted aria-[current=page]:text-foreground group-has-[[data-sidebar=menu-action]]/item:pe-9 [&>svg]:h-[18px] [&>svg]:w-[18px] [&>svg]:shrink-0 [&>span]:truncate group-data-[icon-collapsed=true]/sidebar:justify-center group-data-[icon-collapsed=true]/sidebar:px-0 group-data-[icon-collapsed=true]/sidebar:[&>span]:sr-only'

function MenuTooltip(
  props: ParentProps<{ tooltip?: JSX.Element; as: 'a' | 'button'; [key: string]: unknown }>,
) {
  const iconCollapsed = useContext(IconCollapsed)
  const ctx = useSidebarInternal()
  const dir = useDirection()
  const [local, rest] = splitProps(props, ['tooltip', 'as', 'children'])
  // Kobalte placements are physical: the tooltip opens toward the content side.
  const towardContent = () => (isStart(ctx.config().side) === (dir() === 'ltr') ? 'right' : 'left')
  return (
    <KTooltip
      placement={towardContent()}
      gutter={10}
      openDelay={150}
      closeDelay={0}
      disabled={!local.tooltip || !iconCollapsed()}
    >
      <KTooltip.Trigger as={local.as} {...rest}>
        {local.children}
      </KTooltip.Trigger>
      <KTooltip.Portal ref={portalDir}>
        <KTooltip.Content class="z-50 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-card-foreground shadow-md">
          {local.tooltip}
        </KTooltip.Content>
      </KTooltip.Portal>
    </KTooltip>
  )
}

/**
 * Main navigation row. Pass `href` for a link or `onClick` for an action;
 * `active` sets `aria-current="page"`. Put the label in a `<span>` after the icon
 * so it can collapse; with `collapsible="icon"` the `tooltip` appears on
 * hover/focus and the span stays as the accessible name.
 *
 * @example
 * ```tsx
 * <SidebarMenuButton href="#/inbox" active tooltip="Inbox"><Inbox /><span>Inbox</span></SidebarMenuButton>
 * ```
 */
export function SidebarMenuButton(props: SidebarMenuButtonProps): JSX.Element {
  const cls = () => cn(ITEM_BASE, SIZE[props.size ?? 'default'], props.class)
  return (
    <Show
      when={props.href !== undefined}
      fallback={
        <MenuTooltip
          as="button"
          type="button"
          tooltip={props.tooltip}
          data-sidebar="menu-button"
          aria-current={props.active ? 'page' : undefined}
          onClick={(e: MouseEvent) => props.onClick?.(e)}
          class={cls()}
        >
          {props.children}
        </MenuTooltip>
      }
    >
      <MenuTooltip
        as="a"
        href={props.href}
        tooltip={props.tooltip}
        data-sidebar="menu-button"
        aria-current={props.active ? 'page' : undefined}
        onClick={(e: MouseEvent) => props.onClick?.(e)}
        class={cls()}
      >
        {props.children}
      </MenuTooltip>
    </Show>
  )
}

/** Icon button to the right of a `SidebarMenuButton` (add, more…). Needs a `label`. */
export function SidebarMenuAction(
  props: ParentProps<{
    label: string
    onClick?: (e: MouseEvent) => void
    showOnHover?: boolean
    class?: string
  }>,
): JSX.Element {
  return (
    <button
      type="button"
      data-sidebar="menu-action"
      aria-label={props.label}
      onClick={(e) => props.onClick?.(e)}
      class={cn(
        'absolute end-1 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-data-[icon-collapsed=true]/sidebar:hidden [&>svg]:h-4 [&>svg]:w-4',
        props.showOnHover &&
          'opacity-0 focus-visible:opacity-100 group-focus-within/item:opacity-100 group-hover/item:opacity-100',
        props.class,
      )}
    >
      {props.children}
    </button>
  )
}

/** Count / status pill at the right edge of a menu item. */
export function SidebarMenuBadge(props: ParentProps<{ class?: string }>): JSX.Element {
  return (
    <span
      data-sidebar="menu-badge"
      class={cn(
        'pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 select-none rounded-md bg-primary/15 px-1.5 text-[11px] font-semibold tabular-nums text-primary group-data-[icon-collapsed=true]/sidebar:hidden',
        props.class,
      )}
    >
      {props.children}
    </span>
  )
}

interface SidebarMenuSubProps extends ParentProps {
  /** Text of the row that expands the submenu. */
  label: string
  /** Icon shown before the label. */
  icon?: JSX.Element
  /** Controlled expanded state. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Initial state when uncontrolled. @default false */
  defaultOpen?: boolean
  class?: string
}

/**
 * Collapsible nested menu: a toggle row (`aria-expanded` / `aria-controls`) and an
 * indented list of `SidebarMenuSubItem`. Use inside a `SidebarMenuItem`. In the icon
 * rail the toggle expands the sidebar first, then the submenu.
 *
 * @example
 * ```tsx
 * <SidebarMenuItem>
 *   <SidebarMenuSub label="Projects" icon={<Folder />}>
 *     <SidebarMenuSubItem><SidebarMenuSubButton href="#/a">Orbit</SidebarMenuSubButton></SidebarMenuSubItem>
 *   </SidebarMenuSub>
 * </SidebarMenuItem>
 * ```
 */
export function SidebarMenuSub(props: SidebarMenuSubProps): JSX.Element {
  const ctx = useSidebarInternal()
  const iconCollapsed = useContext(IconCollapsed)
  const id = `sidebar-sub-${createUniqueId()}`
  const [internal, setInternal] = createSignal(props.defaultOpen ?? false)
  const open = () => (props.open !== undefined ? props.open : internal())
  const set = (next: boolean) => {
    if (props.open === undefined) setInternal(next)
    props.onOpenChange?.(next)
  }
  const shown = createMemo(() => open() && !iconCollapsed())
  return (
    <div data-sidebar="menu-sub" class={props.class}>
      <MenuTooltip
        as="button"
        type="button"
        tooltip={props.label}
        data-sidebar="menu-sub-trigger"
        aria-expanded={shown()}
        aria-controls={id}
        onClick={() => {
          if (iconCollapsed()) {
            ctx.setOpen(true)
            set(true)
          } else set(!open())
        }}
        class={cn(ITEM_BASE, SIZE.default)}
      >
        {props.icon}
        <span>{props.label}</span>
        <ChevronRight
          aria-hidden="true"
          class={cn(
            'ms-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[icon-collapsed=true]/sidebar:hidden',
            shown() ? 'rotate-90' : 'rtl:-scale-x-100',
          )}
        />
      </MenuTooltip>
      <div
        id={id}
        class={cn(
          'grid transition-[grid-template-rows,visibility] duration-200 ease-out',
          shown() ? 'grid-rows-[1fr]' : 'invisible grid-rows-[0fr]',
        )}
      >
        <div class="min-h-0 overflow-hidden">
          <ul class="ms-4 mt-1 flex list-none flex-col gap-0.5 border-s border-border py-0.5 ps-2.5">
            {props.children}
          </ul>
        </div>
      </div>
    </div>
  )
}

/** `<li>` of a submenu. */
export function SidebarMenuSubItem(props: ParentProps<{ class?: string }>): JSX.Element {
  return (
    <li data-sidebar="menu-sub-item" class={cn('relative', props.class)}>
      {props.children}
    </li>
  )
}

/** Link (`href`) or button row inside a submenu; `active` sets `aria-current="page"`. */
export function SidebarMenuSubButton(
  props: ParentProps<{ active?: boolean; href?: string; onClick?: (e: MouseEvent) => void; class?: string }>,
): JSX.Element {
  const cls = () =>
    cn(
      'flex h-8 w-full min-w-0 items-center gap-2 rounded-md px-2 text-start text-[13px] font-medium text-foreground/75 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-muted aria-[current=page]:text-foreground [&>span]:truncate',
      props.class,
    )
  return (
    <Show
      when={props.href !== undefined}
      fallback={
        <button
          type="button"
          data-sidebar="menu-sub-button"
          aria-current={props.active ? 'page' : undefined}
          onClick={(e) => props.onClick?.(e)}
          class={cls()}
        >
          {props.children}
        </button>
      }
    >
      <a
        href={props.href}
        data-sidebar="menu-sub-button"
        aria-current={props.active ? 'page' : undefined}
        onClick={(e) => props.onClick?.(e)}
        class={cls()}
      >
        {props.children}
      </a>
    </Show>
  )
}

/** Loading placeholder shaped like a menu row. Decorative (`aria-hidden`). */
export function SidebarMenuSkeleton(props: { showIcon?: boolean; class?: string }): JSX.Element {
  // Stable per instance so rows do not jitter between renders.
  const width = `${50 + Math.floor(Math.random() * 40)}%`
  return (
    <div
      data-sidebar="menu-skeleton"
      aria-hidden="true"
      class={cn(
        'flex h-9 items-center gap-2.5 rounded-lg px-2.5 group-data-[icon-collapsed=true]/sidebar:justify-center group-data-[icon-collapsed=true]/sidebar:px-0',
        props.class,
      )}
    >
      <Show when={props.showIcon}>
        <div class="h-[18px] w-[18px] shrink-0 animate-pulse rounded-md bg-muted" />
      </Show>
      <div
        class="h-3 flex-1 animate-pulse rounded bg-muted group-data-[icon-collapsed=true]/sidebar:hidden"
        style={{ 'max-width': width }}
      />
    </div>
  )
}

export type {
  SidebarProps,
  SidebarProviderProps,
  SidebarTriggerProps,
  SidebarGroupActionProps,
  SidebarMenuButtonProps,
  SidebarMenuSubProps,
}
