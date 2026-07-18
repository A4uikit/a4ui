// Self-contained build for the Web Components entry (`@a4ui/core/elements`).
// Unlike the main library build (vite.config.ts), this bundles EVERYTHING —
// solid-js, solid-element, Kobalte, icons — into a single file so a non-Solid
// app (React/Next.js, Vue, vanilla) can load it with no Solid toolchain:
//   <script type="module" src=".../elements.js"></script>
// or `import '@a4ui/core/elements'`. The matching styles ship as elements.css
// (built by scripts/build-elements-css.mjs).
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  // A distinct outDir so it never races/overwrites the main library build.
  plugins: [solid()],
  // The bundle runs in a plain browser with no bundler, so solid-js's internal
  // `process.env.NODE_ENV` checks must be inlined (otherwise: "process is not
  // defined"). Force the production path.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: { elements: 'src/elements.tsx' },
      formats: ['es', 'iife'],
      name: 'A4uiElements',
      fileName: (format, name) => (format === 'iife' ? `${name}.iife.js` : `${name}.js`),
    },
    // Nothing external — the bundle must run standalone in any framework.
    rollupOptions: {},
  },
})
