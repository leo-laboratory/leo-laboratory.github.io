'use client'

import { useTranslation } from '@/lib/i18n'
import { getLabMeta } from '@/lib/data'
import { PageHeader } from '@/components/page/PageHeader'

export default function ContactPage() {
  const { t, locale } = useTranslation()
  const lab = getLabMeta()
  const line = lab.address.line[locale] ?? lab.address.line.en
  const city = lab.address.city[locale] ?? lab.address.city.en
  const country = lab.address.country[locale] ?? lab.address.country.en
  const primary = lab.pi.primaryAffiliation[locale] ?? lab.pi.primaryAffiliation.en

  const mapQuery = encodeURIComponent(`${lab.address.room}, ${lab.address.line.en}, ${lab.address.city.en} ${lab.address.postal}`)

  return (
    <>
      <PageHeader title={t('contact.title')} intro={t('contact.intro')} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 grid gap-8">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
            {t('contact.affiliation')}
          </h2>
          <p style={{ color: 'var(--text-primary)' }}>{primary}</p>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
            {t('contact.address')}
          </h2>
          <address className="not-italic leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {lab.address.room}, {line}
            <br />
            {city} {lab.address.postal}
            <br />
            {country}
          </address>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm hover:underline"
            style={{ color: 'var(--accent-amber)' }}
          >
            Open in Google Maps →
          </a>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
            {t('contact.email')}
          </h2>
          <ul className="space-y-1">
            {lab.pi.emails.map(email => (
              <li key={email}>
                <a href={`mailto:${email}`} className="hover:underline" style={{ color: 'var(--text-primary)' }}>
                  {email}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
