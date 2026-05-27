'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Locale, TranslationMap } from './types'
import { DEFAULT_LOCALE } from './types'
import { lookup } from './lookup'
import { resolveLocale } from './resolve'
import translations from '@data/translations.json'

const STORAGE_KEY = 'leolab.locale'

interface LocaleContextValue {
  locale: Locale
  setLocale: (next: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

interface LocaleProviderProps {
  children: ReactNode
  initialLocale?: Locale
}

export function LocaleProvider({ children, initialLocale }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? DEFAULT_LOCALE)

  useEffect(() => {
    if (initialLocale) return
    const stored = typeof window === 'undefined' ? null : window.localStorage.getItem(STORAGE_KEY)
    const navLang = typeof navigator === 'undefined' ? undefined : navigator.language
    setLocaleState(resolveLocale({ stored, navigatorLanguage: navLang }))
  }, [initialLocale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next)
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = next
    }
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => lookup(translations as TranslationMap, key, locale, vars),
    }),
    [locale, setLocale]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useTranslation(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useTranslation must be used inside <LocaleProvider>')
  return ctx
}
