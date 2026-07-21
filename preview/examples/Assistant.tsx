// Example template — Assistant. A conversational / AI-answer surface composed
// from the chat kit (ChatThread, Message, StreamingText, Citation, SourceList,
// PromptComposer, ArtifactPanel). Theme-agnostic: semantic tokens only, so it
// reskins under any theme. Fictional data.
import { Check, Code, Copy, RefreshCw, Sparkles } from 'lucide-solid'
import { createSignal, For, onCleanup, Show, type JSX } from 'solid-js'

import {
  ArtifactPanel,
  Button,
  ChatThread,
  Citation,
  IconMorphButton,
  Message,
  MicroButton,
  PromptComposer,
  SourceList,
  StreamingText,
  type ChatRole,
} from '../../src'

interface Source {
  title: string
  href?: string
}

interface ChatMsg {
  id: number
  role: ChatRole
  text: string
  streaming?: boolean
  sources?: Source[]
}

const SEED: ChatMsg[] = [
  { id: 1, role: 'system', text: 'Nova is ready to help.' },
  { id: 2, role: 'user', text: 'What makes the Spatial Glass look read as real glass?' },
  {
    id: 3,
    role: 'assistant',
    text: 'Glass only reads when there is colour behind it: an Aurora backdrop paints an ambient gradient, and frosted surfaces let it show through. A cursor light adds depth as you move.',
    sources: [
      { title: 'Spatial Glass guide', href: 'https://a4ui.pages.dev/#/guide-spatial-glass' },
      { title: 'Aurora component' },
    ],
  },
]

const ARTIFACT = `// aurora-backdrop.tsx
export function App() {
  return (
    <div class="relative min-h-screen text-foreground">
      <Aurora animated />
      <YourPage />
    </div>
  )
}`

export default function Assistant(): JSX.Element {
  const [messages, setMessages] = createSignal<ChatMsg[]>(SEED)
  const [draft, setDraft] = createSignal('')
  const [artifactOpen, setArtifactOpen] = createSignal(false)
  let nextId = SEED.length + 1
  let timer: ReturnType<typeof setInterval> | undefined
  onCleanup(() => clearInterval(timer))

  // Type `full` into the message identified by `id`, character-chunked like a
  // real stream. Shared by `send` (new reply) and `regenerate` (replay).
  const streamReply = (id: number, full: string) => {
    setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, text: '', streaming: true } : msg)))
    let i = 0
    clearInterval(timer)
    timer = setInterval(() => {
      i += 4
      const slice = full.slice(0, i)
      const done = i >= full.length
      setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, text: slice, streaming: !done } : msg)))
      if (done) clearInterval(timer)
    }, 60)
  }

  // Append the user's message, then simulate a streamed assistant reply.
  const send = (value: string) => {
    const text = value.trim()
    if (!text) return
    setMessages((m) => [...m, { id: nextId++, role: 'user', text }])
    setDraft('')

    const replyId = nextId++
    const full =
      'Use <Card glass> surfaces over the Aurora, keep the page root transparent, and add a few tasteful motion touches. Reach for <Expandable> instead of a modal for galleries.'
    setMessages((m) => [...m, { id: replyId, role: 'assistant', text: '', streaming: true }])
    streamReply(replyId, full)
  }

  // Retype an existing assistant reply, as if it were regenerated.
  const regenerate = (id: number, text: string) => streamReply(id, text)

  return (
    <div class="mx-auto flex h-[70vh] max-w-5xl gap-4 py-6">
      <div class="flex min-w-0 flex-1 flex-col">
        <header class="mb-3 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <Sparkles class="h-5 w-5 text-primary" />
            <h1 class="text-lg font-semibold tracking-tight">Assistant</h1>
          </div>
          <Button variant="outline" onClick={() => setArtifactOpen((v) => !v)}>
            <Code class="h-4 w-4" />
            {artifactOpen() ? 'Hide code' : 'Show code'}
          </Button>
        </header>

        <ChatThread class="flex-1 px-1 py-2">
          <For each={messages()}>
            {(msg) => (
              <Message role={msg.role} author={msg.role === 'assistant' ? 'Nova' : 'You'}>
                <Show when={msg.streaming} fallback={<p>{msg.text}</p>}>
                  <StreamingText text={msg.text} streaming />
                </Show>
                <Show when={msg.sources}>
                  {(sources) => (
                    <>
                      <span class="ml-0.5 inline-flex gap-1 align-middle">
                        <For each={sources()}>
                          {(s, i) => <Citation index={i() + 1} href={s.href} title={s.title} />}
                        </For>
                      </span>
                      <div class="mt-3 border-t border-border/60 pt-2">
                        <SourceList sources={sources()} />
                      </div>
                    </>
                  )}
                </Show>
                <Show when={msg.role === 'assistant' && !msg.streaming && msg.text}>
                  <div class="mt-2 flex items-center gap-1">
                    <IconMorphButton
                      inactive={<Copy size={16} />}
                      active={<Check size={16} />}
                      revertAfter={1500}
                      variant="ghost"
                      aria-label="Copy reply"
                      onChange={(pressed) => {
                        if (pressed) void navigator.clipboard?.writeText(msg.text)
                      }}
                    />
                    <MicroButton
                      effect="spin"
                      variant="ghost"
                      aria-label="Regenerate"
                      onClick={() => regenerate(msg.id, msg.text)}
                    >
                      <RefreshCw size={16} />
                    </MicroButton>
                  </div>
                </Show>
              </Message>
            )}
          </For>
        </ChatThread>

        <div class="mt-3">
          <PromptComposer
            value={draft()}
            onInput={setDraft}
            onSubmit={send}
            placeholder="Ask about the Spatial Glass look…"
            hint="Cmd/Ctrl+Enter to send"
          />
        </div>
      </div>

      <ArtifactPanel
        open={artifactOpen()}
        onClose={() => setArtifactOpen(false)}
        title="aurora-backdrop.tsx"
        width={380}
      >
        <pre class="overflow-x-auto p-4 text-xs leading-relaxed text-muted-foreground">{ARTIFACT}</pre>
      </ArtifactPanel>
    </div>
  )
}
