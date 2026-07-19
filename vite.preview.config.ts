// Dev/QA server for the component catalog (preview/). Separate from the library
// build (vite.config.ts): this one runs Solid + Tailwind (via the a4ui preset)
// over preview/ + src/, so the glass plugin and utilities resolve exactly as a
// consumer's build would. Run: `npm run preview` (dev) or `npm run preview:build`.
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tailwind from 'tailwindcss'

import a4ui from './preset.js'

// Make Vite's render-blocking CSS <link> load asynchronously so the inline
// skeleton in index.html paints BEFORE the stylesheet arrives (big mobile FCP
// win). The app mounts via a double rAF after the JS bundle downloads — well
// after the ~11 kB CSS is already in — so there's no flash of unstyled content.
// A <noscript> keeps full styling for JS-disabled requests. Build-only.
function asyncCss() {
  return {
    name: 'a4ui-async-css',
    apply: 'build' as const,
    transformIndexHtml(html: string) {
      const hrefs: string[] = []
      const out = html.replace(
        /<link rel="stylesheet"([^>]*?)href="([^"]+\.css)"([^>]*)>/g,
        (match: string, pre: string, href: string, post: string) => {
          if (/media=/.test(match)) return match // already async (e.g. fonts)
          hrefs.push(href)
          return `<link rel="stylesheet"${pre}href="${href}"${post} media="print" onload="this.media='all'">`
        },
      )
      if (hrefs.length === 0) return out
      const noscript = `<noscript>${hrefs.map((h) => `<link rel="stylesheet" href="${h}">`).join('')}</noscript>`
      return out.replace('</head>', `${noscript}</head>`)
    },
  }
}

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
  plugins: [solid(), asyncCss()],
  build: { outDir: 'dist', emptyOutDir: true },
})
