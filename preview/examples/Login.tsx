// Example template — Login. Full-page composition dogfooding A4ui components.
// Theme-agnostic: only semantic tokens/utilities, so it reskins under any theme.
import { createSignal, type JSX } from 'solid-js'

import { Button, Card, Checkbox, Input, Separator } from '../../src'

export default function Login(): JSX.Element {
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [remember, setRemember] = createSignal(true)

  return (
    <div class="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center py-10">
      <div class="mb-6 text-center">
        <div class="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
          A4
        </div>
        <h1 class="mt-4 text-2xl font-bold tracking-tight">Welcome back</h1>
        <p class="mt-1 text-sm text-muted-foreground">Sign in to your account to continue</p>
      </div>

      <Card glass class="p-6">
        <form class="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div class="space-y-1.5">
            <label class="text-sm font-medium" for="login-email">
              Email
            </label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email()}
              onInput={setEmail}
            />
          </div>
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium" for="login-password">
                Password
              </label>
              <a href="#" class="text-xs text-primary hover:underline">
                Forgot?
              </a>
            </div>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password()}
              onInput={setPassword}
            />
          </div>
          <Checkbox label="Remember me for 30 days" checked={remember()} onChange={setRemember} />
          <Button class="w-full" type="submit">
            Sign in
          </Button>
        </form>

        <div class="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <Separator class="flex-1" />
          or
          <Separator class="flex-1" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <Button variant="outline">GitHub</Button>
          <Button variant="outline">Google</Button>
        </div>
      </Card>

      <p class="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <a href="#" class="font-medium text-primary hover:underline">
          Sign up
        </a>
      </p>
    </div>
  )
}
