import type { Theme } from './types'
import { THEMES, DEFAULT_THEME } from './types'

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
}

export interface ResolveThemeInput {
  stored?: string | null
  systemPrefersDark?: boolean
  defaultTheme?: Theme
}

export function resolveTheme({
  stored,
  systemPrefersDark,
  defaultTheme = DEFAULT_THEME,
}: ResolveThemeInput = {}): Theme {
  if (isTheme(stored)) return stored
  if (systemPrefersDark === true) return 'dark'
  if (systemPrefersDark === false) return 'light'
  return defaultTheme
}
