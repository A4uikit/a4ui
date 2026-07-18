// Snow scenery for the "snow" theme: snowflakes drifting DOWN with a sideways
// sway, a snow bank building at the bottom, and a frosted cap on cards (via the
// `data-scene="snow"` flag on <html>). Shares the cursor glow / magnetic / edge-
// glow pointer effects. Motion is skipped under motionReduced().
import { createEffect, onCleanup, onMount, type JSX } from 'solid-js'

import { motionReduced } from '../lib/motion'
import { bindPointerFx } from './sceneEffects'

const FLAKE_COUNT = 80

function buildFlakes(animate: boolean): string {
  const rnd = Math.random
  let html = ''
  for (let i = 0; i < FLAKE_COUNT; i++) {
    const size = (2 + rnd() * 5).toFixed(1)
    const op = (0.4 + rnd() * 0.6).toFixed(2)
    const left = (rnd() * 100).toFixed(2)
    const dur = (5 + rnd() * 9).toFixed(1)
    const delay = (-rnd() * 14).toFixed(1)
    const sway = (rnd() * 2 - 1) * (8 + rnd() * 14)
    const blur = rnd() < 0.3 ? 'filter:blur(1px);' : ''
    const anim = animate
      ? `animation:snowFall ${dur}s linear ${delay}s infinite;`
      : `top:${(rnd() * 100).toFixed(1)}%;`
    html +=
      `<span class="flake" style="left:${left}%;width:${size}px;height:${size}px;opacity:${op};` +
      `--sway:${sway.toFixed(0)}px;${blur}${anim}"></span>`
  }
  return html
}

/**
 * Falling-snow backdrop for the `snow` theme: snowflakes drift down, a snow bank
 * gathers at the bottom, and cards get a frosted cap. Mount as {@link AppShell}'s
 * `background`. Motion is skipped under `motionReduced()`.
 */
export function SnowScenery(): JSX.Element {
  let root!: HTMLDivElement
  let field!: HTMLDivElement

  createEffect(() => {
    field.innerHTML = buildFlakes(!motionReduced())
  })

  onMount(() => {
    document.documentElement.dataset.scene = 'snow'
    const cleanups: Array<() => void> = []
    if (!motionReduced()) cleanups.push(bindPointerFx(root))
    onCleanup(() => {
      if (document.documentElement.dataset.scene === 'snow') delete document.documentElement.dataset.scene
      cleanups.forEach((fn) => fn())
    })
  })

  return (
    <div id="snow" ref={root} aria-hidden="true">
      <div class="snow-sky" />
      <div ref={field} class="absolute inset-0" />
      <div class="snow-bank" />
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
