import { LegalPage, SiteShell } from '@/components/site'
import { business } from '@/config/business'
import { LEGAL_UPDATED, termsOfService } from '@/config/legal'
import { webPageData } from '@/lib/schema'
import { fitTitle, pageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

// Built once and served from the cache; rebuilt when Sapt reports an edit (see
// src/lib/cms.ts). 300 is CMS_REVALIDATE_SECONDS: Next only reads a literal here.
export const revalidate = 300

const doc = termsOfService()

export const metadata: Metadata = pageMetadata({
  title: fitTitle(doc.title),
  description: `The terms for using the ${business.name} website and for receiving texts from the shop.`,
  path: '/terms',
})

export default function TermsPage() {
  return (
    <SiteShell jsonLd={webPageData('/terms', doc.title)}>
      <LegalPage doc={doc} updated={LEGAL_UPDATED} />
    </SiteShell>
  )
}
