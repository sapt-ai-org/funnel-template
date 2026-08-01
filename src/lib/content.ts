/**
 * Optional section-content resolver. Code remains the default source of truth.
 * When `useCmsContent` is enabled and a matching published item exists, CMS
 * keys layer over the caller-provided fallback.
 */
import { siteConfig } from '@/config/site-config'
import { cmsGetBySlug } from './sapt-server'

export async function resolveContent<T extends Record<string, unknown>>(
  slug: string,
  fallback: T
): Promise<T> {
  if (!siteConfig.useCmsContent) return fallback
  const item = await cmsGetBySlug('section', slug)
  if (!item) return fallback
  return { ...fallback, ...(item.content as Partial<T>) }
}
