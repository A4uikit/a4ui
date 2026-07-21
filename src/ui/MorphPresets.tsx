// MorphPresets — thin, opinionated wrappers over IconMorphButton for common
// two-state icon toggles (copy, play/pause, mute, lock, theme). Each preset
// only supplies icons + sensible defaults; the morph animation itself lives
// in IconMorphButton and is not reimplemented here.
import type { JSX } from 'solid-js'
import { Check, Copy, Lock, Moon, Pause, Play, Sun, Unlock, Volume2, VolumeX } from 'lucide-solid'

import { IconMorphButton, type IconMorphButtonVariant } from './IconMorphButton'

export interface CopyButtonProps {
  /** Text copied to the clipboard when the button is pressed. */
  value: string
  /** Optional label shown next to the icon before copying. */
  label?: JSX.Element
  /** Optional label shown next to the icon once copied. */
  copiedLabel?: JSX.Element
  /** Visual style. Defaults to `'ghost'`. */
  variant?: IconMorphButtonVariant
  class?: string
  'aria-label'?: string
}

/**
 * Copy-to-clipboard button that morphs Copy → Check and auto-reverts after
 * 1.5s.
 *
 * @example
 * ```tsx
 * <CopyButton value="npm install @a4ui/core" aria-label="Copy install command" />
 * ```
 */
export function CopyButton(props: CopyButtonProps): JSX.Element {
  return (
    <IconMorphButton
      inactive={<Copy size={18} />}
      active={<Check size={18} />}
      label={props.label}
      activeLabel={props.copiedLabel}
      variant={props.variant}
      class={props.class}
      aria-label={props['aria-label']}
      revertAfter={1500}
      onChange={(pressed) => {
        if (pressed) void navigator.clipboard?.writeText(props.value)
      }}
    />
  )
}

export interface PlayPauseButtonProps {
  /** Controlled playing state. Omit to let the button manage its own state. */
  pressed?: boolean
  /** Initial playing state when uncontrolled. Defaults to `false`. */
  defaultPressed?: boolean
  /** Fired with the next playing state, controlled or uncontrolled. */
  onChange?: (pressed: boolean) => void
  /** Optional label shown next to the icon while paused. */
  label?: JSX.Element
  /** Optional label shown next to the icon while playing. */
  activeLabel?: JSX.Element
  /** Visual style. Defaults to `'ghost'`. */
  variant?: IconMorphButtonVariant
  class?: string
  'aria-label'?: string
}

/**
 * Play/pause toggle button whose icon morphs Play → Pause.
 *
 * @example
 * ```tsx
 * <PlayPauseButton defaultPressed={false} aria-label="Play" />
 * ```
 */
export function PlayPauseButton(props: PlayPauseButtonProps): JSX.Element {
  return (
    <IconMorphButton
      inactive={<Play size={18} />}
      active={<Pause size={18} />}
      pressed={props.pressed}
      defaultPressed={props.defaultPressed}
      onChange={props.onChange}
      label={props.label}
      activeLabel={props.activeLabel}
      variant={props.variant}
      class={props.class}
      aria-label={props['aria-label']}
    />
  )
}

export interface MuteButtonProps {
  /** Controlled muted state. Omit to let the button manage its own state. */
  pressed?: boolean
  /** Initial muted state when uncontrolled. Defaults to `false`. */
  defaultPressed?: boolean
  /** Fired with the next muted state, controlled or uncontrolled. */
  onChange?: (pressed: boolean) => void
  /** Optional label shown next to the icon while unmuted. */
  label?: JSX.Element
  /** Optional label shown next to the icon while muted. */
  activeLabel?: JSX.Element
  /** Visual style. Defaults to `'ghost'`. */
  variant?: IconMorphButtonVariant
  class?: string
  'aria-label'?: string
}

/**
 * Mute toggle button whose icon morphs Volume2 → VolumeX.
 *
 * @example
 * ```tsx
 * <MuteButton defaultPressed={false} aria-label="Mute" />
 * ```
 */
export function MuteButton(props: MuteButtonProps): JSX.Element {
  return (
    <IconMorphButton
      inactive={<Volume2 size={18} />}
      active={<VolumeX size={18} />}
      pressed={props.pressed}
      defaultPressed={props.defaultPressed}
      onChange={props.onChange}
      label={props.label}
      activeLabel={props.activeLabel}
      variant={props.variant}
      class={props.class}
      aria-label={props['aria-label']}
    />
  )
}

export interface LockButtonProps {
  /** Controlled locked state. Omit to let the button manage its own state. */
  pressed?: boolean
  /** Initial locked state when uncontrolled. Defaults to `false`. */
  defaultPressed?: boolean
  /** Fired with the next locked state, controlled or uncontrolled. */
  onChange?: (pressed: boolean) => void
  /** Optional label shown next to the icon while unlocked. */
  label?: JSX.Element
  /** Optional label shown next to the icon while locked. */
  activeLabel?: JSX.Element
  /** Visual style. Defaults to `'ghost'`. */
  variant?: IconMorphButtonVariant
  class?: string
  'aria-label'?: string
}

/**
 * Lock toggle button whose icon morphs Unlock → Lock.
 *
 * @example
 * ```tsx
 * <LockButton defaultPressed={false} aria-label="Lock" />
 * ```
 */
export function LockButton(props: LockButtonProps): JSX.Element {
  return (
    <IconMorphButton
      inactive={<Unlock size={18} />}
      active={<Lock size={18} />}
      pressed={props.pressed}
      defaultPressed={props.defaultPressed}
      onChange={props.onChange}
      label={props.label}
      activeLabel={props.activeLabel}
      variant={props.variant}
      class={props.class}
      aria-label={props['aria-label']}
    />
  )
}

export interface ThemeMorphButtonProps {
  /** Controlled dark-mode state. Omit to let the button manage its own state. */
  pressed?: boolean
  /** Initial dark-mode state when uncontrolled. Defaults to `false`. */
  defaultPressed?: boolean
  /** Fired with the next dark-mode state, controlled or uncontrolled. */
  onChange?: (pressed: boolean) => void
  /** Optional label shown next to the icon in light mode. */
  label?: JSX.Element
  /** Optional label shown next to the icon in dark mode. */
  activeLabel?: JSX.Element
  /** Visual style. Defaults to `'ghost'`. */
  variant?: IconMorphButtonVariant
  class?: string
  'aria-label'?: string
}

/**
 * Purely presentational theme toggle whose icon morphs Sun → Moon. Does not
 * touch the theme system itself — wire `pressed`/`onChange` to your theme
 * state.
 *
 * @example
 * ```tsx
 * <ThemeMorphButton pressed={isDark()} onChange={setIsDark} aria-label="Toggle theme" />
 * ```
 */
export function ThemeMorphButton(props: ThemeMorphButtonProps): JSX.Element {
  return (
    <IconMorphButton
      inactive={<Sun size={18} />}
      active={<Moon size={18} />}
      pressed={props.pressed}
      defaultPressed={props.defaultPressed}
      onChange={props.onChange}
      label={props.label}
      activeLabel={props.activeLabel}
      variant={props.variant}
      class={props.class}
      aria-label={props['aria-label']}
    />
  )
}
