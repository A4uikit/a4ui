// A4ui — public entry point.
//
// Components are extracted incrementally from the source project
// (sonora precision/alfredorust/solid/src/components). As each lands under
// src/ui/ or src/layout/, re-export it here. See CLAUDE.md → "Extraction plan".
//
// Consumers import the styles once (tokens + motion) and the components:
//   import '@a4ui/core/styles.css'
//   import { Button, Card, Modal } from '@a4ui/core'

export const A4UI_VERSION = '0.4.3'

// Helpers (src/lib) — generic, framework-level utilities.
export { cn } from './lib/cn'
export { useTheme, toggleTheme, setTheme, storedTheme, applyTheme, toggled, type Theme } from './lib/theme'
export { useEffects, isCalm, setEffects } from './lib/effects'
export {
  prefersReducedMotion,
  motionReduced,
  useMotionForced,
  setMotionForced,
  createCountUp,
} from './lib/motion'
export { useMediaQuery } from './lib/media'
export { remeasureAfterLayout } from './lib/virtual'

// UI components (src/ui) — all 18 extracted. See CLAUDE.md.
export { Accordion, type AccordionItem } from './ui/Accordion'
export { Badge, type BadgeTone } from './ui/Badge'
export { Button, type ButtonVariant } from './ui/Button'
export { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
export { Checkbox } from './ui/Checkbox'
export { DateField } from './ui/DateField'
export { Drawer } from './ui/Drawer'
export { Dropdown, type DropdownItem } from './ui/Dropdown'
export { Dropzone } from './ui/Dropzone'
export { Input } from './ui/Input'
export { Modal } from './ui/Modal'
export { PageHeader } from './ui/PageHeader'
export { Pagination } from './ui/Pagination'
export { Select } from './ui/Select'
export { Spinner } from './ui/Spinner'
export { Stat, type StatTone } from './ui/Stat'
export { Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell } from './ui/Table'
export { VirtualList } from './ui/VirtualList'
export { Tabs, type TabItem } from './ui/Tabs'
export { toast, Toaster, type ToastTone } from './ui/Toast'
export { Switch } from './ui/Switch'
export { RadioGroup, type RadioOption } from './ui/RadioGroup'
export { Textarea } from './ui/Textarea'
export { Tooltip } from './ui/Tooltip'
export { Popover } from './ui/Popover'
export { HoverCard } from './ui/HoverCard'
export { Alert, type AlertTone } from './ui/Alert'
export { Avatar } from './ui/Avatar'
export { Skeleton } from './ui/Skeleton'
export { Separator } from './ui/Separator'
export { Progress } from './ui/Progress'
export { Meter } from './ui/Meter'
export { Slider } from './ui/Slider'
export { NumberInput } from './ui/NumberInput'
export { Toggle } from './ui/Toggle'
export { ToggleGroup, type ToggleGroupOption } from './ui/ToggleGroup'
export { SegmentedControl, type SegmentedOption } from './ui/SegmentedControl'
export { Breadcrumb, type BreadcrumbItem } from './ui/Breadcrumb'
export { AlertDialog } from './ui/AlertDialog'
export { ContextMenu, type ContextMenuItem } from './ui/ContextMenu'
export { Combobox } from './ui/Combobox'
export { Carousel, type CarouselProps } from './ui/Carousel'
export { Stepper, type StepItem, type StepperProps } from './ui/Stepper'
export { Timeline, type TimelineItem, type TimelineTone, type TimelineProps } from './ui/Timeline'
export { Rating, type RatingProps } from './ui/Rating'
export { Empty, type EmptyProps } from './ui/Empty'
export { Calendar, type CalendarProps } from './ui/Calendar'
export { Tree, type TreeNode, type TreeProps } from './ui/Tree'
export { Kbd } from './ui/Kbd'
export { AvatarGroup, type AvatarGroupProps } from './ui/AvatarGroup'
export { Descriptions, type DescriptionItem, type DescriptionsProps } from './ui/Descriptions'
export { Result, type ResultStatus, type ResultProps } from './ui/Result'
export { Splitter, type SplitterProps } from './ui/Splitter'
export { Command, type CommandItem, type CommandProps } from './ui/Command'

// Layout (src/layout) — generic shell + backdrop + toggles. App-coupled pieces
// (Sidebar, Topbar, CompanySwitcher, DemoBanner, CommandPalette) stay in the app.
export { AppShell } from './layout/AppShell'
export { SpaceBackground } from './layout/SpaceBackground'
export { ThemedScenery, type ThemedSceneryProps } from './layout/ThemedScenery'
export { SnowScenery } from './layout/SnowScenery'
export { ChristmasBackground } from './layout/ChristmasBackground'
export { ThemeToggle } from './layout/ThemeToggle'
export { EffectsToggle } from './layout/EffectsToggle'
export { NavGroup } from './layout/NavGroup'

// Themes (src/themes) — swappable color palettes (Space is the default). Pick one
// with `selectTheme('dino')`, restore the saved one with `initTheme()`, or build
// your own from a ThemeDefinition. Distinct from the light/dark `setTheme` above.
export {
  themes,
  space,
  dino,
  doctor,
  scientist,
  soccer,
  snow,
  christmas,
  activeTheme,
  selectTheme,
  applyThemeDefinition,
  initTheme,
  themeToCss,
  themeToJson,
  TOKEN_ORDER,
  type ThemeDefinition,
  type Palette,
} from './themes'
