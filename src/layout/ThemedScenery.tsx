// Generic themed backdrop for non-space themes: a token-tinted nebula (recolors
// with the active theme) plus a field of slowly floating motif glyphs. It also
// carries the same live effects as SpaceBackground so every theme feels alive —
// cursor glow, magnetic buttons, card edge-glow (shared via bindPointerFx), plus
// motif glyphs that streak across ambiently and launch on a background click.
// One small, shared component — every extra theme only adds a tiny `motifs`
// array. Motion is skipped under motionReduced() (the CSS honours the same guard).
import { createEffect, onCleanup, onMount, type JSX } from 'solid-js'

import { motionReduced } from '../lib/motion'
import { bindPointerFx } from './sceneEffects'

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

// Ignore clicks on real UI — a background click is a deliberate "launch" gesture.
const INTERACTIVE =
  'a, button, input, select, textarea, label, [role="button"], [role="tab"], [role="menuitem"], [role="dialog"], [contenteditable]'

/**
 * A lightweight, theme-tinted backdrop for non-`space` themes: the same
 * token-driven nebula as {@link SpaceBackground} plus floating motif glyphs you
 * pass in, cursor glow, magnetic buttons, card edge-glow, and motifs that streak
 * across (ambiently and on a background click). Mount it as {@link AppShell}'s
 * `background` (fixed z-0 layer behind all content). Motion is skipped under
 * `motionReduced()`.
 *
 * @example
 * ```tsx
 * <AppShell background={<ThemedScenery motifs={['🦕', '🌿', '🦴']} />}>…</AppShell>
 * ```
 */
export function ThemedScenery(props: ThemedSceneryProps): JSX.Element {
  let root!: HTMLDivElement
  let field!: HTMLDivElement

  // Regenerate when the motifs change (e.g. switching themes) or motion pref flips.
  createEffect(() => {
    field.innerHTML = buildMotifs(props.motifs, props.count ?? 16, !motionReduced())
  })

  onMount(() => {
    const cleanups: Array<() => void> = []
    const timers: number[] = []

    // Launch one motif glyph flying from (leftCss, topCss) toward `angle`.
    const launchFlyer = (
      leftCss: string,
      topCss: string,
      angle: number,
      dist: number,
      dur: number,
      size: number,
    ): void => {
      const el = document.createElement('span')
      el.textContent = props.motifs[Math.floor(Math.random() * props.motifs.length)]
      el.style.cssText =
        `position:absolute;left:${leftCss};top:${topCss};font-size:${size.toFixed(0)}px;` +
        `pointer-events:none;filter:drop-shadow(0 0 6px hsl(var(--primary) / 0.5));`
      root.appendChild(el)
      const rad = (angle * Math.PI) / 180
      const ex = Math.cos(rad) * dist
      const ey = Math.sin(rad) * dist
      const anim = el.animate(
        [
          { opacity: 0, transform: 'translate(0,0) rotate(0deg) scale(.6)' },
          {
            opacity: 1,
            transform: `translate(${(ex * 0.15).toFixed(0)}px,${(ey * 0.15).toFixed(0)}px) rotate(18deg) scale(1)`,
            offset: 0.15,
          },
          {
            opacity: 1,
            transform: `translate(${(ex * 0.85).toFixed(0)}px,${(ey * 0.85).toFixed(0)}px) rotate(-14deg) scale(1)`,
            offset: 0.85,
          },
          {
            opacity: 0,
            transform: `translate(${ex.toFixed(0)}px,${ey.toFixed(0)}px) rotate(8deg) scale(.8)`,
          },
        ],
        { duration: dur, easing: 'cubic-bezier(.25,0,.2,1)', fill: 'forwards' },
      )
      anim.onfinish = () => el.remove()
      timers.push(window.setTimeout(() => el.remove(), dur + 300))
    }

    // Background click → a motif shoots up-and-out from the click point. Runs
    // even under reduced motion (it's a deliberate action), like SpaceBackground.
    const onClick = (e: MouseEvent): void => {
      if ((e.target as Element | null)?.closest?.(INTERACTIVE)) return
      launchFlyer(
        `${e.clientX}px`,
        `${e.clientY}px`,
        -90 + (Math.random() * 80 - 40),
        260 + Math.random() * 260,
        950 + Math.random() * 700,
        22 + Math.random() * 14,
      )
    }
    document.addEventListener('click', onClick)
    cleanups.push(() => document.removeEventListener('click', onClick))

    if (!motionReduced()) {
      // Cursor glow + magnetic buttons + card edge-glow (shared across themes).
      cleanups.push(bindPointerFx(root))

      // Ambient: a motif drifts across the screen every few seconds.
      const spawnAmbient = (): void => {
        const rtl = Math.random() < 0.5
        launchFlyer(
          rtl ? '104vw' : '-6vw',
          `${(8 + Math.random() * 70).toFixed(0)}vh`,
          (rtl ? 180 : 0) + (Math.random() * 16 - 8),
          window.innerWidth * (1.1 + Math.random() * 0.3),
          6000 + Math.random() * 4000,
          20 + Math.random() * 16,
        )
      }
      const loop = (): void => {
        spawnAmbient()
        timers.push(window.setTimeout(loop, 5000 + Math.random() * 6000))
      }
      timers.push(window.setTimeout(loop, 1800))
    }

    onCleanup(() => {
      cleanups.forEach((fn) => fn())
      timers.forEach((t) => clearTimeout(t))
    })
  })

  return (
    <div id="scenery" ref={root} aria-hidden="true">
      <div class="themed-sky" />
      <div ref={field} class="absolute inset-0" />
      <div
        id="cursorGlow"
        style={{
          position: 'absolute',
          width: '520px',
          height: '520px',
          'border-radius': '50%',
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.1), transparent 70%)',
          transform: 'translate(-50%,-50%)',
          opacity: '0',
          transition: 'opacity .4s ease',
        }}
      />
    </div>
  )
}
