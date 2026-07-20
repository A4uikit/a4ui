// Content image with an optional click-to-zoom lightbox, built on Kobalte's
// Dialog primitive. The thumbnail lazy-loads; when `preview` is on it becomes a
// button that opens a dimmed, backdrop-blurred overlay with an enlarged copy of
// the image and a corner close button (focus trap/portal handled by Kobalte).
import { Dialog } from '@kobalte/core/dialog'
import { X } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createSignal, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface ImageProps {
  src: string
  alt: string
  class?: string
  /** When true, clicking the image opens a zoomable lightbox. @default true */
  preview?: boolean
  /**
   * Reveal the thumbnail with a blur-up: it starts blurred and slightly scaled,
   * then eases to sharp once the image finishes loading. Pure CSS transition,
   * no-op under reduced motion. @default false
   */
  blurUp?: boolean
}

/**
 * Lazy-loaded content image. Unless `preview` is disabled, the thumbnail is a
 * zoom-in button that opens a centered lightbox (dimmed overlay + close button)
 * on Kobalte's `Dialog` primitive.
 *
 * @example
 * ```tsx
 * <Image src="/photo.jpg" alt="A scenic view" />
 * <Image src="/logo.svg" alt="Logo" preview={false} />
 * ```
 */
export function Image(props: ImageProps): JSX.Element {
  const [open, setOpen] = createSignal(false)
  const preview = () => props.preview !== false

  // blur-up: hidden behind the blur until `load` fires (or immediately, if the
  // image is already cached or reduced motion is on).
  const [loaded, setLoaded] = createSignal(false)
  const blurUp = () => props.blurUp === true && !motionReduced()
  const revealed = () => !blurUp() || loaded()

  const img = (
    <img
      src={props.src}
      alt={props.alt}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      ref={(el) => {
        // A cached image can be complete before `onLoad` binds — reveal it now.
        if (el.complete) setLoaded(true)
      }}
      class={cn(
        'rounded-lg object-cover',
        blurUp() && 'transition-[filter,transform] duration-500 ease-out',
        blurUp() && !revealed() && 'scale-[1.03] blur-lg',
        props.class,
      )}
    />
  )

  return (
    <Show when={preview()} fallback={img}>
      <button type="button" class="cursor-zoom-in" aria-label={props.alt} onClick={() => setOpen(true)}>
        {img}
      </button>
      <Dialog open={open()} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" />
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Content role="dialog" class="relative">
              <img
                src={props.src}
                alt={props.alt}
                class="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
              />
              <Dialog.CloseButton
                class="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-background/70 text-foreground transition hover:bg-muted"
                aria-label="Close"
              >
                <X class="h-5 w-5" />
              </Dialog.CloseButton>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog>
    </Show>
  )
}
