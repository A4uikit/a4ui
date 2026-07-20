// Aurora — an ambient backdrop of soft, blurred color blobs tinted with the
// theme tokens (`--primary` / `--accent`). Fixed behind the page so glass
// surfaces read as glass: as glassy cards scroll over the fixed blobs, their
// backdrop-blur samples the color behind them. Every theme tints it differently
// for free. This is the lightweight, no-starfield alternative to
// `SpaceBackground` / `ThemedScenery`.
//
// Usage: render it once at the top of your layout and keep the page root's
// background transparent (don't put `bg-background` on the root) so the Aurora
// shows through — the component paints the base background itself.
import { For, onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'
import { bindPointerFx } from './sceneEffects'

export interface AuroraProps {
  /** Blob opacity multiplier, 0..1 — higher = more visible color. @default 0.45 */
  intensity?: number
  /** Slowly drift/scale the blobs. Reduced-motion aware (holds still). @default false */
  animated?: boolean
  /**
   * A soft glow that follows the cursor across the backdrop (plus cursor-tracking
   * on any `.glow-edge` cards). Reduced-motion aware (off when reduced). @default true
   */
  pointerGlow?: boolean
  class?: string
}

// Static class strings (scanned by Tailwind). token = which theme color; a =
// per-blob opacity weight, multiplied by `intensity`.
const BLOBS = [
  { pos: '-left-40 -top-32', size: 'h-[40rem] w-[40rem]', token: '--primary', a: 1 },
  { pos: '-right-32 top-1/4', size: 'h-[38rem] w-[38rem]', token: '--accent', a: 0.9 },
  { pos: 'bottom-[-10%] left-1/3', size: 'h-[36rem] w-[36rem]', token: '--primary', a: 0.75 },
] as const

/**
 * Ambient, theme-tinted blurred-blob backdrop that makes glass surfaces read as
 * glass. Fixed behind the page (paints its own base background); keep the page
 * root transparent. Reduced-motion aware when `animated`.
 *
 * @example
 * ```tsx
 * // at the top of your app/layout (root must NOT set its own bg):
 * <div class="relative min-h-screen text-foreground">
 *   <Aurora />
 *   <YourPage />
 * </div>
 *
 * <Aurora intensity={0.6} animated />
 * ```
 */
export function Aurora(props: AuroraProps): JSX.Element {
  const intensity = (): number => props.intensity ?? 0.45
  let root: HTMLDivElement | undefined

  onMount(() => {
    // The pointer glow (`#cursorGlow`) + `.glow-edge` cursor tracking come from
    // the shared pointer-fx binder — only when motion is allowed.
    if (props.pointerGlow === false || motionReduced() || !root) return
    const cleanup = bindPointerFx(root)
    onCleanup(cleanup)
  })

  return (
    <div
      ref={root}
      aria-hidden="true"
      class={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background', props.class)}
    >
      <For each={BLOBS}>
        {(b) => (
          <div
            class={cn('absolute rounded-full blur-3xl', b.pos, b.size, props.animated && 'aurora-drift')}
            style={{
              background: `radial-gradient(circle, hsl(var(${b.token}) / ${(intensity() * b.a).toFixed(2)}), transparent 70%)`,
            }}
          />
        )}
      </For>
      {/* Soft glow that follows the cursor across the backdrop (positioned by
          bindPointerFx via left/top on pointermove). */}
      <div
        id="cursorGlow"
        class="absolute h-[520px] w-[520px] rounded-full opacity-0 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.1), transparent 70%)',
          transform: 'translate(-50%,-50%)',
        }}
      />
    </div>
  )
}
