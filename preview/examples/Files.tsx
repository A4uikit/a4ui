// Example template — File manager. Full-page composition dogfooding A4ui components.
// Theme-agnostic: only semantic tokens/utilities, so it reskins under any theme.
import { File, Folder, Image, Music } from 'lucide-solid'
import { createSignal, For, Show, type JSX } from 'solid-js'

import {
  Badge,
  type BadgeTone,
  Breadcrumb,
  Button,
  Card,
  type CommandItem,
  Command,
  Empty,
  Kbd,
  List,
  type ListItem,
  Splitter,
  Tree,
  type TreeNode,
} from '../../src'

interface FileEntry {
  name: string
  size: string
  type: string
  tone: BadgeTone
  icon: JSX.Element
}

const folders: TreeNode[] = [
  {
    id: 'documents',
    label: 'Documents',
    icon: <Folder class="h-4 w-4 text-muted-foreground" />,
    children: [
      { id: 'invoices', label: 'Invoices', icon: <Folder class="h-4 w-4 text-muted-foreground" /> },
      { id: 'contracts', label: 'Contracts', icon: <Folder class="h-4 w-4 text-muted-foreground" /> },
    ],
  },
  {
    id: 'media',
    label: 'Media',
    icon: <Folder class="h-4 w-4 text-muted-foreground" />,
    children: [
      { id: 'photos', label: 'Photos', icon: <Folder class="h-4 w-4 text-muted-foreground" /> },
      { id: 'audio', label: 'Audio', icon: <Folder class="h-4 w-4 text-muted-foreground" /> },
    ],
  },
  { id: 'archive', label: 'Archive', icon: <Folder class="h-4 w-4 text-muted-foreground" /> },
]

const folderLabels: Record<string, string> = {
  documents: 'Documents',
  invoices: 'Invoices',
  contracts: 'Contracts',
  media: 'Media',
  photos: 'Photos',
  audio: 'Audio',
  archive: 'Archive',
}

const docIcon = <File class="h-4 w-4 text-muted-foreground" />
const imageIcon = <Image class="h-4 w-4 text-muted-foreground" />
const audioIcon = <Music class="h-4 w-4 text-muted-foreground" />

const filesByFolder: Record<string, FileEntry[]> = {
  documents: [
    { name: 'Roadmap.pdf', size: '2.4 MB', type: 'PDF', tone: 'danger', icon: docIcon },
    { name: 'Notes.md', size: '12 KB', type: 'Markdown', tone: 'info', icon: docIcon },
    { name: 'Budget.xlsx', size: '340 KB', type: 'Sheet', tone: 'success', icon: docIcon },
  ],
  invoices: [
    { name: 'INV-1042.pdf', size: '188 KB', type: 'PDF', tone: 'danger', icon: docIcon },
    { name: 'INV-1041.pdf', size: '176 KB', type: 'PDF', tone: 'danger', icon: docIcon },
  ],
  contracts: [],
  media: [
    { name: 'cover.png', size: '4.1 MB', type: 'Image', tone: 'info', icon: imageIcon },
    { name: 'promo.mp4', size: '58 MB', type: 'Video', tone: 'warning', icon: imageIcon },
  ],
  photos: [
    { name: 'beach.jpg', size: '3.2 MB', type: 'Image', tone: 'info', icon: imageIcon },
    { name: 'sunset.jpg', size: '2.8 MB', type: 'Image', tone: 'info', icon: imageIcon },
    { name: 'city.jpg', size: '5.6 MB', type: 'Image', tone: 'info', icon: imageIcon },
  ],
  audio: [
    { name: 'intro.mp3', size: '5.9 MB', type: 'Audio', tone: 'neutral', icon: audioIcon },
    { name: 'outro.wav', size: '22 MB', type: 'Audio', tone: 'neutral', icon: audioIcon },
  ],
  archive: [],
}

export default function Files(): JSX.Element {
  const [selected, setSelected] = createSignal('documents')
  const [open, setOpen] = createSignal(false)

  const files = () => filesByFolder[selected()] ?? []

  const crumbs = () => [
    { label: 'Home', href: '#' },
    { label: 'Files', href: '#' },
    { label: folderLabels[selected()] ?? 'Files' },
  ]

  const listItems = (): ListItem[] =>
    files().map((entry) => ({
      title: entry.name,
      avatar: entry.icon,
      description: entry.size,
      meta: <Badge tone={entry.tone}>{entry.type}</Badge>,
    }))

  const commands: CommandItem[] = [
    { label: 'New folder', hint: '⌘N', group: 'Actions', onSelect: () => {} },
    { label: 'Upload', hint: '⌘U', group: 'Actions', onSelect: () => {} },
    { label: 'Rename', hint: 'F2', group: 'Actions', onSelect: () => {} },
    { label: 'Documents', group: 'Go to folder', onSelect: () => setSelected('documents') },
    { label: 'Media', group: 'Go to folder', onSelect: () => setSelected('media') },
    { label: 'Archive', group: 'Go to folder', onSelect: () => setSelected('archive') },
  ]

  return (
    <div class="mx-auto max-w-5xl space-y-4 py-8">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-col gap-1">
          <h1 class="text-2xl font-bold tracking-tight">Files</h1>
          <Breadcrumb items={crumbs()} />
        </div>
        <Button variant="outline" class="gap-2" onClick={() => setOpen(true)}>
          <span>Search commands</span>
          <span class="flex items-center gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </Button>
      </header>

      <Card class="overflow-hidden p-0">
        <Splitter
          class="h-80"
          initial={32}
          start={
            <nav class="p-2">
              <Tree nodes={folders} defaultExpanded={['documents', 'media']} />
            </nav>
          }
          end={
            <div class="p-4">
              <Show
                when={files().length}
                fallback={
                  <Empty
                    title="This folder is empty"
                    description="Upload files or create a new folder to get started."
                    action={<Button onClick={() => setOpen(true)}>Add files</Button>}
                  />
                }
              >
                <List items={listItems()} />
              </Show>
            </div>
          }
        />
      </Card>

      <p class="text-xs text-muted-foreground">
        <For each={[folderLabels[selected()]]}>{(name) => <span>{name}</span>}</For>
        {' · '}
        {files().length} item{files().length === 1 ? '' : 's'}
      </p>

      <Command
        open={open()}
        onOpenChange={setOpen}
        items={commands}
        placeholder="Search files and commands…"
      />
    </div>
  )
}
