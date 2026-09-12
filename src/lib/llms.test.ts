import { describe, expect, it } from 'vitest'
import { business } from '@/config/business'
import { landingSpec } from '@/config/funnel'
import { serviceCopy } from '@/config/services'
import type { Article, Service } from './cms'
import { llmsFullTxt } from './llms'

const service: Service = {
  slug: 'pre-purchase-inspection',
  name: 'Pre-purchase inspection',
  summary: 'A used car checked top to bottom before you buy it.',
  description: null,
  photo: null,
}

const post: Article = {
  slug: 'a-civic-that-squealed',
  title: 'A Civic that squealed',
  excerpt: 'Brakes at 60,000 miles.',
  category: 'Job story',
  service: 'brakes-and-rotors',
  vehicle: '2016 Honda Civic',
  photo: null,
  sections: [
    { type: 'heading', text: 'What we found', level: 'h2' },
    { type: 'paragraph', text: 'The pads were down to the wear indicator.' },
    { type: 'list', items: ['New pads', 'Rotors resurfaced'], ordered: false },
  ],
  publishedAt: '2026-09-01T12:00:00Z',
  seoTitle: null,
  seoDescription: null,
}

describe('llmsFullTxt', () => {
  const copy = serviceCopy(service.slug, service.name)
  const text = llmsFullTxt({
    services: [service],
    faqs: landingSpec.faq.items,
    serviceFaqs: { [service.slug]: copy.faqs },
    articles: [post],
    specials: [{ title: 'Brake inspection', detail: 'Included with any service.', terms: 'While this offer lasts.' }],
  })

  it('opens with the llms.txt index, so either file answers the basics', () => {
    expect(text.startsWith(`# ${business.name}\n\n> `)).toBe(true)
    expect(text).toContain('## Hours')
  })

  it('carries each service page in full: what it is, what the shop does, when to book, its questions', () => {
    expect(text).toContain(`## ${service.name}\nPage: ${business.siteUrl}/services/${service.slug}`)
    expect(text).toContain(`### ${landingSpec.servicePage.includesTitle}\n- ${copy.includes[0]}`)
    expect(text).toContain(`### ${landingSpec.servicePage.signsTitle}`)
    expect(text).toContain(`#### ${copy.faqs[0].q}\n${copy.faqs[0].a}`)
  })

  it('lists each service question once, under its service, not again in the index', () => {
    expect(text.split(`#### ${copy.faqs[0].q}`).length).toBe(2)
    expect(text).not.toContain(`## ${service.name}: questions`)
  })

  it('carries the repair promise, the specials and every post in full', () => {
    expect(text).toContain(`1. **${landingSpec.promise.steps[0].title}.**`)
    expect(text).toContain('### Brake inspection\nIncluded with any service.\nTerms: While this offer lasts.')
    expect(text).toContain('## A Civic that squealed')
    expect(text).toContain('### What we found')
    expect(text).toContain('- Rotors resurfaced')
  })
})
