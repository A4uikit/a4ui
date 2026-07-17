# CLAUDE.md — A4ui

Guía para Claude Code al trabajar en este repo. Léela completa antes de tocar nada.

## Qué es A4ui

**A4ui** es el **design system + librería de componentes SolidJS** llamado
"Spatial Glass" (glassmorphism + fondo estelar + tema claro/oscuro). El nombre son
las iniciales de las 4 personas de la familia Rivera. 🙂

Objetivo: que cualquier proyecto Solid instale `a4ui` y ya tenga TODO el diseño
bueno hecho — como Bootstrap/MUI, pero el look propio. Si el diseño se actualiza
aquí y se publica una versión nueva, los proyectos que lo consumen se actualizan
con `npm update` (control por semver).

### Las 3 capas (esto ES A4ui)

| Capa | Aporta | Tecnología |
|---|---|---|
| Comportamiento / a11y | foco, teclado, ARIA, portales | **Kobalte** (headless) |
| Movimiento | transiciones, springs, count-up, modo calmado | **solid-transition-group** + **solid-motionone** + helpers |
| Visual | tokens glass, colores, glass/glow | **Tailwind preset** + `styles.css` |

## Origen y "dogfooding"

A4ui se **extrae** del proyecto fuente, que es también su **primer consumidor**:
`../alfredorust/solid` (una app Axum+Solid multi-tenant; ver su `CLAUDE.md` y
`docs/solid-migration/`, `docs/generalization/`). Los componentes/tokens nacieron
ahí; la meta es sacarlos aquí y que esa app los importe desde `a4ui` en vez de
tenerlos inline.

Rutas fuente (relativas a este repo):
- Componentes UI: `../alfredorust/solid/src/components/ui/*`
- Componentes layout: `../alfredorust/solid/src/components/layout/*`
- Helpers: `../alfredorust/solid/src/lib/*`
- Estilos/tokens: `../alfredorust/solid/src/index.css` (tokens — YA extraídos),
  `.../src/styles/space-theme.css` (16KB, glass + starfield — PENDIENTE),
  `.../src/styles/app-theme.css` (5.8KB, `.sb-*` sidebar, `.cmdk-*`, `.tnum`, anim UI — PARCIAL)

## Decisiones tomadas (bloqueadas)

- **Distribución: paquete npm** (NO monorepo, NO copy-in tipo shadcn). Versionado,
  auto-update por semver.
- **Registry/scope: PENDIENTE de decidir.** Opciones: GitHub Packages bajo la org
  (`@sonora-precision/a4ui`) o cuenta personal, o npm público. GitHub Packages
  exige que el nombre sea con scope del owner y un `.npmrc` con token
  `packages:read/write`. Hoy el nombre es `a4ui` (provisional, sin scope).
- **Peer dep solid-js** (externo, una sola copia — dos copias rompen la
  reactividad). Todas las libs de diseño van como `dependencies` para que el
  consumidor no tenga que conocerlas.

## Estado actual — 🚀 pasos 1–4 hechos (2026-07-15)

Hecho y verificado (typecheck + build en verde):
- **Build** (`vite.config.ts`): library mode Solid + dts; externals con regex para
  subpaths de Kobalte (`/^@kobalte\/core(\/.*)?$/`, si no se empaqueta entera);
  plugin `emitStyles()` que concatena `tokens.css` + `space.css` → `dist/styles.css`.
- **Estilos** (`src/styles/`): `tokens.css` (vars dark/light + motion page/modal/
  toast/row/drawer + reduced-motion + tokens `--shadow`/`--radius-xl`), `space.css`
  (starfield). El **glass ya NO es CSS**: vive en el plugin de `preset.js`.
- **`preset.js`**: colores→CSS vars, fonts IBM Plex, radius xl, **+ plugin glass**
  (`addComponents`: `.card`/`.bg-glass`/`.tile-glass`/`.glow-edge` + calm + fallbacks
  `@supports`/reduced-transparency).
