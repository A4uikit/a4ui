// Catalog / visual QA — every component in one scroll. Rendered inside App's
// AppShell (which owns the topbar, Toaster and page transition), so this returns
// a single content root.
import { createSignal, For, type JSX } from 'solid-js'

import {
  Accordion,
  Badge,
  type BadgeTone,
  Button,
  type ButtonVariant,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  DateField,
  Drawer,
  Dropdown,
  Dropzone,
  Input,
  Modal,
  PageHeader,
  Pagination,
  Select,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Tabs,
  toast,
  VirtualList,
} from '../src'

function Section(props: { title: string; children: JSX.Element }): JSX.Element {
  return (
    <section class="space-y-4">
      <h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{props.title}</h2>
      <Card glass class="p-6">
        <div class="flex flex-wrap items-start gap-6">{props.children}</div>
      </Card>
    </section>
  )
}

const BUTTON_VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost']
const BADGE_TONES: BadgeTone[] = ['neutral', 'success', 'warning', 'danger', 'info']

export function Catalog(): JSX.Element {
  const [text, setText] = createSignal('Hola')
  const [sel, setSel] = createSignal('a')
  const [checked, setChecked] = createSignal(true)
  const [date, setDate] = createSignal('')
  const [tab, setTab] = createSignal('one')
  const [page, setPage] = createSignal(1)
  const [modalOpen, setModalOpen] = createSignal(false)
  const [confirmOpen, setConfirmOpen] = createSignal(false)
  const [drawerOpen, setDrawerOpen] = createSignal(false)

  return (
    <div class="space-y-10 pb-24">
      <PageHeader
        title="Catálogo de componentes"
        subtitle="Los 19 componentes de a4ui, en vivo. Cambia tema / efectos arriba a la derecha."
        breadcrumb={['a4ui', 'Catálogo']}
        actions={<Button onClick={() => toast.info('Hola 👋', 'Esto es un toast')}>Probar toast</Button>}
      />

      <Section title="Buttons">
        <For each={BUTTON_VARIANTS}>{(v) => <Button variant={v}>{v}</Button>}</For>
        <Button disabled>disabled</Button>
      </Section>

      <Section title="Badges">
        <For each={BADGE_TONES}>{(t) => <Badge tone={t}>{t}</Badge>}</For>
      </Section>

      <Section title="Cards">
        <Card glass class="w-64">
          <CardHeader>
            <CardTitle>Glass + glow</CardTitle>
          </CardHeader>
          <CardContent class="text-sm text-muted-foreground">
            Superficie de vidrio con borde luminoso que sigue el cursor.
          </CardContent>
        </Card>
        <Card class="w-64">
          <CardHeader>
            <CardTitle>Opaca</CardTitle>
          </CardHeader>
          <CardContent class="text-sm text-muted-foreground">Card sólida sin glass.</CardContent>
        </Card>
      </Section>

      <Section title="Form controls">
        <div class="w-56 space-y-1">
          <label class="text-xs text-muted-foreground">Input</label>
          <Input value={text()} onInput={setText} placeholder="Escribe…" />
        </div>
        <div class="w-56 space-y-1">
          <label class="text-xs text-muted-foreground">Select</label>
          <Select value={sel()} onChange={setSel}>
            <option value="a">Opción A</option>
            <option value="b">Opción B</option>
            <option value="c">Opción C</option>
          </Select>
        </div>
        <div class="w-56 space-y-1">
          <label class="text-xs text-muted-foreground">DateField</label>
          <DateField value={date()} onChange={setDate} />
        </div>
        <div class="w-56 pt-5">
          <Checkbox checked={checked()} onChange={setChecked} label="Acepto los términos" />
        </div>
      </Section>

      <Section title="Dropzone">
        <div class="w-full max-w-md">
          <Dropzone
            onFiles={(f) => toast.success(`${f.length} archivo(s)`, f.map((x) => x.name).join(', '))}
            hint="XML, ZIP hasta 10MB"
          />
        </div>
      </Section>

      <Section title="Tabs">
        <div class="w-full max-w-md">
          <Tabs
            value={tab()}
            onChange={setTab}
            items={[
              { value: 'one', label: 'Uno', content: <p class="text-sm text-muted-foreground">Contenido uno.</p> },
              { value: 'two', label: 'Dos', content: <p class="text-sm text-muted-foreground">Contenido dos.</p> },
              { value: 'three', label: 'Tres', content: <p class="text-sm text-muted-foreground">Contenido tres.</p> },
            ]}
          />
        </div>
      </Section>

      <Section title="Accordion">
        <div class="w-full max-w-md">
          <Accordion
            items={[
              { value: 'a', title: '¿Qué es A4ui?', content: <p class="text-sm">Un design system para SolidJS.</p> },
              { value: 'b', title: '¿Cómo se instala?', content: <p class="text-sm">npm install a4ui.</p> },
            ]}
          />
        </div>
      </Section>

      <Section title="Dropdown">
        <Dropdown
          label="Acciones"
          items={[
            { label: 'Editar', onSelect: () => toast.info('Editar') },
            { label: 'Duplicar', onSelect: () => toast.info('Duplicar') },
            { label: 'Eliminar', destructive: true, onSelect: () => toast.error('Eliminar') },
          ]}
        >
          <Button variant="outline">Menú ▾</Button>
        </Dropdown>
      </Section>

      <Section title="Overlays">
        <Button onClick={() => setModalOpen(true)}>Modal (drawer)</Button>
        <Button variant="outline" onClick={() => setConfirmOpen(true)}>
          Modal (center)
        </Button>
        <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
          Drawer
        </Button>
        <Button onClick={() => toast.success('Guardado', 'Todo bien')}>Toast success</Button>
        <Button variant="outline" onClick={() => toast.error('Error', 'Algo falló')}>
          Toast error
        </Button>
      </Section>

      <Section title="Table + Pagination">
        <div class="w-full">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Folio</TableHeadCell>
                <TableHeadCell>Concepto</TableHeadCell>
                <TableHeadCell>Estado</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <For each={[1, 2, 3, 4, 5]}>
                {(i) => (
                  <TableRow>
                    <TableCell class="font-mono tabular-nums">F-{1000 + i}</TableCell>
                    <TableCell>Registro {i}</TableCell>
                    <TableCell>
                      <Badge tone={i % 2 ? 'success' : 'warning'}>{i % 2 ? 'Pagado' : 'Parcial'}</Badge>
                    </TableCell>
                  </TableRow>
                )}
              </For>
            </TableBody>
          </Table>
          <Pagination
            page={page()}
            totalPages={8}
            onChange={setPage}
            summary={<span>40 registros · página {page()}</span>}
          />
        </div>
      </Section>

      <Section title="VirtualList (10 000 filas)">
        <div class="w-full">
          <p class="mb-2 text-xs text-muted-foreground">
            Solo las filas visibles viven en el DOM — scroll instantáneo aunque sean miles.
          </p>
          <VirtualList
            each={Array.from({ length: 10000 }, (_, i) => i)}
            estimateSize={40}
            class="h-[280px] rounded-lg border border-border"
          >
            {(n) => (
              <div class="flex items-center justify-between border-b border-border px-4 py-2 text-sm">
                <span class="font-mono tabular-nums text-muted-foreground">#{n}</span>
                <span>Fila virtualizada {n}</span>
                <Badge tone={n % 3 === 0 ? 'info' : 'neutral'}>{n % 3 === 0 ? 'destacada' : 'normal'}</Badge>
              </div>
            )}
          </VirtualList>
        </div>
      </Section>

      <Section title="Spinner">
        <Spinner />
      </Section>

      <Modal open={modalOpen()} onOpenChange={setModalOpen} title="Modal tipo drawer">
        <p class="text-sm text-muted-foreground">
          Se desliza desde la derecha (variante por defecto). Ideal para formularios de crear/editar.
        </p>
        <div class="mt-4 flex justify-end">
          <Button onClick={() => setModalOpen(false)}>Cerrar</Button>
        </div>
      </Modal>

      <Modal open={confirmOpen()} onOpenChange={setConfirmOpen} variant="center" title="¿Confirmar?">
        <p class="text-sm text-muted-foreground">Modal centrado, para confirmaciones cortas.</p>
        <div class="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => setConfirmOpen(false)}>Confirmar</Button>
        </div>
      </Modal>

      <Drawer open={drawerOpen()} onOpenChange={setDrawerOpen} title="Drawer" subtitle="Panel lateral">
        <div class="p-6 text-sm text-muted-foreground">Panel deslizante independiente del Modal.</div>
      </Drawer>
    </div>
  )
}
