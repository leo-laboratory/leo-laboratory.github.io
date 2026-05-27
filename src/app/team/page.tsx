'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/lib/i18n'
import { getTeamByRole } from '@/lib/data'
import type { TeamMember } from '@/lib/data'
import { PageHeader } from '@/components/page/PageHeader'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function MemberPhoto({ member }: { member: TeamMember }) {
  if (member.hasPhoto && member.photo) {
    return (
      <div
        className="w-24 h-24 rounded-full mb-5 overflow-hidden"
        style={{ border: '1px solid var(--border)' }}
      >
        <Image
          src={member.photo}
          alt={member.name}
          width={96}
          height={96}
          className="object-cover w-full h-full"
        />
      </div>
    )
  }
  return (
    <div
      className="w-24 h-24 rounded-full mb-5 flex flex-col items-center justify-center font-serif font-medium"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        color: 'var(--accent)',
      }}
    >
      <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{initials(member.name)}</span>
      <span
        style={{
          width: '70%',
          height: '1px',
          background: 'var(--accent)',
          opacity: 0.5,
          marginTop: '0.35rem',
        }}
      />
    </div>
  )
}

export default function TeamPage() {
  const { t, locale } = useTranslation()
  const groups = getTeamByRole()

  return (
    <>
      <PageHeader title={t('team.title')} intro={t('team.intro')} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-16">
        {groups.map(({ role, members }) => (
          <section key={role}>
            <h2
              className="font-serif font-medium text-2xl mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              {t(`team.role.${role}`)}
            </h2>
            {members.length === 0 ? (
              <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                {t('team.empty.role')}
              </p>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {members.map(member => (
                  <article
                    key={member.id}
                    id={member.id}
                    className="scroll-mt-24"
                  >
                    <MemberPhoto member={member} />
                    <h3
                      className="font-serif font-medium text-xl mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {member.name}
                      {member.nameKo && (
                        <span
                          className="ml-2 text-sm font-sans font-normal"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {member.nameKo}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm mb-2" style={{ color: 'var(--accent)' }}>
                      {member.title[locale] ?? member.title.en}
                    </p>
                    <ul className="text-xs space-y-0.5 mb-3" style={{ color: 'var(--text-muted)' }}>
                      {member.affiliations.map((aff, i) => (
                        <li key={i}>{aff[locale] ?? aff.en}</li>
                      ))}
                    </ul>
                    {member.joined && (
                      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                        {t('team.joined', { date: member.joined })}
                      </p>
                    )}
                    {(member.bio[locale] || member.bio.en) && (
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {member.bio[locale] ?? member.bio.en}
                      </p>
                    )}
                    <div className="mt-3 flex gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="hover:underline">
                          {t('contact.email')}
                        </a>
                      )}
                      {member.orcid && (
                        <a
                          href={`https://orcid.org/${member.orcid}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          ORCID
                        </a>
                      )}
                      {member.scholar && (
                        <a
                          href={member.scholar}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
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
            className="inline-block text-sm hover:underline"
            style={{ color: 'var(--accent-amber)' }}
          >
            {t('team.role.alumni_link')}
          </Link>
        </div>
      </div>
    </>
  )
}
