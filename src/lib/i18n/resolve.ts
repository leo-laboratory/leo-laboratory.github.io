import type { Locale } from './types'
import { LOCALES, DEFAULT_LOCALE } from './types'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

export interface ResolveLocaleInput {
  stored?: string | null
  navigatorLanguage?: string
  defaultLocale?: Locale
}

export function resolveLocale({
  stored,
  navigatorLanguage,
  defaultLocale = DEFAULT_LOCALE,
}: ResolveLocaleInput = {}): Locale {
  if (isLocale(stored)) return stored
  if (navigatorLanguage) {
    const prefix = navigatorLanguage.slice(0, 2).toLowerCase()
    if (isLocale(prefix)) return prefix
  }
  return defaultLocale
}
