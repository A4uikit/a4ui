#!/usr/bin/env node
/**
 * Keeps the hand-exported `A4UI_VERSION` constant in `src/index.ts` in sync with
 * `package.json` — they're two sources of truth otherwise, and drift ships a
 * wrong version string to consumers. Runs automatically as `prebuild`, so every
 * build (and thus every publish, via `prepublishOnly`) rewrites it to match.
 * `test:package` asserts the two agree as a backstop.
 *
 * Exits non-zero only if `src/index.ts` has no A4UI_VERSION declaration to update.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'))
const indexPath = path.join(repoRoot, 'src', 'index.ts')

const src = fs.readFileSync(indexPath, 'utf8')
const re = /(A4UI_VERSION\s*=\s*')([^']+)(')/
if (!re.test(src)) {
  console.error('sync-version: no A4UI_VERSION declaration found in src/index.ts')
  process.exit(1)
}

const current = src.match(re)[2]
if (current === pkg.version) {
  console.log(`sync-version: A4UI_VERSION already ${pkg.version}`)
} else {
  fs.writeFileSync(indexPath, src.replace(re, `$1${pkg.version}$3`))
  console.log(`sync-version: A4UI_VERSION ${current} -> ${pkg.version}`)
}
