'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'

export function CTAJoin() {
  const { t } = useTranslation()
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div
        className="rounded-sm p-10 lg:p-14 text-center border"
        style={{
          background: 'linear-gradient(135deg, var(--accent-subtle), transparent)',
          borderColor: 'var(--border)',
        }}
      >
        <h2 className="text-3xl font-serif font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
          {t('home.cta.title')}
        </h2>
        <p className="max-w-2xl mx-auto mb-6" style={{ color: 'var(--text-secondary)' }}>
          {t('home.cta.body')}
        </p>
        <Link
          href="/join/"
          className="inline-block px-6 py-3 rounded-sm text-sm font-semibold transition-colors"
          style={{
            background: 'var(--accent)',
            color: '#fbf7ec',
          }}
        >
          {t('hero.cta.join')} →
        </Link>
      </div>
    </section>
  )
}
