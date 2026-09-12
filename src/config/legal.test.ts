import { describe, expect, it } from 'vitest'
import { business } from './business'
import {
  NO_MOBILE_SHARING,
  SMS_CONSENT_CHECKBOX,
  STOP_KEYWORDS,
  privacyPolicy,
  smsConsentLabel,
  termsOfService,
  type LegalDocument,
} from './legal'

/**
 * The clauses a carrier's reviewer looks for when a shop registers its texting
 * (A2P 10DLC). They are easy to reword by accident and expensive to get wrong:
 * a missing sentence is a rejected campaign and a week of waiting. These prove
 * every one of them is still on the page before anyone submits.
 */

/** Every word of a document, so a clause counts wherever on the page it is written. */
const wordsOf = (doc: LegalDocument) =>
  doc.sections.flatMap((s) => [s.heading, ...s.body, ...(s.list ?? [])]).join('\n')

describe('A2P 10DLC compliance', () => {
  const privacy = wordsOf(privacyPolicy())
  const terms = wordsOf(termsOfService())

  it('ships ready to register: the consent tick is on until a shop is approved', () => {
    expect(SMS_CONSENT_CHECKBOX).toBe(true)
  })

  it('carries the mobile-sharing clause word for word, on both pages', () => {
    expect(privacy).toContain(NO_MOBILE_SHARING)
    expect(terms).toContain(NO_MOBILE_SHARING)
  })

  it.each([
    ['Message frequency varies'],
    ['Message and data rates may apply'],
    ['not a condition of any purchase'],
    ['HELP'],
  ])('says "%s" on both the privacy page and the terms', (clause) => {
    expect(privacy).toContain(clause)
    expect(terms).toContain(clause)
  })

  it('lists every opt-out keyword the shop honours, not just STOP', () => {
    expect(privacy).toContain(STOP_KEYWORDS)
    expect(terms).toContain(STOP_KEYWORDS)
  })

  it('names the shop beside the tick, with the cost and the way out', () => {
    const label = smsConsentLabel()
    expect(label).toContain(business.name)
    expect(label).toContain('Message frequency varies')
    expect(label).toContain('Message and data rates may apply')
    expect(label).toContain('not a condition of any purchase')
    expect(label).toMatch(/STOP/)
    expect(label).toMatch(/HELP/)
  })

  it('describes consent the same way the form actually collects it', () => {
    // The pages say "tick the consent box" only while the box is really there.
    const expected = SMS_CONSENT_CHECKBOX ? 'tick the consent box' : 'agree to be contacted'
    expect(privacy).toContain(expected)
    expect(terms).toContain(expected)
  })
})
