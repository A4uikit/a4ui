// Input + Apply button with explicit idle/loading/success/error states.
// Rejected coupons surface as { ok: false } and render inline; unexpected
// rejections from `onApply` are not caught here, so they propagate as
// unhandled rejections instead of being silently swallowed.
import { CircleCheck, X } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createSignal, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Button } from './Button'
import { Input } from './Input'
import { Spinner } from './Spinner'

export interface CouponFieldProps {
  /** Validate/apply a coupon code. Resolve with `{ ok: false }` for a rejected
   * code — do not throw for expected rejections, only for unexpected failures. */
  onApply: (code: string) => Promise<{ ok: boolean; message?: string; discount?: string }>
  placeholder?: string
  class?: string
}

type State =
  | { status: 'idle' | 'loading' }
  | { status: 'success'; code: string; discount?: string }
  | { status: 'error'; message: string }

/**
 * Coupon/promo code input with an "Apply" button. Tracks explicit
 * idle/loading/success/error state: loading shows a spinner and disables the
 * input, success shows the applied discount with a way to remove it and try
 * another code, error shows the failure message inline and lets the user retry.
 * Rejections are read from the resolved `{ ok: false }` result, not caught
 * exceptions — an unexpected throw from `onApply` propagates uncaught.
 *
 * @example
 * ```tsx
 * <CouponField
 *   onApply={async (code) => {
 *     const res = await api.applyCoupon(code)
 *     return res.valid
 *       ? { ok: true, discount: '-$10' }
 *       : { ok: false, message: 'That code has expired.' }
 *   }}
 * />
 * ```
 */
export function CouponField(props: CouponFieldProps): JSX.Element {
  const [code, setCode] = createSignal('')
  const [state, setState] = createSignal<State>({ status: 'idle' })

  const apply = async (): Promise<void> => {
    const value = code().trim()
    if (!value || state().status === 'loading') return
    setState({ status: 'loading' })
    const result = await props.onApply(value)
    if (result.ok) {
      setState({ status: 'success', code: value, discount: result.discount })
    } else {
      setState({ status: 'error', message: result.message ?? 'This code could not be applied.' })
    }
  }

  const remove = (): void => {
    setCode('')
    setState({ status: 'idle' })
  }

  const isLoading = () => state().status === 'loading'
  const isSuccess = () => state().status === 'success'

  return (
    <div class={cn('flex flex-col gap-2', props.class)}>
      <Show
        when={!isSuccess()}
        fallback={
          <div class="flex items-center justify-between rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm">
            <span class="flex items-center gap-2 text-emerald-500">
              <CircleCheck class="h-4 w-4 shrink-0" />
              <span class="text-foreground">
                {(state() as { status: 'success'; code: string; discount?: string }).discount ?? 'Discount'}{' '}
                applied
              </span>
            </span>
            <button
              type="button"
              aria-label="Remove coupon"
              onClick={remove}
              class="text-muted-foreground hover:text-foreground"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        }
      >
        <div class="flex gap-2">
          <Input
            value={code()}
            onInput={setCode}
            disabled={isLoading()}
            placeholder={props.placeholder ?? 'Coupon code'}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter') {
                ev.preventDefault()
                void apply()
              }
            }}
          />
          <Button variant="outline" disabled={isLoading() || !code().trim()} onClick={() => void apply()}>
            <Show when={isLoading()} fallback="Apply">
              <Spinner class="h-4 w-4" label="Applying coupon" />
            </Show>
          </Button>
        </div>
        <Show when={state().status === 'error'}>
          <p class="text-sm text-destructive">{(state() as { status: 'error'; message: string }).message}</p>
        </Show>
      </Show>
    </div>
  )
}
