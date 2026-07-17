// Two-state toggle button on Kobalte's ToggleButton primitive.
import { ToggleButton as KToggleButton } from '@kobalte/core/toggle-button'
import type { JSX, ParentProps } from 'solid-js'

import { cn } from '../lib/cn'

interface ToggleProps extends ParentProps {
  /** Whether the toggle is pressed/"on". Controlled — pair with `onChange`. */
  pressed: boolean
  onChange: (pressed: boolean) => void
  class?: string
}

/**
 * Two-state toggle button (e.g. bold/italic, mute, favorite), built on
 * Kobalte's ToggleButton primitive. `children` is the button's content
 * (icon and/or text).
 *
 * @example
 * ```tsx
 * const [pressed, setPressed] = createSignal(false)
 * <Toggle pressed={pressed()} onChange={setPressed}><StarIcon /></Toggle>
 * ```
 */
export function Toggle(props: ToggleProps): JSX.Element {
  return (
    <KToggleButton
      pressed={props.pressed}
      onChange={props.onChange}
      class={cn(
        // Outlined at rest so it reads as a button; filled primary when pressed
        // so the "on" state is unmistakable (the resting muted look alone made it
        // look like stray text).
        'inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[pressed]:border-primary data-[pressed]:bg-primary data-[pressed]:text-primary-foreground',
        props.class,
      )}
    >
      {props.children}
    </KToggleButton>
  )
}
