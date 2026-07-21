// Bar-style audio waveform over a hidden native <audio> element — no media
// library. When no real `peaks` are supplied, a deterministic placeholder
// waveform is derived from the bar index (abs(sin(...)) blend) so the shape
// is stable across renders instead of reshuffling on every re-render like
// Math.random() would.
import { Pause, Play } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createMemo, createSignal, For, onCleanup, onMount, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface AudioWaveformProps {
  src?: string
  peaks?: number[]
  /** Bar row height in pixels. @default 64 */
  height?: number
  class?: string
}

const PLACEHOLDER_BAR_COUNT = 48
// Demo progress rate (fraction of the fake "duration" per animation frame
// tick) used only when there's no `src` to drive real audio playback.
const DEMO_TICK_MS = 100
const DEMO_STEP = 0.01

/** Deterministic placeholder bar heights (0..1), no Math.random. */
function placeholderPeaks(count: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    const a = Math.abs(Math.sin(i * 0.35))
    const b = Math.abs(Math.sin(i * 0.09 + 1.2))
    return 0.15 + 0.85 * (0.65 * a + 0.35 * b)
  })
}

/**
 * Waveform of vertical bars driven by an optional hidden `<audio>` element.
 * Pass `peaks` (numbers in `0..1`) for a real waveform, or omit it for a
 * deterministic placeholder shape. The played portion (up to
 * `currentTime / duration`) is highlighted; clicking a bar seeks there. With
 * no `src`, playback is simulated on a timer for demo purposes.
 *
 * @example
 * ```tsx
 * <AudioWaveform src="/media/track.mp3" />
 * <AudioWaveform peaks={[0.2, 0.8, 0.4, 0.9, 0.3]} height={48} />
 * ```
 */
export function AudioWaveform(props: AudioWaveformProps): JSX.Element {
  let audioRef: HTMLAudioElement | undefined

  const [playing, setPlaying] = createSignal(false)
  const [currentTime, setCurrentTime] = createSignal(0)
  const [duration, setDuration] = createSignal(0)

  const bars = createMemo(() => props.peaks ?? placeholderPeaks(PLACEHOLDER_BAR_COUNT))
  const progress = createMemo(() => (duration() > 0 ? currentTime() / duration() : 0))
  const barHeight = () => props.height ?? 64

  const togglePlay = (): void => {
    if (props.src) {
      const audio = audioRef
      if (!audio) return
      if (audio.paused) void audio.play()
      else audio.pause()
      return
    }
    // No source: drive a fake demo progress instead of real playback.
    setPlaying((p) => !p)
  }

  const seekToRatio = (ratio: number): void => {
    const clamped = Math.min(Math.max(ratio, 0), 1)
    if (props.src) {
      const audio = audioRef
      if (!audio || !duration()) return
      audio.currentTime = clamped * duration()
      return
    }
    setCurrentTime(clamped * (duration() || 1))
  }

  const handleBarClick = (index: number): void => {
    seekToRatio((index + 0.5) / bars().length)
  }

  onMount(() => {
    if (props.src) {
      const audio = audioRef
      if (!audio) return

      const onPlay = (): void => {
        setPlaying(true)
      }
      const onPause = (): void => {
        setPlaying(false)
      }
      const onTimeUpdate = (): void => {
        setCurrentTime(audio.currentTime)
      }
      const onLoadedMetadata = (): void => {
        setDuration(audio.duration || 0)
      }

      audio.addEventListener('play', onPlay)
      audio.addEventListener('pause', onPause)
      audio.addEventListener('timeupdate', onTimeUpdate)
      audio.addEventListener('loadedmetadata', onLoadedMetadata)

      onCleanup(() => {
        audio.removeEventListener('play', onPlay)
        audio.removeEventListener('pause', onPause)
        audio.removeEventListener('timeupdate', onTimeUpdate)
        audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      })
      return
    }

    // Demo mode: fake a duration and advance currentTime on an interval while playing.
    setDuration(30)
    const interval = setInterval(() => {
      if (!playing() || motionReduced()) return
      setCurrentTime((t) => {
        const next = t + DEMO_STEP * duration()
        if (next >= duration()) {
          setPlaying(false)
          return 0
        }
        return next
      })
    }, DEMO_TICK_MS)
    onCleanup(() => clearInterval(interval))
  })

  return (
    <div class={cn('card flex items-center gap-3 p-3', props.class)}>
      <Show when={props.src}>
        <audio ref={audioRef} src={props.src} />
      </Show>

      <button
        type="button"
        aria-label={playing() ? 'Pause' : 'Play'}
        onClick={togglePlay}
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-150 hover:scale-105 active:scale-95"
      >
        <Show when={playing()} fallback={<Play class="h-4 w-4 translate-x-0.5" fill="currentColor" />}>
          <Pause class="h-4 w-4" fill="currentColor" />
        </Show>
      </button>

      <div
        role="slider"
        aria-label="Waveform position"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress() * 100)}
        tabIndex={0}
        class="flex flex-1 cursor-pointer items-center gap-[2px]"
        style={{ height: `${barHeight()}px` }}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          seekToRatio((event.clientX - rect.left) / rect.width)
        }}
      >
        <For each={bars()}>
          {(peak, index) => {
            const played = createMemo(() => index() / bars().length <= progress())
            return (
              <div
                aria-hidden="true"
                onClick={(event) => {
                  event.stopPropagation()
                  handleBarClick(index())
                }}
                class={cn(
                  'w-full min-w-[2px] flex-1 rounded-full transition-colors duration-150',
                  played() ? 'bg-primary' : 'bg-muted',
                )}
                style={{ height: `${Math.max(peak, 0.06) * 100}%` }}
              />
            )
          }}
        </For>
      </div>
    </div>
  )
}
