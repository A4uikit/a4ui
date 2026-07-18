// Example template — Onboarding wizard. Full-page composition dogfooding A4ui components.
// Theme-agnostic: only semantic tokens/utilities, so it reskins under any theme.
import { createSignal, Show, type JSX } from 'solid-js'

import {
  Button,
  Card,
  CardContent,
  Input,
  Progress,
  RadioGroup,
  Result,
  Select,
  Stepper,
  Switch,
  Textarea,
} from '../../src'

const STEPS = [
  { label: 'Account', description: 'Your details' },
  { label: 'Profile', description: 'About you' },
  { label: 'Preferences', description: 'Fine-tune' },
  { label: 'Done', description: 'All set' },
]

export default function Onboarding(): JSX.Element {
  const [step, setStep] = createSignal(0)

  // Account
  const [name, setName] = createSignal('')
  const [email, setEmail] = createSignal('')

  // Profile
  const [company, setCompany] = createSignal('')
  const [role, setRole] = createSignal('')
  const [bio, setBio] = createSignal('')

  // Preferences
  const [plan, setPlan] = createSignal('pro')
  const [newsletter, setNewsletter] = createSignal(true)
  const [productUpdates, setProductUpdates] = createSignal(false)

  const clamp = (n: number) => Math.max(0, Math.min(3, n))
  const next = () => setStep((s) => clamp(s + 1))
  const back = () => setStep((s) => clamp(s - 1))

  const progress = () => Math.round((step() / (STEPS.length - 1)) * 100)

  return (
    <div class="mx-auto max-w-2xl space-y-6 py-8">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Set up your workspace</h1>
        <p class="mt-1 text-sm text-muted-foreground">A few quick steps to get you started.</p>
      </div>

      <Stepper steps={STEPS} active={step()} onStepClick={(i) => setStep(clamp(i))} />

      <Progress value={progress()} label="Overall progress" />

      <Card>
        <CardContent class="space-y-6 pt-6">
          <Show when={step() === 0}>
            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="onboarding-name">
                Full name
              </label>
              <Input id="onboarding-name" placeholder="Ada Lovelace" value={name()} onInput={setName} />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="onboarding-email">
                Email
              </label>
              <Input
                id="onboarding-email"
                type="email"
                placeholder="you@example.com"
                value={email()}
                onInput={setEmail}
              />
            </div>
          </Show>

          <Show when={step() === 1}>
            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="onboarding-company">
                Company
              </label>
              <Input id="onboarding-company" placeholder="Acme Inc." value={company()} onInput={setCompany} />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="onboarding-role">
                Role
              </label>
              <Select value={role()} onChange={setRole} aria-label="Role" id="onboarding-role">
                <option value="">Select a role</option>
                <option value="engineer">Engineer</option>
                <option value="designer">Designer</option>
                <option value="pm">Product Manager</option>
                <option value="founder">Founder</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="onboarding-bio">
                Bio
              </label>
              <Textarea
                id="onboarding-bio"
                placeholder="Tell us a little about yourself…"
                value={bio()}
                onInput={setBio}
              />
            </div>
          </Show>

          <Show when={step() === 2}>
            <RadioGroup
              label="Plan"
              value={plan()}
              onChange={setPlan}
              options={[
                { value: 'free', label: 'Free' },
                { value: 'pro', label: 'Pro' },
                { value: 'team', label: 'Team' },
              ]}
            />
            <div class="space-y-4">
              <Switch label="Subscribe to newsletter" checked={newsletter()} onChange={setNewsletter} />
              <Switch
                label="Email me product updates"
                checked={productUpdates()}
                onChange={setProductUpdates}
              />
            </div>
          </Show>

          <Show when={step() === 3}>
            <Result
              status="success"
              title="You're all set!"
              description="Your workspace is ready. Jump in and start building."
              actions={<Button onClick={() => setStep(0)}>Go to dashboard</Button>}
            />
          </Show>

          <Show when={step() < 3}>
            <div class="flex items-center justify-between pt-2">
              <Button variant="outline" disabled={step() === 0} onClick={back}>
                Back
              </Button>
              <Button onClick={next}>{step() === 2 ? 'Finish' : 'Next'}</Button>
            </div>
          </Show>
        </CardContent>
      </Card>
    </div>
  )
}
