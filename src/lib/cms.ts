/**
 * The shop's editable content, read from Sapt.
 *
 * Services, FAQs, specials and posts are the parts a shop changes over time,
 * so they live in the Sapt CMS and a published edit reaches the site with no
 * deploy. Every read falls back to the code defaults in `business.ts` and
 * `funnel.ts` when the project is not set, Sapt is unreachable or nothing is
 * published yet, so a fresh clone still renders a complete site.
 *
 * Server only, and never read per visitor. Each content type is one request to
 * Sapt, kept in Next's data cache (R2 in production, `.next/cache` in dev) and
 * tagged `cms:<type>`. The pages built from it are cached too (see
 * open-next.config.ts). When an editor publishes, Sapt calls /api/revalidate,
 * which clears the tag: the read and every page that used it are rebuilt on
 * the next visit. `CMS_REVALIDATE_SECONDS` is the fallback for when that call
 * never arrives.
 */

import { business } from '@/config/business'
import type { BusinessProfile } from '@/config/business'
import { landingSpec } from '@/config/funnel'
import { serviceCopy } from '@/config/services'
import { filePhoto, firstPhoto, type ResolvedPhoto, type SlotId } from '@/lib/images'
import { getSaptServerConfig } from '@/lib/sapt-config'
import type { CMSContentItem } from '@/lib/sapt-server'
import { cache } from 'react'

/**
 * How long a read is trusted before Sapt is asked again, when no webhook has
 * cleared it first. Pages use the same figure: see `revalidate` in each page.
 */
export const CMS_REVALIDATE_SECONDS = 300

/** The cache tag on every read of one content type. /api/revalidate clears it. */
export const cmsTag = (typeSlug: string) => `cms:${typeSlug}`

/** Sapt's public read is slow on a cold start; past this, render the defaults instead. */
const CMS_TIMEOUT_MS = 10_000

/** Stock photo hosts. A photo from one of these is a stand-in, never the shop. */
const STOCK_HOSTS = new Set(['images.unsplash.com', 'images.pexels.com'])

export interface Service {
  slug: string
  name: string
  /** The shop's own line from Sapt, or the default in src/config/services.ts. Never empty. */
  summary: string
  description: string | null
  photo: ResolvedPhoto | null
}

export interface FaqItem {
  q: string
  a: string
  /** The service slug this question belongs to; null means the whole shop. */
  service: string | null
}

export type Special = BusinessProfile['specials'][number]

export type ArticleSection =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level: 'h2' | 'h3' }
  | { type: 'list'; items: string[]; ordered: boolean }
  | { type: 'image'; url: string; alt: string; caption?: string }
  | { type: 'callout'; text: string; title?: string }
  | { type: 'stat'; value: string; label: string; description?: string }

export interface Article {
  slug: string
  title: string
  excerpt: string | null
  /** "Job story" or "Guide". */
  category: string | null
  service: string | null
  vehicle: string | null
  photo: ResolvedPhoto | null
  sections: ArticleSection[]
  publishedAt: string | null
  seoTitle: string | null
  seoDescription: string | null
}

/* ── Pure mapping, tested in cms.test.ts ───────────────────────────────────── */

/** A service name as the slug Sapt uses for it: "Heating and A/C" is heating-and-ac. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
}

const text = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null

const nonNull = <T,>(value: T | null): value is T => value !== null

/** A CMS image value: `{ kind: 'url', url }`, or an upload Sapt hydrated with its public `url`. */
function imageSrc(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null
  const url = (value as { url?: unknown }).url
  return typeof url === 'string' && /^https?:\/\//.test(url) ? url : null
}

function cmsPhoto(src: string, alt: string): ResolvedPhoto {
  const photo = filePhoto(src, alt)
  let host = ''
  try {
    host = new URL(src).hostname
  } catch {
    return photo
  }
  return STOCK_HOSTS.has(host) ? { ...photo, sample: true } : photo
}

/** Where a service's photo comes from when Sapt has none: the closest slot the shop filled. */
const SERVICE_SLOTS: Record<string, SlotId[]> = {
  'brakes-and-rotors': ['gallery3', 'bay'],
  'check-engine-diagnostics': ['gallery1', 'detail'],
  'tires-and-alignment': ['gallery2', 'bay'],
}

function fallbackPhoto(slug: string): ResolvedPhoto | null {
  return firstPhoto(SERVICE_SLOTS[slug] ?? ['bay', 'detail', 'interior'])
}

export function toService(item: CMSContentItem): Service {
  const c = item.content
  const src = imageSrc(c.image)
  return {
    slug: item.slug,
    name: item.name,
    summary: text(c.summary) ?? serviceCopy(item.slug, item.name).summary,
    description: text(c.description),
    photo: src ? cmsPhoto(src, `${item.name} at ${business.name}`) : fallbackPhoto(item.slug),
  }
}

/** A published question with no answer yet is never shown. */
export function toFaq(item: CMSContentItem): FaqItem | null {
  const q = text(item.content.question) ?? text(item.name)
  const a = text(item.content.answer)
  if (!q || !a) return null
  return { q, a, service: text(item.content.service) }
}

/** A special is good through the end of its `ends` day, then it disappears. */
export function toSpecial(item: CMSContentItem, now = new Date()): Special | null {
  const c = item.content
  const title = text(c.title)
  if (!title) return null
  const ends = text(c.ends)
  if (ends) {
    const lastMoment = new Date(ends.length === 10 ? `${ends}T23:59:59` : ends)
    if (!Number.isNaN(lastMoment.getTime()) && lastMoment < now) return null
  }
  const terms = text(c.terms)
  return { title, detail: text(c.detail) ?? '', ...(terms ? { terms } : {}) }
}

