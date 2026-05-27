'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'
import { getLabMeta } from '@/lib/data'

export function Hero() {
  const { t, locale } = useTranslation()
  const lab = getLabMeta()
  const name = lab.name[locale] ?? lab.name.en
  const fullName = lab.fullName[locale] ?? lab.fullName.en

  return (
    <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      <p
        className="text-xs uppercase tracking-[0.22em] mb-10 font-semibold"
        style={{ color: 'var(--text-muted)' }}
      >
        {name} · {fullName} · {t('hero.founded', { year: lab.founded })}
      </p>

      <h1
        className="font-serif font-medium leading-[1.02] tracking-tight mb-8"
        style={{
          color: 'var(--text-primary)',
          fontSize: 'clamp(2.75rem, 6vw, 4.5rem)',
        }}
      >
        Omics for <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>understanding</em> evolution.
      </h1>

      <p
        className="max-w-2xl text-base leading-relaxed mb-10"
        style={{ color: 'var(--text-secondary)' }}
      >
        {t('hero.subline')}
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/research/"
          className="px-5 py-2.5 rounded-sm text-sm font-semibold transition-colors"
          style={{
            background: 'var(--accent)',
            color: '#fbf7ec',
          }}
        >
          {t('hero.cta.research')}
        </Link>
        <Link
          href="/join/"
          className="px-5 py-2.5 rounded-sm text-sm font-semibold border transition-colors"
          style={{
            borderColor: 'var(--accent)',
            color: 'var(--accent)',
          }}
        >
          {t('hero.cta.join')}
        </Link>
      </div>
    </section>
  )
}
