'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'
import { getResearchAreas } from '@/lib/data'

export function ResearchBento() {
  const { t, locale } = useTranslation()
  const areas = getResearchAreas()

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {t('home.research.title')}
        </h2>
        <Link
          href="/research/"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--accent-amber)' }}
        >
          {t('common.see_all')} →
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {areas.map(area => {
          const accentVar = area.accent === 'amber' ? 'var(--accent-amber)' : 'var(--accent)'
          return (
            <Link
              key={area.id}
              href={`/research/#${area.id}`}
              className="block p-6 rounded-lg border transition-transform hover:-translate-y-0.5"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="w-10 h-1 mb-4 rounded-full"
                style={{ background: accentVar }}
              />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {area.title[locale] ?? area.title.en}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {area.summary[locale] ?? area.summary.en}
              </p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
