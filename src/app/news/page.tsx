'use client'

import { useTranslation } from '@/lib/i18n'
import { getNews } from '@/lib/data'
import { PageHeader } from '@/components/page/PageHeader'

function formatDate(iso: string, locale: 'en' | 'ko') {
  try {
    return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function NewsPage() {
  const { t, locale } = useTranslation()
  const items = getNews()

  return (
    <>
      <PageHeader title={t('news.title')} intro={t('news.intro')} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <ul className="space-y-8">
          {items.map(item => (
            <li
              key={item.id}
              className="border-l-2 pl-6 py-1"
              style={{ borderColor: 'var(--accent)' }}
            >
              <div className="text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {formatDate(item.date, locale)}
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {item.title[locale] ?? item.title.en}
              </h2>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.body[locale] ?? item.body.en}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
