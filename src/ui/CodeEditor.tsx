// Lightweight code textarea — line numbers + approximate syntax highlighting,
// no parser, no syntax-highlight dependency. A transparent <textarea> is
// layered exactly over a <pre> highlight overlay; the textarea stays the
// real input (caret, selection, a11y), the overlay is purely decorative.
import type { JSX } from 'solid-js'
import { createMemo, For } from 'solid-js'

import { cn } from '../lib/cn'

export interface CodeEditorProps {
  value: string
  /** Called with the new source string on every input event. */
  onInput?: (v: string) => void
  /** Language used to pick the keyword set for highlighting. Default `'ts'`. */
  language?: 'ts' | 'js' | 'json' | 'html' | 'css'
  /** Hides the caret and blocks editing; the overlay still highlights. */
  readOnly?: boolean
  class?: string
}

const KEYWORDS: Record<NonNullable<CodeEditorProps['language']>, string[]> = {
  ts: [
    'const',
    'let',
    'var',
    'function',
    'return',
    'if',
    'else',
    'for',
    'while',
    'switch',
    'case',
    'break',
    'continue',
    'class',
    'extends',
    'implements',
    'interface',
    'type',
    'enum',
    'import',
    'export',
    'from',
    'default',
    'new',
    'this',
    'super',
    'try',
    'catch',
    'finally',
    'throw',
    'async',
    'await',
    'typeof',
    'instanceof',
    'in',
    'of',
    'null',
    'undefined',
    'true',
    'false',
    'void',
    'public',
    'private',
    'protected',
    'readonly',
    'static',
    'as',
  ],
  js: [
    'const',
    'let',
    'var',
    'function',
    'return',
    'if',
    'else',
    'for',
    'while',
    'switch',
    'case',
    'break',
    'continue',
    'class',
    'extends',
    'import',
    'export',
    'from',
    'default',
    'new',
    'this',
    'super',
    'try',
    'catch',
    'finally',
    'throw',
    'async',
    'await',
    'typeof',
    'instanceof',
    'in',
    'of',
    'null',
    'undefined',
    'true',
    'false',
    'void',
  ],
  json: ['true', 'false', 'null'],
  html: ['DOCTYPE', 'html', 'head', 'body', 'div', 'span', 'script', 'style', 'link', 'meta'],
  css: [
    'color',
    'background',
    'display',
    'flex',
    'grid',
    'position',
    'width',
    'height',
    'margin',
    'padding',
    'border',
    'font',
    'transition',
    'transform',
  ],
}

/** Escapes text that will be inserted as literal `<pre>` content. */
function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Tokenizes a single line into highlighted HTML. Approximate on purpose —
 * regex-based, not a real parser — good enough for readability, not for
 * correctness-sensitive tooling.
 */
function highlightLine(line: string, keywords: string[]): string {
  // Comments win outright: once matched, the rest of the line is dimmed as-is.
  const lineCommentIndex = line.indexOf('//')
  const htmlCommentIndex = line.indexOf('<!--')
  const commentIndex =
    lineCommentIndex === -1
      ? htmlCommentIndex
      : htmlCommentIndex === -1
        ? lineCommentIndex
        : Math.min(lineCommentIndex, htmlCommentIndex)

  const code = commentIndex === -1 ? line : line.slice(0, commentIndex)
  const comment = commentIndex === -1 ? '' : line.slice(commentIndex)

  const keywordPattern = keywords.length > 0 ? `\\b(${keywords.join('|')})\\b` : ''
  const tokenPattern = new RegExp(
    [
      /"(?:[^"\\]|\\.)*"/.source, // double-quoted string
      /'(?:[^'\\]|\\.)*'/.source, // single-quoted string
      /`(?:[^`\\]|\\.)*`/.source, // template string
      /\b\d+(?:\.\d+)?\b/.source, // number
      ...(keywordPattern ? [keywordPattern] : []),
    ].join('|'),
    'g',
  )

  let highlighted = ''
  let lastIndex = 0
  for (const match of code.matchAll(tokenPattern)) {
    const token = match[0]
    const start = match.index ?? 0
    highlighted += escapeHtml(code.slice(lastIndex, start))
    if (token[0] === '"' || token[0] === "'" || token[0] === '`') {
      highlighted += `<span class="text-accent">${escapeHtml(token)}</span>`
    } else if (/^\d/.test(token)) {
      highlighted += `<span class="text-primary">${escapeHtml(token)}</span>`
    } else {
      highlighted += `<span class="text-primary font-medium">${escapeHtml(token)}</span>`
    }
    lastIndex = start + token.length
  }
  highlighted += escapeHtml(code.slice(lastIndex))

  if (comment) {
    highlighted += `<span class="text-muted-foreground italic">${escapeHtml(comment)}</span>`
  }

  return highlighted || ' ' // keep empty lines at full line-height
}

