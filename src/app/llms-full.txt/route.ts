import { serviceCopy } from '@/config/services'
import { getArticles, getFaqs, getServices, getSpecials, homeFaqs } from '@/lib/cms'
import { llmsFullTxt } from '@/lib/llms'

// Built once and served from the cache; rebuilt when Sapt reports an edit (see
// src/lib/cms.ts). 300 is CMS_REVALIDATE_SECONDS: Next only reads a literal here.
export const revalidate = 300

/**
 * The whole site as plain text for AI assistants: /llms.txt's index, then
 * every service page, the specials and every post in full (src/lib/llms.ts).
 * Same reads and fallbacks as the pages, so it changes when they do.
 */
export async function GET(): Promise<Response> {
  const [services, faqs, articles, specials] = await Promise.all([getServices(), getFaqs(), getArticles(), getSpecials()])
  const serviceFaqs = Object.fromEntries(
    services.map((s) => {
      const own = faqs.filter((f) => f.service === s.slug)
      return [s.slug, own.length ? own : serviceCopy(s.slug, s.name).faqs]
    })
  )
  return new Response(llmsFullTxt({ services, faqs: homeFaqs(faqs), serviceFaqs, articles, specials }), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
