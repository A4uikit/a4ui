import { render } from 'solid-js/web'

// The two stylesheets a4ui ships as `a4ui/styles.css` (tokens + starfield).
import '../src/styles/tokens.css'
import '../src/styles/space.css'
// Tailwind (base + the glass plugin from preset.js + utilities).
import './app.css'

import { App } from './App'

render(() => <App />, document.getElementById('root')!)

// The eager shell (AppShell + Home) has mounted synchronously by now — drop the
// zero-JS splash so it doesn't sit on top of the real UI.
document.getElementById('app-splash')?.remove()
