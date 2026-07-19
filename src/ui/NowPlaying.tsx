// Compact "now playing" music widget: cover art, title/artist, and an
// animated equalizer. The bounce is pure CSS (keyframes injected once into
// the document head), so the bars animate at zero per-frame JS cost — same
// pattern as LoadingDots. Bars freeze to a static height when playback is
// paused or under reduced motion.
import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface NowPlayingProps {
  title: string
  artist?: string
  /** Cover art URL. */
  cover?: string
  /** Whether the equalizer bars are animating. @default true */
  playing?: boolean
  class?: string
}

const STYLE_ID = 'a4ui-now-playing-style'

function ensureStyleInjected(): void {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
@keyframes a4-eq {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}
`
  document.head.appendChild(style)
}

// Per-bar duration/delay (seconds) so the bars don't bounce in lockstep.
const BARS = [
  { duration: 0.6, delay: 0 },
  { duration: 0.5, delay: 0.1 },
  { duration: 0.7, delay: 0.05 },
  { duration: 0.45, delay: 0.15 },
  { duration: 0.65, delay: 0.2 },
]

/**
 * Compact "now playing" music widget with an animated equalizer. Bars bounce
 * via CSS keyframes while `playing` is true; they freeze to a low static
 * height when paused or under reduced motion.
 *
 * @example
 * ```tsx
 * <NowPlaying title="Random Access Memories" artist="Daft Punk" cover="/covers/ram.jpg" playing />
 * ```
 */
export function NowPlaying(props: NowPlayingProps): JSX.Element {
  ensureStyleInjected()

  const playing = () => (props.playing ?? true) && !motionReduced()

  const barStyle = (bar: (typeof BARS)[number], index: number): JSX.CSSProperties => {
    if (!playing()) {
      return {
        height: '30%',
        'transform-origin': 'bottom',
      }
    }
    return {
      height: '100%',
      'transform-origin': 'bottom',
      'animation-name': 'a4-eq',
      'animation-duration': `${bar.duration}s`,
      'animation-delay': `${bar.delay + index * 0.02}s`,
      'animation-iteration-count': 'infinite',
      'animation-timing-function': 'ease-in-out',
    }
  }

  return (
    <div
      class={cn('flex items-center gap-3 rounded-xl border border-border bg-card p-3', props.class)}
      aria-label={`Now playing: ${props.title}${props.artist ? ` by ${props.artist}` : ''}`}
    >
      <Show when={props.cover} fallback={<div class="h-12 w-12 shrink-0 rounded-lg bg-muted" />}>
        <img src={props.cover} alt="" class="h-12 w-12 shrink-0 rounded-lg object-cover" />
      </Show>
      <div class="min-w-0 flex-1">
        <p class="truncate font-medium text-foreground">{props.title}</p>
        <Show when={props.artist}>
          <p class="truncate text-sm text-muted-foreground">{props.artist}</p>
        </Show>
      </div>
      <div class="flex h-6 items-end gap-0.5">
        <For each={BARS}>
          {(bar, index) => <span class="w-1 rounded-full bg-primary" style={barStyle(bar, index())} />}
        </For>
      </div>
    </div>
  )
}
