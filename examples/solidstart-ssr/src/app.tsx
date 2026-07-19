// Root component. Imported once, on both server and client — theme/effects/motion
// don't touch the DOM at module load, so this import is SSR-safe (see
// INTEGRATIONS.md's "Server-side rendering (SSR)" section).
import '@a4ui/core/styles.css'

import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'

export default function App() {
  return (
    <Router root={(props) => <Suspense>{props.children}</Suspense>}>
      <FileRoutes />
    </Router>
  )
}
