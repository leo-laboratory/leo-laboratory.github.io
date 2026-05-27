'use client'

import { useTranslation } from '@/lib/i18n'
import type { Publication } from '@/lib/data'
import type { AuthorIndex } from '@/lib/authorMatch'
import { AuthorList } from './AuthorList'
import { CoAuthorChips } from './CoAuthorChips'

interface PublicationItemProps {
  pub: Publication
  index: AuthorIndex
  excludeIds?: string[]
}

function isStale(asOf: string | undefined): boolean {
  if (!asOf) return false
  const fetched = new Date(asOf).getTime()
  if (Number.isNaN(fetched)) return false
  const ageDays = (Date.now() - fetched) / (1000 * 60 * 60 * 24)
  return ageDays > 30
}

export function PublicationItem({ pub, index, excludeIds }: PublicationItemProps) {
  const { t } = useTranslation()
  const stale = isStale(pub.citationsAsOf)

  return (
    <li className="py-5" style={{ borderBottom: '1px solid var(--border)' }}>
      <h3
        className="font-serif font-medium text-lg leading-snug mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {pub.url ? (
          <a href={pub.url} target="_blank" rel="noreferrer" className="hover:underline">
            {pub.title}
          </a>
        ) : (
          pub.title
        )}
      </h3>

      <AuthorList authors={pub.authors} index={index} />

      <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <em style={{ fontStyle: 'italic' }}>{pub.venue}</em>
        {' · '}
        <span>{pub.year}</span>
        {typeof pub.citations === 'number' && (
          <>
            {' · '}
            <span style={{ opacity: stale ? 0.6 : 1 }}>
              {t('pubs.cited', { n: pub.citations })}
            </span>
          </>
        )}
        {pub.doi && (
          <>
            {' · '}
            <a
              href={`https://doi.org/${pub.doi}`}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              DOI →
            </a>
          </>
        )}
      </p>

      <CoAuthorChips authors={pub.authors} index={index} excludeIds={excludeIds} />
    </li>
  )
}
