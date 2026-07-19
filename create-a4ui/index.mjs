#!/usr/bin/env node
// create-a4ui — scaffolder for new A4ui apps.
//
// Usage:
//   npm create a4ui@latest [my-app] [--tailwind|--no-tailwind]
//
// Only the `solid-vite` template exists today. SolidStart and Astro
// templates are planned ("coming soon") but not implemented — when they
// land, add a `--framework <name>` flag and a matching `templates/<name>`
// directory, then prompt for framework choice before the Tailwind prompt.

import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATE_ROOT = path.join(__dirname, 'templates', 'solid-vite')
const DEFAULT_DIR_NAME = 'my-a4ui-app'

function parseArgs(argv) {
  let targetDir = null
  let tailwind = null // null = unspecified, true/false = explicit flag

  for (const arg of argv) {
    if (arg === '--tailwind') {
      tailwind = true
    } else if (arg === '--no-tailwind') {
      tailwind = false
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    } else if (!arg.startsWith('-') && targetDir === null) {
      targetDir = arg
    }
  }

  return { targetDir, tailwind }
}

function printHelp() {
  console.log(`
Usage: npm create a4ui@latest [my-app] [options]

Options:
  --tailwind       Include Tailwind CSS setup (default)
  --no-tailwind    Skip Tailwind CSS, use @a4ui/core/full.css instead
  -h, --help       Show this help message
`)
}

function ask(rl, question, defaultValue) {
  const suffix = defaultValue ? ` (${defaultValue})` : ''
  return new Promise((resolve) => {
    rl.question(`${question}${suffix}: `, (answer) => {
      const trimmed = answer.trim()
      resolve(trimmed.length > 0 ? trimmed : defaultValue)
    })
  })
}

function askYesNo(rl, question, defaultValue) {
  const hint = defaultValue ? 'Y/n' : 'y/N'
  return new Promise((resolve) => {
    rl.question(`${question} (${hint}): `, (answer) => {
      const trimmed = answer.trim().toLowerCase()
      if (trimmed.length === 0) {
        resolve(defaultValue)
      } else {
        resolve(trimmed === 'y' || trimmed === 'yes')
      }
    })
  })
}

function isDirNonEmpty(dir) {
  if (!fs.existsSync(dir)) return false
  const entries = fs.readdirSync(dir)
  return entries.length > 0
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src)

  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true })
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry))
    }
    return
  }

  const destPath = path.basename(src) === 'gitignore' ? path.join(path.dirname(dest), '.gitignore') : dest
  fs.mkdirSync(path.dirname(destPath), { recursive: true })
  fs.copyFileSync(src, destPath)
}

function stripTailwind(targetDir) {
  // Remove Tailwind-specific config files.
  for (const file of ['tailwind.config.js', 'postcss.config.js']) {
    const filePath = path.join(targetDir, file)
    if (fs.existsSync(filePath)) fs.rmSync(filePath)
  }

  // Replace the Tailwind-flavored stylesheet with the prebuilt one.
  const cssPath = path.join(targetDir, 'src', 'app.css')
  if (fs.existsSync(cssPath)) {
    fs.writeFileSync(cssPath, "@import '@a4ui/core/full.css'\n")
  }

  // Drop Tailwind-related devDependencies from package.json.
  const pkgPath = path.join(targetDir, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
    if (pkg.devDependencies) {
      for (const dep of ['tailwindcss', 'postcss', 'autoprefixer']) {
        delete pkg.devDependencies[dep]
      }
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  }
}

function rewritePackageName(targetDir) {
  const pkgPath = path.join(targetDir, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  pkg.name = path.basename(path.resolve(targetDir))
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

async function main() {
  const { targetDir: argTargetDir, tailwind: argTailwind } = parseArgs(process.argv.slice(2))

  const canPrompt = process.stdin.isTTY && process.stdout.isTTY
  let targetDir = argTargetDir
  let tailwind = argTailwind

  if (canPrompt && (targetDir === null || tailwind === null)) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    try {
      if (targetDir === null) {
        targetDir = await ask(rl, 'Project directory', DEFAULT_DIR_NAME)
      }
      if (tailwind === null) {
        tailwind = await askYesNo(rl, 'Use Tailwind CSS?', true)
      }
    } finally {
      rl.close()
    }
  }

  if (targetDir === null) targetDir = DEFAULT_DIR_NAME
  if (tailwind === null) tailwind = true

  const resolvedTarget = path.resolve(process.cwd(), targetDir)

  if (isDirNonEmpty(resolvedTarget)) {
    console.error(`Error: target directory "${targetDir}" already exists and is not empty.`)
    console.error('Please choose a different directory or remove its contents first.')
    process.exit(1)
  }

  if (!fs.existsSync(TEMPLATE_ROOT)) {
    console.error(`Error: template not found at ${TEMPLATE_ROOT}`)
    process.exit(1)
  }

  try {
    copyRecursive(TEMPLATE_ROOT, resolvedTarget)

    if (!tailwind) {
      stripTailwind(resolvedTarget)
    }

    rewritePackageName(resolvedTarget)
  } catch (err) {
    console.error('Error while scaffolding project:')
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  }

  const relTarget = path.relative(process.cwd(), resolvedTarget) || '.'

  console.log('')
  console.log(`Scaffolded a new A4ui app in ${relTarget}`)
  console.log('')
  console.log('Next steps:')
  console.log(`  cd ${relTarget}`)
  console.log('  npm install')
  console.log('  npm run dev')
  console.log('')
}

main().catch((err) => {
  console.error('Unexpected error:')
  console.error(err instanceof Error ? (err.stack ?? err.message) : err)
  process.exit(1)
})
