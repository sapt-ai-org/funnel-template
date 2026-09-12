import { describe, expect, it } from 'vitest'
import { business } from '@/config/business'
import { landingSpec } from '@/config/funnel'
import type { Article, Service } from './cms'
import {
  articlePageData,
  collectionPageData,
  internationalPhone,
  llmsTxt,
  pageTitle,
  servicePageData,
  structuredData,
  webPageData,
} from './schema'

type Node = Record<string, unknown> & { '@type': string | string[]; '@id'?: string }

const service: Service = {
  slug: 'brakes-and-rotors',
  name: 'Brakes and rotors',
  summary: 'Pads, rotors, calipers and fluid.',
  description: null,
  photo: null,
}
const article: Article = {
  slug: 'a-civic-that-squealed',
  title: 'A Civic that squealed',
  excerpt: 'It squealed.',
  category: 'Job story',
  service: 'brakes-and-rotors',
  vehicle: '2015 Honda Civic',
  photo: null,
  sections: [],
  publishedAt: '2026-09-01T12:00:00.000Z',
  seoTitle: null,
  seoDescription: null,
}

const pages: Record<string, Record<string, unknown>> = {
  home: structuredData({ services: [service] }),
  services: collectionPageData('/services', landingSpec.services.title, [{ name: service.name, path: `/services/${service.slug}` }]),
  blog: collectionPageData('/blog', landingSpec.blog.title),
  service: servicePageData(service, [{ q: 'Q?', a: 'A.', service: service.slug }]),
  post: articlePageData(article),
  policy: webPageData('/privacy', 'Privacy Policy'),
}

const graphOf = (data: Record<string, unknown>) => data['@graph'] as Node[]
const node = (data: Record<string, unknown>, type: string) => graphOf(data).find((n) => n['@type'] === type) as Node

/** Every `{ "@id": … }` that is only a pointer, anywhere in the graph. */
function pointers(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((v) => pointers(v, out))
  else if (value && typeof value === 'object') {
    const keys = Object.keys(value)
    if (keys.length === 1 && keys[0] === '@id') out.push((value as { '@id': string })['@id'])
    else Object.values(value).forEach((v) => pointers(v, out))
  }
  return out
}

