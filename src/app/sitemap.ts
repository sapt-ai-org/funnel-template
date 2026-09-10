import type { MetadataRoute } from 'next'
import { business } from '@/config/business'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: business.siteUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${business.siteUrl}/book`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${business.siteUrl}/review`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]
}
