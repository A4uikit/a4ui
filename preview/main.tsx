import { render } from 'solid-js/web'

// The two stylesheets a4ui ships as `a4ui/styles.css` (tokens + starfield).
import '../src/styles/tokens.css'
import '../src/styles/space.css'
// Tailwind (base + the glass plugin from preset.js + utilities).
import './app.css'

import { App } from './App'

const root = document.getElementById('root')!

// Let the browser actually PAINT the zero-JS splash (in index.html) before the
// heavy first render runs. A synchronous render() clears #root and mounts the
// app in the same task — wiping the splash before it ever shows, so the SPA
// still felt blank on slow mobile. Double rAF = "after the next paint": frame 1
// paints the splash (that's FCP), frame 2 mounts the app and drops the splash.
requestAnimationFrame(() =>
  requestAnimationFrame(() => {
    render(() => <App />, root)
    document.getElementById('app-splash')?.remove()
  }),
)
