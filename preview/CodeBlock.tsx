// Copy-able code block for the docs.
import { createSignal, type JSX } from 'solid-js'

export function CodeBlock(props: { code: string }): JSX.Element {
  const [copied, setCopied] = createSignal(false)
  const copy = () => {
    void navigator.clipboard?.writeText(props.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }
  return (
    <div class="relative">
      <button
        type="button"
        onClick={copy}
        class="absolute right-2 top-2 rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground transition hover:text-foreground"
      >
        {copied() ? '✓ Copied' : 'Copy'}
      </button>
      <pre
        tabindex="0"
        role="region"
        aria-label="Code example"
        class="overflow-x-auto rounded-lg border border-border bg-card/50 p-4 font-mono text-[13px] leading-relaxed text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <code>{props.code}</code>
      </pre>
    </div>
  )
}
