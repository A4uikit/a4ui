// SiteFooter — the bottom of a marketing site: brand and tagline, link columns,
// social links and a copyright line.
import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import type { SectionLink } from './internal/sectionKit'
import { SOCIAL_LABEL, SocialIcon, type SocialNetwork } from './internal/socialIcons'

export type { SocialNetwork }

/** A titled group of links in a {@link SiteFooter}. */
export interface FooterColumn {
  title: string
  links: SectionLink[]
}

/** A social profile link in a {@link SiteFooter}. */
export interface SocialLink {
  network: SocialNetwork
  href: string
}

export interface SiteFooterProps {
  brand: string
  /** One line under the brand. */
  tagline?: string
  columns?: FooterColumn[]
  social?: SocialLink[]
  /** Copyright line. Defaults to `© <current year> <brand>`. */
  copyright?: string
  class?: string
}

/**
 * Site footer: brand and tagline, columns of links, social network icons and a
 * copyright line on a glass band. Columns wrap to two per row on phones.
 *
 * @example
 * ```tsx
 * <SiteFooter
 *   brand="Northwind"
 *   tagline="Websites for small businesses."
 *   columns={[{ title: 'Company', links: [{ label: 'About', href: '/about' }] }]}
 *   social={[{ network: 'instagram', href: 'https://instagram.com/northwind' }]}
 * />
 * ```
 */
export function SiteFooter(props: SiteFooterProps): JSX.Element {
  const copyright = () => props.copyright ?? `© ${new Date().getFullYear()} ${props.brand}`
  return (
    <footer class={cn('bg-glass w-full border-t border-border/60 backdrop-blur-xl', props.class)}>
      <div class="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-14">
        <div class="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div class="flex max-w-xs flex-col gap-3">
            <p class="text-lg font-semibold tracking-tight text-foreground">{props.brand}</p>
            <Show when={props.tagline}>
              <p class="text-sm text-muted-foreground">{props.tagline}</p>
            </Show>
          </div>
          <Show when={props.columns?.length}>
            <div class="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-16">
              <For each={props.columns}>
                {(column) => (
                  <nav aria-label={column.title} class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-foreground">{column.title}</p>
                    <ul class="flex flex-col gap-2">
                      <For each={column.links}>
                        {(link) => (
                          <li>
                            <a
                              href={link.href}
                              class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                              {link.label}
                            </a>
                          </li>
                        )}
                      </For>
                    </ul>
                  </nav>
                )}
              </For>
            </div>
          </Show>
        </div>
        <div class="flex flex-col-reverse items-start gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-xs text-muted-foreground">{copyright()}</p>
          <Show when={props.social?.length}>
            <ul class="flex flex-wrap gap-1">
              <For each={props.social}>
                {(item) => (
                  <li>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={SOCIAL_LABEL[item.network]}
                      class="grid h-10 w-10 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <SocialIcon network={item.network} class="h-4 w-4" />
                    </a>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </div>
      </div>
    </footer>
  )
}
