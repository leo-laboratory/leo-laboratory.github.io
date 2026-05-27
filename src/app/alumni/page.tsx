'use client'

import Image from 'next/image'
import { useTranslation } from '@/lib/i18n'
import { getAlumni } from '@/lib/data'
import type { AlumniMember } from '@/lib/data'
import { PageHeader } from '@/components/page/PageHeader'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function AlumPhoto({ member }: { member: AlumniMember }) {
  if (member.hasPhoto && member.photo) {
    return (
      <div
        className="w-20 h-20 rounded-full overflow-hidden shrink-0"
        style={{ border: '1px solid var(--border)' }}
      >
        <Image
          src={member.photo}
          alt={member.name}
          width={80}
          height={80}
          className="object-cover w-full h-full"
        />
      </div>
    )
  }
  return (
    <div
      className="w-20 h-20 rounded-full flex items-center justify-center font-serif font-medium shrink-0"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        color: 'var(--accent)',
        fontSize: '1.5rem',
      }}
    >
      {initials(member.name)}
    </div>
  )
}

export default function AlumniPage() {
  const { t, locale } = useTranslation()
  const alumni = getAlumni()

  return (
    <>
      <PageHeader title={t('alumni.title')} intro={t('alumni.intro')} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {alumni.length === 0 ? (
          <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
            {t('alumni.empty')}
          </p>
        ) : (
          <ul className="space-y-8">
            {alumni.map(member => (
              <li key={member.id} id={member.id} className="scroll-mt-24 flex gap-5">
                <AlumPhoto member={member} />
                <div className="flex-1">
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
                  <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                    {t(`team.role.${member.formerRole}`)} · {member.period}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {t('alumni.current_position')}:{' '}
                    {member.currentPosition[locale] ?? member.currentPosition.en}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
