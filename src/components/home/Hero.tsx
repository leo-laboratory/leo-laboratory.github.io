'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'
import { getLabMeta } from '@/lib/data'
import { PhyloTreeHero } from '@/components/hero/PhyloTreeHero'

export function Hero() {
  const { t, locale } = useTranslation()
  const lab = getLabMeta()
  const name = lab.name[locale] ?? lab.name.en
  const fullName = lab.fullName[locale] ?? lab.fullName.en
  const tagline = lab.tagline[locale] ?? lab.tagline.en

  return (
    <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-12 items-center">
        <div className="text-center lg:text-left">
          <p
            className="text-xs uppercase tracking-[0.3em] mb-4 font-semibold"
            style={{ color: 'var(--accent)' }}
          >
            {t('hero.founded', { year: lab.founded })}
          </p>
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            {name}
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            {fullName}
          </p>
          <p
            className="text-xl sm:text-2xl leading-snug mb-8 font-light"
            style={{ color: 'var(--text-secondary)' }}
          >
            {tagline}
          </p>
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            <Link
              href="/research/"
              className="px-5 py-2.5 rounded-md text-sm font-semibold transition-colors"
              style={{
                background: 'var(--accent)',
                color: '#ffffff',
              }}
            >
              {t('hero.cta.research')} →
            </Link>
            <Link
              href="/join/"
              className="px-5 py-2.5 rounded-md text-sm font-semibold border transition-colors"
              style={{
                borderColor: 'var(--accent)',
                color: 'var(--accent)',
              }}
            >
              {t('hero.cta.join')}
            </Link>
          </div>
        </div>

        <div className="relative">
          <PhyloTreeHero seed={7} width={640} height={480} />
        </div>
      </div>
    </section>
  )
}
