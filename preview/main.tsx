import { render } from 'solid-js/web'

// The two stylesheets a4ui ships as `a4ui/styles.css` (tokens + starfield).
import '../src/styles/tokens.css'
import '../src/styles/space.css'
// Tailwind (base + the glass plugin from preset.js + utilities).
import './app.css'

import { App } from './App'

render(() => <App />, document.getElementById('root')!)
