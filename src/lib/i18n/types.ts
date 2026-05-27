export type Locale = 'en' | 'ko'

export const LOCALES: readonly Locale[] = ['en', 'ko'] as const
export const DEFAULT_LOCALE: Locale = 'en'

export type Translatable = { en: string; ko?: string }
export type TranslationMap = Record<string, Translatable>
