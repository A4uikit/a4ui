// Dialog on Kobalte's Dialog primitive. Two shapes via `variant`:
//   - 'drawer' (default): right-anchored slide-over — create/edit forms, detail
//     panels (more vertical room, less jarring than a centered pop).
//   - 'center': the classic centered modal — short confirmations (destructive
//     yes/no) where a full-height drawer would be overkill.
// The .drawer-content / .modal-content classes drive the slide/scale keyframes
// (styles.css) off Kobalte's data-expanded/data-closed presence tracking.
import { Dialog } from '@kobalte/core/dialog'
import { X } from 'lucide-solid'
import type { JSX, ParentProps } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../lib/cn'

interface ModalProps extends ParentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Header title; omitting it hides the whole header bar. */
  title?: string
  /**
   * `'drawer'` (default): right-anchored slide-over, more room, less jarring —
   * use for forms/detail panels. `'center'`: classic centered modal — use for
   * short confirmations (e.g. destructive yes/no).
   * @default 'drawer'
   */
  variant?: 'drawer' | 'center'
  class?: string
  /** Accessible label for the close button. @default 'Close' */
  closeLabel?: string
}

/**
 * Dialog on Kobalte's `Dialog` primitive (focus trap, portal, presence handled
 * for you), rendered as either a slide-over drawer or a centered modal depending
 * on `variant`.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = createSignal(false)
 * <Modal open={open()} onOpenChange={setOpen} variant="center" title="Delete item?">
 *   <p>This action cannot be undone.</p>
 * </Modal>
 * ```
 */
export function Modal(props: ModalProps): JSX.Element {
  const isCenter = () => props.variant === 'center'
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay class="modal-overlay fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" />
        <Show
          when={isCenter()}
          fallback={
            <div class="fixed inset-0 z-50 flex justify-end">
              <Dialog.Content
                class={cn(
                  'drawer-content bg-glass flex h-full w-full max-w-[520px] flex-col overflow-y-auto border-l border-border text-card-foreground shadow-2xl',
                  props.class,
                )}
              >
                <Show when={props.title}>
                  <div class="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/85 px-6 py-4 backdrop-blur">
                    <Dialog.Title class="text-lg font-semibold leading-none tracking-tight">
                      {props.title}
                    </Dialog.Title>
                    <Dialog.CloseButton
                      class="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      aria-label={props.closeLabel ?? 'Close'}
                    >
                      <X class="h-5 w-5" />
                    </Dialog.CloseButton>
                  </div>
                </Show>
                <div class="p-6 pt-4">{props.children}</div>
              </Dialog.Content>
            </div>
          }
        >
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Content
              class={cn(
                'modal-content w-full max-w-lg rounded-xl border border-border bg-card text-card-foreground shadow-sm',
                props.class,
              )}
            >
              <Show when={props.title}>
                <div class="flex items-center justify-between border-b border-border p-6 pb-4">
                  <Dialog.Title class="text-lg font-semibold leading-none tracking-tight">
                    {props.title}
                  </Dialog.Title>
                  <Dialog.CloseButton class="text-muted-foreground hover:text-foreground" aria-label={props.closeLabel ?? 'Close'}>
                    ✕
                  </Dialog.CloseButton>
                </div>
              </Show>
              <div class="p-6 pt-4">{props.children}</div>
            </Dialog.Content>
          </div>
        </Show>
      </Dialog.Portal>
    </Dialog>
  )
}
