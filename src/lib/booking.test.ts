import { describe, expect, it } from 'vitest'
import { bookingExternalId, promotedAnswers, validateBooking, leadTracking } from './booking'

describe('validateBooking', () => {
  it('accepts a name and a phone number, which is all a shop needs to call back', () => {
    expect(validateBooking({ name: 'Maria', phone: '(216) 555-0148' })).toEqual({
      ok: true,
      name: 'Maria',
      phone: '(216) 555-0148',
      phoneDigits: '2165550148',
      email: undefined,
    })
  })

  it('keeps an email when one is given, but never requires it', () => {
    const r = validateBooking({ name: 'Maria', phone: '2165550148', email: ' maria@example.com ' })
    expect(r.ok && r.email).toBe('maria@example.com')
  })

  it('says exactly what is missing', () => {
    expect(validateBooking({ phone: '2165550148' })).toEqual({ ok: false, error: 'Add your name so the shop knows who to ask for.' })
    expect(validateBooking({ name: 'Maria' })).toEqual({ ok: false, error: 'Add a 10-digit phone number so the shop can call you back.' })
    expect(validateBooking({ name: 'Maria', phone: '555-01' })).toEqual({
      ok: false,
      error: 'Add a 10-digit phone number so the shop can call you back.',
    })
  })

  it('accepts a leading country code', () => {
    const r = validateBooking({ name: 'Maria', phone: '+1 216 555 0148' })
    expect(r.ok && r.phoneDigits).toBe('2165550148')
  })
})

describe('bookingExternalId', () => {
  it('is one record per phone per day: a double tap merges, a return visit next week does not', () => {
    const monday = new Date('2026-09-14T15:00:00Z')
    const later = new Date('2026-09-14T21:30:00Z')
    const nextWeek = new Date('2026-09-21T15:00:00Z')
    expect(bookingExternalId('2165550148', monday)).toBe(bookingExternalId('2165550148', later))
    expect(bookingExternalId('2165550148', monday)).not.toBe(bookingExternalId('2165550148', nextWeek))
    expect(bookingExternalId('2165550148', monday)).toBe('booking:2165550148:2026-09-14')
  })
})

describe('promotedAnswers', () => {
  it('lifts the answers a shop filters and texts on into real fields', () => {
    expect(promotedAnswers({ issue: 'brakes', timing: 'today' })).toEqual({ issue: 'brakes', timing: 'today' })
  })

  it('keeps what the customer wrote under Other, tidied and kept to a sensible length', () => {
    expect(promotedAnswers({ issue: 'other', issue_details: '  smells like burning   when I brake ' })).toEqual({
      issue: 'other',
      details: 'smells like burning when I brake',
    })
    expect(promotedAnswers({ issue: 'other', issue_details: 'x'.repeat(900) }).details).toHaveLength(500)
  })

  it('drops an empty note rather than saving a blank field', () => {
    expect(promotedAnswers({ issue: 'other', issue_details: '   ' })).toEqual({ issue: 'other' })
  })

  it('ignores anything that is not text', () => {
    expect(promotedAnswers({ issue: ['brakes'], timing: 3, issue_details: { a: 1 } })).toEqual({})
  })
})

describe('leadTracking', () => {
  const visitor = '3f2b8c1e-9a4d-4b7e-8c2f-1a2b3c4d5e6f'

  it('carries the browser’s event id to Sapt unchanged, so the Pixel and the server Lead match', () => {
    const t = leadTracking({ leadEventId: 'evt-123', visitorId: visitor, referer: 'https://shop.example/services/brakes?utm_source=fb', userAgent: 'UA' })
    expect(t).toEqual({
      lead: { kind: 'lead', eventId: 'evt-123' },
      visitorId: visitor,
      // Query strings stay off: the page is enough, and a click id is not Sapt's to keep here.
      sourceUrl: 'https://shop.example/services/brakes',
      clientUserAgent: 'UA',
    })
  })

  it('mints an id when the browser sent none, so Sapt always has one', () => {
    expect(leadTracking({ mint: () => 'fresh' }).lead).toEqual({ kind: 'lead', eventId: 'fresh' })
    expect(leadTracking({ leadEventId: '   ', mint: () => 'fresh' }).lead.eventId).toBe('fresh')
  })

  it('leaves off anything Sapt would reject the whole booking for', () => {
    const t = leadTracking({ leadEventId: 'e', visitorId: 'not-a-uuid', referer: 'javascript:alert(1)', userAgent: '  ' })
    expect(t).toEqual({ lead: { kind: 'lead', eventId: 'e' } })
  })
})
