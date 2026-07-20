// Configurator — a data-driven "pick options -> live preview + running total"
// builder. Distilled from two templates that hand-rolled the same shape: a
// laser-engraving customizer (text + product/style pickers) and a charcuterie
// board builder (size + per-item counters). Controlled: the parent owns the
// state object; the Configurator renders the group controls, a live summary
// with a running total, and an optional preview render-prop.
import type { JSX } from 'solid-js'
import { createMemo, For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Button } from './Button'

/** A selectable option in a `'select'` group. */
export interface ConfiguratorOption {
  value: string
  label: string
  /** Added to the running total when selected. */
  price?: number
}
/** A countable item in a `'counter'` group (each with a +/- stepper). */
export interface ConfiguratorItem {
  id: string
  label: string
  /** Added to the total as `price * qty`. */
  price?: number
}

/** One group of controls. `select` = single choice, `counter` = quantities, `text` = free text. */
export type ConfiguratorGroup =
  | { type: 'select'; name: string; label: string; options: ConfiguratorOption[] }
  | { type: 'counter'; name: string; label: string; items: ConfiguratorItem[] }
  | { type: 'text'; name: string; label: string; placeholder?: string; maxLength?: number }

/** The configurator's state: keyed by group `name`. select/text -> string, counter -> `{ [id]: qty }`. */
export type ConfiguratorState = Record<string, string | Record<string, number>>

export interface ConfiguratorProps {
  groups: ConfiguratorGroup[]
  value: ConfiguratorState
  onChange: (next: ConfiguratorState) => void
  /** Format the running total. @default `n => $${n}` */
  formatTotal?: (total: number) => string
  /** Live preview, rendered beside the controls; receives the state and running total. */
  preview?: (state: ConfiguratorState, total: number) => JSX.Element
  /** CTA under the summary (e.g. "add to cart" / "request quote"). */
  action?: { label: string; onClick?: () => void; href?: string }
  class?: string
}

const asString = (v: string | Record<string, number> | undefined): string => (typeof v === 'string' ? v : '')
const asCounts = (v: string | Record<string, number> | undefined): Record<string, number> =>
  v && typeof v === 'object' ? v : {}

/**
 * Data-driven product configurator: declare `groups` (select / counter / text),
 * hold the `value` state in the parent, and get option pickers, quantity
 * steppers, a live summary with a running total, and an optional `preview`.
 * Engine-free, fully typed.
 *
 * @example
 * ```tsx
 * const [cfg, setCfg] = createSignal<ConfiguratorState>({ size: 'm', extras: {} })
 * <Configurator
 *   value={cfg()}
 *   onChange={setCfg}
 *   groups={[
 *     { type: 'select', name: 'size', label: 'Tamaño', options: [
 *       { value: 's', label: 'Chico', price: 320 }, { value: 'm', label: 'Mediano', price: 620 } ] },
 *     { type: 'counter', name: 'extras', label: 'Extras', items: [
 *       { id: 'jamon', label: 'Jamón serrano', price: 90 } ] },
 *     { type: 'text', name: 'nota', label: 'Nota', placeholder: 'Para grabar…' },
 *   ]}
 *   preview={(state, total) => <MyPreview state={state} total={total} />}
 *   action={{ label: 'Solicitar', onClick: submit }}
 * />
 * ```
 */
export function Configurator(props: ConfiguratorProps): JSX.Element {
  const fmt = (n: number): string => (props.formatTotal ?? ((x: number) => `$${x}`))(n)

  const total = createMemo(() => {
    let sum = 0
    for (const g of props.groups) {
      if (g.type === 'select') {
        const chosen = asString(props.value[g.name])
        sum += g.options.find((o) => o.value === chosen)?.price ?? 0
      } else if (g.type === 'counter') {
        const counts = asCounts(props.value[g.name])
        for (const it of g.items) sum += (it.price ?? 0) * (counts[it.id] ?? 0)
      }
    }
    return sum
  })

  const setSelect = (name: string, value: string): void => props.onChange({ ...props.value, [name]: value })
  const setCount = (name: string, id: string, qty: number): void => {
    const counts = { ...asCounts(props.value[name]) }
    if (qty <= 0) delete counts[id]
    else counts[id] = qty
    props.onChange({ ...props.value, [name]: counts })
  }
  const setText = (name: string, value: string): void => props.onChange({ ...props.value, [name]: value })

  const controls = (
    <div class="space-y-6">
      <For each={props.groups}>
        {(g) => (
          <div>
            <p class="mb-2 text-sm font-medium text-foreground">{g.label}</p>
            <Show when={g.type === 'select' && g}>
              {(sel) => (
                <div class="flex flex-wrap gap-2">
                  <For each={sel().options}>
                    {(o) => (
                      <button
                        type="button"
                        aria-pressed={asString(props.value[sel().name]) === o.value}
                        onClick={() => setSelect(sel().name, o.value)}
                        class={cn(
                          'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                          asString(props.value[sel().name]) === o.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {o.label}
                        <Show when={o.price}>
                          <span class="ml-1 opacity-70">· {fmt(o.price as number)}</span>
                        </Show>
                      </button>
                    )}
                  </For>
                </div>
              )}
            </Show>
            <Show when={g.type === 'counter' && g}>
              {(cnt) => (
                <div class="space-y-2">
                  <For each={cnt().items}>
                    {(it) => {
                      const qty = (): number => asCounts(props.value[cnt().name])[it.id] ?? 0
                      return (
                        <div class="flex items-center justify-between gap-3">
                          <span class="text-sm text-foreground">
                            {it.label}
                            <Show when={it.price}>
                              <span class="ml-1 text-muted-foreground">· {fmt(it.price as number)}</span>
                            </Show>
                          </span>
                          <div class="flex items-center gap-2">
                            <Button
                              variant="outline"
                              aria-label={`Quitar ${it.label}`}
                              onClick={() => setCount(cnt().name, it.id, qty() - 1)}
                              class="h-8 w-8 p-0"
                            >
                              −
                            </Button>
                            <span class="w-6 text-center text-sm tabular-nums">{qty()}</span>
                            <Button
                              variant="outline"
                              aria-label={`Agregar ${it.label}`}
                              onClick={() => setCount(cnt().name, it.id, qty() + 1)}
                              class="h-8 w-8 p-0"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      )
                    }}
                  </For>
                </div>
              )}
            </Show>
            <Show when={g.type === 'text' && g}>
              {(txt) => (
                <input
                  type="text"
                  value={asString(props.value[txt().name])}
                  maxLength={txt().maxLength}
                  placeholder={txt().placeholder}
                  aria-label={txt().label}
                  onInput={(e) => setText(txt().name, e.currentTarget.value)}
                  class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}
            </Show>
          </div>
        )}
      </For>

      <div class="flex items-center justify-between border-t border-border pt-4">
        <span class="text-sm text-muted-foreground">Total</span>
        <span class="text-lg font-semibold text-foreground tabular-nums">{fmt(total())}</span>
      </div>
      <Show when={props.action}>
        {(a) => (
          <Button ripple href={a().href} onClick={() => a().onClick?.()} class="w-full justify-center">
            {a().label}
          </Button>
        )}
      </Show>
    </div>
  )

  return (
    <div class={cn('grid gap-6', props.preview ? 'md:grid-cols-2' : '', props.class)}>
      {controls}
      <Show when={props.preview}>
        <div class="min-w-0">{props.preview?.(props.value, total())}</div>
      </Show>
    </div>
  )
}
