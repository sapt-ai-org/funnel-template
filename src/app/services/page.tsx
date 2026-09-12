import { Container, LinkCard, PageHead, Section, SiteShell } from '@/components/site'
import { business } from '@/config/business'
import { landingSpec as spec } from '@/config/funnel'
import { getServices } from '@/lib/cms'
import { collectionPageData } from '@/lib/schema'
import { fitTitle, listFit, pageMetadata, town } from '@/lib/seo'
import type { Metadata } from 'next'

// Built once and served from the cache; rebuilt when Sapt reports an edit (see
// src/lib/cms.ts). 300 is CMS_REVALIDATE_SECONDS: Next only reads a literal here.
export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const services = await getServices()
  return pageMetadata({
    title: fitTitle(`Auto repair services in ${town()}`),
    description: listFit(`${business.name} in ${town()}: `, services.map((s) => s.name)),
    path: '/services',
  })
}

/** Every service the shop does, each opening its own page. */
export default async function ServicesPage() {
  const services = await getServices()
  // The page's list in the markup too, so a crawler reads it as the index it is.
  const list = services.map((s) => ({ name: s.name, path: `/services/${s.slug}` }))
  const jsonLd = collectionPageData('/services', spec.services.title, list)
  return (
    <SiteShell jsonLd={jsonLd} services={false}>
      <Section tone="paper" className="pt-8 sm:pt-12">
        <Container>
          <PageHead
            crumbs={[{ href: '/', label: 'Home' }, { label: spec.services.title }]}
            title={spec.services.title}
            intro={spec.services.footnote}
          />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <li key={s.slug}>
                <LinkCard href={`/services/${s.slug}`} photo={s.photo} title={s.name} body={s.summary} headingLevel={2} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </SiteShell>
  )
}
