// Generic themed backdrop for non-space themes: a token-tinted nebula (recolors
// with the active theme) plus a field of slowly floating motif glyphs. One small,
// shared component — every extra theme only adds a tiny `motifs` array, not its
// own bespoke scene, so the library stays light. Motion is skipped under
// motionReduced() (the CSS honours the same reduced-motion guard).
import { createEffect, type JSX } from 'solid-js'

import { motionReduced } from '../lib/motion'

/** Props for {@link ThemedScenery}. */
export interface ThemedSceneryProps {
  /** Emoji/text glyphs scattered and gently floating across the backdrop. */
  motifs: string[]
  /** How many glyphs to render. @default 16 */
  count?: number
}

function buildMotifs(motifs: string[], count: number, animate: boolean): string {
  const rnd = Math.random
  const pick = () => motifs[Math.floor(rnd() * motifs.length)]
  let html = ''
  for (let i = 0; i < count; i++) {
    const size = 22 + rnd() * 40
    const op = 0.08 + rnd() * 0.16
    const left = (rnd() * 100).toFixed(2)
    const top = (rnd() * 100).toFixed(2)
    const rot = (rnd() * 40 - 20).toFixed(1)
    const dur = (6 + rnd() * 8).toFixed(1)
    const delay = (-rnd() * 8).toFixed(1)
    const anim = animate
      ? `--r:${rot}deg;--dur:${dur}s;--delay:${delay}s;`
      : `transform:rotate(${rot}deg);animation:none;`
    html +=
      `<span class="motif" style="left:${left}%;top:${top}%;font-size:${size.toFixed(0)}px;` +
      `opacity:${op.toFixed(2)};${anim}">${pick()}</span>`
  }
  return html
}

/**
 * A lightweight, theme-tinted backdrop for non-`space` themes: the same
 * token-driven nebula as {@link SpaceBackground} plus slowly floating motif
 * glyphs you pass in. Mount it as {@link AppShell}'s `background` (fixed z-0
 * layer behind all content). Motion is skipped under `motionReduced()`.
 *
 * @example
 * ```tsx
 * <AppShell background={<ThemedScenery motifs={['🦕', '🌿', '🦴']} />}>…</AppShell>
 * ```
 */
export function ThemedScenery(props: ThemedSceneryProps): JSX.Element {
  let field!: HTMLDivElement

  // Regenerate when the motifs change (e.g. switching themes) or motion pref flips.
  createEffect(() => {
    field.innerHTML = buildMotifs(props.motifs, props.count ?? 16, !motionReduced())
  })

  return (
    <div id="scenery" aria-hidden="true">
      <div class="themed-sky" />
      <div ref={field} class="absolute inset-0" />
    </div>
  )
}
