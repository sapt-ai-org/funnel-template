import { Analytics } from '@/components/Analytics'
import { ScrollToTop } from '@/components/ui'
import { landingSpec } from '@/config/funnel'
import { safeFontStylesheetUrl, themeStyle } from '@/lib/theme'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: landingSpec.seo.title,
  description: landingSpec.seo.description,
  authors: [{ name: landingSpec.brandName }],
  openGraph: {
    title: landingSpec.seo.title,
    description: landingSpec.seo.description,
    type: 'website',
    locale: 'en_US',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: landingSpec.theme.primary,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const fontStylesheetUrl = safeFontStylesheetUrl(landingSpec.theme.fontStylesheetUrl)

  return (
    <html lang="en" style={themeStyle(landingSpec.theme)}>
      {fontStylesheetUrl && (
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={fontStylesheetUrl} />
        </head>
      )}
      <body>
        <ScrollToTop />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
