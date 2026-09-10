import { describe, expect, it } from 'vitest'
import { business, isPlaceholder } from './business'
import { landingCopy, landingSpec } from './funnel'

/**
 * Template-only guard. A new client repo is a byte-for-byte copy of this repo
 * until an operator edits it, and this repo is PUBLIC — it has to be, or the
 * Cloudflare deploy button cannot clone it. So any real business detail left
 * in here is published twice over: once on github.com and again on whichever
 * client domain deploys next.
 *
 * `init-project.ts` deletes this file when a client repo is generated — a real
 * client's real phone number is not a leak once it is their own site.
 *
 * The assertions check the INTENT, not one literal string, so the demo content
 * can be realistic enough to look right without ever being real. NANP reserves
 * 555-0100 through 555-0199 for fiction; nothing in that range can ring a real
 * person.
 */

const FICTIONAL_PHONE = /\(\d{3}\)\s555-01\d{2}$|^\(000\) 000-0000$/
const PHONE_PATTERN = /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/

describe('template ships no real client data', () => {
  it('has no phone number in visitor-facing landing copy', () => {
    expect(landingCopy(landingSpec)).not.toMatch(PHONE_PATTERN)
  })

  it('uses a reserved fictional phone on the success screen', () => {
    expect(landingSpec.funnel.success.phone).toMatch(FICTIONAL_PHONE)
  })

  it('uses a reserved fictional phone on the business profile', () => {
    expect(business.phone).toMatch(FICTIONAL_PHONE)
  })

  it('ships an obviously fake brand name', () => {
    expect(landingSpec.brandName).toMatch(/^(Demo|Placeholder)\b/)
    expect(business.name).toMatch(/^(Demo|Placeholder)\b/)
  })

  it('ships no real street address', () => {
    expect(business.address.postalCode).toBe('00000')
    expect(business.address.street).toMatch(/placeholder/i)
  })

  it('reports itself as un-customised until an operator edits it', () => {
    // The setup checklist keys off this. If it ever returns false on a fresh
    // clone, a client will be told their site is ready when it is not.
    expect(isPlaceholder()).toBe(true)
  })

  it('carries no Google Business Profile identifiers', () => {
    // A place id or review link left here would point every deployed client
    // site at whichever business it was copied from.
    expect(business.placeId).toBe('')
    expect(business.reviewUrl).toBe('')
    expect(business.mapsUrl).toBe('')
  })
})
