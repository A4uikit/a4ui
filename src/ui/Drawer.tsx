// Edge-anchored slide-over (right by default; `side` picks left/top/bottom) on Kobalte's Dialog primitive (focus trap +
// presence for free, like Modal). The drawer-content class drives the
// slide-in/out keyframes in styles.css off Kobalte's data-expanded/data-closed.
// Pass a `title` for the sticky glass header, or omit it and render your own
// inside `children`.
// Namespace import on purpose: Kobalte's `AlertDialog` is built with Object.assign on the
// same `DialogRoot` function as `Dialog`, so `Dialog.Content` depends on module load order (#118).
// The named exports (`Root`, `Content`, ...) are not affected.
import * as Dialog from '@kobalte/core/dialog'
import { X } from 'lucide-solid'
import type { JSX, ParentProps } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../lib/cn'
import { portalDir } from '../lib/direction'

interface DrawerProps extends ParentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Sticky glass header title. Omit to render fully custom header content in `children`. */
  title?: string
  /** Small muted line under `title`; only shown when `title` is also set. */
  subtitle?: string
  class?: string
  /** Accessible label for the close button. @default 'Close' */
  closeLabel?: string
  /** Edge the panel is anchored to and slides in from. @default 'right' */
  side?: DrawerSide
  /**
   * Optional side panel shown next to the main content (e.g. a part drawing next to
   * its form). From `md` up the panel widens and the aside sits beside the content, on
   * the screen side of it (for `side="right"` it is on the left); below `md` it stacks
   * under the content. It lives inside the dialog, so the focus trap covers it and
   * working in it keeps the drawer open. Ignored layout-wise for `top` / `bottom`
   * (always stacked).
   */
  aside?: JSX.Element
}

// Row direction (md+) that puts the aside on the open-screen side of the content.
const ASIDE_ROW: Record<DrawerSide, string> = {
  right: 'md:flex-row-reverse rtl:md:flex-row',
  left: 'md:flex-row rtl:md:flex-row-reverse',
  end: 'md:flex-row-reverse',
  start: 'md:flex-row',
  top: '',
  bottom: '',
}

/**
 * `left` / `right` are physical edges. `start` / `end` follow the reading
 * direction (`start` is the right edge under `dir="rtl"`).
 */
export type DrawerSide = 'right' | 'left' | 'start' | 'end' | 'top' | 'bottom'

const SIDE: Record<DrawerSide, { wrap: string; panel: string; offscreen: string }> = {
  // `right` / `left` are physical and never flip; `end` / `start` follow the
  // reading direction (flex `justify-*` and `border-s/e` are logical, while the
  // slide offset uses `--dir-x`, which `[dir=rtl]` sets to -1 in tokens.css).
  right: {
    wrap: 'justify-end rtl:justify-start',
    panel: 'h-full w-full max-w-[520px] border-l',
    offscreen: 'translateX(100%)',
  },
  left: {
    wrap: 'justify-start rtl:justify-end',
    panel: 'h-full w-full max-w-[520px] border-r',
    offscreen: 'translateX(-100%)',
  },
  end: {
    wrap: 'justify-end',
    panel: 'h-full w-full max-w-[520px] border-s',
    offscreen: 'translateX(calc(100% * var(--dir-x, 1)))',
  },
  start: {
    wrap: 'justify-start',
    panel: 'h-full w-full max-w-[520px] border-e',
    offscreen: 'translateX(calc(-100% * var(--dir-x, 1)))',
  },
  top: {
    wrap: 'flex-col justify-start',
    panel: 'max-h-[85vh] w-full rounded-b-2xl border-b',
    offscreen: 'translateY(-100%)',
  },
  bottom: {
    wrap: 'flex-col justify-end',
    panel: 'max-h-[85vh] w-full rounded-t-2xl border-t',
    offscreen: 'translateY(100%)',
  },
}

export type { DrawerProps }

/**
 * Edge-anchored slide-over panel (right by default, or `side="left" | "start" | "end" | "top" | "bottom"`) built on Kobalte's `Dialog` (focus trap, portal,
 * and open/close presence handled for you). Use for create/edit forms or detail
 * panels that need more room than a centered `Modal`.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = createSignal(false)
 * <Drawer open={open()} onOpenChange={setOpen} title="Edit invoice">
 *   <p>Drawer content…</p>
 * </Drawer>
 * ```
 */
export function Drawer(props: DrawerProps): JSX.Element {
  const side = (): (typeof SIDE)[DrawerSide] => SIDE[props.side ?? 'right']
  const sideKey = (): DrawerSide => props.side ?? 'right'
  const horizontal = () => sideKey() !== 'top' && sideKey() !== 'bottom'
  const header = () => (
    <Show when={props.title}>
      <div class="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/90 px-5 py-4 backdrop-blur">
        <div>
          <Dialog.Title class="text-[16px] font-bold leading-tight">{props.title}</Dialog.Title>
          <Show when={props.subtitle}>
            <p class="text-[12px] text-muted-foreground">{props.subtitle}</p>
          </Show>
        </div>
        <Dialog.CloseButton
          class="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label={props.closeLabel ?? 'Close'}
        >
          <X class="h-5 w-5" />
        </Dialog.CloseButton>
      </div>
    </Show>
  )
  return (
    <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Dialog.Portal ref={portalDir}>
        <Dialog.Overlay class="modal-overlay fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]" />
        <div class={cn('fixed inset-0 z-50 flex', side().wrap)}>
          <Dialog.Content
            data-side={props.side ?? 'right'}
            style={{ '--drawer-offscreen': side().offscreen }}
            data-aside={props.aside ? '' : undefined}
            class={cn(
              'drawer-content flex flex-col overflow-y-auto border-border bg-glass shadow-2xl',
              side().panel,
              props.aside &&
                horizontal() && ['md:max-w-[min(1080px,100vw)] md:flex-row', ASIDE_ROW[sideKey()]],
              props.class,
            )}
          >
            <Show
              when={props.aside}
              fallback={
                <>
                  {header()}
                  {props.children}
                </>
              }
            >
              <div
                data-drawer-main
                class={cn(
                  'flex min-w-0 flex-col',
                  horizontal() && 'md:w-[520px] md:shrink-0 md:overflow-y-auto',
                )}
              >
                {header()}
                {props.children}
              </div>
              <div
                data-drawer-aside
                class={cn(
                  'min-w-0 border-t border-border p-3',
                  horizontal() && 'md:flex-1 md:overflow-y-auto md:border-t-0',
                )}
              >
                {props.aside}
              </div>
            </Show>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
