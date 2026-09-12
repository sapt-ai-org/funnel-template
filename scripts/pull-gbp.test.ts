import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { business } from '../src/config/business'
import { SLOTS } from '../src/lib/images'
import {
  assignPhotoSlots,
  parseEnvFile,
  photoAlt,
  pickReviews,
  type GbpReview,
  replaceRegion,
  toBusinessHours,
  tsLiteral,
  type PhotoCandidate,
} from './pull-gbp'

describe('parseEnvFile', () => {
  it('skips comments and blank lines', () => {
    expect(parseEnvFile('# a note\n\nKEY=value\n')).toEqual({ KEY: 'value' })
  })

  it('strips surrounding quotes', () => {
    expect(parseEnvFile('A="one"\nB=\'two\'')).toEqual({ A: 'one', B: 'two' })
  })

  it('keeps equals signs inside the value', () => {
    expect(parseEnvFile('KEY=a=b=c')).toEqual({ KEY: 'a=b=c' })
  })
})

const time = (hours: number, minutes = 0) => ({ hours, minutes })

describe('toBusinessHours', () => {
  it('returns all seven days in order, starting at Sunday', () => {
    const days = toBusinessHours([])
    expect(days.map((d) => d.day)).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('marks a day with no period closed rather than omitting it', () => {
    const days = toBusinessHours([
      {
        openDay: 'MONDAY',
        closeDay: 'MONDAY',
        openTime: time(8),
        closeTime: time(18),
      },
    ])
    expect(days[1]).toEqual({ day: 1, open: '08:00', close: '18:00' })
    expect(days[0].closed).toBe(true)
    expect(days[6].closed).toBe(true)
  })

  it('collapses a split day to its earliest open and latest close', () => {
    const days = toBusinessHours([
      { openDay: 'TUESDAY', closeDay: 'TUESDAY', openTime: time(8), closeTime: time(12) },
      { openDay: 'TUESDAY', closeDay: 'TUESDAY', openTime: time(13), closeTime: time(17, 30) },
    ])
    expect(days[2]).toEqual({ day: 2, open: '08:00', close: '17:30' })
  })

  it('clamps an overnight close to the end of the same day', () => {
    const days = toBusinessHours([
      { openDay: 'FRIDAY', closeDay: 'SATURDAY', openTime: time(18), closeTime: time(2) },
    ])
    expect(days[5]).toEqual({ day: 5, open: '18:00', close: '23:59' })
  })

  it('pads a proto3-omitted zero into HH:MM', () => {
    const days = toBusinessHours([
      { openDay: 'WEDNESDAY', closeDay: 'WEDNESDAY', openTime: time(9), closeTime: time(17) },
    ])
    expect(days[3].open).toBe('09:00')
  })
})

const photo = (category: string, url: string): PhotoCandidate => ({ category, url })

describe('assignPhotoSlots', () => {
  it('puts the cover photo in the storefront slot', () => {
    const assigned = assignPhotoSlots([photo('COVER', 'a.jpg')])
    expect(assigned.find((a) => a.slot === 'storefront')?.url).toBe('a.jpg')
  })

  it('never uses the logo or the profile picture', () => {
    const assigned = assignPhotoSlots([photo('LOGO', 'logo.png'), photo('PROFILE', 'p.jpg')])
    expect(assigned).toEqual([])
  })

  it('never guesses at the owner portrait', () => {
    const assigned = assignPhotoSlots([
      photo('TEAM', 't.jpg'),
      photo('INTERIOR', 'i.jpg'),
      photo('EXTERIOR', 'e.jpg'),
    ])
    expect(assigned.some((a) => a.slot === 'owner')).toBe(false)
  })

  it('uses each photo at most once', () => {
    const assigned = assignPhotoSlots([photo('EXTERIOR', 'only.jpg')])
    expect(assigned.map((a) => a.url)).toEqual(['only.jpg'])
  })

  it('backfills leftover photos into the gallery', () => {
    const assigned = assignPhotoSlots([
      photo('COVER', '1.jpg'),
      photo('ADDITIONAL', '2.jpg'),
      photo('ADDITIONAL', '3.jpg'),
      photo('ADDITIONAL', '4.jpg'),
      photo('ADDITIONAL', '5.jpg'),
    ])
    expect(new Set(assigned.map((a) => a.url)).size).toBe(assigned.length)
    expect(assigned.filter((a) => a.slot.startsWith('gallery')).length).toBeGreaterThan(0)
  })

  it('leaves every slot empty when the profile has no photos', () => {
    expect(assignPhotoSlots([])).toEqual([])
  })
})

describe('tsLiteral', () => {
  it('quotes strings with single quotes and escapes them', () => {
    expect(tsLiteral("Ben's Auto")).toBe("'Ben\\'s Auto'")
  })

  it('omits keys whose value is undefined', () => {
    expect(tsLiteral({ a: 1, b: undefined })).toBe('{\n  a: 1,\n}')
  })

  it('keeps null, which means "no value" rather than "not set"', () => {
    expect(tsLiteral({ rating: null })).toBe('{\n  rating: null,\n}')
  })

  it('collapses empty collections onto one line', () => {
    expect(tsLiteral({ a: [], b: {} })).toBe('{\n  a: [],\n  b: {},\n}')
  })

  it('indents nested structures', () => {
    expect(tsLiteral({ hours: [{ day: 1 }] })).toBe(
      '{\n  hours: [\n    {\n      day: 1,\n    },\n  ],\n}'
    )
  })

  it('quotes keys that are not identifiers', () => {
    expect(tsLiteral({ 'a-b': 1 })).toBe("{\n  'a-b': 1,\n}")
  })
})

describe('replaceRegion', () => {
  const source = 'before\n// pull-gbp:begin business\nold\n// pull-gbp:end business\nafter\n'

  it('replaces only what sits between the markers', () => {
    expect(replaceRegion(source, 'business', 'new')).toBe(
      'before\n// pull-gbp:begin business\nnew\n// pull-gbp:end business\nafter\n'
    )
  })

  it('refuses to guess when a marker is missing', () => {
    expect(() => replaceRegion('no markers here', 'business', 'new')).toThrow(/missing/)
  })

  it('refuses when the markers are out of order', () => {
    const backwards = '// pull-gbp:end business\n// pull-gbp:begin business\n'
    expect(() => replaceRegion(backwards, 'business', 'new')).toThrow(/out of order/)
  })
})

describe('the generated business block', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'src/config/business.ts'), 'utf8')

  const pulled = {
    ...business,
    name: "Torres' Auto & Tire",
    phone: '(216) 226-4090',
    address: {
      street: '11801 Detroit Ave',
      city: 'Lakewood',
      state: 'OH',
      postalCode: '44107',
      country: 'US',
    },
    hours: toBusinessHours([
      { openDay: 'MONDAY', closeDay: 'MONDAY', openTime: { hours: 8, minutes: 0 }, closeTime: { hours: 18, minutes: 0 } },
    ]),
    rating: { value: 4.9, count: 187 },
    reviewUrl: 'https://g.page/r/CX_example/review',
    placeId: 'ChIJexample',
  }

  it('is parseable and identical to what was pulled', () => {
    const literal = tsLiteral(pulled)
    const roundTripped = new Function(`return (${literal})`)() as typeof pulled
    expect(roundTripped).toEqual(pulled)
  })

  it('leaves the rest of the module standing', () => {
    const written = replaceRegion(
      source,
      'business',
      `export const business: BusinessProfile = ${tsLiteral(pulled)}`
    )
    expect(written).toContain('export function isPlaceholder()')
    expect(written).toContain('export const reviewGate')
    expect(written).toContain("name: 'Torres\\' Auto & Tire'")
    expect(written).not.toContain('Demo Auto Repair')
  })

  it('turns a filled profile into a non-placeholder', () => {
    const written = replaceRegion(
      source,
      'business',
      `export const business: BusinessProfile = ${tsLiteral(pulled)}`
    )
    // isPlaceholder() reads these three, so a pull has to move all of them.
    expect(written).not.toContain("postalCode: '00000'")
    expect(written).not.toContain("reviewUrl: ''")
    expect(written).toContain("placeId: 'ChIJexample'")
  })
})