- **6 helpers** (`src/lib/`): `cn`, `theme`, `effects`, `motion`, `media`, `virtual`.
  Claves localStorage renombradas `alfredodev-*` → `a4ui-*`.
- **~40 componentes UI** (`src/ui/`): los 18 base + `VirtualList` (virtualización
  con `@tanstack/solid-virtual` + `remeasureAfterLayout`), `Stat` (KPI con
  `solid-motionone` fade-up + `createCountUp`), y ~21 wrappers de Kobalte: Switch,
  RadioGroup, Textarea, Tooltip, Popover, HoverCard, Alert, Avatar, Skeleton,
  Separator, Progress, Meter, Slider, NumberInput, Toggle, ToggleGroup,
  SegmentedControl, Breadcrumb, AlertDialog, ContextMenu, Combobox. Los mappers de
  dominio del Badge (flow/status/priority…) se quedaron en la app.
- **5 piezas de layout** (`src/layout/`): `SpaceBackground`, `ThemeToggle`,
  `EffectsToggle`, `NavGroup`, y `AppShell` **reescrito genérico** (flex + slots
  sidebar/topbar/banner, transición de página, Suspense+ErrorBoundary). Sidebar/
  Topbar/CompanySwitcher/DemoBanner/CommandPalette se quedan en la app.
- **Sitio de docs** (`preview/`, dev-only, NO se publica): estilo Bootstrap/Tailwind
  — Home (landing) + Docs con sidebar agrupado, ejemplo en vivo + código copiable
  por componente, deep-links por hash (`#/button`). Registro en `preview/registry.tsx`.
  Scripts: `npm run preview` (dev) / `preview:build`. Al añadir un componente,
  añade su `DocEntry` al registro.
- **Ojo (contrato del AppShell):** envuelve a `children` en un `<Transition>` que
  espera UN solo hijo (una página routeada). Pásale un único elemento raíz; overlays
  globales (Toaster/Modales) van como hermanos, fuera del AppShell.

Pendiente: paso 6 (publicar + migrar la app fuente). Falta decidir scope/registry.

## Doctrina CSS (bloqueada) — dónde va cada decisión

Todo lo que Tailwind puede expresar, va en Tailwind. Sólo lo que NO puede, va como
CSS a mano. Regla operativa:

| Tipo de decisión | Dónde vive |
|---|---|
| Layout, spacing, color, tipografía, estados hover/focus | **utilities Tailwind** en el JSX |
| Superficies/skins glass (`.card`, `.bg-glass`, `.glow-edge`, calm) | **plugin en `preset.js`** (`addComponents`, tree-shakeable) |
| Variables de tema (`:root { --background }`), `@keyframes` de motion | `src/styles/tokens.css` (las consume el preset vía `hsl(var(--x))`) |
| Starfield (gradientes, pseudo-elementos, estrellas por JS) | `src/styles/space.css` |

Corolario: NO crear archivos de CSS de componente. Si una superficie nueva necesita
`backdrop-filter`/máscaras/pseudo-elementos → va al plugin de `preset.js`. Si es
puro layout/spacing/color → utilities. `.tnum` fue reemplazado por
`font-mono tabular-nums` (ejemplo de "no inventar clase, usar utility").

## Plan de extracción (siguiente trabajo)

Orden sugerido:

1. **`npm install` + verificar que `npm run build` produce `dist/` con .d.ts.**
   Ajustar vite/tsconfig si hace falta. Sin componentes aún, debe construir el
   entry vacío + copiar/emitir `styles.css`. (Puede que haya que añadir un paso
   para copiar `src/styles/tokens.css` → `dist/styles.css`.)
