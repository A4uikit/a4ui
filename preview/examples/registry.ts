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
]
