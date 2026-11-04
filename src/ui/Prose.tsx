import { splitProps, type JSX, type ParentProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { cn } from '../lib/cn'

export type ProseSize = 'sm' | 'base' | 'lg'

interface ProseProps extends ParentProps {
  /** Body text scale. @default 'base' */
  size?: ProseSize
  /** Element to render. @default 'div' */
  as?: 'div' | 'article' | 'section'
  class?: string
}

export type { ProseProps }

const SIZE: Record<ProseSize, string> = {
  sm: 'text-sm [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h4]:text-base [&_.lead]:text-base',
  base: 'text-base [&_h1]:text-4xl [&_h2]:text-2xl [&_h3]:text-xl [&_h4]:text-lg [&_.lead]:text-xl',
  lg: 'text-lg [&_h1]:text-5xl [&_h2]:text-3xl [&_h3]:text-2xl [&_h4]:text-xl [&_.lead]:text-2xl',
}

const PROSE =
  'max-w-none leading-7 text-foreground ' +
  '[&_h1]:mb-4 [&_h1]:font-bold [&_h1]:tracking-tight ' +
  '[&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-2 [&_h2]:font-semibold [&_h2]:tracking-tight ' +
  '[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-semibold ' +
  '[&_h4]:mb-2 [&_h4]:mt-4 [&_h4]:font-semibold ' +
  '[&_p]:my-4 [&_.lead]:text-muted-foreground ' +
  '[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:opacity-80 ' +
  '[&_blockquote]:my-6 [&_blockquote]:border-s-2 [&_blockquote]:border-border [&_blockquote]:ps-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground ' +
  '[&_ul]:my-4 [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:ps-6 [&_li]:my-1 ' +
  '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em] ' +
  '[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted [&_pre]:p-4 ' +
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0 ' +
  '[&_hr]:my-8 [&_hr]:border-border ' +
  '[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm ' +
  '[&_th]:border-b [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-start [&_th]:font-semibold ' +
  '[&_td]:border-b [&_td]:border-border [&_td]:px-3 [&_td]:py-2'

/**
 * Typography wrapper that styles raw HTML or rendered markdown children
 * (headings, paragraphs, `.lead`, links, quotes, lists, code, tables) with
 * token colors. No CSS file and no typography plugin.
 *
 * @example
 * ```tsx
 * <Prose size="lg"><div innerHTML={renderedMarkdown} /></Prose>
 * ```
 */
export function Prose(props: ProseProps): JSX.Element {
  const [local, rest] = splitProps(props, ['size', 'as', 'class', 'children'])
  return (
    <Dynamic
      component={local.as ?? 'div'}
      class={cn(PROSE, SIZE[local.size ?? 'base'], local.class)}
      {...rest}
    >
      {local.children}
    </Dynamic>
  )
}