/** The body Sapt stores as a JSON string of `{ sections }`. Unknown section types are skipped. */
export function parseSections(raw: unknown): ArticleSection[] {
  let parsed: unknown = raw
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw)
    } catch {
      const plain = raw.trim()
      return plain ? [{ type: 'paragraph', text: plain }] : []
    }
  }
  const list = (parsed as { sections?: unknown } | null)?.sections
  if (!Array.isArray(list)) return []

  const out: ArticleSection[] = []
  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue
    const s = entry as Record<string, unknown>
    const body = text(s.text)
    switch (s.type) {
      case 'paragraph':
        if (body) out.push({ type: 'paragraph', text: body })
        break
      case 'heading':
        if (body) out.push({ type: 'heading', text: body, level: s.level === 'h3' ? 'h3' : 'h2' })
        break
      case 'list': {
        const items = Array.isArray(s.items) ? s.items.map(text).filter(nonNull) : []
        if (items.length) out.push({ type: 'list', items, ordered: s.list_type === 'ol' })
        break
      }
      case 'image': {
        const url = text(s.url)
        const caption = text(s.caption)
        if (url) out.push({ type: 'image', url, alt: text(s.alt) ?? '', ...(caption ? { caption } : {}) })
        break
      }
      case 'callout': {
        const title = text(s.title)
        if (body) out.push({ type: 'callout', text: body, ...(title ? { title } : {}) })
        break
      }
      case 'stat': {
        const value = text(s.value)
        const label = text(s.label)
        const description = text(s.description)
        if (value && label) out.push({ type: 'stat', value, label, ...(description ? { description } : {}) })
        break
      }
    }
  }
  return out
}

export function toArticle(item: CMSContentItem): Article | null {
  const c = item.content
  const title = text(c.title) ?? text(item.name)
  if (!title) return null
  const src = imageSrc(c.featuredImage)
  return {
    slug: item.slug,
    title,
    excerpt: text(c.excerpt),
    category: text(c.category),
    service: text(c.service),
    vehicle: text(c.vehicle),
    photo: src ? cmsPhoto(src, text(c.featuredImageAlt) ?? title) : null,
    sections: parseSections(c.content),
    publishedAt: item.publishedAt ?? null,
    seoTitle: text(c.seoTitle),
    seoDescription: text(c.seoDescription),
  }
}

/** The home page's questions: the shop's own general ones once it has any, else the template's. */
export function homeFaqs(all: FaqItem[]): { q: string; a: string }[] {
  const general = all.filter((f) => !f.service)
  return general.length ? general : landingSpec.faq.items
}

/* ── Reads ─────────────────────────────────────────────────────────────────── */

/**
 * Every published item of one type, in the order the editor set. Sapt returns
 * up to 100 per type, which is more than a shop publishes of anything.
 *
 * Only a 200 is cached (Next never stores another status), so an outage is
 * never remembered: once a read has succeeded, a failed refresh keeps serving
 * the last good copy. Only a read that has never succeeded falls back to the
 * defaults, and the next request tries Sapt again.
 */
async function listPublished(typeSlug: string): Promise<CMSContentItem[]> {
  const { baseUrl, projectId } = getSaptServerConfig()
  if (!projectId) return []
  try {
    const res = await fetch(`${baseUrl}/public/projects/${projectId}/cms/content/${typeSlug}`, {
      next: { revalidate: CMS_REVALIDATE_SECONDS, tags: [cmsTag(typeSlug)] },
      signal: AbortSignal.timeout(CMS_TIMEOUT_MS),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body = (await res.json()) as { items?: CMSContentItem[] }
    return Array.isArray(body.items) ? body.items : []
  } catch (error) {
    console.error(`[cms] could not read "${typeSlug}" from Sapt, showing the defaults:`, error)
    return []
  }
}

/** Services from Sapt when any are published, else the Google profile's list. */
export const getServices = cache(async (): Promise<Service[]> => {
  const published = (await listPublished('service')).map(toService)
  if (published.length) return published
  return business.services.map((name) => {
    const slug = slugify(name)
    return { slug, name, summary: serviceCopy(slug, name).summary, description: null, photo: fallbackPhoto(slug) }
  })
})

export const getFaqs = cache(async (): Promise<FaqItem[]> =>
  (await listPublished('faq')).map(toFaq).filter(nonNull)
)

/** Live specials from Sapt when any are published, else the ones in business.ts. */
export const getSpecials = cache(async (): Promise<Special[]> => {
  const live = (await listPublished('special')).map((item) => toSpecial(item)).filter(nonNull)
  return live.length ? live : business.specials
})

/** Published posts, newest first. */
export const getArticles = cache(async (): Promise<Article[]> =>
  (await listPublished('article'))
    .map(toArticle)
    .filter(nonNull)
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
)

/**
 * One post, found in the list rather than fetched on its own: the list is
 * already cached, and a made-up slug then costs nothing but a 404.
 */
export const getArticle = cache(
  async (slug: string): Promise<Article | null> => (await getArticles()).find((a) => a.slug === slug) ?? null
)

/** "Job story · September 2026": what a post is and when, month not day so it never reads stale. */
export function postEyebrow(article: Article): string | null {
  const when = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: business.timeZone,
      })
    : null
  return [article.category, when].filter(Boolean).join(' · ') || null
}
