// Single "visual effects" toggle. Pressed (default) = full space-glass
// experience: translucent glass, starfield, animations. Un-press it for calm
// mode (opaque surfaces, no starfield, no motion) — friendlier for contrast,
// motion sensitivity and low-power devices.
import { Sparkles } from 'lucide-solid'

import { setEffects, useEffects } from '../lib/effects'

interface EffectsToggleProps {
  label?: string
}

export function EffectsToggle(props: EffectsToggleProps) {
  const on = useEffects()
  return (
    <button
      type="button"
      class="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground aria-pressed:text-primary"
      aria-pressed={on()}
      aria-label={props.label ?? 'Visual effects'}
      title={
        on()
          ? 'Visual effects on — click for calm mode'
          : 'Calm mode — click to enable effects'
      }
      onClick={() => setEffects(!on())}
    >
      <Sparkles class="h-[18px] w-[18px]" />
    </button>
  )
}
