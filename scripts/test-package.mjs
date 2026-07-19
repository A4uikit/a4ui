#!/usr/bin/env node
/**
 * Validates the PUBLISHED package tarball for @a4ui/core.
 *
 * This script:
 *   1. Packs the repo with `npm pack` to produce the exact tarball npm would publish.
 *   2. Installs that tarball (plus solid-js) into a throwaway temp project.
 *   3. Asserts the expected dist files exist in the installed package.
 *   4. Asserts the package.json `exports` map exposes the expected subpaths
 *      (core, commerce, charts, preset, styles.css, full.css, elements, package.json).
 *   5. Asserts A4UI_VERSION (in the published src/index.ts) === package.json version.
 *   6. Resolves core + /commerce + /charts from a real Node importer (catches a
 *      broken exports map). It RESOLVES, not executes — the components are client
 *      Solid code that can't run in bare Node; SSR consumers use the `solid` condition.
 *
 * It cleans up the temp dir and the generated tarball on exit, whether it
 * succeeds or fails.
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// fileURLToPath (not `new URL(...).pathname`) so repo paths containing spaces or
// other URL-escaped characters resolve to a real filesystem path.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const REQUIRED_DIST_FILES = [
  'dist/index.js',
  'dist/index.d.ts',
  'dist/styles.css',
  'dist/full.css',
  'dist/elements.js',
  'dist/elements.css',
  'dist/commerce.js',
  'dist/commerce/index.d.ts',
  'dist/charts.js',
  'dist/charts/index.d.ts',
  'preset.js',
]

const REQUIRED_EXPORT_KEYS = [
  '.',
  './commerce',
  './charts',
  './preset',
  './styles.css',
  './full.css',
  './elements',
  './elements.css',
  './package.json',
]

/** @type {string[]} */
const checks = []

function pass(label) {
  checks.push(`  ✓ ${label}`)
}

function fail(label, detail) {
  const suffix = detail ? `: ${detail}` : ''
  throw new Error(`${label}${suffix}`)
}

