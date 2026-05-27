'use client'

import { useTranslation } from '@/lib/i18n'

export function LanguageToggle() {
  const { locale, setLocale } = useTranslation()
  const next = locale === 'en' ? 'ko' : 'en'
  const label = next === 'en' ? 'Switch to English' : '한국어로 전환'
  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={label}
      className="px-2 py-1 text-xs font-semibold tracking-wider uppercase rounded border transition-colors"
      style={{
        borderColor: 'var(--border)',
        color: 'var(--text-secondary)',
      }}
    >
      {locale === 'en' ? 'EN · 한' : '한 · EN'}
    </button>
  )
}
