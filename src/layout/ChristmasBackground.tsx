// Christmas scenery for the "christmas" theme: a cozy night sky, drifting snow, a
// twinkling light garland across the top, a pine tree, and — instead of a
// shooting star — Santa's sleigh crossing the sky (ambiently + on a background
// click). Shares the cursor-glow / magnetic / edge-glow pointer effects. Motion
// is skipped under motionReduced().
import { createEffect, For, onCleanup, onMount, type JSX } from 'solid-js'

import { motionReduced } from '../lib/motion'
import { bindPointerFx } from './sceneEffects'

const FLAKE_COUNT = 60
const LIGHT_COLORS = ['#ff5a5a', '#4ade80', '#ffd23f', '#5aa9ff', '#ff8ad8']
const GARLAND = Array.from({ length: 22 }, (_, i) => i)

function buildFlakes(animate: boolean): string {
  const rnd = Math.random
  let html = ''
  for (let i = 0; i < FLAKE_COUNT; i++) {
    const size = (2 + rnd() * 4).toFixed(1)
    const op = (0.4 + rnd() * 0.6).toFixed(2)
    const left = (rnd() * 100).toFixed(2)
    const dur = (6 + rnd() * 9).toFixed(1)
    const delay = (-rnd() * 15).toFixed(1)
    const sway = (rnd() * 2 - 1) * (8 + rnd() * 12)
    const anim = animate
      ? `animation:snowFall ${dur}s linear ${delay}s infinite;`
      : `top:${(rnd() * 100).toFixed(1)}%;`
    html +=
      `<span class="flake" style="left:${left}%;width:${size}px;height:${size}px;opacity:${op};` +
      `--sway:${sway.toFixed(0)}px;${anim}"></span>`
  }
  return html
}

/**
 * Festive backdrop for the `christmas` theme: night sky, falling snow, a
 * twinkling light garland, a pine tree, and Santa's sleigh flying across (ambient
 * + on background click). Mount as {@link AppShell}'s `background`. Motion is
 * skipped under `motionReduced()`.
 */
export function ChristmasBackground(): JSX.Element {
  let root!: HTMLDivElement
  let field!: HTMLDivElement

  createEffect(() => {
    field.innerHTML = buildFlakes(!motionReduced())
  })

  onMount(() => {
    const cleanups: Array<() => void> = []
    const timers: number[] = []

    // Santa's sleigh crosses from one side to the other with a gentle arc.
    const launchSanta = (rtl: boolean): void => {
      const el = document.createElement('span')
      el.textContent = '🎅🛷'
      const top = 6 + Math.random() * 26
      const size = 30 + Math.random() * 16
      el.style.cssText =
        `position:absolute;top:${top}vh;${rtl ? 'right' : 'left'}:-14%;font-size:${size.toFixed(0)}px;` +
        `white-space:nowrap;pointer-events:none;filter:drop-shadow(0 0 6px hsl(var(--primary) / 0.5));`
      if (rtl) el.style.transform = 'scaleX(-1)'
      root.appendChild(el)
      const dist = window.innerWidth * 1.3
      const ex = rtl ? -dist : dist
      const dur = 6500 + Math.random() * 4000
      const anim = el.animate(
        [
          { opacity: 0, transform: `translate(0,0) ${rtl ? 'scaleX(-1)' : ''}` },
          {
            opacity: 1,
            transform: `translate(${ex * 0.15}px,-18px) ${rtl ? 'scaleX(-1)' : ''}`,
            offset: 0.15,
          },
          {
            opacity: 1,
            transform: `translate(${ex * 0.85}px,-18px) ${rtl ? 'scaleX(-1)' : ''}`,
            offset: 0.85,
          },
          { opacity: 0, transform: `translate(${ex}px,0) ${rtl ? 'scaleX(-1)' : ''}` },
        ],
        { duration: dur, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' },
      )
      anim.onfinish = () => el.remove()
      timers.push(window.setTimeout(() => el.remove(), dur + 400))
    }

    const INTERACTIVE =
      'a, button, input, select, textarea, label, [role="button"], [role="tab"], [role="menuitem"], [role="dialog"], [contenteditable]'
    const onClick = (e: MouseEvent): void => {
      if ((e.target as Element | null)?.closest?.(INTERACTIVE)) return
      launchSanta(Math.random() < 0.5)
    }
    document.addEventListener('click', onClick)
    cleanups.push(() => document.removeEventListener('click', onClick))

    if (!motionReduced()) {
      cleanups.push(bindPointerFx(root))
      const loop = (): void => {
        launchSanta(Math.random() < 0.5)
        timers.push(window.setTimeout(loop, 9000 + Math.random() * 9000))
      }
      timers.push(window.setTimeout(loop, 3000))
    }

    onCleanup(() => {
      cleanups.forEach((fn) => fn())
      timers.forEach((t) => clearTimeout(t))
    })
  })

  return (
    <div id="xmas" ref={root} aria-hidden="true">
      <div class="xmas-sky" />
      <div ref={field} class="absolute inset-0" />

      {/* Light garland across the top */}
      <div style={{ position: 'absolute', top: '0', left: '0', right: '0', height: '26px' }}>
        <For each={GARLAND}>
          {(i) => {
            const c = LIGHT_COLORS[i % LIGHT_COLORS.length]
            return (
              <span
                class="light"
                style={{
                  left: `${((i / (GARLAND.length - 1)) * 100).toFixed(2)}%`,
                  background: c,
                  color: c,
                  'animation-delay': `${(i % 5) * 0.3}s`,
                }}
              />
            )
          }}
        </For>
      </div>

      {/* Pine tree (accent = pine green, so it follows the theme) */}
      <svg
        viewBox="0 0 200 270"
        style={{
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '240px',
          height: 'auto',
          opacity: '0.9',
        }}
      >
        <rect x="92" y="228" width="16" height="42" fill="hsl(25 45% 28%)" />
        <polygon points="100,64 60,150 140,150" fill="hsl(var(--accent))" />
        <polygon points="100,110 48,196 152,196" fill="hsl(var(--accent))" />
        <polygon points="100,158 38,240 162,240" fill="hsl(var(--accent))" />
        <polygon points="100,40 106,58 125,58 110,70 116,88 100,77 84,88 90,70 75,58 94,58" fill="#ffd23f" />
        <circle cx="82" cy="180" r="5" fill="#ff5a5a" />
        <circle cx="120" cy="205" r="5" fill="#5aa9ff" />
        <circle cx="100" cy="150" r="5" fill="#ffd23f" />
        <circle cx="72" cy="225" r="5" fill="#ff8ad8" />
        <circle cx="132" cy="228" r="5" fill="#ffd23f" />
      </svg>

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
