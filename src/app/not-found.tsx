'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <h1 className="text-7xl font-serif font-medium mb-4" style={{ color: 'var(--accent)' }}>
        404
      </h1>
      <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
        Page not found
      </p>
      <Link
        href="/"
        className="inline-block px-5 py-2.5 rounded-sm text-sm font-semibold"
        style={{ background: 'var(--accent)', color: '#fbf7ec' }}
      >
        {t('common.back_home')}
      </Link>
    </div>
  )
}
