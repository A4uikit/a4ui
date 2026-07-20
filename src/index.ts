// A4ui — public entry point.
//
// Components are extracted incrementally from the source project
// (sonora precision/alfredorust/solid/src/components). As each lands under
// src/ui/ or src/layout/, re-export it here. See CLAUDE.md → "Extraction plan".
//
// Consumers import the styles once (tokens + motion) and the components:
//   import '@a4ui/core/styles.css'
//   import { Button, Card, Modal } from '@a4ui/core'

export const A4UI_VERSION = '0.24.2'

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
  animateIn,
  revealOnScroll,
  // Motion (motion.dev) imperative API, re-exported so the whole app shares one
  // engine (used by Stat's entrance / count-up; reach for these for scroll-linked
  // reveals, staggered lists, springs, etc.).
  animate,
  inView,
  scroll,
  stagger,
  spring,
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
export { TimeField, type TimeFieldProps } from './ui/TimeField'
export { DateTimeField, type DateTimeFieldProps } from './ui/DateTimeField'
export { DateRangePicker, type DateRange, type DateRangePickerProps } from './ui/DateRangePicker'
export { FormField, FormLabel, FormControl, FormDescription, FormError, type FormFieldProps } from './ui/Form'
export { FileUpload, type UploadFile, type FileUploadProps } from './ui/FileUpload'
export { MultiSelect, type MultiSelectOption, type MultiSelectProps } from './ui/MultiSelect'
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
export { AnnouncementBar, type AnnouncementBarProps, type AnnouncementTone } from './ui/AnnouncementBar'
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
export { PricingTable, type PricingTier, type PricingPeriod } from './ui/PricingTable'
export { BeforeAfter, type BeforeAfterProps } from './ui/BeforeAfter'
export {
  Configurator,
  type ConfiguratorProps,
  type ConfiguratorGroup,
  type ConfiguratorState,
  type ConfiguratorOption,
  type ConfiguratorItem,
} from './ui/Configurator'
export { Empty, type EmptyProps } from './ui/Empty'
export { Calendar, type CalendarProps } from './ui/Calendar'
export { Tree, type TreeNode, type TreeProps } from './ui/Tree'
export { Kbd } from './ui/Kbd'
export { AvatarGroup, type AvatarGroupProps } from './ui/AvatarGroup'
export { Descriptions, type DescriptionItem, type DescriptionsProps } from './ui/Descriptions'
export { SpecSheet, type SpecSheetProps, type SpecGroup, type SpecRow } from './ui/SpecSheet'
export { RatingsSummary, type RatingsSummaryProps, type RatingSource } from './ui/RatingsSummary'
export { Result, type ResultStatus, type ResultProps } from './ui/Result'
export { Splitter, type SplitterProps } from './ui/Splitter'
export { Command, type CommandItem, type CommandProps } from './ui/Command'
export { TagInput, type TagInputProps } from './ui/TagInput'
export { Collapse } from './ui/Collapse'
export { RingProgress, type RingProgressProps } from './ui/RingProgress'
export { BackToTop, type BackToTopProps } from './ui/BackToTop'
export {
  FloatingActionButton,
  type FloatingActionButtonProps,
  type FloatingActionButtonPosition,
} from './ui/FloatingActionButton'
export { Anchor, type AnchorItem, type AnchorProps } from './ui/Anchor'
export { Highlight, type HighlightProps } from './ui/Highlight'
export { List, type ListItem } from './ui/List'
export { Countdown, type CountdownProps } from './ui/Countdown'
export { Affix } from './ui/Affix'
export { Transfer, type TransferItem, type TransferProps } from './ui/Transfer'
export { Image, type ImageProps } from './ui/Image'
export { SpeedDial, type SpeedDialAction, type SpeedDialProps } from './ui/SpeedDial'
export { BottomNavigation, type BottomNavItem, type BottomNavigationProps } from './ui/BottomNavigation'
export { Marquee } from './ui/Marquee'
export { LogoWall, type LogoWallProps, type LogoItem } from './ui/LogoWall'
export { DataGrid, type DataGridColumn, type DataGridProps } from './ui/DataGrid'
export { TreeSelect, type TreeSelectProps } from './ui/TreeSelect'
export { Cascader, type CascaderOption, type CascaderProps } from './ui/Cascader'
export { Mentions, type MentionOption, type MentionsProps } from './ui/Mentions'
export { Tour, type TourStep, type TourProps } from './ui/Tour'
export {
  NotificationCenter,
  type NotificationItem,
  type NotificationCenterProps,
} from './ui/NotificationCenter'
export { ColorPicker, type ColorPickerProps } from './ui/ColorPicker'
export { Comment, type CommentData, type CommentProps } from './ui/Comment'
export { CalendarHeatmap, type HeatmapValue, type CalendarHeatmapProps } from './ui/CalendarHeatmap'
export { Portal, type PortalProps } from './ui/Portal'
export { Sortable, type SortableProps } from './ui/Sortable'
export { Clock, type ClockProps } from './ui/Clock'

