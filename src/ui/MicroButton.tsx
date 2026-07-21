// MicroButton — small icon/label button that plays a short, physically-tuned
// feedback micro-animation on interaction: spin, shake, pulse, ring, sparkle
// (on click), or a diagonal glare sweep (on hover). Every effect animates only
// transform/opacity (never layout), and decorative particles spawn then
// remove themselves — the same one-shot pattern as spawnRipple in Ripple.tsx.
// No-op (plain static button) under reduced motion.
import { type JSX, Show, splitProps } from 'solid-js'

import { cn } from '../lib/cn'
import { animate, motionReduced, stagger } from '../lib/motion'

/** Feedback micro-animation a {@link MicroButton} plays. Defaults to `'ring'`. */
export type MicroButtonEffect = 'spin' | 'shake' | 'pulse' | 'ring' | 'sparkle' | 'glare'

/** Visual style of a {@link MicroButton}. Defaults to `'solid'`. */
export type MicroButtonVariant = 'solid' | 'ghost' | 'outline'

const VARIANT_CLASSES: Record<MicroButtonVariant, string> = {
  solid: 'bg-primary text-primary-foreground',
  ghost: 'text-foreground hover:bg-muted',
  outline: 'border border-border text-foreground',
}

const BASE =
  'micro-button relative inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'

const PARTICLE_BASE = 'pointer-events-none absolute will-change-transform'

export interface MicroButtonProps {
  children?: JSX.Element
  /** Feedback micro-animation. `'glare'` plays on hover; the rest play on click. @default 'ring' */
  effect?: MicroButtonEffect
  onClick?: (e: MouseEvent) => void
  /** Visual style. @default 'solid' */
  variant?: MicroButtonVariant
  disabled?: boolean
  class?: string
  'aria-label'?: string
}

/**
 * Small icon/label button that plays a short feedback micro-animation on
 * interaction — spin, shake, pulse, ring, or sparkle on click, or a diagonal
 * glare sweep on hover. Every effect animates only `transform`/`opacity`, so
 * it stays cheap even on low-end devices; decorative particles are spawned
 * and removed on completion, never left in the DOM. Renders a plain static
 * `<button>` with no effect under reduced motion.
 *
 * @example
 * ```tsx
 * <MicroButton effect="sparkle" aria-label="Like">
 *   <Heart size={16} />
 * </MicroButton>
 * ```
 */
export function MicroButton(props: MicroButtonProps): JSX.Element {
  const [local, rest] = splitProps(props, ['children', 'effect', 'onClick', 'variant', 'disabled', 'class'])

  let buttonEl!: HTMLButtonElement
  let contentEl!: HTMLSpanElement
  let glareEl: HTMLSpanElement | undefined
  let spins = 0

  // Every in-flight animation registers a stopper here so onCleanup can halt
  // it (and any pending particle removal) if the button unmounts mid-effect.
  const activeStops = new Set<() => void>()

  const track = (stop: () => void): (() => void) => {
    activeStops.add(stop)
    return () => activeStops.delete(stop)
  }

  const trackTransient = (controls: ReturnType<typeof animate>): void => {
    const untrack = track(() => controls.stop())
    controls.then(untrack)
  }

  const spawnParticle = (build: (el: HTMLSpanElement) => void): HTMLSpanElement => {
    const el = document.createElement('span')
    el.setAttribute('aria-hidden', 'true')
    el.className = PARTICLE_BASE
    build(el)
    buttonEl.appendChild(el)
    return el
  }

  const trackParticle = (el: HTMLSpanElement, controls: ReturnType<typeof animate>): void => {
    const untrack = track(() => controls.stop())
    const finish = (): void => {
      untrack()
      el.remove()
    }
    controls.then(finish)
  }

  const playSpin = (): void => {
    spins += 360
    trackTransient(animate(contentEl, { rotate: spins }, { type: 'spring', stiffness: 180, damping: 14 }))
  }

  const playShake = (): void => {
    trackTransient(animate(contentEl, { x: [0, -4, 4, -3, 3, 0] }, { duration: 0.4, ease: 'easeInOut' }))
  }

  const spawnRing = (delay: number): void => {
    const el = spawnParticle((e) => {
      e.classList.add('inset-0', 'rounded-full', 'border-2', 'border-current')
    })
    trackParticle(
      el,
      animate(el, { scale: [1, 1.8], opacity: [0.6, 0] }, { duration: 0.7, delay, ease: 'easeOut' }),
    )
  }

  const playRing = (): void => spawnRing(0)

  const playPulse = (): void => {
    spawnRing(0)
    spawnRing(0.15)
  }

  const playSparkle = (): void => {
    const count = 6
    const radius = 20
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const dx = Math.cos(angle) * radius
      const dy = Math.sin(angle) * radius
      const el = spawnParticle((e) => {
        e.classList.add('left-1/2', 'top-1/2', 'h-1', 'w-1', 'rounded-full', 'bg-current')
        e.style.marginLeft = '-2px'
        e.style.marginTop = '-2px'
      })
      trackParticle(
        el,
        animate(
          el,
          { x: [0, dx], y: [0, dy], rotate: [0, 180], opacity: [1, 0], scale: [1, 0.4] },
          { duration: 0.55, delay: stagger(0.03)(i, count), ease: 'easeOut' },
        ),
      )
    }
  }

  const handleClick = (event: MouseEvent): void => {
    local.onClick?.(event)
    if (local.disabled || motionReduced()) return
    switch (local.effect ?? 'ring') {
      case 'spin':
        playSpin()
        break
      case 'shake':
        playShake()
        break
      case 'pulse':
        playPulse()
        break
      case 'sparkle':
        playSparkle()
        break
      case 'ring':
        playRing()
        break
      // 'glare' plays on hover, not click — see handlePointerEnter.
    }
  }

  const handlePointerEnter = (): void => {
    if ((local.effect ?? 'ring') !== 'glare' || !glareEl || motionReduced()) return
    trackTransient(
      animate(glareEl, { x: ['-100%', '250%'], opacity: [0, 1, 0] }, { duration: 0.6, ease: 'easeInOut' }),
    )
  }

  return (
    <button
      ref={buttonEl}
      type="button"
      class={cn(
        BASE,
        VARIANT_CLASSES[local.variant ?? 'solid'],
        (local.effect ?? 'ring') === 'glare' && 'overflow-hidden',
        local.class,
      )}
      disabled={local.disabled}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      {...rest}
    >
      <span
        ref={contentEl}
        class="relative inline-flex items-center justify-center gap-2 will-change-transform"
      >
        {local.children}
      </span>
      <Show when={(local.effect ?? 'ring') === 'glare'}>
        <span
          ref={glareEl}
          aria-hidden="true"
          class="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-foreground/25 to-transparent opacity-0 will-change-transform"
        />
      </Show>
    </button>
  )
}
