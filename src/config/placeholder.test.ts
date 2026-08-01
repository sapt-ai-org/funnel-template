import { describe, expect, it } from 'vitest'
import { landingCopy, landingSpec } from './funnel'

/**
 * Template-only guard. A new client repo is a byte-for-byte copy of this repo
 * until an operator edits it, so any real business detail left in the spec goes
 * live on someone else's domain. `init-project.ts` deletes this file when a
 * client repo is generated — a real client's real phone number is not a leak.
 */

const PLACEHOLDER_PHONE = '(000) 000-0000'
const PHONE_PATTERN = /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/

describe('template ships no real client data', () => {
  it('has no phone number in visitor-facing copy', () => {
    expect(landingCopy(landingSpec)).not.toMatch(PHONE_PATTERN)
  })

  it('uses the sentinel phone on the success screen', () => {
    expect(landingSpec.funnel.success.phone).toBe(PLACEHOLDER_PHONE)
    expect(landingSpec.funnel.success.phoneHref).toBe('tel:+10000000000')
  })

  it('keeps the public placeholder brand', () => {
    expect(landingSpec.brandName).toBe('Placeholder Co')
    expect(landingCopy(landingSpec)).toContain('Placeholder Co')
  })
})
