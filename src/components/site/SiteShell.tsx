import { business, phoneHref } from '@/config/business'
import { landingSpec as spec, type BookingService } from '@/config/funnel'
import { getArticles, getServices } from '@/lib/cms'
import type { ReactNode } from 'react'
import { BookingProvider } from './booking'
import type { Tone } from './primitives'
import { MobileActionBar } from './sections/MobileActionBar'
import { Services } from './sections/Services'
import { SiteFooter } from './sections/SiteFooter'
import { SiteHeader } from './sections/SiteHeader'

/** The services list closing a page: which to leave out, what to call it, and its ground. */
export interface ClosingServices {
  /** The service whose own page this is. */
  exclude?: string
  title?: string
  /** Set it so the list never shares a ground with the section above it. Default white. */
  tone?: Tone
}

/**
 * Every page's frame: the header, the booking takeover every book button
 * opens, the services list, the footer and the pinned phone bar.
 *
 * - `jsonLd` is the page's structured data, written first: the local pack and
 *   every answer engine read it before a word of the page.
 * - `service` is set on a service's own page, so every book button there books
 *   that service.
 * - `services` closes the page with what the shop fixes, so no page is a dead
 *   end. `false` on the pages that already are that list (home, /services).
 */
export async function SiteShell({
  jsonLd,
  service = null,
  services = {},
  children,
}: {
  jsonLd?: Record<string, unknown>
  service?: BookingService | null
  services?: ClosingServices | false
  children: ReactNode
}) {
  // Both reads are cached (src/lib/cms.ts): the header's dropdown needs every service on every page.
  const [articles, all] = await Promise.all([getArticles(), getServices()])
  const closing = services ? all.filter((s) => s.slug !== services.exclude) : []

  return (
    <BookingProvider
      flow={spec.funnel}
      shopName={business.name}
      phone={business.phone}
      phoneHref={phoneHref()}
      service={service}
    >
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      ) : null}
      <SiteHeader
        logo={spec.logo}
        ctaLabel={spec.ctaLabel}
        nav={spec.nav}
        services={all.map(({ slug, name }) => ({ slug, name }))}
        hasPosts={articles.length > 0}
      />
      <main id="main">
        {children}
        {services && closing.length ? (
          <Services
            services={{ ...spec.services, title: services.title ?? spec.services.title }}
            items={closing}
            tone={services.tone}
          />
        ) : null}
      </main>
      <SiteFooter ctaLabel={spec.ctaLabel} finalCta={spec.finalCta} hasPosts={articles.length > 0} />
      <MobileActionBar ctaLabel={spec.ctaLabel} phone={business.phone} phoneHref={phoneHref()} />
    </BookingProvider>
  )
}
