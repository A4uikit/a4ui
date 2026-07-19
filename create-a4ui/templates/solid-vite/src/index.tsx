import { initTheme } from '@a4ui/core'
import { render } from 'solid-js/web'

import './app.css'
import { App } from './App'

initTheme()

render(() => <App />, document.getElementById('root')!)
