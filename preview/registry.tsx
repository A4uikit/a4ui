// Docs registry — the single source of truth for the documentation site. Each
// entry renders a live demo (dogfooding the real components) plus the code you'd
// write to use it. Add one object per component; the sidebar and content area
// are generated from this array.
import { createSignal, For, type JSX } from 'solid-js'

import * as UI from '../src'

// Live prop control ("knob"). Entries opt in via `controls`; the docs render a
// panel and pass the current values to `demo`/`code`.
export type Control =
  | { type: 'boolean'; label: string; default: boolean }
  | { type: 'select'; label: string; options: string[]; default: string }
  | { type: 'text'; label: string; default: string }
  | { type: 'number'; label: string; default: number; min?: number; max?: number }

export type ControlValues = Record<string, string | number | boolean>

export interface DocEntry {
  id: string
  title: string
  group: string
  blurb: string
  /** Optional live prop controls. Keys are read by `demo`/`code`. */
  controls?: Record<string, Control>
  /** Live demo. Receives current control values ({} when no controls). Entries
      written as `() => (...)` still satisfy this (extra param is ignored). */
  demo: (c: ControlValues) => JSX.Element
  /** Code block: a static string, or a function of the control values. */
  code: string | ((c: ControlValues) => string)
}

// Sidebar group order.
export const DOC_GROUPS = ['Get started', 'Actions', 'Forms', 'Data', 'Overlays', 'Feedback', 'Navigation', 'Layout']

