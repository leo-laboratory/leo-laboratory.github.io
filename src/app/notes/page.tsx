'use client'

import { useTranslation } from '@/lib/i18n'
import { PageHeader } from '@/components/page/PageHeader'

export default function NotesPage() {
  const { t } = useTranslation()

  return (
    <>
      <PageHeader title={t('notes.title')} intro={t('notes.intro')} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
          {t('common.coming_soon')}
        </p>
      </div>
    </>
  )
}
