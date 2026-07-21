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
  Splitter,
  Tree,
  type TreeNode,
  TreeTable,
  type TreeTableColumn,
  type TreeTableRow,
} from '../../src'

interface FileEntry {
  name: string
  size: string
  modified: string
  type: string
  tone: BadgeTone
  icon: JSX.Element
}

/** Row payload for the file-listing {@link TreeTable}: folders and files share one shape. */
interface FsRowData {
  name: string
  size: string
  modified: string
  kind: 'folder' | 'file'
  type?: string
  tone?: BadgeTone
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

const folderModified: Record<string, string> = {
  documents: 'Jul 14, 2026',
  invoices: 'Jul 10, 2026',
  contracts: 'Jun 28, 2026',
  media: 'Jul 16, 2026',
  photos: 'Jul 15, 2026',
  audio: 'Jul 9, 2026',
  archive: 'May 2, 2026',
}

const docIcon = <File class="h-4 w-4 text-muted-foreground" />
const imageIcon = <Image class="h-4 w-4 text-muted-foreground" />
const audioIcon = <Music class="h-4 w-4 text-muted-foreground" />
const folderIcon = <Folder class="h-4 w-4 text-muted-foreground" />

const filesByFolder: Record<string, FileEntry[]> = {
  documents: [
    {
      name: 'Roadmap.pdf',
      size: '2.4 MB',
      modified: 'Jul 13, 2026',
      type: 'PDF',
      tone: 'danger',
      icon: docIcon,
    },
    {
      name: 'Notes.md',
      size: '12 KB',
      modified: 'Jul 14, 2026',
      type: 'Markdown',
      tone: 'info',
      icon: docIcon,
    },
    {
      name: 'Budget.xlsx',
      size: '340 KB',
      modified: 'Jul 5, 2026',
      type: 'Sheet',
      tone: 'success',
      icon: docIcon,
    },
  ],
  invoices: [
    {
      name: 'INV-1042.pdf',
      size: '188 KB',
      modified: 'Jul 10, 2026',
      type: 'PDF',
      tone: 'danger',
      icon: docIcon,
    },
    {
      name: 'INV-1041.pdf',
      size: '176 KB',
      modified: 'Jun 30, 2026',
      type: 'PDF',
      tone: 'danger',
      icon: docIcon,
    },
  ],
  contracts: [],
  media: [
    {
      name: 'cover.png',
      size: '4.1 MB',
      modified: 'Jul 16, 2026',
      type: 'Image',
      tone: 'info',
      icon: imageIcon,
    },
    {
      name: 'promo.mp4',
      size: '58 MB',
      modified: 'Jul 11, 2026',
      type: 'Video',
      tone: 'warning',
      icon: imageIcon,
    },
  ],
  photos: [
    {
      name: 'beach.jpg',
      size: '3.2 MB',
      modified: 'Jul 15, 2026',
      type: 'Image',
      tone: 'info',
      icon: imageIcon,
    },
    {
      name: 'sunset.jpg',
      size: '2.8 MB',
      modified: 'Jul 15, 2026',
      type: 'Image',
      tone: 'info',
      icon: imageIcon,
    },
    {
      name: 'city.jpg',
      size: '5.6 MB',
      modified: 'Jul 8, 2026',
      type: 'Image',
      tone: 'info',
      icon: imageIcon,
    },
  ],
  audio: [
    {
      name: 'intro.mp3',
      size: '5.9 MB',
      modified: 'Jul 9, 2026',
      type: 'Audio',
      tone: 'neutral',
      icon: audioIcon,
    },
    {
      name: 'outro.wav',
      size: '22 MB',
      modified: 'Jun 20, 2026',
      type: 'Audio',
      tone: 'neutral',
      icon: audioIcon,
    },
  ],
  archive: [],
}

/** Merge the folder tree + per-folder files into one TreeTable hierarchy. */
function buildFsRows(nodes: TreeNode[]): TreeTableRow<FsRowData>[] {
  return nodes.map((node) => {
    const childFolders = node.children ? buildFsRows(node.children) : []
    const childFiles: TreeTableRow<FsRowData>[] = (filesByFolder[node.id] ?? []).map((entry, index) => ({
      id: `${node.id}-file-${index}`,
      data: {
        name: entry.name,
        size: entry.size,
        modified: entry.modified,
        kind: 'file',
        type: entry.type,
        tone: entry.tone,
        icon: entry.icon,
      },
    }))
    return {
      id: node.id,
      data: {
        name: folderLabels[node.id] ?? node.id,
        size: '—',
        modified: folderModified[node.id] ?? '—',
        kind: 'folder',
        icon: folderIcon,
      },
      children: [...childFolders, ...childFiles],
    }
  })
}

const fsRows = buildFsRows(folders)

function findRow(id: string, rows: TreeTableRow<FsRowData>[]): TreeTableRow<FsRowData> | undefined {
  for (const row of rows) {
    if (row.id === id) return row
    const found = row.children ? findRow(id, row.children) : undefined
    if (found) return found
  }
  return undefined
}

const fsColumns: TreeTableColumn<FsRowData>[] = [
  {
    key: 'name',
    header: 'Name',
    cell: (row) => (
      <span class="inline-flex items-center gap-1.5">
        {row.icon}
        <span>{row.name}</span>
      </span>
    ),
  },
  {
    key: 'type',
    header: 'Type',
    cell: (row) =>
      row.type ? <Badge tone={row.tone}>{row.type}</Badge> : <span class="text-muted-foreground">—</span>,
  },
  { key: 'size', header: 'Size', align: 'right' },
  { key: 'modified', header: 'Modified', align: 'right' },
]

export default function Files(): JSX.Element {
  const [selected, setSelected] = createSignal('documents')
  const [open, setOpen] = createSignal(false)

  const contents = (): TreeTableRow<FsRowData>[] => findRow(selected(), fsRows)?.children ?? []

  const crumbs = () => [
    { label: 'Home', href: '#' },
    { label: 'Files', href: '#' },
    { label: folderLabels[selected()] ?? 'Files' },
  ]

  const commands: CommandItem[] = [
    { label: 'New folder', hint: '⌘N', group: 'Actions', onSelect: () => {} },
    { label: 'Upload', hint: '⌘U', group: 'Actions', onSelect: () => {} },
    { label: 'Rename', hint: 'F2', group: 'Actions', onSelect: () => {} },
    { label: 'Documents', group: 'Go to folder', onSelect: () => setSelected('documents') },
    { label: 'Media', group: 'Go to folder', onSelect: () => setSelected('media') },
    { label: 'Archive', group: 'Go to folder', onSelect: () => setSelected('archive') },
  ]

  return (
    <div class="mx-auto max-w-7xl space-y-4 py-8">
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
                when={contents().length}
                fallback={
                  <Empty
                    title="This folder is empty"
                    description="Upload files or create a new folder to get started."
                    action={<Button onClick={() => setOpen(true)}>Add files</Button>}
                  />
                }
              >
                <TreeTable defaultExpanded columns={fsColumns} rows={contents()} />
              </Show>
            </div>
          }
        />
      </Card>

      <p class="text-xs text-muted-foreground">
        <For each={[folderLabels[selected()]]}>{(name) => <span>{name}</span>}</For>
        {' · '}
        {contents().length} item{contents().length === 1 ? '' : 's'}
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
