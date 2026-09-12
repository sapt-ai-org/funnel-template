import { Analytics } from '@/components/Analytics'
import { MetaPixel } from '@/components/MetaPixel'
import { business, isTemplate } from '@/config/business'
import { design } from '@/config/design'
import { bodyFont, displayFont } from '@/config/fonts'
import { landingSpec } from '@/config/funnel'
import { pageTitle } from '@/lib/schema'
import { themeStyle } from '@/lib/theme'
import type { Metadata, Viewport } from 'next'
import './globals.css'

/**
 * What every page shares. Each page states its own title, description,
 * canonical and share cards through `pageMetadata` (src/lib/seo.ts); these are
 * only the fallbacks and the site-wide facts, so no page can inherit another
 * page's URL or title by leaving something out.
 */
export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  applicationName: business.name,
  title: pageTitle(),
  description: landingSpec.seo.description,
  // The untouched template, or a client site before its first pull-gbp, is
  // demo content under a demo name. It must never be indexed as a business.
  robots: isTemplate()
    ? { index: false, follow: false }
    : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: { siteName: business.name, locale: 'en_US', type: 'website' },
  twitter: { card: 'summary_large_image' },
  formatDetection: { telephone: true, address: true, email: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: design.colors.paper,
}

/**
 * The look is set here, once, on <html>: the two fonts (src/config/fonts.ts)
 * as CSS variables, the colours and corner radius (src/config/design.ts) as
 * inline custom properties, and the motif as an attribute globals.css keys
 * its textures off.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable}`}
      style={themeStyle(design)}
      data-motif={design.motif}
    >
      <body>
        {children}
        <Analytics />
        {/* Nothing until NEXT_PUBLIC_META_PIXEL_ID is set. */}
        <MetaPixel />
      </body>
    </html>
  )
}
