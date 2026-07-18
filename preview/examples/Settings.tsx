// Example template — Settings. Full-page composition dogfooding A4ui components.
// Theme-agnostic: only semantic tokens/utilities, so it reskins under any theme.
import { createSignal, type JSX } from 'solid-js'

import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  RadioGroup,
  Select,
  Switch,
  Tabs,
  Textarea,
} from '../../src'

export default function Settings(): JSX.Element {
  const [tab, setTab] = createSignal('profile')

  // Profile
  const [name, setName] = createSignal('Ada Lovelace')
  const [email, setEmail] = createSignal('ada@example.com')
  const [bio, setBio] = createSignal('Building delightful interfaces, one component at a time.')
  const [timezone, setTimezone] = createSignal('utc')

  // Account
  const [username, setUsername] = createSignal('ada')
  const [plan, setPlan] = createSignal('pro')
  const [twoFactor, setTwoFactor] = createSignal(true)
  const [publicProfile, setPublicProfile] = createSignal(false)

  // Notifications
  const [emailNotif, setEmailNotif] = createSignal(true)
  const [pushNotif, setPushNotif] = createSignal(false)
  const [marketingNotif, setMarketingNotif] = createSignal(false)

  return (
    <div class="mx-auto max-w-3xl space-y-6 py-8">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Settings</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Manage your profile, account, and notification preferences.
        </p>
      </div>

      <Tabs
        value={tab()}
        onChange={setTab}
        items={[
          { value: 'profile', label: 'Profile' },
          { value: 'account', label: 'Account' },
          { value: 'notifications', label: 'Notifications' },
        ]}
      />

      {tab() === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="flex items-center gap-4">
              <Avatar fallback="AL" />
              <Button variant="outline">Change photo</Button>
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="settings-name">
                Name
              </label>
              <Input id="settings-name" value={name()} onInput={setName} />
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="settings-email">
                Email
              </label>
              <Input
                id="settings-email"
                type="email"
                placeholder="you@example.com"
                value={email()}
                onInput={setEmail}
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="settings-bio">
                Bio
              </label>
              <Textarea id="settings-bio" value={bio()} onInput={setBio} />
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="settings-timezone">
                Timezone
              </label>
              <Select value={timezone()} onChange={setTimezone} aria-label="Timezone">
                <option value="">Select a timezone</option>
                <option value="utc">UTC</option>
                <option value="est">Eastern (ET)</option>
                <option value="cst">Central (CT)</option>
                <option value="mst">Mountain (MT)</option>
                <option value="pst">Pacific (PT)</option>
              </Select>
            </div>

            <div class="flex justify-end">
              <Button>Save changes</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tab() === 'account' && (
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="settings-username">
                Username
              </label>
              <Input id="settings-username" value={username()} onInput={setUsername} />
            </div>

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
              <Switch label="Two-factor authentication" checked={twoFactor()} onChange={setTwoFactor} />
              <Switch label="Public profile" checked={publicProfile()} onChange={setPublicProfile} />
            </div>
          </CardContent>
        </Card>
      )}

      {tab() === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <Switch label="Email notifications" checked={emailNotif()} onChange={setEmailNotif} />
            <Switch label="Push notifications" checked={pushNotif()} onChange={setPushNotif} />
            <Switch label="Marketing emails" checked={marketingNotif()} onChange={setMarketingNotif} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
