// Pulsing placeholder for loading content — plain div, no primitive.
import type { JSX } from 'solid-js'

import { cn } from '../lib/cn'

interface SkeletonProps {
  class?: string
}

export function Skeleton(props: SkeletonProps): JSX.Element {
  return <div class={cn('animate-pulse rounded-md bg-muted', props.class)} />
}