2. **Helpers primero** (`src/lib/`): extraer los genéricos → `cn` (clsx+
   tailwind-merge), `theme` (light/dark), `motion` (count-up), `effects`
   (calm/⚡), `media` (useMediaQuery), `virtual` (remeasureAfterLayout).
   NO extraer: `nav.ts` (config de la app), `layout.ts` (estado sidebar/cmdk —
   semi-genérico, adaptar después).
3. **Componentes UI** (todos genéricos → extraer los 18): Accordion, Badge,
   Button, Card, Checkbox, DateField, Drawer, Dropdown, Dropzone, Input, Modal,
   PageHeader, Pagination, Select, Spinner, Table, Tabs, Toast. Re-exportar en
   `src/index.ts`. Cada uno arrastra sus estilos/anim (ya en tokens.css).
4. **Layout — separar diseño de app:**
   - Extraer (genéricos): `SpaceBackground`, `ThemeToggle`, `EffectsToggle`,
     `NavGroup`, y un `AppShell` genérico (que reciba sidebar/topbar por slots).
     Traer `space-theme.css` (glass + starfield).
   - **Dejar en la app** (acoplados a auth/tenant/nav/demo): `Sidebar`, `Topbar`,
     `CompanySwitcher`, `DemoBanner`.
5. **Catálogo/preview** (tipo Storybook): montar una página que muestre todos los
   componentes en claro/oscuro (portar el patrón de `/preview/design` del proyecto
   fuente). Sirve de QA visual y de vitrina.
6. **Publicar**: decidir scope/registry, `.npmrc`, `npm publish`. Luego migrar
   `../alfredorust/solid` a importar de `a4ui` (borrar los inline, apuntar imports)
   — ese es el dogfood real y el mejor test de que el paquete quedó bien.

## Reglas de diseño heredadas (doctrina — respetarlas)

- **Movimiento**: `solid-transition-group` como base; `solid-motionone` encima para
  lo rico (springs/gestos/secuencias). Transiciones cortas, transform/opacity,
  funcionales (orientar/confirmar, no decorar). Respetar `prefers-reduced-motion`
  (clase `force-motion` en `<html>` para opt-in vía toggle ⚡).
- **Renderizado (DOM vs Canvas vs WebGPU)**: DOM/Solid es lo correcto para casi
  todo (formularios, tablas de hasta miles de filas con `<For>` + reactividad
  granular). Canvas 2D solo para gráficos de cientos-a-pocos-miles de puntos que
  actualizan seguido. WebGPU solo para volumen masivo (decenas de miles+ por
  frame). **Nunca** Canvas/WebGPU para microinteracciones de UI. (Detalle completo
  en el CLAUDE.md del proyecto fuente.)
- **Accesibilidad**: los componentes deben mantener foco/teclado/ARIA de Kobalte y
  no romper contraste (los tokens `muted-foreground` ya están ajustados a WCAG AA).
- **Virtualización**: listas largas con `@tanstack/solid-virtual`; ojo con el bug
  del observer que mide 0×0 si el contenedor no existe al montar → helper
  `remeasureAfterLayout` (ver `virtual.ts` en la fuente).

## Comandos

```bash
npm install
npm run build       # build de librería (ESM + .d.ts)
npm run dev         # watch
npm run typecheck
npm run lint
```

## Cómo consume un proyecto (documentar/verificar al publicar)

```ts
// tailwind.config.ts
import a4ui from '@a4ui/core/preset'
export default { presets: [a4ui], content: ['./src/**/*.{ts,tsx}', './node_modules/@a4ui/core/dist/**/*.js'] }
```
```tsx
import '@a4ui/core/styles.css'            // una vez, en el entry
import { Button, Card, Modal } from '@a4ui/core'
```

## Relacionado

- Proyecto fuente / primer consumidor: `../alfredorust` (ver su `CLAUDE.md`).
- Idea hermana: un repo `boilerplate` = catálogo de capacidades reutilizables del
  stack (specs de "qué piezas tengo y cuándo usarlas"). A4ui es la pieza de diseño
  de ese catálogo.
