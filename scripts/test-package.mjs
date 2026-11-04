#!/usr/bin/env node
/**
 * Validates the PUBLISHED package tarball for @a4ui/core.
 *
 * This script:
 *   1. Packs the repo with `npm pack` to produce the exact tarball npm would publish.
 *   2. Installs that tarball (plus solid-js) into a throwaway temp project.
 *   3. Asserts the expected dist files exist in the installed package.
 *   4. Asserts the package.json `exports` map exposes the expected subpaths
 *      (core, commerce, charts, preset, styles.css, full.css, theme.css, elements, package.json).
 *   5. Asserts A4UI_VERSION (in the published src/index.ts) === package.json version.
 *   6. Resolves core + /commerce + /charts from a real Node importer (catches a
 *      broken exports map). It RESOLVES, not executes — the components are client
 *      Solid code that can't run in bare Node; SSR consumers use the `solid` condition.
 *   7. Installs the tarball next to real Tailwind 4 and compiles `theme.css`: its
 *      `@source` paths must find the components from an installed location, and
 *      loading the Tailwind 3 preset there must fail with an actionable message.
 *
 * It cleans up the temp dir and the generated tarball on exit, whether it
 * succeeds or fails.
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// fileURLToPath (not `new URL(...).pathname`) so repo paths containing spaces or
// other URL-escaped characters resolve to a real filesystem path.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)

const REQUIRED_DIST_FILES = [
  'dist/index.js',
  'dist/index.d.ts',
  'dist/styles.css',
  'dist/full.css',
  'dist/theme.css',
  'dist/elements.js',
  'dist/elements.css',
  'dist/commerce.js',
  'dist/commerce/index.d.ts',
  'dist/charts.js',
  'dist/charts/index.d.ts',
  'preset.js',
  'preset.d.ts',
]

const REQUIRED_EXPORT_KEYS = [
  '.',
  './commerce',
  './charts',
  './preset',
  './styles.css',
  './full.css',
  './theme.css',
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

// Compiles the documented Tailwind 4 setup in a project where the package is a real
// directory under node_modules, the way a registry install leaves it.
// Tailwind 3 output run through the CSS minifier Vite 8 uses. A prefixed
// declaration placed after its standard twin makes the minifier drop the standard
// one, and Chromium then renders glass with no blur at all. The docs and Playwright
// run unminified in dev, so only a real minify pass can catch this.
function checkGlassSurvivesMinify() {
  const css = execSync(
    `node --input-type=module -e "
      import postcss from 'postcss'
      import tailwind from 'tailwindcss'
      import preset from './preset.js'
      const config = { presets: [preset], content: [{ raw: 'bg-glass card' }] }
      const out = await postcss([tailwind(config)]).process('@tailwind components;', { from: undefined })
      process.stdout.write(out.css)
    "`,
    { cwd: repoRoot, encoding: 'utf8' },
  )
  const { transform } = require('lightningcss')
  const { code } = transform({ filename: 'glass.css', code: Buffer.from(css), minify: true })
  const min = code.toString()
  const rule = min.match(/\.bg-glass\{[^}]*\}/)?.[0]
  if (!rule) fail('minified preset emits .bg-glass', min.slice(0, 200))
  if (!/(^|[{;])backdrop-filter:/.test(rule)) {
    fail('glass keeps the standard backdrop-filter after minifying', rule)
  }
  pass('glass keeps the standard backdrop-filter after minifying')
}

function checkTailwind4(tarballPath, tmpDir) {
  fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({ type: 'module', private: true }))
  console.log('Installing tarball + tailwindcss@4 + @tailwindcss/cli into a second temp project...')
  execSync(
    `npm install ${JSON.stringify(tarballPath)} solid-js tailwindcss@^4.0.0 @tailwindcss/cli@^4.0.0 --no-audit --no-fund --silent`,
    { cwd: tmpDir, encoding: 'utf8', stdio: 'pipe' },
  )
  const coreDir = path.join(tmpDir, 'node_modules', '@a4ui', 'core')
  if (fs.lstatSync(coreDir).isSymbolicLink()) {
    fail('expected a real directory for the installed package, got a symlink', coreDir)
  }
  fs.writeFileSync(path.join(tmpDir, 'in.css'), "@import 'tailwindcss';\n@import '@a4ui/core/theme.css';\n")
  execSync('npx --no-install tailwindcss -i in.css -o out.css', {
    cwd: tmpDir,
    encoding: 'utf8',
    stdio: 'pipe',
  })
  const css = fs.readFileSync(path.join(tmpDir, 'out.css'), 'utf8')
  // Classes that exist only inside the package: they can only come from @source.
  // Button hover, the Badge light: variant, the ButtonGroup arbitrary variant, the glass card.
  for (const needle of [
    '.hover\\:bg-primary\\/90',
    '.light\\:text-emerald-700',
    '.\\[\\&\\>\\*\\]\\:relative',
    '.card',
  ]) {
    if (!css.includes(needle)) fail(`theme.css did not produce ${needle}: is @source wrong?`)
  }
  pass('theme.css @source finds the components from an installed package (Tailwind 4 CLI)')

  fs.writeFileSync(
    path.join(tmpDir, 'tw3.config.js'),
    "import a4ui from '@a4ui/core/preset'\nexport default { presets: [a4ui], content: [] }\n",
  )
  fs.writeFileSync(path.join(tmpDir, 'preset.css'), "@import 'tailwindcss';\n@config './tw3.config.js';\n")
  let presetError = null
  try {
    execSync('npx --no-install tailwindcss -i preset.css -o preset-out.css', {
      cwd: tmpDir,
      encoding: 'utf8',
      stdio: 'pipe',
    })
  } catch (err) {
    presetError = `${err.stdout ?? ''}${err.stderr ?? ''}`
  }
  if (!presetError?.includes('@a4ui/core/preset requires Tailwind 3')) {
    fail(
      'loading the preset through @config on Tailwind 4 must fail with the preset message',
      presetError ?? 'it built',
    )
  }
  pass('the Tailwind 3 preset fails loudly on Tailwind 4')
}

function main() {
  let tarballPath = null
  let tmpDir = null
  let tailwind4Dir = null

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
    console.log('Installing tarball + solid-js + tailwindcss@3 + typescript into temp project...')
    execSync(
      `npm install ${JSON.stringify(tarballPath)} solid-js tailwindcss@^3.4.0 typescript --no-audit --no-fund --silent`,
      {
        cwd: tmpDir,
        encoding: 'utf8',
        stdio: 'pipe',
      },
    )
    pass('installed tarball, solid-js, tailwindcss@3 and typescript')

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

    // 5b. The preset subpath must ship types, and Tailwind must be a declared
    //     (optional) peer so a mismatching major is flagged by the package manager.
    const presetExport = exportsMap['./preset']
    if (!presetExport || presetExport.types !== './preset.d.ts') {
      fail('exports["./preset"] must have a "types" condition pointing at ./preset.d.ts')
    }
    pass('exports "./preset" has a types condition')
    if (!installedPkgJson.peerDependencies || !installedPkgJson.peerDependencies.tailwindcss) {
      fail('tailwindcss is not declared in peerDependencies')
    }
    if (!installedPkgJson.peerDependenciesMeta?.tailwindcss?.optional) {
      fail('tailwindcss peer dependency must be optional (peerDependenciesMeta)')
    }
    pass(`tailwindcss declared as an optional peer (${installedPkgJson.peerDependencies.tailwindcss})`)
    for (const major of ['^3.4.0', '^4.0.0']) {
      if (!installedPkgJson.peerDependencies.tailwindcss.includes(major)) {
        fail(`tailwindcss peer range must include ${major}`)
      }
    }
    pass('tailwindcss peer range covers both majors')

    // 5c. A consumer tailwind.config.ts using the preset must typecheck with no
    //     hand-written module shim (the exact snippet from the docs).
    fs.writeFileSync(
      path.join(tmpDir, 'tailwind.config.ts'),
      [
        "import type { Config } from 'tailwindcss'",
        "import a4ui from '@a4ui/core/preset'",
        '',
        'export default {',
        '  presets: [a4ui],',
        "  content: ['./src/**/*.{ts,tsx}'],",
        '} satisfies Config',
        '',
      ].join('\n'),
    )
    fs.writeFileSync(
      path.join(tmpDir, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          strict: true,
          noEmit: true,
          module: 'ESNext',
          moduleResolution: 'Bundler',
          target: 'ES2022',
          skipLibCheck: true,
        },
        files: ['tailwind.config.ts'],
      }),
    )
    execSync('npx --no-install tsc -p tsconfig.json', { cwd: tmpDir, encoding: 'utf8', stdio: 'pipe' })
    pass('tailwind.config.ts using @a4ui/core/preset typechecks without a shim')

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

    // 8. Tailwind 4: compile theme.css from the installed location.
    tailwind4Dir = fs.mkdtempSync(path.join(os.tmpdir(), 'a4ui-pkg-tw4-'))
    checkTailwind4(tarballPath, tailwind4Dir)
    checkGlassSurvivesMinify()

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
    // 9. Clean up temp dirs and tarball.
    for (const dir of [tmpDir, tailwind4Dir]) {
      if (!dir) continue
      try {
        fs.rmSync(dir, { recursive: true, force: true })
      } catch (cleanupErr) {
        console.error(`Warning: failed to remove temp dir ${dir}: ${cleanupErr.message}`)
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
