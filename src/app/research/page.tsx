'use client'

import { useTranslation } from '@/lib/i18n'
import { getResearchAreas } from '@/lib/data'
import { PageHeader } from '@/components/page/PageHeader'

export default function ResearchPage() {
  const { t, locale } = useTranslation()
  const areas = getResearchAreas()

  return (
    <>
      <PageHeader title={t('research.title')} intro={t('research.intro')} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-10">
        {areas.map((area, i) => {
          const accentVar = area.accent === 'amber' ? 'var(--accent-amber)' : 'var(--accent)'
          return (
            <section
              key={area.id}
              id={area.id}
              className="scroll-mt-24 grid md:grid-cols-[80px_1fr] gap-6 items-start"
            >
              <div
                className="text-5xl font-bold tabular-nums"
                style={{ color: accentVar, opacity: 0.5 }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                  {area.title[locale] ?? area.title.en}
                </h2>
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {area.summary[locale] ?? area.summary.en}
                </p>
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}
