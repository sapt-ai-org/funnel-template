import { serviceCopy } from '@/config/services'
import { getArticles, getFaqs, getServices, homeFaqs } from '@/lib/cms'
import { llmsTxt } from '@/lib/schema'

// Built once and served from the cache; rebuilt when Sapt reports an edit (see
// src/lib/cms.ts). 300 is CMS_REVALIDATE_SECONDS: Next only reads a literal here.
export const revalidate = 300

/**
 * Served as text/plain so a crawler gets the facts without parsing a layout:
 * the profile, each service with its page, the questions each page answers
 * (the same ones, word for word, with the same fallbacks the pages use) and
 * the recent jobs. Cached like the pages, so it changes when they do.
 */
export async function GET(): Promise<Response> {
  const [services, faqs, articles] = await Promise.all([getServices(), getFaqs(), getArticles()])
  const serviceFaqs = Object.fromEntries(
    services.map((s) => {
      const own = faqs.filter((f) => f.service === s.slug)
      return [s.slug, own.length ? own : serviceCopy(s.slug, s.name).faqs]
    })
  )
  return new Response(llmsTxt({ services, faqs: homeFaqs(faqs), serviceFaqs, articles }), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
