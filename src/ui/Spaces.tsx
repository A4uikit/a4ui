// Switchable "context" containers (like browser Spaces / workspaces): one
// space's content is visible at a time, sliding horizontally between spaces
// on a translateX track (mirrors Carousel's pointer-drag swipe), with a
// dot/pill indicator rail below. Controlled (`activeId`+`onChange`) or
// uncontrolled (internal signal, defaults to the first space).
import { createMemo, createSignal, For, type JSX } from 'solid-js'

import { cn } from '../lib/cn'
import { motionReduced } from '../lib/motion'

export interface Space {
  id: string
  label: string
  icon?: JSX.Element
  content: JSX.Element
}

export interface SpacesProps {
  spaces: Space[]
  /** Controlled active space. Uncontrolled (internal signal, defaults to the first space) when omitted. */
  activeId?: string
  onChange?: (id: string) => void
  class?: string
}

/**
 * Swipeable, switchable "context" containers — one space visible at a time,
 * sliding horizontally between spaces, with a dot/pill indicator rail to jump
 * directly to one. Drag/touch to swipe (the track follows the pointer and
 * snaps on release past a threshold), same engine-free approach as Carousel.
 *
 * @example
 * ```tsx
 * <Spaces
 *   spaces={[
 *     { id: 'personal', label: 'Personal', icon: <User class="h-4 w-4" />, content: <PersonalPane /> },
 *     { id: 'work', label: 'Work', icon: <Briefcase class="h-4 w-4" />, content: <WorkPane /> },
 *   ]}
 * />
 * ```
 */
export function Spaces(props: SpacesProps): JSX.Element {
  const [internalId, setInternalId] = createSignal<string | undefined>(props.spaces[0]?.id)

  const activeId = createMemo(() => props.activeId ?? internalId())
  const count = (): number => props.spaces.length
  const activeIndex = createMemo(() => {
    const i = props.spaces.findIndex((s) => s.id === activeId())
    return i < 0 ? 0 : i
  })

  const select = (id: string): void => {
    if (props.activeId === undefined) setInternalId(id)
    props.onChange?.(id)
  }
  const selectIndex = (i: number): void => {
    const n = count()
    if (n === 0) return
    const space = props.spaces[((i % n) + n) % n]
    if (space) select(space.id)
  }

  // --- drag/touch swipe (engine-free; the track follows the pointer, then the
  // CSS transition snaps to the resolved space on release) -------------------
  let viewport: HTMLDivElement | undefined
  const [dragging, setDragging] = createSignal(false)
  const [dragPx, setDragPx] = createSignal(0)
  let startX = 0

  const onPointerDown = (e: PointerEvent): void => {
    if (count() < 2) return
    startX = e.clientX
    setDragging(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent): void => {
    if (dragging()) setDragPx(e.clientX - startX)
  }
  const endDrag = (): void => {
    if (!dragging()) return
    const width = viewport?.clientWidth ?? 1
    const dx = dragPx()
    const threshold = Math.max(48, width * 0.2)
    if (dx <= -threshold) selectIndex(activeIndex() + 1)
    else if (dx >= threshold) selectIndex(activeIndex() - 1)
    setDragPx(0)
    setDragging(false)
  }

  return (
    <div class={cn('flex flex-col gap-3', props.class)}>
      <div
        ref={viewport}
        class="relative overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
      >
        <div
          class={cn(
            'flex',
            count() > 1 && 'touch-pan-y cursor-grab active:cursor-grabbing',
            !dragging() && !motionReduced() && 'transition-transform duration-500 ease-out',
          )}
          style={{ transform: `translateX(calc(-${activeIndex() * 100}% + ${dragPx()}px))` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <For each={props.spaces}>{(space) => <div class="w-full shrink-0">{space.content}</div>}</For>
        </div>
      </div>

      <div role="tablist" aria-label="Spaces" class="flex items-center justify-center gap-1">
        <For each={props.spaces}>
          {(space) => {
            const isActive = () => space.id === activeId()
            return (
              <button
                type="button"
                role="tab"
                aria-selected={isActive()}
                aria-label={space.label}
                onClick={() => select(space.id)}
                class={cn(
                  'flex h-7 items-center gap-1.5 rounded-full px-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive()
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {space.icon}
                <span class={cn(!isActive() && 'sr-only sm:not-sr-only')}>{space.label}</span>
              </button>
            )
          }}
        </For>
      </div>
    </div>
  )
}
