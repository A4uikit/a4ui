// Custom video player over the native <video> element — no media library.
// Controls (play/pause, scrub, volume, fullscreen, PiP) are hand-rolled on top
// of the video's own event listeners (timeupdate/play/pause/volumechange),
// wired up in onMount and torn down in onCleanup. The control bar auto-hides
// during playback and reappears on pointer movement or keyboard focus.
import { Maximize, Pause, PictureInPicture2, Play, Volume2, VolumeX } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createSignal, onCleanup, onMount, Show } from 'solid-js'

import { cn } from '../lib/cn'

export interface VideoPlayerShellProps {
  src: string
  poster?: string
  class?: string
}

const AUTO_HIDE_MS = 2200
const SEEK_STEP_SECONDS = 5

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * Native `<video>` wrapped in a glass shell with fully custom controls: a big
 * center play/pause, a bottom bar (play/pause, elapsed/duration, a scrub
 * range, mute toggle, fullscreen, Picture-in-Picture), and a keyboard map
 * (Space = play/pause, ArrowLeft/Right = seek ±5s). Controls auto-hide while
 * playing and reappear on pointer movement.
 *
 * @example
 * ```tsx
 * <VideoPlayerShell src="/media/demo.mp4" poster="/media/demo-poster.jpg" />
 * ```
 */
