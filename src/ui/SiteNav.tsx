// SiteNav — the top navigation bar of a marketing site: brand, links, an
// optional call-to-action, and a disclosure menu below `md`.
import { Menu, X } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createSignal, createUniqueId, For, onCleanup, onMount, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Button } from './Button'
import type { SectionLink } from './internal/sectionKit'
import { useOverlayEnvironment } from '../lib/portalMount'

export interface SiteNavProps {
  /** Brand name shown at the left; also the home link's text. */
  brand: string
  /** Logo image URL shown before the brand name. */
  logo?: string
  /** Where the brand links to. Defaults to `'/'`. */
  brandHref?: string
  /** Navigation links, in order. */
  links: SectionLink[]
  /** Call-to-action button at the right (and at the bottom of the mobile menu). */
  cta?: SectionLink
  /** Stick to the top of the viewport while scrolling. Defaults to `true`. */
  sticky?: boolean
  /** Accessible label of the mobile menu button. Defaults to `'Menu'`. */
  menuLabel?: string
  class?: string
}

const LINK =
  'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'

/**
 * Top navigation bar for a marketing site: brand (with optional logo), links and
 * a call-to-action on a frosted glass bar. Below the `md` breakpoint the links
 * collapse into a menu button that opens a panel under the bar; it closes on
 * Escape, on outside click and when a link is followed.
 *
 * @example
 * ```tsx
 * <SiteNav
 *   brand="Northwind"
 *   links={[{ label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' }]}
 *   cta={{ label: 'Get started', href: '/signup' }}
 * />
 * ```
 */
export function SiteNav(props: SiteNavProps): JSX.Element {
  const env = useOverlayEnvironment()
  const [open, setOpen] = createSignal(false)
  const panelId = createUniqueId()
  let root: HTMLElement | undefined

  onMount(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onDown = (event: PointerEvent) => {
      if (open() && root && !root.contains(event.target as Node)) setOpen(false)
    }
    env.doc().addEventListener('keydown', onKey)
    env.doc().addEventListener('pointerdown', onDown)
    onCleanup(() => {
      env.doc().removeEventListener('keydown', onKey)
      env.doc().removeEventListener('pointerdown', onDown)
    })
  })

  return (
    <header
      ref={root}
      class={cn(
        'bg-glass z-40 w-full border-b border-border/60 backdrop-blur-xl',
        props.sticky !== false && 'sticky top-0',
        props.class,
      )}
    >
      <nav
        aria-label="Main"
        class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5"
      >
        <a href={props.brandHref ?? '/'} class="flex min-w-0 items-center gap-2 text-foreground">
          <Show when={props.logo}>
            <img src={props.logo} alt="" class="h-8 w-8 shrink-0 rounded-md object-contain" />
          </Show>
          <span class="truncate text-base font-semibold tracking-tight">{props.brand}</span>
        </a>

        <ul class="hidden items-center gap-1 md:flex">
          <For each={props.links}>
            {(link) => (
              <li>
                <a href={link.href} class={LINK}>
                  {link.label}
                </a>
              </li>
            )}
          </For>
        </ul>

        <div class="flex items-center gap-2">
          <Show when={props.cta}>
            {(cta) => (
              <Button href={cta().href} class="hidden md:inline-flex">
                {cta().label}
              </Button>
            )}
          </Show>
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring md:hidden"
            aria-label={props.menuLabel ?? 'Menu'}
            aria-expanded={open()}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          >
            <Show when={open()} fallback={<Menu class="h-5 w-5" aria-hidden="true" />}>
              <X class="h-5 w-5" aria-hidden="true" />
            </Show>
          </button>
        </div>
      </nav>

      <div id={panelId} hidden={!open()} class="border-t border-border/60 md:hidden">
        <ul class="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3">
          <For each={props.links}>
            {(link) => (
              <li>
                <a href={link.href} class={cn(LINK, 'block py-3 text-base')} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            )}
          </For>
          <Show when={props.cta}>
            {(cta) => (
              <li class="pt-2">
                <Button href={cta().href} class="w-full" onClick={() => setOpen(false)}>
                  {cta().label}
                </Button>
              </li>
            )}
          </Show>
        </ul>
      </div>
    </header>
  )
}
