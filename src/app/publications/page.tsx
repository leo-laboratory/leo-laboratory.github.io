'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { getPublicationsByYear, getTeam, getAlumni } from '@/lib/data'
import type { Tag } from '@/lib/data'
import { TAG_VOCAB } from '@/lib/data/types'
import { buildAuthorIndex } from '@/lib/authorMatch'
import type { LabAuthor } from '@/lib/authorMatch'
import { PageHeader } from '@/components/page/PageHeader'
import { TagFilterBar } from '@/components/publications/TagFilterBar'
import { PublicationsCounter } from '@/components/publications/PublicationsCounter'
import { PublicationItem } from '@/components/publications/PublicationItem'

const PI_ID = 'heetak-lee'

function isTag(s: string | null): s is Tag {
  return s !== null && (TAG_VOCAB as readonly string[]).includes(s)
}

function readTagFromHash(): Tag | null {
  if (typeof window === 'undefined') return null
  const m = window.location.hash.match(/tag=([a-z]+)/)
  return m && isTag(m[1]) ? m[1] : null
}

export default function PublicationsPage() {
  const { t } = useTranslation()
  const byYear = getPublicationsByYear()
  const allPubs = byYear.flatMap(g => g.items)

  const labAuthors: LabAuthor[] = useMemo(() => {
    const team = getTeam().map(m => ({
      id: m.id,
      name: m.name,
      nameKo: m.nameKo,
      kind: 'team' as const,
    }))
    const alumni = getAlumni().map(m => ({
      id: m.id,
      name: m.name,
      nameKo: m.nameKo,
      kind: 'alumni' as const,
    }))
    return [...team, ...alumni]
  }, [])

  const authorIndex = useMemo(() => buildAuthorIndex(labAuthors), [labAuthors])

  const [active, setActive] = useState<Tag | null>(null)

  useEffect(() => {
    setActive(readTagFromHash())
    const onHash = () => setActive(readTagFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const handleChange = (tag: Tag | null) => {
    setActive(tag)
    const nextHash = tag ? `#tag=${tag}` : ''
    if (typeof window !== 'undefined') {
      const url = window.location.pathname + window.location.search + nextHash
      window.history.replaceState(null, '', url)
    }
  }

  const filteredByYear = active
    ? byYear
        .map(g => ({ year: g.year, items: g.items.filter(p => p.tags?.includes(active)) }))
        .filter(g => g.items.length > 0)
    : byYear

  return (
    <>
      <PageHeader title={t('publications.title')} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <PublicationsCounter count={allPubs.length} />
        <TagFilterBar active={active} onChange={handleChange} />

        {filteredByYear.length === 0 ? (
          <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
            {t('publications.empty')}
          </p>
        ) : (
          <div className="space-y-12">
            {filteredByYear.map(({ year, items }) => (
              <section key={year}>
                <h2
                  className="font-serif font-medium text-2xl mb-2 tabular-nums"
                  style={{ color: 'var(--accent)' }}
                >
                  {year}
                </h2>
                <ul>
                  {items.map(pub => (
                    <PublicationItem
                      key={pub.id}
                      pub={pub}
                      index={authorIndex}
                      excludeIds={[PI_ID]}
                    />
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
