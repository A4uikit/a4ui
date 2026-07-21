// Lamp — a hero/section backdrop: a spotlight beam fanning down from the top
// center (two symmetric blurred gradient cones + a bright thin line), with
// `children` sitting in the illuminated area below. Same "self-contained
// backdrop" idiom as Aurora/SpaceBackground (dark base, token-tinted glow,
// motionReduced()-aware), just scoped to one hero/section instead of the
// whole page.
import { onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { animate, motionReduced } from '../lib/motion'

export interface LampProps {
  children?: JSX.Element
  class?: string
}

/**
 * Hero/section backdrop: a spotlight beam fanning down from the top center —
 * two symmetric blurred gradient cones (`--primary` / `--accent`) plus a
 * bright thin source line — over a dark base, with `children` centered in
 * the illuminated area below. Grows/brightens in on mount via Motion
 * (opacity + scale); static under {@link motionReduced}. Self-contained
 * (`relative overflow-hidden`); size it with `class` (e.g. `min-h-[28rem]`).
 *
 * @example
 * ```tsx
 * <Lamp class="min-h-[28rem]">
 *   <h1 class="text-4xl font-semibold text-foreground">Build in the light</h1>
 *   <p class="mt-4 text-muted-foreground">A hero backdrop with a spotlight glow.</p>
 * </Lamp>
 * ```
 */
export function Lamp(props: LampProps): JSX.Element {
  let beamEl: HTMLDivElement | undefined

  onMount(() => {
    if (motionReduced() || !beamEl) return
    animate(beamEl, { opacity: [0, 1], scale: [0.85, 1] }, { duration: 0.9, ease: 'easeOut' })
  })

  return (
    <div
      class={cn(
        'relative flex min-h-[24rem] w-full flex-col items-center overflow-hidden bg-background',
        props.class,
      )}
    >
      <div
        ref={beamEl}
        aria-hidden="true"
        class="pointer-events-none absolute inset-0"
        style={motionReduced() ? undefined : { opacity: 0, 'transform-origin': 'top center' }}
      >
        {/* Left cone: apex at top-center, fanning down-left. */}
        <div
          class="absolute left-1/2 top-0 h-72 w-72 -translate-x-full blur-2xl"
          style={{
            background: 'linear-gradient(115deg, hsl(var(--primary) / 0.75), transparent 70%)',
            'clip-path': 'polygon(100% 0%, 0% 100%, 100% 100%)',
          }}
        />
        {/* Right cone: mirror of the left, same apex. */}
        <div
          class="absolute left-1/2 top-0 h-72 w-72 blur-2xl"
          style={{
            background: 'linear-gradient(245deg, hsl(var(--accent) / 0.75), transparent 70%)',
            'clip-path': 'polygon(0% 0%, 100% 100%, 0% 100%)',
          }}
        />
        {/* Bright thin line at the beam's source. */}
        <div
          class="absolute left-1/2 top-0 h-px w-64 -translate-x-1/2 blur-[1px]"
          style={{ background: 'hsl(var(--primary))' }}
        />
        {/* Soft bloom under the line, grounding the beam. */}
        <div
          class="absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 blur-2xl"
          style={{
            background: 'radial-gradient(ellipse at top, hsl(var(--primary) / 0.5), transparent 70%)',
          }}
        />
      </div>
      <div class="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        {props.children}
      </div>
    </div>
  )
}
