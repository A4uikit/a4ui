// Right-to-left support: one provider that sets `dir` on the DOM and tells
// Kobalte which direction to use for keyboard navigation.
import { I18nProvider, getReadingDirection } from '@kobalte/core/i18n'
import { type Accessor, type JSX, createMemo, splitProps, useContext } from 'solid-js'

import { type Direction, DirectionContext } from '../lib/direction'
import { cn } from '../lib/cn'

export type { Direction }

/** Props for {@link DirectionProvider}. */
export interface DirectionProviderProps {
  /**
   * Text direction. When omitted it is derived from `locale`; when both are
   * omitted it is `'ltr'`.
   */
  dir?: Direction
  /**
   * BCP 47 locale (for example `'ar'`, `'he-IL'`). Forwarded to Kobalte for
   * number/date formatting and collation. Its reading direction must agree
   * with `dir`; a mismatch throws.
   */
  locale?: string
  /** Extra classes for the wrapper element. */
  class?: string
  children?: JSX.Element
}

/**
 * Sets the reading direction for everything inside it.
 *
 * - Renders a `display: contents` wrapper carrying the `dir` attribute, so
 *   Tailwind logical utilities (`ms-*`, `start-*`, `text-start`) and the
 *   browser's bidi handling follow it.
 * - Wraps Kobalte's `I18nProvider`, so arrow keys in Tabs, Menubar, Slider,
 *   menus and the like reverse under `rtl`.
 * - Overlays that portal out to `<body>` (Modal, Drawer, Popover, Dropdown,
 *   Toast, ...) copy the direction onto their own container.
 *
 * Without a provider nothing changes: components inherit `dir` from the page
 * (set `<html dir="rtl">` yourself in that case).
 *
 * @example
 * ```tsx
 * <DirectionProvider dir="rtl" locale="ar">
 *   <App />
 * </DirectionProvider>
 * ```
 */
export function DirectionProvider(props: DirectionProviderProps): JSX.Element {
  const [local] = splitProps(props, ['dir', 'locale', 'class', 'children'])
  const resolved = createMemo<Direction>(() => {
    const fromLocale = local.locale ? getReadingDirection(local.locale) : undefined
    if (local.dir && fromLocale && local.dir !== fromLocale) {
      throw new Error(
        `DirectionProvider: dir="${local.dir}" conflicts with locale "${local.locale}" (reading direction "${fromLocale}").`,
      )
    }
    return local.dir ?? fromLocale ?? 'ltr'
  })
  const locale = createMemo(() => local.locale ?? (resolved() === 'rtl' ? 'ar' : 'en-US'))
  return (
    <DirectionContext.Provider value={resolved}>
      <I18nProvider locale={locale()}>
        <div dir={resolved()} lang={local.locale} class={cn('contents', local.class)}>
          {local.children}
        </div>
      </I18nProvider>
    </DirectionContext.Provider>
  )
}

/**
 * Accessor of the current direction: the nearest {@link DirectionProvider}'s,
 * or outside one the `dir` attribute of `<html>` (`'ltr'` when unset).
 */
export function useDirection(): Accessor<Direction> {
  const ctx = useContext(DirectionContext)
  if (ctx) return ctx
  return () =>
    typeof document !== 'undefined' && document.documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr'
}
