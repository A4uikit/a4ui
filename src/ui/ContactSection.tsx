// ContactSection — a contact form plus the business's direct contact details.
// The form posts natively to `action` (a URL or a `mailto:` link); there is no
// backend in the component.
import { Mail, MapPin, Phone } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createSignal, createUniqueId, For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Button } from './Button'
import { Card } from './Card'
import { Input } from './Input'
import { SectionHeading } from './internal/sectionKit'
import { Label } from './Label'
import { Textarea } from './Textarea'

/** A field {@link ContactSection} can render. */
export type ContactField = 'name' | 'email' | 'phone' | 'subject' | 'message'

/** Submitted values, keyed by field. Only the rendered fields are present. */
export type ContactValues = Partial<Record<ContactField, string>>

export interface ContactSectionProps {
  title?: string
  subtitle?: string
  /** Fields to render, in order. Defaults to `['name', 'email', 'message']`. */
  fields?: ContactField[]
  /** Override field and contact-detail labels, e.g. for another language. */
  labels?: Partial<Record<ContactField | 'address', string>>
  /** Submit button text. Defaults to `'Send message'`. */
  submitLabel?: string
  /**
   * Where the form posts (`method="post"`): an endpoint URL, or a `mailto:` link
   * (sent as plain text). Omit it to handle submission yourself with `onSubmit`.
   */
  action?: string
  /** Called with the values when the form submits and there is no `action`. */
  onSubmit?: (values: ContactValues) => void
  /** Email shown (and linked) beside the form. */
  email?: string
  /** Phone number shown (and linked) beside the form. */
  phone?: string
  /** Postal address shown beside the form. */
  address?: string
  /** Anchor id for in-page navigation. */
  id?: string
  class?: string
}

const DEFAULT_FIELDS: ContactField[] = ['name', 'email', 'message']
const DEFAULT_LABELS: Record<ContactField | 'address', string> = {
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  subject: 'Subject',
  message: 'Message',
  address: 'Address',
}
const INPUT_TYPE: Record<Exclude<ContactField, 'message'>, string> = {
  name: 'text',
  email: 'email',
  phone: 'tel',
  subject: 'text',
}
const AUTOCOMPLETE: Partial<Record<ContactField, string>> = { name: 'name', email: 'email', phone: 'tel' }
const REQUIRED: ReadonlySet<ContactField> = new Set(['name', 'email', 'message'])

/**
 * Contact section: a form (any of name, email, phone, subject, message) beside
 * the business's email, phone and address. With `action` the form posts
 * natively to that URL or `mailto:` link; without it, `onSubmit` receives the
 * values. Name, email and message are required.
 *
 * @example
 * ```tsx
 * <ContactSection
 *   title="Talk to us"
 *   fields={['name', 'email', 'subject', 'message']}
 *   action="https://formspree.io/f/your-id"
 *   email="hello@example.com"
 *   phone="+52 55 1234 5678"
 * />
 * ```
 */
export function ContactSection(props: ContactSectionProps): JSX.Element {
  const uid = createUniqueId()
  const fields = () => props.fields ?? DEFAULT_FIELDS
  const [values, setValues] = createSignal<ContactValues>({})
  const label = (field: ContactField | 'address') => props.labels?.[field] ?? DEFAULT_LABELS[field]
  const hasDetails = () => Boolean(props.email || props.phone || props.address)
  const isMailto = () => props.action?.startsWith('mailto:') === true

  const handleSubmit = (event: SubmitEvent) => {
    if (props.action !== undefined) return
    event.preventDefault()
    const out: ContactValues = {}
    for (const field of fields()) out[field] = values()[field] ?? ''
    props.onSubmit?.(out)
  }

  return (
    <section
      id={props.id}
      class={cn('mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-20', props.class)}
    >
      <SectionHeading title={props.title} subtitle={props.subtitle} />
      <div class={cn('grid gap-8', hasDetails() && 'lg:grid-cols-[2fr_1fr]')}>
        <Card glass class={cn('p-6 sm:p-8', !hasDetails() && 'mx-auto w-full max-w-2xl')}>
          <form
            action={props.action}
            method="post"
            enctype={isMailto() ? 'text/plain' : undefined}
            class="grid gap-5 sm:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <For each={fields()}>
              {(field) => {
                const id = `${uid}-${field}`
                const wide = field === 'message' || field === 'subject'
                const common = {
                  id,
                  name: field,
                  required: REQUIRED.has(field),
                  onInput: (value: string) => setValues((prev) => ({ ...prev, [field]: value })),
                }
                return (
                  <div class={cn('flex flex-col gap-2', wide && 'sm:col-span-2')}>
                    <Label for={id} required={REQUIRED.has(field)}>
                      {label(field)}
                    </Label>
                    <Show
                      when={field !== 'message'}
                      fallback={<Textarea {...common} rows={5} value={values()[field] ?? ''} />}
                    >
                      <Input
                        {...common}
                        value={values()[field] ?? ''}
                        type={INPUT_TYPE[field as Exclude<ContactField, 'message'>]}
                        autocomplete={AUTOCOMPLETE[field]}
                      />
                    </Show>
                  </div>
                )
              }}
            </For>
            <div class="sm:col-span-2">
              <Button type="submit" ripple class="w-full px-5 py-2.5 text-base sm:w-auto">
                {props.submitLabel ?? 'Send message'}
              </Button>
            </div>
          </form>
        </Card>

        <Show when={hasDetails()}>
          <ul class="flex flex-col gap-4">
            <Show when={props.email}>
              {(email) => (
                <Detail icon={<Mail />} label={label('email')}>
                  <a href={`mailto:${email()}`} class="break-all hover:text-primary">
                    {email()}
                  </a>
                </Detail>
              )}
            </Show>
            <Show when={props.phone}>
              {(phone) => (
                <Detail icon={<Phone />} label={label('phone')}>
                  <a href={`tel:${phone().replace(/[^\d+]/g, '')}`} class="hover:text-primary">
                    {phone()}
                  </a>
                </Detail>
              )}
            </Show>
            <Show when={props.address}>
              {(address) => (
                <Detail icon={<MapPin />} label={label('address')}>
                  <span class="whitespace-pre-line">{address()}</span>
                </Detail>
              )}
            </Show>
          </ul>
        </Show>
      </div>
    </section>
  )
}

function Detail(props: { icon: JSX.Element; label: string; children: JSX.Element }): JSX.Element {
  return (
    <li class="card flex items-start gap-4 rounded-xl p-5">
      <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary [&_svg]:h-5 [&_svg]:w-5">
        {props.icon}
      </span>
      <div class="min-w-0">
        <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">{props.label}</p>
        <p class="mt-1 text-sm text-foreground">{props.children}</p>
      </div>
    </li>
  )
}
