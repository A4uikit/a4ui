// Joins sibling buttons into one segmented control. Pure Tailwind child
// selectors: works with Button, anchors and a Dropdown trigger as children.
import { splitProps, type JSX, type ParentProps } from 'solid-js'

import { cn } from '../lib/cn'

export type ButtonGroupOrientation = 'horizontal' | 'vertical'

interface ButtonGroupProps extends ParentProps {
  /** Layout direction. @default 'horizontal' */
  orientation?: ButtonGroupOrientation
  /** Accessible name for the group (recommended). */
  'aria-label'?: string
  class?: string
}

export type { ButtonGroupProps }

const HORIZONTAL =
  'flex-row [&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none'
const VERTICAL =
  'flex-col [&>*]:w-full [&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none'

/**
 * Groups buttons so they share borders; only the outer corners stay rounded.
 * Renders `role="group"` — pass `aria-label` so it has a name. Children can be
 * `Button`s, links, a `Dropdown` trigger, `ButtonGroupText` or
 * `ButtonGroupSeparator`.
 *
 * @example
 * ```tsx
 * <ButtonGroup aria-label="Text alignment">
 *   <Button variant="outline">Left</Button>
 *   <Button variant="outline">Center</Button>
 *   <Button variant="outline">Right</Button>
 * </ButtonGroup>
 * ```
 */
export function ButtonGroup(props: ButtonGroupProps): JSX.Element {
  const [local, rest] = splitProps(props, ['orientation', 'class', 'children'])
  return (
    <div
      role="group"
      data-orientation={local.orientation ?? 'horizontal'}
      class={cn(
        'inline-flex items-stretch [&>*]:relative [&>*:focus-visible]:z-10 [&>*:hover]:z-[1]',
        local.orientation === 'vertical' ? VERTICAL : HORIZONTAL,
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </div>
  )
}

interface ButtonGroupTextProps extends ParentProps {
  class?: string
}

/** Non-interactive label cell that sits inside a {@link ButtonGroup}. */
export function ButtonGroupText(props: ButtonGroupTextProps): JSX.Element {
  return (
    <div
      class={cn(
        'inline-flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm font-medium text-muted-foreground',
        props.class,
      )}
    >
      {props.children}
    </div>
  )
}

interface ButtonGroupSeparatorProps {
  class?: string
}

/** Thin divider between buttons that have no border of their own (e.g. primary). */
export function ButtonGroupSeparator(props: ButtonGroupSeparatorProps): JSX.Element {
  return (
    <div
      role="separator"
      class={cn('z-[1] -mx-px w-px self-stretch bg-primary-foreground/30', props.class)}
    />
  )
}

export type { ButtonGroupTextProps, ButtonGroupSeparatorProps }
