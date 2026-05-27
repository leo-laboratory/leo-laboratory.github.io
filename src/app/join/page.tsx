'use client'

import { useTranslation } from '@/lib/i18n'
import { getLabMeta } from '@/lib/data'
import { PageHeader } from '@/components/page/PageHeader'

export default function JoinPage() {
  const { t } = useTranslation()
  const lab = getLabMeta()
  const piEmail = lab.pi.emails[0]

  return (
    <>
      <PageHeader title={t('join.title')} intro={t('join.intro')} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div
          className="p-8 rounded-sm border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            {t('join.intro')}
          </p>
          <a
            href={`mailto:${piEmail}`}
            className="inline-block px-5 py-2.5 rounded-sm text-sm font-semibold transition-colors"
            style={{ background: 'var(--accent)', color: '#fbf7ec' }}
          >
            {t('join.contact_pi')} →
          </a>
          <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            {piEmail}
          </p>
        </div>
      </div>
    </>
  )
}
