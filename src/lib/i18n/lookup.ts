import type { Locale, TranslationMap } from './types'
import { DEFAULT_LOCALE } from './types'

export function lookup(
  map: TranslationMap,
  key: string,
  locale: Locale,
  vars?: Record<string, string | number>
): string {
  const entry = map[key]
  if (!entry) return key
  const raw = entry[locale] ?? entry[DEFAULT_LOCALE] ?? key
  return vars ? interpolate(raw, vars) : raw
}

function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  )
}
