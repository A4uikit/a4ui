// Site navigation with rich dropdown panels on Kobalte's NavigationMenu
// primitive. Desktop: triggers open panels rendered into ONE shared viewport
// that animates its size between panels. Mobile (< md): collapses to a
// hamburger button that opens a Drawer with an Accordion of the sections.
import { NavigationMenu as KNav } from '@kobalte/core/navigation-menu'
import { ChevronDown, Menu as MenuIcon } from 'lucide-solid'
import type { JSX, ParentProps } from 'solid-js'
import { createSignal, For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { portalDir } from '../lib/direction'
import { useMediaQuery } from '../lib/media'
import { Accordion } from './Accordion'
import { Button } from './Button'
import { Drawer } from './Drawer'

const TRIGGER =
  'inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted data-[expanded]:bg-muted focus-visible:ring-2 focus-visible:ring-ring'

/** One section of the collapsed (mobile) navigation. */
export interface NavigationMenuMobileSection {
  /** Section title shown on the accordion trigger (or the link label). */
  label: string
  /** Destination when the section is a plain link with no children. */
  href?: string
  /** Child links; when present the section becomes an accordion entry. */
  links?: { title: string; href: string; description?: string }[]
}

/** Props of {@link NavigationMenu}. */
export interface NavigationMenuProps extends ParentProps {
  /** Accessible name of the navigation landmark. @default 'Main' */
  label?: string
  /**
   * The same sections as `children`, as data. Used below the `md` breakpoint,
   * where the menu collapses into a hamburger + drawer. Required: the mobile
   * layout cannot be derived from the desktop JSX.
   */
  mobileSections: NavigationMenuMobileSection[]
  /** Drawer title. @default 'Menu' */
  mobileTitle?: string
  /** Accessible label of the hamburger button. @default 'Open navigation' */
  mobileButtonLabel?: string
  class?: string
}

/**
 * Site navigation bar whose triggers open rich panels (links with icon, title
 * and description, featured cards) inside a shared, size-animating viewport.
 * Hover or click opens a panel, Escape closes it, and the links inside are
 * reachable with Tab. The root is the `<ul>` list of items.
 *
 * @example
 * ```tsx
 * <NavigationMenu mobileSections={[{ label: 'Docs', href: '/docs' }]}>
 *   <NavigationMenuItem>
 *     <NavigationMenuTrigger>Product</NavigationMenuTrigger>
 *     <NavigationMenuContent>
 *       <NavigationMenuPanelLink href="/tour" title="Tour" description="A quick walkthrough" />
 *     </NavigationMenuContent>
 *   </NavigationMenuItem>
 *   <NavigationMenuLink href="/docs">Docs</NavigationMenuLink>
 * </NavigationMenu>
 * ```
 */
export function NavigationMenu(props: NavigationMenuProps): JSX.Element {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return (
    <Show when={isDesktop()} fallback={<MobileNavigation {...props} />}>
      <KNav aria-label={props.label ?? 'Main'} class={cn('relative flex items-center gap-1', props.class)}>
        {props.children}
        <KNav.Viewport class="navmenu-viewport bg-glass relative z-50 mt-2 h-[var(--kb-navigation-menu-viewport-height)] w-[var(--kb-navigation-menu-viewport-width)] overflow-hidden rounded-2xl shadow-2xl transition-[width,height] duration-300 ease-out">
          <KNav.Arrow class="hidden" />
        </KNav.Viewport>
      </KNav>
    </Show>
  )
}

function MobileNavigation(props: NavigationMenuProps): JSX.Element {
  const [open, setOpen] = createSignal(false)
  const withLinks = () => props.mobileSections.filter((s) => s.links?.length)
  const plain = () => props.mobileSections.filter((s) => !s.links?.length)
  return (
    <nav aria-label={props.label ?? 'Main'} class={props.class}>
      <Button
        variant="outline"
        aria-label={props.mobileButtonLabel ?? 'Open navigation'}
        aria-haspopup="dialog"
        aria-expanded={open()}
        onClick={() => setOpen(true)}
      >
        <MenuIcon class="h-4 w-4" />
      </Button>
      <Drawer side="start" open={open()} onOpenChange={setOpen} title={props.mobileTitle ?? 'Menu'}>
        <div
          class="p-5"
          onKeyDown={(e) => {
            // Escape typed while an accordion trigger has focus does not reach
            // the dialog's own dismiss handler, so close explicitly.
            if (e.key === 'Escape') setOpen(false)
          }}
        >
          <Accordion
            items={withLinks().map((s) => ({
              value: s.label,
              title: s.label,
              content: (
                <ul class="space-y-1">
                  <For each={s.links}>
                    {(l) => (
                      <li>
                        <a
                          href={l.href}
                          class="block rounded-md px-2 py-1.5 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span class="block text-sm font-medium text-foreground">{l.title}</span>
                          <Show when={l.description}>
                            <span class="block text-xs text-muted-foreground">{l.description}</span>
                          </Show>
                        </a>
                      </li>
                    )}
                  </For>
                </ul>
              ),
            }))}
          />
          <ul class="mt-2 space-y-1">
            <For each={plain()}>
              {(s) => (
                <li>
                  <a
                    href={s.href}
                    class="block rounded-md px-2 py-3 text-sm font-medium text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {s.label}
                  </a>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Drawer>
    </nav>
  )
}

/** One top-level entry: pairs a trigger with its panel. */
export function NavigationMenuItem(props: ParentProps): JSX.Element {
  return <KNav.Menu>{props.children}</KNav.Menu>
}

/** Button that opens the sibling {@link NavigationMenuContent}; shows a chevron. */
export function NavigationMenuTrigger(props: ParentProps & { class?: string }): JSX.Element {
  return (
    <KNav.Trigger class={cn(TRIGGER, 'group', props.class)}>
      {props.children}
      <KNav.Icon class="transition-transform duration-200 group-data-[expanded]:rotate-180">
        <ChevronDown class="h-3.5 w-3.5" />
      </KNav.Icon>
    </KNav.Trigger>
  )
}

/** Props of {@link NavigationMenuContent}. */
export interface NavigationMenuContentProps extends ParentProps {
  class?: string
}

/**
 * The panel of one item. Rendered inside the shared viewport, which resizes to
 * fit it. Put {@link NavigationMenuPanelLink}s in it, laid out with a grid.
 */
export function NavigationMenuContent(props: NavigationMenuContentProps): JSX.Element {
  // Kobalte's menu content swallows Tab, which would make the links unreachable
  // with a plain Tab press. Walk the panel's links with Tab / Shift+Tab, and
  // when the end is passed close the menu (focus returns to its trigger) so
  // the key never traps focus.
  const onTab = (e: KeyboardEvent & { currentTarget: HTMLElement }): void => {
    if (e.key !== 'Tab') return
    const links = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('a[role="menuitem"]'))
    const at = links.indexOf(document.activeElement as HTMLElement)
    const next = at + (e.shiftKey ? -1 : 1)
    e.preventDefault()
    // Deferred: Kobalte's own Shift+Tab handling re-focuses the panel right after this handler.
    const target = links[next]
    if (target) setTimeout(() => target.focus(), 0)
    else e.currentTarget.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  }
  return (
    <KNav.Portal ref={portalDir}>
      <KNav.Content
        class={cn(
          'navmenu-content absolute start-0 top-0 w-max max-w-[min(90vw,40rem)] p-3 outline-none',
          props.class,
        )}
        onKeyDown={onTab}
      >
        {props.children}
      </KNav.Content>
    </KNav.Portal>
  )
}

/** Props of {@link NavigationMenuLink}. */
export interface NavigationMenuLinkProps extends ParentProps {
  href: string
  class?: string
}

/** A top-level link with no panel; takes part in the trigger roving focus. */
export function NavigationMenuLink(props: NavigationMenuLinkProps): JSX.Element {
  return (
    <KNav.Menu value={`link-trigger-${props.href}`}>
      <KNav.Trigger as="a" href={props.href} class={cn(TRIGGER, props.class)}>
        {props.children}
      </KNav.Trigger>
    </KNav.Menu>
  )
}

/** Props of {@link NavigationMenuPanelLink}. */
export interface NavigationMenuPanelLinkProps {
  href: string
  title: string
  description?: string
  /** Leading icon element (e.g. a lucide icon). */
  icon?: JSX.Element
  /** Renders as a large highlighted card, typically spanning several grid rows. */
  featured?: boolean
  class?: string
}

/** A link inside a panel: icon + title + description, or a featured card. */
export function NavigationMenuPanelLink(props: NavigationMenuPanelLinkProps): JSX.Element {
  return (
    <KNav.Item
      href={props.href}
      class={cn(
        'flex gap-3 rounded-xl p-3 text-start no-underline outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
        props.featured
          ? 'flex-col justify-end bg-gradient-to-br from-primary/30 to-accent/20 hover:from-primary/40'
          : 'items-start hover:bg-muted data-[highlighted]:bg-muted',
        props.class,
      )}
    >
      <Show when={props.icon}>
        <span class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
          {props.icon}
        </span>
      </Show>
      <span class="min-w-0">
        <span class={cn('block font-medium text-foreground', props.featured ? 'text-base' : 'text-sm')}>
          {props.title}
        </span>
        <Show when={props.description}>
          <span class="mt-0.5 block text-xs leading-snug text-muted-foreground">{props.description}</span>
        </Show>
      </span>
    </KNav.Item>
  )
}
