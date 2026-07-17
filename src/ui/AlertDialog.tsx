// Confirmation dialog on Kobalte's AlertDialog primitive — centered modal,
// reuses the modal-overlay/modal-content keyframes from styles.css.
import { AlertDialog as KAlertDialog } from '@kobalte/core/alert-dialog'
import type { JSX, ParentProps } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../lib/cn'

interface AlertDialogProps extends ParentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  class?: string
}

export function AlertDialog(props: AlertDialogProps): JSX.Element {
  return (
    <KAlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <KAlertDialog.Portal>
        <KAlertDialog.Overlay class="modal-overlay fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" />
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <KAlertDialog.Content
            class={cn(
              'modal-content w-full max-w-md rounded-xl border border-border bg-card text-card-foreground shadow-sm',
              props.class,
            )}
          >
            <div class="p-6">
              <Show when={props.title}>
                <KAlertDialog.Title class="text-lg font-semibold leading-none tracking-tight">
                  {props.title}
                </KAlertDialog.Title>
              </Show>
              <KAlertDialog.Description class="mt-3 text-sm text-muted-foreground">
                {props.children}
              </KAlertDialog.Description>
            </div>
          </KAlertDialog.Content>
        </div>
      </KAlertDialog.Portal>
    </KAlertDialog>
  )
}
