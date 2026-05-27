import type { Metadata } from 'next'
import { Inter, Noto_Sans_KR } from 'next/font/google'
import { ThemeProvider } from '@/lib/theme'
import { LocaleProvider } from '@/lib/i18n'
import { LabHeader } from '@/components/layout/LabHeader'
import { LabFooter } from '@/components/layout/LabFooter'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-kr',
})

export const metadata: Metadata = {
  title: {
    default: "LEO Lab · Lee's Evolution and Omics",
    template: '%s · LEO Lab',
  },
  description:
    'LEO Lab (Lee\'s Evolution and Omics) at IBS Center for Genome Engineering — studying the diversity of cellular phenotypes and evolutionary dynamics through single-cell and spatial omics.',
  metadataBase: new URL('https://heetak.org'),
  openGraph: {
    title: "LEO Lab · Lee's Evolution and Omics",
    description: 'Omics for understanding Evolution',
    url: 'https://heetak.org',
    siteName: 'LEO Lab',
    locale: 'en_US',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

const themeBootstrap = `
  (function() {
    try {
      var t = localStorage.getItem('leolab.theme');
      if (t !== 'light' && t !== 'dark') {
        t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', t);
      var l = localStorage.getItem('leolab.locale');
      if (l === 'ko' || l === 'en') document.documentElement.lang = l;
    } catch (e) {}
  })();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${inter.variable} ${notoSansKR.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <ThemeProvider>
          <LocaleProvider>
            <div className="min-h-screen flex flex-col">
              <LabHeader />
              <main className="flex-1">{children}</main>
              <LabFooter />
            </div>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