export const DOCS: DocEntry[] = [
  // ---- Get started ----------------------------------------------------------
  {
    id: 'instalacion',
    title: 'Installation',
    group: 'Get started',
    blurb: 'A4ui is a SolidJS component library with a "Spatial Glass" look. Install it and get all the design decisions solved for you.',
    demo: () => (
      <div class="space-y-3 text-sm text-muted-foreground">
        <p>1. Install the package. 2. Add the preset to Tailwind. 3. Import the styles once. Done.</p>
        <p>Requires <code class="rounded bg-muted px-1 font-mono">solid-js</code> and <code class="rounded bg-muted px-1 font-mono">tailwindcss</code> in your project.</p>
      </div>
    ),
    code: `# 1. install
npm install @a4ui/core

// 2. tailwind.config.ts — add the preset
import a4ui from '@a4ui/core/preset'
export default {
  presets: [a4ui],
  content: ['./src/**/*.{ts,tsx}', './node_modules/@a4ui/core/dist/**/*.js'],
}

// 3. your entry (just once)
import '@a4ui/core/styles.css'`,
  },
  {
    id: 'uso',
    title: 'Quick start',
    group: 'Get started',
    blurb: 'Import any component from "a4ui" and use it. Everything respects the light/dark theme and Kobalte accessibility.',
    demo: () => (
      <div class="flex flex-wrap items-center gap-3">
        <UI.Button>A button</UI.Button>
        <UI.Badge tone="success">Ready</UI.Badge>
        <UI.Spinner />
      </div>
    ),
    code: `import { Button, Badge, Spinner } from '@a4ui/core'

export function Example() {
  return (
    <>
      <Button>A button</Button>
      <Badge tone="success">Ready</Badge>
      <Spinner />
    </>
  )
}`,
  },

  // ---- Actions --------------------------------------------------------------
  {
    id: 'button',
    title: 'Button',
    group: 'Actions',
    blurb: 'Button with 4 variants. Defaults to type="button" so it never submits forms by accident. Try the controls ↓',
    controls: {
      variant: { type: 'select', label: 'variant', options: ['primary', 'secondary', 'outline', 'ghost'], default: 'primary' },
      disabled: { type: 'boolean', label: 'disabled', default: false },
      label: { type: 'text', label: 'text', default: 'Save' },
    },
    demo: (c) => (
      <UI.Button variant={c.variant as UI.ButtonVariant} disabled={c.disabled as boolean}>
        {c.label as string}
      </UI.Button>
    ),
    code: (c) => `<Button variant="${c.variant}"${c.disabled ? ' disabled' : ''}>${c.label}</Button>`,
  },

  // ---- Feedback -------------------------------------------------------------
  {
    id: 'alert',
    title: 'Alert',
    group: 'Feedback',
    blurb: 'Inline banner for contextual messages, with 4 tones. Try the controls ↓',
    controls: {
      tone: { type: 'select', label: 'tone', options: ['info', 'success', 'warning', 'danger'], default: 'info' },
      title: { type: 'text', label: 'title', default: 'Information' },
    },
    demo: (c) => (
      <div class="w-full">
        <UI.Alert tone={c.tone as UI.AlertTone} title={c.title as string}>
          This is the alert content.
        </UI.Alert>
      </div>
    ),
    code: (c) => `<Alert tone="${c.tone}" title="${c.title}">This is the alert content.</Alert>`,
  },

  // ---- Forms ----------------------------------------------------------------
  {
    id: 'switch',
    title: 'Switch',
    group: 'Forms',
    blurb: 'Accessible on/off toggle (Kobalte).',
    controls: {
      label: { type: 'text', label: 'label', default: 'Notifications' },
      disabled: { type: 'boolean', label: 'disabled', default: false },
    },
    demo: (c) => {
      const [on, setOn] = createSignal(true)
      return <UI.Switch checked={on()} onChange={setOn} label={c.label as string} disabled={c.disabled as boolean} />
    },
    code: (c) => `const [on, setOn] = createSignal(true)
<Switch checked={on()} onChange={setOn} label="${c.label}"${c.disabled ? ' disabled' : ''} />`,
  },

  // ---- Data -----------------------------------------------------------------
  {
    id: 'stat',
    title: 'Stat',
    group: 'Data',
    blurb: 'KPI card with an animated entrance (solid-motionone) and a count-up on the number (respects reduced-motion). Change the value and watch it count ↓',
    controls: {
      label: { type: 'text', label: 'label', default: 'Revenue' },
      value: { type: 'number', label: 'value', default: 125400, min: 0, max: 1000000 },
      tone: { type: 'select', label: 'tone', options: ['primary', 'success', 'danger', 'neutral'], default: 'success' },
    },
    demo: (c) => (
      <div class="w-full max-w-xs">
        <UI.Stat
          label={c.label as string}
          value={c.value as number}
          tone={c.tone as UI.StatTone}
          format={(n) => `$${Math.round(n).toLocaleString()}`}
        />
      </div>
    ),
    code: (c) => `<Stat label="${c.label}" value={${c.value}} tone="${c.tone}"
  format={(n) => \`$\${Math.round(n).toLocaleString()}\`} />`,
  },

  // ---- Overlays -------------------------------------------------------------
  {
    id: 'tooltip',
    title: 'Tooltip',
    group: 'Overlays',
    blurb: 'Floating label shown on focus/hover (Kobalte).',
    controls: {
      content: { type: 'text', label: 'content', default: "I'm a tooltip" },
    },
    demo: (c) => (
      <UI.Tooltip content={c.content as string}>
        <UI.Button variant="outline">Hover me</UI.Button>
      </UI.Tooltip>
    ),
    code: (c) => `<Tooltip content="${c.content}">
  <Button variant="outline">Hover me</Button>
</Tooltip>`,
  },

  // ---- Actions --------------------------------------------------------------
  {
    id: 'dropdown',
    title: 'Dropdown',
    group: 'Actions',
    blurb: 'Actions menu (Kobalte). The trigger itself IS the button, so its children must be non-interactive.',
    demo: () => (
      <UI.Dropdown
        label="Actions"
        items={[
          { label: 'Edit', onSelect: () => UI.toast.info('Edit') },
          { label: 'Duplicate', onSelect: () => UI.toast.info('Duplicate') },
          { label: 'Delete', onSelect: () => UI.toast.error('Deleted'), destructive: true },
        ]}
      >
        <span class="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
          Actions ▾
        </span>
      </UI.Dropdown>
    ),
    code: `<Dropdown
  label="Actions"
  items={[
    { label: 'Edit', onSelect: () => edit() },
    { label: 'Delete', onSelect: () => remove(), destructive: true },
  ]}
>
  <span class="...">Actions ▾</span>
</Dropdown>`,
  },
  {
    id: 'context-menu',
    title: 'ContextMenu',
    group: 'Actions',
    blurb: 'Context menu shown on right-click over the child element (the target).',
    demo: () => (
      <UI.ContextMenu
        items={[
          { label: 'Copy', onSelect: () => UI.toast.info('Copied') },
          { label: 'Paste', onSelect: () => UI.toast.info('Pasted') },
          { label: 'Delete', onSelect: () => UI.toast.error('Deleted'), destructive: true },
        ]}
      >
        <div class="grid h-24 w-full place-items-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
          Right-click here
        </div>
      </UI.ContextMenu>
    ),
    code: `<ContextMenu
  items={[
    { label: 'Copy', onSelect: () => copy() },
    { label: 'Delete', onSelect: () => remove(), destructive: true },
  ]}
>
  <div class="...">Right-click here</div>
</ContextMenu>`,
  },
  {
    id: 'toggle',
    title: 'Toggle',
    group: 'Actions',
    blurb: 'Two-state button (pressed / not) — ideal for toolbars.',
    demo: () => {
      const [on, setOn] = createSignal(false)
      return (
        <UI.Toggle pressed={on()} onChange={setOn}>
          <span class="text-sm font-semibold">B</span>
        </UI.Toggle>
      )
    },
    code: `const [bold, setBold] = createSignal(false)
<Toggle pressed={bold()} onChange={setBold}>
  <BoldIcon />
</Toggle>`,
  },
  {
    id: 'toggle-group',
    title: 'ToggleGroup',
    group: 'Actions',
    blurb: 'Row of segmented buttons; the value can become null when deselected.',
    demo: () => {
      const [align, setAlign] = createSignal<string | null>('left')
      return (
        <UI.ToggleGroup
          value={align()}
          onChange={setAlign}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ]}
        />
      )
    },
    code: `const [align, setAlign] = createSignal<string | null>('left')
<ToggleGroup
  value={align()}
  onChange={setAlign}
  options={[
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
  ]}
/>`,
  },
  {
    id: 'segmented-control',
    title: 'SegmentedControl',
    group: 'Actions',
    blurb: 'Single selection with an animated indicator that slides under the active option.',
    demo: () => {
      const [view, setView] = createSignal('list')
      return (
        <UI.SegmentedControl
          value={view()}
          onChange={setView}
          options={[
            { value: 'list', label: 'List' },
            { value: 'cards', label: 'Cards' },
            { value: 'table', label: 'Table' },
          ]}
        />
      )
    },
    code: `const [view, setView] = createSignal('list')
<SegmentedControl
  value={view()}
  onChange={setView}
  options={[
    { value: 'list', label: 'List' },
    { value: 'cards', label: 'Cards' },
  ]}
/>`,
  },

  // ---- Forms ----------------------------------------------------------------
  {
    id: 'input',
    title: 'Input',
    group: 'Forms',
    blurb: 'Controlled text field. Uses value/onInput (onInput receives the string, not the event).',
    controls: {
      placeholder: { type: 'text', label: 'placeholder', default: 'Full name' },
      disabled: { type: 'boolean', label: 'disabled', default: false },
    },
    demo: (c) => {
      const [name, setName] = createSignal('')
      return <UI.Input value={name()} onInput={setName} placeholder={c.placeholder as string} disabled={c.disabled as boolean} class="max-w-xs" />
    },
    code: (c) => `const [name, setName] = createSignal('')
<Input value={name()} onInput={setName} placeholder="${c.placeholder}"${c.disabled ? ' disabled' : ''} />`,
  },
  {
    id: 'textarea',
    title: 'Textarea',
    group: 'Forms',
    blurb: 'Controlled multi-line field, resizable vertically.',
    controls: {
      placeholder: { type: 'text', label: 'placeholder', default: 'Write a note…' },
      disabled: { type: 'boolean', label: 'disabled', default: false },
    },
    demo: (c) => {
      const [text, setText] = createSignal('')
      return <UI.Textarea value={text()} onInput={setText} placeholder={c.placeholder as string} disabled={c.disabled as boolean} class="max-w-sm" />
    },
    code: (c) => `const [note, setNote] = createSignal('')
<Textarea value={note()} onInput={setNote} placeholder="${c.placeholder}"${c.disabled ? ' disabled' : ''} />`,
  },
  {
    id: 'select',
    title: 'Select',
    group: 'Forms',
    blurb: 'Controlled native select (value/onChange receives the string). The <option>s go as children.',
    demo: () => {
      const [status, setStatus] = createSignal('active')
      return (
        <UI.Select value={status()} onChange={setStatus} class="max-w-xs">
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="archived">Archived</option>
        </UI.Select>
      )
    },
    code: `const [status, setStatus] = createSignal('active')
<Select value={status()} onChange={setStatus}>
  <option value="active">Active</option>
  <option value="paused">Paused</option>
</Select>`,
  },
  {
    id: 'combobox',
    title: 'Combobox',
    group: 'Forms',
    blurb: 'Single selection with type-to-search (Kobalte). Options as a list of strings.',
    demo: () => {
      const [state, setState] = createSignal('Sonora')
      return (
        <div class="max-w-xs">
          <UI.Combobox
            options={['Sonora', 'Sinaloa', 'Jalisco', 'Nuevo León', 'Chihuahua']}
            value={state()}
            onChange={setState}
            placeholder="Search a state…"
          />
        </div>
      )
    },
    code: `const [state, setState] = createSignal('Sonora')
<Combobox
  options={['Sonora', 'Sinaloa', 'Jalisco', 'Nuevo León']}
  value={state()}
  onChange={setState}
  placeholder="Search a state…"
/>`,
  },
  {
    id: 'checkbox',
    title: 'Checkbox',
    group: 'Forms',
    blurb: 'Checkbox with a clickable label (checked/onChange).',
    controls: {
      label: { type: 'text', label: 'label', default: 'I accept the terms' },
    },
    demo: (c) => {
      const [accepted, setAccepted] = createSignal(false)
      return <UI.Checkbox checked={accepted()} onChange={setAccepted} label={c.label as string} />
    },
    code: (c) => `const [accepted, setAccepted] = createSignal(false)
<Checkbox checked={accepted()} onChange={setAccepted} label="${c.label}" />`,
  },
  {
    id: 'radio-group',
    title: 'RadioGroup',
    group: 'Forms',
    blurb: 'Accessible single-choice group (Kobalte), with an optional label.',
    demo: () => {
      const [plan, setPlan] = createSignal('monthly')
      return (
        <UI.RadioGroup
          value={plan()}
          onChange={setPlan}
          label="Billing plan"
          options={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'annual', label: 'Annual' },
            { value: 'enterprise', label: 'Enterprise', disabled: true },
          ]}
        />
      )
    },
    code: `const [plan, setPlan] = createSignal('monthly')
<RadioGroup
  value={plan()}
  onChange={setPlan}
  label="Billing plan"
  options={[
    { value: 'monthly', label: 'Monthly' },
    { value: 'annual', label: 'Annual' },
  ]}
/>`,
  },
  {
    id: 'slider',
    title: 'Slider',
    group: 'Forms',
    blurb: 'Single-value slider (Kobalte), with a visible label and value.',
    controls: {
      label: { type: 'text', label: 'label', default: 'Max price' },
      min: { type: 'number', label: 'min', default: 0, min: 0, max: 100 },
      max: { type: 'number', label: 'max', default: 100, min: 0, max: 1000 },
      step: { type: 'number', label: 'step', default: 5, min: 1, max: 50 },
    },
    demo: (c) => {
      const [price, setPrice] = createSignal(50)
      return (
        <div class="w-64">
          <UI.Slider value={price()} onChange={setPrice} min={c.min as number} max={c.max as number} step={c.step as number} label={c.label as string} />
        </div>
      )
    },
    code: (c) => `const [price, setPrice] = createSignal(50)
<Slider value={price()} onChange={setPrice} min={${c.min}} max={${c.max}} step={${c.step}} label="${c.label}" />`,
  },
  {
    id: 'number-input',
    title: 'NumberInput',
    group: 'Forms',
    blurb: 'Numeric field with −/+ buttons (Kobalte NumberField).',
    controls: {
      min: { type: 'number', label: 'min', default: 0, min: -100, max: 100 },
      max: { type: 'number', label: 'max', default: 99, min: 0, max: 1000 },
    },
    demo: (c) => {
      const [quantity, setQuantity] = createSignal(1)
      return <UI.NumberInput value={quantity()} onChange={setQuantity} min={c.min as number} max={c.max as number} />
    },
    code: (c) => `const [quantity, setQuantity] = createSignal(1)
<NumberInput value={quantity()} onChange={setQuantity} min={${c.min}} max={${c.max}} />`,
  },
  {
    id: 'date-field',
    title: 'DateField',
    group: 'Forms',
    blurb: 'Date picker with a monthly calendar. Value in YYYY-MM-DD format (local).',
    demo: () => {
      const [date, setDate] = createSignal('')
      return (
        <div class="max-w-xs">
          <UI.DateField value={date()} onChange={setDate} label="Due date" />
        </div>
      )
    },
    code: `const [date, setDate] = createSignal('')
<DateField value={date()} onChange={setDate} label="Due date" />`,
  },
  {
    id: 'dropzone',
    title: 'Dropzone',
    group: 'Forms',
    blurb: 'Drag-and-drop area (or click to choose). Hands File[] to onFiles; you control the upload.',
    controls: {
      hint: { type: 'text', label: 'hint', default: 'XML or PDF, up to 10 MB' },
      disabled: { type: 'boolean', label: 'disabled', default: false },
    },
    demo: (c) => (
      <div class="w-full max-w-md">
        <UI.Dropzone
          multiple
          accept=".xml,.pdf"
          hint={c.hint as string}
          disabled={c.disabled as boolean}
          onFiles={(files) => UI.toast.success(`${files.length} file(s) selected`)}
        />
      </div>
    ),
    code: (c) => `<Dropzone
  multiple
  accept=".xml,.pdf"
  hint="${c.hint}"${c.disabled ? '\n  disabled' : ''}
  onFiles={(files) => upload(files)}
/>`,
  },

  // ---- Data -----------------------------------------------------------------
  {
    id: 'badge',
    title: 'Badge',
    group: 'Data',
    blurb: 'Status pill with 5 semantic tones.',
    controls: {
      tone: { type: 'select', label: 'tone', options: ['neutral', 'success', 'warning', 'danger', 'info'], default: 'success' },
      text: { type: 'text', label: 'text', default: 'paid' },
    },
    demo: (c) => (
      <UI.Badge tone={c.tone as UI.BadgeTone}>{c.text as string}</UI.Badge>
    ),
    code: (c) => `<Badge tone="${c.tone}">${c.text}</Badge>`,
  },
  {
    id: 'card',
    title: 'Card',
    group: 'Data',
    blurb: 'Container surface with sub-parts (Header/Title/Content). With glass, a frosted surface + glow.',
    controls: {
      glass: { type: 'boolean', label: 'glass', default: true },
      glow: { type: 'boolean', label: 'glow', default: true },
    },
    demo: (c) => (
      <UI.Card glass={c.glass as boolean} glow={c.glow as boolean} class="w-full max-w-sm">
        <UI.CardHeader>
          <UI.CardTitle>Invoice #A4-1024</UI.CardTitle>
        </UI.CardHeader>
        <UI.CardContent class="text-sm text-muted-foreground">
          Issued Jul 12, 2026 · Total $12,400 MXN.
        </UI.CardContent>
      </UI.Card>
    ),
    code: (c) => `<Card${c.glass ? ' glass' : ''}${c.glow ? ' glow' : ' glow={false}'}>
  <CardHeader>
    <CardTitle>Invoice #A4-1024</CardTitle>
  </CardHeader>
  <CardContent>Issued Jul 12, 2026 · Total $12,400 MXN.</CardContent>
</Card>`,
  },
  {
    id: 'table',
    title: 'Table',
    group: 'Data',
    blurb: 'Table primitives (Table + Head/Body/Row/HeadCell/Cell). For long lists, virtualize.',
    demo: () => (
      <UI.Table>
        <UI.TableHead>
          <UI.TableRow>
            <UI.TableHeadCell>Product</UI.TableHeadCell>
            <UI.TableHeadCell>Stock</UI.TableHeadCell>
          </UI.TableRow>
        </UI.TableHead>
        <UI.TableBody>
          <UI.TableRow>
            <UI.TableCell>Sensor A4</UI.TableCell>
            <UI.TableCell>128</UI.TableCell>
          </UI.TableRow>
          <UI.TableRow>
            <UI.TableCell>Module X</UI.TableCell>
            <UI.TableCell>42</UI.TableCell>
          </UI.TableRow>
        </UI.TableBody>
      </UI.Table>
    ),
    code: `<Table>
  <TableHead>
    <TableRow>
      <TableHeadCell>Product</TableHeadCell>
      <TableHeadCell>Stock</TableHeadCell>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>Sensor A4</TableCell>
      <TableCell>128</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
  },
  {
    id: 'virtual-list',
    title: 'VirtualList',
    group: 'Data',
    blurb: 'Virtualized list: only the visible rows live in the DOM. Requires a fixed height in class.',
    controls: {
      rows: { type: 'number', label: 'rows', default: 1000, min: 0, max: 100000 },
    },
    demo: (c) => (
      <UI.VirtualList
        each={Array.from({ length: c.rows as number }, (_, i) => i)}
        estimateSize={36}
        class="h-[200px] w-full rounded-md border border-border"
      >
        {(i) => (
          <div class="flex h-9 items-center border-b border-border px-3 text-sm text-foreground">
            Row {i + 1}
          </div>
        )}
      </UI.VirtualList>
    ),
    code: (c) => `<VirtualList
  each={records()} {/* ${c.rows} rows */}
  estimateSize={36}
  class="h-[65vh] w-full"
>
  {(record) => <RecordRow record={record} />}
</VirtualList>`,
  },
  {
    id: 'pagination',
    title: 'Pagination',
    group: 'Data',
    blurb: 'Previous/next pager with "Page X of Y" and an optional summary on the left.',
    controls: {
      totalPages: { type: 'number', label: 'totalPages', default: 8, min: 1, max: 100 },
    },
    demo: (c) => {
      const [page, setPage] = createSignal(1)
      return (
        <div class="w-full max-w-md rounded-md border border-border">
          <UI.Pagination
            page={page()}
            totalPages={c.totalPages as number}
            onChange={setPage}
            summary={<span>1,234 records</span>}
          />
        </div>
      )
    },
    code: (c) => `const [page, setPage] = createSignal(1)
<Pagination
  page={page()}
  totalPages={${c.totalPages}}
  onChange={setPage}
  summary={<span>1,234 records</span>}
/>`,
  },
  {
    id: 'avatar',
    title: 'Avatar',
    group: 'Data',
    blurb: 'User avatar (Kobalte Image): shows the image or, if it fails, the initials.',
    controls: {
      fallback: { type: 'text', label: 'fallback', default: 'LR' },
      src: { type: 'text', label: 'src', default: '' },
    },
    demo: (c) => (
      <div class="flex items-center gap-3">
        <UI.Avatar src={(c.src as string) || undefined} fallback={c.fallback as string} />
      </div>
    ),
    code: (c) => c.src
      ? `<Avatar src="${c.src}" alt="User" fallback="${c.fallback}" />`
      : `<Avatar fallback="${c.fallback}" />`,
  },
  {
    id: 'progress',
    title: 'Progress',
    group: 'Data',
    blurb: 'Determinate progress bar (Kobalte Progress), with an optional label and value.',
    controls: {
      value: { type: 'number', label: 'value', default: 64, min: 0, max: 100 },
      label: { type: 'text', label: 'label', default: 'Uploading files' },
    },
    demo: (c) => (
      <div class="w-64">
        <UI.Progress value={c.value as number} label={c.label as string} />
      </div>
    ),
    code: (c) => `<Progress value={${c.value}} label="${c.label}" />`,
  },
  {
    id: 'meter',
    title: 'Meter',
    group: 'Data',
    blurb: 'Static gauge for a measurement (Kobalte Meter) — e.g. disk usage or quota.',
    controls: {
      value: { type: 'number', label: 'value', default: 38, min: 0, max: 50 },
      label: { type: 'text', label: 'label', default: 'Storage' },
    },
    demo: (c) => (
      <div class="w-64">
        <UI.Meter value={c.value as number} max={50} label={c.label as string} />
      </div>
    ),
    code: (c) => `<Meter value={${c.value}} max={50} label="${c.label}" />`,
  },
  {
    id: 'separator',
    title: 'Separator',
    group: 'Data',
    blurb: 'Horizontal or vertical visual/semantic divider (Kobalte Separator).',
    controls: {
      orientation: { type: 'select', label: 'orientation', options: ['horizontal', 'vertical'], default: 'horizontal' },
    },
    demo: (c) =>
      c.orientation === 'vertical' ? (
        <div class="flex h-16 items-center gap-4 text-sm text-foreground">
          <span>Left</span>
          <UI.Separator orientation="vertical" />
          <span>Right</span>
        </div>
      ) : (
        <div class="w-full max-w-xs space-y-3 text-sm text-foreground">
          <p>Top section</p>
          <UI.Separator orientation="horizontal" />
          <p>Bottom section</p>
        </div>
      ),
    code: (c) => `<Separator orientation="${c.orientation}" />`,
  },
  {
    id: 'skeleton',
    title: 'Skeleton',
    group: 'Data',
    blurb: 'Pulsing placeholder while content loads. Set the size with class.',
    demo: () => (
      <div class="w-full max-w-sm space-y-2">
        <UI.Skeleton class="h-4 w-3/4" />
        <UI.Skeleton class="h-4 w-1/2" />
        <UI.Skeleton class="h-24 w-full" />
      </div>
    ),
    code: `<Skeleton class="h-4 w-3/4" />
<Skeleton class="h-24 w-full" />`,
  },

  // ---- Overlays -------------------------------------------------------------
  {
    id: 'modal',
    title: 'Modal',
    group: 'Overlays',
    blurb: 'Dialog (Kobalte). variant="center" for short confirmations; "drawer" (default) for forms.',
    controls: {
      variant: { type: 'select', label: 'variant', options: ['drawer', 'center'], default: 'center' },
      title: { type: 'text', label: 'title', default: 'Confirm action' },
    },
    demo: (c) => {
      const [open, setOpen] = createSignal(false)
      return (
        <>
          <UI.Button onClick={() => setOpen(true)}>Open modal</UI.Button>
          <UI.Modal open={open()} onOpenChange={setOpen} variant={c.variant as 'drawer' | 'center'} title={c.title as string}>
            <p class="text-sm text-muted-foreground">Do you want to continue with this action?</p>
            <div class="mt-4 flex justify-end gap-2">
              <UI.Button variant="outline" onClick={() => setOpen(false)}>Cancel</UI.Button>
              <UI.Button onClick={() => setOpen(false)}>Confirm</UI.Button>
            </div>
          </UI.Modal>
        </>
      )
    },
    code: (c) => `const [open, setOpen] = createSignal(false)
<Button onClick={() => setOpen(true)}>Open</Button>
<Modal open={open()} onOpenChange={setOpen} variant="${c.variant}" title="${c.title}">
  <p>Do you want to continue?</p>
</Modal>`,
  },
  {
    id: 'drawer',
    title: 'Drawer',
    group: 'Overlays',
    blurb: 'Sliding panel anchored to the right (Kobalte Dialog), with an optional fixed header (title/subtitle).',
    controls: {
      title: { type: 'text', label: 'title', default: 'Customer detail' },
      subtitle: { type: 'text', label: 'subtitle', default: 'Rivera S.A. de C.V.' },
    },
    demo: (c) => {
      const [open, setOpen] = createSignal(false)
      return (
        <>
          <UI.Button variant="outline" onClick={() => setOpen(true)}>Open panel</UI.Button>
          <UI.Drawer open={open()} onOpenChange={setOpen} title={c.title as string} subtitle={c.subtitle as string}>
            <div class="p-6 text-sm text-muted-foreground">
              Side panel content: a form, details, etc.
            </div>
          </UI.Drawer>
        </>
      )
    },
    code: (c) => `const [open, setOpen] = createSignal(false)
<Button onClick={() => setOpen(true)}>Open panel</Button>
<Drawer open={open()} onOpenChange={setOpen} title="${c.title}" subtitle="${c.subtitle}">
  <div class="p-6">…</div>
</Drawer>`,
  },
  {
    id: 'popover',
    title: 'Popover',
    group: 'Overlays',
    blurb: 'Floating panel shown on trigger click (Kobalte Popover).',
    demo: () => (
      <UI.Popover trigger={<UI.Button variant="outline">Open popover</UI.Button>}>
        <div class="w-48 text-sm">
          <p class="font-medium text-foreground">Floating panel</p>
          <p class="text-muted-foreground">Contextual content on click.</p>
        </div>
      </UI.Popover>
    ),
    code: `<Popover trigger={<Button variant="outline">Filters</Button>}>
  <div class="w-48">…content…</div>
</Popover>`,
  },
  {
    id: 'hover-card',
    title: 'HoverCard',
    group: 'Overlays',
    blurb: 'Floating panel that appears on hover over the trigger (Kobalte HoverCard).',
    demo: () => (
      <UI.HoverCard trigger={<UI.Button variant="ghost">@luis_rivera</UI.Button>}>
        <div class="w-56 text-sm">
          <p class="font-semibold text-foreground">Luis Alfredo Rivera</p>
          <p class="text-muted-foreground">Engineering · Sonora Precision</p>
        </div>
      </UI.HoverCard>
    ),
    code: `<HoverCard trigger={<a href="/u/luis">@luis_rivera</a>}>
  <ProfileSummary user={user} />
</HoverCard>`,
  },
  {
    id: 'alert-dialog',
    title: 'AlertDialog',
    group: 'Overlays',
    blurb: 'Centered confirmation dialog (Kobalte AlertDialog) for destructive actions.',
    controls: {
      title: { type: 'text', label: 'title', default: 'Delete account?' },
    },
    demo: (c) => {
      const [open, setOpen] = createSignal(false)
      return (
        <>
          <UI.Button variant="outline" onClick={() => setOpen(true)}>Delete account</UI.Button>
          <UI.AlertDialog open={open()} onOpenChange={setOpen} title={c.title as string}>
            This action is permanent and can't be undone.{' '}
            <UI.Button variant="ghost" class="mt-3" onClick={() => setOpen(false)}>Got it</UI.Button>
          </UI.AlertDialog>
        </>
      )
    },
    code: (c) => `const [open, setOpen] = createSignal(false)
<Button onClick={() => setOpen(true)}>Delete account</Button>
<AlertDialog open={open()} onOpenChange={setOpen} title="${c.title}">
  This action is permanent and can't be undone.
</AlertDialog>`,
  },

  // ---- Feedback -------------------------------------------------------------
  {
    id: 'toast',
    title: 'Toast',
    group: 'Feedback',
    blurb: 'Imperative notifications: call toast.success/error/info from anywhere. The Toaster is already mounted.',
    demo: () => (
      <div class="flex flex-wrap gap-2">
        <UI.Button onClick={() => UI.toast.success('Saved', 'Your changes were saved.')}>Success</UI.Button>
        <UI.Button variant="outline" onClick={() => UI.toast.error('Failed to save')}>Error</UI.Button>
        <UI.Button variant="ghost" onClick={() => UI.toast.info('Syncing…')}>Info</UI.Button>
      </div>
    ),
    code: `// just once, near the root:
<Toaster />

// from anywhere:
toast.success('Saved', 'Your changes were saved.')
toast.error('Failed to save')`,
  },
  {
    id: 'spinner',
    title: 'Spinner',
    group: 'Feedback',
    blurb: 'Spinning loading indicator with role="status" and an accessible label.',
    demo: () => (
      <div class="flex items-center gap-4">
        <UI.Spinner />
        <UI.Spinner class="h-8 w-8 text-primary" label="Processing" />
      </div>
    ),
    code: `<Spinner />
<Spinner class="h-8 w-8 text-primary" label="Processing" />`,
  },

  // ---- Navigation -----------------------------------------------------------
  {
    id: 'tabs',
    title: 'Tabs',
    group: 'Navigation',
    blurb: 'Accessible tabs (Kobalte) with an animated indicator. Controlled by value/onChange.',
    demo: () => {
      const [tab, setTab] = createSignal('general')
      return (
        <div class="w-full max-w-md">
          <UI.Tabs
            value={tab()}
            onChange={setTab}
            items={[
              { value: 'general', label: 'General', content: <p class="text-sm text-muted-foreground">General settings.</p> },
              { value: 'security', label: 'Security', content: <p class="text-sm text-muted-foreground">Password and access.</p> },
              { value: 'billing', label: 'Billing', content: <p class="text-sm text-muted-foreground">Payment methods.</p> },
            ]}
          />
        </div>
      )
    },
    code: `const [tab, setTab] = createSignal('general')
<Tabs
  value={tab()}
  onChange={setTab}
  items={[
    { value: 'general', label: 'General', content: <GeneralSettings /> },
    { value: 'security', label: 'Security', content: <SecuritySettings /> },
  ]}
/>`,
  },
  {
    id: 'accordion',
    title: 'Accordion',
    group: 'Navigation',
    blurb: 'Accessible accordion (Kobalte). multiple lets several sections be open at once.',
    demo: () => (
      <div class="w-full max-w-md">
        <UI.Accordion
          items={[
            { value: 'shipping', title: 'How long does shipping take?', content: '3 to 5 business days.' },
            { value: 'payment', title: 'Which payment methods do you accept?', content: 'Card, bank transfer, and OXXO.' },
            { value: 'warranty', title: 'Is there a warranty?', content: '12 months on all equipment.' },
          ]}
        />
      </div>
    ),
    code: `<Accordion
  items={[
    { value: 'shipping', title: 'How long does shipping take?', content: '3 to 5 business days.' },
    { value: 'payment', title: 'Which payment methods do you accept?', content: 'Card and bank transfer.' },
  ]}
/>`,
  },
  {
    id: 'breadcrumb',
    title: 'Breadcrumb',
    group: 'Navigation',
    blurb: 'Navigation trail (Kobalte Breadcrumbs). The last item is the current page.',
    demo: () => (
      <UI.Breadcrumb
        items={[
          { label: 'Home', href: '#' },
          { label: 'Customers', href: '#' },
          { label: 'Rivera S.A.' },
        ]}
      />
    ),
    code: `<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Customers', href: '/customers' },
    { label: 'Rivera S.A.' },
  ]}
