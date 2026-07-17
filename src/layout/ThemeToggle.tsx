// Theme toggle: the icon shows the CURRENT theme (moon when dark, sun when
// light), not the theme you'd switch to. Styled as a 36×36 icon button to match
// EffectsToggle — lucide icons, no emoji (consistent with the rest of the UI).
import { Moon, Sun } from 'lucide-solid'
import { Show, type JSX } from 'solid-js'

import { toggleTheme, useTheme } from '../lib/theme'

/** Props for {@link ThemeToggle}. */
interface ThemeToggleProps {
  /** Accessible label / tooltip text. Defaults to `'Toggle theme'`. */
  label?: string
}

/**
 * Icon button that flips between dark and light theme. The icon shows the
 * CURRENT theme (moon when dark, sun when light), not the theme you'd switch
 * to. Wraps {@link useTheme} + {@link toggleTheme}.
 *
 * @example
 * ```tsx
 * <ThemeToggle label="Switch theme" />
 * ```
 */
export function ThemeToggle(props: ThemeToggleProps): JSX.Element {
  const theme = useTheme()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      class="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
      aria-label={props.label ?? 'Toggle theme'}
      title={props.label ?? 'Toggle theme'}
    >
      <Show when={theme() === 'dark'} fallback={<Sun class="h-[18px] w-[18px]" />}>
        <Moon class="h-[18px] w-[18px]" />
      </Show>
    </button>
  )
}
