import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind class lists, resolving conflicting utilities left-to-right
 * (via `tailwind-merge`) after flattening conditionals/arrays/objects (via `clsx`).
 * Use this instead of template-string concatenation whenever a component
 * accepts a `class` override that should win over its own defaults.
 *
 * @example
 * ```ts
 * cn('px-2 py-1 text-sm', isActive && 'bg-primary text-primary-foreground', props.class)
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
