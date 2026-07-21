// Dock — macOS-style app dock. A horizontal glass pill of icon buttons that
// magnify toward the cursor (closest item biggest, tapering over a fixed
// radius), driven by direct transform + CSS transition (scale only, so it
// stays on the compositor). No-op magnify under reduced motion — icons stay
// static but remain clickable.
import { For, Show, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

/** Px radius from the cursor within which items magnify; beyond it, scale is 1×. */
const FALLOFF_PX = 120
/** Peak scale applied to the item directly under the cursor. */
const PEAK_SCALE = 1.6

export interface DockItem {
  icon: JSX.Element
  label?: string
  onClick?: (e: MouseEvent) => void
  href?: string
}

export interface DockProps {
  items: DockItem[]
  class?: string
}

/**
 * macOS-style dock: a glass pill of icon buttons that magnify based on
 * horizontal distance to the cursor. Scale-only transform (`transform-origin:
 * bottom`), reset to 1× on pointerleave. Respects `prefers-reduced-motion`
 * (renders static, still fully clickable/keyboard-focusable).
 *
 * @example
 * ```tsx
 * import { Home, Search, Settings } from 'lucide-solid'
 *
 * <Dock
 *   items={[
 *     { icon: <Home size={22} />, label: 'Home', onClick: () => {} },
 *     { icon: <Search size={22} />, label: 'Search', onClick: () => {} },
 *     { icon: <Settings size={22} />, label: 'Settings', href: '/settings' },
 *   ]}
 * />
 * ```
 */
export function Dock(props: DockProps): JSX.Element {
  const itemEls: (HTMLElement | undefined)[] = []

  const handlePointerMove = (event: PointerEvent): void => {
    if (motionReduced()) return

    for (const el of itemEls) {
      if (!el) continue
      const rect = el.getBoundingClientRect()
      const center = rect.left + rect.width / 2
      const distance = Math.abs(event.clientX - center)
      const scale = 1 + (PEAK_SCALE - 1) * Math.max(0, 1 - distance / FALLOFF_PX)
      el.style.transform = `scale(${scale})`
    }
  }

  const handlePointerLeave = (): void => {
    for (const el of itemEls) {
      if (el) el.style.transform = 'scale(1)'
    }
  }

  return (
    <div
      class={cn(
        'inline-flex items-end gap-2 rounded-2xl border border-border bg-card/70 px-3 py-2 backdrop-blur',
        props.class,
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <For each={props.items}>
        {(item, i) => {
          const shared = {
            ref: (el: HTMLElement) => {
              itemEls[i()] = el
            },
            class:
              'group relative inline-flex h-11 w-11 shrink-0 origin-bottom items-center justify-center rounded-xl text-foreground transition-transform duration-150 ease-out will-change-transform hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'aria-label': item.label,
            onClick: item.onClick,
          }

          return (
            <Show
              when={item.href}
              fallback={
                <button type="button" {...shared}>
                  {item.icon}
                  <Show when={item.label}>
                    <span
                      aria-hidden="true"
                      class="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md border border-border bg-card px-2 py-1 text-xs whitespace-nowrap text-card-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      {item.label}
                    </span>
                  </Show>
                </button>
              }
            >
              <a href={item.href} {...shared}>
                {item.icon}
                <Show when={item.label}>
                  <span
                    aria-hidden="true"
                    class="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md border border-border bg-card px-2 py-1 text-xs whitespace-nowrap text-card-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    {item.label}
                  </span>
                </Show>
              </a>
            </Show>
          )
        }}
      </For>
    </div>
  )
}
