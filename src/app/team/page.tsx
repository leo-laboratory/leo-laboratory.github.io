'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/lib/i18n'
import { getTeamByRole } from '@/lib/data'
import { PageHeader } from '@/components/page/PageHeader'

export default function TeamPage() {
  const { t, locale } = useTranslation()
  const groups = getTeamByRole()

  return (
    <>
      <PageHeader title={t('team.title')} intro={t('team.intro')} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12">
        {groups.map(({ role, members }) => (
          <section key={role}>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--accent)' }}>
              {t(`team.role.${role}`)}
            </h2>
            {members.length === 0 ? (
              <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                {t('team.empty.role')}
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {members.map(member => (
                  <article
                    key={member.id}
                    className="p-6 rounded-lg border"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    {member.photo ? (
                      <div
                        className="w-20 h-20 rounded-full mb-4 overflow-hidden border-2"
                        style={{ borderColor: 'var(--accent)' }}
                      >
                        <Image
                          src={member.photo}
                          alt={member.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-20 h-20 rounded-full mb-4 flex items-center justify-center text-2xl font-bold border-2"
                        style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--accent-subtle)' }}
                      >
                        {member.name.slice(0, 1)}
                      </div>
                    )}
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {member.name}
                      {member.nameKo && locale === 'ko' && (
                        <span className="ml-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                          ({member.nameKo})
                        </span>
                      )}
                    </h3>
                    <p className="text-sm mb-3" style={{ color: 'var(--accent)' }}>
                      {member.title[locale] ?? member.title.en}
                    </p>
                    <ul className="text-xs space-y-1 mb-3" style={{ color: 'var(--text-muted)' }}>
                      {member.affiliations.map((aff, i) => (
                        <li key={i}>{aff[locale] ?? aff.en}</li>
                      ))}
                    </ul>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {member.bio[locale] ?? member.bio.en}
                    </p>
                    <div className="mt-4 flex gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="hover:underline">
                          {t('contact.email')}
                        </a>
                      )}
                      {member.orcid && (
                        <a href={`https://orcid.org/${member.orcid}`} target="_blank" rel="noreferrer" className="hover:underline">
                          ORCID
                        </a>
                      )}
                      {member.scholar && (
                        <a href={member.scholar} target="_blank" rel="noreferrer" className="hover:underline">
                          Scholar
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ))}

        <div className="pt-4">
          <Link
            href="/alumni/"
            className="inline-block text-sm font-medium hover:underline"
            style={{ color: 'var(--accent-amber)' }}
          >
            {t('team.role.alumni_link')}
          </Link>
        </div>
      </div>
    </>
  )
}
