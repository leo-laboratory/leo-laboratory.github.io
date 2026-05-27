'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'
import { getNews, getPublications } from '@/lib/data'

function formatDate(iso: string, locale: 'en' | 'ko') {
  try {
    return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function NewsAndPubsTeaser() {
  const { t, locale } = useTranslation()
  const news = getNews(3)
  const pubs = getPublications(3)

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {t('home.news.title')}
            </h2>
            <Link href="/news/" className="text-sm hover:underline" style={{ color: 'var(--accent-amber)' }}>
              {t('common.see_all')} →
            </Link>
          </div>
          <ul className="space-y-4">
            {news.length === 0 && (
              <li className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {t('common.coming_soon')}
              </li>
            )}
            {news.map(item => (
              <li key={item.id} className="border-l-2 pl-4" style={{ borderColor: 'var(--accent)' }}>
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(item.date, locale)}
                </div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                  {item.title[locale] ?? item.title.en}
                </h3>
                <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {item.body[locale] ?? item.body.en}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {t('home.pubs.title')}
            </h2>
            <Link href="/publications/" className="text-sm hover:underline" style={{ color: 'var(--accent-amber)' }}>
              {t('common.see_all')} →
            </Link>
          </div>
          <ul className="space-y-4">
            {pubs.length === 0 && (
              <li className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {t('publications.empty')}
              </li>
            )}
            {pubs.map(pub => (
              <li key={pub.id} className="border-l-2 pl-4" style={{ borderColor: 'var(--accent-amber)' }}>
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  {pub.venue} · {pub.year}
                </div>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {pub.url ? (
                    <a href={pub.url} target="_blank" rel="noreferrer" className="hover:underline">
                      {pub.title}
                    </a>
                  ) : (
                    pub.title
                  )}
                </h3>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
