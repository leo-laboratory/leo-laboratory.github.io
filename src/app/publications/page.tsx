'use client'

import { useTranslation } from '@/lib/i18n'
import { getPublicationsByYear } from '@/lib/data'
import { PageHeader } from '@/components/page/PageHeader'

export default function PublicationsPage() {
  const { t } = useTranslation()
  const byYear = getPublicationsByYear()

  return (
    <>
      <PageHeader title={t('publications.title')} intro={t('publications.intro')} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {byYear.length === 0 ? (
          <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
            {t('publications.empty')}
          </p>
        ) : (
          <div className="space-y-10">
            {byYear.map(({ year, items }) => (
              <section key={year}>
                <h2
                  className="text-3xl font-serif font-medium mb-4 tabular-nums"
                  style={{ color: 'var(--accent)' }}
                >
                  {year}
                </h2>
                <ul className="space-y-4">
                  {items.map(pub => (
                    <li
                      key={pub.id}
                      className="p-4 rounded-sm border"
                      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                    >
                      <h3 className="font-serif font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        {pub.url ? (
                          <a href={pub.url} target="_blank" rel="noreferrer" className="hover:underline">
                            {pub.title}
                          </a>
                        ) : (
                          pub.title
                        )}
                      </h3>
                      <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                        {pub.authors.join(', ')}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {pub.venue}
                        {pub.doi && (
                          <>
                            {' · '}
                            <a
                              href={`https://doi.org/${pub.doi}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline"
                            >
                              doi:{pub.doi}
                            </a>
                          </>
                        )}
                        {pub.preprint && (
                          <>
                            {' · '}
                            <a href={pub.preprint} target="_blank" rel="noreferrer" className="hover:underline">
                              preprint
                            </a>
                          </>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
