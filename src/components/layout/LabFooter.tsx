'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/lib/i18n'
import { getLabMeta } from '@/lib/data'

export function LabFooter() {
  const { t, locale } = useTranslation()
  const lab = getLabMeta()
  const year = new Date().getFullYear()
  const city = lab.address.city[locale] ?? lab.address.city.en
  const line = lab.address.line[locale] ?? lab.address.line.en
  const country = lab.address.country[locale] ?? lab.address.country.en
  const primary = lab.pi.primaryAffiliation[locale] ?? lab.pi.primaryAffiliation.en

  return (
    <footer
      className="mt-24 border-t"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <Image
            src="/assets/logo.png"
            alt="LEO Lab"
            width={2007}
            height={1615}
            className="h-16 w-auto mb-3"
          />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {lab.fullName[locale] ?? lab.fullName.en}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {primary}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            {t('footer.address_label')}
          </h3>
          <address className="not-italic text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {lab.address.room}, {line}
            <br />
            {city} {lab.address.postal}
            <br />
            {country}
          </address>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            {t('contact.email')}
          </h3>
          <ul className="text-sm space-y-1">
            {lab.pi.emails.map(email => (
              <li key={email}>
                <a
                  href={`mailto:${email}`}
                  className="hover:underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {email}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <a href={`https://orcid.org/${lab.pi.orcid}`} target="_blank" rel="noreferrer" className="hover:underline">
              ORCID
            </a>
            <a
              href={`https://scholar.google.com/citations?user=${lab.pi.scholarId}`}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Scholar
            </a>
            <Link href="/contact/" className="hover:underline">
              {t('nav.contact')}
            </Link>
          </div>
        </div>
      </div>

      <div
        className="border-t py-4 text-center text-xs"
        style={{
          borderColor: 'var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        {t('footer.copyright', { year })}
      </div>
    </footer>
  )
}
