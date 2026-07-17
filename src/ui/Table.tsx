// Minimal table primitives (plain HTML + Tailwind, no headless dep). For long
// lists, virtualize with @tanstack/solid-virtual + the remeasureAfterLayout
// helper (exported from a4ui) — the parent owns the virtualizer.
import type { JSX, ParentProps } from 'solid-js'
import { splitProps } from 'solid-js'

import { cn } from '../lib/cn'

interface TableProps extends ParentProps {
  class?: string
}

/**
 * Table root — a plain `<table>` wrapped in a horizontal-scroll container.
 * Compose with {@link TableHead}, {@link TableBody}, {@link TableRow},
 * {@link TableHeadCell}, and {@link TableCell}.
 *
 * @example
 * ```tsx
 * <Table>
 *   <TableHead>
 *     <TableRow>
 *       <TableHeadCell>Name</TableHeadCell>
 *     </TableRow>
 *   </TableHead>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>Alfredo</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 * ```
 */
export function Table(props: TableProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <div class="w-full overflow-x-auto">
      <table class={cn('w-full border-collapse text-sm', local.class)} {...rest}>
        {local.children}
      </table>
    </div>
  )
}

/**
 * `<thead>` wrapper with the muted, bottom-bordered header styling.
 *
 * @example
 * ```tsx
 * <TableHead><TableRow><TableHeadCell>Name</TableHeadCell></TableRow></TableHead>
 * ```
 */
export function TableHead(props: TableProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <thead class={cn('border-b border-border text-left text-muted-foreground', local.class)} {...rest}>
      {local.children}
    </thead>
  )
}

/**
 * `<tbody>` wrapper — no default styling beyond passing through `class`.
 *
 * @example
 * ```tsx
 * <TableBody><TableRow><TableCell>Alfredo</TableCell></TableRow></TableBody>
 * ```
 */
export function TableBody(props: TableProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <tbody class={local.class} {...rest}>
      {local.children}
    </tbody>
  )
}

/**
 * `<tr>` wrapper — adds the row bottom-border and hover highlight.
 *
 * @example
 * ```tsx
 * <TableRow><TableCell>Alfredo</TableCell></TableRow>
 * ```
 */
export function TableRow(props: TableProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <tr class={cn('border-b border-border last:border-0 hover:bg-muted/40', local.class)} {...rest}>
      {local.children}
    </tr>
  )
}

/**
 * `<th>` wrapper — small uppercase heading style, use inside {@link TableHead}.
 *
 * @example
 * ```tsx
 * <TableHeadCell>Name</TableHeadCell>
 * ```
 */
export function TableHeadCell(props: TableProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <th class={cn('px-3 py-2 text-xs font-semibold uppercase tracking-wide', local.class)} {...rest}>
      {local.children}
    </th>
  )
}

/**
 * `<td>` wrapper — standard cell padding and vertical alignment.
 *
 * @example
 * ```tsx
 * <TableCell>Alfredo</TableCell>
 * ```
 */
export function TableCell(props: TableProps): JSX.Element {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <td class={cn('px-3 py-2 align-middle', local.class)} {...rest}>
      {local.children}
    </td>
  )
}
