import { business, dayName, formatTime, socialProfiles } from '@/config/business'
import { landingSpec } from '@/config/funnel'
import { resolveBadge } from '@/config/trust'
import type { Article, FaqItem, Service } from '@/lib/cms'
import { galleryPhotos, portraitPhoto, storefrontPhoto, type ResolvedPhoto } from '@/lib/images'

/**
 * Structured data.
 *
 * Google's local pack, the knowledge panel and every AI answer engine read
 * JSON-LD before they read the page. Each page carries one linked graph: the
 * business, the website it owns, the page itself (with its breadcrumb trail),
 * and what the page is about (a service, a post, its questions). Nodes point
 * at each other by `@id`, so a crawler reads one entity, not six snippets.
 *
 * Three hard rules:
 *
 *  1. Everything here must match the Google Business Profile exactly. Google
 *     cross-checks name, address and phone between the listing and the site,
 *     and a mismatch reads as a sign one of them is stale.
 *  2. Never emit a field we cannot substantiate: no guessed coordinates, no
 *     invented price range, never a sample photo presented as the shop.
 *  3. No rating or review on the shop's own business node. Google counts
 *     reviews a business shows about itself as self-serving, even when they
 *     came from Google, and only recommends `aggregateRating` for sites that
 *     review other businesses. The stars stay on the page, for people.
 */

/** Schema.org day names, indexed to match `BusinessHours.day` (0 = Sunday). */
const SCHEMA_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** The live origin with no trailing slash, so ids and URLs join cleanly. */
const origin = () => business.siteUrl.replace(/\/+$/, '')
const idFor = (fragment: string) => `${origin()}/#${fragment}`
const absolute = (src: string) => new URL(src, `${origin()}/`).href
/** A page's absolute URL. The home page keeps its slash; nothing else ends in one. */
const pageUrl = (path: string) => (path === '/' ? `${origin()}/` : `${origin()}${path}`)
const ref = (id: string) => ({ '@id': id })

type Node = Record<string, unknown>

const town = () => `${business.address.city}, ${business.address.state}`

/**
 * The page title, built from facts so it is right the moment pull-gbp runs:
 * the longest of these that still fits a results page.
 */
export function pageTitle(): string {
  const { name, category } = business
  const candidates = [
    `${name} | ${category} in ${town()}`,
    `${name} | ${category} in ${business.address.city}`,
    `${name} in ${town()}`,
  ]
  return candidates.find((t) => t.length <= 60) ?? name
}

/** The shop's number with its country code, as Google asks for: "+1-216-555-0148". */
export function internationalPhone(phone: string = business.phone): string {
  const digits = phone.replace(/\D/g, '')
  const national = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
  return national.length === 10
    ? `+1-${national.slice(0, 3)}-${national.slice(3, 6)}-${national.slice(6)}`
    : `+${digits}`
}

/**
 * The shop's real photos, best first, as absolute URLs. Never a sample: a
 * crawler shown a stock photo as the shop is being told something false.
 */
export function shopImages(): string[] {
  const all = [storefrontPhoto(), portraitPhoto(), ...galleryPhotos(12)]
  return all.filter((p) => p && !p.sample && !p.placeholder).map((p) => absolute(p!.src))
}

/** A photo a crawler may be shown as the shop: never a sample, never a placeholder. */
function isRealPhoto(p: ResolvedPhoto | null): p is ResolvedPhoto {
  return Boolean(p && !p.sample && !p.placeholder)
}