describe('the generated slots block', () => {
  it('leaves the placeholder machinery standing', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/lib/images.ts'), 'utf8')
    const slots = { ...SLOTS, storefront: { ...SLOTS.storefront, src: '/photos/storefront.jpg', alt: 'Shop front' } }
    const written = replaceRegion(
      source,
      'slots',
      `export const SLOTS: Record<SlotId, ImageSlot> = ${tsLiteral(slots)}`
    )
    expect(written).toContain('export function photo(')
    expect(written).toContain('export const PHOTO_PLAN')
    expect(written).toContain('export function missingSlots')
    expect(written).toContain("src: '/photos/storefront.jpg'")
    // Every slot keeps its brief, so an unfilled one still says what it needs.
    expect(written).toContain(`brief: '${SLOTS.owner.brief}'`)
  })
})

describe('pickReviews', () => {
  const review = (over: Partial<GbpReview> = {}): GbpReview => ({
    reviewer: { displayName: 'Maria Gonzalez' },
    starRating: 'FIVE',
    comment: 'Called me before doing anything and the price never moved. Car back the same day.',
    createTime: '2026-08-14T15:02:11Z',
    ...over,
  })

  it('shapes a review for a card: short name, number of stars, the month it was written', () => {
    expect(pickReviews([review()])).toEqual([
      {
        author: 'Maria G.',
        rating: 5,
        text: 'Called me before doing anything and the price never moved. Car back the same day.',
        date: '2026-08',
      },
    ])
  })

  it('keeps four and five stars; the page shows the true average separately', () => {
    const picked = pickReviews([
      review({ starRating: 'FIVE' }),
      review({ starRating: 'FOUR' }),
      review({ starRating: 'THREE' }),
      review({ starRating: 'ONE' }),
    ])
    expect(picked.map((r) => r.rating)).toEqual([5, 4])
  })

  it('skips what would read badly on a card', () => {
    const picked = pickReviews([
      review({ comment: undefined }),
      review({ comment: 'Great!' }),
      review({ reviewer: { displayName: 'A Google User', isAnonymous: true } }),
      review({ comment: '(Translated by Google) Very good service (Original) Muy buen servicio, rapido y honesto siempre' }),
      review({ comment: 'x'.repeat(600) }),
    ])
    expect(picked).toEqual([])
  })

  it('keeps a one-word name whole', () => {
    expect(pickReviews([review({ reviewer: { displayName: 'Dre' } })])[0].author).toBe('Dre')
  })

  it('stops at the limit, newest first as Google returns them', () => {
    const many = Array.from({ length: 20 }, (_, i) => review({ reviewer: { displayName: `Driver${i}` } }))
    const picked = pickReviews(many, 12)
    expect(picked).toHaveLength(12)
    expect(picked[0].author).toBe('Driver0')
  })
})

describe('photoAlt', () => {
  it('describes a photo by what Google says it shows, naming the shop', () => {
    expect(photoAlt('TEAM', "Torres' Auto")).toBe("The team at Torres' Auto")
    expect(photoAlt('INTERIOR', "Torres' Auto")).toBe("Inside Torres' Auto")
  })

  it('still says something true for a category it does not know', () => {
    expect(photoAlt('ADDITIONAL', "Torres' Auto")).toBe("At Torres' Auto")
  })
})
