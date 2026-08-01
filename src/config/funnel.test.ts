import { describe, expect, it } from 'vitest'
import { landingCopy, landingSpec, scanForBannedWords } from './funnel'

describe('landing + funnel spec', () => {
  it('all visitor-facing copy contains no Meta-banned words', () => {
    // Guards med-spa / stem-cell / health funnels against automatic Meta rejection.
    expect(scanForBannedWords(landingCopy(landingSpec))).toEqual([])
  })

  it('scanForBannedWords flags banned words case-insensitively', () => {
    expect(scanForBannedWords('A GUARANTEED miracle cure')).toEqual(
      expect.arrayContaining(['guaranteed', 'miracle', 'cure'])
    )
  })

  it('funnel ends in a contact step that at least asks for email', () => {
    const steps = landingSpec.funnel.steps
    const last = steps[steps.length - 1]
    expect(last.kind).toBe('contact')
    if (last.kind === 'contact') expect(last.fields).toContain('email')
  })

  it('has a legal/consent line (18+ / results vary) for compliance', () => {
    expect(landingSpec.funnel.legal && landingSpec.funnel.legal.length).toBeTruthy()
  })
})