/>`,
  },
  {
    id: 'page-header',
    title: 'PageHeader',
    group: 'Navigation',
    blurb: 'Consistent page header: optional breadcrumb, title, subtitle, and an actions slot on the right.',
    controls: {
      title: { type: 'text', label: 'title', default: 'Rivera S.A. de C.V.' },
      subtitle: { type: 'text', label: 'subtitle', default: 'Customer since 2019 · 42 invoices' },
    },
    demo: (c) => (
      <div class="w-full">
        <UI.PageHeader
          breadcrumb={['Customers', 'Rivera S.A.']}
          title={c.title as string}
          subtitle={c.subtitle as string}
          actions={<UI.Button>New invoice</UI.Button>}
        />
      </div>
    ),
    code: (c) => `<PageHeader
  breadcrumb={['Customers', 'Rivera S.A.']}
  title="${c.title}"
  subtitle="${c.subtitle}"
  actions={<Button>New invoice</Button>}
/>`,
  },

  // ---- Layout ---------------------------------------------------------------
  {
    id: 'app-shell',
    title: 'AppShell',
    group: 'Layout',
    blurb: 'Slot-based app structure: space background (z-0), sidebar, topbar, banner, and a <main> with a cross-fade between routes.',
    demo: () => (
      <p class="text-sm text-muted-foreground">
        AppShell wraps the ENTIRE app (background + sidebar + topbar + routes), so it isn't shown
        live here — it would nest a second shell. See the code for real usage.
      </p>
    ),
    code: `import { AppShell } from '@a4ui/core'

