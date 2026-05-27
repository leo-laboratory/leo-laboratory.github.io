'use client'

import { useTranslation } from '@/lib/i18n'
import { getAlumni } from '@/lib/data'
import { PageHeader } from '@/components/page/PageHeader'

export default function AlumniPage() {
  const { t, locale } = useTranslation()
  const alumni = getAlumni()

  return (
    <>
      <PageHeader title={t('alumni.title')} intro={t('alumni.intro')} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {alumni.length === 0 ? (
          <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
            {t('alumni.empty')}
          </p>
        ) : (
          <ul className="space-y-4">
            {alumni.map(a => (
              <li
                key={a.id}
                className="p-4 rounded border"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
              >
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {a.name}
                  {a.nameKo && locale === 'ko' && (
                    <span className="ml-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                      ({a.nameKo})
                    </span>
                  )}
                </h3>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  {a.period}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {a.currentPosition[locale] ?? a.currentPosition.en}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
