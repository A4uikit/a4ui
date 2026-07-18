// Theme picker for the docs topbar. Lists the built-in A4ui themes and swaps the
// live palette (persisted). Uses chooseBaseTheme so switching preset also clears
// any custom token edits from the settings drawer. The whole site recolors instantly.
import { ChevronDown } from 'lucide-solid'
import { type JSX } from 'solid-js'

import { activeTheme, Dropdown, themes } from '../src'
import { chooseBaseTheme } from './themeStore'

export function ThemeSelect(): JSX.Element {
  return (
    <Dropdown
      label="Choose theme"
      class="rounded-md border border-border bg-card/50 px-2.5 py-1.5 text-sm text-foreground transition hover:bg-card"
      items={themes.map((t) => ({
        label: `${t.icon}  ${t.label}${t.name === activeTheme().name ? '  ✓' : ''}`,
        onSelect: () => chooseBaseTheme(t.name),
      }))}
    >
      <span class="flex items-center gap-1.5">
        <span aria-hidden="true">{activeTheme().icon}</span>
        <span class="hidden sm:inline">{activeTheme().label}</span>
        <ChevronDown class="h-3.5 w-3.5 opacity-60" />
      </span>
    </Dropdown>
  )
}