/** The week as opening-hours rows, days with the same hours sharing a row. Closed days are left out. */
function openingHours(): Node[] {
  const rows = new Map<string, string[]>()
  for (const h of business.hours) {
    if (h.closed) continue
    const key = `${h.open}-${h.close}`
    rows.set(key, [...(rows.get(key) ?? []), SCHEMA_DAYS[h.day]])
  }
  return [...rows].map(([key, days]) => {
    const [opens, closes] = key.split('-')
    return { '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens, closes }
  })
}

/**
 * The business. The same facts on every page; the list of services it offers
 * only where the page has the services to hand (the home page), so no two
 * pages ever describe the catalog differently.
 */
function businessNode(services?: Service[]): Node {
  const a = business.address
  const node: Node = {
    '@type': 'AutoRepair',
    '@id': idFor('business'),
    name: business.name,
    description: business.description,
    url: `${origin()}/`,
    telephone: internationalPhone(),
    address: {
      '@type': 'PostalAddress',
      streetAddress: a.street,
      addressLocality: a.city,
      addressRegion: a.state,
      postalCode: a.postalCode,
      addressCountry: a.country,
    },
    openingHoursSpecification: openingHours(),
    // The shop's own town first: it is where "near me" searches start.
    areaServed: [...new Set([a.city, ...business.serviceAreas])].map((name) => ({ '@type': 'City', name })),
  }
  if (business.email) node.email = business.email

  // Only when Google gave us coordinates. A guessed point puts the shop in the
  // wrong place on every surface that trusts it.
  if (business.geo) {
    node.geo = { '@type': 'GeoCoordinates', latitude: business.geo.lat, longitude: business.geo.lng }
  }
  if (business.mapsUrl) node.hasMap = business.mapsUrl

  const images = shopImages()
  if (images.length > 0) node.image = images
  if (landingSpec.logo) node.logo = absolute(landingSpec.logo.src)

  if (services?.length) {
    node.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: landingSpec.services.title,
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', '@id': `${pageUrl(`/services/${s.slug}`)}#service`, name: s.name, url: pageUrl(`/services/${s.slug}`) },
      })),
    }
  }

  // Third parties vouching for the shop, in the vocabulary they belong to:
  // programs it is a member of, credentials it holds, awards it has won.
  const badges = business.badges.map((b) => resolveBadge(b))
  const members = badges.filter((b) => b.kind === 'membership')
  const credentials = badges.filter((b) => b.kind === 'certification')
  const awards = badges.filter((b) => b.kind === 'award')
  if (members.length) {
    node.memberOf = members.map((b) => ({ '@type': 'Organization', name: b.label, ...(b.url ? { url: b.url } : {}) }))
  }
  if (credentials.length) {
    node.hasCredential = credentials.map((b) => ({ '@type': 'EducationalOccupationalCredential', name: b.label }))
  }
  if (awards.length) node.award = awards.map((b) => b.label)

  if (business.owner) node.founder = { '@type': 'Person', name: business.owner.name, jobTitle: business.owner.role }
  if (business.yearEstablished) node.foundingDate = String(business.yearEstablished)

  // The shop's own profiles only: the template's sample links never reach a crawler.
  const sameAs = [business.mapsUrl, ...socialProfiles().map(([, url]) => url), ...badges.map((b) => b.url)].filter(Boolean)
  if (sameAs.length > 0) node.sameAs = [...new Set(sameAs)]

  return node
}

function websiteNode(): Node {
  return {
    '@type': 'WebSite',
    '@id': idFor('website'),
    url: `${origin()}/`,
    name: business.name,
    inLanguage: 'en-US',
    publisher: ref(idFor('business')),
  }
}

/** The page itself: part of the site, about the business, with its trail and what it is mainly about. */
function webPageNode(
  path: string,
  name: string,
  opts: { type?: string; description?: string; breadcrumb?: boolean; mainEntity?: string; image?: ResolvedPhoto | null } = {}
): Node {
  const url = pageUrl(path)
  return {
    '@type': opts.type ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    ...(opts.description ? { description: opts.description } : {}),
    inLanguage: 'en-US',
    isPartOf: ref(idFor('website')),
    about: ref(idFor('business')),
    ...(opts.breadcrumb ? { breadcrumb: ref(`${url}#breadcrumb`) } : {}),
    ...(opts.mainEntity ? { mainEntity: ref(opts.mainEntity) } : {}),
    ...(isRealPhoto(opts.image ?? null) ? { primaryImageOfPage: { '@type': 'ImageObject', url: absolute(opts.image!.src) } } : {}),
  }
}

/** The trail back to the home page, which Google shows in place of the raw URL. */
function breadcrumbNode(path: string, trail: [name: string, path: string][]): Node {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl(path)}#breadcrumb`,
    itemListElement: trail.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: pageUrl(p) })),
  }
}

/** Questions answered on a page, word for word as the page shows them. */
function faqNode(path: string, faqs: { q: string; a: string }[]): Node {
  const url = pageUrl(path)
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    isPartOf: ref(`${url}#webpage`),
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
}

const graph = (...nodes: Node[]) => ({ '@context': 'https://schema.org', '@graph': nodes })