const SHARED_TEXT = 'whitespace-pre font-mono text-sm leading-6 px-3 py-2 [tab-size:2]' as const

/**
 * A minimal code editor: line numbers in a gutter, a transparent textarea for
 * input, and a `<pre>` overlay underneath it that renders approximate syntax
 * highlighting from simple regexes (keywords, strings, numbers, comments).
 * Not a full parser — good for READMEs, config editors, and demo panes, not
 * a replacement for a real editor component (CodeMirror/Monaco).
 *
 * @example
 * ```tsx
 * const [src, setSrc] = createSignal('const x: number = 1\n')
 * <CodeEditor value={src()} onInput={setSrc} language="ts" />
 * ```
 */
export function CodeEditor(props: CodeEditorProps): JSX.Element {
  const local = props

  let textareaRef: HTMLTextAreaElement | undefined
  let overlayRef: HTMLPreElement | undefined

  const lines = createMemo(() => local.value.split('\n'))
  const keywords = createMemo(() => KEYWORDS[local.language ?? 'ts'])
  const highlightedLines = createMemo(() => lines().map((line) => highlightLine(line, keywords())))

  const syncScroll = () => {
    if (!textareaRef || !overlayRef) return
    overlayRef.scrollTop = textareaRef.scrollTop
    overlayRef.scrollLeft = textareaRef.scrollLeft
  }

  const handleKeyDown: JSX.EventHandlerUnion<HTMLTextAreaElement, KeyboardEvent> = (ev) => {
    if (ev.key !== 'Tab' || local.readOnly) return
    ev.preventDefault()
    const el = ev.currentTarget
    const start = el.selectionStart
    const end = el.selectionEnd
    const next = `${local.value.slice(0, start)}  ${local.value.slice(end)}`
    local.onInput?.(next)
    // Restore caret after the inserted spaces once the value commits.
    queueMicrotask(() => {
      el.selectionStart = el.selectionEnd = start + 2
    })
  }

  return (
    <div class={cn('relative flex overflow-hidden rounded-md border border-border bg-card', local.class)}>
      <div
        aria-hidden="true"
        class={cn(
          SHARED_TEXT,
          'select-none border-r border-border bg-muted text-right text-muted-foreground',
        )}
      >
        <For each={lines()}>{(_line, index) => <div>{index() + 1}</div>}</For>
      </div>
      <div class="relative flex-1 overflow-hidden">
        <pre
          ref={overlayRef}
          aria-hidden="true"
          class={cn(SHARED_TEXT, 'pointer-events-none absolute inset-0 overflow-auto text-foreground')}
        >
          <For each={highlightedLines()}>
            {(html) => (
              // eslint-disable-next-line solid/no-innerhtml -- highlightLine() HTML-escapes every code slice via escapeHtml(); only our own token <span>s are injected, so this cannot inject markup from `value`.
              <div innerHTML={html} />
            )}
          </For>
        </pre>
        <textarea
          ref={textareaRef}
          aria-label="Code editor"
          class={cn(
            SHARED_TEXT,
            'absolute inset-0 resize-none overflow-auto bg-transparent text-transparent caret-foreground outline-none',
            local.readOnly && 'caret-transparent',
          )}
          spellcheck={false}
          readOnly={local.readOnly}
          value={local.value}
          onInput={(ev) => local.onInput?.(ev.currentTarget.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  )
}
