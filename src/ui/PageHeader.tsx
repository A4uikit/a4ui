// Consistent page header: optional breadcrumb (last crumb highlighted), title,
// subtitle, and a right-aligned actions slot.
import { For, Show, type JSX } from 'solid-js'

interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Trail of crumb labels, in order; the last one is rendered highlighted as the current page. */
  breadcrumb?: string[]
  /** Right-aligned slot for page-level actions (buttons, menus, etc.). */
  actions?: JSX.Element
}

/**
 * Consistent top-of-page header: optional breadcrumb trail, title, subtitle,
 * and a right-aligned actions slot. Use at the top of a route/page for a
 * uniform layout across the app.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Invoices"
 *   subtitle="Manage billing documents"
 *   breadcrumb={['Home', 'Billing', 'Invoices']}
 *   actions={<Button>New invoice</Button>}
 * />
 * ```
 */
export function PageHeader(props: PageHeaderProps): JSX.Element {
  return (
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Show when={props.breadcrumb?.length}>
          <div class="flex items-center gap-2 text-[12px] text-muted-foreground">
            <For each={props.breadcrumb}>
              {(crumb, i) => (
                <>
                  <Show when={i() > 0}>
                    {/* Same "/" separator as the standalone Breadcrumb component. */}
                    <span class="text-muted-foreground/60">/</span>
                  </Show>
                  <span classList={{ 'text-foreground': i() === (props.breadcrumb?.length ?? 0) - 1 }}>{crumb}</span>
                </>
              )}
            </For>
          </div>
        </Show>
        <h1 class="mt-1 text-2xl font-bold tracking-tight">{props.title}</h1>
        <Show when={props.subtitle}>
          <p class="mt-0.5 text-[13px] text-muted-foreground">{props.subtitle}</p>
        </Show>
      </div>
      <Show when={props.actions}>
        <div class="flex items-center gap-2">{props.actions}</div>
      </Show>
    </div>
  )
}