/** The home page: the business with everything it offers, the site, the page and its questions. */
export function structuredData(content: { faqs?: { q: string; a: string }[]; services?: Service[] } = {}): Node {
  const faqs = content.faqs ?? landingSpec.faq.items
  return graph(
    businessNode(content.services),
    websiteNode(),
    webPageNode('/', pageTitle(), { description: landingSpec.seo.description, image: storefrontPhoto() }),
    ...(faqs.length ? [faqNode('/', faqs)] : [])
  )
}

/** A plain page (the policies): the business, the site, the page and its trail. */
export function webPageData(path: string, name: string): Node {
  return graph(
    businessNode(),
    websiteNode(),
    webPageNode(path, name, { breadcrumb: true }),
    breadcrumbNode(path, [
      ['Home', '/'],
      [name, path],
    ])
  )
}

/**
 * A list page (all services, all posts): the page, its trail and, when the
 * caller passes them, the items it lists in order.
 */
export function collectionPageData(path: string, name: string, items: { name: string; path: string }[] = []): Node {
  const url = pageUrl(path)
  return graph(
    businessNode(),
    websiteNode(),
    webPageNode(path, name, { type: 'CollectionPage', breadcrumb: true, ...(items.length ? { mainEntity: `${url}#list` } : {}) }),
    breadcrumbNode(path, [
      ['Home', '/'],
      [name, path],
    ]),
    ...(items.length
      ? [
          {
            '@type': 'ItemList',
            '@id': `${url}#list`,
            itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, url: pageUrl(item.path) })),
          },
        ]
      : [])
  )
}

/**
 * One service's page: the service, offered by the business in its towns, and
 * that service's own questions. This is the page that ranks for "brake repair
 * near me", so it names who provides the service and where.
 */
export function servicePageData(service: Service, faqs: FaqItem[] | { q: string; a: string }[]): Node {
  const path = `/services/${service.slug}`
  const url = pageUrl(path)
  const description = service.description ?? service.summary
  return graph(
    businessNode(),
    websiteNode(),
    webPageNode(path, `${service.name} in ${town()}`, { breadcrumb: true, mainEntity: `${url}#service`, image: service.photo }),
    {
      '@type': 'Service',
      '@id': `${url}#service`,
      name: service.name,
      serviceType: service.name,
      url,
      ...(description ? { description } : {}),
      provider: ref(idFor('business')),
      areaServed: [...new Set([business.address.city, ...business.serviceAreas])].map((name) => ({ '@type': 'City', name })),
      ...(isRealPhoto(service.photo) ? { image: absolute(service.photo.src) } : {}),
    },
    breadcrumbNode(path, [
      ['Home', '/'],
      [landingSpec.services.title, '/services'],
      [service.name, path],
    ]),
    ...(faqs.length ? [faqNode(path, faqs)] : [])
  )
}

/** A post: written by the shop, dated, and tied to the service it is about. */
export function articlePageData(article: Article): Node {
  const path = `/blog/${article.slug}`
  const url = pageUrl(path)
  return graph(
    businessNode(),
    websiteNode(),
    webPageNode(path, article.title, { breadcrumb: true, mainEntity: `${url}#post`, image: article.photo }),
    {
      '@type': 'BlogPosting',
      '@id': `${url}#post`,
      headline: article.title,
      url,
      mainEntityOfPage: ref(`${url}#webpage`),
      inLanguage: 'en-US',
      ...(article.excerpt ? { description: article.excerpt } : {}),
      // The date it went up is the last date we know it changed.
      ...(article.publishedAt ? { datePublished: article.publishedAt, dateModified: article.publishedAt } : {}),
      author: ref(idFor('business')),
      publisher: ref(idFor('business')),
      ...(isRealPhoto(article.photo) ? { image: absolute(article.photo.src) } : {}),
      // The service's own page defines it; this names it and where to find it.
      ...(article.service
        ? { about: { '@type': 'Service', '@id': `${pageUrl(`/services/${article.service}`)}#service`, url: pageUrl(`/services/${article.service}`) } }
        : {}),
    },
    breadcrumbNode(path, [
      ['Home', '/'],
      [landingSpec.blog.title, '/blog'],
      [article.title, path],
    ])
  )
}

