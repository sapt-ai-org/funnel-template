import { LegalPage, SiteShell } from '@/components/site'
import { business } from '@/config/business'
import { LEGAL_UPDATED, privacyPolicy } from '@/config/legal'
import { webPageData } from '@/lib/schema'
import { fitTitle, pageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

// Built once and served from the cache; rebuilt when Sapt reports an edit (see
// src/lib/cms.ts). 300 is CMS_REVALIDATE_SECONDS: Next only reads a literal here.
export const revalidate = 300

const doc = privacyPolicy()

export const metadata: Metadata = pageMetadata({
  title: fitTitle(doc.title),
  description: `How ${business.name} collects, uses and protects your information, including text messages.`,
  path: '/privacy',
})

export default function PrivacyPage() {
  return (
    <SiteShell jsonLd={webPageData('/privacy', doc.title)}>
      <LegalPage doc={doc} updated={LEGAL_UPDATED} />
    </SiteShell>
  )
}