<AppShell
  sidebar={<MySidebar />}
  topbar={<MyTopbar />}
  banner={<DemoBanner />}
>
  <Routes>…</Routes>
</AppShell>`,
  },
  {
    id: 'space-background',
    title: 'SpaceBackground',
    group: 'Layout',
    blurb: 'The "space glass" background: a fixed layer (z-0) with stars, nebula, planets, and shooting stars. Respects reduced-motion.',
    demo: () => (
      <p class="text-sm text-muted-foreground">
        SpaceBackground is a fixed full-screen layer (already active behind this page thanks to the
        catalog itself). It isn't rendered live here so it doesn't stack a second background. Usage in the code.
      </p>
    ),
    code: `import { SpaceBackground } from '@a4ui/core'

// AppShell usually adds it for you; to use it standalone:
<div class="relative min-h-screen">
  <SpaceBackground />
  <div class="relative z-10">…content…</div>
</div>`,
  },
  {
    id: 'theme-toggle',
    title: 'ThemeToggle',
    group: 'Layout',
    blurb: 'Button that toggles light/dark theme. The icon shows the CURRENT theme (🌙 dark, ☀️ light).',
    demo: () => <UI.ThemeToggle />,
    code: `import { ThemeToggle } from '@a4ui/core'

<ThemeToggle />`,
  },
  {
    id: 'effects-toggle',
    title: 'EffectsToggle',
    group: 'Layout',
    blurb: 'Turns visual effects on/off (glass + starfield + animations). Off = calm mode, opaque and motionless.',
    demo: () => <UI.EffectsToggle />,
    code: `import { EffectsToggle } from '@a4ui/core'

<EffectsToggle />`,
  },
  {
    id: 'nav-group',
    title: 'NavGroup',
    group: 'Layout',
    blurb: 'Collapsible sidebar category (native <details>). Open by default; the chevron rotates when collapsed.',
    controls: {
      title: { type: 'text', label: 'title', default: 'Billing' },
    },
    demo: (c) => (
      <div class="w-56">
        <UI.NavGroup title={c.title as string}>
          <a href="#" class="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">Invoices</a>
          <a href="#" class="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">Payments</a>
          <a href="#" class="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">Credit notes</a>
        </UI.NavGroup>
      </div>
    ),
    code: (c) => `<NavGroup title="${c.title}">
  <NavLink href="/invoices">Invoices</NavLink>
  <NavLink href="/payments">Payments</NavLink>
</NavGroup>`,
  },
]