/**
 * A plain-language brief for AI answer engines, in the llms.txt format: the
 * name, a one-line summary, then sections of facts and links.
 *
 * Served at /llms.txt. Crawlers that build answers work from prose, not from
 * markup, and they weight a short factual page far above a marketing one. The
 * job here is to state the answerable facts — who, where, when open, what they
 * fix, how to book — in the fewest words that could be quoted back verbatim.
 */
export function llmsTxt(
  content: {
    services?: Service[]
    /** The shop's general questions: the ones on the home page. */
    faqs?: { q: string; a: string }[]
    /** Each service's questions, as its page shows them, keyed by slug. */
    serviceFaqs?: Record<string, { q: string; a: string }[]>
    articles?: Article[]
  } = {}
): string {
  const a = business.address
  const hours = business.hours
    .slice()
    .sort((x, y) => ((x.day + 6) % 7) - ((y.day + 6) % 7))
    .map((h) => (h.closed ? `- ${dayName(h.day)}: closed` : `- ${dayName(h.day)}: ${formatTime(h.open)} to ${formatTime(h.close)}`))

  const lines = [
    `# ${business.name}`,
    '',
    `> ${business.category} in ${town()}. ${business.description}`,
    '',
    '## Facts',
    `- Address: ${a.street}, ${a.city}, ${a.state} ${a.postalCode}`,
    `- Phone: ${business.phone}`,
    ...(business.email ? [`- Email: ${business.email}`] : []),
    `- Website: ${origin()}/`,
  ]

  if (business.yearEstablished) lines.push(`- Serving ${a.city} since ${business.yearEstablished}`)
  if (business.owner) lines.push(`- ${business.owner.role}: ${business.owner.name}`)
  if (business.rating && business.rating.count > 0) {
    lines.push(`- Google rating: ${business.rating.value} from ${business.rating.count} reviews`)
  }
  if (business.warranty) {
    lines.push(
      `- Warranty: ${business.warranty.months} months / ${business.warranty.miles.toLocaleString('en-US')} miles on qualifying parts and labor`
    )
  }
  if (business.serviceAreas.length) lines.push(`- Also serves: ${business.serviceAreas.join(', ')}`)
  if (business.mapsUrl) lines.push(`- Google Maps: ${business.mapsUrl}`)

  const services = content.services?.length
    ? content.services.map((s) => `- [${s.name}](${pageUrl(`/services/${s.slug}`)}): ${s.summary}`)
    : business.services.map((s) => `- ${s}`)
  lines.push('', '## Hours', ...hours, '', '## Services', ...services)

  if (business.amenities.length) {
    lines.push('', '## Amenities', ...business.amenities.map((s) => `- ${s}`))
  }
  if (business.badges.length) {
    lines.push(
      '',
      '## Certifications and memberships',
      ...business.badges.map((b) => {
        const r = resolveBadge(b)
        return `- ${r.label}: ${r.detail}${r.url ? ` (${r.url})` : ''}`
      })
    )
  }

  // The shop's own answers, word for word: the lines an answer engine is most likely to quote.
  const faqs = content.faqs ?? []
  if (faqs.length) {
    lines.push('', '## Questions')
    for (const f of faqs) lines.push('', `### ${f.q}`, f.a)
  }
  for (const s of content.services ?? []) {
    const own = content.serviceFaqs?.[s.slug] ?? []
    if (!own.length) continue
    lines.push('', `## ${s.name}: questions`)
    for (const f of own) lines.push('', `### ${f.q}`, f.a)
  }

  const articles = content.articles ?? []
  if (articles.length) {
    lines.push('', '## Recent jobs', ...articles.slice(0, 10).map((p) => `- [${p.title}](${pageUrl(`/blog/${p.slug}`)})`))
  }

  lines.push(
    '',
    '## Booking',
    `Call ${business.phone}, or book online at ${origin()}/book. A written estimate comes before any work starts.`,
    '',
    '## Pages',
    `- [Services](${pageUrl('/services')})`,
    ...(articles.length ? [`- [${landingSpec.blog.title}](${pageUrl('/blog')})`] : []),
    `- [Privacy Policy](${pageUrl('/privacy')})`,
    `- [Terms](${pageUrl('/terms')})`,
    '',
    '## Optional',
    `- [Everything on this site in one file](${origin()}/llms-full.txt): every service page, the specials and the posts in full`
  )

  return lines.join('\n') + '\n'
}