export function VideoPlayerShell(props: VideoPlayerShellProps): JSX.Element {
  let containerRef: HTMLDivElement | undefined
  let videoRef: HTMLVideoElement | undefined

  const [playing, setPlaying] = createSignal(false)
  const [currentTime, setCurrentTime] = createSignal(0)
  const [duration, setDuration] = createSignal(0)
  const [muted, setMuted] = createSignal(false)
  const [volume, setVolume] = createSignal(1)
  const [fullscreen, setFullscreen] = createSignal(false)
  const [pipSupported, setPipSupported] = createSignal(false)
  const [controlsVisible, setControlsVisible] = createSignal(true)

  let hideTimer: ReturnType<typeof setTimeout> | undefined

  const clearHideTimer = (): void => {
    if (hideTimer !== undefined) clearTimeout(hideTimer)
    hideTimer = undefined
  }

  const scheduleHide = (): void => {
    clearHideTimer()
    if (!playing()) return
    hideTimer = setTimeout(() => setControlsVisible(false), AUTO_HIDE_MS)
  }

  const revealControls = (): void => {
    setControlsVisible(true)
    scheduleHide()
  }

  const togglePlay = (): void => {
    const video = videoRef
    if (!video) return
    if (video.paused) void video.play()
    else video.pause()
  }

  const seekBy = (deltaSeconds: number): void => {
    const video = videoRef
    if (!video) return
    video.currentTime = Math.min(Math.max(video.currentTime + deltaSeconds, 0), video.duration || 0)
  }

  const handleScrub = (event: Event & { currentTarget: HTMLInputElement }): void => {
    const video = videoRef
    if (!video) return
    video.currentTime = Number(event.currentTarget.value)
  }

  const toggleMute = (): void => {
    const video = videoRef
    if (!video) return
    video.muted = !video.muted
  }

  const handleVolume = (event: Event & { currentTarget: HTMLInputElement }): void => {
    const video = videoRef
    if (!video) return
    const next = Number(event.currentTarget.value)
    video.volume = next
    video.muted = next === 0
  }

  const toggleFullscreen = (): void => {
    const container = containerRef
    if (!container) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void container.requestFullscreen()
  }

  const togglePip = (): void => {
    const video = videoRef
    if (!video || !pipSupported()) return
    if (document.pictureInPictureElement) void document.exitPictureInPicture()
    else void video.requestPictureInPicture()
  }

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.code === 'Space') {
      event.preventDefault()
      togglePlay()
    } else if (event.code === 'ArrowLeft') {
      event.preventDefault()
      seekBy(-SEEK_STEP_SECONDS)
    } else if (event.code === 'ArrowRight') {
      event.preventDefault()
      seekBy(SEEK_STEP_SECONDS)
    }
    revealControls()
  }

  onMount(() => {
    const video = videoRef
    if (!video) return

    setPipSupported(
      typeof document !== 'undefined' &&
        'pictureInPictureEnabled' in document &&
        !video.disablePictureInPicture,
    )

    const onPlay = (): void => {
      setPlaying(true)
      scheduleHide()
    }
    const onPause = (): void => {
      setPlaying(false)
      clearHideTimer()
      setControlsVisible(true)
    }
    const onTimeUpdate = (): void => {
      setCurrentTime(video.currentTime)
    }
    const onLoadedMetadata = (): void => {
      setDuration(video.duration || 0)
    }
    const onVolumeChange = (): void => {
      setMuted(video.muted)
      setVolume(video.volume)
    }
    const onFullscreenChange = (): void => {
      setFullscreen(document.fullscreenElement === containerRef)
    }

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('volumechange', onVolumeChange)
    document.addEventListener('fullscreenchange', onFullscreenChange)

    onCleanup(() => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('volumechange', onVolumeChange)
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      clearHideTimer()
    })
  })

  return (
    <div
      ref={containerRef}
      class={cn('card group relative aspect-video w-full overflow-hidden bg-black outline-none', props.class)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerMove={revealControls}
      onMouseLeave={() => playing() && setControlsVisible(false)}
    >
      <video
        ref={videoRef}
        src={props.src}
        poster={props.poster}
        class="h-full w-full object-contain"
        onClick={togglePlay}
      />

      {/* Big center play/pause */}
      <Show when={controlsVisible() || !playing()}>
        <button
          type="button"
          aria-label={playing() ? 'Pause' : 'Play'}
          onClick={togglePlay}
          class="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
        >
          <Show when={!playing()}>
            <span class="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-transform duration-150 hover:scale-105">
              <Play class="h-7 w-7 translate-x-0.5" fill="currentColor" />
            </span>
          </Show>
        </button>
      </Show>

      {/* Bottom control bar */}
      <div
        class={cn(
          'absolute inset-x-0 bottom-0 flex flex-col gap-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-2 pt-6 text-white transition-opacity duration-200',
          controlsVisible() ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <input
          type="range"
          aria-label="Seek"
          min={0}
          max={duration() || 0}
          step={0.1}
          value={currentTime()}
          onInput={handleScrub}
          class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-primary"
        />
        <div class="flex items-center gap-2">
          <button type="button" aria-label={playing() ? 'Pause' : 'Play'} onClick={togglePlay} class="p-1">
            <Show when={playing()} fallback={<Play class="h-4 w-4" fill="currentColor" />}>
              <Pause class="h-4 w-4" fill="currentColor" />
            </Show>
          </button>

          <span class="text-xs tabular-nums text-white/85">
            {formatTime(currentTime())} / {formatTime(duration())}
          </span>

          <div class="ml-1 flex items-center gap-1">
            <button type="button" aria-label={muted() ? 'Unmute' : 'Mute'} onClick={toggleMute} class="p-1">
              <Show when={!muted() && volume() > 0} fallback={<VolumeX class="h-4 w-4" />}>
                <Volume2 class="h-4 w-4" />
              </Show>
            </button>
            <input
              type="range"
              aria-label="Volume"
              min={0}
              max={1}
              step={0.05}
              value={muted() ? 0 : volume()}
              onInput={handleVolume}
              class="h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/25 accent-primary"
            />
          </div>

          <div class="ml-auto flex items-center gap-2">
            <Show when={pipSupported()}>
              <button type="button" aria-label="Picture in picture" onClick={togglePip} class="p-1">
                <PictureInPicture2 class="h-4 w-4" />
              </button>
            </Show>
            <button
              type="button"
              aria-label={fullscreen() ? 'Exit fullscreen' : 'Enter fullscreen'}
              onClick={toggleFullscreen}
              class="p-1"
            >
              <Maximize class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
