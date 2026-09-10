import type { MetadataRoute } from 'next'
import { business } from '@/config/business'

/**
 * Answer-engine crawlers are allowed deliberately. A local shop has nothing to
 * protect from them and everything to gain: being the source an assistant
 * quotes for "mechanic near me" is the same win as the map pack, and the ads
 * for this offer say so out loud.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${business.siteUrl}/sitemap.xml`,
    host: business.siteUrl,
  }
}
