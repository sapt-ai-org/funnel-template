import {
  Container,
  FaqSection,
  LinkCard,
  RepairOrder,
  Reviews,
  Section,
  SectionTitle,
  ServiceDetail,
  ServiceHero,
  SiteShell,
  TrustBar,
  alternate,
} from '@/components/site'
import { business } from '@/config/business'
import { landingSpec as spec, type BookingService } from '@/config/funnel'
import { serviceCopy } from '@/config/services'
import { getArticles, getFaqs, getServices, postEyebrow } from '@/lib/cms'
import { servicePageData } from '@/lib/schema'
import { fitTitle, joinFit, pageMetadata, town } from '@/lib/seo'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// Built once and served from the cache; rebuilt when Sapt reports an edit (see
// src/lib/cms.ts). 300 is CMS_REVALIDATE_SECONDS: Next only reads a literal here.
export const revalidate = 300

/** Every service is built with the site. One published later is built on its first visit. */
export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }))
}
export const dynamicParams = true

type Props = { params: Promise<{ slug: string }> }

/**
 * Everything the page says about one service: the shop's own words from Sapt
 * where it has written them, the defaults in src/config/services.ts where it
 * has not.
 */
async function load(slug: string) {
  const [services, faqs, articles] = await Promise.all([getServices(), getFaqs(), getArticles()])
  const service = services.find((s) => s.slug === slug)
  if (!service) return null
  const copy = serviceCopy(service.slug, service.name)
  const own = faqs.filter((f) => f.service === slug)
  return {
    service,
    copy,
    faqs: own.length ? own : copy.faqs.map((f) => ({ ...f, service: slug })),
    stories: articles.filter((a) => a.service === slug).slice(0, 3),
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load((await params).slug)
  if (!data) return {}
  const { service } = data
  return pageMetadata({
    title: fitTitle(`${service.name} in ${town()}`),
    description: joinFit(service.summary, `${business.name}, ${town()}.`, `Call ${business.phone} or book online.`),
    path: `/services/${service.slug}`,
    // ./opengraph-image.tsx: the service's name on the shop's card.
    image: `/services/${service.slug}/opengraph-image`,
  })
}

/**
 * One service's own page. This is the page that ranks for the service in the
 * shop's town, and the visitor on it searched for this job, so it is built to
 * book it: the hero is the booking form for this service over this service's
 * photo; then who vouches for the shop, what the job involves and when it is
 * due, how every repair goes, what customers say, the questions people ask,
 * the shop's recent jobs, and the rest of what it fixes.
 */
export default async function ServicePage({ params }: Props) {
  const data = await load((await params).slug)
  if (!data) notFound()
  const { service, copy, faqs, stories } = data
  const booking: BookingService = { slug: service.slug, name: service.name, issue: copy.issue }

  // After the reviews (paper), the sections this service has alternate white
  // and paper, and the services list closing the page takes the next ground.
  const tone = alternate('paper')
  const faqTone = faqs.length ? tone() : null
  const storyTone = stories.length ? tone() : null

  return (
    <SiteShell
      jsonLd={servicePageData(service, faqs)}
      service={booking}
      services={{ exclude: service.slug, title: spec.servicePage.othersTitle, tone: tone() }}
    >
      <ServiceHero
        service={service}
        summary={service.summary}
        booking={booking}
        ctaLabel={spec.ctaLabel}
        funnel={spec.funnel}
        servicesTitle={spec.services.title}
      />
      <TrustBar />
      <ServiceDetail
        slug={service.slug}
        description={service.description}
        includes={copy.includes}
        signs={copy.signs}
        titles={spec.servicePage}
        ctaLabel={spec.ctaLabel}
      />
      <RepairOrder promise={spec.promise} />
      <Reviews proof={spec.proof} />

      {faqTone ? (
        <FaqSection
          id="questions"
          tone={faqTone}
          title={spec.servicePage.questionsTitle}
          items={faqs}
          ask={spec.faq.ask}
        />
      ) : null}

      {storyTone ? (
        <Section id="jobs" tone={storyTone}>
          <Container>
            <SectionTitle id="jobs">{spec.servicePage.storiesTitle}</SectionTitle>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((post) => (
                <li key={post.slug}>
                  <LinkCard
                    href={`/blog/${post.slug}`}
                    photo={post.photo}
                    eyebrow={postEyebrow(post)}
                    title={post.title}
                    body={post.excerpt}
                  />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}
    </SiteShell>
  )
}
