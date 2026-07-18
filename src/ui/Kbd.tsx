// Kbd — keyboard key indicator. Renders a single keycap for documenting
// shortcuts; compose several side by side for chords (e.g. ⌘ + K). Purely
// presentational and theme-agnostic — colors come from semantic tokens.
import type { JSX, ParentProps } from 'solid-js'

import { cn } from '../lib/cn'

interface KbdProps extends ParentProps {
  class?: string
}

const KBD_BASE =
  'inline-flex min-w-[1.5rem] items-center justify-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground shadow-sm'

/**
 * Keycap-styled indicator for a keyboard key or shortcut token.
 *
 * @example
 * ```tsx
 * <Kbd>⌘</Kbd><Kbd>K</Kbd>
 * ```
 */
export function Kbd(props: KbdProps): JSX.Element {
  return <kbd class={cn(KBD_BASE, props.class)}>{props.children}</kbd>
}
