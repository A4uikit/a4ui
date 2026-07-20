// Renders a repo markdown file (INTEGRATIONS/STABILITY/MIGRATION/CHANGELOG) as
// styled prose on the docs site — single-source, so the guides never drift from
// the files in the repo. Internal `*.md` links are rewritten to the on-site
// guide routes; any other repo `.md` link points at GitHub.
import { marked } from 'marked'
import type { JSX } from 'solid-js'

const GUIDE_ROUTES: Record<string, string> = {
  'INTEGRATIONS.md': '#/guide-integrations',
  'STABILITY.md': '#/guide-stability',
  'MIGRATION.md': '#/guide-migration',
  'CHANGELOG.md': '#/guide-changelog',
}

function rewriteLinks(html: string): string {
  return html.replace(/href="\.?\/?([A-Za-z0-9_-]+\.md)(#[^"]*)?"/g, (_m, file: string, hash = '') => {
    const route = GUIDE_ROUTES[file]
    if (route) return `href="${route}"`
    return `href="https://github.com/A4uikit/a4ui/blob/main/${file}${hash}" target="_blank" rel="noopener noreferrer"`
  })
}

// Turn inline `<code>Name</code>` tokens that match a known component/utility
// into links to that component's docs page. Only inline code — block code lives
// in `<pre><code …>`, excluded by the negative lookbehind — so code samples are
// left untouched.
function linkifyCode(html: string, links: Record<string, string>): string {
  return html.replace(/(?<!<pre>)<code>([^<]+)<\/code>/g, (match, text: string) => {
    const route = links[text.trim()]
    return route ? `<a href="${route}">${match}</a>` : match
  })
}

export function MarkdownGuide(props: { src: string; links?: Record<string, string> }): JSX.Element {
  // Drop the file's own leading `# Title` — the doc page already renders a title.
  const body = () => props.src.replace(/^\s*#\s+[^\n]*\n+/, '')
  const html = () => {
    const rendered = rewriteLinks(marked.parse(body(), { async: false }) as string)
    return props.links ? linkifyCode(rendered, props.links) : rendered
  }
  // eslint-disable-next-line solid/no-innerhtml -- trusted, first-party repo markdown
  return <div class="a4-prose max-w-3xl" innerHTML={html()} />
}
