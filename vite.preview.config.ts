// Dev/QA server for the component catalog (preview/). Separate from the library
// build (vite.config.ts): this one runs Solid + Tailwind (via the a4ui preset)
// over preview/ + src/, so the glass plugin and utilities resolve exactly as a
// consumer's build would. Run: `npm run preview` (dev) or `npm run preview:build`.
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tailwind from 'tailwindcss'

import a4ui from './preset.js'

export default defineConfig({
  root: 'preview',
  server: {
    // The catalog imports from ../src (outside the preview root).
    fs: { allow: ['..'] },
  },
  css: {
    postcss: {
      plugins: [
        tailwind({
          presets: [a4ui],
          // Globs are relative to the project root (process.cwd()).
          content: ['preview/**/*.{ts,tsx,html}', 'src/**/*.{ts,tsx}'],
        }),
      ],
    },
  },
  plugins: [solid()],
  build: { outDir: 'dist', emptyOutDir: true },
})
