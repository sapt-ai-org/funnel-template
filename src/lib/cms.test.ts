import { describe, expect, it } from 'vitest'
import { landingSpec } from '@/config/funnel'
import { homeFaqs, parseSections, slugify, toArticle, toFaq, toService, toSpecial } from './cms'
import type { CMSContentItem } from './sapt-server'

const item = (over: Partial<CMSContentItem> & { content: Record<string, unknown> }): CMSContentItem => ({
  id: 'id',
  slug: 'slug',
  name: 'Name',
  status: 'published',
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
  ...over,
})

describe('slugify', () => {
  it('turns a Google service name into the slug the Sapt template uses', () => {
    expect(slugify('Heating and A/C')).toBe('heating-and-ac')
    expect(slugify('Pre-purchase inspection')).toBe('pre-purchase-inspection')
    expect(slugify('Brakes & rotors')).toBe('brakes-and-rotors')
  })
})

describe('toFaq', () => {
  it('never shows a question that has no answer yet', () => {
    expect(toFaq(item({ content: { question: 'How long?', answer: '' } }))).toBeNull()
  })

  it('keeps the service a question belongs to, and reads an empty one as the whole shop', () => {
    expect(toFaq(item({ content: { question: 'Q?', answer: 'A.', service: 'brakes-and-rotors' } }))).toEqual({
      q: 'Q?',
      a: 'A.',
      service: 'brakes-and-rotors',
    })
    expect(toFaq(item({ content: { question: 'Q?', answer: 'A.', service: '' } }))?.service).toBeNull()
  })
})

describe('toSpecial', () => {
  it('is good through the whole of its last day, then disappears', () => {
    const offer = item({ content: { title: '$20 off brakes', ends: '2026-01-31' } })
    expect(toSpecial(offer, new Date('2026-01-31T18:00:00'))).not.toBeNull()
    expect(toSpecial(offer, new Date('2026-02-01T09:00:00'))).toBeNull()
  })
})

describe('toService', () => {
  it('uses the photo from Sapt, and marks a stock photo as a sample so it is never passed off as the shop', () => {
    const service = toService(
      item({
        slug: 'brakes-and-rotors',
        name: 'Brakes and rotors',
        content: { summary: 'Pads and rotors.', image: { kind: 'url', url: 'https://images.unsplash.com/photo-1?w=1200' } },
      })
    )
    expect(service.summary).toBe('Pads and rotors.')
    expect(service.photo?.src).toContain('images.unsplash.com')
    expect(service.photo?.sample).toBe(true)
  })

  it('gives a published service with no summary the default line, so no service page is blank', () => {
    const service = toService(item({ slug: 'pre-purchase-inspection', name: 'Pre-purchase inspection', content: {} }))
    expect(service.summary).toMatch(/used car/i)
  })

  it('treats a photo the shop uploaded as its own', () => {
    const service = toService(
      item({ name: 'Oil and filter', content: { image: { kind: 'r2', url: 'https://assets.sapt.ai/p/cms/oil.jpg' } } })
    )
    expect(service.photo?.sample).toBe(false)
  })
})

describe('parseSections', () => {
  it('reads the JSON string Sapt stores and skips what it cannot render', () => {
    const raw = JSON.stringify({
      sections: [
        { type: 'paragraph', text: 'Grinding for two weeks.' },
        { type: 'heading', text: 'What we found', level: 'h3' },
        { type: 'list', items: ['New caliper', ''], list_type: 'ol' },
        { type: 'chart', chartId: 'c1' },
      ],
    })
    expect(parseSections(raw)).toEqual([
      { type: 'paragraph', text: 'Grinding for two weeks.' },
      { type: 'heading', text: 'What we found', level: 'h3' },
      { type: 'list', items: ['New caliper'], ordered: true },
    ])
  })

  it('shows a body that is not JSON as a single paragraph instead of losing it', () => {
    expect(parseSections('Plain words.')).toEqual([{ type: 'paragraph', text: 'Plain words.' }])
  })
})

describe('toArticle', () => {
  it('carries the date it was published, for ordering and the page', () => {
    const post = toArticle(
      item({ publishedAt: '2026-09-02T10:00:00Z', content: { title: 'Seized caliper on an F-150', content: '{"sections":[]}' } })
    )
    expect(post?.publishedAt).toBe('2026-09-02T10:00:00Z')
    expect(post?.title).toBe('Seized caliper on an F-150')
  })
})

describe('homeFaqs', () => {
  it("shows the shop's own general questions, not the ones that belong to one service", () => {
    const faqs = [
      { q: 'Do you take walk-ins?', a: 'Yes.', service: null },
      { q: 'Do I need new rotors?', a: 'Not always.', service: 'brakes-and-rotors' },
    ]
    expect(homeFaqs(faqs)).toEqual([faqs[0]])
  })

  it('falls back to the template questions until the shop publishes its own', () => {
    expect(homeFaqs([])).toEqual(landingSpec.faq.items)
  })
})
