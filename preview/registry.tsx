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
export const DOC_GROUPS = ['Empezar', 'Acciones', 'Formularios', 'Datos', 'Overlays', 'Feedback', 'Navegación', 'Layout']

export const DOCS: DocEntry[] = [
  // ---- Empezar --------------------------------------------------------------
  {
    id: 'instalacion',
    title: 'Instalación',
    group: 'Empezar',
    blurb: 'A4ui es una librería de componentes SolidJS con estética "Spatial Glass". Instálala y ten todo el diseño resuelto.',
    demo: () => (
      <div class="space-y-3 text-sm text-muted-foreground">
        <p>1. Instala el paquete. 2. Añade el preset a Tailwind. 3. Importa los estilos una vez. Listo.</p>
        <p>Requiere <code class="rounded bg-muted px-1 font-mono">solid-js</code> y <code class="rounded bg-muted px-1 font-mono">tailwindcss</code> en tu proyecto.</p>
      </div>
    ),
    code: `# 1. instalar
npm install a4ui

// 2. tailwind.config.ts — añade el preset
import a4ui from 'a4ui/preset'
export default {
  presets: [a4ui],
  content: ['./src/**/*.{ts,tsx}', './node_modules/a4ui/dist/**/*.js'],
}

// 3. tu entry (una sola vez)
import 'a4ui/styles.css'`,
  },
  {
    id: 'uso',
    title: 'Uso rápido',
    group: 'Empezar',
    blurb: 'Importa cualquier componente desde "a4ui" y úsalo. Todo respeta el tema claro/oscuro y la accesibilidad de Kobalte.',
    demo: () => (
      <div class="flex flex-wrap items-center gap-3">
        <UI.Button>Un botón</UI.Button>
        <UI.Badge tone="success">Listo</UI.Badge>
        <UI.Spinner />
      </div>
    ),
    code: `import { Button, Badge, Spinner } from 'a4ui'

export function Ejemplo() {
  return (
    <>
      <Button>Un botón</Button>
      <Badge tone="success">Listo</Badge>
      <Spinner />
    </>
  )
}`,
  },

  // ---- Acciones -------------------------------------------------------------
  {
    id: 'button',
    title: 'Button',
    group: 'Acciones',
    blurb: 'Botón con 4 variantes. Por defecto type="button" para no enviar formularios por accidente. Prueba los controles ↓',
    controls: {
      variant: { type: 'select', label: 'variant', options: ['primary', 'secondary', 'outline', 'ghost'], default: 'primary' },
      disabled: { type: 'boolean', label: 'disabled', default: false },
      label: { type: 'text', label: 'texto', default: 'Guardar' },
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
    blurb: 'Banner inline para mensajes contextuales, con 4 tonos. Prueba los controles ↓',
    controls: {
      tone: { type: 'select', label: 'tone', options: ['info', 'success', 'warning', 'danger'], default: 'info' },
      title: { type: 'text', label: 'title', default: 'Información' },
    },
    demo: (c) => (
      <div class="w-full">
        <UI.Alert tone={c.tone as UI.AlertTone} title={c.title as string}>
          Este es el contenido del aviso.
        </UI.Alert>
      </div>
    ),
    code: (c) => `<Alert tone="${c.tone}" title="${c.title}">Este es el contenido del aviso.</Alert>`,
  },

  // ---- Formularios ----------------------------------------------------------
  {
    id: 'switch',
    title: 'Switch',
    group: 'Formularios',
    blurb: 'Interruptor on/off accesible (Kobalte).',
    controls: {
      label: { type: 'text', label: 'label', default: 'Notificaciones' },
      disabled: { type: 'boolean', label: 'disabled', default: false },
    },
    demo: (c) => {
      const [on, setOn] = createSignal(true)
      return <UI.Switch checked={on()} onChange={setOn} label={c.label as string} disabled={c.disabled as boolean} />
    },
    code: (c) => `const [on, setOn] = createSignal(true)
<Switch checked={on()} onChange={setOn} label="${c.label}"${c.disabled ? ' disabled' : ''} />`,
  },

  // ---- Datos ----------------------------------------------------------------
  {
    id: 'stat',
    title: 'Stat',
    group: 'Datos',
    blurb: 'Tarjeta KPI con entrada animada (solid-motionone) y count-up del número (respeta reduced-motion). Cambia el valor y velo contar ↓',
    controls: {
      label: { type: 'text', label: 'label', default: 'Ingresos' },
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
    blurb: 'Etiqueta flotante al enfocar/pasar el cursor (Kobalte).',
    controls: {
      content: { type: 'text', label: 'content', default: 'Soy un tooltip' },
    },
    demo: (c) => (
      <UI.Tooltip content={c.content as string}>
        <UI.Button variant="outline">Pásame el cursor</UI.Button>
      </UI.Tooltip>
    ),
    code: (c) => `<Tooltip content="${c.content}">
  <Button variant="outline">Pásame el cursor</Button>
</Tooltip>`,
  },

  // ---- Acciones -------------------------------------------------------------
  {
    id: 'dropdown',
    title: 'Dropdown',
    group: 'Acciones',
    blurb: 'Menú de acciones (Kobalte). El propio trigger ES el botón, así que sus hijos deben ser no interactivos.',
    demo: () => (
      <UI.Dropdown
        label="Acciones"
        items={[
          { label: 'Editar', onSelect: () => UI.toast.info('Editar') },
          { label: 'Duplicar', onSelect: () => UI.toast.info('Duplicar') },
          { label: 'Eliminar', onSelect: () => UI.toast.error('Eliminado'), destructive: true },
        ]}
      >
        <span class="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
          Acciones ▾
        </span>
      </UI.Dropdown>
    ),
    code: `<Dropdown
  label="Acciones"
  items={[
    { label: 'Editar', onSelect: () => editar() },
    { label: 'Eliminar', onSelect: () => borrar(), destructive: true },
  ]}
>
  <span class="...">Acciones ▾</span>
</Dropdown>`,
  },
  {
    id: 'context-menu',
    title: 'ContextMenu',
    group: 'Acciones',
    blurb: 'Menú contextual al hacer clic derecho sobre el elemento hijo (el objetivo).',
    demo: () => (
      <UI.ContextMenu
        items={[
          { label: 'Copiar', onSelect: () => UI.toast.info('Copiado') },
          { label: 'Pegar', onSelect: () => UI.toast.info('Pegado') },
          { label: 'Borrar', onSelect: () => UI.toast.error('Borrado'), destructive: true },
        ]}
      >
        <div class="grid h-24 w-full place-items-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
          Haz clic derecho aquí
        </div>
      </UI.ContextMenu>
    ),
    code: `<ContextMenu
  items={[
    { label: 'Copiar', onSelect: () => copiar() },
    { label: 'Borrar', onSelect: () => borrar(), destructive: true },
  ]}
>
  <div class="...">Haz clic derecho aquí</div>
</ContextMenu>`,
  },
  {
    id: 'toggle',
    title: 'Toggle',
    group: 'Acciones',
    blurb: 'Botón de dos estados (presionado / no) — ideal para barras de herramientas.',
    demo: () => {
      const [on, setOn] = createSignal(false)
      return (
        <UI.Toggle pressed={on()} onChange={setOn}>
          <span class="text-sm font-semibold">B</span>
        </UI.Toggle>
      )
    },
    code: `const [negrita, setNegrita] = createSignal(false)
<Toggle pressed={negrita()} onChange={setNegrita}>
  <BoldIcon />
</Toggle>`,
  },
  {
    id: 'toggle-group',
    title: 'ToggleGroup',
    group: 'Acciones',
    blurb: 'Fila de botones segmentados; el valor puede quedar en null si se deselecciona.',
    demo: () => {
      const [align, setAlign] = createSignal<string | null>('left')
      return (
        <UI.ToggleGroup
          value={align()}
          onChange={setAlign}
          options={[
            { value: 'left', label: 'Izquierda' },
            { value: 'center', label: 'Centro' },
            { value: 'right', label: 'Derecha' },
          ]}
        />
      )
    },
    code: `const [align, setAlign] = createSignal<string | null>('left')
<ToggleGroup
  value={align()}
  onChange={setAlign}
  options={[
    { value: 'left', label: 'Izquierda' },
    { value: 'center', label: 'Centro' },
  ]}
/>`,
  },
  {
    id: 'segmented-control',
    title: 'SegmentedControl',
    group: 'Acciones',
    blurb: 'Selección única con un indicador animado que se desliza bajo la opción activa.',
    demo: () => {
      const [view, setView] = createSignal('lista')
      return (
        <UI.SegmentedControl
          value={view()}
          onChange={setView}
          options={[
            { value: 'lista', label: 'Lista' },
            { value: 'tarjetas', label: 'Tarjetas' },
            { value: 'tabla', label: 'Tabla' },
          ]}
        />
      )
    },
    code: `const [vista, setVista] = createSignal('lista')
<SegmentedControl
  value={vista()}
  onChange={setVista}
  options={[
    { value: 'lista', label: 'Lista' },
    { value: 'tarjetas', label: 'Tarjetas' },
  ]}
/>`,
  },

  // ---- Formularios ----------------------------------------------------------
  {
    id: 'input',
    title: 'Input',
    group: 'Formularios',
    blurb: 'Campo de texto controlado. Usa value/onInput (onInput recibe el string, no el evento).',
    controls: {
      placeholder: { type: 'text', label: 'placeholder', default: 'Nombre completo' },
      disabled: { type: 'boolean', label: 'disabled', default: false },
    },
    demo: (c) => {
      const [nombre, setNombre] = createSignal('')
      return <UI.Input value={nombre()} onInput={setNombre} placeholder={c.placeholder as string} disabled={c.disabled as boolean} class="max-w-xs" />
    },
    code: (c) => `const [nombre, setNombre] = createSignal('')
<Input value={nombre()} onInput={setNombre} placeholder="${c.placeholder}"${c.disabled ? ' disabled' : ''} />`,
  },
  {
    id: 'textarea',
    title: 'Textarea',
    group: 'Formularios',
    blurb: 'Campo multilínea controlado, redimensionable en vertical.',
    controls: {
      placeholder: { type: 'text', label: 'placeholder', default: 'Escribe una nota…' },
      disabled: { type: 'boolean', label: 'disabled', default: false },
    },
    demo: (c) => {
      const [texto, setTexto] = createSignal('')
      return <UI.Textarea value={texto()} onInput={setTexto} placeholder={c.placeholder as string} disabled={c.disabled as boolean} class="max-w-sm" />
    },
    code: (c) => `const [nota, setNota] = createSignal('')
<Textarea value={nota()} onInput={setNota} placeholder="${c.placeholder}"${c.disabled ? ' disabled' : ''} />`,
  },
  {
    id: 'select',
    title: 'Select',
    group: 'Formularios',
    blurb: 'Select nativo controlado (value/onChange recibe el string). Los <option> van como hijos.',
    demo: () => {
      const [estado, setEstado] = createSignal('activo')
      return (
        <UI.Select value={estado()} onChange={setEstado} class="max-w-xs">
          <option value="activo">Activo</option>
          <option value="pausado">Pausado</option>
          <option value="archivado">Archivado</option>
        </UI.Select>
      )
    },
    code: `const [estado, setEstado] = createSignal('activo')
<Select value={estado()} onChange={setEstado}>
  <option value="activo">Activo</option>
  <option value="pausado">Pausado</option>
</Select>`,
  },
  {
    id: 'combobox',
    title: 'Combobox',
    group: 'Formularios',
    blurb: 'Selección única con búsqueda por escritura (Kobalte). Opciones como lista de strings.',
    demo: () => {
      const [estado, setEstado] = createSignal('Sonora')
      return (
        <div class="max-w-xs">
          <UI.Combobox
            options={['Sonora', 'Sinaloa', 'Jalisco', 'Nuevo León', 'Chihuahua']}
            value={estado()}
            onChange={setEstado}
            placeholder="Busca un estado…"
          />
        </div>
      )
    },
    code: `const [estado, setEstado] = createSignal('Sonora')
<Combobox
  options={['Sonora', 'Sinaloa', 'Jalisco', 'Nuevo León']}
  value={estado()}
  onChange={setEstado}
  placeholder="Busca un estado…"
/>`,
  },
  {
    id: 'checkbox',
    title: 'Checkbox',
    group: 'Formularios',
    blurb: 'Casilla de verificación con etiqueta clicable (checked/onChange).',
    controls: {
      label: { type: 'text', label: 'label', default: 'Acepto los términos' },
    },
    demo: (c) => {
      const [acepto, setAcepto] = createSignal(false)
      return <UI.Checkbox checked={acepto()} onChange={setAcepto} label={c.label as string} />
    },
    code: (c) => `const [acepto, setAcepto] = createSignal(false)
<Checkbox checked={acepto()} onChange={setAcepto} label="${c.label}" />`,
  },
  {
    id: 'radio-group',
    title: 'RadioGroup',
    group: 'Formularios',
    blurb: 'Grupo de opción única accesible (Kobalte), con etiqueta opcional.',
    demo: () => {
      const [plan, setPlan] = createSignal('mensual')
      return (
        <UI.RadioGroup
          value={plan()}
          onChange={setPlan}
          label="Plan de pago"
          options={[
            { value: 'mensual', label: 'Mensual' },
            { value: 'anual', label: 'Anual' },
            { value: 'enterprise', label: 'Enterprise', disabled: true },
          ]}
        />
      )
    },
    code: `const [plan, setPlan] = createSignal('mensual')
<RadioGroup
  value={plan()}
  onChange={setPlan}
  label="Plan de pago"
  options={[
    { value: 'mensual', label: 'Mensual' },
    { value: 'anual', label: 'Anual' },
  ]}
/>`,
  },
  {
    id: 'slider',
    title: 'Slider',
    group: 'Formularios',
    blurb: 'Control deslizante de un solo valor (Kobalte), con etiqueta y valor visibles.',
    controls: {
      label: { type: 'text', label: 'label', default: 'Precio máx.' },
      min: { type: 'number', label: 'min', default: 0, min: 0, max: 100 },
      max: { type: 'number', label: 'max', default: 100, min: 0, max: 1000 },
      step: { type: 'number', label: 'step', default: 5, min: 1, max: 50 },
    },
    demo: (c) => {
      const [precio, setPrecio] = createSignal(50)
      return (
        <div class="w-64">
          <UI.Slider value={precio()} onChange={setPrecio} min={c.min as number} max={c.max as number} step={c.step as number} label={c.label as string} />
        </div>
      )
    },
    code: (c) => `const [precio, setPrecio] = createSignal(50)
<Slider value={precio()} onChange={setPrecio} min={${c.min}} max={${c.max}} step={${c.step}} label="${c.label}" />`,
  },
  {
    id: 'number-input',
    title: 'NumberInput',
    group: 'Formularios',
    blurb: 'Campo numérico con botones −/+ (Kobalte NumberField).',
    controls: {
      min: { type: 'number', label: 'min', default: 0, min: -100, max: 100 },
      max: { type: 'number', label: 'max', default: 99, min: 0, max: 1000 },
    },
    demo: (c) => {
      const [cantidad, setCantidad] = createSignal(1)
      return <UI.NumberInput value={cantidad()} onChange={setCantidad} min={c.min as number} max={c.max as number} />
    },
    code: (c) => `const [cantidad, setCantidad] = createSignal(1)
<NumberInput value={cantidad()} onChange={setCantidad} min={${c.min}} max={${c.max}} />`,
  },
  {
    id: 'date-field',
    title: 'DateField',
    group: 'Formularios',
    blurb: 'Selector de fecha con calendario mensual en español. Valor en formato YYYY-MM-DD (local).',
    demo: () => {
      const [fecha, setFecha] = createSignal('')
      return (
        <div class="max-w-xs">
          <UI.DateField value={fecha()} onChange={setFecha} label="Fecha de entrega" />
        </div>
      )
    },
    code: `const [fecha, setFecha] = createSignal('')
<DateField value={fecha()} onChange={setFecha} label="Fecha de entrega" />`,
  },
  {
    id: 'dropzone',
    title: 'Dropzone',
    group: 'Formularios',
    blurb: 'Zona de arrastrar y soltar (o clic para elegir). Entrega File[] a onFiles; tú controlas la subida.',
    controls: {
      hint: { type: 'text', label: 'hint', default: 'XML o PDF, hasta 10 MB' },
      disabled: { type: 'boolean', label: 'disabled', default: false },
    },
    demo: (c) => (
      <div class="w-full max-w-md">
        <UI.Dropzone
          multiple
          accept=".xml,.pdf"
          hint={c.hint as string}
          disabled={c.disabled as boolean}
          onFiles={(files) => UI.toast.success(`${files.length} archivo(s) seleccionado(s)`)}
        />
      </div>
    ),
    code: (c) => `<Dropzone
  multiple
  accept=".xml,.pdf"
  hint="${c.hint}"${c.disabled ? '\n  disabled' : ''}
  onFiles={(files) => subir(files)}
/>`,
  },

  // ---- Datos ----------------------------------------------------------------
  {
    id: 'badge',
    title: 'Badge',
    group: 'Datos',
    blurb: 'Pastilla de estado con 5 tonos semánticos.',
    controls: {
      tone: { type: 'select', label: 'tone', options: ['neutral', 'success', 'warning', 'danger', 'info'], default: 'success' },
      text: { type: 'text', label: 'texto', default: 'pagado' },
    },
    demo: (c) => (
      <UI.Badge tone={c.tone as UI.BadgeTone}>{c.text as string}</UI.Badge>
    ),
    code: (c) => `<Badge tone="${c.tone}">${c.text}</Badge>`,
  },
  {
    id: 'card',
    title: 'Card',
    group: 'Datos',
    blurb: 'Superficie contenedora con sub-partes (Header/Title/Content). Con glass, superficie esmerilada + glow.',
    controls: {
      glass: { type: 'boolean', label: 'glass', default: true },
      glow: { type: 'boolean', label: 'glow', default: true },
    },
    demo: (c) => (
      <UI.Card glass={c.glass as boolean} glow={c.glow as boolean} class="w-full max-w-sm">
        <UI.CardHeader>
          <UI.CardTitle>Factura #A4-1024</UI.CardTitle>
        </UI.CardHeader>
        <UI.CardContent class="text-sm text-muted-foreground">
          Emitida el 12 jul 2026 · Total $12,400 MXN.
        </UI.CardContent>
      </UI.Card>
    ),
    code: (c) => `<Card${c.glass ? ' glass' : ''}${c.glow ? ' glow' : ' glow={false}'}>
  <CardHeader>
    <CardTitle>Factura #A4-1024</CardTitle>
  </CardHeader>
  <CardContent>Emitida el 12 jul 2026 · Total $12,400 MXN.</CardContent>
</Card>`,
  },
  {
    id: 'table',
    title: 'Table',
    group: 'Datos',
    blurb: 'Primitivas de tabla (Table + Head/Body/Row/HeadCell/Cell). Para listas largas, virtualiza.',
    demo: () => (
      <UI.Table>
        <UI.TableHead>
          <UI.TableRow>
            <UI.TableHeadCell>Producto</UI.TableHeadCell>
            <UI.TableHeadCell>Stock</UI.TableHeadCell>
          </UI.TableRow>
        </UI.TableHead>
        <UI.TableBody>
          <UI.TableRow>
            <UI.TableCell>Sensor A4</UI.TableCell>
            <UI.TableCell>128</UI.TableCell>
          </UI.TableRow>
          <UI.TableRow>
            <UI.TableCell>Módulo X</UI.TableCell>
            <UI.TableCell>42</UI.TableCell>
          </UI.TableRow>
        </UI.TableBody>
      </UI.Table>
    ),
    code: `<Table>
  <TableHead>
    <TableRow>
      <TableHeadCell>Producto</TableHeadCell>
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
    group: 'Datos',
    blurb: 'Lista virtualizada: solo las filas visibles viven en el DOM. Requiere altura fija en class.',
    controls: {
      rows: { type: 'number', label: 'filas', default: 1000, min: 0, max: 100000 },
    },
    demo: (c) => (
      <UI.VirtualList
        each={Array.from({ length: c.rows as number }, (_, i) => i)}
        estimateSize={36}
        class="h-[200px] w-full rounded-md border border-border"
      >
        {(i) => (
          <div class="flex h-9 items-center border-b border-border px-3 text-sm text-foreground">
            Fila {i + 1}
          </div>
        )}
      </UI.VirtualList>
    ),
    code: (c) => `<VirtualList
  each={registros()} {/* ${c.rows} filas */}
  estimateSize={36}
  class="h-[65vh] w-full"
>
  {(reg) => <FilaRegistro registro={reg} />}
</VirtualList>`,
  },
  {
    id: 'pagination',
    title: 'Pagination',
    group: 'Datos',
    blurb: 'Paginador anterior/siguiente con "Página X de Y" y un resumen opcional a la izquierda.',
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
            summary={<span>1,234 registros</span>}
          />
        </div>
      )
    },
    code: (c) => `const [page, setPage] = createSignal(1)
<Pagination
  page={page()}
  totalPages={${c.totalPages}}
  onChange={setPage}
  summary={<span>1,234 registros</span>}
/>`,
  },
  {
    id: 'avatar',
    title: 'Avatar',
    group: 'Datos',
    blurb: 'Avatar de usuario (Kobalte Image): muestra la imagen o, si falla, las iniciales.',
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
      ? `<Avatar src="${c.src}" alt="Usuario" fallback="${c.fallback}" />`
      : `<Avatar fallback="${c.fallback}" />`,
  },
  {
    id: 'progress',
    title: 'Progress',
    group: 'Datos',
    blurb: 'Barra de progreso determinada (Kobalte Progress), con etiqueta y valor opcionales.',
    controls: {
      value: { type: 'number', label: 'value', default: 64, min: 0, max: 100 },
      label: { type: 'text', label: 'label', default: 'Subiendo archivos' },
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
    group: 'Datos',
    blurb: 'Medidor estático de una magnitud (Kobalte Meter) — p. ej. uso de disco o cupo.',
    controls: {
      value: { type: 'number', label: 'value', default: 38, min: 0, max: 50 },
      label: { type: 'text', label: 'label', default: 'Almacenamiento' },
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
    group: 'Datos',
    blurb: 'Divisor visual/semántico horizontal o vertical (Kobalte Separator).',
    controls: {
      orientation: { type: 'select', label: 'orientation', options: ['horizontal', 'vertical'], default: 'horizontal' },
    },
    demo: (c) =>
      c.orientation === 'vertical' ? (
        <div class="flex h-16 items-center gap-4 text-sm text-foreground">
          <span>Izquierda</span>
          <UI.Separator orientation="vertical" />
          <span>Derecha</span>
        </div>
      ) : (
        <div class="w-full max-w-xs space-y-3 text-sm text-foreground">
          <p>Sección superior</p>
          <UI.Separator orientation="horizontal" />
          <p>Sección inferior</p>
        </div>
      ),
    code: (c) => `<Separator orientation="${c.orientation}" />`,
  },
  {
    id: 'skeleton',
    title: 'Skeleton',
    group: 'Datos',
    blurb: 'Placeholder con pulso mientras carga el contenido. Da el tamaño con class.',
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
    blurb: 'Diálogo (Kobalte). variant="center" para confirmaciones cortas; "drawer" (default) para formularios.',
    controls: {
      variant: { type: 'select', label: 'variant', options: ['drawer', 'center'], default: 'center' },
      title: { type: 'text', label: 'title', default: 'Confirmar operación' },
    },
    demo: (c) => {
      const [open, setOpen] = createSignal(false)
      return (
        <>
          <UI.Button onClick={() => setOpen(true)}>Abrir modal</UI.Button>
          <UI.Modal open={open()} onOpenChange={setOpen} variant={c.variant as 'drawer' | 'center'} title={c.title as string}>
            <p class="text-sm text-muted-foreground">¿Deseas continuar con la operación?</p>
            <div class="mt-4 flex justify-end gap-2">
              <UI.Button variant="outline" onClick={() => setOpen(false)}>Cancelar</UI.Button>
              <UI.Button onClick={() => setOpen(false)}>Aceptar</UI.Button>
            </div>
          </UI.Modal>
        </>
      )
    },
    code: (c) => `const [open, setOpen] = createSignal(false)
<Button onClick={() => setOpen(true)}>Abrir</Button>
<Modal open={open()} onOpenChange={setOpen} variant="${c.variant}" title="${c.title}">
  <p>¿Deseas continuar?</p>
</Modal>`,
  },
  {
    id: 'drawer',
    title: 'Drawer',
    group: 'Overlays',
    blurb: 'Panel deslizante anclado a la derecha (Kobalte Dialog), con cabecera fija opcional (title/subtitle).',
    controls: {
      title: { type: 'text', label: 'title', default: 'Detalle del cliente' },
      subtitle: { type: 'text', label: 'subtitle', default: 'Rivera S.A. de C.V.' },
    },
    demo: (c) => {
      const [open, setOpen] = createSignal(false)
      return (
        <>
          <UI.Button variant="outline" onClick={() => setOpen(true)}>Abrir panel</UI.Button>
          <UI.Drawer open={open()} onOpenChange={setOpen} title={c.title as string} subtitle={c.subtitle as string}>
            <div class="p-6 text-sm text-muted-foreground">
              Contenido del panel lateral: formulario, detalles, etc.
            </div>
          </UI.Drawer>
        </>
      )
    },
    code: (c) => `const [open, setOpen] = createSignal(false)
<Button onClick={() => setOpen(true)}>Abrir panel</Button>
<Drawer open={open()} onOpenChange={setOpen} title="${c.title}" subtitle="${c.subtitle}">
  <div class="p-6">…</div>
</Drawer>`,
  },
  {
    id: 'popover',
    title: 'Popover',
    group: 'Overlays',
    blurb: 'Panel flotante al hacer clic en el trigger (Kobalte Popover).',
    demo: () => (
      <UI.Popover trigger={<UI.Button variant="outline">Abrir popover</UI.Button>}>
        <div class="w-48 text-sm">
          <p class="font-medium text-foreground">Panel flotante</p>
          <p class="text-muted-foreground">Contenido contextual al hacer clic.</p>
        </div>
      </UI.Popover>
    ),
    code: `<Popover trigger={<Button variant="outline">Filtros</Button>}>
  <div class="w-48">…contenido…</div>
</Popover>`,
  },
  {
    id: 'hover-card',
    title: 'HoverCard',
    group: 'Overlays',
    blurb: 'Panel flotante que aparece al pasar el cursor sobre el trigger (Kobalte HoverCard).',
    demo: () => (
      <UI.HoverCard trigger={<UI.Button variant="ghost">@luis_rivera</UI.Button>}>
        <div class="w-56 text-sm">
          <p class="font-semibold text-foreground">Luis Alfredo Rivera</p>
          <p class="text-muted-foreground">Ingeniería · Sonora Precision</p>
        </div>
      </UI.HoverCard>
    ),
    code: `<HoverCard trigger={<a href="/u/luis">@luis_rivera</a>}>
  <PerfilResumen usuario={usuario} />
</HoverCard>`,
  },
  {
    id: 'alert-dialog',
    title: 'AlertDialog',
    group: 'Overlays',
    blurb: 'Diálogo de confirmación centrado (Kobalte AlertDialog) para acciones destructivas.',
    controls: {
      title: { type: 'text', label: 'title', default: '¿Eliminar cuenta?' },
    },
    demo: (c) => {
      const [open, setOpen] = createSignal(false)
      return (
        <>
          <UI.Button variant="outline" onClick={() => setOpen(true)}>Eliminar cuenta</UI.Button>
          <UI.AlertDialog open={open()} onOpenChange={setOpen} title={c.title as string}>
            Esta acción es permanente y no se puede deshacer.{' '}
            <UI.Button variant="ghost" class="mt-3" onClick={() => setOpen(false)}>Entendido</UI.Button>
          </UI.AlertDialog>
        </>
      )
    },
    code: (c) => `const [open, setOpen] = createSignal(false)
<Button onClick={() => setOpen(true)}>Eliminar cuenta</Button>
<AlertDialog open={open()} onOpenChange={setOpen} title="${c.title}">
  Esta acción es permanente y no se puede deshacer.
</AlertDialog>`,
  },

  // ---- Feedback -------------------------------------------------------------
  {
    id: 'toast',
    title: 'Toast',
    group: 'Feedback',
    blurb: 'Notificaciones imperativas: llama toast.success/error/info desde cualquier lugar. El Toaster ya está montado.',
    demo: () => (
      <div class="flex flex-wrap gap-2">
        <UI.Button onClick={() => UI.toast.success('Guardado', 'Los cambios se guardaron.')}>Éxito</UI.Button>
        <UI.Button variant="outline" onClick={() => UI.toast.error('Error al guardar')}>Error</UI.Button>
        <UI.Button variant="ghost" onClick={() => UI.toast.info('Sincronizando…')}>Info</UI.Button>
      </div>
    ),
    code: `// una sola vez, cerca del root:
<Toaster />

// desde cualquier parte:
toast.success('Guardado', 'Los cambios se guardaron.')
toast.error('Error al guardar')`,
  },
  {
    id: 'spinner',
    title: 'Spinner',
    group: 'Feedback',
    blurb: 'Indicador de carga giratorio con role="status" y etiqueta accesible.',
    demo: () => (
      <div class="flex items-center gap-4">
        <UI.Spinner />
        <UI.Spinner class="h-8 w-8 text-primary" label="Procesando" />
      </div>
    ),
    code: `<Spinner />
<Spinner class="h-8 w-8 text-primary" label="Procesando" />`,
  },

  // ---- Navegación -----------------------------------------------------------
  {
    id: 'tabs',
    title: 'Tabs',
    group: 'Navegación',
    blurb: 'Pestañas accesibles (Kobalte) con indicador animado. Controladas por value/onChange.',
    demo: () => {
      const [tab, setTab] = createSignal('general')
      return (
        <div class="w-full max-w-md">
          <UI.Tabs
            value={tab()}
            onChange={setTab}
            items={[
              { value: 'general', label: 'General', content: <p class="text-sm text-muted-foreground">Ajustes generales.</p> },
              { value: 'seguridad', label: 'Seguridad', content: <p class="text-sm text-muted-foreground">Contraseña y accesos.</p> },
              { value: 'facturacion', label: 'Facturación', content: <p class="text-sm text-muted-foreground">Métodos de pago.</p> },
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
    { value: 'general', label: 'General', content: <AjustesGenerales /> },
    { value: 'seguridad', label: 'Seguridad', content: <AjustesSeguridad /> },
  ]}
/>`,
  },
  {
    id: 'accordion',
    title: 'Accordion',
    group: 'Navegación',
    blurb: 'Acordeón accesible (Kobalte). multiple permite abrir varias secciones a la vez.',
    demo: () => (
      <div class="w-full max-w-md">
        <UI.Accordion
          items={[
            { value: 'envio', title: '¿Cuánto tarda el envío?', content: 'De 3 a 5 días hábiles.' },
            { value: 'pago', title: '¿Qué métodos de pago aceptan?', content: 'Tarjeta, transferencia y OXXO.' },
            { value: 'garantia', title: '¿Hay garantía?', content: '12 meses en todos los equipos.' },
          ]}
        />
      </div>
    ),
    code: `<Accordion
  items={[
    { value: 'envio', title: '¿Cuánto tarda el envío?', content: 'De 3 a 5 días hábiles.' },
    { value: 'pago', title: '¿Qué métodos de pago aceptan?', content: 'Tarjeta y transferencia.' },
  ]}
/>`,
  },
  {
    id: 'breadcrumb',
    title: 'Breadcrumb',
    group: 'Navegación',
    blurb: 'Ruta de navegación (Kobalte Breadcrumbs). El último elemento es la página actual.',
    demo: () => (
      <UI.Breadcrumb
        items={[
          { label: 'Inicio', href: '#' },
          { label: 'Clientes', href: '#' },
          { label: 'Rivera S.A.' },
        ]}
      />
    ),
    code: `<Breadcrumb
  items={[
    { label: 'Inicio', href: '/' },
    { label: 'Clientes', href: '/clientes' },
    { label: 'Rivera S.A.' },
  ]}
/>`,
  },
  {
    id: 'page-header',
    title: 'PageHeader',
    group: 'Navegación',
    blurb: 'Cabecera de página consistente: breadcrumb opcional, título, subtítulo y slot de acciones a la derecha.',
    controls: {
      title: { type: 'text', label: 'title', default: 'Rivera S.A. de C.V.' },
      subtitle: { type: 'text', label: 'subtitle', default: 'Cliente desde 2019 · 42 facturas' },
    },
    demo: (c) => (
      <div class="w-full">
        <UI.PageHeader
          breadcrumb={['Clientes', 'Rivera S.A.']}
          title={c.title as string}
          subtitle={c.subtitle as string}
          actions={<UI.Button>Nueva factura</UI.Button>}
        />
      </div>
    ),
    code: (c) => `<PageHeader
  breadcrumb={['Clientes', 'Rivera S.A.']}
  title="${c.title}"
  subtitle="${c.subtitle}"
  actions={<Button>Nueva factura</Button>}
/>`,
  },

  // ---- Layout ---------------------------------------------------------------
  {
    id: 'app-shell',
    title: 'AppShell',
    group: 'Layout',
    blurb: 'Estructura de app basada en slots: fondo espacial (z-0), barra lateral, topbar, banner y <main> con cross-fade entre rutas.',
    demo: () => (
      <p class="text-sm text-muted-foreground">
        AppShell envuelve TODA la aplicación (fondo + sidebar + topbar + rutas), por lo que no se muestra
        en vivo aquí — anidaría un segundo shell. Mira el código para el uso real.
      </p>
    ),
    code: `import { AppShell } from 'a4ui'

<AppShell
  sidebar={<MiSidebar />}
  topbar={<MiTopbar />}
  banner={<DemoBanner />}
>
  <Routes>…</Routes>
</AppShell>`,
  },
  {
    id: 'space-background',
    title: 'SpaceBackground',
    group: 'Layout',
    blurb: 'El fondo "space glass": capa fija (z-0) con estrellas, nebulosa, planetas y estrellas fugaces. Respeta reduced-motion.',
    demo: () => (
      <p class="text-sm text-muted-foreground">
        SpaceBackground es una capa fija a pantalla completa (ya activa detrás de esta página gracias al
        propio catálogo). No se renderiza en vivo aquí para no apilar un segundo fondo. Uso en el código.
      </p>
    ),
    code: `import { SpaceBackground } from 'a4ui'

// normalmente lo pone AppShell por ti; para usarlo suelto:
<div class="relative min-h-screen">
  <SpaceBackground />
  <div class="relative z-10">…contenido…</div>
</div>`,
  },
  {
    id: 'theme-toggle',
    title: 'ThemeToggle',
    group: 'Layout',
    blurb: 'Botón que alterna tema claro/oscuro. El icono muestra el tema ACTUAL (🌙 oscuro, ☀️ claro).',
    demo: () => <UI.ThemeToggle />,
    code: `import { ThemeToggle } from 'a4ui'

<ThemeToggle />`,
  },
  {
    id: 'effects-toggle',
    title: 'EffectsToggle',
    group: 'Layout',
    blurb: 'Activa/desactiva los efectos visuales (vidrio + starfield + animaciones). Apagado = modo calmado, opaco y sin movimiento.',
    demo: () => <UI.EffectsToggle />,
    code: `import { EffectsToggle } from 'a4ui'

<EffectsToggle />`,
  },
  {
    id: 'nav-group',
    title: 'NavGroup',
    group: 'Layout',
    blurb: 'Categoría plegable de la barra lateral (native <details>). Abierta por defecto; el chevron rota al plegar.',
    controls: {
      title: { type: 'text', label: 'title', default: 'Facturación' },
    },
    demo: (c) => (
      <div class="w-56">
        <UI.NavGroup title={c.title as string}>
          <a href="#" class="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">Facturas</a>
          <a href="#" class="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">Pagos</a>
          <a href="#" class="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">Notas de crédito</a>
        </UI.NavGroup>
      </div>
    ),
    code: (c) => `<NavGroup title="${c.title}">
  <NavLink href="/facturas">Facturas</NavLink>
  <NavLink href="/pagos">Pagos</NavLink>
</NavGroup>`,
  },
]
