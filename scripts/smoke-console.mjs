// Local runtime smoke test: loads every docs page (components + examples) in a
// headless browser and fails if any logs a pageerror / console.error / (real)
// console.warning. Catches runtime breakages that typecheck + the render suite
// don't — e.g. a bad prop path, a thrown effect, a dev-only React/Solid warning.
//
// Runs in the pre-push hook (not CI, not per-commit). Skip a one-off with
// `SKIP_SMOKE=1 git push` or `git push --no-verify`. It boots its own preview
// server on a dedicated port and tears it down, so it needs nothing running.
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'

import { chromium } from '@playwright/test'

if (process.env.SKIP_SMOKE) {
  console.log('smoke: skipped (SKIP_SMOKE set)')
  process.exit(0)
}

const PORT = 5177
const BASE = `http://localhost:${PORT}`

// DocEntry ids: `id` followed by `title:` AND `group:` (so demo-data rows like
// `{ id: '1', title: 'Acme' }` aren't mistaken for pages). Plus example ids.
const reg = readFileSync('preview/registry.tsx', 'utf8')
const comp = [...reg.matchAll(/id: '([^']+)',\s*title: '[^']*',\s*group:/g)].map((m) => m[1])
const ex = [...readFileSync('preview/examples/registry.ts', 'utf8').matchAll(/id: '([^']+)'/g)].map(
  (m) => m[1],
)
const routes = [...comp.map((id) => `#/${id}`), ...ex.map((id) => `#/examples/${id}`)]

// Launch the bundled chromium. If it isn't installed, don't block the push —
// just tell the dev how to enable the check.
let browser
try {
  browser = await chromium.launch()
} catch {
  console.log('smoke: skipped — chromium not available (run `npx playwright install chromium`).')
  process.exit(0)
}

// Boot a private preview server (own port, own process group so we can kill it).
const server = spawn(
  'npx',
  ['vite', '--config', 'vite.preview.config.ts', '--port', String(PORT), '--strictPort'],
  { stdio: 'ignore', detached: true },
)
const stopServer = () => {
  try {
    process.kill(-server.pid, 'SIGTERM')
  } catch {
    /* already gone */
  }
}
process.on('exit', stopServer)

let up = false
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(BASE)).ok) {
      up = true
      break
    }
  } catch {
    /* not ready */
  }
  await sleep(500)
}
if (!up) {
  console.error(`smoke: preview server failed to start on ${BASE}`)
  stopServer()
  await browser.close()
  process.exit(1)
}

const ctx = await browser.newContext({ viewport: { width: 1200, height: 800 } })
const IGNORE_WARN = /DevTools|source ?map|\[vite\]|Download the React/i

async function visit(route) {
  const page = await ctx.newPage()
  const msgs = []
  page.on('pageerror', (e) => msgs.push('pageerror: ' + e.message.slice(0, 160)))
  page.on('console', (m) => {
    const t = m.type()
    if (t === 'error') msgs.push('console.error: ' + m.text().slice(0, 160))
    else if (t === 'warning' && !IGNORE_WARN.test(m.text()))
      msgs.push('console.warn: ' + m.text().slice(0, 140))
  })
  try {
    await page.goto(`${BASE}/${route}`, { waitUntil: 'domcontentloaded', timeout: 12000 })
    await sleep(300)
  } catch {
    msgs.push('load-failed')
  }
  await page.close()
  return [...new Set(msgs)]
}

// Concurrent first pass.
const problems = new Map()
let idx = 0
async function worker() {
  while (idx < routes.length) {
    const route = routes[idx++]
    const msgs = await visit(route)
    if (msgs.length) problems.set(route, msgs)
  }
}
await Promise.all(Array.from({ length: 10 }, worker))

// Retry pages whose ONLY issue was `load-failed` — under concurrency the dev
// server occasionally stalls one navigation; a clean sequential retry clears it.
for (const [route, msgs] of [...problems]) {
  if (msgs.length === 1 && msgs[0] === 'load-failed') {
    const retry = await visit(route)
    if (retry.length === 0) problems.delete(route)
    else problems.set(route, retry)
  }
}

await browser.close()
stopServer()

if (problems.size) {
  console.error(`\nsmoke: ${problems.size}/${routes.length} page(s) have runtime issues:`)
  for (const [route, msgs] of problems) console.error(`  ${route} → ${msgs.join(' | ')}`)
  process.exit(1)
}
console.log(`smoke: ${routes.length} pages clean ✅`)
process.exit(0)
