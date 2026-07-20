// Example/template pages — full-page compositions built with A4ui. They use only
// semantic tokens, so the SAME page reskins under every theme. Lazy-loaded so
// they don't weigh on the initial docs bundle. Add one entry per file here.
import { lazy, type Component } from 'solid-js'

export interface ExampleEntry {
  id: string
  title: string
  blurb: string
  component: Component
}

export const EXAMPLES: ExampleEntry[] = [
  {
    id: 'login',
    title: 'Login',
    blurb: 'Auth screen with email/password, remember-me, and social sign-in.',
    component: lazy(() => import('./Login')),
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    blurb: 'Admin overview with metric cards, a recent-orders table, and goals.',
    component: lazy(() => import('./Dashboard')),
  },
  {
    id: 'pricing',
    title: 'Pricing',
    blurb: 'Three-tier pricing with a monthly/annual billing toggle.',
    component: lazy(() => import('./Pricing')),
  },
  {
    id: 'settings',
    title: 'Settings',
    blurb: 'Tabbed settings — profile, account, and notification forms.',
    component: lazy(() => import('./Settings')),
  },
  {
    id: 'profile',
    title: 'Profile',
    blurb: 'User profile with avatar, stats, and tabbed content.',
    component: lazy(() => import('./Profile')),
  },
  {
    id: 'product',
    title: 'Product',
    blurb: 'Commerce detail — image carousel, rating, specs, and reviews.',
    component: lazy(() => import('./Product')),
  },
  {
    id: 'analytics',
    title: 'Analytics',
    blurb: 'Metrics with progress rings, a timeline, lists, and a speed dial.',
    component: lazy(() => import('./Analytics')),
  },
  {
    id: 'onboarding',
    title: 'Onboarding',
    blurb: 'A multi-step wizard (stepper) that ends on a success result.',
    component: lazy(() => import('./Onboarding')),
  },
  {
    id: 'files',
    title: 'File manager',
    blurb: 'Resizable panes with a folder tree, file list, and ⌘K command palette.',
    component: lazy(() => import('./Files')),
  },
  {
    id: 'schedule',
    title: 'Schedule',
    blurb: 'A month calendar, a countdown, and the selected day’s agenda.',
    component: lazy(() => import('./Schedule')),
  },
  {
    id: 'landing',
    title: 'Landing',
    blurb: 'Marketing page — hero, marquee, features, FAQ, and back-to-top.',
    component: lazy(() => import('./Landing')),
  },
  {
    id: 'members',
    title: 'Members',
    blurb: 'Team admin — member list, role tags, a transfer picker, and a sticky TOC.',
    component: lazy(() => import('./Members')),
  },
  {
    id: 'storefront',
    title: 'Storefront',
    blurb: 'E-commerce catalog — faceted filters and a product grid (dogfoods @a4ui/core/commerce).',
    component: lazy(() => import('./Storefront')),
  },
  {
    id: 'boutique',
    title: 'Boutique',
    blurb: 'Faceted marketplace with three switchable product-card styles and a cart drawer.',
    component: lazy(() => import('./Boutique')),
  },
  {
    id: 'showpiece',
    title: 'Showpiece',
    blurb: 'Product detail — gallery lightbox, PriceBlock, ConditionScale, SpecSheet, and reviews.',
    component: lazy(() => import('./Showpiece')),
  },
  {
    id: 'assistant',
    title: 'Assistant',
    blurb:
      'Conversational AI surface — ChatThread, streaming replies, citations, prompt composer, and an artifact panel.',
    component: lazy(() => import('./Assistant')),
  },
  {
    id: 'checkout',
    title: 'Checkout',
    blurb: 'Cart lines with quantity steppers, a shipping form, and an order summary.',
    component: lazy(() => import('./Checkout')),
  },
  {
    id: 'admin',
    title: 'Admin',
    blurb: 'Admin dashboard with charts, metric sparklines, a filter, and a users table.',
    component: lazy(() => import('./Admin')),
  },
]
