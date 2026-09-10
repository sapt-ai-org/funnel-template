import { describe, expect, it } from 'vitest'
import { landingCopy, landingSpec, scanForBannedWords } from './funnel'

describe('landing + funnel spec', () => {
  it('all visitor-facing copy contains no banned words', () => {
    // A shop's ad is pulled for the unsupportable claim, not the boring one.
    expect(scanForBannedWords(landingCopy(landingSpec))).toEqual([])
  })

  it('scanForBannedWords flags banned words case-insensitively', () => {
    expect(scanForBannedWords('The CHEAPEST guaranteed instant fix')).toEqual(
      expect.arrayContaining(['guaranteed', 'cheapest', 'instant'])
    )
  })

  it('flags a multi-word claim, which is where the superlatives hide', () => {
    expect(scanForBannedWords('Voted best in town')).toEqual(['best in town'])
  })

  it('funnel ends in a contact step that at least asks for email', () => {
    const steps = landingSpec.funnel.steps
    const last = steps[steps.length - 1]
    expect(last.kind).toBe('contact')
    if (last.kind === 'contact') {
      expect(last.fields.map((field) => field.id)).toContain('email')
    }
  })

  it('has a legal/consent line for compliance', () => {
    expect(landingSpec.funnel.legal && landingSpec.funnel.legal.length).toBeTruthy()
  })
})
