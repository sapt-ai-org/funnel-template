import { describe, expect, it } from 'vitest'
import { DESCRIPTION_MAX, TITLE_MAX, fitDescription, fitTitle, joinFit, listFit, pageMetadata } from './seo'

describe('fitTitle', () => {
  it('adds the shop’s name when it fits', () => {
    expect(fitTitle('Brakes in Akron, OH', 'Smith Auto')).toBe('Brakes in Akron, OH | Smith Auto')
  })

  it('drops the name, never the words that match the search, when the line would be cut', () => {
    const primary = 'Check engine diagnostics in Cleveland Heights, OH'
    expect(fitTitle(primary, 'Northside Tire, Brake & Alignment Center')).toBe(primary)
  })

  it('does not repeat a name the title already has', () => {
    expect(fitTitle('Smith Auto | Auto repair', 'Smith Auto')).toBe('Smith Auto | Auto repair')
  })

  it('keeps what fits within the limit', () => {
    expect(fitTitle('Oil and filter in Akron, OH', 'Smith Auto').length).toBeLessThanOrEqual(TITLE_MAX)
  })
})

describe('fitDescription', () => {
  it('leaves a short description alone', () => {
    expect(fitDescription('Brakes, done right.')).toBe('Brakes, done right.')
  })

  it('cuts a long one at a word, with an ellipsis, inside the limit', () => {
    const out = fitDescription('word '.repeat(60))
    expect(out.length).toBeLessThanOrEqual(DESCRIPTION_MAX)
    expect(out.endsWith('word…')).toBe(true)
  })
})

describe('joinFit', () => {
  it('adds a later sentence only whole', () => {
    const lead = 'A'.repeat(140) + '.'
    expect(joinFit(lead, 'Call (216) 555-0148 or book online.')).toBe(lead)
    expect(joinFit('Brakes.', 'Smith Auto, Akron, OH.')).toBe('Brakes. Smith Auto, Akron, OH.')
  })
})

describe('listFit', () => {
  it('lists every name when they fit, joined as a sentence', () => {
    expect(listFit('Smith Auto: ', ['Brakes', 'Tires', 'Oil'])).toBe('Smith Auto: Brakes, Tires and Oil.')
  })

  it('stops at a whole name and says there is more', () => {
    const names = Array.from({ length: 20 }, (_, i) => `Service number ${i + 1}`)
    const out = listFit('Smith Auto: ', names)
    expect(out.length).toBeLessThanOrEqual(DESCRIPTION_MAX)
    // A whole name before "and more", never half of one.
    expect(out).toMatch(/, Service number \d+ and more\.$/)
  })
})

describe('pageMetadata', () => {
  const meta = pageMetadata({ title: 'Brakes | Smith Auto', description: 'Brakes.', path: '/services/brakes' })

  it('gives the page its own canonical, and repeats title and URL on both share cards', () => {
    expect(meta.alternates?.canonical).toBe('/services/brakes')
    expect(meta.openGraph).toMatchObject({ url: '/services/brakes', title: 'Brakes | Smith Auto', type: 'website' })
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image', title: 'Brakes | Smith Auto' })
  })

  it('always names a share image with its size and alt text', () => {
    const [image] = meta.openGraph?.images as { url: string; width: number; height: number; alt: string }[]
    expect(image).toMatchObject({ url: '/opengraph-image', width: 1200, height: 630 })
    expect(image.alt).toBeTruthy()
  })

  it('never lets a layout template wrap the title twice', () => {
    expect(meta.title).toEqual({ absolute: 'Brakes | Smith Auto' })
  })
})