// Motion components (src/ui) — animation primitives built on the `motion` engine
// (adapted from motion.dev examples). All tree-shakeable and reduced-motion aware;
// `motion` is external, so importing one of these is the only thing that pulls it.
export { ScrambleText, type ScrambleTextProps } from './ui/ScrambleText'
export { TextReveal, type TextRevealProps } from './ui/TextReveal'
export { HoldToConfirm, type HoldToConfirmProps } from './ui/HoldToConfirm'
export { LoadingDots, type LoadingDotsProps } from './ui/LoadingDots'
export { Curtain, type CurtainProps, type CurtainVariant } from './ui/Curtain'
export { Parallax, type ParallaxProps } from './ui/Parallax'
export { FillText, type FillTextProps } from './ui/FillText'
export {
  NotificationStack,
  type NotificationStackProps,
  type StackNotification,
} from './ui/NotificationStack'
export { MultiStateBadge, type MultiStateBadgeProps, type BadgeState } from './ui/MultiStateBadge'
export { NowPlaying, type NowPlayingProps } from './ui/NowPlaying'
export { Expandable, type ExpandableProps } from './ui/Expandable'
export { Typewriter, type TypewriterProps } from './ui/Typewriter'
export { Ripple, spawnRipple, type RippleProps } from './ui/Ripple'
export { Magnetic, type MagneticProps } from './ui/Magnetic'
export { TiltCard, attachTilt, type TiltCardProps } from './ui/TiltCard'
export { Spotlight, attachSpotlight, type SpotlightProps } from './ui/Spotlight'
export { ScrollProgress, type ScrollProgressProps } from './ui/ScrollProgress'
export { GradientText, type GradientTextProps } from './ui/GradientText'
export { flyToCart, type FlyToCartOptions } from './lib/flyToCart'

// Layout (src/layout) — generic shell + backdrop + toggles. App-coupled pieces
// (Sidebar, Topbar, CompanySwitcher, DemoBanner, CommandPalette) stay in the app.
export { AppShell } from './layout/AppShell'
export { SpaceBackground } from './layout/SpaceBackground'
export { Aurora, type AuroraProps } from './layout/Aurora'
export { ThemedScenery, type ThemedSceneryProps } from './layout/ThemedScenery'
export { SnowScenery } from './layout/SnowScenery'
export { ChristmasBackground } from './layout/ChristmasBackground'
export { ThemeToggle } from './layout/ThemeToggle'
export { EffectsToggle } from './layout/EffectsToggle'
export { NavGroup } from './layout/NavGroup'
export { Section, type SectionWidth, type SectionPad } from './layout/Section'
export { ActionBar, type ActionBarProps, type ActionBarPosition } from './layout/ActionBar'

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
