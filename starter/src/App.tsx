import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Stat, ThemeToggle } from '@a4ui/core'
import type { JSX } from 'solid-js'

export function App(): JSX.Element {
  return (
    <div class="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div class="w-full max-w-lg space-y-4">
        <header class="flex items-center justify-between">
          <h1 class="text-2xl font-semibold">A4ui Starter</h1>
          <ThemeToggle />
        </header>

        <Card glass>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              Welcome
              <Badge tone="success">ready</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <p class="text-sm text-muted-foreground">
              Edit <code>src/App.tsx</code> and start building with `@a4ui/core`.
            </p>

            <div class="grid grid-cols-2 gap-4">
              <Stat label="Components" value={80} tone="primary" />
              <Stat label="Themes" value={6} tone="success" delay={0.1} />
            </div>

            <Button variant="primary">Get started</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
