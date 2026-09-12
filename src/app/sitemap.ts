import type { MetadataRoute } from 'next'
import { business } from '@/config/business'
import { LEGAL_UPDATED } from '@/config/legal'
import { getArticles, getServices } from '@/lib/cms'
import type { ResolvedPhoto } from '@/lib/images'
import { shopImages } from '@/lib/schema'

// Built once and served from the cache; rebuilt when Sapt reports an edit (see
// src/lib/cms.ts). 300 is CMS_REVALIDATE_SECONDS: Next only reads a literal here.
export const revalidate = 300

/**
 * Every page worth indexing, as absolute URLs: the home page (with the shop's
 * real photos, for image search), the services page and each service's own
 * page (with its photo when it is the shop's), the blog once it has posts, and
 * the policies. `/book` is a redirect and `/review` is for customers who have
 * just been in, so neither belongs here.
 *
 * A date is given only where one is known: when a post went up, when the
 * policies last changed. Google ignores a `lastmod` that moves on every build,
 * and then trusts the real ones less.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const root = business.siteUrl.replace(/\/+$/, '')
  const [services, posts] = await Promise.all([getServices(), getArticles()])
  const policiesUpdated = new Date(LEGAL_UPDATED)
  // Image entries only for the shop's own photos, never a sample or a placeholder.
  const images = (photos: (ResolvedPhoto | null)[]) => {
    const urls = photos.filter((p) => p && !p.sample && !p.placeholder).map((p) => new URL(p!.src, `${root}/`).href)
    return urls.length ? { images: urls } : {}
  }
  const home = shopImages()

  return [
    { url: `${root}/`, ...(home.length ? { images: home } : {}) },
    { url: `${root}/services` },
    ...services.map((s) => ({ url: `${root}/services/${s.slug}`, ...images([s.photo]) })),
    ...(posts.length ? [{ url: `${root}/blog` }] : []),
    ...posts.map((p) => ({
      url: `${root}/blog/${p.slug}`,
      ...(p.publishedAt ? { lastModified: new Date(p.publishedAt) } : {}),
      ...images([p.photo]),
    })),
    ...['/privacy', '/terms', '/accessibility'].map((path) => ({
      url: `${root}${path}`,
      ...(Number.isNaN(policiesUpdated.getTime()) ? {} : { lastModified: policiesUpdated }),
    })),
  ]
}
