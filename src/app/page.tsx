import {
  Faq,
  Feature,
  Gallery,
  Hero,
  RepairOrder,
  Reviews,
  Services,
  Shop,
  SiteShell,
  Specials,
  TrustBar,
  Visit,
} from '@/components/site'
import { landingSpec as spec } from '@/config/funnel'
import { getFaqs, getServices, getSpecials, homeFaqs } from '@/lib/cms'
import { pageTitle, structuredData } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

// Built once and served from the cache; rebuilt when Sapt reports an edit (see
// src/lib/cms.ts). 300 is CMS_REVALIDATE_SECONDS: Next only reads a literal here.
export const revalidate = 300

export const metadata: Metadata = pageMetadata({ title: pageTitle(), description: spec.seo.description, path: '/' })

/**
 * The shop's home page, and this file is its running order.
 *
 * The order follows the questions a driver has, in the order they have them:
 * can I book it now (the hero is the form), who vouches for you (the trust
 * strip), how will it go (the repair order), do you do mine (services, each
 * with its own page), can I trust you (reviews, the shop, its photos), where
 * and when (visit), what about (FAQ), and then the booking, which the footer
 * opens with. Reorder or remove lines here; nothing else on the page depends
 * on the order. For a standalone closing ask, add
 * <FinalCta finalCta={spec.finalCta} ctaLabel={spec.ctaLabel} /> at the end.
 */
export default async function Home() {
  const [services, faqs, specials] = await Promise.all([getServices(), getFaqs(), getSpecials()])
  const faq = { ...spec.faq, items: homeFaqs(faqs) }

  return (
    <SiteShell jsonLd={structuredData({ faqs: faq.items, services })} services={false}>
      <Hero hero={spec.hero} ctaLabel={spec.ctaLabel} funnel={spec.funnel} />
      <TrustBar />
      <RepairOrder promise={spec.promise} />
      <Services services={spec.services} items={services} />
      {spec.features.map((block) => (
        <Feature key={block.id} block={block} ctaLabel={spec.ctaLabel} />
      ))}
      <Specials items={specials} />
      <Reviews proof={spec.proof} />
      <Shop shop={spec.shop} />
      <Gallery gallery={spec.gallery} />
      <Visit visit={spec.visit} />
      <Faq faq={faq} />
    </SiteShell>
  )
}
