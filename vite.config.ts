import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import solid from 'vite-plugin-solid'
import dts from 'vite-plugin-dts'

// Emit the concatenated stylesheet as dist/styles.css. The library build only
// bundles the JS entry, so without this the `a4ui/styles.css` export
// (package.json) would point at a file that never gets produced. This ships only
// what can't be a Tailwind utility: the CSS variables + motion keyframes
// (tokens.css) and the starfield (space.css). Glass surfaces live in the Tailwind
// preset (preset.js). Plain CSS so consumers can `import 'a4ui/styles.css'`.
const STYLE_SOURCES = ['src/styles/tokens.css', 'src/styles/space.css']

function emitStyles(): Plugin {
  return {
    name: 'a4ui-emit-styles',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'styles.css',
        source: STYLE_SOURCES.map((f) => readFileSync(f, 'utf8')).join('\n'),
      })
    },
  }
}

// Library build: Solid components compiled to ESM, with .d.ts, and every peer /
// design dep left EXTERNAL so consumers dedupe a single copy (esp. solid-js —
// two copies break reactivity).
export default defineConfig({
  plugins: [solid(), dts({ include: ['src'] }), emitStyles()],
  build: {
    lib: {
      entry: { index: 'src/index.ts' },
      formats: ['es'],
      fileName: (_format, name) => `${name}.js`,
    },
    rollupOptions: {
      external: [
        'solid-js',
        'solid-js/web',
        'solid-js/store',
        // Kobalte is imported by subpath (@kobalte/core/dialog, /tabs, …); a bare
        // string only matches the exact specifier, so use a regex to externalize
        // every subpath — otherwise the whole headless lib bundles in.
        /^@kobalte\/core(\/.*)?$/,
        'lucide-solid',
        'solid-transition-group',
        'solid-motionone',
        '@tanstack/solid-virtual',
        'clsx',
        'tailwind-merge',
      ],
    },
  },
})
