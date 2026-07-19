// SSR-safe A4ui components only — no imperative backdrops (SpaceBackground,
// ThemedScenery, …) here; those are client-only and would need `clientOnly()`.
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Stat } from '@a4ui/core'

export default function Home() {
  return (
    <main class="p-8">
      <Card glass>
        <CardHeader>
          <CardTitle>A4ui + SolidStart (SSR)</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <Badge tone="success">Server-rendered</Badge>
          <Stat label="Active users" value={1204} />
          <Button variant="primary">Save</Button>
        </CardContent>
      </Card>
    </main>
  )
}
