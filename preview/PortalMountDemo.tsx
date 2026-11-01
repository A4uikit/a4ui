// Docs demo for PortalMountProvider: renders a4ui into a same-origin iframe from
// this page, the way a visual editor renders its canvas, so the overlays open
// inside the frame. Also the fixture for tests/portal-mount.spec.ts.
import { createSignal, onCleanup, Show, type JSX } from 'solid-js'
import { DelegatedEvents, delegateEvents, Portal as SolidPortal } from 'solid-js/web'

import * as UI from '../src'

/** Copy this page's stylesheets and theme attribute into the frame, and keep the theme in sync. */
function mirrorStyles(frame: Document): () => void {
  for (const node of document.querySelectorAll('style, link[rel="stylesheet"]')) {
    frame.head.append(frame.importNode(node, true))
  }
  const syncTheme = () => {
    const theme = document.documentElement.getAttribute('data-theme')
    if (theme) frame.documentElement.setAttribute('data-theme', theme)
    else frame.documentElement.removeAttribute('data-theme')
  }
  syncTheme()
  const observer = new MutationObserver(syncTheme)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

function FrameContent(): JSX.Element {
  const [modal, setModal] = createSignal(false)
  return (
    <div class="flex flex-wrap items-start gap-3 p-4" data-testid="frame-content">
      <UI.Button onClick={() => setModal(true)}>Open modal</UI.Button>
      <UI.Modal open={modal()} onOpenChange={setModal} title="Inside the frame">
        <p class="text-sm text-muted-foreground">This dialog is portaled into the iframe body.</p>
      </UI.Modal>
      <UI.Popover trigger={<span class="rounded-md border border-border px-3 py-2 text-sm">Popover</span>}>
        <p class="p-1 text-sm">Popover content</p>
      </UI.Popover>
      <UI.Tooltip content="Tooltip content">
        <span class="rounded-md px-3 py-2 text-sm">Hover me</span>
      </UI.Tooltip>
      <div class="w-56">
        <UI.DateField label="Date" />
      </div>
      {/* Makes the frame scroll, so anchored panels can be seen following their trigger. */}
      <p class="h-[40rem] w-full pt-6 text-xs text-muted-foreground">Scroll inside the frame.</p>
    </div>
  )
}

/** An iframe whose body renders a4ui overlays inside a PortalMountProvider. */
export function PortalMountDemo(): JSX.Element {
  const [body, setBody] = createSignal<HTMLElement>()
  let stopMirror: (() => void) | undefined
  onCleanup(() => stopMirror?.())

  const onLoad = (event: Event) => {
    const frame = (event.currentTarget as HTMLIFrameElement).contentDocument
    if (!frame) throw new Error('PortalMountDemo: iframe has no contentDocument (not same-origin?)')
    stopMirror = mirrorStyles(frame)
    // Solid delegates events on the document that loaded it; the frame needs its own.
    delegateEvents([...DelegatedEvents], frame)
    frame.body.className = 'bg-background text-foreground'
    setBody(frame.body)
  }

  return (
    <div class="w-full">
      <iframe
        title="Canvas"
        data-testid="portal-mount-frame"
        srcdoc="<!doctype html><html><head><meta charset='utf-8'></head><body></body></html>"
        class="h-[26rem] w-full rounded-lg border border-border"
        onLoad={onLoad}
      />
      <Show when={body()}>
        {(mount) => (
          <SolidPortal mount={mount()}>
            <UI.PortalMountProvider mount={mount()}>
              <FrameContent />
            </UI.PortalMountProvider>
          </SolidPortal>
        )}
      </Show>
    </div>
  )
}
