// Web Components entry (`@a4ui/core/elements`) — a curated subset of A4ui's
// presentational components registered as framework-agnostic custom elements so
// they can be used from React/Next.js, Vue, Svelte, or plain HTML.
//
// Design notes:
// - Each element renders in LIGHT DOM (noShadowDOM) so the global stylesheet
//   (`@a4ui/core/elements.css`) and CSS theme variables apply normally — Shadow
//   DOM would isolate the Tailwind utility classes the components rely on.
// - Props map to attributes/properties (solid-element coerces by the declared
//   default's type: number/boolean/string). Text content is taken from a `label`
//   or `text` attribute, falling back to the element's initial text.
// - Only leaf, primitive-prop components are wrapped. Rich/interactive/portalled
//   components (Modal, Combobox, DataGrid, …) remain SolidJS-only — see the docs.
//
// This bundle is self-contained (solid-js is bundled in), so non-Solid apps need
// no Solid toolchain: `import '@a4ui/core/elements'` once, then use the tags.
import { customElement, noShadowDOM } from 'solid-element'
import type { JSX } from 'solid-js'

import { ConditionScale } from './commerce/ConditionScale'
import { Alert, type AlertTone } from './ui/Alert'
import { AnnouncementBar, type AnnouncementTone } from './ui/AnnouncementBar'
import { Avatar } from './ui/Avatar'
import { Badge, type BadgeTone } from './ui/Badge'
import { Button, type ButtonVariant } from './ui/Button'
import { Clock } from './ui/Clock'
import { Countdown } from './ui/Countdown'
import { Kbd } from './ui/Kbd'
import { Meter } from './ui/Meter'
import { Progress } from './ui/Progress'
import { Rating } from './ui/Rating'
import { RingProgress } from './ui/RingProgress'
import { Separator } from './ui/Separator'
import { Spinner } from './ui/Spinner'
import { Stat, type StatTone } from './ui/Stat'

/** The initial text an author put between the tags, before Solid renders over it. */
function initialText(element: unknown): string {
  return ((element as HTMLElement).textContent ?? '').trim()
}

/** Register every A4ui custom element. Import for its side effect. */
export function defineA4uiElements(): void {
  customElement(
    'a4-button',
    { variant: 'primary', disabled: false, type: 'button', label: '' },
    (props, { element }): JSX.Element => {
      noShadowDOM()
      const text = props.label || initialText(element)
      return (
        <Button
          variant={props.variant as ButtonVariant}
          disabled={props.disabled}
          type={props.type as 'button' | 'submit' | 'reset'}
        >
          {text}
        </Button>
      )
    },
  )

  customElement('a4-badge', { tone: 'neutral', label: '' }, (props, { element }): JSX.Element => {
    noShadowDOM()
    return <Badge tone={props.tone as BadgeTone}>{props.label || initialText(element)}</Badge>
  })

  customElement(
    // `heading`, not `title` — the latter is a global HTML attribute and would
    // clash with the element's native `title` (tooltip) property.
    'a4-alert',
    { tone: 'info', heading: '', text: '' },
    (props, { element }): JSX.Element => {
      noShadowDOM()
      return (
        <Alert tone={props.tone as AlertTone} title={props.heading || undefined}>
          {props.text || initialText(element)}
        </Alert>
      )
    },
  )

  customElement('a4-spinner', { label: 'Loading' }, (props): JSX.Element => {
    noShadowDOM()
    return <Spinner label={props.label} />
  })

  customElement('a4-avatar', { src: '', alt: '', fallback: '' }, (props): JSX.Element => {
    noShadowDOM()
    return <Avatar src={props.src || undefined} alt={props.alt} fallback={props.fallback || ''} />
  })

  customElement('a4-progress', { value: 0, max: 100, label: '' }, (props): JSX.Element => {
    noShadowDOM()
    return <Progress value={props.value} max={props.max} label={props.label || undefined} />
  })

  customElement('a4-meter', { value: 0, max: 100, label: '' }, (props): JSX.Element => {
    noShadowDOM()
    return <Meter value={props.value} max={props.max} label={props.label || undefined} />
  })

  customElement('a4-ring-progress', { value: 0, size: 96, thickness: 8, label: '' }, (props): JSX.Element => {
    noShadowDOM()
    return (
      <RingProgress
        value={props.value}
        size={props.size}
        thickness={props.thickness}
        label={props.label || undefined}
      />
    )
  })

  customElement('a4-stat', { label: '', value: 0, tone: 'neutral' }, (props): JSX.Element => {
    noShadowDOM()
    return <Stat label={props.label} value={props.value} tone={props.tone as StatTone} />
  })

  customElement('a4-kbd', { label: '' }, (props, { element }): JSX.Element => {
    noShadowDOM()
    return <Kbd>{props.label || initialText(element)}</Kbd>
  })

  customElement(
    'a4-condition-scale',
    { value: 0, min: 1, max: 10, showvalue: true },
    (props): JSX.Element => {
      noShadowDOM()
      return (
        <ConditionScale value={props.value} min={props.min} max={props.max} showValue={props.showvalue} />
      )
    },
  )

  customElement(
    'a4-announcement-bar',
    { tone: 'primary', dismissible: false, coupon: '', href: '', label: '' },
    (props, { element }): JSX.Element => {
      noShadowDOM()
      return (
        <AnnouncementBar
          tone={props.tone as AnnouncementTone}
          dismissible={props.dismissible}
          couponCode={props.coupon || undefined}
          href={props.href || undefined}
        >
          {props.label || initialText(element)}
        </AnnouncementBar>
      )
    },
  )

  customElement('a4-separator', { orientation: 'horizontal' }, (props): JSX.Element => {
    noShadowDOM()
    return <Separator orientation={props.orientation as 'horizontal' | 'vertical'} />
  })

  customElement('a4-rating', { value: 0, max: 5, readonly: false }, (props, { element }): JSX.Element => {
    noShadowDOM()
    return (
      <Rating
        value={props.value}
        max={props.max}
        readonly={props.readonly}
        onChange={(v) =>
          (element as unknown as HTMLElement).dispatchEvent(new CustomEvent('change', { detail: v }))
        }
      />
    )
  })

  customElement('a4-countdown', { to: '' }, (props): JSX.Element => {
    noShadowDOM()
    // eslint-disable-next-line solid/reactivity -- read the `to` attribute once to fix the target
    const target = props.to ? new Date(props.to) : new Date(Date.now() + 86_400_000)
    return <Countdown to={target} />
  })

  customElement(
    'a4-clock',
    { variant: 'digital', seconds: true, hour12: false, timezone: '', size: 160 },
    (props): JSX.Element => {
      noShadowDOM()
      return (
        <Clock
          variant={props.variant as 'digital' | 'analog'}
          seconds={props.seconds}
          hour12={props.hour12}
          timeZone={props.timezone || undefined}
          size={props.size}
        />
      )
    },
  )
}

// Registering on import is the ergonomic default for `import '@a4ui/core/elements'`.
defineA4uiElements()
