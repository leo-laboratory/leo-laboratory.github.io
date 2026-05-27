'use client'

import { useTranslation } from '@/lib/i18n'

interface PublicationsCounterProps {
  count: number
}

export function PublicationsCounter({ count }: PublicationsCounterProps) {
  const { t } = useTranslation()
  return (
    <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
      {t('pubs.counter', { count })}
    </p>
  )
}