function main() {
  let tarballPath = null
  let tmpDir = null

  try {
    // 1. Pack the repo.
    console.log('Packing repo with `npm pack`...')
    const packOutput = execSync('npm pack --silent', {
      cwd: repoRoot,
      encoding: 'utf8',
    })
    const lines = packOutput.trim().split('\n').filter(Boolean)
    const tarballName = lines[lines.length - 1].trim()
    tarballPath = path.resolve(repoRoot, tarballName)

    if (!fs.existsSync(tarballPath)) {
      fail('npm pack did not produce the expected tarball', `expected file at ${tarballPath}`)
    }
    pass(`npm pack produced ${tarballName}`)

    // 2. Create a fresh temp dir with a minimal package.json.
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a4ui-pkg-test-'))
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ type: 'module', private: true }, null, 2),
    )
    pass(`created temp project at ${tmpDir}`)

    // 3. Install the tarball + solid-js into the temp project.
    console.log('Installing tarball + solid-js into temp project...')
    execSync(`npm install ${JSON.stringify(tarballPath)} solid-js --no-audit --no-fund --silent`, {
      cwd: tmpDir,
      encoding: 'utf8',
      stdio: 'pipe',
    })
    pass('installed tarball and solid-js')

    // 4. Assert required dist files exist.
    const pkgDir = path.join(tmpDir, 'node_modules', '@a4ui', 'core')
    if (!fs.existsSync(pkgDir)) {
      fail('installed package directory not found', pkgDir)
    }

    for (const relFile of REQUIRED_DIST_FILES) {
      const filePath = path.join(pkgDir, relFile)
      if (!fs.existsSync(filePath)) {
        fail(`missing required file in published package: ${relFile}`, filePath)
      }
      pass(`found ${relFile}`)
    }

    // 5. Assert package.json exports map has the required keys.
    const installedPkgJsonPath = path.join(pkgDir, 'package.json')
    if (!fs.existsSync(installedPkgJsonPath)) {
      fail('installed package.json not found', installedPkgJsonPath)
    }
    const installedPkgJson = JSON.parse(fs.readFileSync(installedPkgJsonPath, 'utf8'))
    const exportsMap = installedPkgJson.exports
    if (!exportsMap || typeof exportsMap !== 'object') {
      fail('installed package.json has no `exports` map')
    }

    for (const key of REQUIRED_EXPORT_KEYS) {
      if (!Object.prototype.hasOwnProperty.call(exportsMap, key)) {
        fail(`missing required exports entry: "${key}"`)
      }
      pass(`exports entry "${key}" present`)
    }

    // 6. Version sync: A4UI_VERSION (hand-written in the entry) must match
    //    package.json. Read the PUBLISHED src/index.ts — this also proves the
    //    `files` allowlist actually ships the source the `solid` SSR condition needs.
    const srcIndexPath = path.join(pkgDir, 'src', 'index.ts')
    if (!fs.existsSync(srcIndexPath)) {
      fail('published package is missing src/index.ts (needed for the `solid` SSR condition)', srcIndexPath)
    }
    const versionMatch = fs.readFileSync(srcIndexPath, 'utf8').match(/A4UI_VERSION\s*=\s*'([^']+)'/)
    if (!versionMatch) {
      fail('could not find A4UI_VERSION in published src/index.ts')
    }
    if (versionMatch[1] !== installedPkgJson.version) {
      fail('A4UI_VERSION out of sync with package.json', `${versionMatch[1]} !== ${installedPkgJson.version}`)
    }
    pass(`A4UI_VERSION (${versionMatch[1]}) matches package.json`)

    // 7. Resolve each public JS entry from a real Node importer — catches broken
    //    exports maps / wrong condition order / missing targets. We RESOLVE rather
    //    than execute: A4ui components are client Solid code and executing the barrel
    //    in bare Node (server-solid resolution) throws in lucide-solid at import
    //    time; SSR consumers use the `solid` condition + Solid's compiler instead.
    const testModulePath = path.join(tmpDir, 'test-import.mjs')
    fs.writeFileSync(
      testModulePath,
      [
        "for (const spec of ['@a4ui/core', '@a4ui/core/commerce', '@a4ui/core/charts']) {",
        '  const url = import.meta.resolve(spec);',
        "  if (!url) throw new Error('could not resolve ' + spec);",
        "  console.log('resolved', spec, '->', url);",
        '}',
        '',
      ].join('\n'),
    )

    console.log('Resolving public entry points from Node...')
    execSync(`node ${JSON.stringify(testModulePath)}`, {
      cwd: tmpDir,
      encoding: 'utf8',
      stdio: 'pipe',
    })
    pass("resolved '@a4ui/core' (+ /commerce, /charts) from a real Node importer")

    console.log('\nPackage validation summary:')
    console.log(checks.join('\n'))
    console.log('\n✓ All checks passed.')
    process.exitCode = 0
  } catch (err) {
    console.log('\nPackage validation summary:')
    if (checks.length > 0) {
      console.log(checks.join('\n'))
    }
    const message = err && err.stdout ? `${err.message}\n${err.stdout}` : (err?.message ?? String(err))
    console.error(`\n✗ Package validation failed: ${message}`)
    process.exitCode = 1
  } finally {
    // 7. Clean up temp dir and tarball.
    if (tmpDir) {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true })
      } catch (cleanupErr) {
        console.error(`Warning: failed to remove temp dir ${tmpDir}: ${cleanupErr.message}`)
      }
    }
    if (tarballPath) {
      try {
        fs.rmSync(tarballPath, { force: true })
      } catch (cleanupErr) {
        console.error(`Warning: failed to remove tarball ${tarballPath}: ${cleanupErr.message}`)
      }
    }
  }
}

main()
