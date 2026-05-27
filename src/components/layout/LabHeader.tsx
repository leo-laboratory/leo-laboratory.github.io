'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/lib/i18n'
import { LanguageToggle } from './LanguageToggle'
import { ThemeToggle } from './ThemeToggle'

const NAV_LINKS = [
  { href: '/', key: 'nav.home' },
  { href: '/team/', key: 'nav.team' },
  { href: '/research/', key: 'nav.research' },
  { href: '/publications/', key: 'nav.publications' },
  { href: '/news/', key: 'nav.news' },
  { href: '/join/', key: 'nav.join' },
  { href: '/contact/', key: 'nav.contact' },
] as const

export function LabHeader() {
  const { t } = useTranslation()
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md border-b"
      style={{
        background: 'var(--glass-bg)',
        borderColor: 'var(--glass-border)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0 flex items-center gap-2" aria-label="LEO Lab — Home">
          <Image
            src="/assets/logo.png"
            alt="LEO Lab"
            width={2007}
            height={1615}
            priority
            className="h-8 w-auto"
          />
          <span
            className="font-serif font-medium text-lg tracking-tight hidden sm:inline"
            style={{ color: 'var(--text-primary)' }}
          >
            LEO Lab
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, key }) => (
            <Link
              key={key}
              href={href}
              className="px-2.5 py-1.5 text-sm transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <nav className="md:hidden border-t flex overflow-x-auto" style={{ borderColor: 'var(--glass-border)' }}>
        {NAV_LINKS.map(({ href, key }) => (
          <Link
            key={key}
            href={href}
            className="px-3 py-2 text-xs whitespace-nowrap"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t(key)}
          </Link>
        ))}
      </nav>
    </header>
  )
}
