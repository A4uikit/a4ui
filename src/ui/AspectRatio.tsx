import { splitProps, type JSX, type ParentProps } from 'solid-js'

import { cn } from '../lib/cn'

interface AspectRatioProps extends ParentProps {
  /** Width divided by height, e.g. `16 / 9`. @default 1 */
  ratio?: number
  class?: string
}

export type { AspectRatioProps }

/**
 * Box that keeps a fixed width:height ratio (CSS `aspect-ratio`). Children fill
 * it; give images/video `object-cover`.
 *
 * @example
 * ```tsx
 * <AspectRatio ratio={16 / 9} class="w-full overflow-hidden rounded-lg">
 *   <img src="/cover.jpg" alt="" class="object-cover" />
 * </AspectRatio>
 * ```
 */
export function AspectRatio(props: AspectRatioProps): JSX.Element {
  const [local, rest] = splitProps(props, ['ratio', 'class', 'children'])
  return (
    <div
      class={cn('relative w-full [&>*]:h-full [&>*]:w-full', local.class)}
      style={{ 'aspect-ratio': String(local.ratio ?? 1) }}
      {...rest}
    >
      {local.children}
    </div>
  )
}