describe('structured data, on every kind of page', () => {
  for (const [name, data] of Object.entries(pages)) {
    it(`${name}: parses, and every pointer lands on a node in the same graph`, () => {
      expect(JSON.parse(JSON.stringify(data))).toEqual(data)
      const ids = graphOf(data).map((n) => n['@id'])
      expect(ids.every(Boolean), 'every top-level node has an @id').toBe(true)
      expect(new Set(ids).size, 'no @id twice').toBe(ids.length)
      for (const id of pointers(data)) expect(ids, `dangling ${id}`).toContain(id)
    })

    it(`${name}: says who the site belongs to, and what page this is`, () => {
      const types = graphOf(data).map((n) => n['@type'])
      expect(types).toEqual(expect.arrayContaining(['AutoRepair', 'WebSite']))
      expect(types.some((t) => t === 'WebPage' || t === 'CollectionPage')).toBe(true)
    })
  }

  it('links the business, the site, the page and its questions on the home page', () => {
    const home = pages.home
    const businessId = node(home, 'AutoRepair')['@id']
    expect(businessId).toBe(`${business.siteUrl}/#business`)
    expect(node(home, 'WebSite').publisher).toEqual({ '@id': businessId })
    expect(node(home, 'WebPage').about).toEqual({ '@id': businessId })
    expect(node(home, 'FAQPage').isPartOf).toEqual({ '@id': node(home, 'WebPage')['@id'] })
  })

  it('states name and address exactly as the listing does, and the phone with its country code', () => {
    const b = node(pages.home, 'AutoRepair')
    expect(b.name).toBe(business.name)
    expect(b.telephone).toBe(internationalPhone(business.phone))
    expect(b.telephone).toMatch(/^\+1-\d{3}-\d{3}-\d{4}$/)
    expect((b.address as Record<string, string>).postalCode).toBe(business.address.postalCode)
  })

  it('writes every business node the same way, apart from the catalog only the home page has', () => {
    const strip = (n: Node) => Object.fromEntries(Object.entries(n).filter(([k]) => k !== 'hasOfferCatalog'))
    const home = strip(node(pages.home, 'AutoRepair'))
    for (const data of Object.values(pages)) expect(strip(node(data, 'AutoRepair'))).toEqual(home)
    const offers = (node(pages.home, 'AutoRepair').hasOfferCatalog as { itemListElement: { itemOffered: { url: string } }[] })
      .itemListElement
    expect(offers[0].itemOffered.url).toBe(`${business.siteUrl}/services/${service.slug}`)
  })

  it('never marks up a rating or reviews on the shop itself, which Google treats as self-serving', () => {
    for (const data of Object.values(pages)) {
      const b = node(data, 'AutoRepair')
      expect(b).not.toHaveProperty('aggregateRating')
      expect(b).not.toHaveProperty('review')
    }
  })

  it('groups days that share hours, and leaves closed days out', () => {
    const rows = node(pages.home, 'AutoRepair').openingHoursSpecification as { dayOfWeek: string[]; opens: string }[]
    const days = rows.flatMap((r) => r.dayOfWeek)
    expect(new Set(days).size).toBe(days.length)
    const closed = business.hours.filter((h) => h.closed).length
    expect(days.length).toBe(business.hours.length - closed)
  })

  it('never offers a sample photo as the shop', () => {
    for (const data of Object.values(pages)) {
      expect(JSON.stringify(data)).not.toContain('/samples/')
    }
  })

  it('says who vouches for the shop: memberships, credentials, awards', () => {
    const b = node(pages.home, 'AutoRepair')
    expect((b.memberOf as { name: string }[]).map((m) => m.name)).toContain('AAA Approved Auto Repair')
    expect((b.hasCredential as { name: string }[]).map((c) => c.name)).toContain('ASE Certified')
  })

  it('answers every home FAQ, word for word', () => {
    const faq = node(structuredData(), 'FAQPage').mainEntity as { name: string; acceptedAnswer: { text: string } }[]
    expect(faq).toHaveLength(landingSpec.faq.items.length)
    expect(faq[0]).toMatchObject({ name: landingSpec.faq.items[0].q, acceptedAnswer: { text: landingSpec.faq.items[0].a } })
  })

  it('gives a service page its service, trail and questions, all hanging off the page', () => {
    const page = node(pages.service, 'WebPage')
    const svc = node(pages.service, 'Service')
    expect(page.mainEntity).toEqual({ '@id': svc['@id'] })
    expect(svc.provider).toEqual({ '@id': `${business.siteUrl}/#business` })
    const trail = node(pages.service, 'BreadcrumbList').itemListElement as { item: string }[]
    expect(trail.map((t) => t.item)).toEqual([
      `${business.siteUrl}/`,
      `${business.siteUrl}/services`,
      `${business.siteUrl}/services/${service.slug}`,
    ])
  })

  it('dates a post and names the service it is about', () => {
    const post = node(pages.post, 'BlogPosting')
    expect(post.datePublished).toBe(article.publishedAt)
    expect(post.dateModified).toBe(article.publishedAt)
    expect((post.about as { url: string }).url).toBe(`${business.siteUrl}/services/${service.slug}`)
  })

  it('lists what a collection page lists, in order', () => {
    const list = node(pages.services, 'ItemList').itemListElement as { position: number; url: string }[]
    expect(list[0]).toMatchObject({ position: 1, url: `${business.siteUrl}/services/${service.slug}` })
  })
})

describe('pageTitle', () => {
  it('names the shop, what it is and where, within what a results page shows', () => {
    expect(pageTitle()).toContain(business.name)
    expect(pageTitle().length).toBeLessThanOrEqual(60)
  })
})

describe('internationalPhone', () => {
  it('adds the country code to a US number however it was written', () => {
    expect(internationalPhone('(216) 555-0148')).toBe('+1-216-555-0148')
    expect(internationalPhone('1-216-555-0148')).toBe('+1-216-555-0148')
    expect(internationalPhone('216.555.0148')).toBe('+1-216-555-0148')
  })
})

describe('llmsTxt', () => {
  const text = llmsTxt({
    services: [service],
    faqs: landingSpec.faq.items,
    serviceFaqs: { [service.slug]: [{ q: 'Do I need new rotors every time?', a: 'No.' }] },
    articles: [article],
  })

  it('opens with the name and a one-line summary, the llms.txt shape', () => {
    expect(text.startsWith(`# ${business.name}\n\n> `)).toBe(true)
  })

  it('links each service to its page and carries the questions each page answers', () => {
    expect(text).toContain(`[${service.name}](${business.siteUrl}/services/${service.slug})`)
    expect(text).toContain(`### ${landingSpec.faq.items[0].q}`)
    expect(text).toContain('## Brakes and rotors: questions')
    expect(text).toContain('### Do I need new rotors every time?')
  })

  it('writes hours the way the site does, Monday first', () => {
    const hours = text.slice(text.indexOf('## Hours'), text.indexOf('## Services'))
    expect(hours.split('\n')[1]).toMatch(/^- Monday: /)
    expect(hours).toMatch(/AM|PM|closed/)
  })
})
